/**
 * Copy and media for /where-to-buy-shipping-containers below the featured
 * containers, carried over from the WordPress page it replaced (2026-10-26).
 * Edit here; the components only lay it out.
 */

const CDN = 'https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana'

export type ContentImage = { src: string; alt: string }

export type ContentCard = {
  title: string
  paragraphs: string[]
  image?: ContentImage
  /** Cards shown inside this one (the used grades). */
  children?: ContentCard[]
}

export const INSTANT_PRICING = {
  tagline: 'Get instant pricing now!',
  image: { src: `${CDN}/shipping-container-locationwebpbv_resized_ipadwebpbv_3rQAIWu.webp`, alt: 'Shipping container location' },
  heading: 'With more than 60 locations to serve you, we can offer the best shipping container prices.',
  body: 'Whether you need a storage container for your business or home, our team of experts can help find the perfect solution for your needs and budget. With convenient delivery options, our containers are of top quality and ready to use upon arrival.',
  locationsHeading: 'We Serve All 50 U.S. States And Canada',
} as const

export const SHIPPING_RATES = {
  heading: 'Save money with our lowest shipping rates',
  body: 'On-Site Storage Solutions has thousands of new and used containers for sale and rent. We make sure to find the nearest shipping container to your location in order to ensure you get the lowest cost of delivery. Choose On-Site Storage Solutions and enjoy unbeatable prices for a reliable and ready-to-use cargo shipping container today!',
  image: { src: `${CDN}/low-cost-shipping-containerswebpbv_resized_ipadwebpbv.webp`, alt: 'Low cost shipping containers' },
  options: [
    {
      title: 'Buy',
      body: 'We provide containers in a variety of conditions – new, used, and refurbished – and can accommodate any size from 10′ to 40′ and 45′ high cubes. Our large purchasing power allows us to guarantee the best pricing for our customers.',
    },
    {
      title: 'Rental',
      body: 'On-Site Storage Solutions is a leader in providing rental shipping containers for temporary or long-term needs, at the lowest rates available. Rental rates start as low as $99 a month (some areas may require sales tax). Just give us a call at (888) 977-9085, and we’ll walk you through the container rental process.',
    },
    {
      title: 'Rent-To-Own',
      body: 'On-Site Storage Solutions is proud to present a Rent-To-Own Option in partnership with My Container Rental. Select from our website the payment plans that suit you best – including 6, 12, 18, and 24 Months, as well as long-term programs.',
    },
  ],
} as const

export const CONTAINER_TYPES_CONTENT: ContentCard[] = [
  {
    title: 'Dry Storage Containers',
    paragraphs: [
      'Dry Storage Containers / Dry Van Containers are large metal containers commonly seen in ports and on cargo ships. Depending on their intended purpose, these shipping containers can come with different door configurations.',
    ],
    image: { src: `${CDN}/dry-van-shipping-containerswebpbv_resized_mobilewebpbv.webp`, alt: 'Dry van shipping containers' },
  },
  {
    title: 'Refrigerated Containers',
    paragraphs: [
      'Refrigerated Containers are containers often referred to as “reefers”, which are insulated and usually used for transporting items that require temperatures to be kept at a specific level. These containers usually come fitted with a refrigeration unit for controlling the temperature inside.',
    ],
    image: { src: `${CDN}/refrigerated-shipping-container-for-salewebpbv_resized_mobilewebpbv.webp`, alt: 'Refrigerated shipping container for sale' },
  },
  {
    title: 'Specialty Containers',
    paragraphs: [
      'Specialty Containers are specially designed for carrying items that cannot fit into the standard large metal containers. From transporting heavy machinery to liquids, these specialized containers come in various forms such as flat racks, open-top, and chassis, offering a flexible solution for every shipment requirement.',
    ],
    image: { src: `${CDN}/specialty-shipping-containerwebpbv_resized_mobilewebpbv.webp`, alt: 'Specialty shipping container' },
  },
]

/** The used grades the WordPress page described with their own pictures. */
export const USED_GRADES: ContentCard[] = [
  {
    title: 'Cargo Worthy',
    paragraphs: [
      'Cargo Worthy-graded containers are high-quality used containers that have been inspected and certified as viable for international maritime shipping, having no defects or damages that could compromise their structural integrity or their use in global cargo transportation.',
    ],
    image: { src: `${CDN}/cargo-worthy-shipping-containers-for-salewebpbv_resized_mobilewebpbv.webp`, alt: 'Cargo worthy shipping containers for sale' },
  },
  {
    title: '“As Is”',
    paragraphs: [
      'As-Is grade storage containers are usually the oldest and have been found to have damages that exceed $300. Generally, these containers are only recommended if they are used for purposes where structural soundness and appearance are not important such as storing building materials, automobile parts, and tools that won’t rust.',
    ],
    image: { src: `${CDN}/as-is-shipping-containers-for-salewebpbv_resized_mobilewebpbv.webp`, alt: 'As is shipping containers for sale' },
  },
]

