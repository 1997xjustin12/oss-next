/**
 * Google reviews shown on the homepage and the product page.
 *
 * Hardcoded rather than fetched: these are Google Business Profile reviews and
 * there is no integration pulling them yet. Both surfaces read from here so a
 * new review is added once rather than twice — the two lists had already begun
 * drifting as separate copies.
 */

/** Aggregate shown beside the star badge. Update alongside the list below. */
export const GOOGLE_REVIEW_STATS = {
  rating: 4.8,
  count: 151,
  /**
   * Where the review count links to.
   *
   * Placeholder. The site's Google Business Profile URL is not recorded
   * anywhere in this repo, so this points at the on-page section instead.
   * Replace it once someone can confirm the real listing — a wrong Google link
   * is worse than an anchor, because it sends people to another business.
   */
  url: '#reviews',
} as const

export type Review = {
  name: string;
  avatar: string;
  rating: number;
  date: string;
  text: string;
};

export const REVIEWS: Review[] = [
  {
    name: "Rachelle Madsen",
    avatar: "https://lh3.googleusercontent.com/a-/ALV-UjViDAckml0kqIwrAEHka3emkdkYKLkYBCPolcFzT-7AajumRAAI=w40-h40-c-rp-mo-br100",
    rating: 5,
    date: "May 14, 2025",
    text: "Great customer service, communication was on point and every question I had was answered. The container is amazing, delivery was fast and the driver was very skilled. Very easy transaction overall, I will be recommending my experience to others.",
  },
  {
    name: "Mark Cobb",
    avatar: "https://lh3.googleusercontent.com/a-/ALV-UjXCNBO0efT6YQJUrEd4iPt_ouIx7IFNa6Ynd5qTZ_y6XvsFcV_vew=w40-h40-c-rp-mo-ba5-br100",
    rating: 5,
    date: "May 13, 2025",
    text: "The whole On-Site Storage Solutions staff were great to work with, from my first phone call to the day of delivery. They were also $500 to $1000 less expensive than companies 200 miles closer to me. I highly recommend at least getting a quote from them.",
  },
  {
    name: "Nikunj Patel",
    avatar: "https://lh3.googleusercontent.com/a/ACg8ocLtPe7K3KiuQHfWIigxEqrkzGAsS7W97T0wqSLk_7ZrE8byJw=w40-h40-c-rp-mo-br100",
    rating: 5,
    date: "May 12, 2025",
    text: "Their service was good as they said.",
  },
  {
    name: "Andres Pena",
    avatar: "https://lh3.googleusercontent.com/a/ACg8ocJsxx9dGovPsPjaH_EaKgvTCqg3towJBDlwJlRR6Yvu_Im83w=w40-h40-c-rp-mo-br100",
    rating: 5,
    date: "May 2, 2025",
    text: "20ft Conex box. Came across the ad on Facebook marketplace, Rene was very responsive and helpful throughout the process. Always answered calls and emails all the way through delivery. On delivery day I was contacted by dispatcher and driver. Showed up when he said he'd be there and was very professional. Very satisfied and will be using them again.",
  },
  {
    name: "Raven Ramos",
    avatar: "https://lh3.googleusercontent.com/a-/ALV-UjXw0cddbBeAnWRu-rl6_WL9Ht_p7-Rlv7kIV59VCPSvsZ0InCdUmw=w40-h40-c-rp-mo-br100",
    rating: 5,
    date: "May 2, 2025",
    text: "Very clean storages, friendly service and the manager Sal was very knowledgeable on everything and was able to help me get the storage unit I was needing.",
  },
  {
    name: "P Ellison",
    avatar: "https://lh3.googleusercontent.com/a-/ALV-UjXZ5m9e3YLNULF9V2Jw6rv61dAztws8FtdF-PbPUX5F_G-0A6k=w40-h40-c-rp-mo-br100",
    rating: 5,
    date: "May 1, 2025",
    text: "It was a pleasure to do business with On Sight Storage Solutions. The purchase was easy and the post purchase communication was very good. Shout out to Genesis for arranging the delivery and a huge shout out to Warren who overcame adversity to deliver a 40 footer. He can do things with a truck and trailer I've never seen done. Thanks!",
  },
  {
    name: "Clay McAfee",
    avatar: "https://lh3.googleusercontent.com/a-/ALV-UjXtFg3oDswsjRUXxQiCwwd0xWA2vK0nTsRPSdptWlOgwf4bN8iF=w40-h40-c-rp-mo-ba2-br100",
    rating: 5,
    date: "April 28, 2025",
    text: "Mark Jamoner and the team at On-Site Storage Solutions were great to work with on this project. Communication was excellent and the price of their containers very competitive. Von Pigg who delivered the container was awesome as well.",
  },
  {
    name: "L McCray 54",
    avatar: "https://lh3.googleusercontent.com/a-/ALV-UjXUtFdRgTMTX408H03wOG7q0YnQsuuFeUn8tRs89QFHbMKLXxas=w40-h40-c-rp-mo-br100",
    rating: 4,
    date: "April 28, 2025",
    text: "Container arrived on time in great condition. Outside very clean. Inside freshly painted and floor clean and in excellent condition. Driver very professional, friendly, helpful, and was excellent at his job. Quick and easy drop off. Will consider purchasing again.",
  },
  {
    name: "Bill",
    avatar: "https://lh3.googleusercontent.com/a/ACg8ocIFABg7BoHS8WaSyWu-6ID4TrHbCMeHtn7eQNJucNnDtXwN=w40-h40-c-rp-mo-br100",
    rating: 5,
    date: "April 16, 2025",
    text: "Star and team did a great job!",
  },
  {
    name: "Jason",
    avatar: "https://lh3.googleusercontent.com/a/ACg8ocKEyNdmhad5ZZMjFW9HYxW4GEKNdkLNLtrHQXkF1hmy-V6naA=w40-h40-c-rp-mo-br100",
    rating: 5,
    date: "April 14, 2025",
    text: "Excellent experience from customer service (Star was exceptional) to the delivery driver and everyone involved. 5 stars ALL the way!!",
  },
];
