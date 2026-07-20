import { useState } from "react";
import { Heart, Phone, MapPin, ChevronDown, Star, Moon, Sun, Navigation, ArrowRight } from "lucide-react";

interface Product {
  id: string;
  title: string;
  badge: { label: string; tone: "red" | "amber" | "green" };
  rating: number;
  reviews: number;
  location: string;
  price: number;
  monthly: number;
  condition: string;
  doorType: string;
  grade: string;
  sku: string;
  icon: string;
}

const PRODUCTS: Product[] = [
  {
    id: "p1",
    title: "Used 20 ft Shipping Container Standard 8 ft 6 in High | Used Wind and Water Tight WWT",
    badge: { label: "Best Seller", tone: "red" },
    rating: 4.8,
    reviews: 26,
    location: "Charlotte, NC",
    price: 1800,
    monthly: 81.82,
    condition: "Used",
    doorType: "Double Doors at 1 End",
    grade: "Wind and Water Tight (WWT)",
    sku: "U20SDV1DDWWTFOCNCB",
    icon: "📦",
  },
  {
    id: "p2",
    title: "Used 40 ft Shipping Container Standard 8 ft 6 in High | Used Wind and Water Tight WWT",
    badge: { label: "Best Seller", tone: "amber" },
    rating: 4.8,
    reviews: 12,
    location: "Charlotte, NC",
    price: 2200,
    monthly: 100.0,
    condition: "Used",
    doorType: "Double Doors at 1 End",
    grade: "Wind and Water Tight (WWT)",
    sku: "U40SDV1DDWWTFOCNCB",
    icon: "🚢",
  },
  {
    id: "p3",
    title: "Used 20 ft High Cube Shipping Container 9 ft 6 in High | Cargo Worthy CW",
    badge: { label: "In Stock", tone: "green" },
    rating: 4.9,
    reviews: 41,
    location: "Charlotte, NC",
    price: 2050,
    monthly: 93.4,
    condition: "Used",
    doorType: "Double Doors at 1 End",
    grade: "Cargo Worthy (CW)",
    sku: "U20HCDV1DDCWFOCNCB",
    icon: "📐",
  },
];

const badgeClasses: Record<Product["badge"]["tone"], string> = {
  red: "bg-red-600 dark:bg-red-500",
  amber: "bg-amber-600 dark:bg-amber-500",
  green: "bg-green-600 dark:bg-green-500",
};

function StarRow({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={13}
          className={
            n <= full
              ? "fill-red-600 text-red-600 dark:fill-red-500 dark:text-red-500"
              : "fill-gray-200 text-gray-200 dark:fill-neutral-700 dark:text-neutral-700"
          }
        />
      ))}
    </div>
  );
}

