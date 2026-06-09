const TRUST_ITEMS = [
  {
    path: "M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7l-9-5z",
    title: "Satisfaction Guaranteed",
    desc: "on every order",
  },
  {
    path: "M20 8h-3V4H3a2 2 0 00-2 2v11h2a3 3 0 006 0h6a3 3 0 006 0h2v-5l-3-4zm-1.5 1.5L20.5 12H17V9.5h1.5zM5 16.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm14 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3z",
    title: "Fast Delivery",
    desc: "direct to your site",
  },
  {
    path: "M20 2H4a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2z",
    title: "No Hidden Fees",
    desc: "— transparent pricing",
  },
  {
    path: "M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1v3.5a1 1 0 01-1 1A17 17 0 013 5a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1.02l-2.2 2.2z",
    title: "Phone, Email & Chat",
    desc: "expert support",
  },
  {
    path: "M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7l-9-5zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z",
    title: "Licensed & Insured",
    desc: "since 2002",
  },
];

export function TrustStrip() {
  return (
    <div
      className="bg-theme-subtle border-b border-theme-border px-[5%] py-[13px]"
      role="complementary"
      aria-label="Trust indicators"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between flex-wrap gap-3 sm:gap-[10px]">
        {TRUST_ITEMS.map((item, i) => (
          <div key={item.title} className="contents">
            <div className="flex items-center gap-2 text-[13px] text-theme-dark-2">
              <div className="w-[30px] h-[30px] rounded-full bg-theme-primary-light flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" width="15" height="15" className="fill-theme-primary" aria-hidden="true">
                  <path d={item.path} />
                </svg>
              </div>
              <span>
                <strong className="font-bold text-theme-dark">{item.title}</strong> {item.desc}
              </span>
            </div>
            {i < TRUST_ITEMS.length - 1 && (
              <div className="hidden sm:block w-px h-[28px] bg-theme-border shrink-0" aria-hidden="true" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