export const CONTAINER_CONDITIONS: ContentCard[] = [
  {
    title: 'One Trip',
    paragraphs: [
      'One Trip containers are the highest quality units available. They have been named “One Tripper” due to their single-use transit between Asia and the United States.',
    ],
    image: { src: `${CDN}/one-trip-shipping-containerswebpbv_resized_mobilewebpbv.webp`, alt: 'One trip shipping containers' },
  },
  {
    title: 'Used',
    paragraphs: [
      'Our most popular container, used general purpose containers have been in heavy-duty shipping service for 5 to 15 years before being “retired.”',
      'Most used shipping containers will have the original paint and shipping line markings. The equipment will also show signs of wear and tear, such as surface rust, dents, and scratches.',
      'Used shipping containers might not look good on the outside and inside, but depending on their grade, they will be structurally sound and some may still be suitable for cargo transportation, storage solution, and more.',
      'Used shipping containers come in three grades: Cargo Worthy, Wind and Water Tight, and “As Is”.',
    ],
    // No picture of its own on the WordPress page: the grades below carry them.
    children: USED_GRADES,
  },
  {
    title: 'Refurbished',
    paragraphs: [
      'Refurbished containers are used Watertight WWT containers that have been repaired and modified in order to be suitable for a variety of purposes.',
    ],
    image: { src: `${CDN}/refurbished-shipping-containers-for-salewebpbv_resized_mobilewebpbv.webp`, alt: 'Refurbished shipping containers for sale' },
  },
]

export const WHERE_TO_BUY_VIDEO = { id: 'FHhyeGprAvQ', title: 'On-Site Storage Solutions shipping containers' } as const

export const WHERE_TO_BUY_FAQS = [
  {
    question: 'Where to buy shipping containers?',
    answer: 'While there are many options on where to buy shipping containers, On-Site Storage Solutions is a great company to consider. We offer both new and used containers for sale and for rent. We have over 60 depot locations across the United States and Canada.',
  },
  {
    question: 'Where can I buy old shipping containers?',
    answer: 'On-Site Storage Solutions offers a range of options including new, refurbished, used, or old shipping containers available for both purchase and rental. With depot locations spanning over 60 sites throughout the United States and Canada, we guarantee the most competitive delivery rates in the industry.',
  },
  {
    question: 'Where to buy used cargo containers?',
    answer: 'On-Site Storage Solutions is a reputable company that provides a wide selection of new and used cargo containers for sale and rental purposes. With an extensive network of 60 depot locations in the United States and Canada, they offer convenient options for customers seeking reliable storage solutions.',
  },
  {
    question: 'Who sells shipping containers near me?',
    answer: 'On-Site Storage Solutions is your go-to option for shipping containers conveniently located near you. With over 60+ locations throughout the United States and Canada, we provide easy access to high-quality storage solutions and are available with the most budget-friendly delivery rates.',
  },
  {
    question: 'Where can I buy a conex box?',
    answer: 'On-Site Storage Solutions offers a wide selection of affordable conex boxes for sale, rent, and rent-to-own options. With over 60+ locations in the United States and Canada, we specialize in providing containers that cater to various requirements.',
  },
] as const

export const TESTIMONIALS = [
  { quote: 'Star was able to answer all my questions and gave me certainty on the container I was getting. Was able to get a nice deal on the unit! Thanks so much. Highly recommended!', name: 'Kaye Nabaza' },
  { quote: 'I’m glad I was assisted by Gene. He’s very thorough and informative. Bought 4 20 ft last month for storage since we moved and no issues. Thank you!', name: 'Joanne Orpilla' },
  { quote: 'The online experience was good and Jhie handled with a 5 Star plus customer service! Delivery was within the time stated and the container arrived as described. Kudos to this outlet!', name: 'Aira Palaganas' },
  { quote: 'My sales agent Eloise was very patient with my queries and reassured me that my container of choice was perfect for my upcoming project. Thanks hun! xx', name: 'Regina Foz' },
] as const

/** The WordPress reviews page the "View All Reviews" button pointed at. */
export const ALL_REVIEWS_PATH = '/review-of-shipping-containers'