function ProductCard({
  product,
  wished,
  onToggleWish,
}: {
  product: Product;
  wished: boolean;
  onToggleWish: (id: string) => void;
}) {
  return (
    <div className="relative grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-5 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 sm:p-5 transition-colors hover:border-red-200 dark:hover:border-red-900 hover:shadow-lg">
      <button
        onClick={() => onToggleWish(product.id)}
        className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 transition-colors hover:border-red-400"
        aria-label="Toggle wishlist"
      >
        <Heart
          size={15}
          className={
            wished
              ? "fill-red-600 text-red-600"
              : "fill-none text-gray-500 dark:text-gray-400"
          }
        />
      </button>

      {/* image */}
      <div className="relative sm:col-span-3 flex aspect-[4/3] items-center justify-center rounded-md bg-gray-100 dark:bg-neutral-800 text-5xl">
        <span
          className={`absolute top-0 left-0 rounded-br-md px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-white ${badgeClasses[product.badge.tone]}`}
        >
          {product.badge.label}
        </span>
        {product.icon}
      </div>

      {/* info */}
      <div className="sm:col-span-6 flex min-w-0 flex-col gap-2">
        <h3 className="text-lg font-extrabold leading-tight text-gray-900 dark:text-gray-50">
          {product.title}
        </h3>
        <div className="flex items-center gap-2 text-xs">
          <StarRow rating={product.rating} />
          <span className="text-gray-700 dark:text-gray-300">{product.rating}</span>
          <span className="text-gray-400 dark:text-gray-500">({product.reviews})</span>
        </div>
        <div className="text-xs font-bold text-red-600 dark:text-red-500">{product.location}</div>

        <div className="rounded-md border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 px-3 py-2 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
          <span className="font-bold text-gray-900 dark:text-gray-100">Budget-Friendly Option: </span>
          Don't want to pay ${product.price.toFixed(2)} upfront? Select our Rent-To-Own option to pay just{" "}
          <a href="#" className="font-bold text-blue-700 dark:text-blue-400 underline underline-offset-2">
            ${product.monthly.toFixed(2)} a month
          </a>
          . No credit check required!
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 dark:text-blue-400">
          <Phone size={12} />
          Found It Cheaper? Call (888) 977-9085
        </div>

        <div className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
          <span className="font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 text-[10px]">Condition</span>
          <span className="text-gray-800 dark:text-gray-200">{product.condition}</span>
          <span className="font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 text-[10px]">Door Type</span>
          <span className="text-gray-800 dark:text-gray-200">{product.doorType}</span>
          <span className="font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 text-[10px]">Grade</span>
          <span className="text-gray-800 dark:text-gray-200">{product.grade}</span>
        </div>
        <div className="text-[10px] text-gray-400 dark:text-gray-500">SKU: {product.sku}</div>
      </div>

      {/* action */}
      <div className="sm:col-span-3 flex flex-row sm:flex-col items-center sm:items-end justify-between gap-3">
        <div className="text-left sm:text-right">
          <div className="text-3xl font-black leading-none text-gray-900 dark:text-gray-50">
            ${product.price.toLocaleString()}
          </div>
          <div className="text-[11px] text-gray-400 dark:text-gray-500">+ delivery, no tax</div>
        </div>
        <div className="flex w-full max-w-[180px] flex-col gap-2">
          <button className="w-full rounded-md bg-red-600 dark:bg-red-600 px-4 py-2.5 text-sm font-extrabold text-white transition-colors hover:bg-red-700">
            Quick View
          </button>
          <button className="flex w-full items-center justify-center gap-2 rounded-md bg-gray-900 dark:bg-neutral-700 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-black dark:hover:bg-neutral-600">
            <Phone size={13} />
            (888) 977-9085
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductGallery() {
  const [dark, setDark] = useState(false);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [zip, setZip] = useState("");

  const toggleWish = (id: string) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className={dark ? "dark" : ""}>
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 font-sans text-gray-900 dark:text-gray-100 transition-colors">
        {/* top bar */}
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 pt-4 text-xs text-gray-500 dark:text-gray-400">
          <div>
            <a href="#" className="font-semibold text-red-600 dark:text-red-500 hover:underline">Home</a> / Product Pricing
          </div>
          <button
            onClick={() => setDark((d) => !d)}
            className="flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-1.5 font-semibold transition-colors"
          >
            {dark ? <Sun size={14} /> : <Moon size={14} />}
            {dark ? "Light" : "Dark"}
          </button>
        </div>

        {/* page header */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4">
          <div className="text-2xl font-extrabold text-gray-900 dark:text-gray-50">
            Shipping Containers for Sale Near Me
          </div>
          <div className="text-3xl sm:text-4xl font-black text-red-600 dark:text-red-500">Charlotte, NC</div>
        </div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 lg:grid-cols-4 gap-6 px-4 sm:px-6 pb-16">
          {/* sidebar */}
          <aside className="order-2 lg:order-1 flex flex-col gap-4">
            <div className="flex flex-col gap-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
              <input
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                type="text"
                placeholder="Enter your ZIP/Postal Code"
                className="rounded-md border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 px-3 py-2.5 text-sm outline-none transition-colors focus:border-red-500 focus:bg-white dark:focus:bg-neutral-900"
              />
              <button className="flex items-center justify-center gap-2 rounded-md bg-red-600 px-3 py-2.5 text-sm font-extrabold text-white transition-colors hover:bg-red-700">
                See Prices <ArrowRight size={15} />
              </button>
              <button className="flex items-center justify-center gap-2 rounded-md bg-gray-900 dark:bg-neutral-700 px-3 py-2.5 text-sm font-bold text-white transition-colors hover:bg-black dark:hover:bg-neutral-600">
                <Navigation size={14} /> Use Current Location
              </button>
            </div>

            <div className="rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
              <button
                onClick={() => setFiltersOpen((o) => !o)}
                className={`flex w-full items-center justify-between px-4 py-3 text-base font-extrabold ${
                  filtersOpen ? "border-b border-gray-200 dark:border-neutral-800" : ""
                }`}
              >
                Filter
                <ChevronDown
                  size={16}
                  className={`text-gray-400 transition-transform ${filtersOpen ? "" : "-rotate-90"}`}
                />
              </button>

              {filtersOpen && (
                <div className="flex flex-col gap-1 px-4 py-3">
                  <div className="mb-1 text-[10px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    Products
                  </div>
                  {[
                    { label: "Buy Shipping Container", checked: true },
                    { label: "Rent Shipping Container", checked: false },
                    { label: "Rent-To-Own Shipping Container", checked: false },
                    { label: "Shipping Container Accessories", checked: false },
                  ].map((f) => (
                    <label
                      key={f.label}
                      className="flex items-center gap-2.5 rounded-md px-1 py-1.5 text-sm text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-neutral-800"
                    >
                      <input type="checkbox" defaultChecked={f.checked} className="h-4 w-4 accent-red-600" />
                      {f.label}
                    </label>
                  ))}
                  <label className="flex items-center gap-2.5 rounded-md px-1 py-1.5 text-sm text-gray-400 dark:text-gray-500">
                    <input type="checkbox" disabled className="h-4 w-4 accent-gray-400" />
                    Onsite Specials
                  </label>

                  <div className="mb-1 mt-3 text-[10px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    Payment Terms
                  </div>
                  <label className="flex items-center gap-2.5 rounded-md px-1 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800">
                    <input type="checkbox" defaultChecked className="h-4 w-4 accent-red-600" />
                    Buy
                  </label>

                  <div className="mb-1 mt-3 text-[10px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    Size / Length
                  </div>
                  <label className="flex items-center gap-2.5 rounded-md px-1 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800">
                    <input type="checkbox" defaultChecked className="h-4 w-4 accent-red-600" />
                    All
                  </label>
                </div>
              )}
            </div>
          </aside>

          {/* main */}
          <main className="order-1 lg:order-2 lg:col-span-3 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-3">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <span className="font-bold text-gray-900 dark:text-gray-100">{PRODUCTS.length}</span> containers found near Charlotte, NC
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400">
                Sort:
                <select className="rounded-md border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-2.5 py-1.5 text-sm text-gray-800 dark:text-gray-200">
                  <option>Default</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Best Rated</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {PRODUCTS.map((p) => (
                <ProductCard key={p.id} product={p} wished={wishlist.has(p.id)} onToggleWish={toggleWish} />
              ))}
            </div>

            <div className="flex items-center justify-center gap-1.5 py-2">
              {["‹", "1", "2", "3", "›"].map((n, i) => (
                <button
                  key={i}
                  className={`flex h-9 w-9 items-center justify-center rounded-md border text-sm font-bold transition-colors ${
                    n === "1"
                      ? "border-red-600 bg-red-600 text-white"
                      : "border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300 hover:border-red-400 hover:text-red-600"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}