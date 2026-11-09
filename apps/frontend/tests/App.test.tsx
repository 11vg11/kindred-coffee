import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "../src/App";
import { getProducts, placeOrder } from "../src/api";
import type { Product } from "../src/types";

vi.mock("../src/api", () => ({
  getProducts: vi.fn(),
  placeOrder: vi.fn(),
}));

const products: Product[] = [
  {
    id: "cappuccino",
    name: "Cappuccino",
    description: "Double espresso, steamed milk, silky foam.",
    price: 4.5,
    category: "Espresso",
    icon: "☕",
  },
  {
    id: "cold-brew",
    name: "Cold brew",
    description: "Steeped for 18 hours. Smooth, never bitter.",
    price: 4.75,
    category: "Cold drinks",
    icon: "🧊",
  },
];

describe("coffee shop storefront", () => {
  beforeEach(() => {
    vi.mocked(getProducts).mockResolvedValue(products);
    vi.mocked(placeOrder).mockResolvedValue({
      order: { id: "order-12345678", total: 4.5 },
    });
  });

  it("renders the products returned by the menu API", async () => {
    render(<App />);

    expect(await screen.findByRole("heading", { name: "Cappuccino" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Cold brew" })).toBeVisible();
  });

  it("filters products by category", async () => {
    render(<App />);
    await screen.findByRole("heading", { name: "Cappuccino" });

    fireEvent.click(screen.getByRole("button", { name: "Cold drinks" }));

    expect(screen.getByRole("heading", { name: "Cold brew" })).toBeVisible();
    expect(screen.queryByRole("heading", { name: "Cappuccino" })).not.toBeInTheDocument();
  });

  it("updates quantity and subtotal when adding a menu item", async () => {
    render(<App />);
    await screen.findByRole("heading", { name: "Cappuccino" });

    fireEvent.click(screen.getAllByRole("button", { name: /add to order/i })[0]);

    expect(screen.getByText("Cappuccino", { selector: ".cart-product strong" })).toBeVisible();
    expect(screen.getByText("$4.50", { selector: ".order-total strong" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Your order, 1 items" })).toBeVisible();
  });

  it("submits the cart and displays the successful order confirmation", async () => {
    render(<App />);
    await screen.findByRole("heading", { name: "Cappuccino" });
    fireEvent.click(screen.getAllByRole("button", { name: /add to order/i })[0]);
    fireEvent.click(screen.getByRole("button", { name: /place my order/i }));

    await waitFor(() => {
      expect(placeOrder).toHaveBeenCalledWith([{ productId: "cappuccino", quantity: 1 }]);
    });
    expect(await screen.findByRole("status")).toHaveTextContent(/order-12 is in the works/i);
  });
});
