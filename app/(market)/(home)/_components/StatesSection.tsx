const STATES = [
  "California",    "Texas",        "Florida",      "New York",
  "Illinois",      "Pennsylvania", "Ohio",         "Georgia",
  "North Carolina","Michigan",     "Arizona",      "Washington",
  "Colorado",      "Nevada",       "Oregon",       "Utah",
  "Tennessee",     "Missouri",     "Virginia",     "Massachusetts",
  "Minnesota",     "Wisconsin",    "Maryland",     "+ All 50 States",
];

export function StatesSection() {
  return (
    <section
      className="bg-theme-dark py-[52px] px-[5%] text-center"
      aria-labelledby="states-title"
    >
      <p className="text-[11.5px] font-bold text-theme-primary uppercase tracking-[.1em] mb-2">
        Coverage
      </p>
      <h2
        id="states-title"
        className="text-[32px] sm:text-[38px] font-black text-white leading-[1.05] mb-2 tracking-[-0.02em]"
      >
        Delivering Across All 50 States
      </h2>
      <p className="text-[15px] text-white/50 leading-[1.65] max-w-[580px] mx-auto mb-[26px]">
        With 130+ depots nationwide, we deliver to residences, construction sites, farms,
        and businesses everywhere.
      </p>
      <div className="flex flex-wrap gap-2 justify-center" role="list" aria-label="Service states">
        {STATES.map((state) => (
          <span
            key={state}
            role="listitem"
            className="bg-white/[.06] border border-white/[.13] text-white/70 px-[13px] py-[6px] rounded-[3px] text-[12.5px] font-medium transition-[background,color,border-color] duration-150 cursor-pointer hover:bg-theme-primary hover:border-theme-primary hover:text-white"
          >
            {state}
          </span>
        ))}
      </div>
    </section>
  );
}
