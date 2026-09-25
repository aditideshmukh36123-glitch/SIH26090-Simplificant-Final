# Simplificant Architecture

This document explains the complete data and execution flow for both primary user journeys in Simplificant.

## ARTISAN FLOW (Product Creation)

1. **Login:** The Artisan authenticates securely via the Express Backend API.
2. **Data Capture:** Using the web or Expo mobile app, the Artisan uploads a raw product photo and provides product details via voice recording and/or typed notes.
3. **AI Enhancement:** The payload is sent to the FastAPI service (`/api/enhance-image`). The image's background is removed and lighting is corrected.
4. **Cloudinary:** The enhanced image is securely uploaded and hosted on Cloudinary.
5. **Transcription & Catalog:** The raw voice audio is processed. Using the visual data from the enhanced image and the audio transcript, the FastAPI service generates a multilingual product catalog (English and Hindi).
6. **Dynamic Pricing:** The AI evaluates the product features, materials, and artisan inputs to suggest a competitive selling price.
7. **Review & Publish:** The generated catalog, image, and price are presented to the Artisan for review. The Artisan clicks "Publish Product".
8. **Storage:** The frontend POSTs the finalized product payload to the Express Backend (`/api/v1/products`), which validates it and persists it via Prisma to the Neon PostgreSQL database.

## BUYER FLOW (Marketplace & Ordering)

1. **Login:** The Buyer authenticates securely via the Express Backend API.
2. **Marketplace Discovery:** The Buyer accesses the marketplace, which automatically fetches and displays the newest published products from the PostgreSQL database (`GET /api/v1/products?sortBy=newest`).
3. **Product Details:** The Buyer clicks a product card to view full details, and can seamlessly toggle between English and Hindi content natively mapped in the UI.
4. **Checkout:** The Buyer initiates the checkout flow and clicks "Place Order" with their shipping address.
5. **Order Processing:** The frontend POSTs the order payload to the Express Backend (`/api/v1/orders`).
6. **Stock Reduction:** The backend processes the order and transactionally reduces the product's `stockQuantity` in the Neon database to prevent overselling.
