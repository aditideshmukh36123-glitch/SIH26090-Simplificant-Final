import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { FlashList, type ListRenderItemInfo } from "@shopify/flash-list";
import type { TabScreenProps } from "../../navigation/types";
import { useQuery } from "@tanstack/react-query";
import { apiListProducts } from "../../api/products";
import { CRAFT_CATEGORIES } from "../../config";
import { colors, radius, spacing, typography } from "../../theme";
import { money } from "../../navigation/types";
import type { CraftCategory, ProductSummary } from "../../types";

type Props = TabScreenProps<"Catalog">;

export default function CatalogScreen({ navigation }: Props) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CraftCategory | undefined>(undefined);

  const { data, isPending, isError, refetch, isFetching } = useQuery({
    queryKey: ["products", search, category],
    queryFn: () =>
      apiListProducts({
        search: search || undefined,
        category,
        page: 1,
        limit: 30,
      }),
  });

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ProductSummary>) => (
      <ProductCard item={item} onPress={() => navigation.navigate("ProductDetail", { productId: item.id })} />
    ),
    [navigation]
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Search crafts, materials, tags..."
        value={search}
        onChangeText={setSearch}
        clearButtonMode="while-editing"
      />
      <View style={styles.categoryRow}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CRAFT_CATEGORIES as readonly string[]}
          keyExtractor={(c) => c}
          renderItem={({ item }) => {
            const active = category === item;
            return (
              <TouchableOpacity
                style={[styles.pill, active && styles.pillActive]}
                onPress={() => setCategory(active ? undefined : (item as CraftCategory))}
              >
                <Text style={[styles.pillText, active && styles.pillTextActive]}>{item}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>
      {isPending ? (
        <ActivityIndicator style={styles.center} color={colors.primary} />
      ) : isError ? (
        <View style={styles.center}>
          <Text style={styles.empty}>Failed to load catalog</Text>
          <TouchableOpacity onPress={() => refetch()}>
            <Text style={styles.link}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlashList
          data={data?.items ?? []}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          onRefresh={refetch}
          refreshing={isFetching}
          ListEmptyComponent={<Text style={styles.empty}>No products match your search</Text>}
        />
      )}
    </View>
  );
}

function ProductCard({
  item,
  onPress,
}: {
  item: ProductSummary;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image
        source={{ uri: item.cleanImageUrl }}
        style={styles.cardImage}
        contentFit="cover"
        transition={150}
      />
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.title}
        </Text>
        {item.giTagged && item.lineageGI ? (
          <Text style={styles.giTag}>GI · {item.lineageGI}</Text>
        ) : null}
        <Text style={styles.cardPrice}>{money(item.price)}</Text>
        <Text style={styles.cardArtisan} numberOfLines={1}>
          {item.artisanName}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  search: {
    margin: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  categoryRow: { marginBottom: spacing.sm },
  pill: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    backgroundColor: colors.surface,
  },
  pillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  pillText: { ...typography.caption },
  pillTextActive: { color: colors.white, fontWeight: "600" },
  grid: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    margin: spacing.xs,
    overflow: "hidden",
  },
  cardImage: { width: "100%", height: 140 },
  cardBody: { padding: spacing.md },
  cardTitle: { ...typography.body, fontWeight: "600" },
  giTag: { ...typography.caption, color: colors.primary, marginTop: 2 },
  cardPrice: { ...typography.label, color: colors.primaryDark, marginTop: spacing.xs },
  cardArtisan: { ...typography.caption, marginTop: 2 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { ...typography.body, textAlign: "center", padding: spacing.xl, color: colors.textMuted },
  link: { ...typography.label, color: colors.primary, textAlign: "center", marginTop: spacing.sm },
});