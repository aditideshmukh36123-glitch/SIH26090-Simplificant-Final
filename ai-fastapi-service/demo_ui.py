"""Visual Forge — standalone demo UI (Streamlit).

A THIN HTTP client over the Visual Forge FastAPI service. It deliberately does
NOT import main.py: it talks to the already-running API over HTTP exactly as an
external consumer (or the eventual Node/Express backend) would, so its
request/response handling mirrors production consumer code.

Run:
    1. Start the API in a separate terminal (start.ps1, or
       `venv\\Scripts\\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000`).
    2. In a second terminal: `streamlit run demo_ui.py`.
"""

import os
from typing import Optional

import requests
import streamlit as st
from dotenv import load_dotenv

# Load the SAME .env main.py uses, so the user never types the API key by hand.
load_dotenv()

API_BASE_URL = os.environ.get("API_BASE_URL", "http://127.0.0.1:8000").rstrip("/")
API_KEY = os.environ.get("X_API_KEY", "")

AUTH_HEADERS = {"X-API-Key": API_KEY}

ENHANCE_URL = f"{API_BASE_URL}/api/enhance-image"
CATALOG_URL = f"{API_BASE_URL}/api/catalog-audio"

# The AI pipelines can legitimately take close to a minute each; the generous
# timeout prevents a long-but-healthy request from being cut off, while a dead
# server still fails fast with a clear message.
REQUEST_TIMEOUT_SECONDS = 180.0


def _extract_detail(response: "requests.Response") -> str:
    """Pull the most useful human-readable error text out of an error body."""
    try:
        body = response.json()
        if isinstance(body, dict):
            for key in ("detail", "reason"):
                if body.get(key):
                    return str(body[key])
    except ValueError:
        pass
    return f"HTTP {response.status_code}"


def _show_connection_error() -> None:
    st.error(
        f"Could not reach the Visual Forge API at **{API_BASE_URL}**. "
        "Is the API server running? Start it in a separate terminal "
        "(`start.ps1` or `python -m uvicorn main:app --port 8000`), wait for it "
        "to finish loading, then try again."
    )


def _render_product_card(
    clean_image_url: str,
    catalog: dict,
    verification: Optional[dict] = None,
) -> None:
    """Render the final, human-confirmable product listing card."""
    left_column, right_column = st.columns([1, 1.2], gap="large")

    with left_column:
        st.image(clean_image_url, width="stretch")

    with right_column:
        with st.container(border=True):
            # Title — genuinely editable, styled to read as a headline.
            edited_title = st.text_input(
                "Product Title",
                value=catalog.get("seo_title", ""),
                key="product_title",
            )

            # Price section
            price = st.number_input(
                "Price (₹)",
                value=int(catalog.get("suggested_price_inr", 0)),
                min_value=0,
                step=10,
            )
            seller_price = catalog.get("seller_stated_price_inr")
            if seller_price is not None:
                st.caption(f"Seller mentioned: ₹{seller_price}")
            if catalog.get("price_deviation_flag"):
                st.warning(
                    "This price differs notably from what the seller mentioned — "
                    "please double-check before publishing."
                )
            if catalog.get("price_bounds_clamped"):
                st.info(
                    "This price was adjusted to stay within a typical range for this "
                    "product category."
                )

            # Description — two editable tabs
            tab_english, tab_hindi = st.tabs(["English", "हिन्दी"])
            with tab_english:
                edited_description_en = st.text_area(
                    "Description (English)",
                    value=catalog.get("description_english", ""),
                    height=200,
                )
            with tab_hindi:
                edited_description_hi = st.text_area(
                    "Description (हिन्दी)",
                    value=catalog.get("description_hindi", ""),
                    height=200,
                )

            tags = catalog.get("tags") or []
            st.caption(f"Tags: {', '.join(tags)}")

            # AI reasoning + verification block — auditable, not just numbers.
            with st.expander("Why this price? (AI reasoning)"):
                st.write(catalog.get("pricing_reasoning", ""))
                st.markdown("**Verification block (what the AI compared):**")
                verification = verification or {}
                st.markdown(
                    f"- **Detected category:** {verification.get('image_detected_category', '—')}"
                )
                materials = verification.get("image_detected_materials") or []
                st.markdown(
                    f"- **Detected materials:** {', '.join(materials) if materials else '—'}"
                )
                st.markdown(
                    f"- **Visual quality tier:** {verification.get('image_visual_quality_tier', '—')}"
                )
                st.markdown(
                    f"- **Consistency confidence:** {verification.get('consistency_confidence', '—')}"
                )

            if st.button("Save Listing"):
                st.success(
                    "In the full product, this saves to the database via the "
                    "backend team's API."
                )


