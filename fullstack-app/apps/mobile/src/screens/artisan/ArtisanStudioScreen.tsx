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
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import type { RootScreenProps } from "../../navigation/types";
import { apiEnhanceImage, apiGenerateCatalog, apiPredictFairPrice } from "../../api/ai";
import { apiCreateProduct } from "../../api/products";
import { CRAFT_CATEGORIES } from "../../config";
import { colors, radius, spacing, typography } from "../../theme";
import type { CatalogSpec, CraftCategory, FairPriceResult } from "../../types";

type Props = RootScreenProps<"ArtisanStudio">;

type Step = "pick" | "enhance" | "catalog" | "price" | "publish";

interface StudioState {
  imageUri: string | null;
  audioUri: string | null;
  imageMimeType: string | null;
  audioMimeType: string | null;
  cleanImageUrl: string | null;
  rawWorkshopImageUrl: string | null;
  catalog: CatalogSpec | null;
  priceResult: FairPriceResult | null;
  overridePrice: string;
  stockQuantity: string;
}

const INITIAL: StudioState = {
  imageUri: null,
  audioUri: null,
  imageMimeType: null,
  audioMimeType: null,
  cleanImageUrl: null,
  rawWorkshopImageUrl: null,
  catalog: null,
  priceResult: null,
  overridePrice: "",
  stockQuantity: "1",
};

export default function ArtisanStudioScreen({ navigation }: Props) {
  const [step, setStep] = useState<Step>("pick");
  const [state, setState] = useState<StudioState>(INITIAL);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");

  const update = (patch: Partial<StudioState>) => setState((s) => ({ ...s, ...patch }));

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Please grant photo library access.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.85,
      exif: false,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    update({
      imageUri: asset.uri,
      imageMimeType: asset.mimeType ?? null,
    });
  };

  const pickAudio = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["audio/mpeg", "audio/wav", "audio/mp4", "audio/x-m4a", "audio/ogg", "audio/aac", "audio/flac"],
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    update({
      audioUri: asset.uri,
      audioMimeType: asset.mimeType ?? "audio/mpeg",
    });
  };

  const runEnhance = async () => {
    if (!state.imageUri) return;
    setBusy(true);
    try {
      setProgress("Enhancing workshop image...");
      const enhance = await apiEnhanceImage(state.imageUri, state.imageMimeType ?? undefined);
      update({
        cleanImageUrl: enhance.clean_image_url,
        rawWorkshopImageUrl: enhance.raw_workshop_image_url,
      });
      setStep("catalog");
    } catch (e) {
      Alert.alert("Enhancement failed", e instanceof Error ? e.message : "Unknown error");
    } finally {
      setBusy(false);
    }
  };

  const runCatalog = async () => {
    if (!state.imageUri) return;
    setBusy(true);
    try {
      setProgress("Generating multilingual catalog via Gemini...");
      const catalog = await apiGenerateCatalog(
        state.imageUri,
        state.audioUri,
        state.imageMimeType ?? undefined,
        state.audioMimeType ?? undefined
      );
      update({ catalog: catalog.catalog });
      setStep("price");
    } catch (e) {
      Alert.alert("Catalog generation failed", e instanceof Error ? e.message : "Unknown error");
    } finally {
      setBusy(false);
    }
  };

  const runPrice = async () => {
    setBusy(true);
    try {
      setProgress("Calculating fair-price valuation...");
      const result = await apiPredictFairPrice({
        raw_material_cost: 200,
        labor_hours: 8,
        hourly_wage: 100,
        authenticity_grade: state.catalog?.authenticity_grade ?? undefined,
      });
      update({ priceResult: result });
      setStep("publish");
    } catch (e) {
      Alert.alert("Pricing failed", e instanceof Error ? e.message : "Unknown error");
    } finally {
      setBusy(false);
    }
  };

  const publish = async () => {
    if (!state.catalog || !state.cleanImageUrl) return;
    const price = state.overridePrice
      ? parseFloat(state.overridePrice)
      : state.priceResult?.fair_artisan_price ?? 0;
    if (price <= 0) {
      Alert.alert("Invalid price", "Please enter a positive price.");
      return;
    }
    setBusy(true);
    setProgress("Publishing to artisan marketplace...");
    try {
      await apiCreateProduct({
        title: state.catalog.title,
        description: state.catalog.description,
        category: state.catalog.suggested_category,
        price,
        rawMaterialCost: state.priceResult?.base_cost,
        laborHours: state.priceResult?.fair_price_band ? undefined : undefined,
        hourlyWage: 100,
        retailMiddlemanEst: state.priceResult?.retail_middleman_price,
        authenticityGrade: state.catalog.authenticity_grade,
        lineageGI: state.catalog.lineage_gi ?? undefined,
        giTagged: Boolean(state.catalog.lineage_gi),
        cleanImageUrl: state.cleanImageUrl,
        rawWorkshopImageUrl: state.rawWorkshopImageUrl ?? undefined,
        originalAudioUrl: undefined,
        materials: state.catalog.materials,
        tags: state.catalog.tags,
        stockQuantity: parseInt(state.stockQuantity, 10) || 1,
      });
      Alert.alert("Published!", "Your product is live on the marketplace.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert("Publish failed", e instanceof Error ? e.message : "Unknown error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Artisan Studio</Text>
      <Text style={styles.subtitle}>AI-powered catalog & fair-price listing</Text>
      <StepIndicator current={step} />
      {busy && (
        <View style={styles.progressBox}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.progressText}>{progress}</Text>
        </View>
      )}
      {step === "pick" && (
        <View style={styles.section}>
          <Text style={styles.label}>Workshop photo (required)</Text>
          <TouchableOpacity style={styles.pickBtn} onPress={pickImage}>
            <Text style={styles.pickBtnText}>{state.imageUri ? "Change image" : "Pick image from library"}</Text>
          </TouchableOpacity>
          {state.imageUri && (
            <Image source={{ uri: state.imageUri }} style={styles.preview} contentFit="cover" />
          )}
          <Text style={[styles.label, { marginTop: spacing.lg }]}>Narration audio (optional)</Text>
          <TouchableOpacity style={styles.pickBtn} onPress={pickAudio}>
            <Text style={styles.pickBtnText}>{state.audioUri ? "Change audio" : "Pick audio file"}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.primaryBtn, !state.imageUri && styles.disabled]}
            disabled={!state.imageUri || busy}
            onPress={() => {
              void runEnhance();
            }}
          >
            <Text style={styles.primaryBtnText}>Enhance image & continue</Text>
          </TouchableOpacity>
        </View>
      )}
      {step === "catalog" && state.cleanImageUrl && (
        <View style={styles.section}>
          <Text style={styles.label}>Cleaned studio image</Text>
          <Image source={{ uri: state.cleanImageUrl }} style={styles.preview} contentFit="cover" />
          <TouchableOpacity
            style={styles.primaryBtn}
            disabled={busy}
            onPress={() => {
              void runCatalog();
            }}
          >
            <Text style={styles.primaryBtnText}>Generate multilingual catalog (Gemini AI)</Text>
          </TouchableOpacity>
        </View>
      )}
      {step === "price" && state.catalog && (
        <CatalogReview catalog={state.catalog} onNext={() => void runPrice()} busy={busy} />
      )}
      {step === "publish" && state.catalog && state.priceResult && (
        <PublishStep
          catalog={state.catalog}
          priceResult={state.priceResult}
          overridePrice={state.overridePrice}
          stockQuantity={state.stockQuantity}
          onUpdatePrice={overridePrice => update({ overridePrice })}
          onUpdateStock={stockQuantity => update({ stockQuantity })}
          onPublish={() => void publish()}
          busy={busy}
        />
      )}
    </ScrollView>
  );
}

