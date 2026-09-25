import React, { useCallback } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import { apiListOrders } from "../../api/orders";
import { useAuthStore } from "../../store/auth";
import { ORDER_STATUS_LABELS } from "../../config";
import { colors, radius, spacing, typography } from "../../theme";
import {
  orderStatusColor,
  money,
  type MainTabParamList,
  type RootStackParamList,
} from "../../navigation/types";
import type { Order } from "../../types";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";

type Props = BottomTabScreenProps<MainTabParamList, "Orders">;

export default function OrdersScreen(_props: Props) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const role = useAuthStore((s) => s.user?.role);
  const { data, isPending, isError, refetch, isFetching } = useQuery({
    queryKey: ["orders"],
    queryFn: () => apiListOrders(),
  });

  const renderItem = useCallback(
    ({ item }: { item: Order }) => (
      <OrderRow order={item} onPress={() => navigation.navigate("OrderDetail", { orderId: item.id })} />
    ),
    [navigation]
  );

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>
        Orders{role ? ` · ${role.charAt(0) + role.slice(1).toLowerCase()}` : ""}
      </Text>
      {isPending ? (
        <ActivityIndicator style={styles.center} color={colors.primary} />
      ) : isError ? (
        <View style={styles.center}>
          <Text style={styles.empty}>Failed to load orders</Text>
          <TouchableOpacity onPress={() => refetch()}>
            <Text style={styles.link}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(o) => o.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          onRefresh={refetch}
          refreshing={isFetching}
          ListEmptyComponent={<Text style={styles.empty}>No orders yet</Text>}
        />
      )}
    </View>
  );
}

function OrderRow({ order, onPress }: { order: Order; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <Text style={styles.displayId}>#{order.displayId}</Text>
        <View style={[styles.badge, { backgroundColor: orderStatusColor[order.status] }]}>
          <Text style={styles.badgeText}>{ORDER_STATUS_LABELS[order.status]}</Text>
        </View>
      </View>
      <Text style={styles.items}>
        {order.items.map((i) => `${i.quantity}× ${i.product.title}`).join(" · ")}
      </Text>
      <View style={styles.cardFooter}>
        <Text style={styles.total}>{money(order.totalAmount)}</Text>
        <Text style={styles.date}>{new Date(order.createdAt).toLocaleDateString()}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  screenTitle: { ...typography.title, padding: spacing.lg, paddingBottom: spacing.sm },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  link: { ...typography.label, color: colors.primary, marginTop: spacing.sm },
  empty: { ...typography.body, color: colors.textMuted, textAlign: "center", padding: spacing.xl },
  list: { padding: spacing.md, paddingTop: 0 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  displayId: { ...typography.label, color: colors.textMuted },
  badge: { borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 4 },
  badgeText: { color: colors.white, fontSize: 11, fontWeight: "700" },
  items: { ...typography.body, marginTop: spacing.sm, color: colors.text },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.md,
  },
  total: { ...typography.label, color: colors.primaryDark },
  date: { ...typography.caption },
});