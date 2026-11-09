import { randomUUID } from "node:crypto";
import { Router } from "express";
import { products } from "../data/products.js";
import type { Order, OrderItemInput } from "../types.js";

export const ordersRouter = Router();

const orders: Order[] = [];

ordersRouter.post("/", (request, response) => {
  const items: unknown = request.body?.items;
  if (
    !Array.isArray(items) ||
    items.length === 0 ||
    !items.every(
      (item): item is OrderItemInput =>
        item !== null &&
        typeof item === "object" &&
        typeof item.productId === "string" &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0 &&
        item.quantity <= 20,
    )
  ) {
    response.status(400).json({ error: "Add between 1 and 20 of each menu item." });
    return;
  }

  const orderItems = items.map((item) => {
    const product = products.find((candidate) => candidate.id === item.productId);
    return product ? { ...item, name: product.name, unitPrice: product.price } : null;
  });

  if (orderItems.some((item) => item === null)) {
    response.status(400).json({ error: "One or more menu items could not be found." });
    return;
  }

  const validItems = orderItems.filter((item) => item !== null);
  const order: Order = {
    id: randomUUID(),
    items: validItems,
    total: Number(
      validItems
        .reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
        .toFixed(2),
    ),
    createdAt: new Date().toISOString(),
  };
  orders.push(order);
  response.status(201).json({ order });
});

ordersRouter.get("/", (_request, response) => {
  response.json({ orders });
});
