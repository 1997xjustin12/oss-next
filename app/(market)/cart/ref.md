import { useState, useEffect } from "react";
import {
  ShoppingCart, Trash2, Plus, Minus, Truck, ShieldCheck, Lock,
  CreditCard, Building2, FileText, CalendarClock, MapPin,
  CheckCircle2, Moon, SunMedium, Package, RefreshCw, ChevronLeft,
  BadgeCheck, Tag, Mail, Phone
} from "lucide-react";

type PageView = "cart" | "checkout" | "confirm";
type PaymentMethod = "card" | "ach" | "check" | "financing";
type PurchaseType = "purchase" | "rent" | "rto";

interface CartItem {
  id: string;
  name: string;
  sku: string;
  qty: number;
  price: number;
  originalPrice: number;
  type: "Purchase" | "Accessory";
  shipNote: string;
}

const initialItems: CartItem[] = [
  {
    id: "item1",
    name: "20ft Standard Shipping Container",
    sku: "OSS-20STD-WWT",
    qty: 1,
    price: 1350,
    originalPrice: 1595,
    type: "Purchase",
    shipNote: "Delivers in 2–3 days",
  },
  {
    id: "item2",
    name: "Heavy-Duty Container Lock",
    sku: "ACC-LOCK-HD",
    qty: 2,
    price: 59,
    originalPrice: 65,
    type: "Accessory",
    shipNote: "Ships same day",
  },
];

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

