export type Category = "Espresso" | "Brewed" | "Cold drinks";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  badge?: string;
  icon: string;
}

export interface OrderItemInput {
  productId: string;
  quantity: number;
}

export interface Order {
  id: string;
  items: Array<OrderItemInput & { name: string; unitPrice: number }>;
  total: number;
  createdAt: string;
}
