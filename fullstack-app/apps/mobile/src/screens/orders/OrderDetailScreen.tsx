import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { apiGetOrder, apiUpdateOrderStatus } from "../../api/orders";
import { apiAuthorizeEscrow, apiConfirmEscrowHold, apiResolveDispute, apiVerifyHandoverOtp } from "../../api/escrow";
import { useAuthStore } from "../../store/auth";
import { ESCROW_STATUS_LABELS, ORDER_STATUS_LABELS } from "../../config";
import { colors, radius, spacing, typography } from "../../theme";
import { money, orderStatusColor, type RootScreenProps } from "../../navigation/types";
import type { Order, OrderStatus } from "../../types";

type Props = RootScreenProps<"OrderDetail">;

export default function OrderDetailScreen({ route }: Props) {
  const { orderId } = route.params;
  const role = useAuthStore((s) => s.user?.role);
  const queryClient = useQueryClient();
  const [otpInput, setOtpInput] = useState("");
  const [location, setLocation] = useState("");
  const [carrier, setCarrier] = useState("");

  const { data: order, isPending, isError, refetch, isFetching } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => apiGetOrder(orderId),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["order", orderId] });
    void queryClient.invalidateQueries({ queryKey: ["orders"] });
  };

  const transition = useMutation({
    mutationFn: ({ status, opts }: { status: OrderStatus; opts?: { carrierName?: string; currentLocation?: string } }) =>
      apiUpdateOrderStatus(orderId, { status, ...opts }),
    onSuccess: () => invalidate(),
    onError: (e: Error) => Alert.alert("Update failed", e.message),
  });

  const escrow = useMutation({
    mutationFn: async (kind: "authorize" | "hold") => {
      if (kind === "authorize") return apiAuthorizeEscrow(orderId);
      return apiConfirmEscrowHold(orderId);
    },
    onSuccess: () => invalidate(),
    onError: (e: Error) => Alert.alert("Escrow failed", e.message),
  });

  const otpMutation = useMutation({
    mutationFn: (enteredOtp: string) => apiVerifyHandoverOtp(orderId, enteredOtp),
    onSuccess: () => {
      setOtpInput("");
      invalidate();
    },
    onError: (e: Error) => Alert.alert("OTP rejected", e.message),
  });

  const resolveMutation = useMutation({
    mutationFn: (outcome: "RELEASE_TO_SELLER" | "REFUND_TO_BUYER") => apiResolveDispute(orderId, outcome),
    onSuccess: () => invalidate(),
    onError: (e: Error) => Alert.alert("Resolution failed", e.message),
  });

  if (isPending) {
    return <ActivityIndicator style={styles.center} color={colors.primary} />;
  }
  if (isError || !order) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>Order unavailable</Text>
        <TouchableOpacity onPress={() => refetch()}>
          <Text style={styles.link}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const esc = order.escrowTransaction;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.displayId}>Order #{order.displayId}</Text>
        <View style={[styles.badge, { backgroundColor: orderStatusColor[order.status] }]}>
          <Text style={styles.badgeText}>{ORDER_STATUS_LABELS[order.status]}</Text>
        </View>
      </View>
      <Text style={styles.date}>Placed {new Date(order.createdAt).toLocaleString()}</Text>

      {order.secretOtp ? (
        <View style={styles.otpCard}>
          <Text style={styles.otpLabel}>Handover OTP (share with the delivery agent)</Text>
          <Text style={styles.otpValue}>{order.secretOtp}</Text>
        </View>
      ) : null}

      <Text style={styles.sectionTitle}>Items</Text>
      {order.items.map((item) => (
        <View key={item.id} style={styles.itemCard}>
          <Image source={{ uri: item.product.cleanImageUrl }} style={styles.thumb} contentFit="cover" />
          <View style={styles.itemInfo}>
            <Text style={styles.itemTitle}>{item.product.title}</Text>
            <Text style={styles.itemMeta}>
              {item.quantity} × {money(item.unitPrice)}
            </Text>
            <Text style={styles.itemMeta}>Total: {money(parseFloat(item.unitPrice) * item.quantity)}</Text>
          </View>
        </View>
      ))}

      <View style={styles.summaryCard}>
        <Row label="Order total" value={money(order.totalAmount)} />
        <Row label="AWB" value={order.trackingAwb ?? "—"} />
        {order.carrierName ? <Row label="Carrier" value={order.carrierName} /> : null}
        {order.currentLocation ? <Row label="Location" value={order.currentLocation} /> : null}
        {order.deliveryAgent ? (
          <Row label="Delivery agent" value={`${order.deliveryAgent.name} (${order.deliveryAgent.phone})`} />
        ) : null}
      </View>

      <Text style={styles.sectionTitle}>Ship to</Text>
      <View style={styles.summaryCard}>
        <Text style={styles.addressLine}>{order.shippingAddress.fullName}</Text>
        <Text style={styles.addressLine}>
          {order.shippingAddress.line1}
          {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}
        </Text>
        <Text style={styles.addressLine}>
          {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
        </Text>
        <Text style={styles.addressLine}>{order.shippingAddress.phone}</Text>
      </View>

      {esc ? (
        <>
          <Text style={styles.sectionTitle}>Escrow</Text>
          <View style={styles.summaryCard}>
            <Row label="Amount held" value={money(esc.amount)} />
            <Row label="Status" value={ESCROW_STATUS_LABELS[esc.status]} />
            {esc.paymentGatewayRef ? <Row label="Payment ref" value={esc.paymentGatewayRef} /> : null}
          </View>
        </>
      ) : null}

      <Actions
        role={role ?? "BUYER"}
        order={order}
        hasEscrow={!!esc}
        onTransition={(status, opts) => transition.mutate({ status, opts })}
        onEscrow={(kind) => escrow.mutate(kind)}
        onResolve={(outcome) => resolveMutation.mutate(outcome)}
        otpValue={otpInput}
        setOtpValue={setOtpInput}
        onVerifyOtp={() => otpMutation.mutate(otpInput.trim())}
        location={location}
        setLocation={setLocation}
        carrier={carrier}
        setCarrier={setCarrier}
        busy={transition.isPending || escrow.isPending || otpMutation.isPending}
      />
    </ScrollView>
  );
}

