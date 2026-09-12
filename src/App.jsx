import { useEffect, useState } from "react";
import logo from "./assets/lighthouse_foundation_logo.png";
import ngoPaymentQr from "./assets/ngo-payment-qr.png";
import "./App.css";

function Logo({ context = "marketplace" }) {
  return (
    <img
      className={`brand-logo brand-logo-${context}`}
      src={logo}
      alt="Lighthouse Communities Foundation"
    />
  );
}

const categories = [
  {
    name: "Textiles",
    detail: "Thoughtful pieces for everyday life",
    icon: "bi-scissors",
  },
  {
    name: "Handmade",
    detail: "Made slowly, made with care",
    icon: "bi-flower1",
  },
  {
    name: "Home accents",
    detail: "Small details with a story",
    icon: "bi-house-heart",
  },
];

const products = [];

const apiOrigin = "http://localhost:5000";

function productImageUrl(imagePath) {
  return imagePath ? `${apiOrigin}${imagePath}` : null;
}

function Marketplace() {
  const [cartItems, setCartItems] = useState([]);
  const [catalogProducts, setCatalogProducts] = useState(products);
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cartItems.reduce(
    (total, item) => total + Number(item.price) * item.quantity,
    0,
  );

  const addToCart = (product) => {
    setCartItems((items) => {
      const existing = items.find(
        (item) => item.id === product.id || item.name === product.name,
      );
      if (existing) {
        return items.map((item) =>
          item.name === product.name
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...items, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productName) => {
    setCartItems((items) => items.filter((item) => item.name !== productName));
  };

  useEffect(() => {
    localStorage.setItem("lighthouse_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((response) =>
        response.ok
          ? response.json()
          : Promise.reject(new Error("Catalogue unavailable")),
      )
      .then(({ products: apiProducts }) => {
        if (apiProducts.length) {
          setCatalogProducts(
            apiProducts.map((product, index) => ({
              ...product,
              category: product.category,
              tone: ["rose", "sand", "blue"][index % 3],
            })),
          );
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="site-shell">
      <div className="announcement">
        Every purchase helps turn learning into opportunity.
      </div>
      <header className="navbar-wrap">
        <a
          className="brand"
          href="#top"
          aria-label="Lighthouse Communities Marketplace home"
        >
          <Logo />
        </a>
        <nav className="nav-links" aria-label="Primary navigation">
          <a href="#shop">Shop</a>
          <a href="/about">Our story</a>
          <a href="/contact">Contact</a>
        </nav>
        <a
          className="cart-button"
          href="#cart"
          aria-label={`Shopping cart, ${cartCount} items`}
        >
          <i className="bi bi-bag" aria-hidden="true"></i>
          <span>Cart</span>
          <b>{cartCount}</b>
        </a>
      </header>

      <main id="top">
        <section className="hero-section">
          <div className="hero-copy">
            <p className="eyebrow">SKILLS INTO OPPORTUNITIES</p>
            <h1>Objects with purpose, made for a brighter tomorrow.</h1>
            <p className="hero-text">
              Discover thoughtful products shaped by creativity, skill and the
              belief that every learner deserves a chance to grow.
            </p>
            <div className="hero-actions">
              <a className="button button-dark" href="#shop">
                Explore the collection{" "}
                <i className="bi bi-arrow-up-right" aria-hidden="true"></i>
              </a>
              <a className="text-link" href="#story">
                Why Lighthouse{" "}
                <i className="bi bi-arrow-right" aria-hidden="true"></i>
              </a>
            </div>
          </div>
          <div
            className="hero-art"
            aria-label="A colorful textile-inspired marketplace illustration"
            role="img"
          >
            <div className="art-sun"></div>
            <div className="art-shelf"></div>
            <div className="art-bowl"></div>
            <div className="art-flower flower-one"></div>
            <div className="art-flower flower-two"></div>
            <span className="art-note">
              HANDMADE
              <br />
              WITH INTENT
            </span>
          </div>
        </section>

        <section className="intro-strip" id="story">
          <p className="eyebrow">THE MARKETPLACE</p>
          <div>
            <h2>One skill can open many doors.</h2>
            <p>
              We are building a place where products can carry a little more
              meaning: a way to celebrate learning, support possibility and shop
              with purpose.
            </p>
          </div>
        </section>

        <section className="content-section" id="shop">
          <div className="section-heading">
            <div>
              <p className="eyebrow">SHOP BY FEEL</p>
              <h2>Find something with a story.</h2>
            </div>
            <a className="text-link" href="#products">
              View all products{" "}
              <i className="bi bi-arrow-right" aria-hidden="true"></i>
            </a>
          </div>
          <div className="category-grid">
            {categories.map((category) => (
              <a className="category-card" href="#products" key={category.name}>
                <i className={`bi ${category.icon}`} aria-hidden="true"></i>
                <span>{category.name}</span>
                <small>{category.detail}</small>
                <i
                  className="bi bi-arrow-up-right card-arrow"
                  aria-hidden="true"
                ></i>
              </a>
            ))}
          </div>
        </section>

        <section className="content-section products-section" id="products">
          <div className="section-heading">
            <div>
              <p className="eyebrow">THE FIRST EDIT</p>
              <h2>Made to be kept.</h2>
            </div>
            <span className="muted-label">Approved marketplace products</span>
          </div>
          {catalogProducts.length ? (
            <div className="product-grid">
              {catalogProducts.map((product) => (
                <article className="product-card" key={product.name}>
                  <div className={`product-image ${product.tone}`}>
                    {product.primary_image_url ? (
                      <img
                        src={productImageUrl(product.primary_image_url)}
                        alt={product.name}
                      />
                    ) : (
                      <span>
                        LIGHTHOUSE
                        <br />
                        MADE
                      </span>
                    )}
                  </div>
                  <div className="product-meta">
                    <div>
                      <p className="product-category">{product.category}</p>
                      <h3>{product.name}</h3>
                    </div>
                    <strong>₹{product.price}</strong>
                  </div>
                  <button
                    className="add-button"
                    type="button"
                    onClick={() => addToCart(product)}
                  >
                    Add to cart{" "}
                    <i className="bi bi-plus-lg" aria-hidden="true"></i>
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <p className="catalog-empty">
              No approved products are available yet.
            </p>
          )}
        </section>

        <section className="cart-section" id="cart">
          <div>
            <p className="eyebrow">YOUR SELECTION</p>
            <h2>Cart {cartCount ? `(${cartCount})` : "is waiting"}</h2>
          </div>
          {cartItems.length ? (
            <div className="cart-list">
              {cartItems.map((item) => (
                <div className="cart-row" key={item.name}>
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <div className="cart-row-actions">
                    <strong>₹{Number(item.price) * item.quantity}</strong>
                    <button
                      className="remove-cart-item"
                      type="button"
                      title={`Remove ${item.name}`}
                      aria-label={`Remove ${item.name} from cart`}
                      onClick={() => removeFromCart(item.name)}
                    >
                      <i className="bi bi-trash3" aria-hidden="true"></i>
                    </button>
                  </div>
                </div>
              ))}
              <div className="cart-total">
                <span>Total</span>
                <strong>₹{cartTotal}</strong>
              </div>
              <a className="button button-dark" href="/checkout">
                Proceed to checkout{" "}
                <i className="bi bi-arrow-right" aria-hidden="true"></i>
              </a>
            </div>
          ) : (
            <p className="cart-empty">Add a product to begin your order.</p>
          )}
        </section>

        <section className="tracking-section" id="track">
          <div>
            <p className="eyebrow">ORDER TRACKING</p>
            <h2>Know where your order stands.</h2>
            <p className="checkout-copy">
              Use your order ID and phone number. No customer account is
              required.
            </p>
          </div>
          <TrackOrder />
        </section>
        <section className="impact-section" id="impact">
          <div>
            <p className="eyebrow">WHY IT MATTERS</p>
            <h2>Shopping can be a small act of solidarity.</h2>
          </div>
          <p>
            Behind every considered object is the possibility of a new skill, a
            new confidence and a new opportunity. This marketplace is being
            created to help those stories travel further.
          </p>
          <a className="button button-light" href="#shop">
            Shop with purpose{" "}
            <i className="bi bi-arrow-up-right" aria-hidden="true"></i>
          </a>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-brand">
          <Logo />
        </div>
        <p>
          A marketplace concept for products shaped by skill, creativity and
          opportunity.
        </p>
        <span className="footer-note">
          Official NGO information will be added after verification.
        </span>
      </footer>
    </div>
  );
}

function TrackOrder() {
  const [form, setForm] = useState({ orderNumber: "", phone: "" });
  const [recoveryForm, setRecoveryForm] = useState({ phone: "", email: "" });
  const [order, setOrder] = useState(null);
  const [recoveredOrders, setRecoveredOrders] = useState([]);
  const [message, setMessage] = useState("");
  const track = async (event) => {
    event.preventDefault();
    const response = await fetch("http://localhost:5000/api/orders/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const result = await response.json();
    if (!response.ok) return setMessage(result.message);
    setOrder(result);
    setMessage("");
  };
  const cancel = async () => {
    const response = await fetch(
      `http://localhost:5000/api/orders/${order.order_number}/cancel`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: form.phone }),
      },
    );
    const result = await response.json();
    setMessage(result.message);
    if (response.ok) setOrder({ ...order, order_status: "cancelled" });
  };
  const recover = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/orders/find", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(recoveryForm) });
      const contentType = response.headers.get("content-type") || "";
      const result = contentType.includes("application/json") ? await response.json() : { message: "The backend is outdated. Restart it with npm run server." };
      if (!response.ok) return setMessage(result.message);
      setRecoveredOrders(result);
      setMessage("");
    } catch {
      setMessage("Cannot reach the server. Run npm run server and try again.");
    }
  };
  return (
    <div className="tracking-card">
      <form className="track-form" onSubmit={track}>
        <input
          required
          placeholder="Order ID e.g. LHC-12345678"
          value={form.orderNumber}
          onChange={(event) =>
            setForm({ ...form, orderNumber: event.target.value })
          }
        />
        <input
          required
          placeholder="Phone number"
          value={form.phone}
          onChange={(event) => setForm({ ...form, phone: event.target.value })}
        />
        <button className="button button-dark" type="submit">
          Track order <i className="bi bi-search" aria-hidden="true"></i>
        </button>
      </form>
      <details className="order-recovery">
        <summary>Forgot your order ID?</summary>
        <form className="track-form" onSubmit={recover}>
          <input required placeholder="Phone number" value={recoveryForm.phone} onChange={(event) => setRecoveryForm({ ...recoveryForm, phone: event.target.value })} />
          <input required type="email" placeholder="Checkout email" value={recoveryForm.email} onChange={(event) => setRecoveryForm({ ...recoveryForm, email: event.target.value })} />
          <button className="button button-dark" type="submit">Find orders</button>
        </form>
        {recoveredOrders.map((item) => <div className="track-result" key={item.order_number}><strong>{item.order_number}</strong><span>{item.items}</span><span>Total ₹{item.total_amount} · {item.order_status.replaceAll("_", " ")}</span></div>)}
      </details>
      {order && (
        <div className="track-result">
          <strong>{order.order_number}</strong>
          <span>{order.items}</span>
          <span>
            Total ₹{order.total_amount} · {order.payment_status}
          </span>
          <b>{order.order_status.replaceAll("_", " ")}</b>
          {["pending", "confirmed"].includes(order.order_status) && (
            <button className="text-link" type="button" onClick={cancel}>
              Request cancellation
            </button>
          )}
        </div>
      )}
      {message && <p className="checkout-message">{message}</p>}
    </div>
  );
}

function CheckoutPage() {
  const [cartItems, setCartItems] = useState(() =>
    JSON.parse(localStorage.getItem("lighthouse_cart") || "[]"),
  );
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    houseFlat: "",
    street: "",
    area: "",
    landmark: "",
    city: "",
    state: "",
    pinCode: "",
    paymentMethod: "cod",
    transactionId: "",
  });
  const [message, setMessage] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const [copied, setCopied] = useState(false);
  const update = (event) =>
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  const submit = async (event) => {
    event.preventDefault();
    setMessage("Placing your order...");
    try {
      const payload = new FormData();
      payload.append("customer", JSON.stringify({ fullName: form.fullName, phone: form.phone, email: form.email }));
      payload.append("address", JSON.stringify({ houseFlat: form.houseFlat, street: form.street, area: form.area, landmark: form.landmark, city: form.city, state: form.state, pinCode: form.pinCode }));
      payload.append("paymentMethod", form.paymentMethod);
      payload.append("transactionId", form.transactionId);
      payload.append("items", JSON.stringify(cartItems.map((item) => ({ productId: item.id, quantity: item.quantity }))));
      if (form.paymentProof) payload.append("paymentProof", form.paymentProof);
      const response = await fetch(`${apiOrigin}/api/orders`, {
        method: "POST",
        body: payload,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      localStorage.removeItem("lighthouse_cart");
      setCartItems([]);
      setConfirmation(result);
    } catch (error) {
      setMessage(error.message || "Unable to place the order.");
    }
  };
  return (
    <div className="info-page">
      <header className="navbar-wrap">
        <a className="brand" href="/">
          <Logo />
        </a>
        <a className="text-link" href="/">
          Back to marketplace{" "}
          <i className="bi bi-arrow-left" aria-hidden="true"></i>
        </a>
      </header>
      <main>
        {confirmation ? (
          <section className="confirmation-page">
            <p className="eyebrow">ORDER CONFIRMED</p>
            <h1>Thank you for your order.</h1>
            <p>
              Your order has been successfully placed and the Lighthouse team
              will process it shortly.
            </p>
            <div className="confirmation-summary">
              <strong>{confirmation.orderNumber} <button className="copy-order" type="button" onClick={() => { navigator.clipboard.writeText(confirmation.orderNumber); setCopied(true); }}>Copy ID</button></strong>
              {copied && <span className="copy-note">Order ID copied.</span>}
              <span>Total: ₹{confirmation.total}</span>
              <span>
                Payment:{" "}
                {confirmation.paymentMethod === "cod"
                  ? "Cash on Delivery"
                  : "QR payment"}
              </span>
              <span>Status: {confirmation.paymentStatus}</span>
            </div>
            <div className="hero-actions">
              <a className="button button-dark" href="/">
                Continue shopping{" "}
                <i className="bi bi-arrow-right" aria-hidden="true"></i>
              </a>
              <a className="text-link" href="/#track">
                Track your order{" "}
                <i className="bi bi-arrow-up-right" aria-hidden="true"></i>
              </a>
            </div>
          </section>
        ) : (
          <section className="checkout-section checkout-page">
            <div>
              <p className="eyebrow">GUEST CHECKOUT</p>
              <h1>Ready when you are.</h1>
              <p className="checkout-copy">
                {cartItems.length
                  ? `Your selection: ${cartItems.reduce((total, item) => total + item.quantity, 0)} item(s).`
                  : "Your cart is empty."}
              </p>
            </div>
            <form className="checkout-form" onSubmit={submit}>
              <div className="form-grid">
                {[
                  ["fullName", "Full name"],
                  ["phone", "Mobile number"],
                  ["email", "Email"],
                  ["houseFlat", "House / flat"],
                  ["street", "Street"],
                  ["area", "Area"],
                  ["landmark", "Landmark"],
                  ["city", "City"],
                  ["state", "State"],
                  ["pinCode", "PIN code"],
                ].map(([name, label]) => (
                  <label key={name}>
                    {label}
                    <input
                      name={name}
                      type={name === "email" ? "email" : "text"}
                      required={name !== "landmark"}
                      pattern={
                        name === "phone"
                          ? "[6-9][0-9]{9}"
                          : name === "pinCode"
                            ? "[0-9]{6}"
                            : undefined
                      }
                      value={form[name]}
                      onChange={update}
                    />
                  </label>
                ))}
              </div>
              <fieldset>
                <legend>Payment method</legend>
                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={form.paymentMethod === "cod"}
                    onChange={update}
                  />{" "}
                  Cash on Delivery
                </label>
                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="qr"
                    checked={form.paymentMethod === "qr"}
                    onChange={update}
                  />{" "}
                  NGO QR payment (manual verification)
                </label>
                {form.paymentMethod === "qr" && (
                  <div className="qr-payment-box">
                    <strong>Official NGO Payment QR Code</strong>
                    <img className="qr-code-image" src={ngoPaymentQr} alt="Official NGO UPI payment QR code" />
                    <label>
                      UPI transaction reference
                      <input name="transactionId" required value={form.transactionId} onChange={update} />
                    </label>
                    <label>
                      Upload payment screenshot
                      <input type="file" name="paymentProof" required accept="image/jpeg,image/png,image/webp" onChange={(event) => setForm({ ...form, paymentProof: event.target.files[0] || null })} />
                      <small>JPEG, PNG or WebP, up to 5 MB</small>
                    </label>
                  </div>
                )}
              </fieldset>
              <button
                className="button button-dark"
                type="submit"
                disabled={!cartItems.length}
              >
                Place order{" "}
                <i className="bi bi-arrow-right" aria-hidden="true"></i>
              </button>
              {message && (
                <p className="checkout-message" role="status">
                  {message}
                </p>
              )}
            </form>
          </section>
        )}
      </main>
    </div>
  );
}

function InformationPage({ type }) {
  const pages = {
    about: {
      eyebrow: "ABOUT LIGHTHOUSE",
      title: "A better future begins with possibility.",
      intro:
        "Lighthouse Communities Foundation works to build empowered communities through life-skills, employment and entrepreneurship opportunities for disadvantaged youth.",
      sections: [
        [
          "The Lighthouse program",
          "The Foundation’s flagship Lighthouse program helps young people build agency, skills and workplace competencies, supporting pathways to employment and entrepreneurship.",
        ],
        [
          "The marketplace connection",
          "This marketplace is a project concept inspired by that journey. Products are demo listings until they are reviewed and approved by an authorized Lighthouse administrator.",
        ],
      ],
    },
    contact: {
      eyebrow: "GET IN TOUCH",
      title: "Let’s keep the conversation open.",
      intro:
        "For official Lighthouse Communities Foundation enquiries, please use the verified contact details below.",
      sections: [
        ["Email", "contact@lighthousecommunities.org"],
        ["Official website", "lighthousecommunities.org"],
      ],
    },
    leadership: {
      eyebrow: "LEADERSHIP",
      title: "The people guiding the work.",
      intro:
        "Leadership information is sourced from the official Lighthouse Communities Foundation website and should be rechecked before public release.",
      sections: [
        [
          "Board of Directors",
          "Dr. Ganesh Natarajan, Cofounder and Chairman\nRuchi Mathur, Cofounder and Vice Chairperson\nRajnish Kumar, Ex-Chairman SBI\nUjwal Thakar, Chairman, Educate Girls\nAnita Rajan, Consultant, Tata Strive\nPervin Varma, Trustee, CRY\nMalini Thadani, Director, Access Development Services",
        ],
        [
          "Board Advisory",
          "Pradeep Bhargava\nRajan Navani\nAshwini Malhotra\nNarendra Goidani\nAmit Paranjpe\nSudarshan Poondi\nSrikrishna Sridhar Murthy\nManoj Yadav",
        ],
      ],
    },
    privacy: {
      eyebrow: "PROJECT POLICY",
      title: "Privacy policy",
      intro:
        "This college-project marketplace collects only the information needed to process and track an order.",
      sections: [
        [
          "What we collect",
          "Name, mobile number, email address, shipping address and payment reference when provided.",
        ],
        [
          "How it is used",
          "Order fulfilment, manual delivery coordination, payment verification and customer support. This page is project-specific and is not an official Lighthouse policy.",
        ],
      ],
    },
  };
  const page = pages[type] || pages.about;
  return (
    <div className="info-page">
      <header className="navbar-wrap">
        <a className="brand" href="/">
          <Logo />
        </a>
        <a className="text-link" href="/">
          Back to marketplace{" "}
          <i className="bi bi-arrow-left" aria-hidden="true"></i>
        </a>
      </header>
      <main>
        <section className="info-hero">
          <p className="eyebrow">{page.eyebrow}</p>
          <h1>{page.title}</h1>
          <p>{page.intro}</p>
        </section>
        <section className="info-sections">
          {page.sections.map(([heading, body]) => (
            <article key={heading}>
              <p className="eyebrow">{heading}</p>
              <p>{body}</p>
            </article>
          ))}
        </section>
      </main>
      <footer className="footer">
        <div className="footer-brand">
          <span className="brand-light">LIGHTHOUSE</span>
          <span className="brand-sub">COMMUNITIES MARKETPLACE</span>
        </div>
        <p>
          Official NGO information is sourced from lighthousecommunities.org.
        </p>
      </footer>
    </div>
  );
}

function AdminPortal() {
  const [session, setSession] = useState(() =>
    localStorage.getItem("lighthouse_admin_token"),
  );
  const [form, setForm] = useState({
    email: "admin@lighthouse.local",
    password: "",
  });
  const [dashboard, setDashboard] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [categories, setCategories] = useState([]);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    stockQuantity: "",
    learnerProgram: "",
    image: null,
  });
  const [message, setMessage] = useState("");

  const login = async (event) => {
    event.preventDefault();
    setMessage("Signing in...");
    try {
      const response = await fetch("http://localhost:5000/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok) return setMessage(result.message);
      localStorage.setItem("lighthouse_admin_token", result.token);
      setSession(result.token);
    } catch {
      setMessage("Cannot reach the server. Run npm run server and try again.");
    }
  };

  useEffect(() => {
    if (!session) return;
    const headers = { Authorization: `Bearer ${session}` };
    Promise.all([
      fetch("http://localhost:5000/api/admin/dashboard", { headers }).then(
        (response) => response.json(),
      ),
      fetch("http://localhost:5000/api/admin/products", { headers }).then(
        (response) => response.json(),
      ),
      fetch("http://localhost:5000/api/admin/orders", { headers }).then(
        (response) => response.json(),
      ),
      fetch("http://localhost:5000/api/admin/categories", { headers }).then(
        (response) => response.json(),
      ),
    ])
      .then(([summary, productRows, orderRows, categoryRows]) => {
        setDashboard(summary);
        setProducts(productRows);
        setOrders(orderRows);
        setCategories(categoryRows);
      })
      .catch(() => setMessage("Unable to load dashboard data."));
  }, [session]);

  const createProduct = async (event) => {
    event.preventDefault();
    const payload = new FormData();
    Object.entries(productForm).forEach(([key, value]) => {
      if (value !== null) payload.append(key, value);
    });
    const response = await fetch("http://localhost:5000/api/admin/products", {
      method: "POST",
      headers: { Authorization: `Bearer ${session}` },
      body: payload,
    });
    const result = await response.json();
    setMessage(response.ok ? "Product created." : result.message);
    if (response.ok) {
      setProductForm({
        name: "",
        description: "",
        price: "",
        categoryId: "",
        stockQuantity: "",
        learnerProgram: "",
        image: null,
      });
      const productsResponse = await fetch(
        "http://localhost:5000/api/admin/products",
        { headers: { Authorization: `Bearer ${session}` } },
      );
      if (productsResponse.ok) setProducts(await productsResponse.json());
      const dashboardResponse = await fetch(
        "http://localhost:5000/api/admin/dashboard",
        { headers: { Authorization: `Bearer ${session}` } },
      );
      if (dashboardResponse.ok) setDashboard(await dashboardResponse.json());
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    const response = await fetch(
      `http://localhost:5000/api/admin/orders/${orderId}/status`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${session}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      },
    );
    setMessage(
      response.ok ? "Order status updated." : "Unable to update order status.",
    );
    if (response.ok)
      setOrders((current) =>
        current.map((order) =>
          order.id === orderId ? { ...order, order_status: status } : order,
        ),
      );
    if (response.ok) {
      const dashboardResponse = await fetch(
        "http://localhost:5000/api/admin/dashboard",
        { headers: { Authorization: `Bearer ${session}` } },
      );
      if (dashboardResponse.ok) setDashboard(await dashboardResponse.json());
    }
  };

  const viewOrderDetails = async (orderId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/orders/${orderId}`,
        { headers: { Authorization: `Bearer ${session}` } },
      );
      const contentType = response.headers.get("content-type") || "";
      const result = contentType.includes("application/json")
        ? await response.json()
        : {
            message: "The backend is outdated. Restart it with npm run server.",
          };
      if (response.ok) setSelectedOrder(result);
      else setMessage(result.message || "Unable to load order details.");
    } catch {
      setMessage("Cannot reach the server. Run npm run server and try again.");
    }
  };

  const removeProduct = async (product) => {
    if (!window.confirm(`Remove "${product.name}" from the marketplace?`))
      return;
    const response = await fetch(
      `http://localhost:5000/api/admin/products/${product.id}`,
      { method: "DELETE", headers: { Authorization: `Bearer ${session}` } },
    );
    const result = await response.json();
    setMessage(
      response.ok ? "Product removed from the marketplace." : result.message,
    );
    if (response.ok) {
      setProducts((current) =>
        current.filter((item) => item.id !== product.id),
      );
      const dashboardResponse = await fetch(
        "http://localhost:5000/api/admin/dashboard",
        { headers: { Authorization: `Bearer ${session}` } },
      );
      if (dashboardResponse.ok) setDashboard(await dashboardResponse.json());
    }
  };

  if (!session)
    return (
      <div className="admin-page">
        <div className="admin-panel">
          <span className="brand-light">LIGHTHOUSE</span>
          <span className="brand-sub">ADMIN PORTAL</span>
          <h1>Welcome back.</h1>
          <form className="checkout-form" onSubmit={login}>
            <label>
              Email
              <input
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm({ ...form, email: event.target.value })
                }
              />
            </label>
            <label>
              Password
              <input
                type="password"
                required
                value={form.password}
                onChange={(event) =>
                  setForm({ ...form, password: event.target.value })
                }
              />
            </label>
            <button className="button button-dark" type="submit">
              Sign in <i className="bi bi-arrow-right" aria-hidden="true"></i>
            </button>
            <p className="checkout-message">{message}</p>
          </form>
          <a className="text-link" href="/">
            Return to marketplace
          </a>
        </div>
      </div>
    );

  return (
    <div className="admin-page">
      <div className="admin-panel admin-wide">
        <div className="admin-top">
          <div>
            <span className="brand-light">LIGHTHOUSE</span>
            <span className="brand-sub">ADMIN DASHBOARD</span>
          </div>
          <button
            className="text-link"
            type="button"
            onClick={() => {
              localStorage.removeItem("lighthouse_admin_token");
              setSession(null);
            }}
          >
            Log out
          </button>
        </div>
        <h1>Good morning.</h1>
        <p className="checkout-copy">A quiet view of your marketplace today.</p>
        {dashboard ? (
          <div className="dashboard-grid">
            <div>
              <strong>{dashboard.products.totalProducts}</strong>
              <span>Total products</span>
            </div>
            <div>
              <strong>{dashboard.products.availableProducts || 0}</strong>
              <span>Available</span>
            </div>
            <div>
              <strong>{dashboard.orders.totalOrders || 0}</strong>
              <span>Total orders</span>
            </div>
            <div>
              <strong>{dashboard.orders.pendingOrders || 0}</strong>
              <span>Pending orders</span>
            </div>
            <div>
              <strong>{dashboard.orders.qrPaymentsPending || 0}</strong>
              <span>QR verification</span>
            </div>
            <div>
              <strong>{dashboard.orders.deliveredOrders || 0}</strong>
              <span>Delivered</span>
            </div>
          </div>
        ) : (
          <p>Loading dashboard...</p>
        )}
        <p className="checkout-message">{message}</p>
        <section className="admin-workspace">
          <div>
            <p className="eyebrow">PRODUCTS</p>
            <h2>Catalogue control</h2>
            <form className="admin-product-form" onSubmit={createProduct}>
              <input
                required
                placeholder="Product name"
                value={productForm.name}
                onChange={(event) =>
                  setProductForm({ ...productForm, name: event.target.value })
                }
              />
              <input
                required
                placeholder="Description"
                value={productForm.description}
                onChange={(event) =>
                  setProductForm({
                    ...productForm,
                    description: event.target.value,
                  })
                }
              />
              <input
                required
                type="number"
                min="1"
                placeholder="Price"
                value={productForm.price}
                onChange={(event) =>
                  setProductForm({ ...productForm, price: event.target.value })
                }
              />
              <select
                required
                value={productForm.categoryId}
                onChange={(event) =>
                  setProductForm({
                    ...productForm,
                    categoryId: event.target.value,
                  })
                }
              >
                <option value="">Choose category</option>
                {categories.map((category) => (
                  <option value={category.id} key={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <input
                required
                type="number"
                min="0"
                placeholder="Stock"
                value={productForm.stockQuantity}
                onChange={(event) =>
                  setProductForm({
                    ...productForm,
                    stockQuantity: event.target.value,
                  })
                }
              />
              <label className="file-input">
                Product image
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) =>
                    setProductForm({
                      ...productForm,
                      image: event.target.files[0] || null,
                    })
                  }
                />
                <small>JPEG, PNG or WebP, up to 5 MB</small>
              </label>
              <button className="button button-dark" type="submit">
                Add product <i className="bi bi-plus-lg" aria-hidden="true"></i>
              </button>
            </form>
            {products.map((product) => (
              <div className="admin-row" key={product.id}>
                <span>
                  {product.name}
                  <small>
                    {product.category} · {product.stock_quantity} in stock
                  </small>
                </span>
                <strong>₹{product.price}</strong>
                <button
                  className="remove-product"
                  type="button"
                  title={`Remove ${product.name}`}
                  aria-label={`Remove ${product.name}`}
                  onClick={() => removeProduct(product)}
                >
                  <i className="bi bi-trash3" aria-hidden="true"></i>
                </button>
              </div>
            ))}
          </div>
          <div>
            <p className="eyebrow">ORDERS</p>
            <h2>Recent orders</h2>
            {orders.length ? (
              orders.map((order) => (
                <div className="admin-row" key={order.id}>
                  <span>
                    {order.order_number}
                    <small>
                      {order.full_name} · ₹{order.total_amount}
                    </small>
                    {order.order_status === "cancelled" && (
                      <small className="customer-cancelled">
                        Customer cancelled
                        {order.cancellation_reason
                          ? `: ${order.cancellation_reason}`
                          : ""}
                      </small>
                    )}
                  </span>
                  <select
                    value={order.order_status}
                    onChange={(event) =>
                      updateOrderStatus(order.id, event.target.value)
                    }
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="preparing">Preparing</option>
                    <option value="out_for_delivery">Out for delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <button
                    className="details-button"
                    type="button"
                    onClick={() => viewOrderDetails(order.id)}
                  >
                    Details
                  </button>
                </div>
              ))
            ) : (
              <p className="cart-empty">No orders yet.</p>
            )}
          </div>
        </section>
        {selectedOrder && (
          <section className="order-details">
            <div className="order-details-heading">
              <div>
                <p className="eyebrow">ORDER DETAILS</p>
                <h2>{selectedOrder.order_number}</h2>
              </div>
              <button
                className="text-link"
                type="button"
                onClick={() => setSelectedOrder(null)}
              >
                Close <i className="bi bi-x-lg" aria-hidden="true"></i>
              </button>
            </div>
            <div className="order-details-grid">
              <div>
                <strong>Customer</strong>
                <span>{selectedOrder.full_name}</span>
                <span>{selectedOrder.phone}</span>
                <span>{selectedOrder.email}</span>
              </div>
              <div>
                <strong>Shipping address</strong>
                <span>
                  {selectedOrder.house_flat}, {selectedOrder.street}
                </span>
                <span>
                  {selectedOrder.area}
                  {selectedOrder.landmark ? `, ${selectedOrder.landmark}` : ""}
                </span>
                <span>
                  {selectedOrder.city}, {selectedOrder.state} -{" "}
                  {selectedOrder.pin_code}
                </span>
              </div>
              <div>
                <strong>Payment</strong>
                <span>
                  {selectedOrder.payment_method.toUpperCase()} ·{" "}
                  {selectedOrder.payment_status}
                </span>
                <span>₹{selectedOrder.total_amount}</span>
                <span>
                  {selectedOrder.payment?.transaction_id ||
                    "No transaction reference"}
                </span>
                {selectedOrder.payment?.payment_proof ? (
                  <a
                    className="payment-proof-link"
                    href={`${apiOrigin}${selectedOrder.payment.payment_proof}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img
                      src={`${apiOrigin}${selectedOrder.payment.payment_proof}`}
                      alt="Customer payment proof"
                    />
                    Open payment proof
                  </a>
                ) : (
                  <span>No payment proof uploaded</span>
                )}
              </div>
              <div>
                <strong>Items</strong>
                {selectedOrder.items.map((item) => (
                  <span key={item.product_name}>
                    {item.product_name} × {item.quantity} · ₹{item.subtotal}
                  </span>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function App() {
  const path = window.location.pathname;
  if (path.startsWith("/admin")) return <AdminPortal />;
  if (path === "/checkout") return <CheckoutPage />;
  if (path === "/about") return <InformationPage type="about" />;
  if (path === "/contact") return <InformationPage type="contact" />;
  if (path === "/leadership") return <InformationPage type="leadership" />;
  if (path === "/privacy") return <InformationPage type="privacy" />;
  return <Marketplace />;
}

export default App;