export default function CartCheckout() {
  const [dark, setDark] = useState(false);
  const [page, setPage] = useState<PageView>("cart");

  // cart content loader
  const [cartLoading, setCartLoading] = useState(true);

  const [items, setItems] = useState<CartItem[]>(initialItems);
  const [promoInput, setPromoInput] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState(false);

  const [purchaseType, setPurchaseType] = useState<PurchaseType>("purchase");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [confetti, setConfetti] = useState<{ id: number; left: number; color: string; delay: number; size: number }[]>([]);

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    address: "", city: "", state: "", zip: "",
  });

  useEffect(() => {
    const t = setTimeout(() => setCartLoading(false), 1100);
    return () => clearTimeout(t);
  }, []);

  function reloadCart() {
    setCartLoading(true);
    setTimeout(() => setCartLoading(false), 1100);
  }

  function changeQty(id: string, delta: number) {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id ? { ...it, qty: Math.max(1, Math.min(10, it.qty + delta)) } : it
      )
    );
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  function applyPromo() {
    if (promoInput.trim().toUpperCase() === "SAVE10") {
      setPromoApplied(true);
      setPromoError(false);
    } else {
      setPromoApplied(false);
      setPromoError(true);
    }
  }

  const subtotal = items.reduce((sum, it) => sum + it.price * it.qty, 0);
  const deliveryFee = items.length ? 195 : 0;
  const discount = promoApplied ? Math.round(subtotal * 0.1 * 100) / 100 : 0;
  const total = Math.max(0, subtotal + deliveryFee - discount);

  function placeOrder() {
    setPlacingOrder(true);
    setTimeout(() => {
      const pieces = Array.from({ length: 36 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        color: ["#dc2626", "#16a34a", "#2563eb", "#ca8a04", "#ffffff"][i % 5],
        delay: Math.random() * 0.6,
        size: 6 + Math.random() * 8,
      }));
      setConfetti(pieces);
      setPlacingOrder(false);
      setPage("confirm");
      setTimeout(() => setConfetti([]), 2400);
    }, 1300);
  }

  function resetAll() {
    setItems(initialItems);
    setPromoApplied(false);
    setPromoError(false);
    setPromoInput("");
    setPage("cart");
  }

  return (
    <div className={dark ? "dark" : ""}>
      <style>{`
        @keyframes confettiFall{0%{transform:translateY(-10px) rotate(0deg);opacity:1}100%{transform:translateY(90vh) rotate(420deg);opacity:0}}
      `}</style>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
        {confetti.length > 0 && (
          <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {confetti.map((p) => (
              <span
                key={p.id}
                className="absolute top-0 rounded-sm"
                style={{
                  left: `${p.left}%`,
                  width: p.size,
                  height: p.size,
                  background: p.color,
                  animation: `confettiFall ${1 + p.delay}s ease-out forwards`,
                  animationDelay: `${p.delay}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Dark mode toggle (demo control, not site nav) */}
        <div className="fixed top-3 right-3 sm:top-4 sm:right-4 z-40">
          <button
            onClick={() => setDark((d) => !d)}
            className="flex items-center gap-1.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:border-red-400 dark:hover:border-red-500 transition-colors"
          >
            {dark ? <SunMedium className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span className="hidden sm:inline">{dark ? "Light" : "Dark"}</span>
          </button>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">

          {/* ===================== CART PAGE ===================== */}
          {page === "cart" && (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 lg:gap-8 items-start">
              <div>
                <div className="flex items-baseline justify-between gap-3 mb-5 flex-wrap">
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight flex items-center gap-2">
                    <ShoppingCart className="w-7 h-7 text-red-600" />
                    Shopping Cart
                    {!cartLoading && (
                      <span className="text-base sm:text-lg font-normal text-gray-500 dark:text-gray-400">
                        ({items.length} {items.length === 1 ? "item" : "items"})
                      </span>
                    )}
                  </h1>
                  <button
                    onClick={reloadCart}
                    className="flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${cartLoading ? "animate-spin" : ""}`} />
                    Refresh cart
                  </button>
                </div>

                {cartLoading ? (
                  <CartSkeleton />
                ) : (
                  <>
                    <div className="flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-4 py-2.5 text-sm font-semibold text-green-700 dark:text-green-400 mb-5">
                      <Truck className="w-4 h-4 shrink-0" />
                      Estimated delivery: 2–4 business days to your location
                    </div>

                    {items.length === 0 ? (
                      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-10 sm:p-16 text-center">
                        <ShoppingCart className="w-14 h-14 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                        <h3 className="text-2xl font-bold mb-1">Your cart is empty</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                          Looks like you haven't added anything yet.
                        </p>
                        <button
                          onClick={() => setItems(initialItems)}
                          className="rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2.5 text-sm transition-colors"
                        >
                          Restore items
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3.5 mb-6">
                        {items.map((it) => (
                          <div
                            key={it.id}
                            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 sm:p-5 hover:border-red-300 dark:hover:border-red-700 hover:shadow-md transition-all"
                          >
                            <div className="flex flex-col sm:flex-row gap-4">
                              <div className="flex gap-4 flex-1 min-w-0">
                                <div className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                                  {it.type === "Accessory" ? (
                                    <Lock className="w-7 h-7 text-gray-500 dark:text-gray-400" />
                                  ) : (
                                    <Package className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-lg sm:text-xl font-bold leading-tight truncate">{it.name}</h3>
                                  <div className="flex flex-wrap gap-1.5 mt-1.5 mb-3">
                                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
                                      ✓ In Stock
                                    </span>
                                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                                      SKU: {it.sku}
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-3">
                                    <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
                                      <button
                                        onClick={() => changeQty(it.id, -1)}
                                        className="w-8 h-8 flex items-center justify-center bg-gray-50 dark:bg-gray-800 hover:bg-red-600 hover:text-white text-gray-600 dark:text-gray-300 transition-colors"
                                      >
                                        <Minus className="w-3.5 h-3.5" />
                                      </button>
                                      <span className="w-9 text-center text-sm font-bold bg-white dark:bg-gray-900">{it.qty}</span>
                                      <button
                                        onClick={() => changeQty(it.id, 1)}
                                        className="w-8 h-8 flex items-center justify-center bg-gray-50 dark:bg-gray-800 hover:bg-red-600 hover:text-white text-gray-600 dark:text-gray-300 transition-colors"
                                      >
                                        <Plus className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                    <button
                                      onClick={() => removeItem(it.id)}
                                      className="flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" /> Remove
                                    </button>
                                    <span className="text-[11px] font-semibold text-green-600 dark:text-green-400">
                                      {it.shipNote}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1 pl-20 sm:pl-0 sm:text-right shrink-0">
                                <div className="text-2xl font-extrabold leading-none">{fmt(it.price * it.qty)}</div>
                                <div className="flex items-center gap-2 sm:flex-col sm:items-end sm:gap-1">
                                  <span className="text-xs text-gray-400 dark:text-gray-500 line-through">
                                    {fmt(it.originalPrice * it.qty)}
                                  </span>
                                  <span
                                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded text-white ${
                                      it.type === "Accessory" ? "bg-green-600" : "bg-blue-700"
                                    }`}
                                  >
                                    {it.type.toUpperCase()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {items.length > 0 && (
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400 mb-2">
                          Promo / Coupon Code
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={promoInput}
                            onChange={(e) => setPromoInput(e.target.value)}
                            placeholder="Enter code (try SAVE10)"
                            className="flex-1 min-w-0 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3.5 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-colors"
                          />
                          <button
                            onClick={applyPromo}
                            className="rounded-md bg-gray-900 dark:bg-gray-700 hover:bg-red-600 text-white font-semibold px-5 py-2.5 text-sm whitespace-nowrap transition-colors"
                          >
                            Apply
                          </button>
                        </div>
                        {promoApplied && (
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-green-600 dark:text-green-400 mt-2">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Code SAVE10 applied — {fmt(discount)} off!
                          </div>
                        )}
                        {promoError && (
                          <div className="text-xs font-semibold text-red-600 dark:text-red-400 mt-2">
                            ✗ Invalid promo code. Try SAVE10
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* ORDER SUMMARY */}
              {cartLoading ? (
                <SummarySkeleton />
              ) : (
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 sm:p-6 lg:sticky lg:top-6">
                  <div className="text-xl font-extrabold pb-3.5 mb-4 border-b border-gray-200 dark:border-gray-700">
                    Order Summary
                  </div>
                  <div className="flex flex-col gap-2.5 mb-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Subtotal ({items.length} items)</span>
                      <span className="font-semibold">{fmt(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Delivery fee</span>
                      <span className="font-semibold">{fmt(deliveryFee)}</span>
                    </div>
                    {promoApplied && (
                      <div className="flex justify-between text-green-600 dark:text-green-400">
                        <span>Promo SAVE10</span>
                        <span className="font-semibold">−{fmt(discount)}</span>
                      </div>
                    )}
                    <hr className="border-gray-200 dark:border-gray-700" />
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Est. Tax</span>
                      <span className="font-semibold">$0.00</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-baseline pt-3.5 border-t-2 border-gray-900 dark:border-gray-200 mb-1">
                    <span className="text-lg font-extrabold">Total</span>
                    <span className="text-3xl font-extrabold">{fmt(total)}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    *No sales tax on most container orders. Tax calculated at checkout.
                  </p>
                  <button
                    disabled={items.length === 0}
                    onClick={() => setPage("checkout")}
                    className="w-full rounded-md bg-red-600 hover:bg-red-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-extrabold text-lg py-3.5 flex items-center justify-center gap-2 transition-colors mb-2"
                  >
                    Proceed to Checkout →
                  </button>
                  <div className="flex items-center justify-center gap-4 flex-wrap pt-3.5 mt-1 border-t border-gray-200 dark:border-gray-700 text-[11px] text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-green-600 dark:text-green-400" /> Secure Checkout</span>
                    <span className="flex items-center gap-1"><BadgeCheck className="w-3.5 h-3.5 text-green-600 dark:text-green-400" /> No Hidden Fees</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===================== CHECKOUT PAGE ===================== */}
          {page === "checkout" && (
            <div>
              <ProgressBar step={2} />
              <button
                onClick={() => setPage("cart")}
                className="flex items-center gap-1 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 mb-5 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Back to cart
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 lg:gap-8 items-start">
                <div className="flex flex-col gap-5">

                  {/* PURCHASE TYPE */}
                  <Section step={1} title="Purchase Type">
                    <div className="grid grid-cols-1 sm:grid-cols-3 rounded-md border border-gray-300 dark:border-gray-600 overflow-hidden">
                      {([
                        { key: "purchase", label: "Purchase", sub: "Own outright" },
                        { key: "rent", label: "Rent", sub: "$95/mo · Monthly" },
                        { key: "rto", label: "Rent-to-Own", sub: "$79.99/mo · 36 mo" },
                      ] as { key: PurchaseType; label: string; sub: string }[]).map((opt, i) => (
                        <button
                          key={opt.key}
                          onClick={() => setPurchaseType(opt.key)}
                          className={`px-3 py-2.5 text-center border-b sm:border-b-0 sm:border-r last:border-0 border-gray-300 dark:border-gray-600 transition-colors ${
                            purchaseType === opt.key
                              ? "bg-gray-900 dark:bg-gray-700 text-white"
                              : "bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          <span className="block font-bold text-sm">{opt.label}</span>
                          <span className="block text-[10px] opacity-70 mt-0.5">{opt.sub}</span>
                        </button>
                      ))}
                    </div>
                  </Section>

                  {/* CONTACT INFO */}
                  <Section step={2} title="Contact Information">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <Field label="First Name" required>
                        <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="John" className={inputCls} />
                      </Field>
                      <Field label="Last Name" required>
                        <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="Smith" className={inputCls} />
                      </Field>
                    </div>
                    <div className="grid grid-cols-1 gap-3.5 mt-3.5">
                      <Field label="Email Address" required icon={<Mail className="w-3.5 h-3.5" />}>
                        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@company.com" className={inputCls} />
                      </Field>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-3.5">
                      <Field label="Phone Number" required icon={<Phone className="w-3.5 h-3.5" />}>
                        <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(888) 000-0000" className={inputCls} />
                      </Field>
                      <Field label="Company / Organization">
                        <input placeholder="Optional" className={inputCls} />
                      </Field>
                    </div>
                  </Section>

                  {/* DELIVERY ADDRESS */}
                  <Section step={3} title="Delivery Address">
                    <div className="rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 h-32 sm:h-40 flex flex-col items-center justify-center gap-2 text-gray-400 dark:text-gray-500 text-sm mb-3.5">
                      <MapPin className="w-8 h-8" />
                      <span className="px-4 text-center">Enter your address to confirm depot availability</span>
                    </div>
                    <Field label="Street Address" required>
                      <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="123 Main Street" className={inputCls} />
                    </Field>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-3.5">
                      <Field label="Apt / Suite / Unit">
                        <input placeholder="Optional" className={inputCls} />
                      </Field>
                      <Field label="City" required>
                        <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Los Angeles" className={inputCls} />
                      </Field>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-3.5">
                      <Field label="State" required>
                        <select value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className={inputCls}>
                          <option value="">Select State</option>
                          <option>California</option><option>Texas</option><option>Florida</option>
                          <option>New York</option><option>Illinois</option><option>Arizona</option>
                        </select>
                      </Field>
                      <Field label="ZIP Code" required>
                        <input value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} placeholder="90210" maxLength={5} className={inputCls} />
                      </Field>
                      <Field label="Country">
                        <input value="United States" readOnly className={`${inputCls} bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400`} />
                      </Field>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-3.5">
                      <Field label="Preferred Delivery Date" icon={<CalendarClock className="w-3.5 h-3.5" />}>
                        <input type="date" className={inputCls} />
                      </Field>
                      <Field label="Preferred Time Window">
                        <select className={inputCls}>
                          <option>Morning (8am–12pm)</option>
                          <option>Afternoon (12pm–5pm)</option>
                          <option>Any time</option>
                        </select>
                      </Field>
                    </div>
                  </Section>

                  {/* PAYMENT */}
                  <Section step={4} title="Payment Method">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {([
                        { key: "card", label: "Credit / Debit Card", icon: <CreditCard className="w-4 h-4" /> },
                        { key: "ach", label: "ACH / Bank Transfer", icon: <Building2 className="w-4 h-4" /> },
                        { key: "check", label: "Check / Wire", icon: <FileText className="w-4 h-4" /> },
                        { key: "financing", label: "Financing", icon: <CalendarClock className="w-4 h-4" /> },
                      ] as { key: PaymentMethod; label: string; icon: JSX.Element }[]).map((m) => (
                        <button
                          key={m.key}
                          onClick={() => setPaymentMethod(m.key)}
                          className={`flex items-center gap-2 rounded-md border px-4 py-2.5 text-sm font-semibold transition-colors ${
                            paymentMethod === m.key
                              ? "border-red-500 bg-red-50 dark:bg-red-900/20 text-gray-900 dark:text-gray-100"
                              : "border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-red-400"
                          }`}
                        >
                          {m.icon} {m.label}
                        </button>
                      ))}
                    </div>

                    {paymentMethod === "card" && (
                      <div className="flex flex-col gap-3.5">
                        <Field label="Card Number" required>
                          <input placeholder="1234 5678 9012 3456" maxLength={19} className={inputCls} />
                        </Field>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                          <Field label="Cardholder Name" required>
                            <input placeholder="John Smith" className={inputCls} />
                          </Field>
                          <Field label="Expiry Date" required>
                            <input placeholder="MM / YY" maxLength={7} className={inputCls} />
                          </Field>
                          <Field label="CVV" required>
                            <input placeholder="123" maxLength={4} className={inputCls} />
                          </Field>
                        </div>
                      </div>
                    )}

                    {paymentMethod === "ach" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <Field label="Bank Routing Number" required>
                          <input placeholder="021000021" maxLength={9} className={inputCls} />
                        </Field>
                        <Field label="Account Number" required>
                          <input placeholder="Account number" className={inputCls} />
                        </Field>
                      </div>
                    )}

                    {paymentMethod === "check" && (
                      <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 text-sm leading-relaxed">
                        <strong className="block mb-1">Wire / Check Instructions</strong>
                        Make checks payable to On-Site Storage Solutions, LLC. Wire instructions are emailed after order confirmation. Orders process once payment clears (2–5 business days for checks, 1 day for wire).
                      </div>
                    )}

                    {paymentMethod === "financing" && (
                      <div className="flex flex-col gap-3.5">
                        <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 text-sm leading-relaxed">
                          <strong className="block mb-1">No Credit Check Required</strong>
                          Our rent-to-own and financing options don't require a credit check. Choose your term and we'll send a simple agreement to your email.
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <Field label="Financing Term">
                            <select className={inputCls}>
                              <option>12 months — $145/mo</option>
                              <option>24 months — $79.99/mo</option>
                              <option>36 months — $59/mo</option>
                            </select>
                          </Field>
                          <Field label="First Payment Date">
                            <input type="date" className={inputCls} />
                          </Field>
                        </div>
                      </div>
                    )}
                  </Section>

                  {/* REVIEW & CONFIRM */}
                  <Section step={5} title="Review & Confirm">
                    <div className="flex flex-col gap-3 mb-5">
                      <CheckRow defaultChecked>
                        I confirm the delivery address is accurate and the site is accessible by truck.
                      </CheckRow>
                      <CheckRow defaultChecked>
                        I agree to the <a href="#" className="text-red-600 dark:text-red-400 underline">Terms of Sale</a> and <a href="#" className="text-red-600 dark:text-red-400 underline">Return & Refund Policy</a>.
                      </CheckRow>
                      <CheckRow>
                        Keep me updated on promotions and order status by email.
                      </CheckRow>
                    </div>
                    <button
                      onClick={placeOrder}
                      disabled={placingOrder}
                      className="w-full rounded-md bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-extrabold text-xl sm:text-2xl py-4 flex items-center justify-center gap-2 transition-colors mb-3"
                    >
                      <Lock className="w-5 h-5" />
                      {placingOrder ? "Processing…" : `Place Order — ${fmt(total)}`}
                    </button>
                    <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                      <ShieldCheck className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                      256-bit SSL encrypted · Your information is safe and secure
                    </div>
                  </Section>
                </div>

                {/* CHECKOUT SIDEBAR */}
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 sm:p-6 lg:sticky lg:top-6">
                  <div className="text-xl font-extrabold pb-3.5 mb-2 border-b border-gray-200 dark:border-gray-700">
                    Your Order
                  </div>
                  {items.map((it) => (
                    <div key={it.id} className="flex gap-3 items-center py-2.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
                      <div className="w-12 h-10 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center shrink-0">
                        {it.type === "Accessory" ? <Lock className="w-4 h-4 text-gray-500 dark:text-gray-400" /> : <Package className="w-5 h-5 text-gray-500 dark:text-gray-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold truncate">{it.name}{it.qty > 1 ? ` × ${it.qty}` : ""}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{it.type}</div>
                      </div>
                      <div className="text-sm font-extrabold shrink-0">{fmt(it.price * it.qty)}</div>
                    </div>
                  ))}

                  <div className="flex flex-col gap-2 text-sm mt-4 mb-4">
                    <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Subtotal</span><span className="font-semibold">{fmt(subtotal)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Delivery</span><span className="font-semibold">{fmt(deliveryFee)}</span></div>
                    {promoApplied && <div className="flex justify-between text-green-600 dark:text-green-400"><span>Promo SAVE10</span><span className="font-semibold">−{fmt(discount)}</span></div>}
                    <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Tax</span><span className="font-semibold">$0.00</span></div>
                  </div>
                  <div className="flex justify-between items-baseline pt-3.5 border-t-2 border-gray-900 dark:border-gray-200">
                    <span className="text-lg font-extrabold">Total</span>
                    <span className="text-3xl font-extrabold">{fmt(total)}</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-3 py-2.5 text-xs font-semibold text-green-700 dark:text-green-400 mt-4">
                    <Truck className="w-4 h-4 shrink-0" /> Ships from nearest depot to you
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================== CONFIRMATION PAGE ===================== */}
          {page === "confirm" && (
            <div>
              <ProgressBar step={3} />
              <div className="max-w-2xl mx-auto text-center">
                <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Order Confirmed!</h1>
                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 leading-relaxed mb-7">
                  Thank you{form.firstName ? `, ${form.firstName}` : ""}! Your order <strong className="text-gray-900 dark:text-gray-100">#OSS-2025-07841</strong> has been placed.
                  {form.email ? ` You'll receive a confirmation email at ${form.email} shortly.` : " You'll receive a confirmation email shortly."} Our team will call to schedule your delivery.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-6 text-left sm:text-center">
                  <InfoStep icon={<Mail className="w-6 h-6" />} title="Confirmation Email" text="Sent to your email with order details and receipt" />
                  <InfoStep icon={<Phone className="w-6 h-6" />} title="Delivery Call" text="Our team calls within 1 business day to schedule delivery" />
                  <InfoStep icon={<Truck className="w-6 h-6" />} title="Fast Delivery" text="Delivered in 2–4 business days from nearest depot" />
                </div>

                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 sm:p-6 text-left mb-4">
                  <h3 className="text-lg font-bold pb-2.5 mb-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
                    <Package className="w-4 h-4" /> Order Summary
                  </h3>
                  <div className="flex flex-col gap-2 text-sm">
                    {items.map((it) => (
                      <div key={it.id} className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">{it.name}{it.qty > 1 ? ` × ${it.qty}` : ""}</span>
                        <span className="font-semibold">{fmt(it.price * it.qty)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Delivery Fee</span><span className="font-semibold">{fmt(deliveryFee)}</span></div>
                    {promoApplied && <div className="flex justify-between text-green-600 dark:text-green-400"><span>Promo SAVE10</span><span className="font-semibold">−{fmt(discount)}</span></div>}
                    <div className="flex justify-between pt-2.5 border-t-2 border-gray-900 dark:border-gray-200 mt-1">
                      <span className="text-base font-extrabold">Total Charged</span>
                      <span className="text-xl font-extrabold">{fmt(total)}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 sm:p-6 text-left mb-7">
                  <h3 className="text-lg font-bold pb-2.5 mb-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
                    <Truck className="w-4 h-4" /> Delivery Details
                  </h3>
                  <div className="flex flex-col gap-2 text-sm">
                    <div className="flex justify-between flex-wrap gap-1"><span className="text-gray-500 dark:text-gray-400">Delivery To</span><span className="font-semibold text-right">{form.address ? `${form.address}, ${form.city}, ${form.state} ${form.zip}` : "123 Main Street, Los Angeles, CA 90210"}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Est. Delivery</span><span className="font-semibold">2–4 Business Days</span></div>
                    <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Status</span><span className="font-semibold text-green-600 dark:text-green-400">✓ Payment Confirmed</span></div>
                  </div>
                </div>

                <button
                  onClick={resetAll}
                  className="inline-flex items-center gap-2 rounded-md bg-gray-900 dark:bg-gray-700 hover:bg-red-600 text-white font-extrabold text-lg px-7 py-3.5 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Back to Store
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- shared input class ---------- */
const inputCls =
  "w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3.5 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-colors";

/* ---------- small subcomponents ---------- */
function Section({ step, title, children }: { step: number; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 sm:p-6">
      <div className="flex items-center gap-2.5 mb-4">
        <span className="w-7 h-7 rounded-full bg-red-600 text-white text-xs font-extrabold flex items-center justify-center shrink-0">{step}</span>
        <h2 className="text-xl font-extrabold">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Field({ label, required, icon, children }: { label: string; required?: boolean; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
        {icon}{label}{required && <span className="text-red-600">*</span>}
      </label>
      {children}
    </div>
  );
}

function CheckRow({ defaultChecked, children }: { defaultChecked?: boolean; children: React.ReactNode }) {
  return (
    <label className="flex items-start gap-2.5 text-sm cursor-pointer">
      <input type="checkbox" defaultChecked={defaultChecked} className="w-4 h-4 mt-0.5 accent-red-600 shrink-0" />
      <span className="leading-relaxed text-gray-700 dark:text-gray-300">{children}</span>
    </label>
  );
}

function InfoStep({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 flex sm:flex-col gap-3 sm:gap-2 sm:items-center sm:text-center">
      <div className="text-red-600 dark:text-red-400 shrink-0">{icon}</div>
      <div>
        <div className="font-bold text-sm">{title}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{text}</div>
      </div>
    </div>
  );
}

function ProgressBar({ step }: { step: 1 | 2 | 3 }) {
  const labels = ["Cart", "Checkout", "Confirmed"];
  return (
    <div className="flex items-center justify-center gap-0 max-w-md mx-auto mb-8 sm:mb-10 px-2">
      {labels.map((label, i) => {
        const n = i + 1;
        const done = n < step;
        const active = n === step;
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                  done
                    ? "bg-green-600 border-green-600 text-white"
                    : active
                    ? "bg-red-600 border-red-600 text-white ring-4 ring-red-100 dark:ring-red-900/30"
                    : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500"
                }`}
              >
                {done ? "✓" : n}
              </div>
              <span className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wide ${done || active ? "text-gray-900 dark:text-gray-100" : "text-gray-400 dark:text-gray-500"}`}>
                {label}
              </span>
            </div>
            {n !== labels.length && (
              <div className={`flex-1 h-0.5 mx-1 sm:mx-2 mb-4 ${done ? "bg-green-600" : "bg-gray-200 dark:bg-gray-700"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ---------- skeleton loaders for cart content ---------- */
function CartSkeleton() {
  return (
    <div className="flex flex-col gap-3.5 mb-6 animate-pulse">
      <div className="h-10 rounded-lg bg-gray-100 dark:bg-gray-800" />
      {[0, 1].map((i) => (
        <div key={i} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex gap-4 flex-1">
              <div className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-gray-200 dark:bg-gray-700" />
              <div className="flex-1 flex flex-col gap-2.5 py-1">
                <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-3 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-7 w-28 rounded bg-gray-200 dark:bg-gray-700 mt-1" />
              </div>
            </div>
            <div className="flex sm:flex-col items-end gap-2 pl-20 sm:pl-0">
              <div className="h-6 w-16 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-3 w-12 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
        </div>
      ))}
      <div className="h-16 rounded-lg bg-gray-100 dark:bg-gray-800" />
    </div>
  );
}

function SummarySkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 sm:p-6 animate-pulse">
      <div className="h-5 w-2/3 rounded bg-gray-200 dark:bg-gray-700 mb-5" />
      <div className="flex flex-col gap-3 mb-5">
        <div className="h-3.5 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-3.5 rounded bg-gray-200 dark:bg-gray-700 w-5/6" />
        <div className="h-3.5 rounded bg-gray-200 dark:bg-gray-700 w-4/6" />
      </div>
      <div className="h-9 rounded bg-gray-200 dark:bg-gray-700 mb-5" />
      <div className="h-12 rounded-md bg-gray-200 dark:bg-gray-700" />
    </div>
  );
}