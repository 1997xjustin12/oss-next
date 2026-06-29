'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Info,
  Package,
  Minus,
  Plus,
  Trash2,
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertCircle,
  ShoppingCart,
} from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import type { CartItem } from '@/types/cart';

const TAX_RATE = 0.08875;

/* ── Helpers ── */
function itemMeta(item: CartItem): string {
  return [item.size, item.condition, item.orderType].filter(Boolean).join(' · ');
}

/* ── Address form ── */
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
  firstName: '',
  lastName: '',
  company: '',
  address1: '',
  address2: '',
  country: 'United States (US)',
  city: '',
  state: '',
  zip: '',
  phone: '',
  email: '',
};

/* ── Primitives ── */
function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-[.04em] text-theme-dark-2 dark:text-neutral-400">
      {children}{' '}
      {required && <span className="text-theme-primary dark:text-red-400">*</span>}
    </label>
  );
}

const inputCls =
  'w-full rounded-md border border-theme-border bg-theme-bg px-3 py-2.5 text-sm text-theme-dark outline-none transition-colors placeholder:text-theme-muted hover:border-theme-primary/40 focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/10 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:hover:border-red-700 dark:focus:border-red-500 dark:focus:ring-red-500/15';

function TextInput({
  value,
  onChange,
  placeholder,
  type = 'text',
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
      className={inputCls}
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
    <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  );
}

function AddressFields({
  data,
  onChange,
}: {
  data: AddressForm;
  onChange: (field: keyof AddressForm, value: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label required>First Name</Label>
          <TextInput value={data.firstName} onChange={(v) => onChange('firstName', v)} placeholder="First Name" />
        </div>
        <div>
          <Label required>Last Name</Label>
          <TextInput value={data.lastName} onChange={(v) => onChange('lastName', v)} placeholder="Last Name" />
        </div>
      </div>

      <div>
        <Label>Company Name (Optional)</Label>
        <TextInput value={data.company} onChange={(v) => onChange('company', v)} placeholder="Company Name" />
      </div>

      <div>
        <Label required>Address 1</Label>
        <TextInput value={data.address1} onChange={(v) => onChange('address1', v)} placeholder="Street address" />
      </div>

      <div>
        <Label>Address 2</Label>
        <TextInput value={data.address2} onChange={(v) => onChange('address2', v)} placeholder="Apt, suite, unit, etc." />
      </div>

      <div>
        <Label required>Country / Region</Label>
        <SelectInput
          value={data.country}
          onChange={(v) => onChange('country', v)}
          options={['United States (US)', 'Canada (CA)']}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <Label required>City</Label>
          <TextInput value={data.city} onChange={(v) => onChange('city', v)} placeholder="City" />
        </div>
        <div>
          <Label required>State / Province</Label>
          <TextInput value={data.state} onChange={(v) => onChange('state', v)} placeholder="State" />
        </div>
        <div>
          <Label required>Postcode / ZIP</Label>
          <TextInput value={data.zip} onChange={(v) => onChange('zip', v)} placeholder="ZIP" />
        </div>
      </div>

      <div>
        <Label required>Phone</Label>
        <TextInput type="tel" value={data.phone} onChange={(v) => onChange('phone', v)} placeholder="Phone" />
      </div>

      <div>
        <Label required>Email Address</Label>
        <TextInput type="email" value={data.email} onChange={(v) => onChange('email', v)} placeholder="Email Address" />
      </div>
    </div>
  );
}

/* ── Empty cart state ── */
function EmptyCart() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-theme-subtle dark:bg-neutral-800">
        <ShoppingCart className="h-9 w-9 text-theme-muted dark:text-neutral-500" />
      </div>
      <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-theme-dark dark:text-neutral-100">
        Your cart is empty
      </h1>
      <p className="mt-2 max-w-sm text-sm text-theme-muted dark:text-neutral-400">
        You haven&apos;t added any containers or accessories yet. Browse our inventory to get started.
      </p>
      <Link
        href="/products"
        className="mt-8 inline-flex items-center gap-2 rounded-md bg-theme-primary px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-white transition-colors hover:bg-theme-primary-dark"
      >
        Browse Containers
      </Link>
      <a
        href="tel:8889779085"
        className="mt-3 text-sm font-semibold text-theme-primary hover:underline dark:text-red-400"
      >
        Or call us at (888) 977-9085
      </a>
    </div>
  );
}

