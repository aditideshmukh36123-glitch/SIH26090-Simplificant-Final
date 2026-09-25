import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { asyncHandler } from "../../middleware/async-handler";
import { validate, validateAll } from "../../middleware/validate";
import { createProduct, listProducts, getProductById } from "./products.service";
import {
  createProductSchema,
  listProductsQuerySchema,
  productIdParamSchema,
} from "./products.schemas";

export const productsRouter = Router();

productsRouter.get(
  "/",
  validateAll({ query: listProductsQuerySchema }),
  asyncHandler(async (req, res) => {
    const result = await listProducts(req.query as unknown as Parameters<typeof listProducts>[0]);
    res.json({ success: true, data: result });
  })
);

productsRouter.post(
  "/",
  authenticate,
  validate(createProductSchema),
  asyncHandler(async (req, res) => {
    if (!req.user) {
      throw new Error("authenticated user expected");
    }
    const product = await createProduct(req.user, req.body);
    res.status(201).json({ success: true, data: product });
  })
);

productsRouter.get(
  "/:productId",
  validateAll({ params: productIdParamSchema }),
  asyncHandler(async (req, res) => {
    const product = await getProductById(req.params.productId as string);
    res.json({ success: true, data: product });
  })
);
