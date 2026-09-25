# Visual Forge — Standalone Demo UI

A thin [Streamlit](https://streamlit.io) client that drives the Visual Forge
FastAPI service end-to-end: background removal + whitening, then
audio-verified product cataloging and pricing.

It does **not** import `main.py` — it talks to the running API over HTTP exactly
like the eventual Node/Express backend will, so its request/response handling
mirrors production consumer code.

## Setup

Demo-only dependencies (separate from the production API's `requirements.txt`):

```powershell
python -m pip install -r requirements-demo.txt
```

## Run (two terminals)

**Terminal 1 — start the API:**

```powershell
.\start.ps1
```

or, without the script:

```powershell
.\venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000
```

Wait for the server to finish booting (it loads the segmentation models on
startup).

**Terminal 2 — start the demo UI:**

```powershell
.\venv\Scripts\python.exe -m streamlit run demo_ui.py
```

Then open the URL Streamlit prints (default `http://localhost:8501`).

## Configuration

The demo reads the same `.env` file the API uses:

- `X_API_KEY` — API key sent in the `X-API-Key` header (never typed by hand).
- `API_BASE_URL` — optional; defaults to `http://127.0.0.1:8000` if unset.

If the API isn't running, the demo shows a clear "start the API server first"
message instead of a traceback.

## Flow

1. Upload a product photo and a voice note.
2. Click **Generate Listing**.
   - The photo goes to `/api/enhance-image` (background removal + whitening).
   - The cleaned image URL feeds `/api/catalog-audio` with the voice note.
   - If photo and voice note don't describe the same product, the API returns
     the 422 `needs_review` verdict and the demo prompts you to re-check.
3. On success, an editable product card renders: title, price (with any
   seller-price deviation / bounds-clamp warnings), English + Hindi
   descriptions, tags, and an expandable AI reasoning block.
4. **Save Listing** is a placeholder — in the full product this calls the
   backend team's persistence API (no real writes happen here).