function Actions({
  role,
  order,
  hasEscrow,
  onTransition,
  onEscrow,
  onResolve,
  otpValue,
  setOtpValue,
  onVerifyOtp,
  location,
  setLocation,
  carrier,
  setCarrier,
  busy,
}: {
  role: string;
  order: Order;
  hasEscrow: boolean;
  onTransition: (status: OrderStatus, opts?: { carrierName?: string; currentLocation?: string }) => void;
  onEscrow: (kind: "authorize" | "hold") => void;
  onResolve: (outcome: "RELEASE_TO_SELLER" | "REFUND_TO_BUYER") => void;
  otpValue: string;
  setOtpValue: (v: string) => void;
  onVerifyOtp: () => void;
  location: string;
  setLocation: (v: string) => void;
  carrier: string;
  setCarrier: (v: string) => void;
  busy: boolean;
}) {
  const s = order.status;

  return (
    <View style={styles.actions}>
      {role === "BUYER" && s === "CONFIRMED" && hasEscrow && (
        <>
          <ActionButton label="Authorize escrow (pay into hold)" onPress={() => onEscrow("authorize")} disabled={busy} />
          <ActionButton label="Confirm funds held" onPress={() => onEscrow("hold")} disabled={busy} />
        </>
      )}
      {role === "DELIVERY" && s === "OUT_FOR_DELIVERY" && (
        <View style={styles.otpBox}>
          <Text style={styles.label}>Enter buyer's handover OTP to confirm delivery</Text>
          <TextInput
            style={styles.otpInput}
            value={otpValue}
            onChangeText={setOtpValue}
            keyboardType="number-pad"
            maxLength={4}
            placeholder="4-digit OTP"
          />
          <ActionButton label="Verify OTP & release escrow" onPress={onVerifyOtp} disabled={busy || otpValue.length !== 4} />
        </View>
      )}
      {role === "DELIVERY" && ["SHIPPED", "IN_TRANSIT", "OUT_FOR_DELIVERY"].includes(s) && (
        <View style={styles.otpBox}>
          <Text style={styles.label}>Update current location</Text>
          <TextInput style={styles.otpInput} value={location} onChangeText={setLocation} placeholder="e.g. Mumbai, MH" />
          <ActionButton
            label="Update location"
            onPress={() => onTransition(s, { currentLocation: location })}
            disabled={busy || !location.trim()}
          />
        </View>
      )}
      {role === "DELIVERY" && ["SHIPPED", "IN_TRANSIT"].includes(s) && (
        <ActionButton
          label={s === "SHIPPED" ? "Mark in transit" : "Mark out for delivery"}
          onPress={() => onTransition(s === "SHIPPED" ? "IN_TRANSIT" : "OUT_FOR_DELIVERY")}
          disabled={busy}
        />
      )}
      {role === "DELIVERY" && s === "READY_FOR_PICKUP" && (
        <View style={styles.otpBox}>
          <Text style={styles.label}>Pick up shipment (carrier name required)</Text>
          <TextInput style={styles.otpInput} value={carrier} onChangeText={setCarrier} placeholder="Carrier name" />
          <ActionButton
            label="Mark shipped & assign to me"
            onPress={() => onTransition("SHIPPED", { carrierName: carrier })}
            disabled={busy || !carrier.trim()}
          />
        </View>
      )}
      {role === "ARTISAN" && s === "CONFIRMED" && (
        <ActionButton label="Start work in workshop" onPress={() => onTransition("IN_WORKSHOP")} disabled={busy} />
      )}
      {role === "ARTISAN" && s === "IN_WORKSHOP" && (
        <ActionButton label="Mark quality passed" onPress={() => onTransition("QUALITY_PASSED")} disabled={busy} />
      )}
      {role === "ARTISAN" && s === "QUALITY_PASSED" && (
        <ActionButton label="Ready for pickup" onPress={() => onTransition("READY_FOR_PICKUP")} disabled={busy} />
      )}
      {role === "BUYER" && ["CONFIRMED", "IN_WORKSHOP", "QUALITY_PASSED", "READY_FOR_PICKUP"].includes(s) && (
        <ActionButton label="Cancel order (refund escrow)" variant="danger" onPress={() => onTransition("CANCELLED")} disabled={busy} />
      )}
      {role === "ADMIN" && s === "DISPUTED" && (
        <>
          <ActionButton label="Resolve: release to artisan" onPress={() => onResolve("RELEASE_TO_SELLER")} disabled={busy} />
          <ActionButton label="Resolve: refund buyer" variant="danger" onPress={() => onResolve("REFUND_TO_BUYER")} disabled={busy} />
        </>
      )}
    </View>
  );
}

