import { useState } from "react";
import {
  Phone,
  Info,
  Package,
  Minus,
  Plus,
  Trash2,
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

/* ============================================================
   Types
   ============================================================ */
interface CartItem {
  id: string;
  name: string;
  meta: string;
  price: number;
  qty: number;
}

interface AddressForm {
  firstName: string;
  lastName: string;
  company: string;
  address1: string;
  address2: string;
  country: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
}

const emptyAddress: AddressForm = {
  firstName: "",
  lastName: "",
  company: "",
  address1: "",
  address2: "",
  country: "United States (US)",
  city: "",
  state: "",
  zip: "",
  phone: "",
  email: "",
};

const TAX_RATE = 0.08875;

/* ============================================================
   Reusable field primitives
   ============================================================ */
function Label({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-neutral-700 dark:text-neutral-300">
      {children} {required && <span className="text-red-600 dark:text-red-500">*</span>}
    </label>
  );
}

const inputClasses =
  "w-full rounded-md border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 hover:border-red-300 focus:border-red-600 focus:ring-2 focus:ring-red-600/15 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:hover:border-red-700 dark:focus:border-red-500 dark:focus:ring-red-500/15";

function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={inputClasses}
    />
  );
}

function SelectInput({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={inputClasses}
    >
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  );
}

/* ============================================================
   Address Form Block (shared by Shipping + Billing)
   ============================================================ */
function AddressFields({
  data,
  onChange,
  idPrefix,
}: {
  data: AddressForm;
  onChange: (field: keyof AddressForm, value: string) => void;
  idPrefix: string;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label required>First Name</Label>
          <TextInput
            value={data.firstName}
            onChange={(v) => onChange("firstName", v)}
            placeholder="First Name"
          />
        </div>
        <div>
          <Label required>Last Name</Label>
          <TextInput
            value={data.lastName}
            onChange={(v) => onChange("lastName", v)}
            placeholder="Last Name"
          />
        </div>
      </div>

      <div>
        <Label>Company Name (Optional)</Label>
        <TextInput
          value={data.company}
          onChange={(v) => onChange("company", v)}
          placeholder="Company Name"
        />
      </div>

      <div>
        <Label required>Address 1</Label>
        <TextInput
          value={data.address1}
          onChange={(v) => onChange("address1", v)}
          placeholder="Street address"
        />
      </div>

      <div>
        <Label>Address 2</Label>
        <TextInput
          value={data.address2}
          onChange={(v) => onChange("address2", v)}
          placeholder="Apt, suite, unit, etc."
        />
      </div>

      <div>
        <Label required>Country / Region</Label>
        <SelectInput
          value={data.country}
          onChange={(v) => onChange("country", v)}
          options={["United States (US)", "Canada (CA)"]}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <Label required>City</Label>
          <TextInput value={data.city} onChange={(v) => onChange("city", v)} placeholder="City" />
        </div>
        <div>
          <Label required>State / Province</Label>
          <TextInput
            value={data.state}
            onChange={(v) => onChange("state", v)}
            placeholder="State"
          />
        </div>
        <div>
          <Label required>Postcode / ZIP</Label>
          <TextInput value={data.zip} onChange={(v) => onChange("zip", v)} placeholder="ZIP" />
        </div>
      </div>

      <div>
        <Label required>Phone</Label>
        <TextInput
          type="tel"
          value={data.phone}
          onChange={(v) => onChange("phone", v)}
          placeholder="Phone"
        />
      </div>

      <div>
        <Label required>Email Address</Label>
        <TextInput
          type="email"
          value={data.email}
          onChange={(v) => onChange("email", v)}
          placeholder="Email Address"
        />
      </div>
    </div>
  );
}

/* ============================================================
   Main Checkout Page
   ============================================================ */
