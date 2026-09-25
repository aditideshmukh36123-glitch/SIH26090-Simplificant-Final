import React from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import type { TabScreenProps } from "../../navigation/types";
import { useCartStore } from "../../store/cart";
import { colors, radius, spacing, typography } from "../../theme";
import { money } from "../../navigation/types";

type Props = TabScreenProps<"Cart">;

export default function CartScreen({ navigation }: Props) {
  const lines = useCartStore((s) => s.lines);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const remove = useCartStore((s) => s.remove);
  const total = useCartStore((s) => s.total());

  if (lines.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>Your cart is empty</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Catalog")}>
          <Text style={styles.link}>Browse the catalog</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={lines}
        keyExtractor={(l) => l.productId}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.cleanImageUrl }} style={styles.thumb} contentFit="cover" />
            <View style={styles.info}>
              <Text style={styles.title} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.price}>{money(item.price)} each</Text>
              <View style={styles.qtyRow}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => setQuantity(item.productId, item.quantity - 1)}
                >
                  <Text style={styles.qtyLabel}>-</Text>
                </TouchableOpacity>
                <Text style={styles.qty}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => setQuantity(item.productId, item.quantity + 1)}
                >
                  <Text style={styles.qtyLabel}>+</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => remove(item.productId)}
                >
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{money(total)}</Text>
        </View>
        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={() => navigation.navigate("Checkout")}
        >
          <Text style={styles.checkoutText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { ...typography.body, color: colors.textMuted },
  link: { ...typography.label, color: colors.primary, marginTop: spacing.md },
  list: { padding: spacing.md },
  card: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  thumb: { width: 72, height: 72, borderRadius: radius.sm },
  info: { flex: 1, marginLeft: spacing.md },
  title: { ...typography.body, fontWeight: "600" },
  price: { ...typography.caption, marginTop: 2 },
  qtyRow: { flexDirection: "row", alignItems: "center", marginTop: spacing.md },
  qtyBtn: {
    width: 30,
    height: 30,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyLabel: { fontWeight: "700" },
  qty: { marginHorizontal: spacing.md, fontWeight: "600" },
  removeBtn: { marginLeft: spacing.md },
  removeText: { ...typography.caption, color: colors.danger },
  footer: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.lg,
  },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.md },
  totalLabel: { ...typography.heading },
  totalValue: { ...typography.heading, color: colors.primaryDark },
  checkoutBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  checkoutText: { color: colors.white, fontWeight: "700", fontSize: 16 },
});