function StepIndicator({ current }: { current: Step }) {
  const steps: Step[] = ["pick", "enhance", "catalog", "price", "publish"];
  const labels: Record<Step, string> = {
    pick: "Media",
    enhance: "Enhance",
    catalog: "Catalog",
    price: "Price",
    publish: "Publish",
  };
  return (
    <View style={styles.stepRow}>
      {steps.map((s, i) => {
        const idx = steps.indexOf(current);
        const active = i === idx;
        const done = i < idx;
        return (
          <View key={s} style={styles.stepWrap}>
            <View style={[styles.stepDot, active && styles.stepDotActive, done && styles.stepDotDone]}>
              <Text style={[styles.stepDotText, (active || done) && styles.stepDotTextLight]}>
                {done ? "\u2713" : String(i + 1)}
              </Text>
            </View>
            <Text style={[styles.stepLabel, active && styles.stepLabelActive]}>{labels[s]}</Text>
          </View>
        );
      })}
    </View>
  );
}

function CatalogReview({
  catalog,
  onNext,
  busy,
}: {
  catalog: CatalogSpec;
  onNext: () => void;
  busy: boolean;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.label}>Generated catalog</Text>
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>{catalog.title}</Text>
        <Text style={styles.infoCategory}>
          Category: {catalog.suggested_category}
        </Text>
        <Text style={styles.infoSmall}>Materials: {catalog.materials.join(", ")}</Text>
        <Text style={styles.infoSmall}>Tags: {catalog.tags.join(", ")}</Text>
        {catalog.lineage_gi ? (
          <Text style={styles.infoGi}>GI lineage: {catalog.lineage_gi}</Text>
        ) : null}
        <Text style={styles.infoDesc}>
          {catalog.description["en"]?.slice(0, 200) ?? ""}...
        </Text>
      </View>
      <TouchableOpacity style={styles.primaryBtn} disabled={busy} onPress={onNext}>
        <Text style={styles.primaryBtnText}>Calculate fair price</Text>
      </TouchableOpacity>
    </View>
  );
}