export default function CheckoutPage() {
  const [shipping, setShipping] = useState<AddressForm>(emptyAddress);
  const [billing, setBilling] = useState<AddressForm>(emptyAddress);
  const [sameBilling, setSameBilling] = useState(true);
  const [notes, setNotes] = useState("");

  const [items, setItems] = useState<CartItem[]>([
    {
      id: "container-20ft",
      name: 'Used 20 ft Shipping Container Standard 8 ft 6 in High || Used Wind and Water Tight WWT Conex Storage Container - New York, NY / Newark, NJ',
      meta: "20ft · Used · WWT Grade",
      price: 1350.0,
      qty: 1,
    },
    {
      id: "cargo-door-lock",
      name: "Shipping Container Cargo Door Lock",
      meta: "Accessory",
      price: 79.99,
      qty: 1,
    },
  ]);

  const [doorDirection, setDoorDirection] = useState<"CAB" | "REAR" | null>(null);
  const [confirmDelivery, setConfirmDelivery] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showIntlNote, setShowIntlNote] = useState(false);

  const [attempted, setAttempted] = useState(false);
  const [reserved, setReserved] = useState(false);

  const updateShipping = (field: keyof AddressForm, value: string) =>
    setShipping((p) => ({ ...p, [field]: value }));
  const updateBilling = (field: keyof AddressForm, value: string) =>
    setBilling((p) => ({ ...p, [field]: value }));

  const updateQty = (id: string, delta: number) =>
    setItems((prev) =>
      prev.map((it) =>
        it.id === id ? { ...it, qty: Math.max(1, it.qty + delta) } : it
      )
    );

  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((it) => it.id !== id));

  const subtotal = items.reduce((sum, it) => sum + it.price * it.qty, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  const shipToReady = shipping.city && shipping.state && shipping.zip;

  const requiredShippingFilled =
    shipping.firstName &&
    shipping.lastName &&
    shipping.address1 &&
    shipping.city &&
    shipping.state &&
    shipping.zip &&
    shipping.phone &&
    shipping.email;

  const requiredBillingFilled =
    sameBilling ||
    (billing.firstName &&
      billing.lastName &&
      billing.address1 &&
      billing.city &&
      billing.state &&
      billing.zip &&
      billing.phone &&
      billing.email);

  const canReserve =
    requiredShippingFilled &&
    requiredBillingFilled &&
    doorDirection !== null &&
    confirmDelivery &&
    agreeTerms &&
    items.length > 0;

  const handleReserve = () => {
    setAttempted(true);
    if (canReserve) setReserved(true);
  };

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-8 dark:bg-neutral-950 sm:px-6 lg:px-10">
      {/* Breadcrumb */}
      <nav className="mx-auto mb-6 max-w-7xl text-sm">
        <span className="font-semibold text-red-600 dark:text-red-500">Home</span>
        <span className="mx-2 text-neutral-400 dark:text-neutral-600">/</span>
        <span className="text-neutral-500 dark:text-neutral-400">Checkout</span>
      </nav>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-2">
        {/* ============ LEFT COLUMN ============ */}
        <div className="flex flex-col gap-8">
          {/* Shipping Address */}
          <section className="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="mb-5 font-[Barlow_Condensed,sans-serif] text-2xl font-extrabold text-red-600 dark:text-red-500">
              Shipping Address
            </h2>
            <p className="mb-4 text-xs font-bold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Shipping details
            </p>
            <AddressFields data={shipping} onChange={updateShipping} idPrefix="ship" />

            <div className="mt-4">
              <Label>Order Notes (Optional)</Label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Please specify any site or delivery limitation (e.g. space, ground condition, etc.)"
                rows={3}
                className={`${inputClasses} resize-none`}
              />
            </div>
          </section>

          {/* Billing Address */}
          <section className="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="mb-5 font-[Barlow_Condensed,sans-serif] text-2xl font-extrabold text-red-600 dark:text-red-500">
              Billing Address
            </h2>

            <div className="mb-5 space-y-2">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                <input
                  type="radio"
                  name="billingMode"
                  checked={sameBilling}
                  onChange={() => setSameBilling(true)}
                  className="h-4 w-4 accent-red-600"
                />
                Same as shipping address
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                <input
                  type="radio"
                  name="billingMode"
                  checked={!sameBilling}
                  onChange={() => setSameBilling(false)}
                  className="h-4 w-4 accent-red-600"
                />
                Use different billing address
              </label>
            </div>

            {!sameBilling && (
              <AddressFields data={billing} onChange={updateBilling} idPrefix="bill" />
            )}
          </section>
        </div>

        {/* ============ RIGHT COLUMN ============ */}
        <div className="flex flex-col gap-8">
          {/* Order Summary */}
          <section className="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="mb-5 font-[Barlow_Condensed,sans-serif] text-2xl font-extrabold text-red-600 dark:text-red-500">
              Order Summary
            </h2>

            <div className="mb-2 grid grid-cols-[1fr_auto_auto] gap-3 border-b border-neutral-200 pb-2 text-xs font-bold uppercase tracking-wide text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
              <span>Products</span>
              <span>QTY</span>
              <span className="text-right">Subtotal</span>
            </div>

            {items.length === 0 && (
              <p className="py-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
                Your cart is empty.
              </p>
            )}

            {items.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[1fr_auto_auto] items-start gap-3 border-b border-neutral-100 py-4 last:border-b-0 dark:border-neutral-800"
              >
                <div className="flex gap-3">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-md bg-neutral-100 dark:bg-neutral-800">
                    <Package className="h-6 w-6 text-neutral-400 dark:text-neutral-500" />
                  </div>
                  <div>
                    <p className="line-clamp-2 text-sm font-semibold text-red-600 dark:text-red-500">
                      {item.name}
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                      {item.meta}
                    </p>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-neutral-400 transition-colors hover:text-red-600 dark:text-neutral-500 dark:hover:text-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                      Remove
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    onClick={() => updateQty(item.id, -1)}
                    className="flex h-6 w-6 items-center justify-center rounded border border-neutral-300 text-neutral-600 transition-colors hover:border-red-600 hover:text-red-600 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-red-500 dark:hover:text-red-500"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-5 text-center text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                    {item.qty}
                  </span>
                  <button
                    onClick={() => updateQty(item.id, 1)}
                    className="flex h-6 w-6 items-center justify-center rounded border border-neutral-300 text-neutral-600 transition-colors hover:border-red-600 hover:text-red-600 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-red-500 dark:hover:text-red-500"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>

                <p className="pt-1 text-right text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  ${(item.price * item.qty).toFixed(2)}
                </p>
              </div>
            ))}

            <div className="mt-4 space-y-2 border-t border-neutral-200 pt-4 text-sm dark:border-neutral-700">
              <div className="flex justify-between">
                <span className="font-semibold text-neutral-600 dark:text-neutral-400">
                  Subtotal
                </span>
                <span className="font-bold text-neutral-900 dark:text-neutral-100">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-neutral-600 dark:text-neutral-400">
                  Ship To
                </span>
                <span className="font-bold text-green-600 dark:text-green-500">
                  {shipToReady
                    ? `${shipping.city}, ${shipping.state} ${shipping.zip}`
                    : "Enter address below"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-neutral-600 dark:text-neutral-400">
                  Sales Tax
                </span>
                <span className="font-bold text-neutral-900 dark:text-neutral-100">
                  ${tax.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between border-t border-neutral-200 pt-3 dark:border-neutral-700">
                <span className="text-base font-extrabold text-neutral-900 dark:text-neutral-100">
                  Total
                </span>
                <span className="text-lg font-extrabold text-neutral-900 dark:text-neutral-100">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="mt-5 flex gap-2 rounded-md bg-red-600 p-3.5 text-sm text-white dark:bg-red-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <p>
                <strong className="font-bold">Disclaimer:</strong> By reserving your container,
                you are not committing to a purchase. We will contact you to confirm all the
                details and finalize the pricing.
              </p>
            </div>

            <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
              Want faster service?{" "}
              <a
                href="tel:8889779085"
                className="font-bold text-red-600 hover:underline dark:text-red-500"
              >
                Give us a ring!
              </a>{" "}
              Don't forget to ask about specials in your area to see if you can save even more.
            </p>

            <button
              onClick={() => setShowIntlNote((s) => !s)}
              className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-neutral-700 hover:text-red-600 dark:text-neutral-300 dark:hover:text-red-500"
            >
              Shipping Internationally? <Info className="h-3.5 w-3.5" />
            </button>
            {showIntlNote && (
              <p className="mt-2 rounded-md bg-neutral-50 p-3 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                International delivery is available on a case-by-case basis. Call us at{" "}
                <a href="tel:8889779085" className="font-semibold text-red-600 dark:text-red-500">
                  (888) 977-9085
                </a>{" "}
                for a custom quote.
              </p>
            )}

            {attempted && !canReserve && !reserved && (
              <div className="mt-4 flex items-center gap-2 rounded-md bg-amber-50 p-3 text-xs font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                Please complete all required fields and confirm delivery details below.
              </div>
            )}

            <button
              onClick={handleReserve}
              disabled={reserved}
              className={`mt-4 w-full rounded-md py-3.5 text-base font-extrabold uppercase tracking-wide text-white transition-all ${
                reserved
                  ? "bg-green-600 dark:bg-green-700"
                  : "bg-red-600 hover:-translate-y-0.5 hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/30 dark:bg-red-600 dark:hover:bg-red-700"
              }`}
            >
              {reserved ? (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-5 w-5" /> Reserved — We'll be in touch!
                </span>
              ) : (
                "Reserve My Container Today"
              )}
            </button>

            <div className="mt-6 border-t border-neutral-200 pt-5 text-center dark:border-neutral-700">
              <p className="font-[Barlow_Condensed,sans-serif] text-lg font-extrabold text-neutral-900 dark:text-neutral-100">
                Question About Your Order?
              </p>
              <a
                href="tel:18889779085"
                className="mt-1 block text-sm font-bold text-red-600 hover:underline dark:text-red-500"
              >
                Call us at 1-888-977-9085
              </a>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Monday to Friday 6 am to 5 pm PST
              </p>
            </div>
          </section>

          {/* Delivery Requirement + Payment */}
          <section className="overflow-hidden rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <div className="p-6">
              <h2 className="mb-5 font-[Barlow_Condensed,sans-serif] text-2xl font-extrabold text-red-600 dark:text-red-500">
                Delivery Requirement
              </h2>

              <Label required>Door Direction</Label>
              <div className="mb-5 space-y-2">
                {(["CAB", "REAR"] as const).map((dir) => (
                  <label
                    key={dir}
                    className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-neutral-800 dark:text-neutral-200"
                  >
                    <input
                      type="radio"
                      name="doorDirection"
                      checked={doorDirection === dir}
                      onChange={() => setDoorDirection(dir)}
                      className="h-4 w-4 accent-red-600"
                    />
                    {dir}
                    <Info
                      className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500"
                      title={
                        dir === "CAB"
                          ? "Door faces the direction the truck cab is facing"
                          : "Door faces the direction opposite the truck cab"
                      }
                    />
                  </label>
                ))}
              </div>

              <div className="space-y-3">
                <label className="flex cursor-pointer items-start gap-2.5 text-sm text-neutral-700 dark:text-neutral-300">
                  <input
                    type="checkbox"
                    checked={confirmDelivery}
                    onChange={(e) => setConfirmDelivery(e.target.checked)}
                    className="mt-0.5 h-4 w-4 flex-shrink-0 accent-red-600"
                  />
                  <span>
                    I confirm that I have read the{" "}
                    <a href="#" className="font-bold text-red-600 hover:underline dark:text-red-500">
                      Delivery Requirement
                    </a>{" "}
                    and that the delivery site is suitable for delivery of the container(s)/equipment{" "}
                    <span className="text-red-600 dark:text-red-500">*</span>
                  </span>
                </label>

                <label className="flex cursor-pointer items-start gap-2.5 text-sm text-neutral-700 dark:text-neutral-300">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 h-4 w-4 flex-shrink-0 accent-red-600"
                  />
                  <span>
                    I have read and agree to the website{" "}
                    <a href="#" className="font-bold text-red-600 hover:underline dark:text-red-500">
                      terms and conditions
                    </a>{" "}
                    and{" "}
                    <a href="#" className="font-bold text-red-600 hover:underline dark:text-red-500">
                      privacy policy
                    </a>{" "}
                    <span className="text-red-600 dark:text-red-500">*</span>
                  </span>
                </label>
              </div>
            </div>

            <div className="bg-neutral-900 px-6 py-3 dark:bg-black">
              <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-white">
                <Lock className="h-4 w-4" /> Payment
              </p>
            </div>

            <div className="flex items-start gap-2.5 bg-neutral-50 p-6 dark:bg-neutral-800/50">
              <ShieldCheck className="h-4 w-4 flex-shrink-0 mt-0.5 text-neutral-400 dark:text-neutral-500" />
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Your personal data will be used to process your order, support your experience
                throughout this website, and for other purposes described in our{" "}
                <a href="#" className="font-semibold text-red-600 hover:underline dark:text-red-500">
                  privacy policy
                </a>
                .
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}