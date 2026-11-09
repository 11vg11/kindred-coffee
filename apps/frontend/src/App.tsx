import { useEffect, useMemo, useState } from "react";
import { getProducts, placeOrder } from "./api";
import type { CartItem, Category, Product } from "./types";

const categories: Array<Category | "All"> = ["All", "Espresso", "Brewed", "Cold drinks"];
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ordering, setOrdering] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [cozyMode, setCozyMode] = useState(false);

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch((cause: unknown) =>
        setError(cause instanceof Error ? cause.message : "Could not load the menu."),
      )
      .finally(() => setLoading(false));
  }, []);

  const visibleProducts = useMemo(
    () => products.filter((product) => category === "All" || product.category === category),
    [category, products],
  );
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  function addToCart(product: Product) {
    setConfirmation("");
    setCart((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, 20) }
            : item,
        );
      }
      return [...current, { product, quantity: 1 }];
    });
  }

  function surpriseMe() {
    if (products.length === 0) return;
    const product = products[Math.floor(Math.random() * products.length)];
    addToCart(product);
  }

  function changeQuantity(productId: string, amount: number) {
    setCart((current) =>
      current
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity + amount }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  async function checkout() {
    if (cart.length === 0 || ordering) return;
    setOrdering(true);
    setError("");
    try {
      const result = await placeOrder(
        cart.map(({ product, quantity }) => ({ productId: product.id, quantity })),
      );
      setConfirmation(`Order ${result.order.id.slice(0, 8)} is in the works. Thank you!`);
      setCart([]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not place your order.");
    } finally {
      setOrdering(false);
    }
  }

  return (
    <div className={`app-shell${cozyMode ? " cozy-mode" : ""}`}>
      <header className="topbar">
        <a className="brand" href="#" aria-label="Kindred Coffee home">
          <span className="brand-mark">k.</span>
          <span>KINDRED<span className="brand-light"> COFFEE</span></span>
        </a>
        <nav className="top-links" aria-label="Main navigation">
          <a href="#menu">Our menu</a>
          <a href="#story">Our story</a>
        </nav>
        <div className="topbar-actions">
          <button
            aria-label={cozyMode ? "Switch to classic colors" : "Switch to cozy colors"}
            aria-pressed={cozyMode}
            className="theme-toggle"
            onClick={() => setCozyMode((current) => !current)}
            type="button"
          >
            <span aria-hidden="true">{cozyMode ? "☕" : "🌷"}</span>
            {cozyMode ? "Classic colors" : "Cozy colors"}
          </button>
          <a className="cart-link" href="#your-order" aria-label={`Your order, ${itemCount} items`}>
            Your order <span className="cart-count">{itemCount}</span>
          </a>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow"><span className="eyebrow-line" /> YOUR NEIGHBORHOOD COFFEE</p>
            <h1>Good things<br />take <em>time.</em></h1>
            <p className="hero-description">
              Thoughtfully sourced beans. Carefully made coffee.
              A little moment that&apos;s all yours.
            </p>
            <a className="primary-button hero-button" href="#menu">Find your usual <span>↓</span></a>
            <div className="hero-note"><span>✳</span> Poured with care, every single time.</div>
          </div>
          <div className="hero-art" aria-label="Illustration of a cup of coffee">
            <div className="sun-disc" />
            <div className="steam steam-one" />
            <div className="steam steam-two" />
            <div className="cup">
              <span className="cup-logo">k.</span>
            </div>
            <div className="cup-handle" />
            <div className="saucer" />
            <div className="art-caption">a slower kind of morning</div>
            <div className="art-sparkle sparkle-one">✳</div>
            <div className="art-sparkle sparkle-two">✳</div>
          </div>
          <div className="hero-index">EST. 2018 &nbsp;·&nbsp; YOUR CORNER OF THE WORLD</div>
        </section>

        <section className="menu-section" id="menu">
          <div className="section-heading">
            <div>
              <p className="eyebrow">MADE FOR YOUR MOMENT</p>
              <h2>The good stuff.</h2>
            </div>
            <p className="menu-aside">Good coffee, good company.<br />That&apos;s the whole thing.</p>
          </div>

          <div className="menu-controls" aria-label="Filter menu by category">
            <div className="category-tabs">
              {categories.map((item) => (
                <button
                  className={`category-tab ${category === item ? "active" : ""}`}
                  key={item}
                  onClick={() => setCategory(item)}
                  type="button"
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="menu-actions">
              <span className="menu-count">{visibleProducts.length} THINGS TO LOVE</span>
              <button
                className="surprise-button"
                disabled={loading || products.length === 0}
                onClick={surpriseMe}
                type="button"
              >
                <span aria-hidden="true">✳</span> Surprise me
              </button>
            </div>
          </div>

          {error && <div className="notice error-notice" role="alert">{error}</div>}
          {loading ? (
            <div className="menu-state">Waking up the espresso machine…</div>
          ) : (
            <div className="product-grid">
              {visibleProducts.map((product, index) => (
                <article className={`product-card card-${index % 3}`} key={product.id}>
                  <div className="product-art">
                    {product.badge && <span className="product-badge">{product.badge}</span>}
                    <span className="product-icon" aria-hidden="true">{product.icon}</span>
                    <span className="product-number">0{products.indexOf(product) + 1}</span>
                  </div>
                  <div className="product-details">
                    <div className="product-title-row">
                      <h3>{product.name}</h3>
                      <span className="product-price">{money.format(product.price)}</span>
                    </div>
                    <p>{product.description}</p>
                    <button className="add-button" onClick={() => addToCart(product)} type="button">
                      <span>+</span> Add to order
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="order-section" id="your-order">
          <div className="order-intro">
            <p className="eyebrow">MADE FRESH, JUST FOR YOU</p>
            <h2>Your little<br /><em>pick-me-up.</em></h2>
            <p>Every cup is made to order, with good beans and a whole lot of love.</p>
          </div>
          <div className="order-card">
            <div className="order-card-heading">
              <div><p className="eyebrow">KINDRED COFFEE</p><h3>Your order</h3></div>
              <span className="order-dot">✳</span>
            </div>
            {cart.length === 0 ? (
              <div className="empty-cart">
                <span>☕</span>
                <p>Your cup is waiting.</p>
                <a href="#menu">Pick something lovely ↑</a>
              </div>
            ) : (
              <div className="cart-items">
                {cart.map(({ product, quantity }) => (
                  <div className="cart-row" key={product.id}>
                    <div className="cart-product">
                      <span className="cart-product-icon">{product.icon}</span>
                      <div><strong>{product.name}</strong><span>{money.format(product.price)} each</span></div>
                    </div>
                    <div className="quantity-control">
                      <button type="button" onClick={() => changeQuantity(product.id, -1)} aria-label={`Remove one ${product.name}`}>−</button>
                      <span>{quantity}</span>
                      <button type="button" onClick={() => changeQuantity(product.id, 1)} aria-label={`Add one ${product.name}`} disabled={quantity >= 20}>+</button>
                    </div>
                    <strong className="cart-line-total">{money.format(product.price * quantity)}</strong>
                  </div>
                ))}
              </div>
            )}
            <div className="order-total"><span>Subtotal</span><strong>{money.format(subtotal)}</strong></div>
            <button className="primary-button checkout-button" disabled={cart.length === 0 || ordering} onClick={checkout} type="button">
              {ordering ? "Placing your order…" : "Place my order"} <span>↗</span>
            </button>
            {confirmation && <p className="notice success-notice" role="status">{confirmation}</p>}
            <p className="order-footnote">Made with care. Always.</p>
          </div>
        </section>

        <section className="story-strip" id="story">
          <span>✳</span>
          <p>Not just a cup of coffee. <em>A little room to breathe.</em></p>
          <span>✳</span>
        </section>
      </main>

      <footer className="footer">
        <a className="brand" href="#" aria-label="Kindred Coffee home"><span className="brand-mark">k.</span><span>KINDRED<span className="brand-light"> COFFEE</span></span></a>
        <span>Good coffee. Good people. Every day.</span>
        <span>© KINDRED COFFEE 2026</span>
      </footer>
    </div>
  );
}
