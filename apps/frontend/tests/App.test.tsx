import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "../src/App";
import { getProducts } from "../src/api";
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

describe("storefront enhancements", () => {
  beforeEach(() => {
    vi.mocked(getProducts).mockResolvedValue(products);
  });

  it("toggles the storefront between classic and cozy colors", async () => {
    render(<App />);

    const appShell = document.querySelector(".app-shell");
    const themeToggle = screen.getByRole("button", { name: "Switch to cozy colors" });
    expect(appShell).not.toHaveClass("cozy-mode");
    expect(themeToggle).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(themeToggle);

    expect(appShell).toHaveClass("cozy-mode");
    expect(screen.getByRole("button", { name: "Switch to classic colors" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("adds a randomly selected menu item to the order", async () => {
    const random = vi.spyOn(Math, "random").mockReturnValue(0.99);
    render(<App />);

    const surpriseButton = await screen.findByRole("button", { name: /surprise me/i });
    fireEvent.click(surpriseButton);

    await waitFor(() => {
      expect(screen.getByText("Cold brew", { selector: ".cart-product strong" })).toBeVisible();
    });
    expect(screen.getByText("$4.75", { selector: ".order-total strong" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Your order, 1 items" })).toBeVisible();
    random.mockRestore();
  });
});