/* ── Main Client Component ── */
export function CheckoutClient() {
  const { cart, removeItem, updateQty } = useCart();

  const [shipping, setShipping] = useState<AddressForm>(emptyAddress);
  const [billing, setBilling] = useState<AddressForm>(emptyAddress);
  const [sameBilling, setSameBilling] = useState(true);
  const [notes, setNotes] = useState('');
  const [doorDirection, setDoorDirection] = useState<'CAB' | 'REAR' | null>(null);
  const [confirmDelivery, setConfirmDelivery] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showIntlNote, setShowIntlNote] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [reserved, setReserved] = useState(false);

  const updateShipping = (field: keyof AddressForm, value: string) =>
    setShipping((p) => ({ ...p, [field]: value }));
  const updateBilling = (field: keyof AddressForm, value: string) =>
    setBilling((p) => ({ ...p, [field]: value }));

  const { items, totalPrice: subtotal } = cart;
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
    !!requiredShippingFilled &&
    !!requiredBillingFilled &&
    doorDirection !== null &&
    confirmDelivery &&
    agreeTerms &&
    items.length > 0;

  const handleReserve = () => {
    setAttempted(true);
    if (canReserve) setReserved(true);
  };

  if (items.length === 0 && !reserved) {
    return (
      <div className="min-h-screen bg-theme-subtle dark:bg-neutral-950">
        <EmptyCart />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-subtle px-4 py-8 dark:bg-neutral-950 sm:px-6 lg:px-10">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mx-auto mb-6 max-w-7xl text-sm">
        <Link href="/" className="font-semibold text-theme-primary hover:underline dark:text-red-400">
          Home
        </Link>
        <span className="mx-2 text-theme-muted dark:text-neutral-600">/</span>
        <span className="text-theme-muted dark:text-neutral-400">Checkout</span>
      </nav>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-2">

        {/* ══ LEFT COLUMN ══ */}
        <div className="flex flex-col gap-8">

          {/* Shipping Address */}
          <section
            aria-labelledby="shipping-heading"
            className="rounded-lg border border-theme-border bg-theme-bg p-6 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <h2
              id="shipping-heading"
              className="mb-5 text-2xl font-extrabold tracking-tight text-theme-primary dark:text-red-400"
            >
              Shipping Address
            </h2>
            <p className="mb-4 text-[11px] font-bold uppercase tracking-wider text-theme-muted dark:text-neutral-500">
              Shipping details
            </p>
            <AddressFields data={shipping} onChange={updateShipping} />

            <div className="mt-4">
              <Label>Order Notes (Optional)</Label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Please specify any site or delivery limitation (e.g. space, ground condition, etc.)"
                rows={3}
                className={`${inputCls} resize-none`}
              />
            </div>
          </section>

          {/* Billing Address */}
          <section
            aria-labelledby="billing-heading"
            className="rounded-lg border border-theme-border bg-theme-bg p-6 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <h2
              id="billing-heading"
              className="mb-5 text-2xl font-extrabold tracking-tight text-theme-primary dark:text-red-400"
            >
              Billing Address
            </h2>

            <div className="mb-5 space-y-2">
              {[
                { label: 'Same as shipping address', value: true },
                { label: 'Use different billing address', value: false },
              ].map(({ label, value }) => (
                <label
                  key={label}
                  className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-theme-dark dark:text-neutral-200"
                >
                  <input
                    type="radio"
                    name="billingMode"
                    checked={sameBilling === value}
                    onChange={() => setSameBilling(value)}
                    className="h-4 w-4 accent-theme-primary"
                  />
                  {label}
                </label>
              ))}
            </div>

            {!sameBilling && <AddressFields data={billing} onChange={updateBilling} />}
          </section>
        </div>

        {/* ══ RIGHT COLUMN ══ */}
        <div className="flex flex-col gap-8">

          {/* Order Summary */}
          <section
            aria-labelledby="order-heading"
            className="rounded-lg border border-theme-border bg-theme-bg p-6 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <h2
              id="order-heading"
              className="mb-5 text-2xl font-extrabold tracking-tight text-theme-primary dark:text-red-400"
            >
              Order Summary
            </h2>

            {/* Column headers */}
            <div className="mb-2 grid grid-cols-[1fr_auto_auto] gap-3 border-b border-theme-border pb-2 text-[11px] font-bold uppercase tracking-wider text-theme-muted dark:border-neutral-700 dark:text-neutral-500">
              <span>Products</span>
              <span>QTY</span>
              <span className="text-right">Subtotal</span>
            </div>

            {items.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[1fr_auto_auto] items-start gap-3 border-b border-theme-border/60 py-4 last:border-b-0 dark:border-neutral-800"
              >
                {/* Product info */}
                <div className="flex gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-theme-subtle dark:bg-neutral-800">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt={item.name} className="h-full w-full rounded-md object-cover" />
                    ) : (
                      <Package className="h-6 w-6 text-theme-muted dark:text-neutral-500" />
                    )}
                  </div>
                  <div>
                    <p className="line-clamp-2 text-sm font-semibold text-theme-primary dark:text-red-400">
                      {item.name}
                    </p>
                    {itemMeta(item) && (
                      <p className="mt-0.5 text-xs text-theme-muted dark:text-neutral-400">{itemMeta(item)}</p>
                    )}
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-theme-muted transition-colors hover:text-theme-primary dark:text-neutral-500 dark:hover:text-red-400"
                    >
                      <Trash2 className="h-3 w-3" />
                      Remove
                    </button>
                  </div>
                </div>

                {/* Qty stepper */}
                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => updateQty(item.id, item.quantity - 1)}
                    aria-label={`Decrease quantity of ${item.name}`}
                    className="flex h-6 w-6 items-center justify-center rounded border border-theme-border text-theme-mid transition-colors hover:border-theme-primary hover:text-theme-primary dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-red-500 dark:hover:text-red-400"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-5 text-center text-sm font-semibold text-theme-dark dark:text-neutral-200">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQty(item.id, item.quantity + 1)}
                    aria-label={`Increase quantity of ${item.name}`}
                    className="flex h-6 w-6 items-center justify-center rounded border border-theme-border text-theme-mid transition-colors hover:border-theme-primary hover:text-theme-primary dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-red-500 dark:hover:text-red-400"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>

                {/* Line total */}
                <p className="pt-1 text-right text-sm font-bold text-theme-dark dark:text-neutral-100">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}

            {/* Totals */}
            <div className="mt-4 space-y-2 border-t border-theme-border pt-4 text-sm dark:border-neutral-700">
              <div className="flex justify-between">
                <span className="font-semibold text-theme-mid dark:text-neutral-400">Subtotal</span>
                <span className="font-bold text-theme-dark dark:text-neutral-100">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-theme-mid dark:text-neutral-400">Ship To</span>
                <span className="font-bold text-theme-success dark:text-green-400">
                  {shipToReady
                    ? `${shipping.city}, ${shipping.state} ${shipping.zip}`
                    : 'Enter address below'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-theme-mid dark:text-neutral-400">Sales Tax</span>
                <span className="font-bold text-theme-dark dark:text-neutral-100">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-theme-border pt-3 dark:border-neutral-700">
                <span className="text-base font-extrabold text-theme-dark dark:text-neutral-100">Total</span>
                <span className="text-lg font-extrabold text-theme-dark dark:text-neutral-100">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Disclaimer banner */}
            <div className="mt-5 flex gap-2.5 rounded-md bg-theme-primary p-3.5 text-sm text-white">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                <strong className="font-bold">Disclaimer:</strong> By reserving your container,
                you are not committing to a purchase. We will contact you to confirm all the
                details and finalize the pricing.
              </p>
            </div>

            <p className="mt-4 text-sm text-theme-mid dark:text-neutral-400">
              Want faster service?{' '}
              <a href="tel:8889779085" className="font-bold text-theme-primary hover:underline dark:text-red-400">
                Give us a ring!
              </a>{' '}
              Don&apos;t forget to ask about specials in your area to see if you can save even more.
            </p>

            <button
              type="button"
              onClick={() => setShowIntlNote((s) => !s)}
              className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-theme-mid transition-colors hover:text-theme-primary dark:text-neutral-300 dark:hover:text-red-400"
            >
              Shipping Internationally? <Info className="h-3.5 w-3.5" />
            </button>
            {showIntlNote && (
              <p className="mt-2 rounded-md bg-theme-subtle p-3 text-xs text-theme-mid dark:bg-neutral-800 dark:text-neutral-400">
                International delivery is available on a case-by-case basis. Call us at{' '}
                <a href="tel:8889779085" className="font-semibold text-theme-primary dark:text-red-400">
                  (888) 977-9085
                </a>{' '}
                for a custom quote.
              </p>
            )}

            {attempted && !canReserve && !reserved && (
              <div className="mt-4 flex items-center gap-2 rounded-md bg-amber-50 p-3 text-xs font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                Please complete all required fields and confirm delivery details below.
              </div>
            )}

            <button
              type="button"
              onClick={handleReserve}
              disabled={reserved}
              className={`mt-4 w-full rounded-md py-3.5 text-base font-extrabold uppercase tracking-wide text-white transition-all ${
                reserved
                  ? 'cursor-default bg-theme-success-dark'
                  : 'bg-theme-primary hover:-translate-y-0.5 hover:bg-theme-primary-dark hover:shadow-lg hover:shadow-theme-primary/25'
              }`}
            >
              {reserved ? (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-5 w-5" /> Reserved — We&apos;ll be in touch!
                </span>
              ) : (
                'Reserve My Container Today'
              )}
            </button>

            <div className="mt-6 border-t border-theme-border pt-5 text-center dark:border-neutral-700">
              <p className="text-lg font-extrabold tracking-tight text-theme-dark dark:text-neutral-100">
                Question About Your Order?
              </p>
              <a
                href="tel:18889779085"
                className="mt-1 block text-sm font-bold text-theme-primary hover:underline dark:text-red-400"
              >
                Call us at 1-888-977-9085
              </a>
              <p className="text-xs text-theme-muted dark:text-neutral-400">
                Monday to Friday 6 am to 5 pm PST
              </p>
            </div>
          </section>

          {/* Delivery Requirement + Payment */}
          <section
            aria-labelledby="delivery-heading"
            className="overflow-hidden rounded-lg border border-theme-border bg-theme-bg dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="p-6">
              <h2
                id="delivery-heading"
                className="mb-5 text-2xl font-extrabold tracking-tight text-theme-primary dark:text-red-400"
              >
                Delivery Requirement
              </h2>

              <div className="mb-5">
                <Label required>Door Direction</Label>
                <div className="mt-2 space-y-2">
                  {(['CAB', 'REAR'] as const).map((dir) => (
                    <label
                      key={dir}
                      className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-theme-dark dark:text-neutral-200"
                    >
                      <input
                        type="radio"
                        name="doorDirection"
                        checked={doorDirection === dir}
                        onChange={() => setDoorDirection(dir)}
                        className="h-4 w-4 accent-theme-primary"
                      />
                      {dir}
                      <span
                        title={
                          dir === 'CAB'
                            ? 'Door faces the direction the truck cab is facing'
                            : 'Door faces the direction opposite the truck cab'
                        }
                      >
                        <Info className="h-3.5 w-3.5 text-theme-muted dark:text-neutral-500" />
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex cursor-pointer items-start gap-2.5 text-sm text-theme-mid dark:text-neutral-300">
                  <input
                    type="checkbox"
                    checked={confirmDelivery}
                    onChange={(e) => setConfirmDelivery(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-theme-primary"
                  />
                  <span>
                    I confirm that I have read the{' '}
                    <a href="#" className="font-bold text-theme-primary hover:underline dark:text-red-400">
                      Delivery Requirement
                    </a>{' '}
                    and that the delivery site is suitable for delivery of the container(s)/equipment{' '}
                    <span className="text-theme-primary dark:text-red-400">*</span>
                  </span>
                </label>

                <label className="flex cursor-pointer items-start gap-2.5 text-sm text-theme-mid dark:text-neutral-300">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-theme-primary"
                  />
                  <span>
                    I have read and agree to the website{' '}
                    <a href="#" className="font-bold text-theme-primary hover:underline dark:text-red-400">
                      terms and conditions
                    </a>{' '}
                    and{' '}
                    <a href="#" className="font-bold text-theme-primary hover:underline dark:text-red-400">
                      privacy policy
                    </a>{' '}
                    <span className="text-theme-primary dark:text-red-400">*</span>
                  </span>
                </label>
              </div>
            </div>

            {/* Payment header bar */}
            <div className="bg-theme-dark px-6 py-3 dark:bg-black">
              <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white">
                <Lock className="h-4 w-4" /> Payment
              </p>
            </div>

            {/* Privacy note */}
            <div className="flex items-start gap-2.5 bg-theme-subtle p-6 dark:bg-neutral-800/50">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-theme-muted dark:text-neutral-500" />
              <p className="text-xs text-theme-muted dark:text-neutral-400">
                Your personal data will be used to process your order, support your experience
                throughout this website, and for other purposes described in our{' '}
                <a href="#" className="font-semibold text-theme-primary hover:underline dark:text-red-400">
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
