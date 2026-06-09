import Link from "next/link";

export function TopBar() {
  return (
    <div className="bg-theme-primary px-[5%] py-1.75 flex justify-between items-center gap-2">
      <div className="hidden sm:flex gap-5 flex-wrap">
        <span className="text-white/90 text-[12.5px] font-medium flex items-center gap-[5px]">
          📦 Buy from <strong className="font-bold text-white">$1,350.00</strong>
        </span>
        <span className="text-white/90 text-[12.5px] font-medium flex items-center gap-[5px]">
          🚛 Rent from <strong className="font-bold text-white">$95/mo</strong>
        </span>
        <span className="text-white/90 text-[12.5px] font-medium flex items-center gap-[5px]">
          🔑 Rent-To-Own from <strong className="font-bold text-white">$79.99/mo</strong>
        </span>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/account" className="text-white/85 text-xs transition-colors hover:text-white">My Account</Link>
        <Link href="/locations" className="text-white/85 text-xs transition-colors hover:text-white">Locations</Link>
        <a href="tel:8889779085" className="text-white font-bold text-xs">☎ (888) 977-9085</a>
      </div>
    </div>
  );
}