st.set_page_config(page_title="Visual Forge — Product Listing Studio", layout="wide")

# Light custom styling — the only visual goal is that the right-hand details
# panel reads as a "product listing card" rather than a plain form.
st.markdown(
    """
    <style>
    div[data-testid="stVerticalBlockBorderWrapper"] {
        background: #ffffff;
        border: 1px solid #e8e6e3;
        border-radius: 12px;
        padding: 1.2rem 1.5rem;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
    }
    /* The product title is the only text input on the page — make it read as a
       headline, not a form field. */
    div[data-testid="stTextInput"] input {
        font-size: 1.5rem;
        font-weight: 700;
    }
    </style>
    """,
    unsafe_allow_html=True,
)

st.title("Visual Forge — AI Product Listing Studio")
st.caption(
    "Single-flow demo of both AI pipelines: background removal + audio-verified "
    "product pricing. This page is only a thin client — the API does the work, "
    "exactly as the future Node/Express backend will call it."
)

if not API_KEY:
    st.error(
        "X_API_KEY is not set in .env — the demo cannot authenticate with the API. "
        "Set X_API_KEY in the project's .env file and restart the demo."
    )
    st.stop()

col_upload_photo, col_upload_audio = st.columns(2)
with col_upload_photo:
    image_file = st.file_uploader(
        "Product photo", type=["png", "jpg", "jpeg", "webp"]
    )
with col_upload_audio:
    audio_file = st.file_uploader(
        "Voice note", type=["mp3", "wav", "m4a", "mp4", "ogg"]
    )

if st.button("Generate Listing"):
    if image_file is None or audio_file is None:
        st.warning("Upload both a product photo and a voice note, then click Generate Listing.")
        st.stop()

    # ------------------------------------------------------------------
    # Step 1 — image enhancement (background removal + whitening)
    # ------------------------------------------------------------------
    with st.spinner("Enhancing product photo — this can take up to a minute..."):
        try:
            enhance_response = requests.post(
                ENHANCE_URL,
                headers=AUTH_HEADERS,
                files={
                    "file": (
                        image_file.name,
                        image_file.getvalue(),
                        image_file.type or "application/octet-stream",
                    )
                },
                timeout=REQUEST_TIMEOUT_SECONDS,
            )
        except requests.RequestException:
            _show_connection_error()
            st.stop()

    if enhance_response.status_code != 200:
        st.error(f"Image enhancement failed: {_extract_detail(enhance_response)}")
        st.stop()

    try:
        clean_image_url = enhance_response.json()["clean_image_url"]
    except (ValueError, KeyError, TypeError):
        st.error("Image enhancement returned an unexpected response (no clean_image_url).")
        st.stop()

    # ------------------------------------------------------------------
    # Step 2 — catalog + pricing (audio-verified)
    # ------------------------------------------------------------------
    with st.spinner("Analyzing product and voice note — this can take up to a minute..."):
        try:
            catalog_response = requests.post(
                CATALOG_URL,
                headers=AUTH_HEADERS,
                files={
                    "file": (
                        audio_file.name,
                        audio_file.getvalue(),
                        audio_file.type or "application/octet-stream",
                    )
                },
                data={"image_url": clean_image_url},
                timeout=REQUEST_TIMEOUT_SECONDS,
            )
        except requests.RequestException:
            _show_connection_error()
            st.stop()

    if catalog_response.status_code == 200:
        try:
            body = catalog_response.json()
            catalog = body["catalog"]
            verification = body.get("verification", {})
        except (ValueError, KeyError, TypeError):
            st.error("Catalog response was unexpected (missing catalog data).")
            st.stop()
        _render_product_card(clean_image_url, catalog, verification)

    elif (
        catalog_response.status_code == 422
        and "application/json" in catalog_response.headers.get("content-type", "")
    ):
        try:
            body = catalog_response.json()
        except ValueError:
            body = {}
        if isinstance(body, dict) and body.get("status") == "needs_review":
            st.warning(
                "⚠️ The photo and voice note don't seem to describe the same product. "
                "Please check both and try again."
            )
            if body.get("reason"):
                st.caption(body["reason"])
            st.stop()
        st.error(f"Something went wrong generating the listing: {_extract_detail(catalog_response)}")
        st.stop()

    else:
        st.error(f"Something went wrong generating the listing: {_extract_detail(catalog_response)}")
        st.stop()