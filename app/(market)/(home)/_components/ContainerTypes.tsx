import Link from "next/link";

type BadgeVariant = "green" | "red" | "blue";

type ContainerType = {
  emoji: string;
  bg: string;
  badge: { label: string; variant: BadgeVariant } | null;
  title: string;
  desc: string;
  price: string;
  priceSub: string;
  cta: string;
  href: string;
};

const TYPES: ContainerType[] = [
  {
    emoji: "📦",
    bg: "bg-theme-primary-light",
    badge: { label: "Most Popular", variant: "green" },
    title: "20ft Standard",
    desc: "Perfect for residential, small business, and construction site storage. Fits most driveways.",
    price: "From $1,350",
    priceSub: "Buy · Rent · Lease-to-Own",
    cta: "Get Quote",
    href: "#quote-section",
  },
  {
    emoji: "🚢",
    bg: "bg-[#f0f0f0]",
    badge: { label: "Best Value", variant: "red" },
    title: "40ft Standard",
    desc: "Double capacity for farms, retail, contractors, and industrial storage needs nationwide.",
    price: "From $2,000",
    priceSub: "Buy · Rent · Lease-to-Own",
    cta: "Get Quote",
    href: "#quote-section",
  },
  {
    emoji: "📐",
    bg: "bg-[#fff3e0]",
    badge: { label: "One-Trip", variant: "blue" },
    title: "40ft High Cube",
    desc: "Extra headroom for tall equipment, workshop setups, and high-volume inventory storage.",
    price: "From $2,800",
    priceSub: "Buy · Rent · Lease-to-Own",
    cta: "Get Quote",
    href: "#quote-section",
  },
  {
    emoji: "❄️",
    bg: "bg-[#e8eef8]",
    badge: null,
    title: "Refrigerated (Reefer)",
    desc: "Temperature-controlled units for food service, pharma, and climate-sensitive industries.",
    price: "Call for Price",
    priceSub: "Sale & Rental Available",
    cta: "Inquire",
    href: "/contact",
  },
  {
    emoji: "🔓",
    bg: "bg-[#e8f5e9]",
    badge: null,
    title: "Open-Side Containers",
    desc: "Full side-panel access for wide loads, easy side-loading, and specialty storage setups.",
    price: "Call for Price",
    priceSub: "Specialty Units",
    cta: "Inquire",
    href: "/contact",
  },
  {
    emoji: "🔧",
    bg: "bg-[#e0f2f1]",
    badge: null,
    title: "Modified Containers",
    desc: "Custom doors, windows, electrical, shelving — tailored to your exact specifications.",
    price: "Custom Pricing",
    priceSub: "Built to Order",
    cta: "Learn More",
    href: "/products/modified",
  },
];

const BADGE_CLS: Record<BadgeVariant, string> = {
  green: "bg-theme-success-dark text-white",
  red:   "bg-theme-primary text-white",
  blue:  "bg-theme-accent text-white",
};

export function ContainerTypes() {
  return (
    <section className="py-[72px] px-[5%] bg-theme-bg" aria-labelledby="types-title">
      <div className="text-center mb-11">
        <p className="text-[11.5px] font-bold text-theme-primary uppercase tracking-[.1em] mb-2">
          Container Inventory
        </p>
        <h2
          id="types-title"
          className="text-[32px] sm:text-[38px] font-black text-theme-dark leading-[1.05] mb-3 tracking-[-0.02em]"
        >
          Find the Right Container for Your Needs
        </h2>
        <p className="text-[15px] text-theme-muted leading-[1.65] max-w-[580px] mx-auto">
          From compact 20ft units to oversized high cubes and temperature-controlled reefers — we
          stock every size and configuration.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
        {TYPES.map((type) => (
          <div
            key={type.title}
            className="border-[1.5px] border-theme-border rounded-[8px] overflow-hidden bg-white transition-[border-color,box-shadow] duration-200 hover:border-theme-primary hover:shadow-[0_6px_24px_rgba(204,0,0,.1)]"
          >
            <div className={`h-[138px] flex items-center justify-center relative text-[50px] ${type.bg}`}>
              <span role="img" aria-label={type.title}>{type.emoji}</span>
              {type.badge && (
                <span
                  className={`absolute top-[10px] right-[10px] text-[10px] font-bold px-[9px] py-[3px] rounded-[2px] uppercase tracking-[.04em] ${BADGE_CLS[type.badge.variant]}`}
                >
                  {type.badge.label}
                </span>
              )}
            </div>
            <div className="p-[17px]">
              <h3 className="text-[18px] font-extrabold mb-[5px] text-theme-dark">{type.title}</h3>
              <p className="text-[13px] text-theme-muted leading-[1.5] mb-[13px]">{type.desc}</p>
              <div className="flex items-center justify-between pt-3 border-t border-theme-border">
                <div>
                  <strong className="text-[19px] font-black text-theme-dark">{type.price}</strong>
                  <span className="text-[11px] text-theme-muted block">{type.priceSub}</span>
                </div>
                <Link
                  href={type.href}
                  className="bg-theme-dark text-white px-[17px] py-2 rounded-[4px] text-[13px] font-bold transition-colors hover:bg-theme-primary"
                >
                  {type.cta}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
