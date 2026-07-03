import Link from "next/link";

export function TopBar() {
  return (
    <div className="bg-black px-[5%] py-1.75 flex justify-between items-center gap-2">
      <div className="hidden sm:flex gap-5 flex-wrap">
        <span className="text-white/90 text-[12.5px] font-medium flex items-center gap-[5px]">
          <div className="h-1.5 w-1.5 rounded-full bg-green-500" /> 20ft and 40ft In Stock 
        </span>
        <span className="text-white/90 text-[12.5px] font-medium flex items-center gap-[5px]">
          <div className="h-1.5 w-1.5 rounded-full bg-green-500" /> Reefer Containers Available
        </span>
        <span className="text-white/90 text-[12.5px] font-medium flex items-center gap-[5px]">
          <div className="h-1.5 w-1.5 rounded-full bg-green-500" /> Same-day Quotes
        </span>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/account" className="text-gray-500 text-xs transition-colors hover:text-white line-through">My Account</Link>
        {/* <Link href="/locations" className="text-white/85 text-xs transition-colors hover:text-white">Locations</Link>
        <a href="tel:8889779085" className="text-white font-bold text-xs">☎ (888) 977-9085</a> */}
      </div>
    </div>
  );
}
