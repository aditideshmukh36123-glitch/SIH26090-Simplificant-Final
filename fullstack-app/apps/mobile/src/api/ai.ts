import type {
  CatalogResult,
  EnhanceImageResult,
  FairPriceRequest,
  FairPriceResult,
} from "../types";
import { aiClient } from "./client";

type FormFile = { uri: string; name: string; type: string };

function toFile(uri: string, fallbackName: string, mimeType?: string): FormFile {
  const ext = mimeType?.split("/")[1] ?? uri.split(".").pop() ?? "jpg";
  return { uri, name: `${fallbackName}.${ext}`, type: mimeType ?? "image/jpeg" };
}

export async function apiEnhanceImage(uri: string, mimeType?: string): Promise<EnhanceImageResult> {
  const form = new FormData();
  form.append("image", toFile(uri, "workshop", mimeType) as unknown as Blob);
  const res = await aiClient.post<EnhanceImageResult>("/enhance-image", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  if (!res.data || res.data.status !== "success") {
    throw new Error("Image enhancement failed");
  }
  return res.data;
}

export async function apiGenerateCatalog(
  imageUri: string,
  audioUri?: string | null,
  imageMimeType?: string,
  audioMimeType?: string
): Promise<CatalogResult> {
  const form = new FormData();
  form.append("image", toFile(imageUri, "craft", imageMimeType) as unknown as Blob);
  if (audioUri) {
    form.append(
      "audio",
      toFile(audioUri, "narration", audioMimeType ?? "audio/mpeg") as unknown as Blob
    );
  }
  const res = await aiClient.post<CatalogResult>("/catalog-audio", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  if (!res.data || res.data.status !== "success") {
    throw new Error("Catalog generation failed");
  }
  return res.data;
}

export async function apiPredictFairPrice(input: FairPriceRequest): Promise<FairPriceResult> {
  const res = await aiClient.post<FairPriceResult>("/predict-fair-price", input);
  if (!res.data || res.data.status !== "success") {
    throw new Error("Fair-price valuation failed");
  }
  return res.data;
}