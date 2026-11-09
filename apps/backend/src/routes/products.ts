import { Router } from "express";
import { products } from "../data/products.js";

export const productsRouter = Router();

productsRouter.get("/", (_request, response) => {
  response.json({ products });
});
