const REVIEWS = [
  {
    quote:
      "Incredibly transparent process. My rep didn't push the most expensive option — they helped me find exactly what I needed. Container arrived on time and in perfect condition.",
    initials: "MJ",
    name: "Mark J.",
    role: "Construction Manager · Texas",
    avatarCls: "bg-theme-primary",
  },
  {
    quote:
      "Excellent experience all the way through. Communication was outstanding, the price was competitive, and the delivery driver was professional. Five stars all the way!",
    initials: "ST",
    name: "Sarah T.",
    role: "Farm Owner · Missouri",
    avatarCls: "bg-theme-dark",
  },
  {
    quote:
      "We've used On-Site Storage for multiple projects now. Pricing is consistently competitive and the team is always professional. Our go-to container supplier.",
    initials: "RK",
    name: "Robert K.",
    role: "Retail Director · California",
    avatarCls: "bg-theme-accent",
  },
];

export function Reviews() {
  return (
    <section className="bg-white py-[72px] px-[5%]" aria-labelledby="reviews-title">
      <div className="text-center mb-[42px]">
        <p className="text-[11.5px] font-bold text-theme-primary uppercase tracking-[.1em] mb-2">
          Customer Reviews
        </p>
        <h2
          id="reviews-title"
          className="text-[32px] sm:text-[38px] font-black text-theme-dark leading-[1.05] mb-3 tracking-[-0.02em]"
        >
          Trusted by Thousands Across the USA
        </h2>
        <p className="text-[15px] text-theme-muted leading-[1.65] max-w-[580px] mx-auto">
          Real customers, verified reviews — here&apos;s what people say about working with
          On-Site Storage Solutions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[17px]">
        {REVIEWS.map((rev) => (
          <div
            key={rev.name}
            className="bg-theme-subtle border border-theme-border rounded-[8px] p-[21px]"
          >
            <div
              className="text-theme-primary text-[16px] tracking-[1.5px] mb-3"
              aria-label="5 stars"
            >
              ★★★★★
            </div>
            <blockquote className="text-[13.5px] text-theme-dark-2 leading-[1.65] mb-[15px] italic">
              &ldquo;{rev.quote}&rdquo;
            </blockquote>
            <div className="flex items-center gap-[10px]">
              <div
                className={`w-[37px] h-[37px] rounded-full text-[12.5px] font-extrabold flex items-center justify-center shrink-0 text-white ${rev.avatarCls}`}
                aria-hidden="true"
              >
                {rev.initials}
              </div>
              <div>
                <span className="text-[13.5px] font-bold block">{rev.name}</span>
                <span className="text-[12px] text-theme-muted">{rev.role}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-5 mt-[30px] py-[17px] px-4 bg-theme-subtle rounded-[7px] border border-theme-border flex-wrap">
        <div className="text-[38px] font-black text-theme-dark" aria-label="Rating: 4.9">
          4.9
        </div>
        <div>
          <div className="text-theme-primary text-[19px]" aria-label="5 stars">★★★★★</div>
          <span className="text-[12px] text-theme-muted">Based on verified customer reviews</span>
        </div>
        <div className="text-[13px] text-theme-muted max-w-[280px]">
          Join thousands of satisfied customers who&apos;ve trusted Onsite Storage since 2002.
        </div>
      </div>
    </section>
  );
}
