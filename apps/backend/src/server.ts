import express from "express";
import { healthRouter } from "./routes/health.js";
import { ordersRouter } from "./routes/orders.js";
import { productsRouter } from "./routes/products.js";

const app = express();
const port = Number(process.env.PORT ?? 3001);

app.use(express.json({ limit: "10kb" }));
app.use("/api/health", healthRouter);
app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);

app.listen(port, () => {
  console.log(`Coffee shop API listening on http://localhost:${port}`);
});