function ActionButton({
  label,
  onPress,
  variant,
  disabled,
}: {
  label: string;
  onPress: () => void;
  variant?: "primary" | "danger";
  disabled?: boolean;
}) {
  const bg = variant === "danger" ? colors.danger : colors.primary;
  return (
    <TouchableOpacity
      style={[styles.actionButton, { backgroundColor: bg }, (disabled ?? false) && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.actionText}>{label}</Text>
    </TouchableOpacity>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { ...typography.body, color: colors.textMuted },
  link: { ...typography.label, color: colors.primary, marginTop: spacing.sm },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  displayId: { ...typography.title },
  badge: { borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 4 },
  badgeText: { color: colors.white, fontSize: 12, fontWeight: "700" },
  date: { ...typography.caption, marginTop: spacing.xs },
  otpCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.md,
  },
  otpLabel: { color: colors.white, fontSize: 12, fontWeight: "600" },
  otpValue: { color: colors.white, fontSize: 40, fontWeight: "800", letterSpacing: 6, marginTop: spacing.sm },
  sectionTitle: { ...typography.heading, marginTop: spacing.lg, marginBottom: spacing.sm },
  itemCard: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  thumb: { width: 56, height: 56, borderRadius: radius.sm },
  itemInfo: { marginLeft: spacing.md, flex: 1 },
  itemTitle: { ...typography.body, fontWeight: "600" },
  itemMeta: { ...typography.caption, marginTop: 2 },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: spacing.xs },
  rowLabel: { ...typography.body, color: colors.textMuted, flex: 1 },
  rowValue: { ...typography.body, fontWeight: "600", flex: 1, textAlign: "right" },
  addressLine: { ...typography.body, marginTop: 2 },
  actions: { marginTop: spacing.lg },
  actionButton: {
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  actionText: { color: colors.white, fontWeight: "700" },
  disabled: { backgroundColor: colors.border },
  otpBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  label: { ...typography.label, marginBottom: spacing.sm },
  otpInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    fontSize: 16,
    letterSpacing: 2,
  },
});