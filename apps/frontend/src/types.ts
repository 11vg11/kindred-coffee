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

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderResponse {
  order: {
    id: string;
    total: number;
  };
}
