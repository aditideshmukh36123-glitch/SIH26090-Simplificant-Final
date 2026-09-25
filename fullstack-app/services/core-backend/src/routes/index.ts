import { Router } from "express";
import { authRouter } from "../modules/auth/auth.routes";
import { escrowRouter } from "../modules/escrow/escrow.routes";
import { ordersRouter } from "../modules/orders/orders.routes";
import { productsRouter } from "../modules/products/products.routes";
import { healthRouter } from "./health";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/products", productsRouter);
apiRouter.use("/orders", ordersRouter);
apiRouter.use("/escrow", escrowRouter);