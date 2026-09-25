import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import type { RootScreenProps } from "../../navigation/types";
import { useMutation } from "@tanstack/react-query";
import { apiCreateOrder } from "../../api/orders";
import { apiAuthorizeEscrow, apiConfirmEscrowHold } from "../../api/escrow";
import { useCartStore } from "../../store/cart";
import { colors, radius, spacing, typography } from "../../theme";
import { money } from "../../navigation/types";
import type { ShippingAddress } from "../../types";

type Props = RootScreenProps<"Checkout">;

const initialState: ShippingAddress = {
  fullName: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  phone: "",
  landmark: "",
};

export default function CheckoutScreen({ navigation }: Props) {
  const lines = useCartStore((s) => s.lines);
  const clear = useCartStore((s) => s.clear);
  const total = useCartStore((s) => s.total());
  const [address, setAddress] = useState<ShippingAddress>(initialState);
  const [payMode, setPayMode] = useState<"prepaid" | "cod">("prepaid");

  const mutation = useMutation({
    mutationFn: async () => {
      const order = await apiCreateOrder({
        items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
        shippingAddress: address,
      });
      if (payMode === "prepaid" && order.escrowTransaction) {
        await apiAuthorizeEscrow(order.id, `demo-${Date.now()}`);
        await apiConfirmEscrowHold(order.id);
      }
      return order;
    },
    onSuccess: (order) => {
      clear();
      navigation.replace("OrderDetail", { orderId: order.id });
    },
    onError: (e: Error) => {
      Alert.alert("Checkout failed", e.message);
    },
  });

  const update = (field: keyof ShippingAddress, value: string) =>
    setAddress((prev) => ({ ...prev, [field]: value }));

  const placeOrder = () => {
    if (!address.fullName || !address.line1 || !address.city || !address.state || !address.postalCode || !address.phone) {
      Alert.alert("Missing details", "Please fill in all required shipping fields.");
      return;
    }
    mutation.mutate();
  };

  const inputs: { key: keyof ShippingAddress; label: string; placeholder: string; multiline?: boolean; keyboard?: "numeric" | "phone-pad" }[] = [
    { key: "fullName", label: "Full name", placeholder: "Recipient name" },
    { key: "phone", label: "Phone", placeholder: "+91...", keyboard: "phone-pad" },
    { key: "line1", label: "Address line 1", placeholder: "House, street" },
    { key: "line2", label: "Address line 2", placeholder: "Area, landmark (optional)" },
    { key: "city", label: "City", placeholder: "City" },
    { key: "state", label: "State", placeholder: "State" },
    { key: "postalCode", label: "PIN code", placeholder: "6-digit PIN", keyboard: "numeric" },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Shipping address</Text>
        {inputs.map((f) => (
          <View key={f.key}>
            <Text style={styles.label}>{f.label}</Text>
            <TextInput
              style={styles.input}
              placeholder={f.placeholder}
              value={address[f.key] ?? ""}
              keyboardType={f.keyboard}
              onChangeText={(v) => update(f.key, v)}
            />
          </View>
        ))}
        <Text style={styles.heading}>Payment</Text>
        <View style={styles.modeRow}>
          <TouchableOpacity
            style={[styles.modePill, payMode === "prepaid" && styles.modePillActive]}
            onPress={() => setPayMode("prepaid")}
          >
            <Text style={[styles.modeText, payMode === "prepaid" && styles.modeTextActive]}>
              Escrow (prepaid)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modePill, payMode === "cod" && styles.modePillActive]}
            onPress={() => setPayMode("cod")}
          >
            <Text style={[styles.modeText, payMode === "cod" && styles.modeTextActive]}>COD</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Items</Text>
            <Text style={styles.summaryValue}>{lines.length}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total payable</Text>
            <Text style={styles.summaryTotal}>{money(total)}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.button, mutation.isPending && styles.buttonDisabled]}
          onPress={placeOrder}
          disabled={mutation.isPending || lines.length === 0}
        >
          {mutation.isPending ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>Place Order {money(total)}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  heading: { ...typography.heading, marginTop: spacing.md, marginBottom: spacing.sm },
  label: { ...typography.label, marginBottom: spacing.xs },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  modeRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.md },
  modePill: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  modePillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  modeText: { ...typography.body },
  modeTextActive: { color: colors.white, fontWeight: "600" },
  summary: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
  },
  summaryLabel: { ...typography.body, color: colors.textMuted },
  summaryValue: { ...typography.body, fontWeight: "600" },
  summaryTotal: { ...typography.heading, color: colors.primaryDark },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  buttonDisabled: { backgroundColor: colors.border },
  buttonText: { color: colors.white, fontWeight: "700", fontSize: 16 },
});