function PublishStep({
  catalog,
  priceResult,
  overridePrice,
  stockQuantity,
  onUpdatePrice,
  onUpdateStock,
  onPublish,
  busy,
}: {
  catalog: CatalogSpec;
  priceResult: FairPriceResult;
  overridePrice: string;
  stockQuantity: string;
  onUpdatePrice: (v: string) => void;
  onUpdateStock: (v: string) => void;
  onPublish: () => void;
  busy: boolean;
}) {
  const displayPrice = overridePrice
    ? parseFloat(overridePrice)
    : priceResult.fair_artisan_price;

  return (
    <View style={styles.section}>
      <Text style={styles.label}>Fair-price valuation</Text>
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>
          {"\u20B9"}{displayPrice.toLocaleString("en-IN")}
        </Text>
        <Text style={styles.infoSmall}>
          Base cost: {"\u20B9"}{priceResult.base_cost.toLocaleString("en-IN")}
        </Text>
        <Text style={styles.infoSmall}>
          Complexity multiplier: {priceResult.complexity_multiplier}x
        </Text>
        <Text style={styles.infoSmall}>
          Retail middleman price: {"\u20B9"}{priceResult.retail_middleman_price.toLocaleString("en-IN")}
        </Text>
        <Text style={styles.infoSmall}>
          Middleman cut saved: {"\u20B9"}{priceResult.middleman_cut_saved.toLocaleString("en-IN")}
        </Text>
        <Text style={styles.infoSmall}>
          Fair band: {"\u20B9"}{priceResult.fair_price_band.min_price.toLocaleString("en-IN")} – {"\u20B9"}{priceResult.fair_price_band.max_price.toLocaleString("en-IN")}
        </Text>
      </View>
      <Text style={styles.label}>Set your selling price (INR)</Text>
      <TextInput
        style={styles.input}
        keyboardType="decimal-pad"
        value={overridePrice}
        onChangeText={onUpdatePrice}
        placeholder={String(priceResult.fair_artisan_price)}
      />
      <Text style={styles.label}>Stock quantity</Text>
      <TextInput
        style={styles.input}
        keyboardType="number-pad"
        value={stockQuantity}
        onChangeText={onUpdateStock}
        placeholder="1"
      />
      <TouchableOpacity style={styles.primaryBtn} disabled={busy} onPress={onPublish}>
        <Text style={styles.primaryBtnText}>Publish to marketplace</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  title: { ...typography.title },
  subtitle: { ...typography.caption, marginBottom: spacing.lg },
  stepRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.xl },
  stepWrap: { alignItems: "center", flex: 1 },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  stepDotActive: { backgroundColor: colors.primary },
  stepDotDone: { backgroundColor: colors.success },
  stepDotText: { fontSize: 12, fontWeight: "700", color: colors.textMuted },
  stepDotTextLight: { color: colors.white },
  stepLabel: { ...typography.caption, marginTop: 4 },
  stepLabelActive: { color: colors.primary, fontWeight: "600" },
  progressBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  progressText: { ...typography.body, flex: 1 },
  section: { marginBottom: spacing.lg },
  label: { ...typography.label, marginBottom: spacing.sm },
  pickBtn: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.xl,
    alignItems: "center",
    marginBottom: spacing.md,
  },
  pickBtnText: { color: colors.primary, fontWeight: "600" },
  preview: { width: "100%", height: 220, borderRadius: radius.lg, marginBottom: spacing.md },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  disabled: { backgroundColor: colors.border },
  primaryBtnText: { color: colors.white, fontWeight: "700", fontSize: 15 },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  infoTitle: { ...typography.heading, marginBottom: spacing.xs },
  infoCategory: { ...typography.body, color: colors.secondary, marginBottom: spacing.xs },
  infoSmall: { ...typography.caption, marginBottom: 2 },
  infoGi: { ...typography.caption, color: colors.primary, marginTop: spacing.xs },
  infoDesc: { ...typography.body, marginTop: spacing.sm, lineHeight: 20 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    fontSize: 16,
  },
});