import type { OrderResponse, Product } from "./types";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body: { error?: string } = await response.json().catch(() => ({}));
    throw new Error(body.error ?? "Something went wrong. Please try again.");
  }

  return response.json() as Promise<T>;
}

export async function getProducts(): Promise<Product[]> {
  const result = await request<{ products: Product[] }>("/api/products");
  return result.products;
}

export function placeOrder(items: Array<{ productId: string; quantity: number }>) {
  return request<OrderResponse>("/api/orders", {
    method: "POST",
    body: JSON.stringify({ items }),
  });
}
