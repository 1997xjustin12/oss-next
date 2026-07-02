export type HowItWorksStep = {
  n: number;
  title: string;
  desc: string;
  highlight: boolean;
};

export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    n: 1,
    title: "Choose Your Container",
    desc: "Browse sizes, conditions, and grades online — or call us for personalized guidance",
    highlight: true,
  },
  {
    n: 2,
    title: "Get a Free Quote",
    desc: "Instant transparent pricing on purchase, rental, or lease-to-own — no hidden fees",
    highlight: false,
  },
  {
    n: 3,
    title: "Confirm Your Order",
    desc: "Book with our experienced team — fast turnaround and clear communication guaranteed",
    highlight: false,
  },
  {
    n: 4,
    title: "We Deliver to You",
    desc: "Container delivered from the nearest of our 130+ depots right to your location",
    highlight: false,
  },
];
