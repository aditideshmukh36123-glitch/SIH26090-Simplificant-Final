import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import type { RootScreenProps } from "../../navigation/types";
import { useQuery } from "@tanstack/react-query";
import { apiGetProduct } from "../../api/products";
import { useCartStore } from "../../store/cart";
import { colors, radius, spacing, typography } from "../../theme";
import { money } from "../../navigation/types";

type Props = RootScreenProps<"ProductDetail">;

export default function ProductDetailScreen({ route, navigation }: Props) {
  const { productId } = route.params;
  const addToCart = useCartStore((s) => s.add);
  const lines = useCartStore((s) => s.lines);
  const inCart = lines.find((l) => l.productId === productId);

  const { data, isPending, isError } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => apiGetProduct(productId),
  });

  if (isPending) {
    return <ActivityIndicator style={styles.center} color={colors.primary} />;
  }
  if (isError || !data) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>Product unavailable</Text>
      </View>
    );
  }

  const description = data.description["en"] ?? data.title;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Image source={{ uri: data.cleanImageUrl }} style={styles.image} contentFit="cover" transition={150} />
      <View style={styles.body}>
        <Text style={styles.category}>{data.category}</Text>
        <Text style={styles.title}>{data.title}</Text>
        {data.giTagged && data.lineageGI ? (
          <View style={styles.giBadge}>
            <Text style={styles.giText}>GI Certified · {data.lineageGI}</Text>
          </View>
        ) : null}
        <Text style={styles.price}>{money(data.price)}</Text>
        <Text style={styles.artisan}>
          Handcrafted by {data.artisanName}
          {data.artisanGiCluster ? ` · ${data.artisanGiCluster}` : ""}
        </Text>
        <Text style={styles.heading}>Description</Text>
        <Text style={styles.description}>{description}</Text>
        <Text style={styles.heading}>Materials</Text>
        <View style={styles.chips}>
          {data.materials.map((m) => (
            <View key={m} style={styles.chip}>
              <Text style={styles.chipText}>{m}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.heading}>Fair-pricing transparency</Text>
        <View style={styles.transparency}>
          {data.rawMaterialCost ? (
            <Row label="Raw material cost" value={money(data.rawMaterialCost)} />
          ) : null}
          {data.laborHours ? <Row label="Labor hours" value={`${data.laborHours} h`} /> : null}
          {data.hourlyWage ? <Row label="Honest hourly wage" value={money(data.hourlyWage)} /> : null}
          {data.retailMiddlemanEst ? (
            <Row label="Middleman retail estimate" value={money(data.retailMiddlemanEst)} />
          ) : null}
          {data.b2bPrice ? <Row label="B2B reference price" value={money(data.b2bPrice)} /> : null}
        </View>
        <TouchableOpacity
          style={[styles.addButton, data.stockQuantity === 0 && styles.disabled]}
          onPress={() =>
            addToCart({
              productId: data.id,
              title: data.title,
              price: data.price,
              cleanImageUrl: data.cleanImageUrl,
              stockQuantity: data.stockQuantity,
            })
          }
          disabled={data.stockQuantity === 0}
        >
          <Text style={styles.addButtonText}>
            {data.stockQuantity === 0
              ? "Out of stock"
              : inCart
                ? `In cart (${inCart.quantity}) · Add more`
                : "Add to cart"}
          </Text>
        </TouchableOpacity>
        {data.averageRating !== null ? (
          <>
            <Text style={styles.heading}>Reviews ({data.reviews.length})</Text>
            {data.reviews.map((r) => (
              <View key={r.createdAt + r.userName} style={styles.review}>
                <Text style={styles.reviewHeader}>
                  {r.userName} · {"\u2605"} {r.rating}/5
                </Text>
                {r.comment ? <Text style={styles.reviewComment}>{r.comment}</Text> : null}
              </View>
            ))}
          </>
        ) : null}
      </View>
    </ScrollView>
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
  content: { paddingBottom: spacing.xxl },
  image: { width: "100%", height: 260 },
  body: { padding: spacing.lg },
  category: { ...typography.label, color: colors.secondary, textTransform: "uppercase" },
  title: { ...typography.title, marginTop: spacing.xs },
  giBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginTop: spacing.sm,
  },
  giText: { color: colors.white, fontSize: 12, fontWeight: "600" },
  price: { ...typography.title, color: colors.primaryDark, marginTop: spacing.md },
  artisan: { ...typography.caption, marginTop: spacing.xs },
  heading: { ...typography.heading, marginTop: spacing.lg, marginBottom: spacing.sm },
  description: { ...typography.body, lineHeight: 21, color: colors.text },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  chipText: { ...typography.caption },
  transparency: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
  },
  rowLabel: { ...typography.body, color: colors.textMuted },
  rowValue: { ...typography.body, fontWeight: "600" },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: "center",
    marginTop: spacing.xl,
  },
  disabled: { backgroundColor: colors.border },
  addButtonText: { color: colors.white, fontWeight: "700", fontSize: 16 },
  review: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  reviewHeader: { ...typography.label },
  reviewComment: { ...typography.body, marginTop: spacing.xs },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { ...typography.body, color: colors.textMuted },
});