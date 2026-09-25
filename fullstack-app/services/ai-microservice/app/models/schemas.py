"""API response contracts for the AI microservice."""

from typing import Literal

from pydantic import BaseModel, Field, field_validator

# 16 supported Indian languages for the multilingual catalog (ISO 639-1/2 codes).
LANGUAGES: tuple[str, ...] = (
    "en",  # English
    "hi",  # Hindi
    "mr",  # Marathi
    "bn",  # Bengali
    "ta",  # Tamil
    "te",  # Telugu
    "gu",  # Gujarati
    "kn",  # Kannada
    "ml",  # Malayalam
    "pa",  # Punjabi
    "or",  # Odia
    "as",  # Assamese
    "ur",  # Urdu
    "sa",  # Sanskrit
    "brx",  # Bodo
    "sat",  # Santali
)

# Valid craft categories — MUST mirror CraftCategory in the core backend Prisma schema.
CRAFT_CATEGORIES: tuple[str, ...] = (
    "POTTERY",
    "TEXTILE",
    "WOODWORK",
    "METALWARE",
    "PAINTING",
    "LEATHERWORK",
    "JEWELLERY",
    "STONEWORK",
    "CANE_BAMBOO",
    "OTHER",
)


class EnhanceImageResponse(BaseModel):
    status: Literal["success"]
    clean_image_url: str = Field(description="Transparent studio-clean PNG hosted on Cloudinary")
    raw_workshop_image_url: str = Field(description="Original workshop image hosted on Cloudinary")
    detected_features: list[str] = Field(description="CV-derived craft/colour/texture features")


class CatalogSpec(BaseModel):
    title: str
    description: dict[str, str] = Field(
        description=f"Full localized copy for all {len(LANGUAGES)} language codes: {', '.join(LANGUAGES)}"
    )
    suggested_category: str = Field(description="One of the CRAFT_CATEGORIES enum values")
    materials: list[str] = Field(min_length=1)
    tags: list[str]
    authenticity_grade: str = Field(default="UNVERIFIED")
    lineage_gi: str | None = None
    detected_features: list[str] = Field(default_factory=list)

    @field_validator("description")
    @classmethod
    def ensure_all_languages_present(cls, value: dict[str, str]) -> dict[str, str]:
        missing = [code for code in LANGUAGES if not str(value.get(code, "")).strip()]
        if missing:
            raise ValueError(f"description is missing languages: {', '.join(missing)}")
        oversized = [code for code in value if code not in LANGUAGES]
        if oversized:
            raise ValueError(f"description has unsupported language codes: {', '.join(oversized)}")
        return value

    @field_validator("suggested_category")
    @classmethod
    def valid_category(cls, value: str) -> str:
        if value not in CRAFT_CATEGORIES:
            raise ValueError(f"suggested_category must be one of {', '.join(CRAFT_CATEGORIES)}")
        return value


class CatalogResponse(BaseModel):
    status: Literal["success"]
    catalog: CatalogSpec
    original_audio_url: str | None = Field(
        default=None, description="Original artisan narration hosted on Cloudinary"
    )


class MaterialCostLineInput(BaseModel):
    material: str = Field(min_length=1, max_length=120)
    unit_cost: float = Field(gt=0, description="INR for a single unit (e.g. per kg)")
    quantity_used: float = Field(gt=0, description="Units consumed for the product")


class MaterialCostLine(BaseModel):
    material: str
    unit_cost: float
    quantity_used: float
    total_cost: float


class PriceLineItem(BaseModel):
    label: str
    amount: float


class FairPriceBand(BaseModel):
    min_price: float
    recommended_price: float
    max_price: float


class FairPriceRequest(BaseModel):
    raw_material_cost: float = Field(gt=0, description="Aggregate material cost in INR")
    labor_hours: float = Field(gt=0)
    hourly_wage: float = Field(gt=0)
    authenticity_grade: str | None = Field(
        default=None, description="Grade assigned by the catalog AI (e.g. GI_VERIFIED)"
    )
    materials: list[MaterialCostLineInput] | None = Field(
        default=None, description="Optional line-item material allocations"
    )


class FairPriceResponse(BaseModel):
    status: Literal["success"]
    base_cost: float
    complexity_multiplier: float = 1.22
    fair_artisan_price: float
    retail_middleman_price: float
    middleman_cut_saved: float
    artisan_net_earnings: float
    authenticity_grade: str
    breakdown: list[PriceLineItem]
    material_allocations: list[MaterialCostLine] | None = None
    fair_price_band: FairPriceBand
    currency: Literal["INR"] = "INR"
