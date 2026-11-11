/**
 * Every native location page except Atlanta (lib/data/locationPages.ts), one
 * record each, extracted from the WordPress page at the same URL on 2026-11-09
 * (docs/reference/location-pages.md, "Phase 3"). These records are now the
 * source: edit a record here (the configurator will take this over).
 *
 * A `text` entry is where that page's own words differ from the template's.
 */
import type { LocationPage } from '@/types/locationPage'

export const LOCATION_PAGE_RECORDS: readonly LocationPage[] = [
  {
    slug: "bakersfield-ca",
    depot: "Bakersfield, CA",
    depotId: 107,
    place: {
      city: "Bakersfield",
      region: "CA",
      regionName: "California",
      label: "Bakersfield, CA"
    },
    nearbyCities: [],
    mapImage: null,
    featured: {
      title: "Shipping Container Homes in Bakersfield",
      paragraphs: [
        "Inspired by their first foray into social entrepreneurship, the Wilsons are striving to repurpose empty shipping containers and transform them into homes for those experiencing homelessness. Their story began when they created \"weekend survival kits\" filled with food that over 100 homeless children pick up at school every Friday to take home to their families. Now, they have taken this mission a step further in an effort to make a lasting difference in the lives of others. With the support of the Maryland Food Bank, the Wilsons have established a backpack program and are now searching for associates to transform 40-foot-long cargo containers into homes.",
        "To make this dream come true, they've asked Jay Orr from ARQ Architects to create plans for a line of container modifications that will fit on what once were vacant row house foundations after their deconstruction or demolition by Baltimore City. The stability and movability these containers provide give them an edge ideal for such uses, yet with one condition they must be designed in such a way as not to draw attention to themselves being cargo boxes. After conducting extensive research, the Wilsons determined that they can convert cargo containers into homes for around $20,000 each. They want to provide families with a rent-to-own option when it comes to these container houses - not as temporary shelters but as permanent housing. To make this dream come true, they visited City Hall and spoke with officials about what would be required of them in order to start their project; happily receiving a positive response along with some helpful advice on partners that could help bridge the disparity between affordable housing needs within the city limits."
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/a-sustainable-solution-1024x576_RcxAHZA.webp",
        alt: "A Sustainable Solution",
        width: 800,
        height: 450
      }
    },
    news: {
      title: "Shipping Container 3-Star Kitchen in Bakersfield",
      paragraphs: [
        "When Thomas Keller and his team of architects, Envelope A+D, were pressed for time to build a stunning new kitchen for French Laundry's 20th-anniversary celebration, they came up with an inventive solution: cooking in shipping containers! Now one of the world's top restaurants is operating out of these structures. Four shipping containers artfully combined together, you'd almost think the restaurant had not gone through a single alteration. That is partially due to the fact that they managed to transition the prior kitchen's equipment layout in its entirety over to this new spot.",
        "David Breeden, Chef de Cuisine at French Laundry commented that his greatest difficulty was altering where each dish goes for final touches before being presented to guests; previously it ran from left to right while now it needs to go right-to-left. At first, it seemed impossible to close the restaurant for more than three months; however, six and then one year felt too long. After researching alternative venues, they realized that their current building already had a dining room - all they needed was a temporary kitchen. The architects came up with an innovative idea: utilizing shipping containers! Once the source of materials was secured and someone was available to modify them, their dream became a reality."
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/sustainability-and-efficiency-1024x576.webp",
        alt: "Sustainability and Efficiency",
        width: 1024,
        height: 576
      }
    },
    deliveredLead: [],
    seo: {
      title: "Shipping Containers for Sale Bakersfield CA | Lowest Prices",
      description: "Shop shipping containers for sale in Bakersfield, CA, with flexible options: buy, rent, or rent-to-own. Fast 5 to 7 days delivery. Call us!",
      ogImage: "https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2024/05/14063436/google-reviews.webp"
    },
    text: {
      buy: {
        heading: "Buy A Shipping Container In [[Bakersfield]] At the best price"
      }
    }
  },
  {
    slug: "baltimore-md-2",
    depot: "Baltimore, MD",
    depotId: 5,
    place: {
      city: "Baltimore",
      region: "MD",
      regionName: "Maryland",
      label: "Baltimore, MD"
    },
    nearbyCities: [
      {
        name: "Annapolis",
        href: "/shipping-container-storage-near-annapolis"
      },
      {
        name: "Baltimore",
        href: "/where-to-buy-shipping-containers/baltimore-md-2"
      },
      {
        name: "Bel Air",
        href: "/storage-units-bel-air-md"
      },
      {
        name: "Bethesda",
        href: "/extra-space-storage-bethesda"
      },
      {
        name: "Bowie",
        href: "/extra-space-storage-bowie-md"
      },
      {
        name: "Columbia",
        href: "/columbia-storage-containers"
      },
      {
        name: "Ellicott City",
        href: "/ellicott-city-storage"
      },
      {
        name: "Frederick",
        href: "/shipping-containers-for-sale-frederick-md"
      },
      {
        name: "Gaithersburg",
        href: "/storage-gaithersburg-md"
      },
      {
        name: "Germantown",
        href: "/storage-containers-germantown"
      },
      {
        name: "Glen Burnie",
        href: "/storage-glen-burnie"
      },
      {
        name: "Hagerstown",
        href: "/storage-containers-hagerstown-md"
      },
      {
        name: "Hyattsville",
        href: "/extra-space-storage-hyattsville-md"
      },
      {
        name: "Laurel",
        href: "/extra-space-storage-laurel"
      },
      {
        name: "Parkville",
        href: "/extra-space-storage-parkville-md"
      },
      {
        name: "Rockville",
        href: "/extra-space-storage-rockville-md"
      },
      {
        name: "Salisbury",
        href: "/container-storage-salisbury"
      },
      {
        name: "Silver Spring",
        href: "/extra-space-storage-silver-spring-md"
      },
      {
        name: "Upper Marlboro",
        href: "/storage-upper-marlboro-md"
      },
      {
        name: "Waldorf",
        href: "/extra-space-storage-waldorf-md"
      }
    ],
    mapImage: {
      src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/marland-2.webp",
      alt: "Map of the Baltimore, MD area",
      width: 517,
      height: 485
    },
    featured: {
      title: "Shipping Container Homes in Baltimore",
      paragraphs: [
        "Inspired by their first foray into social entrepreneurship, the Wilsons are striving to repurpose empty shipping containers and transform them into homes for those experiencing homelessness. Their story began when they created \"weekend survival kits\" filled with food that over 100 homeless children pick up at school every Friday to take home to their families. Now, they have taken this mission a step further in an effort to make a lasting difference in the lives of others. With the support of the Maryland Food Bank, the Wilsons have established a backpack program and are now searching for associates to transform 40-foot-long cargo containers into homes.",
        "To make this dream come true, they've asked Jay Orr from ARQ Architects to create plans for a line of container modifications that will fit on what once were vacant row house foundations after their deconstruction or demolition by Baltimore City. The stability and movability these containers provide give them an edge ideal for such uses, yet with one condition they must be designed in such a way as not to draw attention to themselves being cargo boxes. After conducting extensive research, the Wilsons determined that they can convert cargo containers into homes for around $20,000 each. They want to provide families with a rent-to-own option when it comes to these container houses - not as temporary shelters but as permanent housing. To make this dream come true, they visited City Hall and spoke with officials about what would be required of them in order to start their project; happily receiving a positive response along with some helpful advice on partners that could help bridge the disparity between affordable housing needs within the city limits."
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/a-sustainable-solution-1024x576_RcxAHZA.webp",
        alt: "A Sustainable Solution",
        width: 800,
        height: 450
      }
    },
    news: {
      title: "Shipping Container 3-Star Kitchen in Baltimore",
      paragraphs: [
        "When Thomas Keller and his team of architects, Envelope A+D, were pressed for time to build a stunning new kitchen for French Laundry's 20th-anniversary celebration, they came up with an inventive solution: cooking in shipping containers! Now one of the world's top restaurants is operating out of these structures. Four shipping containers artfully combined together, you'd almost think the restaurant had not gone through a single alteration. That is partially due to the fact that they managed to transition the prior kitchen's equipment layout in its entirety over to this new spot.",
        "David Breeden, Chef de Cuisine at French Laundry commented that his greatest difficulty was altering where each dish goes for final touches before being presented to guests; previously it ran from left to right while now it needs to go right-to-left. At first, it seemed impossible to close the restaurant for more than three months; however, six and then one year felt too long. After researching alternative venues, they realized that their current building already had a dining room - all they needed was a temporary kitchen. The architects came up with an innovative idea: utilizing shipping containers! Once the source of materials was secured and someone was available to modify them, their dream became a reality."
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/sustainability-and-efficiency-1024x576.webp",
        alt: "Sustainability and Efficiency",
        width: 800,
        height: 450
      }
    },
    deliveredLead: [],
    seo: {
      title: "Baltimore, MD 2 - OnsiteStorage",
      description: "We have the best prices on new and used shipping containers in Baltimore. Call us now for quick delivery or free pick up!",
      ogImage: "https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2024/05/14063436/google-reviews.webp"
    },
    text: {
      buy: {
        heading: "Buy A Shipping Container In [[Baltimore]] At the best price"
      }
    }
  },
  {
    slug: "calgary-ab",
    depot: "Calgary, AB",
    depotId: 6,
    place: {
      city: "Calgary",
      region: "AB",
      regionName: "Alberta",
      label: "Calgary, AB"
    },
    nearbyCities: [
      {
        name: "Red Deer",
        href: "/shipping-container-red-deer"
      },
      {
        name: "Calgary",
        href: "/sea-containers-calgary"
      },
      {
        name: "Edmonton",
        href: "/sea-containers-edmonton"
      },
      {
        name: "Lethbridge",
        href: "/storage-containers-lethbridge"
      },
      {
        name: "Medicine Hat",
        href: "/storage-containers-medicine-hat"
      },
      {
        name: "St. Albert",
        href: "/storage-units-st-albert"
      },
      {
        name: "Sherwood Park",
        href: "/storage-units-sherwood-park"
      },
      {
        name: "Grande Prairie",
        href: "/city-page-grande-prairie-ab"
      },
      {
        name: "Fort McMurray",
        href: "/storage-containers-fort-mcmurray"
      },
      {
        name: "Airdrie",
        href: "/storage-units-airdrie"
      },
      {
        name: "Spruce Grove",
        href: "/storage-units-spruce-grove"
      },
      {
        name: "Cochrane",
        href: "/storage-units-cochrane"
      },
      {
        name: "Camrose",
        href: "/storage-units-camrose"
      },
      {
        name: "Leduc",
        href: "/storage-units-leduc"
      },
      {
        name: "Fort Saskatchewan",
        href: "/storage-units-fort-saskatchewan"
      },
      {
        name: "Okotoks",
        href: "/storage-units-okotoks"
      },
      {
        name: "Brooks",
        href: "/storage-brooks"
      },
      {
        name: "Canmore",
        href: "/storage-units-canmore"
      },
      {
        name: "Cold Lake",
        href: "/storage-unit-cold-lake"
      },
      {
        name: "Wetaskiwin",
        href: "/wetaskiwin-storage"
      }
    ],
    mapImage: {
      src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/calgary-6723232b23a1e.webp",
      alt: "Map of the Calgary, AB area",
      width: 629,
      height: 558
    },
    featured: {
      title: "Shipping Container Bar Calgary",
      paragraphs: [
        "Have you taken a stroll along Kensington Road lately? If so, you may have noticed an alley that is unlike any other in Calgary Container Bar! This extraordinary outdoor patio has been crafted from recycled furniture and features a stunning shipping container set at its heart. Not only does it provide the perfect setting for socializing with friends but also serves as an inspiring reminder of what can be achieved when we work together to recycle materials and create something truly special. Dobranski and Leslie embarked on their journey of constructing a Container Bar by buying a shipping container in Calgary’s southwest.",
        "However, this was only the start of a nine-month-long process that proved to be just as meticulous as building any traditional restaurant from scratch! It is also worth noting that it has never been solely the two men working on this project; many people have invested time and effort into making Container Bar what it is today. You can escape the daily hustle and bustle of Calgary with a visit to Container Bar. With a laid-back vibe reminiscent of beachside bars in faraway cities like Melbourne or Bali, you can enjoy some delicious food from Brasserie’s condensed menu, including sandwiches and salads at affordable prices. Plus, soak up the sun rays during your lunch break by lounging in our alleyway – no need for vacation days here!"
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/shipping-container-bar-calgary-1024x682.webp",
        alt: "Shipping Container Bar Calgary",
        width: 800,
        height: 532
      }
    },
    news: {
      title: "Calgary Shipping Container Rental Property",
      paragraphs: [
        "When Laurenne Mercier decided to move into her own place in early 2021, she realized that renting a traditional house would not be practical for her. Then, serendipity occurred: while on a walk in Killarney with her mother, they passed by an ad for the perfect rental property Calgary’s first laneway house completely constructed with shipping containers. Unbeknownst to them both at the time, it was only moments away from becoming Mercier’s new home!",
        "For Chad Saunders, the owner of a residential property, creating value in his yard without compromising its use was always on his mind. To fulfill this vision, he turned shipping containers and constructed an entire laneway house from three separate units that were completely fabricated on-site. He wanted tenants to be able to enjoy their own space while also sharing access to his family’s backyard; thus ensuring everyone could feel at home within the same area!"
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/shipping-container-house-rental-in-calgary-1024x576.webp",
        alt: "shipping container house rental in calgary",
        width: 800,
        height: 450
      }
    },
    deliveredLead: [],
    seo: {
      title: "Calgary Shipping Containers | Top Quality & Best Pricing",
      description: "We have the best prices on new and used shipping containers in Calgary. Call us now for quick delivery or free pick up!",
      ogImage: "https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2024/05/14063436/google-reviews.webp"
    }
  },
  {
    slug: "charleston-sc",
    depot: "Charleston, SC",
    depotId: 7,
    place: {
      city: "Charleston",
      region: "SC",
      regionName: "South Carolina",
      label: "Charleston, SC"
    },
    nearbyCities: [
      {
        name: "Aiken",
        href: "/all-city/storage-units-aiken-sc"
      },
      {
        name: "Florence",
        href: "/all-city/storage-units-florence-sc"
      },
      {
        name: "Mount Pleasant",
        href: "/all-city/storage-units-mount-pleasant-sc"
      },
      {
        name: "Summerville",
        href: "/all-city/storage-units-summerville-sc"
      },
      {
        name: "Anderson",
        href: "/all-city/storage-units-anderson-sc"
      },
      {
        name: "Fort Mill",
        href: "/all-city/storage-units-fort-mill-sc"
      },
      {
        name: "Myrtle Beach",
        href: "/all-city/storage-myrtle-beach-sc"
      },
      {
        name: "Sumter",
        href: "/all-city/storage-units-sumter-sc"
      },
      {
        name: "Charleston",
        href: "/all-city/steel-shipping-containers-charleston-sc"
      },
      {
        name: "Greenville",
        href: "/all-city/storage-units-greenville-sc"
      },
      {
        name: "North Charleston",
        href: "/all-city/storage-units-north-charleston-sc"
      },
      {
        name: "Columbia",
        href: "/all-city/storage-units-columbia-sc"
      },
      {
        name: "Greenwood",
        href: "/all-city/storage-units-greenwood-sc"
      },
      {
        name: "Rock Hill",
        href: "/all-city/storage-unit-rock-hill-sc"
      },
      {
        name: "Conway",
        href: "/all-city/storage-units-conway-sc"
      },
      {
        name: "Greer",
        href: "/all-city/extra-space-storage-greer-sc"
      },
      {
        name: "Simpsonville",
        href: "/all-city/storage-units-simpsonville-sc"
      },
      {
        name: "Easley",
        href: "/all-city/storage-units-easley-sc"
      },
      {
        name: "Lexington",
        href: "/all-city/storage-units-lexington-sc"
      },
      {
        name: "Spartanburg",
        href: "/all-city/storage-units-spartanburg-sc"
      }
    ],
    mapImage: {
      src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/charleston-671b361c3e237.webp",
      alt: "Map of the Charleston, SC area",
      width: 591,
      height: 588
    },
    featured: {
      title: "Charleston Shipping Container Restaurants",
      paragraphs: [
        "Charlestonians have wholeheartedly welcomed the food truck concept, with its indulgent choices ranging from vegan doughnuts to steamed pork buns that are sure to tantalize taste buds. Container Bar is a manifestation of this dream: an idea conceived by Bill Murray, Brad Creger, and Mike Veeck of Rutledge Cab Co., it offers delightful drinks complemented by diverse cuisine and live music producing the perfect atmosphere for savoring good eats! Adorning the outdoor patio are vibrant palm trees, creating an iconic coastal atmosphere.",
        "The bar itself is a stunning feat – sembled from three shipping containers and a former auto body shop and painted in a striking reddish-orange with contrasting black roofing. You won’t find another establishment quite like this one on the peninsula! Plus, up to five food trucks make daily stops here making it the optimal spot for locals looking to try fresh locally sourced dishes. The Container Bar is truly incomparable! Nothing beats enjoying a refreshing craft beer and indulging in delicious new food offerings at The Container Bar, located at 2130 Mount Pleasant Street. Surrounded by outdoor tables with umbrellas for shade, you’ll be able to sample the diverse selection of dishes as well as bask in the sounds of talented local musicians ready to captivate guests. Don’t miss out on this unique experience!"
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/container-bar-charleston-sc.webp",
        alt: "Charleston Shipping Container Restaurants",
        width: 800,
        height: 600
      }
    },
    news: {
      title: "Shipping Container House in Charleston",
      paragraphs: [
        "Jaimie and Dave desired to live a liberated life without the weight of debt, so they crafted their dream home with two shipping containers. One 40 feet container was placed on the ground, while another 20 feet container was stacked onto it creating an incredible tiny house! With some land in hand and savings tucked away, this couple decided that building a shipping container dwelling would be cheaper than taking out a loan or mortgage. The couple took matters into their own hands by constructing this alternative living space themselves; no professionals were needed as they had all of the skills necessary!",
        "After years of toil and tribulation, the couple transformed their property into a stunning abode. Not only did they landscape it, but also constructed with shipping containers an eye-catching home as well as an extensive workshop. Now these two have somewhere extraordinary that is all there’s a place to call their own. From the dazzling ornaments to the luxurious wood floor, every inch of their home is tastefully decorated. The kitchen was equipped with all the necessary tools and a large glass window that offers natural light throughout the day helping save on electricity bills! Additionally, there is a fireplace for both heating purposes and creating an inviting atmosphere, perfect for cuddling up with hot chocolate or coffee during cold winter nights."
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/shipping-container-house-charleston-scwebpbv_resized_ipadwebpbv.webp",
        alt: "shipping container house charleston sc",
        width: 800,
        height: 600
      }
    },
    deliveredLead: [],
    seo: {
      title: "Shipping Containers for Sale Charleston SC | Reliable & Secure",
      description: "Looking for shipping containers for sale Charleston SC? Choose from new or used containers, built strong and delivered to your site quickly.",
      ogImage: "https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2024/05/14063436/google-reviews.webp"
    }
  },
  {
    slug: "charlotte-nc",
    depot: "Charlotte, NC",
    depotId: 8,
    place: {
      city: "Charlotte",
      region: "NC",
      regionName: "North Carolina",
      label: "Charlotte, NC"
    },
    nearbyCities: [
      {
        name: "Asheville",
        href: "/all-city/shipping-container-asheville-nc"
      },
      {
        name: "Durham",
        href: "/all-city/shipping-containers-durham"
      },
      {
        name: "High Point",
        href: "/all-city/storage-units-high-point-nc"
      },
      {
        name: "Wilmington",
        href: "/all-city/shipping-containers-for-sale-wilmington-nc"
      },
      {
        name: "Burlington",
        href: "/all-city/portable-storage-burlington"
      },
      {
        name: "Fayetteville",
        href: "/all-city/portable-storage-fayetteville-nc"
      },
      {
        name: "Jacksonville",
        href: "/all-city/storage-containers-jacksonville-nc"
      },
      {
        name: "Winston Salem",
        href: "/all-city/shipping-containers-for-sale-winston-salem-nc"
      },
      {
        name: "Cary",
        href: "/all-city/storage-units-cary-nc"
      },
      {
        name: "Gastonia",
        href: "/all-city/shipping-containers-gastonia-nc"
      },
      {
        name: "Lexington",
        href: "/all-city/storage-units-lexington-nc"
      },
      {
        name: "Chapel Hill",
        href: "/all-city/storage-units-chapel-hill"
      },
      {
        name: "Greensboro",
        href: "/all-city/shipping-containers-for-sale-greensboro-nc"
      },
      {
        name: "Monroe",
        href: "/all-city/storage-units-monroe-nc"
      },
      {
        name: "Charlotte",
        href: "/all-city/steel-shipping-containers-charlotte-nc"
      },
      {
        name: "Greenville",
        href: "/all-city/storage-units-greenville-nc"
      },
      {
        name: "Raleigh",
        href: "/all-city/cargo-containers-for-sale-raleigh-nc"
      },
      {
        name: "Concord",
        href: "/all-city/storage-units-concord-nc"
      },
      {
        name: "Hickory",
        href: "/all-city/shipping-containers-for-sale-hickory-nc"
      },
      {
        name: "Salisbury",
        href: "/all-city/storage-units-salisbury-nc"
      }
    ],
    mapImage: {
      src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/charlotte-nc.webp",
      alt: "Map of the Charlotte, NC area",
      width: 587,
      height: 586
    },
    featured: {
      title: "Shipping Container Restaurants in Charlotte",
      paragraphs: [
        "SOUTHBOUND, the new eatery from Mac’s Speed Shop’s team of restaurant aficionados, is brimming with a delightful and vibrant color palette. Oranges in all their luminous hues combined with an array of blues will create the perfect atmosphere for indulging in its California-inspired Baja menu. Chef Kevin Kuruc was inspired to create the Southern California-style menu for SouthBound, on South Boulevard next to Mac’s original location, when he came across an old 1970s image of a skateboarder passing by two beachgoers. In order to bring his vision to fruition, Kuruc traveled out west and sampled over a dozen tacos in one day!",
        "Thus equipped with all this delicious inspiration from San Diego’s street food scene, he returned home ready to put together the perfect Baja/SoCal menu at SouthBound. Now this same mural is proudly displayed as part of the building itself. The hallmark of Southern Californian cuisine is its freshness and Mexican flavor, so SouthBound will be no exception. With ten mouthwatering tacos on the menu (plus a vegetarian option!), almost all featuring cabbage lightly drizzled with lime juice and olive oil, you’ll have plenty of delicious options to choose from! But that’s not all: in the center of our restaurant which seats up to 240 people, there will also be a self-serve salsa bar hosting six different levels of heat – ranging from mild to ‘stay away’ hot – as well as two other sauces featured directly onto the menu. And if that wasn’t enough? The drinks selection promises something for everyone; we know it will make an excellent complement to your meal!"
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/southbound-shipping-container-restaurant-1024x683.webp",
        alt: "southbound shipping container restaurant",
        width: 800,
        height: 533
      }
    },
    news: {
      title: "Shipping Container Homes in Charlotte",
      paragraphs: [
        "Surrounded by the vibrant October sun and nestled in the “armpit of Central Piedmont Community College” lies D.I. von Briesen’s towering abode–a shipping container he skillfully converted himself, which is illuminated gracefully by a lozenge-shaped window atop its beige facade. Upon closer inspection, one will find an array of solar panels on its roof as well as the dirt beneath it; truly making this breathtaking building not only energy efficient but also embedded in nature itself!",
        "For 44-year-old D.I., a Web Technologies instructor at CPCC, the container is more than just an idea– it’s an experience. Not only has this prototype home consumed 5 years of his time and energy, but it also reflects D.I. ‘s passion for alternative forms of housing that was sparked by growing up in a New Mexico commune with limited private space. A melding of interests and ambition, the shipping container makes possible what once seemed impossible: providing safe shelter without taking away independence or privacy from its inhabitant(s)."
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/shipping-container-house-charlotte.webp",
        alt: "shipping container house charlotte",
        width: 655,
        height: 437
      }
    },
    deliveredLead: [],
    seo: {
      title: "Shipping Container For Sale Charlotte NC | Low Prices Guaranteed",
      description: "Shipping container for sale Charlotte NC. Lowest prices, money-back guarantee, quick delivery. Get your container now. Call us now!",
      ogImage: "https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2024/05/14063436/google-reviews.webp"
    }
  },
  {
    slug: "chicago-il",
    depot: "Chicago, IL",
    depotId: 9,
    place: {
      city: "Chicago",
      region: "IL",
      regionName: "Illinois",
      label: "Chicago, IL"
    },
    nearbyCities: [
      {
        name: "Arlington Heights",
        href: "/all-city/storage-units-arlington-heights"
      },
      {
        name: "Cicero",
        href: "/all-city/cicero-storage-units"
      },
      {
        name: "Naperville",
        href: "/all-city/storage-units-naperville"
      },
      {
        name: "Springfield",
        href: "/all-city/shipping-containers-springfield"
      },
      {
        name: "Aurora",
        href: "/all-city/storage-containers-aurora"
      },
      {
        name: "Decatur",
        href: "/all-city/decatur-storage-containers"
      },
      {
        name: "Palatine",
        href: "/all-city/storage-units-palatine"
      },
      {
        name: "Waukegan",
        href: "/all-city/waukegan-storage-unit"
      },
      {
        name: "Belleville",
        href: "/all-city/storage-unit-in-belleville"
      },
      {
        name: "Des Plaines",
        href: "/all-city/storage-units-des-plaines"
      },
      {
        name: "Peoria",
        href: "/all-city/shipping-containers-for-sale-peoria-il"
      },
      {
        name: "Bloomington",
        href: "/all-city/shipping-containers-bloomington-il"
      },
      {
        name: "Elgin",
        href: "/all-city/elgin-container-storage"
      },
      {
        name: "Plainfield",
        href: "/all-city/plainfield-storage-units"
      },
      {
        name: "Champaign",
        href: "/all-city/storage-units-champaign-il"
      },
      {
        name: "Evanston",
        href: "/all-city/storage-units-evanston"
      },
      {
        name: "Rockford",
        href: "/all-city/storage-containers-rockford-il"
      },
      {
        name: "Chicago",
        href: "/all-city/shipping-cargo-containers-for-sale-in-chicago"
      },
      {
        name: "Joliet",
        href: "/all-city/joliet-storage-units"
      },
      {
        name: "Schaumburg",
        href: "/all-city/storage-units-schaumburg"
      }
    ],
    mapImage: {
      src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/chicago.webp",
      alt: "Map of the Chicago, IL area",
      width: 675,
      height: 563
    },
    featured: {
      title: "Chicago Shipping Container Marketplace",
      paragraphs: [
        "With Boxville, small businesses and entrepreneurs are able to try out their products or services in a short-term space before deciding on a permanent location. Partners also receive the necessary training and coaching they require for success: financial guidance, business development expertise, and marketing advice. Open all year round and boasting up to seventeen businesses, Boxville is the go-to destination for unique and delectable cuisine. Whether it’s Caribbean delicacies, fresh coffee, or Inca Fusion – a local favorite – Boxville has something tasty on offer for everyone.",
        "For those craving, something extra special, they serve scrumptious dishes like braised short rib mac & cheese or crawfish etouffee. At Boxville, commerce and community come together. Not only does the marketplace host local businesses, but it also has spaces for fitness classes that are free of charge as well as “Neighborhood Square” events where residents can gather to converse, listen to music, and dance. This area is a beacon for all in the surrounding neighborhood!"
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/boxville-chicago-1024x632.webp",
        alt: "Chicago Shipping Container Marketplace",
        width: 800,
        height: 493
      }
    },
    news: {
      title: "Shipping Container Gym in Chicago",
      paragraphs: [
        "In response to the challenges posed by the Covid-19 pandemic, a Chicago-based startup named BOLD is reimagining the future of gyms. They’ve designed a unique, compact gym concept using 320-square-foot shipping containers. This innovative approach enables individuals to work out using top-notch equipment while maintaining cleanliness and social distancing. BOLD’s inventive solution offers a private and secure space for fitness enthusiasts.",
        "BOLD has teamed up with Sterling Bay, a prominent real estate developer in Chicago, to launch its pioneering modular training facility. The first of its kind will be set up at 1000 W. Carroll Ave., located in the bustling Fulton Market area. This collaboration marks a significant step towards providing accessible and safe workout environments, tailored to meet the demands of the current health-conscious era."
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/shipping-container-gym-bold-chicago-1024x768.webp",
        alt: "shipping container gym bold chicago",
        width: 800,
        height: 600
      }
    },
    deliveredLead: [],
    seo: {
      title: "Shipping Containers For Sale Chicago | Lowest Container Prices",
      description: "At the most affordable pricing, we have a huge selection of shipping containers for sale in Chicago. Get your container now!",
      ogImage: "https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2024/05/14063436/google-reviews.webp"
    },
    text: {
      products: {
        heading: "Explore our top-selling shipping containers for sale in [[Chicago, IL]]"
      },
      buy: {
        heading: "Buy A Shipping Container for Sale in [[Chicago, IL]] At the best price"
      }
    }
  },
  {
    slug: "cincinnati-oh",
    depot: "Cincinnati, OH",
    depotId: 10,
    place: {
      city: "Cincinnati",
      region: "OH",
      regionName: "Ohio",
      label: "Cincinnati, OH"
    },
    nearbyCities: [
      {
        name: "Akron",
        href: "/all-city/storage-units-akron-oh"
      },
      {
        name: "Dublin",
        href: "/all-city/storage-dublin-oh"
      },
      {
        name: "Massillon",
        href: "/all-city/storage-units-in-massillon-oh"
      },
      {
        name: "Westerville",
        href: "/all-city/storage-westerville-oh"
      },
      {
        name: "Canton",
        href: "/all-city/storage-units-in-canton-oh"
      },
      {
        name: "Elyria",
        href: "/all-city/storage-units-elyria-oh"
      },
      {
        name: "Medina",
        href: "/all-city/storage-units-medina-oh"
      },
      {
        name: "Youngstown",
        href: "/all-city/storage-units-youngstown-oh"
      },
      {
        name: "Cincinnati",
        href: "/all-city/metal-storage-containers-cincinnati"
      },
      {
        name: "Hamilton",
        href: "/all-city/extra-space-storage-hamilton-oh"
      },
      {
        name: "Middletown",
        href: "/all-city/extra-space-storage-middletown-oh"
      },
      {
        name: "Cleveland",
        href: "/all-city/cleveland-steel-container"
      },
      {
        name: "Lima",
        href: "/all-city/lima-oh-storage-units"
      },
      {
        name: "Springfield",
        href: "/all-city/storage-units-springfield-oh"
      },
      {
        name: "Columbus",
        href: "/all-city/cargo-storage-columbus-ohio"
      },
      {
        name: "Lorain",
        href: "/all-city/storage-in-lorain-oh"
      },
      {
        name: "Toledo",
        href: "/all-city/storage-units-toledo-oh"
      },
      {
        name: "Dayton",
        href: "/all-city/storage-dayton-oh"
      },
      {
        name: "Mansfield",
        href: "/all-city/mansfield-oh-storage-units"
      },
      {
        name: "Warren",
        href: "/all-city/warren-portable-storage-containers"
      }
    ],
    mapImage: {
      src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/cincinnati.webp",
      alt: "Map of the Cincinnati, OH area",
      width: 709,
      height: 560
    },
    featured: {
      title: "Shipping Container Creative Space in Cincinnati",
      paragraphs: [
        "Believe it or not, one of the most remarkable bars in Over-the-Rhine is scarcely visible. We are talking about Mecca! When this bar opened up back in 2016, you’d need a secret code to locate it. To call Mecca a creative use of space is an understatement. Before, it resembled nothing more than a forgotten cargo-worthy shipping container in the middle of nowhere.",
        "However, thanks to Cheapside’s team, it has been transformed into something truly extraordinary – adorned with vibrant murals and gorgeous plants that are illuminated by neon lights! Not only are the hanging plants aesthetically pleasing, but they also create oxygen, making those evenings particularly pleasant. You’ll need that extra breath of fresh air too when you take in all the incredible art found at this locale – its famous Instagrammable bathrooms and backlit murals will leave you speechless! This is an ideal spot for artists and creative-minded individuals; with doodles adorning every table."
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/mecca-shipping-container-cincinnati.webp",
        alt: "mecca shipping container cincinnati",
        width: 648,
        height: 365
      }
    },
    news: {
      title: "Shipping Container Home in Cincinnati",
      paragraphs: [
        "Habitat for Humanity of Greater Cincinnati proudly hosted an open house to showcase their remarkable 40-foot shipping container home. A 320-square-foot living space with a bedroom, living room, kitchen, and bathroom is sustainably heated & cooled by an energy-efficient mini-split heat pump. Foam insulation and drywall line the walls of this container home for additional comfort at incredibly low electric bills (less than $20/month) plus monthly mortgage payments of only $120. They also showed other projects that demonstrate how shipping containers can be recycled and reused in creative ways.",
        "Everyone got an inside look at a variety of shipping container homes and the potential they have to provide affordable housing solutions. For over three decades, Habitat for Humanity of Greater Cincinnati has worked tirelessly to construct, renew or fix more than 550 homes in the area. Not only that; they have also provided their families with the necessary instruction and resources needed to better their shelter situation. To this day, they are still dedicatedly to searching for cost-efficient solutions to help even more deserving families."
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/shipping-container-home-cincinnati.webp",
        alt: "shipping container home cincinnati",
        width: 750,
        height: 423
      }
    },
    deliveredLead: [],
    seo: {
      title: "Shipping Containers for Sale Cincinnati | Buy, Rent, Rent-to-Own",
      description: "Shipping containers for sale Cincinnati. Buy, rent, or rent-to-own new and used units with fast delivery and affordable prices. Call us now!",
      ogImage: "https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2024/05/14063436/google-reviews.webp"
    }
  },
  {
    slug: "cleveland-oh",
    depot: "Cleveland, OH",
    depotId: 11,
    place: {
      city: "Cleveland",
      region: "OH",
      regionName: "Ohio",
      label: "Cleveland, OH"
    },
    nearbyCities: [
      {
        name: "Akron",
        href: "/all-city/storage-units-akron-oh"
      },
      {
        name: "Dublin",
        href: "/all-city/storage-dublin-oh"
      },
      {
        name: "Massillon",
        href: "/all-city/storage-units-in-massillon-oh"
      },
      {
        name: "Westerville",
        href: "/all-city/storage-westerville-oh"
      },
      {
        name: "Canton",
        href: "/all-city/storage-units-in-canton-oh"
      },
      {
        name: "Elyria",
        href: "/all-city/storage-units-elyria-oh"
      },
      {
        name: "Medina",
        href: "/all-city/storage-units-medina-oh"
      },
      {
        name: "Youngstown",
        href: "/all-city/storage-units-youngstown-oh"
      },
      {
        name: "Cincinnati",
        href: "/all-city/metal-storage-containers-cincinnati"
      },
      {
        name: "Hamilton",
        href: "/all-city/extra-space-storage-hamilton-oh"
      },
      {
        name: "Middletown",
        href: "/all-city/extra-space-storage-middletown-oh"
      },
      {
        name: "Cleveland",
        href: "/all-city/cleveland-steel-container"
      },
      {
        name: "Lima",
        href: "/all-city/lima-oh-storage-units"
      },
      {
        name: "Springfield",
        href: "/all-city/storage-units-springfield-oh"
      },
      {
        name: "Columbus",
        href: "/all-city/cargo-storage-columbus-ohio"
      },
      {
        name: "Lorain",
        href: "/all-city/storage-in-lorain-oh"
      },
      {
        name: "Toledo",
        href: "/all-city/storage-units-toledo-oh"
      },
      {
        name: "Dayton",
        href: "/all-city/storage-dayton-oh"
      },
      {
        name: "Mansfield",
        href: "/all-city/mansfield-oh-storage-units"
      },
      {
        name: "Warren",
        href: "/all-city/warren-portable-storage-containers"
      }
    ],
    mapImage: {
      src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/cleveland.webp",
      alt: "Map of the Cleveland, OH area",
      width: 577,
      height: 588
    },
    featured: {
      title: "Affordable Shipping Container Housing in Cleveland",
      paragraphs: [
        "A home is one of the biggest investments many people ever make, and Derrick Childs says he’s found an unconventional way to make that life goal a little more accessible. As Childs toured a sample unit, he remarked: “It is designed with all the comforts of the home – kitchen, bath, living room, and bedroom. This model is one of our smaller designs; perfect for only one or two people composed from just an individual shipping container which demonstrates what sort of amenities are attainable.”",
        "According to Childs, the utilization of containers as walls cut down significantly on both cost and time spent when compared to more conventional house-building methods. Despite an absence of binding agreements, local development entities have indicated to News 5 that container homes may one day be a crucial piece in repurposing land and providing more individuals the opportunity to own their dwellings. Similar to regular houses, mortgages can be obtained for these structures as well – they are subject to all customary protocols when it comes to building regulations."
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/container-homes-cleveland-1024x1024.webp",
        alt: "container homes cleveland",
        width: 800,
        height: 800
      }
    },
    news: {
      title: "Cleveland Shipping Container Homes",
      paragraphs: [
        "Developers have been granted schematic approval for the construction of eight container homes, using recycled shipping containers, to occupy vacant lots on the adjacent block in Cleveland. The result will be a 64-unit apartment complex built on E. 72nd Street! Four distinct and remarkable designs are available for the container homes proposed to be built on E. 73rd Street – a duplex, triplex, eye-catching alternative facade triplex, and ADA-compliant duplex!",
        "The City of Cleveland’s Department of Building and Housing has been working with developers on this project for several months. Developers hope to use shipping containers to help make home ownership more affordable in areas throughout Cleveland that have traditionally seen higher prices for housing. Cleveland’s WRJ Developers Inc. and Detroit, Michigan-based Three Squared Inc. have partnered to create the first mixed-income apartment complex in Ohio built with abstainers – a concept originating on E 72nd Street where modular containers are transformed into standalone homes."
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/cleveland-shipping-container-house.webp",
        alt: "Cleveland Shipping Container Homes",
        width: 800,
        height: 449
      }
    },
    deliveredLead: [],
    seo: {
      title: "Shipping Container For Sale Cleveland | Top Quality & Low Prices",
      description: "Shipping container for sale Cleveland. Onsite storage has the lowest prices! For great discounts, give us a call now!",
      ogImage: "https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2024/05/14063436/google-reviews.webp"
    }
  },
  {
    slug: "columbus-oh",
    depot: "Columbus, OH",
    depotId: 12,
    place: {
      city: "Columbus",
      region: "OH",
      regionName: "Ohio",
      label: "Columbus, OH"
    },
    nearbyCities: [
      {
        name: "Akron",
        href: "/all-city/storage-units-akron-oh"
      },
      {
        name: "Dublin",
        href: "/all-city/storage-dublin-oh"
      },
      {
        name: "Massillon",
        href: "/all-city/storage-units-in-massillon-oh"
      },
      {
        name: "Westerville",
        href: "/all-city/storage-westerville-oh"
      },
      {
        name: "Canton",
        href: "/all-city/storage-units-in-canton-oh"
      },
      {
        name: "Elyria",
        href: "/all-city/storage-units-elyria-oh"
      },
      {
        name: "Medina",
        href: "/all-city/storage-units-medina-oh"
      },
      {
        name: "Youngstown",
        href: "/all-city/storage-units-youngstown-oh"
      },
      {
        name: "Cincinnati",
        href: "/all-city/metal-storage-containers-cincinnati"
      },
      {
        name: "Hamilton",
        href: "/all-city/extra-space-storage-hamilton-oh"
      },
      {
        name: "Middletown",
        href: "/all-city/extra-space-storage-middletown-oh"
      },
      {
        name: "Cleveland",
        href: "/all-city/cleveland-steel-container"
      },
      {
        name: "Lima",
        href: "/all-city/lima-oh-storage-units"
      },
      {
        name: "Springfield",
        href: "/all-city/storage-units-springfield-oh"
      },
      {
        name: "Columbus",
        href: "/all-city/cargo-storage-columbus-ohio"
      },
      {
        name: "Lorain",
        href: "/all-city/storage-in-lorain-oh"
      },
      {
        name: "Toledo",
        href: "/all-city/storage-units-toledo-oh"
      },
      {
        name: "Dayton",
        href: "/all-city/storage-dayton-oh"
      },
      {
        name: "Mansfield",
        href: "/all-city/mansfield-oh-storage-units"
      },
      {
        name: "Warren",
        href: "/all-city/warren-portable-storage-containers"
      }
    ],
    mapImage: {
      src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/columbus-oh.webp",
      alt: "Map of the Columbus, OH area",
      width: 591,
      height: 590
    },
    featured: {
      title: "Wendy’s Shipping Container Kitchens",
      paragraphs: [
        "Wendy’s, a popular fast-food chain, is trying something new by using shipping containers to build some of their restaurants. This cool idea helps the environment because it uses recycled materials and can be set up in different places easily, even where regular buildings might not fit. Wendy’s is doing this to make their business better for the planet and to serve customers in new ways, like making food just for delivery or pick-up without needing space for people to sit and eat.",
        "They plan to open 700 of these special kitchens by 2025 to reach more people. Wendy’s is also finding fun ways to sell their famous Frosty desserts outside of their restaurants, like setting up carts at zoos. This shows Wendy’s is thinking creatively about how to meet their customers’ needs while being kind to the environment. By doing things differently, Wendy’s is leading the way in making fast food more modern and eco-friendly."
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/wendys-shipping-container.webp",
        alt: "wendys shipping container",
        width: 800,
        height: 751
      }
    },
    news: {
      title: "Shipping Container Cabin in Columbus",
      paragraphs: [
        "After Becky Wolff and her husband Bill Echols experienced a devastating break-in at their Vinton County weekend camper, where the thieves even managed to steal the toilet, they gave up on their plan of constructing an A-frame cabin. In search of something more secure for storing valuable items, they ventured to a rail yard in Obetz and stumbled upon shipping containers as the perfect solution.",
        "The Columbus pair had three vessels shipped to their lot that spanned 12 acres located near South Bloomingville. One measly one, spanning 20 feet was solely utilized as a storage shed while the other two were much more extravagant – they each measured 40 feet in length, 8 feet wide, and 9 1/2 ft tall so they could turn it into an opulent cabin retreat! Throughout the spring and summer, Echols left the containers on their lot while he created a diamond pier foundation from steel posts as an alternative to solid concrete."
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/rural-cabin-shipping-container.webp",
        alt: "rural cabin shipping container",
        width: 599,
        height: 299
      }
    },
    deliveredLead: [],
    seo: {
      title: "Shipping Containers for Sale Columbus Ohio | Buy or Rent Deals",
      description: "Explore new & used shipping containers for sale in Columbus, Ohio. Flexible purchase or rental options. Contact us to get a free quote!",
      ogImage: "https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2024/05/14063436/google-reviews.webp"
    }
  },
  {
    slug: "dallas-tx",
    depot: "Dallas, TX",
    depotId: 13,
    place: {
      city: "Dallas",
      region: "TX",
      regionName: "Texas",
      label: "Dallas, TX"
    },
    nearbyCities: [
      {
        name: "Amarillo",
        href: "/all-city/shipping-containers-for-sale-in-amarillo-texas"
      },
      {
        name: "El Paso",
        href: "/all-city/cargo-containers-for-sale-el-paso-tx"
      },
      {
        name: "Katy",
        href: "/all-city/storage-units-katy"
      },
      {
        name: "Colorado Springs",
        href: "/all-city/shipping-containers-for-sale-colorado-springs"
      },
      {
        name: "Arlington",
        href: "/all-city/shipping-container-for-sale-arlington-tx"
      },
      {
        name: "Fort Worth",
        href: "/all-city/shipping-containers-for-sale-fort-worth"
      },
      {
        name: "Laredo",
        href: "/all-city/metal-storage-containers-laredo"
      },
      {
        name: "Sugar Land",
        href: "/all-city/storage-units-sugar-land-tx"
      },
      {
        name: "Austin",
        href: "/all-city/shipping-container-austin-texas"
      },
      {
        name: "Garland",
        href: "/all-city/garland-storage-container"
      },
      {
        name: "Lubbock",
        href: "/all-city/shipping-containers-for-sale-lubbock"
      },
      {
        name: "Brownsville",
        href: "/all-city/brownsville-tx-storage-units"
      },
      {
        name: "Grand Prairie",
        href: "/all-city/shipping-container-grande-prairie"
      },
      {
        name: "Mission",
        href: "/all-city/storage-mission-tx"
      },
      {
        name: "Corpus Christi",
        href: "/all-city/shipping-containers-for-sale-corpus-christi"
      },
      {
        name: "Houston",
        href: "/all-city/cargo-containers-for-sale-houston"
      },
      {
        name: "Plano",
        href: "/all-city/storage-units-plano-tx"
      },
      {
        name: "Dallas",
        href: "/all-city/cargo-containers-dallas"
      },
      {
        name: "Irving",
        href: "/all-city/storage-irving-tx"
      },
      {
        name: "San Antonio",
        href: "/all-city/sea-container-san-antonio-texas"
      }
    ],
    mapImage: {
      src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/dallas-tx.webp",
      alt: "Map of the Dallas, TX area",
      width: 602,
      height: 589
    },
    featured: {
      title: "Shipping Container Affordable Housing in Dallas",
      paragraphs: [
        "In an effort to address the pressing shortage of affordable housing in Dallas, CitySquare, a local nonprofit organization, is pioneering a revolutionary new approach – constructing an apartment complex out of shipping container homes located in Southeast Dallas. The 19 one-bedroom units of the Housing Project will be situated across from The Cottages at Hickory Crossing, CitySquare’s existing fifty tiny homes for homeless people. These dwellings are rent-restricted to 60% of the Area Median Income and come with utilities inclusive of its $906 monthly fee.",
        "Billy Sims, a current resident of Hickory Crossing, is living proof of the transformational power CitySquare Housing can have on people’s lives. After being homeless for over a year and struggling with various issues such as mental illness, joblessness, and substance abuse, Billy was able to turn his life around thanks to the tiny home he got from the nonprofit organization. The Hickory Crossing project opened in 2016 specifically designed to help combat chronic homelessness in Dallas—a city that currently has one of the largest homeless populations in Texas."
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/affordable-shipping-container-homes-dallas-1024x564.webp",
        alt: "affordable shipping container homes dallas",
        width: 800,
        height: 440
      }
    },
    news: {
      title: "Dallas Shipping Container Bar",
      paragraphs: [
        "It seems Dallas’s first shipping container bar, The Cedars Backyard, which officially opened and became part of the city’s fabric in 2018, may have set the trend for other restaurants to follow suit. Not only is this location a great place to eat and relax with friends, but it also repurposes old shipping containers into something new and innovative. The owners of the Cedars Social, Jeffrey Yarbrough, and Chad Boyle, had a revolutionary idea – that Dallas needed something fresh. What was it? A fully functioning bar made from an upcycled shipping container!",
        "Mod Pod Solutions (owned by Joe Duncan) lent a hand in transforming this Tiffany blue recycled shipping container into the charming centerpiece of their outdoor hangout. With bright furniture and picnic tables surrounding it, one can not help but feel welcomed to this unique bar! Dallas now has an ideal spot to enjoy at a reasonable cost. There are fifteen beers and cocktails on tap, from DEBC Local Legent to Revolver Blood and Honey, Honeysuckle Shandy, or Date Old Fashioned; simply put – it’s the ultimate Sunday Funday place for you having fun over local brews with some backyard games."
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/the-cedars-backyard-dallas-first-shipping-container-bar.webp",
        alt: "The Cedars Backyard, Dallas' First Shipping Container Bar",
        width: 745,
        height: 419
      }
    },
    deliveredLead: [],
    seo: {
      title: "Shipping Containers For Sale Dallas | Lowest Prices Guarantee",
      description: "Get shipping containers for sale in Dallas, TX. Buy, rent, or rent-to-own the best deals with fast local delivery. Call us for a free quote!",
      ogImage: "https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2024/05/14063436/google-reviews.webp"
    }
  },
  {
    slug: "denver-co",
    depot: "Denver, CO",
    depotId: 14,
    place: {
      city: "Denver",
      region: "CO",
      regionName: "Colorado",
      label: "Denver, CO"
    },
    nearbyCities: [
      {
        name: "Arvada",
        href: "/all-city/storage-units-arvada"
      },
      {
        name: "Colorado Springs",
        href: "/all-city/storage-units-colorado-springs"
      },
      {
        name: "Grand Junction",
        href: "/all-city/storage-units-grand-junction"
      },
      {
        name: "Pueblo",
        href: "/all-city/storage-units-pueblo-co"
      },
      {
        name: "Aurora",
        href: "/all-city/storage-units-aurora-co"
      },
      {
        name: "Commerce City",
        href: "/all-city/storage-units-commerce-city"
      },
      {
        name: "Greely",
        href: "/all-city/greely-storage"
      },
      {
        name: "Westminster",
        href: "/all-city/shipping-containers-westminster-co"
      },
      {
        name: "Boulder",
        href: "/all-city/storage-units-boalder-co"
      },
      {
        name: "Denver",
        href: "/all-city/cargo-containers-for-sale-denver"
      },
      {
        name: "Littleton",
        href: "/all-city/shipping-containers-littleton-co"
      },
      {
        name: "Brighton",
        href: "/all-city/storage-units-brighton-co"
      },
      {
        name: "Englewood",
        href: "/all-city/storage-units-englewood-co"
      },
      {
        name: "Longmont",
        href: "/all-city/storage-units-longmont-co"
      },
      {
        name: "Broomfield",
        href: "/all-city/shipping-containers-broomfield-co"
      },
      {
        name: "Fort Collins",
        href: "/all-city/storage-units-fort-collins-co"
      },
      {
        name: "Loveland",
        href: "/all-city/storage-units-loveland-co"
      },
      {
        name: "Castle Rock",
        href: "/all-city/storage-units-castle-rock-co"
      },
      {
        name: "Golden",
        href: "/all-city/storage-units-golden-co"
      },
      {
        name: "Parker",
        href: "/all-city/storage-units-parker-co"
      }
    ],
    mapImage: {
      src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/denver-co.webp",
      alt: "Map of the Denver, CO area",
      width: 571,
      height: 556
    },
    featured: {
      title: "Shipping Container Pad in Colorado",
      paragraphs: [
        "Planning an economical ski getaway in Colorado can be a tricky task. Paying for luxurious lodging is often not the most practical option when you want to spend most of your time on the slopes; according to Travelocity, hotel rooms in Summit County range from $350 – $1,000 per night! Fortunately, there’s The Pad, a unique accommodation crafted with 18 upcycled shipping containers that provide private suites and traditional hotel rooms alongside micro-rooms and dorms at far more wallet-friendly rates than other mountain lodges. Not only does this offer an array of amenities but also greater accessibility for those who relish experiencing winter sports without breaking their budget.",
        "The Pad, the latest hotel, and hostel to open in Silverthorne, was designed with one goal in mind: giving Summit Country travelers a more affordable option. Constructed from 18 upcycled shipping containers, this space provides private suites, traditional rooms, mini-rooms, and dorms (101 beds across 36 rooms) starting at $50 per night. Not only does it offer great value for money but guests also have access to an array of amenities such as a bar area; co-working spaces; hot tubs and a rooftop deck perfect for anyone who loves soaking up panoramic views!"
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/the-pad-denver-1024x575.webp",
        alt: "the pad denver",
        width: 800,
        height: 449
      }
    },
    news: {
      title: "Shipping Container House in Colorado",
      paragraphs: [
        "Have you heard the talk about building a home with shipping containers, those large, steel boxes used to stack cargo on ships and trains? Architect Joe Simmons of BlueSky Studio had his own experience when he aided husband-and-wife team Regan and Libby Foster in constructing their new house from nine 40ft. long containers in Chaffee Park. He expresses that contrary to popular belief, this alternative way of creation is not as easy or cost-efficient compared to traditional wood framing houses. Utilizing small wooden blocks to scale, Simmons crafted a 4,000-square-foot structure that was both aesthetically and functionally pleasing.",
        "The eye-catching design comprises two symmetrical stacks of containers on each side with one elevated container bridging the gap between them. Inside this extraordinary home is an open living space complete with a dining room and kitchen as well as two separate bedrooms. On the second floor lies another apartment containing two additional rooms plus a master suite while Libby’s mother resides here too! With its flexible layout, ample square footage, and unique aesthetic appeal – it’s easy to see why this dwelling has become so popular!"
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/chaffee-park-denver-1024x683.webp",
        alt: "chaffee park denver",
        width: 800,
        height: 533
      }
    },
    deliveredLead: [],
    seo: {
      title: "Shipping Containers for Sale Denver | Rent-to-Own Deals",
      description: "Find budget-friendly shipping containers for sale Denver. Low prices, flexible rent-to-own plans & quick delivery to your site. Call us now!",
      ogImage: "https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2024/05/14063436/google-reviews.webp"
    }
  },
  {
    slug: "detroit-mi",
    depot: "Detroit, MI",
    depotId: 15,
    place: {
      city: "Detroit",
      region: "MI",
      regionName: "Michigan",
      label: "Detroit, MI"
    },
    nearbyCities: [
      {
        name: "Ann Arbor",
        href: "/all-city/storage-units-ann-arbor-mi"
      },
      {
        name: "Farmington",
        href: "/all-city/storage-units-farmington-mi"
      },
      {
        name: "Lansing",
        href: "/all-city/storage-units-lansing-mi"
      },
      {
        name: "Warren",
        href: "/all-city/storage-units-warren-mi"
      },
      {
        name: "Battle Creek",
        href: "/all-city/storage-units-battle-creek-mi"
      },
      {
        name: "Flint",
        href: "/all-city/storage-units-flint-mi"
      },
      {
        name: "Livonia",
        href: "/all-city/storage-units-livonia-mi"
      },
      {
        name: "Ypsilanti",
        href: "/all-city/storage-units-ypsilanti-mi"
      },
      {
        name: "Canton",
        href: "/all-city/storage-units-canton-mi"
      },
      {
        name: "Grand Rapids",
        href: "/all-city/storage-units-grand-rapids-mi"
      },
      {
        name: "Muskegon",
        href: "/all-city/storage-units-muskegon-mi"
      },
      {
        name: "Clinton Township",
        href: "/all-city/storage-units-clinton-township-mi"
      },
      {
        name: "Holland",
        href: "/all-city/storage-units-holland-mi"
      },
      {
        name: "Rochester",
        href: "/all-city/storage-units-rochester-mi"
      },
      {
        name: "Dearborn",
        href: "/all-city/dearborn-storage"
      },
      {
        name: "Jackson",
        href: "/all-city/storage-units-jackson-mi"
      },
      {
        name: "Saginaw",
        href: "/all-city/storage-units-saginaw-mi"
      },
      {
        name: "Detroit",
        href: "/all-city/cargo-container-detroit"
      },
      {
        name: "Kalamazoo",
        href: "/all-city/storage-units-kalamazoo"
      },
      {
        name: "Sterling Heights",
        href: "/all-city/storage-units-sterling-heights-mi"
      }
    ],
    mapImage: {
      src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/detroit.webp",
      alt: "Map of the Detroit, MI area",
      width: 612,
      height: 562
    },
    featured: {
      title: "Shipping Container Globe Theatre in Detroit",
      paragraphs: [
        "Bringing a piece of history back to life, the Container Globe Theatre is an incredible reproduction of Shakespeare’s iconic 1599 Globe Theatre that will be placed on the grounds of Detroit’s former Herman Kiefer Hospital near the Lodge Freeway. Built with repurposed shipping containers and providing space for engaging theatrical performances in an intimate setting, this unique theater promises to bring interactive experiences right into your backyard! The 28 containers that were customized in Detroit have been shipped to the Herman Kiefer site and are now ready for assembly into a theater. Arranged as two-storied circles, these containers will form seating galleries and provide an area for backstage activities allowing up to 400 viewers at once!",
        "An additional audience of 800-1000 people can be accommodated by making room for “groundlings,” which is what audiences were called centuries ago when standing close to the stage. Vail chose Detroit as the site of his theater due to its invaluable musical and theatrical heritage, its recognition by UNESCO as a City of Design, and its elevated demand for Shakespearean performances. It is estimated that 40 percent of attendees at Stratford Festival in Ontario come from Michigan, primarily Detroit. In addition to traditional shows, audiences can expect musicals and dances; educational experiences; food trucks circling around the venue; plus community activities within The Container Globe."
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/shipping-container-detroit-theatre.webp",
        alt: "shipping container detroit theatre",
        width: 800,
        height: 421
      }
    },
    news: {
      title: "Detroit Shipping Container Summer Barbecue Hotspot",
      paragraphs: [
        "Make your way to The Fountain Detroit this weekend for an unparalleled urban-barbecue street food beachside experience! Located in Campus Martius Park, the trendy shipping container restaurant and bar will tantalize you with its delicacies from BBQ ribs to foosball. Burgers, craft cocktails, and other bites are sure to make it a memorable evening at The Fountain Detroit’s seasonal spot. Visit us and take in the vivid atmosphere! The outdoor dining space offers a six-foot-long cooking surface and a smoker to prepare an ever-changing variety of delicious summer dishes.",
        "Devour favorites such as beef brisket, barbecue ribs, and smoked chicken plus sides like coleslaw and macaroni salad coupled with our tantalizing house-made sauces ranging from sweet to tangy for only $8 – $12. Jordan Hoffman, executive chef of The Fountain Detroit BBQ and Parc restaurant is convinced the 320-square-foot beach-themed spot is absolutely one-of-a-kind. This seasonally available barbeque dining area will stay open to all until October – so hurry over! Follow your nose as it’s led by the delightful aroma of barbecue, seeking out this hard-to-miss gem adorned with patio lights, orange umbrellas, and fun beach games for you to enjoy. Come take pleasure in a unique eat & play experience at Detroit’s urban beach today!"
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/the-fountain-detroit-1024x683.webp",
        alt: "the fountain detroit",
        width: 800,
        height: 533
      }
    },
    deliveredLead: [],
    seo: {
      title: "Shipping Container Detroit | Top Quality & Best Pricing",
      description: "Shipping Container Detroit. Available for sale and rental. Call us now for the lowest pricing and quick delivery !",
      ogImage: "https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2024/05/14063436/google-reviews.webp"
    }
  },
  {
    slug: "edmonton-ab",
    depot: "Edmonton, AB",
    depotId: 16,
    place: {
      city: "Edmonton",
      region: "AB",
      regionName: "Alberta",
      label: "Edmonton, AB"
    },
    nearbyCities: [
      {
        name: "Red Deer",
        href: "/shipping-container-red-deer"
      },
      {
        name: "Calgary",
        href: "/sea-containers-calgary"
      },
      {
        name: "Edmonton",
        href: "/sea-containers-edmonton"
      },
      {
        name: "Lethbridge",
        href: "/storage-containers-lethbridge"
      },
      {
        name: "Medicine Hat",
        href: "/storage-containers-medicine-hat"
      },
      {
        name: "St. Albert",
        href: "/storage-units-st-albert"
      },
      {
        name: "Sherwood Park",
        href: "/storage-units-sherwood-park"
      },
      {
        name: "Grande Prairie",
        href: "/city-page-grande-prairie-ab"
      },
      {
        name: "Fort McMurray",
        href: "/storage-containers-fort-mcmurray"
      },
      {
        name: "Airdrie",
        href: "/storage-units-airdrie"
      },
      {
        name: "Spruce Grove",
        href: "/storage-units-spruce-grove"
      },
      {
        name: "Cochrane",
        href: "/storage-units-cochrane"
      },
      {
        name: "Camrose",
        href: "/storage-units-camrose"
      },
      {
        name: "Leduc",
        href: "/storage-units-leduc"
      },
      {
        name: "Fort Saskatchewan",
        href: "/storage-units-fort-saskatchewan"
      },
      {
        name: "Okotoks",
        href: "/storage-units-okotoks"
      },
      {
        name: "Brooks",
        href: "/storage-brooks"
      },
      {
        name: "Canmore",
        href: "/storage-units-canmore"
      },
      {
        name: "Cold Lake",
        href: "/storage-unit-cold-lake"
      },
      {
        name: "Wetaskiwin",
        href: "/wetaskiwin-storage"
      }
    ],
    mapImage: {
      src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/edmonton-67232746b62be.webp",
      alt: "Map of the Edmonton, AB area",
      width: 589,
      height: 547
    },
    featured: {
      title: "Shipping Container Hotel in Edmonton",
      paragraphs: [
        "Bruderheim’s landscape is about to feature a novel addition – an 80-container steel edifice, built in Calgary and soon to be unveiled. This four-story Suite 6 Extended Stay hotel will boast 63 rooms when it opens its doors next year, bringing welcome accommodations for workers in the Industrial Heartland region while also providing a financial lift to the town 55 kilometers northeast of Edmonton. The building sits prominently on vacant land beside the Shell station off Highway 45. Even with its stucco exterior concealing its distinctive origin story, this structure promises not only convenience but also intrigue!",
        "Calgary-based Ladacor, an expert in advanced modular structures and the manufacturer of hotels, seniors’ residences, condominiums, and rental apartments is constructing this hotel. To create 40 modules for each of the ten floors, they will be cut apart and then reshaped. Each module will include two rooms with a section of hallway included too! The company also finished a Days Inn in Sioux Lookout utilizing 120 extra shipping containers; traditional wood-frame construction was used for common spaces such as reception areas."
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/shipping-container-hotel-in-edmonton.webp",
        alt: "Shipping Container Hotel in Edmonton",
        width: 550,
        height: 311
      }
    },
    news: {
      title: "Shipping Container House in Edmonton",
      paragraphs: [
        "Edmonton is now home to the first-ever shipping container house for sale on the MLS market! In recent years, more and more people have been taking advantage of the sea can home: not only do these residences boast environmental, social, and practical benefits due to their recycled nature, but they are also perfect solutions for apartment buildings and garden suites. Get ready Edmonton; a new wave of housing is coming your way soon!",
        "As Andrew Mills strolled around the Queen Alexandra neighborhood one day, he was amazed to observe a huge crane setting a shipping container on top of 7222 106th Street’s foundation. Being President of the ECO Solar Home Tour Society which organizes tours across Edmonton highlighting energy-efficient and solar-powered homes each year – Mills is an enthusiast for these types of dwellings as they are both more eco-friendly when contrasted with regular houses while also serving as upcycling on a large scale!"
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/shipping-container-home-in-edmonton.webp",
        alt: "shipping container home in edmonton",
        width: 800,
        height: 600
      }
    },
    deliveredLead: [],
    seo: {
      title: "Shipping Containers Edmonton | Top Quality & Best Pricing",
      description: "We have the best prices on new and used shipping containers in Edmonton. Call us now for quick delivery or free pick up!",
      ogImage: "https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2024/05/14063436/google-reviews.webp"
    }
  },
  {
    slug: "el-paso-tx",
    depot: "El Paso, TX",
    depotId: 17,
    place: {
      city: "El Paso",
      region: "TX",
      regionName: "Texas",
      label: "El Paso, TX"
    },
    nearbyCities: [
      {
        name: "Abilene",
        href: "/shipping-containers-for-sale-abilene-tx"
      },
      {
        name: "Amarillo",
        href: "/shipping-container-for-sale-amarillo"
      },
      {
        name: "Arlington",
        href: "/shipping-container-for-sale-arlington-tx"
      },
      {
        name: "Big Spring",
        href: "/shipping-containers-for-sale-big-spring-tx"
      },
      {
        name: "Dallas",
        href: "/where-to-buy-shipping-containers/dallas-tx"
      },
      {
        name: "Denton",
        href: "/storage-containers-denton-tx"
      },
      {
        name: "El Paso",
        href: "/where-to-buy-shipping-containers/el-paso-tx"
      },
      {
        name: "Fort Worth",
        href: "/shipping-containers-for-sale-fort-worth-texas"
      },
      {
        name: "Grapevine",
        href: "/container-store-grapevine-tx"
      },
      {
        name: "Houston",
        href: "/where-to-buy-shipping-containers/houston-tx"
      },
      {
        name: "Irving",
        href: "/storage-irving-tx"
      },
      {
        name: "Laredo",
        href: "/where-to-buy-shipping-containers/laredo-tx"
      },
      {
        name: "Lubbock",
        href: "/shipping-containers-for-sale-lubbock"
      },
      {
        name: "Midland",
        href: "/shipping-containers-for-sale-midland-tx"
      },
      {
        name: "Odessa",
        href: "/shipping-containers-for-sale-in-odessa-tx"
      },
      {
        name: "Plano",
        href: "/plano-storage-containers"
      },
      {
        name: "Richardson",
        href: "/container-store-richardson-tx"
      },
      {
        name: "San Antonio",
        href: "/where-to-buy-shipping-containers/san-antonio-tx"
      },
      {
        name: "Tyler",
        href: "/shipping-containers-for-sale-tyler-tx"
      },
      {
        name: "Waco",
        href: "/shipping-containers-for-sale-waco-tx"
      }
    ],
    mapImage: {
      src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/el-paso.webp",
      alt: "Map of the El Paso, TX area",
      width: 587,
      height: 551
    },
    featured: {
      title: "El Paso Shipping Container Coffee Box",
      paragraphs: [
        "In El Paso, one can’t help but notice two particular shipping containers in the center of town – transformed into a double-story business known as Coffee Box. This unique attraction is easily accessible from nearby hotels and close to the city’s Convention Centre and Museum of Art. On average, at least 4,000 cargo containers cross over from Mexico each day; however, these specific ones have caught people’s attention for their creative repurposing! Boasting a vibrant mural of cascading oranges, pinks, and turquoise that three fluttering hummingbirds call home, seating options abound inside or outside – upstairs or downstairs. These 40-foot long by 8-feet wide containers are sure to pique the curiosity of all who come across them!",
        "At Coffee Box, they serve a wide variety of customers from both downtown workers and hotel guests alike. El Paso itself is an economic powerhouse producing a whopping $108 billion in trade annually! It’s no wonder why people need their caffeine fix – with over 4,000 containers being shipped between El Paso and Juarez every day on four bridges as well as 35,000 cars hopping across the border daily plus another 22,000 pedestrians crossing. Talk about bustling hustle-bustle!"
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/coffee-box-el-paso-1024x650.webp",
        alt: "coffee box el paso",
        width: 800,
        height: 507
      }
    },
    news: {
      title: "El Paso Shipping Container Bar",
      paragraphs: [
        "After one global pandemic, El Paso’s nightlife is preparing to take off again with the newest venue – Hush Hush Bar. Located on Southwest University Park’s southwestern side, co-owners Johnny Escalante and Kiki Cervantes acquired this property late last year which used to contain Blackbird Cantina. With its brand-new look and atmosphere, downtown will never be the same! In January of 2020, the team had to drastically alter their plans when the pandemic struck two months later – pushing back all progress for an entire year. Although this was a difficult obstacle to overcome, it presented a unique chance for them to take advantage of extra time and enhance what they already had in motion.",
        "Cervantes noted that “we seized every opportunity we could find to make our concept even better” The bar has been utterly transformed from its original state. Stacked shipping containers have given way to grand arches and captivating lanterns, while a rooftop bar with vistas of Union Depot train station, Downtown, and Juárez provides the perfect setting for an evening out!"
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/hush-hush-bar.webp",
        alt: "El Paso Shipping Container Bar",
        width: 600,
        height: 400
      }
    },
    deliveredLead: [],
    seo: {
      title: "El Paso, TX - OnsiteStorage",
      description: "4.8 Shipping Containers For Sale El Paso, TX Shipping Containers For Sale El Paso, TX 100% Satisfaction Guaranteed – Highest Customer Satisfaction -Founded in 2002 (888) 977-9085 WE HAVE CONTAINERS FOR EVERY BUDGET! Explore our top-selling shipping containers available in El Paso, TX Get competitive prices and fast delivery across the El Paso, TX area....",
      ogImage: "https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2024/05/14063436/google-reviews.webp"
    }
  },
  {
    slug: "halifax-dartmouth-ns",
    depot: "Halifax / Dartmouth, NS",
    depotId: 51,
    place: {
      city: "Halifax / Dartmouth",
      region: "NS",
      regionName: "Nova Scotia",
      label: "Halifax / Dartmouth, NS"
    },
    nearbyCities: [],
    mapImage: {
      src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/halifax-671f92af64e8a.webp",
      alt: "Map of the Halifax / Dartmouth, NS area",
      width: 648,
      height: 558
    },
    featured: null,
    news: null,
    deliveredLead: [],
    seo: {
      title: "Shipping Containers Halifax | Buy, Rent, or Rent-to-Own Best Deals",
      description: "Find the best deals on shipping containers in Halifax. Buy, rent, or rent-to-own with quick local delivery. Call us now for a free quote!",
      ogImage: "https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2024/05/14063436/google-reviews.webp"
    }
  },
  {
    slug: "houston-tx",
    depot: "Houston, TX",
    depotId: 18,
    place: {
      city: "Houston",
      region: "TX",
      regionName: "Texas",
      label: "Houston, TX"
    },
    nearbyCities: [
      {
        name: "Alvin",
        href: "/storage-alvin-tx"
      },
      {
        name: "Austin",
        href: "/shipping-container-for-sale-austin"
      },
      {
        name: "Beaumont",
        href: "/shipping-containers-for-sale-beaumont-texas"
      },
      {
        name: "College Station",
        href: "/extra-space-storage-college-station"
      },
      {
        name: "Conroe",
        href: "/shipping-containers-for-sale-conroe-tx"
      },
      {
        name: "Dallas",
        href: "/where-to-buy-shipping-containers/dallas-tx"
      },
      {
        name: "El Paso",
        href: "/where-to-buy-shipping-containers/el-paso-tx"
      },
      {
        name: "Fredericksburg",
        href: "/shipping-containers-fredericksburg-tx"
      },
      {
        name: "Houston",
        href: "/where-to-buy-shipping-containers/houston-tx"
      },
      {
        name: "Katy",
        href: "/storage-katy-tx"
      },
      {
        name: "Kerrville",
        href: "/storage-units-kerrville-tx"
      },
      {
        name: "Lake Jackson",
        href: "/storage-units-in-lake-jackson-texas"
      },
      {
        name: "Laredo",
        href: "/where-to-buy-shipping-containers/laredo-tx"
      },
      {
        name: "League City",
        href: "/storage-units-league-city"
      },
      {
        name: "New Braunfels",
        href: "/shipping-containers-for-sale-new-braunfels"
      },
      {
        name: "Pasadena",
        href: "/container-store-pasadena"
      },
      {
        name: "Port Arthur",
        href: "/storage-units-port-arthur-tx"
      },
      {
        name: "Round Rock",
        href: "/container-store-round-rock"
      },
      {
        name: "San Antonio",
        href: "/where-to-buy-shipping-containers/san-antonio-tx"
      },
      {
        name: "Sugar Land",
        href: "/storage-sugar-land-tx"
      }
    ],
    mapImage: {
      src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/houston-6720762c0cd6cwebpbv_resized_ipadwebpbv.webp",
      alt: "Map of the Houston, TX area",
      width: 580,
      height: 558
    },
    featured: {
      title: "Houston Shipping Container Coffee Shop",
      paragraphs: [
        "Manuel and Martha Gil, a husband-and-wife team of caffeinated connoisseurs, have recently opened Segundo Lab in the Ironworks district downtown. Their unique blends will bring forth an unparalleled level of richness and creativity to Second Ward coffee lovers. In the last few years, Ironworks – once a 60,000-square-foot industrial building and development in East End – has been utterly transformed into an artistic haven. This space is now a thriving creative work and retail center by utilizing more than 20 recycled shipping containers to revamp the Cameron Iron Works (founded in 1920).",
        "Venture inside Segundo Coffee Lab and find yourself captivated by its unusual bohemian industrial atmosphere. Enjoy your typical coffee shop favorites, like espressos, cappuccinos, iced coffees, and teas – with a twist! Their eccentric libations are often Delta 8 or CBD-infused; some of the favorites include La Mexicana – honey vanilla latte with a cinnamon twang, Pingüino’s white & dark mocha syrup blended in oat milk, and the signature 713 Taro con Leche. For those looking for an alternative kind of high? They also serve beer &wine! Tuesday’s specials offer discounted beers from 5 pm to 9 pm – locals shouldn’t miss out on this unique experience!"
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/segundo-lab-houston-1024x599webpbv_resized_ipadwebpbv.webp",
        alt: "segundo lab Houston",
        width: 680,
        height: 398
      }
    },
    news: {
      title: "Shipping Container Homes in Houston",
      paragraphs: [
        "To many, a 20-foot shipping container may be just another cargo for transporting goods. But to Anuj Datta, it has become an exceptional source of income! In comparison to the ever-popular condos and high rises, container homes have emerged as this city’s newest craze. The global container home trend is rapidly expanding, with estimates predicting the market to reach an astonishing $73 million by 2025. Datta joins this growing movement of eco-friendly. In Bayou City, a few such structures have already gained attention for their creative designs in both Third and Fifth Ward Areas – leaving passersby enchanted by these innovative containers which are becoming more sought after as countries strive towards sustainability!",
        "Container homes are one-of-a-kind due to their unique construction methods. Owners can customize the structure by stacking, welding, and positioning the containers in creative ways. Much like traditional houses, these abodes offer modern amenities such as a living room, kitchenette, and climate control for cooling or heating purposes. As the pandemic continues and finances become a top priority, real estate experts project that container homes will be increasingly in demand over the next few years due to their cost-efficiency."
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/container-homes-houston-1024x843webpbv_resized_ipadwebpbv.webp",
        alt: "Container homes houston",
        width: 680,
        height: 559
      }
    },
    deliveredLead: [
      {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/atlanta-8-671b565d04559webpbv.webp",
        alt: "Shipping container delivered in Atlanta",
        width: 365,
        height: 362
      },
      {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/new-orleans-4-671b565f2a44fwebpbv.webp",
        alt: "Shipping container delivered in New Orleans",
        width: 365,
        height: 362
      },
      {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/baltimore-7-671b565ebc2a2webpbv.webp",
        alt: "Shipping container delivered in Baltimore",
        width: 365,
        height: 362
      }
    ],
    seo: {
      title: "Shipping Containers for Sale Houston | Buy, Rent & Rent-to-Own",
      description: "Find shipping containers for sale Houston with flexible options: buy, rent, or rent to own. Durable, weatherproof units delivered fast.",
      ogImage: "https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2024/05/14063436/google-reviews.webp"
    }
  },
  {
    slug: "indianapolis-in",
    depot: "Indianapolis, IN",
    depotId: 19,
    place: {
      city: "Indianapolis",
      region: "IN",
      regionName: "Indiana",
      label: "Indianapolis, IN"
    },
    nearbyCities: [],
    mapImage: null,
    featured: {
      title: "Shipping Container Homes Growing Popularity in Indianapolis",
      paragraphs: [
        "Custom Container Builders has unveiled their concept model for the 2023 Indianapolis Home Show’s Centerpiece Home – a pioneering shipping container home that will make history as the first of its kind in over 101 years. Shipping container homes are an innovative type of single- or multi-family residences constructed with robust and corrosion-resistant corten steel containers, which were originally designed to hold cargo during transoceanic trips. These durable structures have become increasingly popular due to their strength, sustainability, and cost-effectiveness.",
        "Custom Container Builders has joined forces with JMT Landscape Group to craft an up-close experience for Home Show attendees, providing a tangible look into the expanding building trend that is quickly becoming popular across the state. Discover the wonder of home improvement from January 20th to 29th, at the 2023 Indianapolis Home Show! With tickets costing just $15 for adults, and only $3 for children between 6-12 years old; it’s even free admission for kids 5 and under."
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/shipping-container-home-indianapolis-1024x521_aBYqnwP.webp",
        alt: "shipping containers for sale indianapolis as a shipping container home",
        width: 1024,
        height: 521
      }
    },
    news: {
      title: "Indianapolis Shipping Container Hotel",
      paragraphs: [
        "Robin Staten-Lanier, a budding hotelier and the owner of Tiny Urban Escapes, recently revealed her ambitious plan to build a boutique hotel in Indianapolis’ Haughville neighborhood made entirely from shipping containers. This hidden micro resort is set for completion this summer and will offer four semi-glass private luxury suites as well as an event space perfect for any occasion! The hotel will be located at 2214 W. Michigan St. near the Indianapolis Public Library Haughville branch. Tiny Urban Escapes is a Black-owned, female-led enterprise.",
        "Construction is planned to be completed during the summer months. Twenty-foot shipping containers are being modified into suites, while an even larger 40-foot container will house “The Scene,” an event space. In addition, each suite offers access to wellness and culinary experiences as well as on-demand concierge services. Constructing custom modular buildings using reclaimed shipping containers has been in vogue for quite some time now. Not only are these containers cost-effective and sturdy, but they also boast excellent eco-friendliness. Thanks to this project, construction timelines have been drastically shortened and it is now more achievable for products to reach the market faster. At an estimated cost of around half a million dollars, this endeavor has received funding from LISC – a nonprofit that works towards aiding community development organizations in revitalizing distressed neighborhoods."
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/tiny-urban-escapes-indiapolis_1xwXLZU.webp",
        alt: "shipping containers for sale indianapolis as a shipping container hotel",
        width: 600,
        height: 600
      }
    },
    deliveredLead: [],
    seo: {
      title: "Shipping Containers for Sale Indianapolis | Best Local Deals",
      description: "Get the best deals on shipping containers for sale in Indianapolis. Used & new conditions, buy or rent terms. Contact us now for pricing!",
      ogImage: "https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2024/05/14063436/google-reviews.webp"
    },
    productSpecs: [
      "used_20s_asis",
      "used_20s_wwt",
      "used_20s_cw",
      "used_20s_iicl"
    ],
    links: {
      buy: "tel:",
      rto: "/shipping-container-quote"
    },
    sections: [
      {
        id: "hero",
        enabled: true
      },
      {
        id: "budgetBand",
        enabled: true
      },
      {
        id: "options",
        enabled: true
      },
      {
        id: "products",
        enabled: true
      },
      {
        id: "buy",
        enabled: true
      },
      {
        id: "rental",
        enabled: true
      },
      {
        id: "rto",
        enabled: true
      },
      {
        id: "satisfaction",
        enabled: true
      },
      {
        id: "callBand",
        enabled: true
      },
      {
        id: "featured",
        enabled: true
      },
      {
        id: "news",
        enabled: true
      },
      {
        id: "video",
        enabled: true
      },
      {
        id: "closingBand",
        enabled: true
      }
    ],
    text: {
      hero: {
        tagline: "Shipping containers for sale in Indianapolis starting at $1,400, rent from {lowestRent}/month, or rent-to-own from just $68.14/month."
      },
      products: {
        heading: "Explore our top-selling shipping containers for sale in [[Indianapolis, IN]]"
      },
      buy: {
        heading: "Buy a Shipping Container for Sale [[Indianapolis, IN]] at the Best Price",
        body: "We offer shipping containers from 10ft to 40ft, including high cube containers. Choose used containers starting at $1,400 for affordable, durable storage, or new containers from $3,100 for like-new quality and long-term use. Refurbished options are also available, with fast delivery and great value across Indiana.",
        cta: "Call for Best Deals"
      },
      satisfaction: {
        body: "Our satisfaction guarantee makes buying or renting a container easy and worry-free. Call to order from our friendly, experienced sales associates or just order online using our website. Our website is a great place to start learning more about container prices, types, conditions, and grades."
      },
      rental: {
        body: "Get flexible, affordable storage with shipping container rentals in Indianapolis starting at just {lowestRent}/month. Choose a convenient solution for temporary or long-term storage, with options to fit your needs. Our rental containers provide a secure and practical storage solution for homes, businesses, and job sites.",
        cta: "Check Rental Prices"
      },
      rto: {
        body: "Our rent-to-own shipping container program in Indianapolis starts at just $68.14/month, with flexible payment terms including 6, 12, 18, and 24-month plans, along with long-term options. It’s an affordable way to work toward ownership while getting the storage space you need.",
        cta: "Get a Free Quote"
      },
      budgetBand: "INDIANAPOLIS TRUSTED CONTAINER WHOLESALER FOR MORE THAN 20 YEARS!"
    }
  },
  {
    slug: "jacksonville-fl",
    depot: "Jacksonville, FL",
    depotId: 20,
    place: {
      city: "Jacksonville",
      region: "FL",
      regionName: "Florida",
      label: "Jacksonville, FL"
    },
    nearbyCities: [
      {
        name: "Boca Raton",
        href: "/all-city/storage-units-boca-raton"
      },
      {
        name: "Jacksonville",
        href: "/all-city/cargo-containers-for-sale-jacksonville-fl"
      },
      {
        name: "Orlando",
        href: "/all-city/shipping-containers-for-sale-orlando"
      },
      {
        name: "Tampa",
        href: "/all-city/cargo-containers-for-sale-tampa"
      },
      {
        name: "Bradenton",
        href: "/all-city/storage-units-bradenton-fl"
      },
      {
        name: "Kissimmee",
        href: "/all-city/storage-units-kissimmee-fl"
      },
      {
        name: "Pensacola",
        href: "/all-city/shipping-containers-for-sale-pensacola"
      },
      {
        name: "West Palm Beach",
        href: "/all-city/shipping-containers-for-sale-west-palm-beach"
      },
      {
        name: "Fort Lauderdale",
        href: "/all-city/shipping-containers-for-sale-fort-lauderdale"
      },
      {
        name: "Lake Worth",
        href: "/all-city/storage-units-lake-worth-fl"
      },
      {
        name: "Pompano Beach",
        href: "/all-city/storage-units-pompano-beach-fl"
      },
      {
        name: "Fort Myers",
        href: "/all-city/shipping-containers-for-sale-fort-myers-fl"
      },
      {
        name: "Lakeland",
        href: "/all-city/shipping-containers-lakeland-fl"
      },
      {
        name: "Saint Petersburg",
        href: "/all-city/storage-saint-petersburg-florida"
      },
      {
        name: "Hialeah",
        href: "/all-city/storage-units-hialeah"
      },
      {
        name: "Miami",
        href: "/all-city/cargo-containers-for-sale-miami"
      },
      {
        name: "Sarasota",
        href: "/all-city/storage-units-sarasota-fl"
      },
      {
        name: "Hollywood",
        href: "/all-city/storage-hollywood-fl"
      },
      {
        name: "Naples",
        href: "/all-city/shipping-containers-for-sale-naples-fl"
      },
      {
        name: "Tallahassee",
        href: "/all-city/shipping-containers-for-sale-tallahassee-fl"
      }
    ],
    mapImage: {
      src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/jacksonville-672081db1324d.webp",
      alt: "Map of the Jacksonville, FL area",
      width: 592,
      height: 554
    },
    featured: {
      title: "Shipping Container Shopping Center in Jacksonville",
      paragraphs: [
        "JWB Real Estate Capital has submitted a plan to the city of Arlington regarding their renovation project at College Park, formerly known as Town & Country Shopping Center. There will be an outdoor food court and park made from shipping containers, two apartment buildings added to the existing mall, public open space for recreational purposes, out parcels for additional businesses and shops near University Boulevard along with an Ellianos coffee shop in front of it all. After acquiring the 67-year-old center back in August 2019 for $5.08 million this past year; they can now make these plans come to fruition starting with their 17,733 sq ft food court located on its southwestern corner! Alex Sifakis, President of JWB, announced on September 9th that the two apartment buildings are home to 80-100 units spread across three floors. The square footage for each floor is approximately 14,400 and individual unit sizes will range from 600 to 750 sq. ft.",
        "They sit south of an already established McDonald’s eatery and BP gas station in close proximity to Ellianos Coffee near its entrance into University Boulevard–Ellianos currently runs one location in Jacksonville at 1125 Lane Ave. Adjoining this 53-unit building lies roughly 11,269 sqft of public open space available for leisure use or recreational activities. Alex Sifakis, JWB President, announced that he was searching for a grocery store to be the centerpiece of the shopping center; however, none is noted on the plans. Among those already occupying space at College Park are Dollar General, Annie’s Nails, Arlington Bait & Tackle ABT Fishing, Advance Auto Parts, and Davita Inc., as well as Legacy Ministries. In addition to these business ventures, The Wall has been constructed – an outdoor mural on the south side of this complex facing I-95 which has been adorned by local artists with “Arlington ” artwork. This property is part of Renew Arlington’s Community Redevelopment Zone where city officials hope to instill rejuvenation into their area."
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/shipping-container-shopping-center-jacksonville-1024x502.webp",
        alt: "shipping container shopping center jacksonville",
        width: 800,
        height: 392
      }
    },
    news: {
      title: "Shipping Container Apartments in Jacksonville",
      paragraphs: [
        "The Cathedral District of downtown Jacksonville, Florida is prepared to undergo a radical renewal with the introduction of an innovative apartment block made entirely from shipping containers. This historic part of NE Florida’s downtown area has numerous parking lots, five majestic churches and cathedrals as well as several abandoned buildings all standing idle most days during the week. Redevelopment efforts are underway to revitalize this neighborhood and provide captivating opportunities for its inhabitants.",
        "The Cathedral District comprises 36 blocks that span approximately 120 acres and includes 60 acres dedicated to parking facilities. This unique district aims to foster a sense of togetherness through the creation of a thriving community, where people from all walks of life can live, work, learn, play, and worship in harmony. With this endeavor comes an unparalleled opportunity for transformation: modernized housing options complete with shopping and entertainment experiences that will draw people into its energetic atmosphere like never before!"
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/shipping-container-apartment-jacksonville-1024x576.webp",
        alt: "shipping container apartment jacksonville",
        width: 800,
        height: 450
      }
    },
    deliveredLead: [],
    seo: {
      title: "Shipping Containers for Sale Jacksonville FL | Fast Local Deals",
      description: "Shipping containers for sale Jacksonville, FL. Buy, rent, or rent-to-own new and used units with fast delivery and low prices. Call us now!",
      ogImage: "https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2024/05/14063436/google-reviews.webp"
    }
  },
  {
    slug: "kansas-city-ks",
    depot: "Kansas City, KS",
    depotId: 21,
    place: {
      city: "Kansas City",
      region: "KS",
      regionName: "Kansas",
      label: "Kansas City, KS"
    },
    nearbyCities: [
      {
        name: "Derby",
        href: "/all-city/container-storage-derby"
      },
      {
        name: "Kansas City",
        href: "/all-city/cargo-containers-for-sale-kansas-city"
      },
      {
        name: "Mission",
        href: "/all-city/storage-in-mission-kansas"
      },
      {
        name: "Topeka",
        href: "/all-city/storage-units-topeka-kansas"
      },
      {
        name: "Dodge City",
        href: "/all-city/storage-units-dodge-city-kansas"
      },
      {
        name: "Lawrence",
        href: "/all-city/storage-containers-lawrence-ks"
      },
      {
        name: "Olathe",
        href: "/all-city/storage-containers-olathe"
      },
      {
        name: "Wichita",
        href: "/all-city/storage-units-wichita-ks"
      },
      {
        name: "Emporia",
        href: "/all-city/storage-units-emporia-ks"
      },
      {
        name: "Leavenworth",
        href: "/all-city/storage-units-leavenworth-ks"
      },
      {
        name: "Overland Park",
        href: "/all-city/storage-units-overland-park"
      },
      {
        name: "Garden City",
        href: "/all-city/storage-units-garden-city-ks"
      },
      {
        name: "Leawood",
        href: "/all-city/storage-units-leawood-ks"
      },
      {
        name: "Pittsburg",
        href: "/all-city/storage-units-pittsburg-ks"
      },
      {
        name: "Hutchinson",
        href: "/all-city/storage-units-hutchinson-ks"
      },
      {
        name: "Lenexa",
        href: "/all-city/storage-units-lenexa-ks"
      },
      {
        name: "Salina",
        href: "/all-city/storage-units-salina-ks"
      },
      {
        name: "Junction City",
        href: "/all-city/storage-units-junction-city-ks"
      },
      {
        name: "Manhattan",
        href: "/all-city/storage-units-manhattan-ks"
      },
      {
        name: "Shawnee",
        href: "/all-city/storage-units-shawnee-ks"
      }
    ],
    mapImage: {
      src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/kansas-67208627e1d77.webp",
      alt: "Map of the Kansas City, KS area",
      width: 625,
      height: 557
    },
    featured: {
      title: "Shipping Container Food Hall in Kansas City",
      paragraphs: [
        "The era of modern, upscale food courts known as ‘food halls’ is booming across the U.S., with Kansas City leading the pack it seems like a new hall opens every few months! These stylish hubs are offering elevated casual cuisine that’s quickly becoming a preferred dining option for many. The well-known Parlor Food Hall in Crossroads is cherished by many, offering a wide array of delicacies including Detroit-style pizza, Korean comfort food, and Louisiana po’boys. In addition to this renowned hall, there’s Lenexa Public Market owned by the city of Lenexa itself; Strang Hall in downtown Overland Park from Freightquote founder Tim Barton; and Mission Gateway will be curated by none other than Top Chef star Tom Colicchio. Get ready for an unforgettable adventure at each delectable destination!",
        "Unlike other food halls, the Iron District offers not only kitchen and retail space in return for rent and a percentage of sales, but Adrienne Haynes from SEED Law’s entrepreneurship courses as an additional bonus. This amazing opportunity immediately appealed to many entrepreneurs with highly innovative ideas like Philip and Jonelle Jones’ Kind Food vegan restaurant featuring burgers, sandwiches, nachos, and kombuchas! The Iron District operates with strategic hours; the concept is to maximize customer engagement when businesses are most likely to attract patrons. Morning Day Cafe, a breakfast spot for hearty morning meals and coffee, opens its doors at 7 am from Monday through Friday. By 11 am all other food vendors have opened their stalls as well, closing up shop by 2 pm every day."
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/shipping-container-food-hall-kansas-1024x682.webp",
        alt: "shipping container food hall kansas",
        width: 800,
        height: 532
      }
    },
    news: {
      title: "Shipping Container Leafy Green Farms in Kansas City",
      paragraphs: [
        "Brad Fourby, the owner of Leafy Green Farms LLC, is working to revolutionize local produce in Pittsburg. With his hydroponic shipping container farm, he’s able to supply citizens with organic leafy greens like lettuce, basil, and arugula that are harvested fresh daily. When he lived in the heart of Sacramento, Innovative Farms was born. He dedicated his time to constructing and advising those drawn to aquaponics, a method that involves cultivating both fish and plants within confined areas. Unfortunately, many rural communities have no other choice but to pay exorbitant prices for products imported from countries such as China or Argentina; this food is harvested prematurely while also being exposed to potentially hazardous chemicals during transit by sea or land vehicles.",
        "Brad Stroud, director of Live Well Crawford County, has been an avid supporter of bringing more fresh food production to Pittsburg. Joining their collective was a beneficial experience for me. By incorporating farms that cultivate specialty crops unique to the region, interest in this city is expected to be stirred. As a result, businesses will receive greater patronage from visitors. To ensure these new menu items please the community palate they are taking into account chefs’ input and opinions; likewise, restaurants across Pittsburgh have the chance now of offering dishes like those you can only find elsewhere in large cities!"
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/leafy-green-farms-llc.webp",
        alt: "Leafy Green Farms LLC",
        width: 800,
        height: 499
      }
    },
    deliveredLead: [],
    seo: {
      title: "Shipping Containers for Sale in Kansas City Missouri | New & Used",
      description: "Buy shipping containers for sale in Kansas City, Missouri. Durable, weatherproof & delivered fast by a trusted nationwide supplier. Call now!",
      ogImage: "https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2024/05/14063436/google-reviews.webp"
    }
  },
  {
    slug: "laredo-tx",
    depot: "Laredo, TX",
    depotId: 22,
    place: {
      city: "Laredo",
      region: "TX",
      regionName: "Texas",
      label: "Laredo, TX"
    },
    nearbyCities: [
      {
        name: "Abilene",
        href: "/shipping-containers-for-sale-abilene-tx"
      },
      {
        name: "Amarillo",
        href: "/shipping-container-for-sale-amarillo"
      },
      {
        name: "Arlington",
        href: "/shipping-container-for-sale-arlington-tx"
      },
      {
        name: "Big Spring",
        href: "/shipping-containers-for-sale-big-spring-tx"
      },
      {
        name: "Dallas",
        href: "/where-to-buy-shipping-containers/dallas-tx"
      },
      {
        name: "Denton",
        href: "/storage-containers-denton-tx"
      },
      {
        name: "El Paso",
        href: "/where-to-buy-shipping-containers/el-paso-tx"
      },
      {
        name: "Fort Worth",
        href: "/shipping-containers-for-sale-fort-worth-texas"
      },
      {
        name: "Grapevine",
        href: "/container-store-grapevine-tx"
      },
      {
        name: "Houston",
        href: "/where-to-buy-shipping-containers/houston-tx"
      },
      {
        name: "Irving",
        href: "/storage-irving-tx"
      },
      {
        name: "Laredo",
        href: "/where-to-buy-shipping-containers/laredo-tx"
      },
      {
        name: "Lubbock",
        href: "/shipping-containers-for-sale-lubbock"
      },
      {
        name: "Midland",
        href: "/shipping-containers-for-sale-midland-tx"
      },
      {
        name: "Odessa",
        href: "/shipping-containers-for-sale-in-odessa-tx"
      },
      {
        name: "Plano",
        href: "/plano-storage-containers"
      },
      {
        name: "Richardson",
        href: "/container-store-richardson-tx"
      },
      {
        name: "San Antonio",
        href: "/where-to-buy-shipping-containers/san-antonio-tx"
      },
      {
        name: "Tyler",
        href: "/shipping-containers-for-sale-tyler-tx"
      },
      {
        name: "Waco",
        href: "/shipping-containers-for-sale-waco-tx"
      }
    ],
    mapImage: {
      src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/laredo-67208c06eaf39.webp",
      alt: "Map of the Laredo, TX area",
      width: 629,
      height: 558
    },
    featured: {
      title: "Shipping Container Bunkhouse in Texas Shipping Container Bunkhouse in Texas",
      paragraphs: [
        "If you’re fantasizing about building a home out of shipping containers, you will appreciate this serene container bunkhouse situated on a family ranch in Laredo, Texas. Constructed from one 40-foot shipping container and completed with all the essential amenities for living off the grid in 2014, it provides 320 square feet of comfortable interior space. Additionally, there is an additional outdoor area graced by its large covered deck featuring seating areas plus even a television – perfect to enjoy warm evenings!",
        "This 40-foot box home is jam-packed with functional living space – featuring two bedrooms, one bathroom, and a full-sized stainless steel kitchen brimming with upper and lower cabinets for storage. The walls are adorned in multi-colored cedar wood planks creating a modern look that exudes beauty. The master bedroom boasts a queen size bed while the other room contains an automated bunk bed. Moreover, this chic abode also includes an elegant bathroom boasting a stand-up shower complete with a tankless water heater plus toilet as well as sink proving that ample living space can be created within such small confines!"
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/shipping-container-bunkhouse-in-texas.webp",
        alt: "Shipping Container Bunkhouse in Texas",
        width: 736,
        height: 552
      }
    },
    news: {
      title: "Shipping Container Airbnb Treehouse in Texas",
      paragraphs: [
        "Texas native Steve Taylor has achieved his dream of constructing luxurious treehouses, with his first “Air Castle” now available to rent on Airbnb. After devoting a year and a half to transforming four shipping containers into a stunning 50-foot structure, the multi-leveled treehouse boasts two bedrooms, one bathroom, an outdoor screened porch located on the third floor full kitchen amenities, and even its hot tub! Taylor’s business is based on his very first treehouse, and even this creation has many breathtaking features to flaunt. Inside the abode, you can find farm-style decor with floor-to-ceiling windows for a magnificent view of nature; in addition, there is also a balcony next to the kitchen plus an elevated crow’s nest 50 feet above ground level!Texas native Steve Taylor has achieved his dream of constructing luxurious treehouses, with his first “Air Castle” now available to rent on Airbnb. After devoting a year and a half to transforming four shipping containers into a stunning 50-foot structure, the multi-leveled treehouse boasts two bedrooms, one bathroom, an outdoor screened porch located on the third floor full kitchen amenities, and even its hot tub! Taylor’s business is based on his very first treehouse, and even this creation has many breathtaking features to flaunt. Inside the abode, you can find farm-style decor with floor-to-ceiling windows for a magnificent view of nature; in addition, there is also a balcony next to the kitchen plus an elevated crow’s nest 50 feet above ground level!",
        "Located at the end of a secluded street surrounded by trees no neighbors are within sight or sound for up to one mile away. This idea was born when he constructed a two-story 1,400 square foot treehouse as a private home which eventually turned into rentable residences through his thriving business. The treehouse is located in North Texas. Visitors can book a stay on Airbnb for about $330 per night, for a minimum stay of two nights."
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/shipping-container-airbnb-treehouse-in-texas.webp",
        alt: "Shipping Container Airbnb Treehouse in Texas",
        width: 720,
        height: 405
      }
    },
    deliveredLead: [],
    seo: {
      title: "Shipping Containers in Laredo Texas | Top Quality & Best Pricing",
      description: "We have the best prices on new and used shipping containers in Laredo Texas. Call us now for quick delivery or free pick up!",
      ogImage: "https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2024/05/14063436/google-reviews.webp"
    }
  },
  {
    slug: "las-vegas-nv",
    depot: "Las Vegas, NV",
    depotId: 57,
    place: {
      city: "Las Vegas",
      region: "NV",
      regionName: "Nevada",
      label: "Las Vegas, NV"
    },
    nearbyCities: [],
    mapImage: null,
    featured: {
      title: "Shipping Container Homes in Las Vegas",
      paragraphs: [
        "Inspired by their first foray into social entrepreneurship, the Wilsons are striving to repurpose empty shipping containers and transform them into homes for those experiencing homelessness. Their story began when they created \"weekend survival kits\" filled with food that over 100 homeless children pick up at school every Friday to take home to their families. Now, they have taken this mission a step further in an effort to make a lasting difference in the lives of others. With the support of the Maryland Food Bank, the Wilsons have established a backpack program and are now searching for associates to transform 40-foot-long cargo containers into homes.",
        "To make this dream come true, they've asked Jay Orr from ARQ Architects to create plans for a line of container modifications that will fit on what once were vacant row house foundations after their deconstruction or demolition by Baltimore City. The stability and movability these containers provide give them an edge ideal for such uses, yet with one condition they must be designed in such a way as not to draw attention to themselves being cargo boxes. After conducting extensive research, the Wilsons determined that they can convert cargo containers into homes for around $20,000 each. They want to provide families with a rent-to-own option when it comes to these container houses - not as temporary shelters but as permanent housing. To make this dream come true, they visited City Hall and spoke with officials about what would be required of them in order to start their project; happily receiving a positive response along with some helpful advice on partners that could help bridge the disparity between affordable housing needs within the city limits."
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/a-sustainable-solution-1024x576_RcxAHZA.webp",
        alt: "A Sustainable Solution",
        width: 1024,
        height: 576
      }
    },
    news: {
      title: "Shipping Container 3-Star Kitchen in Las Vegas",
      paragraphs: [
        "When Thomas Keller and his team of architects, Envelope A+D, were pressed for time to build a stunning new kitchen for French Laundry's 20th-anniversary celebration, they came up with an inventive solution: cooking in shipping containers! Now one of the world's top restaurants is operating out of these structures. Four shipping containers artfully combined together, you'd almost think the restaurant had not gone through a single alteration. That is partially due to the fact that they managed to transition the prior kitchen's equipment layout in its entirety over to this new spot.",
        "David Breeden, Chef de Cuisine at French Laundry commented that his greatest difficulty was altering where each dish goes for final touches before being presented to guests; previously it ran from left to right while now it needs to go right-to-left. At first, it seemed impossible to close the restaurant for more than three months; however, six and then one year felt too long. After researching alternative venues, they realized that their current building already had a dining room - all they needed was a temporary kitchen. The architects came up with an innovative idea: utilizing shipping containers! Once the source of materials was secured and someone was available to modify them, their dream became a reality."
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/sustainability-and-efficiency-1024x576.webp",
        alt: "Sustainability and Efficiency",
        width: 1024,
        height: 576
      }
    },
    deliveredLead: [],
    seo: {
      title: "Las Vegas, NV - OnsiteStorage",
      description: "4.9 Shipping Containers For Sale Las Vegas, NV Shipping Containers For Sale Las Vegas, NV 100% Satisfaction Guaranteed – Highest Customer Satisfaction -Founded in 2002 (888) 977-9085 WE HAVE CONTAINERS FOR EVERY BUDGET! Explore our top-selling shipping containers available in Las Vegas, NV Get competitive prices and fast delivery across the Las Vegas, NV area....",
      ogImage: "https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2024/05/14063436/google-reviews.webp"
    },
    text: {
      buy: {
        heading: "Buy A Shipping Container In [[Las Vegas]] At the best price"
      }
    }
  },
  {
    slug: "los-angeles-long-beach-ca",
    depot: "Los Angeles / Long Beach, CA",
    depotId: 23,
    place: {
      city: "Los Angeles / Long Beach",
      region: "CA",
      regionName: "California",
      label: "Los Angeles / Long Beach, CA"
    },
    phone: "(323) 986-6805",
    nearbyCities: [
      {
        name: "Anaheim",
        href: "/extra-space-storage-anaheim"
      },
      {
        name: "Bakersfield",
        href: "/shipping-containers-for-sale-bakersfield-ca"
      },
      {
        name: "Chula Vista",
        href: "/shipping-containers-in-chula-vista-ca"
      },
      {
        name: "Corona",
        href: "/extra-space-storage-corona"
      },
      {
        name: "Fontana",
        href: "/shipping-containers-in-fontana-ca"
      },
      {
        name: "Fremont",
        href: "/extra-space-storage-fremont"
      },
      {
        name: "Fresno",
        href: "/shipping-containers-for-sale-fresno"
      },
      {
        name: "Irvine",
        href: "/storage-containers-irvine"
      },
      {
        name: "Los Angeles / Long Beach",
        href: "/where-to-buy-shipping-containers/los-angeles-long-beach-ca"
      },
      {
        name: "Modesto",
        href: "/storage-containers-for-sale-modesto-ca"
      },
      {
        name: "Moreno Valley",
        href: "/extra-space-storage-moreno-valley"
      },
      {
        name: "Orange County",
        href: "/orange-county-storage-containers"
      },
      {
        name: "Riverside",
        href: "/shipping-containers-for-sale-riverside-ca"
      },
      {
        name: "Sacramento",
        href: "/shipping-containers-for-sale-sacramento"
      },
      {
        name: "San Bernardino",
        href: "/shipping-containers-for-sale-san-bernardino"
      },
      {
        name: "San Diego",
        href: "/shipping-containers-for-sale-san-diego"
      },
      {
        name: "San Francisco / Oakland",
        href: "/where-to-buy-shipping-containers/san-francisco-oakland-ca"
      },
      {
        name: "San Jose",
        href: "/shipping-containers-for-sale-san-jose-ca"
      },
      {
        name: "Santa Clarita",
        href: "/extra-space-storage-santa-clarita"
      },
      {
        name: "Stockton",
        href: "/shipping-containers-for-sale-stockton"
      }
    ],
    mapImage: {
      src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/los-angeles-67209489d03d6webpbv_resized_ipadwebpbv.webp",
      alt: "Map of the Los Angeles / Long Beach, CA area",
      width: 586,
      height: 560
    },
    featured: null,
    news: null,
    deliveredLead: [
      {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/atlanta-8-671b565d04559webpbv.webp",
        alt: "Shipping container delivered in Atlanta",
        width: 365,
        height: 362
      },
      {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/new-orleans-4-671b565f2a44fwebpbv.webp",
        alt: "Shipping container delivered in New Orleans",
        width: 365,
        height: 362
      },
      {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/baltimore-7-671b565ebc2a2webpbv.webp",
        alt: "Shipping container delivered in Baltimore",
        width: 365,
        height: 362
      }
    ],
    seo: {
      title: "Shipping Container for Sale Los Angeles | Buy, Rent, Rent-to-Own",
      description: "Shipping container for sale in Los Angeles. Strong, weatherproof, and affordable units ready for fast local delivery. Call us now!",
      ogImage: "https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2024/05/14063436/google-reviews.webp"
    },
    resources: [
      {
        title: "The Ultimate Guide to Storage Containers in Los Angeles, CA",
        paragraphs: [
          "Shipping Container for Sale Los Angeles offers affordable, secure, and versatile storage solutions for homes and businesses.",
          "This guide covers container sizes, rental tips, pros and cons, and how On-Site Storage Solutions can help you save money with fast delivery and reliable service."
        ],
        image: {
          src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/pages/sized/ca4a54c5fede1eb92c38-640w.webp",
          alt: "Shipping Container for sale Los Angeles",
          width: 633,
          height: 356
        },
        href: "/guide-to-storage-containers-los-angeles-ca"
      },
      {
        title: "Shipping Container Storage in Los Angeles: Buy or Rent?",
        paragraphs: [
          "Shipping Container Storage in Los Angeles is becoming the go-to solution for homeowners, businesses, and contractors who need affordable, secure, and flexible space.",
          "In this guide, we explore the benefits of renting versus buying, the different types of containers available, customization options, permit requirements, and tips for getting the best deals from trusted local providers."
        ],
        image: {
          src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/pages/sized/9064dcffe639708b34e7-640w.webp",
          alt: "Shipping Container Storage in Los Angeles Buy or Rent",
          width: 633,
          height: 356
        },
        href: "/shipping-container-storage-in-los-angeles-buy-or-rent"
      },
      {
        title: "Pros and Cons of Portable Storage Containers in Los Angeles",
        paragraphs: [
          "Storage Containers in Los Angeles offer a flexible, affordable, and secure way to handle moving, renovations, or extra storage needs, but before deciding, it’s important to understand both the benefits and drawbacks.",
          "In this blog, we break down the key pros and cons of portable storage containers in Los Angeles, including cost, convenience, space, and placement considerations, to help you choose the right solution with confidence."
        ],
        image: {
          src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/pages/sized/e042e5cadb4cb6f4eeb2-640w.webp",
          alt: "Pros and Cons of Portable Storage Containers in Los Angeles",
          width: 633,
          height: 356
        },
        href: "/portable-storage-containers-los-angeles-pros-and-cons"
      },
      {
        title: "How Container Storage in Los Angeles Saves Businesses Money",
        paragraphs: [
          "Container storage in Los Angeles is helping businesses cut costs, improve efficiency, and stay flexible in a competitive market.",
          "From startups to large corporations, more companies are turning to portable, industrial, and self-storage containers as affordable alternatives to expensive warehouses and long-term leases.",
          "In this blog, we break down how storage containers save money, enhance security, and provide scalable solutions for growing businesses in Los Angeles."
        ],
        image: {
          src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/pages/sized/51b34a4d7e918e07f4ad-640w.webp",
          alt: "How Container Storage in Los Angeles Saves Businesses Money",
          width: 633,
          height: 356
        },
        href: "/how-container-storage-los-angeles-saves-businesses-money"
      }
    ],
    faqYoutubeId: "QXmP401PqNY",
    sections: [
      {
        id: "hero",
        enabled: true
      },
      {
        id: "budgetBand",
        enabled: true
      },
      {
        id: "options",
        enabled: true
      },
      {
        id: "products",
        enabled: true
      },
      {
        id: "buy",
        enabled: true
      },
      {
        id: "delivered",
        enabled: true
      },
      {
        id: "satisfaction",
        enabled: true
      },
      {
        id: "resources",
        enabled: true
      },
      {
        id: "callBand",
        enabled: true
      },
      {
        id: "pricingForm",
        enabled: true
      },
      {
        id: "newsletter",
        enabled: true
      },
      {
        id: "faq",
        enabled: true
      }
    ],
    text: {
      products: {
        heading: "Explore our top-selling shipping containers for sale in [[Los Angeles / Long Beach, CA]]"
      },
      buy: {
        body: "On-Site Storage Solutions is your trusted source for shipping containers for sale in Los Angeles at unbeatable prices.\n\nWe carry a wide range of sizes from 10ft to 40ft, including high cube containers, with options in new, used, and refurbished condition.\n\nServing the greater Los Angeles area, we provide fast delivery and reliable service for residential, commercial, and construction needs.\n\nSan DiegoSan Francisco / OaklandSan JoseSanta ClaritaStockton",
        citiesHeading: "Areas We Also Serve Nearby"
      },
      satisfaction: {
        body: "Buying or renting a container is easy with our satisfaction guarantee. Call our team or order online for simple pricing and fast service."
      }
    }
  },
  {
    slug: "louisville-ky",
    depot: "Louisville, KY",
    depotId: 24,
    place: {
      city: "Louisville",
      region: "KY",
      regionName: "Kentucky",
      label: "Louisville, KY"
    },
    nearbyCities: [
      {
        name: "Ashland",
        href: "/storage-units-ashland-ky"
      },
      {
        name: "Ft Mitchell",
        href: "/storage-near-ft-mitchell-ky"
      },
      {
        name: "Louisville",
        href: "/cargo-containers-for-sale-louisville-ky"
      },
      {
        name: "Somerset",
        href: "/storage-units-somerset-ky"
      },
      {
        name: "Bowling Green",
        href: "/storage-units-bowling-green-ky"
      },
      {
        name: "Georgetown",
        href: "/storage-units-georgetown-ky"
      },
      {
        name: "Newport",
        href: "/storage-units-newport-ky"
      },
      {
        name: "Winchester",
        href: "/storage-units-winchester-ky"
      },
      {
        name: "Covington",
        href: "/storage-units-covington-ky"
      },
      {
        name: "Henderson",
        href: "/storage-units-henderson-ky"
      },
      {
        name: "Nicholasville",
        href: "/storage-units-nicholasville-ky"
      },
      {
        name: "Elizabethtown",
        href: "/storage-units-elizabethtown-ky"
      },
      {
        name: "Hopkinsville",
        href: "/storage-units-hopkinsville-ky"
      },
      {
        name: "Owensboro",
        href: "/storage-units-owensboro-ky"
      },
      {
        name: "Florence",
        href: "/storage-units-florence-ky"
      },
      {
        name: "Lexington",
        href: "/storage-units-lexington-ky"
      },
      {
        name: "Paducah",
        href: "/storage-units-paducah-ky"
      },
      {
        name: "Frankfort",
        href: "/storage-units-frankfort-ky"
      },
      {
        name: "London",
        href: "/storage-units-london-ky"
      },
      {
        name: "Richmond",
        href: "/storage-units-richmond-ky"
      }
    ],
    mapImage: {
      src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/louisville-67209aeb4c792.webp",
      alt: "Map of the Louisville, KY area",
      width: 564,
      height: 549
    },
    featured: {
      title: "Shipping Container Apartment in Louisville",
      paragraphs: [
        "In the Phoenix Hill area, brand-new shipping container homes are ready to be occupied; each apartment is constructed from two 8ft wide and 40 ft long cargo containers! By cutting out the middle of both units and putting them together, a one-bedroom/one-bath living space called the Re-Nu Container Homes was created. Out of all six properties there, four are residential while two can be rented through Airbnb.",
        "The newly-constructed homes, located at the corner of Wenzel and East Jefferson, are a minimalist’s dream come true. With 600 square feet of living space complete with full kitchens, one bathroom per unit, washers and dryers (with balconies included in upstairs units), these abodes provide everything necessary for an enjoyable downtown lifestyle. Not only that, they’re eco-friendly too! Explore your neighborhood by foot; from coffee shops to breweries to restaurants there is no shortage of adrenaline or entertainment here."
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/nulu-apartment-complex.webp",
        alt: "nulu apartment complex",
        width: 700,
        height: 467
      }
    },
    news: {
      title: "Shipping Container Home in Kentucky",
      paragraphs: [
        "After living in substandard conditions, Joann Priddy is finally getting a well-deserved reprieve. She will be moving into an unprecedented home located south of Elizabethtown and believed to be the first constructed from a shipping container in Kentucky! Her new abode features a wood-burning stove made from an oil drum for warmth and meals, as well as an outhouse with roofing repairs and a shower curtain for privacy. At long last, Joann’s circumstances are about to change drastically for the better!",
        "Housing advocates assert that containers have become a budget-friendly, yet trendy option for low-income residents looking to build homes or buildings. This trend has not gone unnoticed in Louisville, where entrepreneurs are embracing the use of steel boxes as an economical and fashionable choice. In fact, six of these shipping containers will be cut, welded, stacked, and converted into a sophisticated boutique along with a café and visitor center this fall upon the grand opening of Butchertown’s newest brandy distillery!"
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/container-homes-kentucky-1024x576.webp",
        alt: "container homes kentucky",
        width: 800,
        height: 450
      }
    },
    deliveredLead: [
      {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/atlanta-8-671b565d04559webpbv.webp",
        alt: "Shipping container delivered in Atlanta",
        width: 365,
        height: 362
      },
      {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/new-orleans-4-671b565f2a44fwebpbv.webp",
        alt: "Shipping container delivered in New Orleans",
        width: 365,
        height: 362
      },
      {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/baltimore-7-671b565ebc2a2webpbv.webp",
        alt: "Shipping container delivered in Baltimore",
        width: 365,
        height: 362
      }
    ],
    seo: {
      title: "Shipping Container for Sale Louisville KY | Buy, Rent, Rent-to-Own",
      description: "Shop shipping container for sale Louisville KY. Buy, rent, or rent-to-own quality units at unbeatable prices. Call us now!",
      ogImage: "https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2024/05/14063436/google-reviews.webp"
    }
  },
  {
    slug: "memphis-tn",
    depot: "Memphis, TN",
    depotId: 25,
    place: {
      city: "Memphis",
      region: "TN",
      regionName: "Tennessee",
      label: "Memphis, TN"
    },
    nearbyCities: [
      {
        name: "Antioch",
        href: "/storage-units-antioch"
      },
      {
        name: "Cordova",
        href: "/cordova-portable-storage-container"
      },
      {
        name: "Kingsport",
        href: "/kingsport-storage-units"
      },
      {
        name: "Murfreesboro",
        href: "/shipping-containers-for-sale-murfreesboro-tn"
      },
      {
        name: "Chattanooga",
        href: "/shipping-containers-for-sale-chattanooga"
      },
      {
        name: "Crossville",
        href: "/storage-units-crossville-tennessee"
      },
      {
        name: "Knoxville",
        href: "/shipping-container-for-sale-knoxville-tn"
      },
      {
        name: "Nashville",
        href: "/metal-storage-nashville-tn"
      },
      {
        name: "Clarksville",
        href: "/storage-containers-clarksville-tn"
      },
      {
        name: "Franklin",
        href: "/storage-units-franklin-tn"
      },
      {
        name: "Lebanon",
        href: "/shipping-containers-lebanon-tn"
      },
      {
        name: "Cleveland",
        href: "/shipping-containers-for-sale-cleveland"
      },
      {
        name: "Hendersonville",
        href: "/storage-units-in-hendersonville-tn"
      },
      {
        name: "Maryville",
        href: "/storage-units-maryville-tn"
      },
      {
        name: "Columbia",
        href: "/shipping-container-for-sale-columbia"
      },
      {
        name: "Jackson",
        href: "/shipping-containers-for-sale-jackson-tn"
      },
      {
        name: "Memphis",
        href: "/cargo-containers-for-sale-in-memphis-tn"
      },
      {
        name: "Cookeville",
        href: "/shipping-containers-cookeville-tn"
      },
      {
        name: "Johnson City",
        href: "/storage-containers-johnson-city-tn"
      },
      {
        name: "Morristown",
        href: "/storage-units-morristown-tn"
      }
    ],
    mapImage: {
      src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/memphis-67209f1e8c0b2.webp",
      alt: "Map of the Memphis, TN area",
      width: 558,
      height: 561
    },
    featured: {
      title: "Memphis Shipping Container Park",
      paragraphs: [
        "The city of Memphis has outlined a plan to re-energize the downtown area and Mississippi River Parks by introducing open-air dining pavilions made out of shipping containers. In their letter of intent, they state that this project is meant to “bring people back downtown and to the Mississippi River” in order to transform public spaces along its banks. The ‘Memphis Riverfront Concept’ is a plan to link and guide development while boosting its ecological, commercial, cultural, and recreational aspects.",
        "This park will be changed into an energetic social center filled with exceptional areas that can accommodate various activities like casual sports events or small-scale gatherings. In addition to the pavilions made of shipping containers, they are also planning on building a tree house above the playground area in the park for added fun! The shipping containers will be used as dining pavilions, creating an exciting new way to enjoy the outdoors and view the Mississippi River. They are planning on using recycled materials as much as possible throughout this construction process in order to keep sustainability a priority while still providing a remarkable experience for park-goers."
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/container-park-memphis.webp",
        alt: "container park memphis",
        width: 800,
        height: 449
      }
    },
    news: {
      title: "Memphis Shipping Container Apartment Complex",
      paragraphs: [
        "A visionary entrepreneur has big plans to revolutionize the Memphis Medical District; his novel concept entails building a two-story, 14-unit apartment complex entirely from repurposed shipping containers. This bold endeavor would explore uncharted territory in terms of how these iconic metal boxes are being utilized for both commercial and residential purposes in Memphis. Fred Spikner is petitioning the Board of Adjustment to obtain a special-use permit that would allow him to construct apartments from metal containers at 126 N. Bellevue. These dwellings will feature four two-story units with 800 square feet and ten single-level units measuring 640 square feet respectively.",
        "With an already established history in this area, having Park Place Recycling and Logistics located at 815 E Georgia along with his own embroidery business on 1210 Madison, Mr.Spinkeer has proven himself as a reliable member of the community ready for new challenges ahead! The city’s plan to enliven its downtown and nearby Mississippi River Parks includes the integration of shipping containers into open-air dining pavilions. By utilizing these unique spaces for recreation, gatherings, and activities by the riverbank it is anticipated that visitors will be naturally drawn back to this part of town."
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/memphis-shipping-container-apartment-complex-1024x768.webp",
        alt: "Memphis Shipping Container Apartment Complex",
        width: 800,
        height: 600
      }
    },
    deliveredLead: [],
    seo: {
      title: "Shipping Container For Sale Memphis | Top Quality & Low Prices",
      description: "Shipping container for sale Memphis. Lowest pricing, huge selection and quick delivery. Get your container now!",
      ogImage: "https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2024/05/14063436/google-reviews.webp"
    }
  },
  {
    slug: "miami-fl",
    depot: "Miami, FL",
    depotId: 26,
    place: {
      city: "Miami",
      region: "FL",
      regionName: "Florida",
      label: "Miami, FL"
    },
    nearbyCities: [
      {
        name: "Boca Raton",
        href: "/all-city/storage-units-boca-raton"
      },
      {
        name: "Jacksonville",
        href: "/all-city/cargo-containers-for-sale-jacksonville-fl"
      },
      {
        name: "Orlando",
        href: "/all-city/shipping-containers-for-sale-orlando"
      },
      {
        name: "Tampa",
        href: "/all-city/cargo-containers-for-sale-tampa"
      },
      {
        name: "Bradenton",
        href: "/all-city/storage-units-bradenton-fl"
      },
      {
        name: "Kissimmee",
        href: "/all-city/storage-units-kissimmee-fl"
      },
      {
        name: "Pensacola",
        href: "/all-city/shipping-containers-for-sale-pensacola"
      },
      {
        name: "West Palm Beach",
        href: "/all-city/shipping-containers-for-sale-west-palm-beach"
      },
      {
        name: "Fort Lauderdale",
        href: "/all-city/shipping-containers-for-sale-fort-lauderdale"
      },
      {
        name: "Lake Worth",
        href: "/all-city/storage-units-lake-worth-fl"
      },
      {
        name: "Pompano Beach",
        href: "/all-city/storage-units-pompano-beach-fl"
      },
      {
        name: "Fort Myers",
        href: "/all-city/shipping-containers-for-sale-fort-myers-fl"
      },
      {
        name: "Lakeland",
        href: "/all-city/shipping-containers-lakeland-fl"
      },
      {
        name: "Saint Petersburg",
        href: "/all-city/storage-saint-petersburg-florida"
      },
      {
        name: "Hialeah",
        href: "/all-city/storage-units-hialeah"
      },
      {
        name: "Miami",
        href: "/all-city/cargo-containers-for-sale-miami"
      },
      {
        name: "Sarasota",
        href: "/all-city/storage-units-sarasota-fl"
      },
      {
        name: "Hollywood",
        href: "/all-city/storage-hollywood-fl"
      },
      {
        name: "Naples",
        href: "/all-city/shipping-containers-for-sale-naples-fl"
      },
      {
        name: "Tallahassee",
        href: "/all-city/shipping-containers-for-sale-tallahassee-fl"
      }
    ],
    mapImage: {
      src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/miami-6720a5573dc37webpbv_resized_ipadwebpbv.webp",
      alt: "Map of the Miami, FL area",
      width: 597,
      height: 557
    },
    featured: {
      title: "Shipping Container Louis Vuitton Pop-Up in Miami",
      paragraphs: [
        "The Miami Design District’s Jungle Plaza will host an immersive installation for Louis Vuitton’s Spring-Summer 2021 Men’s Collection in a North American premiere. Virgil Abloh, the Artistic Director of Louis Vuitton Menswear, created “The Adventures of Zoooom with Friends,” a vibrant universe that serves as the backdrop to this international display and embodies their commitment to inclusion. Visitors can explore the collection while being taken away on a wild ride where anything is possible! Louis Vuitton’s innovative spirit was illustrious in Shanghai and Tokyo with the spectacular “Zoooom with Friends” balloons, which traversed across the globe.",
        "At Jungle Plaza guests can enjoy an exciting outdoor setting featuring massive balloon figures placed among customized shipping containers as well as eccentric sculptures. Adding to this captivating experience is a custom Augmented Reality journey that provides an immersive adventure for all visitors of Louis Vuitton’s temporary residency. Louis Vuitton has unveiled a new collection composed of four pillars: updated looks crafted of recycled fabrics, pieces derived from the Fall-Winter 2020 line, innovative designs imagined during lockdown by their studio with second-hand textiles, and fresh ideas developed from existing concepts. With this pop-up event, patrons have the unique chance to preorder these special items before they debut in stores around the world."
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/shipping-container-louis-vuitton-pop-up-in-miami-1024x597webpbv_resized_ipadwebpbv.webp",
        alt: "Shipping Container Louis Vuitton Pop-Up in Miami",
        width: 680,
        height: 396
      }
    },
    news: {
      title: "Shipping Container Home in Miami",
      paragraphs: [
        "For Zack and Brie Smithey, the fragrance of aged tires will be linked to their home forever. In 2016, they constructed a two-story structure composed of eight shipping containers – those large metal boxes that transport all kinds of products (and sometimes tires). These containers were manufactured in Shanghai before they traveled across the world 12 times with goods until finally arriving at a yard in St. Louis where the couple inspected what would become their house.",
        "The Smitheys found shipping containers a perfect opportunity to demonstrate their one-of-a-kind style and help reduce waste. To keep the project on budget, however, it meant that most of the labor had to be done by them. Many do not realize how much work is involved with constructing container homes – from kitchens and bathrooms, HVAC systems, and wiring for electricity or plumbing; all these essential details are still necessary! In spite of this difficulty, they were able to produce a beautiful home full of unique upcycled features!"
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/shipping-container-home-in-miami-1024x576webpbv_resized_ipadwebpbv.webp",
        alt: "Shipping Container Home in Miami",
        width: 680,
        height: 382
      }
    },
    deliveredLead: [],
    seo: {
      title: "Shipping Containers for Sale Miami | Top Quality & Lowest Prices",
      description: "Shipping containers for sale in Miami. Buy, rent, or rent-to-own durable new & used containers with fast delivery. Call us now!",
      ogImage: "https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2024/05/14063436/google-reviews.webp"
    },
    text: {
      products: {
        heading: "Explore our top-selling shipping containers for sale in [[Miami, FL]]"
      }
    }
  },
  {
    slug: "minneapolis-mn",
    depot: "Minneapolis, MN",
    depotId: 27,
    place: {
      city: "Minneapolis",
      region: "MN",
      regionName: "Minnesota",
      label: "Minneapolis, MN"
    },
    nearbyCities: [
      {
        name: "Andover",
        href: "/storage-units-andover-mn"
      },
      {
        name: "Elk River",
        href: "/storage-units-elk-river-mn"
      },
      {
        name: "Moorhead",
        href: "/storage-units-moorhead-mn"
      },
      {
        name: "Stillwater",
        href: "/storage-units-stillwater-mn"
      },
      {
        name: "Anoka",
        href: "/storage-units-in-anoka-mn"
      },
      {
        name: "Hopkins",
        href: "/storage-units-hopkins-mn"
      },
      {
        name: "Osseo",
        href: "/storage-osseo-mn"
      },
      {
        name: "Winona",
        href: "/storage-units-winona-mn"
      },
      {
        name: "Burnsville",
        href: "/storage-units-burnsville-mn"
      },
      {
        name: "Inver Grove Heights",
        href: "/storage-units-in-inver-grove-heights-mn"
      },
      {
        name: "Rochester",
        href: "/storage-units-rochester-mn"
      },
      {
        name: "Cottage Grove",
        href: "/storage-units-cottage-grove-mn"
      },
      {
        name: "Lakeville",
        href: "/storage-lakeville-mn"
      },
      {
        name: "Saint Cloud",
        href: "/saint-cloud-mn-storage"
      },
      {
        name: "Duluth",
        href: "/storage-units-duluth-mn"
      },
      {
        name: "Mankato",
        href: "/storage-units-mankato-mn"
      },
      {
        name: "Saint Paul",
        href: "/saint-paul-mn-storage"
      },
      {
        name: "Eden Prairie",
        href: "/storage-units-in-eden-prairie-mn"
      },
      {
        name: "Minneapolis",
        href: "/cargo-containers-minneapolis"
      },
      {
        name: "Shakopee",
        href: "/storage-units-shakopee-mn"
      }
    ],
    mapImage: {
      src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/minea-6720ac040422b.webp",
      alt: "Map of the Minneapolis, MN area",
      width: 572,
      height: 556
    },
    featured: {
      title: "Shipping Container Decor in Minnesota",
      paragraphs: [
        "At Victoria Burrow, you can enjoy delectable street food and drinks served from two shipping containers. In addition to the delicious eats and beverages, there’s an exciting range of activities like axe-throwing, mini golfing, bocce ball playing, virtual reality gaming, and arcade diving into games galore darts being one of them! Bean bag toss/corn hole is provided along with oversized Connect 4 for extra fun. These facilities were brought in after we bought two 20′ containers from Super Cubes, a red new container & a blue used water-tight container that has been cut up to serve as decorations throughout the restaurant. Step into the world of containers through a set of blue doors and experience the unique container displays. This restaurant bar is an exciting attraction that offers guests another way to witness the interior beauty of this structure with its red container doors, sides, and portions of walls providing shade for the area.",
        "You can even sit within one while savoring your meal you won’t want to miss out on such an amazing opportunity! The container area provides an exclusive dining experience within the restaurant. From this private section, patrons can truly appreciate the physical structure of the container as well as observe all other features of their surroundings. When ordering or collecting food, customers are privileged to be able to enjoy containers up close just like they would at a food truck! All dishes are ordered and retrieved from concession windows that have been crafted out of repurposed shipping containers."
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/shipping-container-decor-in-minnesota.webp",
        alt: "Shipping Container Decor in Minnesota",
        width: 600,
        height: 600
      }
    },
    news: {
      title: "Shipping Container-Themed Restaurant in Minneapolis",
      paragraphs: [
        "Just in time for the Timberwolves season, a new restaurant is emerging on the 6th Street corridor along Target Center in downtown Minneapolis! Set to take over former Hubert’s, which recently closed its doors earlier this year, Cargo Food Authority is Chef/Owner Brian Ingram’s latest concept. It pays homage to St. Paul’s Seventh Street Truck Park of which Ingram was Chief Operations Officer (but no longer involved). Rather than food trucks, shipping containers line the walls of this eatery and each offers up mouthwatering cuisine varying from tacos and wings to pizza and Pan-Asian delights! Ingram’s new venture, Cargo, showcases an industrial warehouse vibe inspired by the North Loop along with a hint of Berlin graffiti artistry.",
        "In fact, he and his wife Sarah actually took a graffiti class in Berlin to hone their craft! And when you take a look at the cargo containers adorning this spot near Wrigley Field in Chicago, it will be easy for you to recognize Sarah’s unique artistic style. Adding on top of that Bus Stop nearby U.S Bank Stadium and the soon-to-be-opened restaurant next up is just another example of how far they’ve come since then! The arena menu offers a variety of unique, enticing options for adults and children alike. For those with adventurous palates, there’s the “crazy” mango curry duck wings; or maybe you’d prefer to get your hands on one of these pizza-burrito hybrids called “pizza ritos”. And if that wasn’t enough, they also have an enormous foot-long egg roll, something which satisfies the particular cravings of Ingram who was always dying for more lumpia (Filipino spring rolls)."
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/shipping-container-themed-restaurant-in-minneapolis.webp",
        alt: "Shipping Container-Themed Restaurant in Minneapolis",
        width: 800,
        height: 600
      }
    },
    deliveredLead: [
      {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/atlanta-8-671b565d04559webpbv.webp",
        alt: "Shipping container delivered in Atlanta",
        width: 365,
        height: 362
      },
      {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/new-orleans-4-671b565f2a44fwebpbv.webp",
        alt: "Shipping container delivered in New Orleans",
        width: 365,
        height: 362
      },
      {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/baltimore-7-671b565ebc2a2webpbv.webp",
        alt: "Shipping container delivered in Baltimore",
        width: 365,
        height: 362
      }
    ],
    seo: {
      title: "Shipping Container For Sale Minneapolis | Top Quality & Low Price",
      description: "At the most affordable pricing, we have a huge selection of shipping containers for sale in Minneapolis. Get your container now!",
      ogImage: "https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2024/05/14063436/google-reviews.webp"
    }
  },
  {
    slug: "mobile-al",
    depot: "Mobile, AL",
    depotId: 28,
    place: {
      city: "Mobile",
      region: "AL",
      regionName: "Alabama",
      label: "Mobile, AL"
    },
    nearbyCities: [
      {
        name: "Anniston",
        href: "/storage-units-anniston-al"
      },
      {
        name: "Decatur",
        href: "/decatur-shipping-containers"
      },
      {
        name: "Mobile",
        href: "/cargo-containers-mobile-alabama"
      },
      {
        name: "Selma",
        href: "/storage-units-selma-al"
      },
      {
        name: "Athens",
        href: "/shipping-containers-for-sale-athens"
      },
      {
        name: "Dothan",
        href: "/storage-containers-dothan-al"
      },
      {
        name: "Montgomery",
        href: "/storage-containers-montgomery-al"
      },
      {
        name: "Tuscaloosa",
        href: "/shipping-containers-for-sale-tuscaloosa"
      },
      {
        name: "Auburn",
        href: "/auburn-storage-units"
      },
      {
        name: "Florence",
        href: "/storage-unit-in-florence"
      },
      {
        name: "Northport",
        href: "/storage-units-northport-al"
      },
      {
        name: "Bessemer",
        href: "/storage-units-bessemer-al"
      },
      {
        name: "Gadsden",
        href: "/storage-containers-gadsden-al"
      },
      {
        name: "Opelika",
        href: "/storage-units-opelika-al"
      },
      {
        name: "Birmingham",
        href: "/shipping-containers-for-sale-birmingham-al"
      },
      {
        name: "Huntsville",
        href: "/shipping-container-huntsville-alabama"
      },
      {
        name: "Phenix City",
        href: "/phenix-city-storage-units"
      },
      {
        name: "Cullman",
        href: "/storage-unit-cullman-al"
      },
      {
        name: "Madison",
        href: "/storage-units-madison-al"
      },
      {
        name: "Prattville",
        href: "/storage-prattville-al"
      }
    ],
    mapImage: {
      src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/mobile-6720afa4db735.webp",
      alt: "Map of the Mobile, AL area",
      width: 556,
      height: 557
    },
    featured: {
      title: "Shipping Container Farm in Alabama",
      paragraphs: [
        "The Auburn University College of Agriculture, in collaboration with Campus Dining, is pushing the boundaries by utilizing recycled shipping containers as state-of-the-art hydroponic “vertical” farms to cultivate produce for students. To achieve this feat, two Freight Farms shipping containers were acquired and innovatively transformed into soilless growing stations that utilize water and LED lights to nurture plants vertically indoors. Not only has this novel idea introduced a more sustainable way of growing food but it also presents an opportunity for students to enjoy locally sourced goods on campus daily!",
        "Daniel Wells, an Associate Professor of Horticulture, taught a vertical farming course and is now in charge of the operations. The containers have been outfitted with state-of-the-art climate control systems that include air conditioning and humidity regulation to provide the plants with consistent temperatures all year round. Additionally, there’s also an advanced lighting system made up of two color LEDs which delivers enough light for growth and flourishing! By regulating carbon dioxide levels, the containers built by Freight Farms enable significantly accelerated plant growth. This Boston-based company is present in 45 states and 28 countries around the world."
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/shipping-container-farm-in-alabama-1024x680.webp",
        alt: "Shipping Container Farm in Alabama",
        width: 800,
        height: 531
      }
    },
    news: {
      title: "Shipping Container Home in Alabama",
      paragraphs: [
        "Eight years ago, when the construction industry began to deteriorate, an Alabama couple decided to take a leap of faith. They sold their steel building company in Florida and seized the opportunity for a fresh start by relocating to Oneonta with land already owned that summer in 2009. The ambitious couple then constructed their 2000-square-foot home out of four 40-foot-long shipping containers from Miami’s port and one extra container exclusively used for storage unit purposes. Bryan diligently transported the containers, steel beams, and other necessary items from Fort Myers, Fla. to build their unique home. The leftover steel used in construction was also sourced from past projects back in Florida.",
        "It’s no wonder then that shipping container structures were chosen for their abode: they are strong, sustainable, and cost-effective building blocks! Dallas-based Cypress Equities is transforming Town Center with its creative plan to install seven shipping containers that will become bustling shops, restaurants, bars, and coffee spots! Jake Szczepanski of Cypress stated his vision for the complex to be an exciting entertainment hub. With this innovative concept, passersby will be delighted by a unique experience in Town Center."
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/shipping-container-home-in-alabama.webp",
        alt: "Shipping Container Home in Alabama",
        width: 800,
        height: 535
      }
    },
    deliveredLead: [],
    seo: {
      title: "Shipping Containers for Sale Mobile AL | Buy, Rent & Rent-to-Own",
      description: "Find shipping containers for sale Mobile AL with flexible options: buy, rent, or rent to own. Durable, weatherproof units delivered fast.",
      ogImage: "https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2024/05/14063436/google-reviews.webp"
    }
  },
  {
    slug: "montreal-qb",
    depot: "Montreal, QB",
    depotId: 29,
    place: {
      city: "Montreal",
      region: "QC",
      regionName: "Québec",
      label: "Montreal, QC"
    },
    nearbyCities: [
      {
        name: "Westmount",
        href: "/westmount-storage"
      },
      {
        name: "Montreal",
        href: "/sea-containers-montreal"
      },
      {
        name: "Mont Royal",
        href: "/mont-royal-storage-unit"
      },
      {
        name: "Saint Lambert",
        href: "/storage-saint-lambert"
      },
      {
        name: "Cote Saint Luc",
        href: "/storage-unit-cote-saint-luc"
      },
      {
        name: "Montreal Ouest",
        href: "/montreal-quest-storage-unit"
      },
      {
        name: "Longueuil",
        href: "/storage-longueuil"
      },
      {
        name: "Sainte Therese",
        href: "/storage-unit-sainte-therese"
      },
      {
        name: "Hampstead",
        href: "/hampstead-storage-units"
      },
      {
        name: "Brossard",
        href: "/storage-units-brossard"
      },
      {
        name: "Dorval",
        href: "/storage-dorval"
      },
      {
        name: "Quebec",
        href: "/storage-units-quebec"
      },
      {
        name: "Dollard Des Ormeaux",
        href: "/storage-dollard-des-ormeaux"
      },
      {
        name: "Chateauguay",
        href: "/storage-chateauguay"
      },
      {
        name: "Laval",
        href: "/storage-units-laval"
      },
      {
        name: "Sainte Catherine",
        href: "/sainte-catherine-storage"
      },
      {
        name: "Plessisville",
        href: "/plessisville-storage"
      },
      {
        name: "Saint Eustache",
        href: "/saint-eustache-storage"
      },
      {
        name: "Pointe Claire",
        href: "/storage-units-point-claire"
      },
      {
        name: "Kirkland",
        href: "/storage-units-kirkland"
      }
    ],
    mapImage: {
      src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/montreal-67232b187d800.webp",
      alt: "Map of the Montreal, QC area",
      width: 563,
      height: 557
    },
    featured: {
      title: "Shipping Container MuvBox in Montreal",
      paragraphs: [
        "Müvbox is a revolutionary idea that combines elements of Fast Food Nation and Shipping Container Nation, creating something both visually captivating and flavorful. Hailing from Montreal, Canada, the concept consists of a shipping container that opens up into an outdoor mobile restaurant with its own gourmet kitchen. It’s almost like Adam Kalkin’s Push Button House in appearance but even more tantalizing when you factor in the mouth-watering local lobster straight from the Magdalen Islands!",
        "Daniel Noiseux, the owner of the renowned Montreal Pizzaiolle restaurants, opened his very first concept restaurant at the historical Old Port in Montreal. Here he is able to deliver fresh, locally sourced, and gourmet cuisine while offering prices that are easy on the wallet. The peculiarity of this enterprise lies with his Müvbox as it’s portable; allowing him to take it anywhere – a festival outdoors, a new venue, or even an event convention. Müvbox, a restaurant made from an upcycled 20-foot shipping container, can seat 28 people and has been outfitted with modern kitchen appliances that are powered by 40% solar energy on the rooftop. The remaining 60%, which likely comes from propane fuel for kitchen equipment, is also eco-friendly. Additionally, this sustainable eatery features recycled tires as flooring and offers local dishes such as Îles-de-la-Madeleine lobster, Brome Lake duck, and Bilboquet ice cream all of which are healthy options!"
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/shipping-container-muvbox-in-montreal.webp",
        alt: "Shipping Container MuvBox in Montreal",
        width: 468,
        height: 312
      }
    },
    news: {
      title: "Shipping Container Cottage in Quebec",
      paragraphs: [
        "Utilizing pre-owned shipping containers for an innovative new purpose has been endlessly explored over the years. From construction sites that have repurposed them into offices to events utilizing them as temporary facilities, even more, daring individuals who wished to build houses from these boxes of metal. The possibilities are endless with used shipping containers!",
        "In Quebec, renowned architect Pierre Morency crafted the first home from an old shipping container. By assembling three of these containers, he constructed a family cottage that stunned onlookers and earned him the Marcel-Parizeau Prize of Excellence from the Ordre des Architects du Québec. Both creative and ingenious in its conception, this project was born out of his two sons’ dreams: one to own a spaceship and another wishing for a treehouse. Ultimately what emerged were two desires fulfilling an exquisite hideaway nestled amongst nature’s serenity that is as practical as it is attractive!"
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/shipping-container-cottage-in-quebec.webp",
        alt: "Shipping Container Cottage in Quebec",
        width: 640,
        height: 360
      }
    },
    deliveredLead: [],
    seo: {
      title: "Shipping Container Montreal | Top Quality & Best Pricing",
      description: "Shipping Container Montreal. Available for sale and rental. On-site storage has the lowest prices! For huge discounts. Call now!",
      ogImage: "https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2024/05/14063436/google-reviews.webp"
    }
  },
  {
    slug: "nashville-tn",
    depot: "Nashville, TN",
    depotId: 30,
    place: {
      city: "Nashville",
      region: "TN",
      regionName: "Tennessee",
      label: "Nashville, TN"
    },
    nearbyCities: [
      {
        name: "Antioch",
        href: "/storage-units-antioch"
      },
      {
        name: "Cordova",
        href: "/cordova-portable-storage-container"
      },
      {
        name: "Kingsport",
        href: "/kingsport-storage-units"
      },
      {
        name: "Murfreesboro",
        href: "/shipping-containers-for-sale-murfreesboro-tn"
      },
      {
        name: "Chattanooga",
        href: "/shipping-containers-for-sale-chattanooga"
      },
      {
        name: "Crossville",
        href: "/storage-units-crossville-tennessee"
      },
      {
        name: "Knoxville",
        href: "/shipping-container-for-sale-knoxville-tn"
      },
      {
        name: "Nashville",
        href: "/metal-storage-nashville-tn"
      },
      {
        name: "Clarksville",
        href: "/storage-containers-clarksville-tn"
      },
      {
        name: "Franklin",
        href: "/storage-units-franklin-tn"
      },
      {
        name: "Lebanon",
        href: "/shipping-containers-lebanon-tn"
      },
      {
        name: "Cleveland",
        href: "/shipping-containers-for-sale-cleveland"
      },
      {
        name: "Hendersonville",
        href: "/storage-units-in-hendersonville-tn"
      },
      {
        name: "Maryville",
        href: "/storage-units-maryville-tn"
      },
      {
        name: "Columbia",
        href: "/shipping-container-for-sale-columbia"
      },
      {
        name: "Jackson",
        href: "/shipping-containers-for-sale-jackson-tn"
      },
      {
        name: "Memphis",
        href: "/cargo-containers-for-sale-in-memphis-tn"
      },
      {
        name: "Cookeville",
        href: "/shipping-containers-cookeville-tn"
      },
      {
        name: "Johnson City",
        href: "/storage-containers-johnson-city-tn"
      },
      {
        name: "Morristown",
        href: "/storage-units-morristown-tn"
      }
    ],
    mapImage: {
      src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/nashville-6720c89a0258c.webp",
      alt: "Map of the Nashville, TN area",
      width: 641,
      height: 557
    },
    featured: {
      title: "Shipping Container Restaurant in Nashville",
      paragraphs: [
        "Nashville is an incredibly daring city when it comes to architectural design and culinary innovation. The plant-based restaurant Avo, located in West Nashville, has become a hit with locals due to its inventive menu offerings served out of a converted shipping container! Even if you’ve already experienced the one-of-a-kind atmosphere of Avo before, chances are you’ll still want to return soon for another visit. AVO has taken the dining world by storm with its delicious avocado margaritas and locally sourced vegan ingredients, but its innovation does not stop there. They have artfully crafted a breathtaking restaurant experience out of an ordinary shipping container – a modern sanctuary that is both aesthetically pleasing and environmentally conscious.",
        "The menu consists of fresh, raw vegan cuisine that is sure to delight any diner with exceptional flavor combinations and impeccable hospitality. This Millennial-inspired concept will surely bring you culinary satisfaction at a higher-than-average price point but it’s worth every penny! If you’re looking to tantalize your taste buds, come by 3 City Avenue, Suite 200 any day of the week except Sundays they will be open from 11 am – 9 pm Monday through Saturday!"
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/plant-based-restaurant-avo-1024x683.webp",
        alt: "Shipping Container Restaurant in Nashville",
        width: 800,
        height: 533
      }
    },
    news: {
      title: "Shipping Container Dorms in Nashville",
      paragraphs: [
        "Fisk University, having seen a surge in enrollment with 63 percent growth over the past five years, has been presented with an overflowing student population of 1,015 – their biggest since 1979. As such, they have decided to get creative and offer up refurbished steel shipping containers as residential units for students starting in fall 2023! This is just one way people can actually live inside these strong storage boxes; another option would be to jump on board a box ship bound for Australia (if you’re brave enough).",
        "By 2024, Fisk University in Nashville, Tennessee plans to launch a new traditional dormitory with an additional 330 beds. Many universities opt for renting out hotels when they have too many students; however, Fisk is choosing to invest in 100 units made from prefabricated shipping containers! This innovative decision will not only save the university money but also provide modern and eco-friendly living spaces for its students."
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/shipping-container-dorms-in-nashville-1024x683.webp",
        alt: "Shipping Container Dorms in Nashville",
        width: 800,
        height: 533
      }
    },
    deliveredLead: [],
    seo: {
      title: "Shipping Containers Nashville | Top Quality & Best Pricing",
      description: "We have the best prices on new and used shipping containers in Nashville. Call us now for quick delivery or free pick up!",
      ogImage: "https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2024/05/14063436/google-reviews.webp"
    }
  },
  {
    slug: "new-orleans-la",
    depot: "New Orleans, LA",
    depotId: 31,
    place: {
      city: "New Orleans",
      region: "LA",
      regionName: "Louisiana",
      label: "New Orleans, LA"
    },
    nearbyCities: [
      {
        name: "Alexandria",
        href: "/storage-units-alexandria-la"
      },
      {
        name: "Hammond",
        href: "/shipping-containers-hammond-la"
      },
      {
        name: "Marrero",
        href: "/storage-units-marrero-la"
      },
      {
        name: "Slidell",
        href: "/slidell-la-storage-units"
      },
      {
        name: "Baton Rogue",
        href: "/baton-rogue-la-storage"
      },
      {
        name: "Houma",
        href: "/storage-units-houma-la"
      },
      {
        name: "Metairie",
        href: "/storage-units-metairie-la"
      },
      {
        name: "West Monroe",
        href: "/storage-units-west-monroe-la"
      },
      {
        name: "Bossier City",
        href: "/storage-bossier-city-la"
      },
      {
        name: "Kenner",
        href: "/storage-units-kenner-la"
      },
      {
        name: "Monroe",
        href: "/storage-units-monroe-la"
      },
      {
        name: "Covington",
        href: "/storage-units-covington-la"
      },
      {
        name: "Lafayette",
        href: "/shipping-containers-for-sale-lafayette-la"
      },
      {
        name: "New Iberia",
        href: "/storage-new-iberia-la"
      },
      {
        name: "Denham Springs",
        href: "/storage-denham-springs-la"
      },
      {
        name: "Lake Charles",
        href: "/storage-units-lake-charles-la"
      },
      {
        name: "New Orleans",
        href: "/cargo-containers-for-sale-new-orleans"
      },
      {
        name: "Gretna",
        href: "/storage-units-gretna-la"
      },
      {
        name: "Mandeville",
        href: "/storage-units-mandeville-la"
      },
      {
        name: "Shreveport",
        href: "/shipping-containers-for-sale-shreveport-la"
      }
    ],
    mapImage: {
      src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/new-orleans-6720cf661294b.webp",
      alt: "Map of the New Orleans, LA area",
      width: 608,
      height: 555
    },
    featured: {
      title: "Eco-Friendly Living in New Orleans Shipping Container Homes",
      paragraphs: [
        "The 60th New Orleans Home & Garden Show kicks off and one of the highlights will be a village built from shipping containers. Show Manager Mike Zalaznik says there will be shipping containers transformed into everything from a yoga studio to a fishing camp! People are drawn towards the container homes trend due to their ability to provide a comfortable lifestyle while taking up minimal space. Landscape architect Seth Rodewald-Bates understands this quite well as he and his wife have been celebrating their first year of living large in a measly 720-square-foot home made out of two freight containers.",
        "Rodewald-Bates explains that the energy-efficient home is equipped with space-saving appliances and has made him and his wife more aware of their stuff. “It’s definitely a trend to reduce clutter in our lives, as well as conserve resources,” he affirms. Not only was the couple impressed with the idea of helping the environment and creating a one-of-a-kind home, they were also drawn to upcycling something prevalent in New Orleans. Rodewald-Bates shared her enthusiasm for this project: “I enjoyed Legos as I was growing up so this felt like an awesome adult-sized test!"
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/eco-friendly-living-in-new-orleans-shipping-container-homes.webp",
        alt: "Eco-Friendly Living in New Orleans Shipping Container Homes",
        width: 600,
        height: 330
      }
    },
    news: {
      title: "New Orleans Port Shipping Container New Facility",
      paragraphs: [
        "Louisiana, Port of New Orleans, and two major maritime companies recently declared their intention to jointly fund the construction of a $1.8 billion container facility, the Louisiana International Terminal, in Violet on the lower Mississippi River. The project under the guidance of Gov. John Bel Edwards is estimated to manage between 180,000 and 280,000 containers in its initial year; when completed it aims to support 1.2 million containers or 2 million TEUs (20-foot equivalent units).",
        "Utilizing the 50 feet depth of the Lower Mississippi River Ship Channel avoids bridge height restrictions further upriver allowing access to six Class I railroads and four interstate highways. They are swiftly making progress on the U.S. Army Corps of Engineers environmental review project, and construction is slated to begin in 2025 with operations commencing by 2028."
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/new-orleans-port-shipping-container-new-facility-1024x576.webp",
        alt: "New Orleans Port Shipping Container New Facility",
        width: 800,
        height: 450
      }
    },
    deliveredLead: [],
    seo: {
      title: "Shipping Containers in New Orleans | Best Priced & Fast Delivery",
      description: "We have the best prices on new and used shipping containers in New Orleans. Call us now for quick delivery or free pick up!",
      ogImage: "https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2024/05/14063436/google-reviews.webp"
    }
  },
  {
    slug: "new-york-ny-newark-nj",
    depot: "New York, NY / Newark, NJ",
    depotId: 32,
    place: {
      city: "New York / Newark",
      region: "NJ",
      regionName: "New York / New Jersey",
      label: "New York, NY / Newark, NJ"
    },
    nearbyCities: [
      {
        name: "New York",
        href: "/shipping-containers-new-york"
      },
      {
        name: "Albany",
        href: "/storage-units-albany-ny"
      },
      {
        name: "Corona",
        href: "/corono-storage-units"
      },
      {
        name: "Poughkeepsie",
        href: "/storage-units-poughkeepsie"
      },
      {
        name: "Woodside",
        href: "/storage-units-woodside-ny"
      },
      {
        name: "Astoria",
        href: "/storage-astoria"
      },
      {
        name: "East Elmhurst",
        href: "/east-elmhurst-storage"
      },
      {
        name: "Ridgewood",
        href: "/ridgewood-storage-unit"
      },
      {
        name: "Yonkers",
        href: "/city-page-yonkers-ny"
      },
      {
        name: "Binghamton",
        href: "/binghamton-storage-units"
      },
      {
        name: "Elmhurst",
        href: "/elmhurst-storage-units"
      },
      {
        name: "Rochester",
        href: "/storage-units-rochester-ny"
      },
      {
        name: "Bronx",
        href: "/shipping-containers-bronx"
      },
      {
        name: "Flushing",
        href: "/storage-units-in-flushing-ny"
      },
      {
        name: "Schenectady",
        href: "/storage-units-schenectady-ny"
      },
      {
        name: "Brooklyn",
        href: "/brooklyn-shipping-container"
      },
      {
        name: "Jamaica",
        href: "/shipping-container-for-sale-jamaica"
      },
      {
        name: "Staten Island",
        href: "/storage-units-staten-island"
      },
      {
        name: "Buffalo",
        href: "/shipping-containers-for-sale-buffalo-ny"
      },
      {
        name: "Syracuse",
        href: "/storage-units-syracuse-ny"
      }
    ],
    mapImage: {
      src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/new-jersey-672195b74e268.webp",
      alt: "Map of the New York, NY / Newark, NJ area",
      width: 639,
      height: 552
    },
    featured: {
      title: "Shipping Container Glamping in New York",
      paragraphs: [
        "Experience the great outdoors in a unique, urban setting with NYC Glamping. Recently opened, this innovative business offers cabin stays made from repurposed shipping containers as well as tent and boat lodging on the Greenpoint waterfront. All cabins are equipped with complimentary Wi-Fi access, air conditioning for comfort, and bathrooms that come complete with shower facilities—not to mention their double-decker boat is docked right there in the harbor! Have you heard of glamping? It’s a combination of ‘glam’ and ‘camping’, an exciting new holiday trend that is becoming increasingly popular! Glampers can enjoy the great outdoors while still having access to all the modern comforts.",
        "They have two tents with a more rustic camping feel, but they also come equipped with cozy beds and bathrooms – so no worries about compromising your creature comforts on this tour! Experiencing the essence of being in the wilderness without having to physically leave Manhattan is what NYC Glamping offers its guests. As an additional bonus, they also supply a list of interesting tourist spots nearby for visitors to explore!"
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/shipping-container-glamping-in-new-york.webp",
        alt: "Shipping Container Glamping in New York",
        width: 800,
        height: 589
      }
    },
    news: {
      title: "Newark Shipping Container Housing for the Homeless",
      paragraphs: [
        "As a creative solution to address the skyrocketing housing shortage, Newark recently launched an innovative pilot program that involves transforming shipping containers into living spaces. This March will mark the opening of their second container complex consisting of 22 steel boxes that when combined, create one large administrative office and provide much-needed shelter for 20 homeless residents. In his role as Newark’s homelessness czar, Luis Ulerio announced the city had chosen to use containers for construction due to its cost-effectiveness.",
        "The complex comprises nineteen units. According to Ulerio, “I always tell folks that the containers are only the material, right? What we’re really providing are dignity, space, and security, right?” He went on further to say that this project offers that to individuals. With the rising demand for housing and escalating real estate prices, many cities have found themselves in a quandary on how to accommodate their homeless populations. Fortunately, they’ve discovered that shipping containers are an economical alternative to constructing traditional buildings – at only a fraction of the cost! Ulerio and John Glavin, president of Custom Containers 915 in El Paso, Texas declared that these metal boxes are reasonably inexpensive to retrofit quickly for the city of Newark. These containers measure about 40 feet long and 8 feet wide – much more cost-effective than building a brand-new structure from scratch."
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/newark-shipping-container-housing-for-the-homeless-1024x576.webp",
        alt: "Newark Shipping Container Housing for the Homeless",
        width: 800,
        height: 450
      }
    },
    deliveredLead: [],
    seo: {
      title: "Shipping Containers For Sale Newark NJ | Best Prices Guaranteed",
      description: "At the most affordable pricing, we have a huge selection of shipping containers for sale in Newark NJ. Get your container now!",
      ogImage: "https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2024/05/14063436/google-reviews.webp"
    }
  },
  {
    slug: "norfolk-va",
    depot: "Norfolk, VA",
    depotId: 33,
    place: {
      city: "Norfolk",
      region: "VA",
      regionName: "Virginia",
      label: "Norfolk, VA"
    },
    nearbyCities: [
      {
        name: "Alexandria",
        href: "/storage-alexandria-va"
      },
      {
        name: "Fredericksburg",
        href: "/storage-units-fredericksburg-va"
      },
      {
        name: "Newport News",
        href: "/storage-units-newport-news-va"
      },
      {
        name: "Virginia Beach",
        href: "/storage-units-virginia-beach-va"
      },
      {
        name: "Arlington",
        href: "/storage-units-arlington-va"
      },
      {
        name: "Hampton",
        href: "/storage-units-hampton-va"
      },
      {
        name: "Norfolk",
        href: "/cargo-containers-norfolk"
      },
      {
        name: "Woodbridge",
        href: "/storage-units-woodbridge-va"
      },
      {
        name: "Charlottesville",
        href: "/storage-units-charlottesville-va"
      },
      {
        name: "Henrico",
        href: "/storage-units-henrico-va"
      },
      {
        name: "Portsmouth",
        href: "/storage-units-portsmouth-va"
      },
      {
        name: "Chesapeake",
        href: "/storage-units-chesapeake-va"
      },
      {
        name: "Lynchburg",
        href: "/storage-units-lynchburg-va"
      },
      {
        name: "Richmond",
        href: "/storage-units-richmond-va"
      },
      {
        name: "Fairfax",
        href: "/storage-units-fairfax-va"
      },
      {
        name: "Manassas",
        href: "/manassas-portable-storage-container"
      },
      {
        name: "Roanoke",
        href: "/storage-containers-roanoke-va"
      },
      {
        name: "Falls Church",
        href: "/storage-units-falls-church"
      },
      {
        name: "Midlothian",
        href: "/extra-space-storage-midlothian"
      },
      {
        name: "Springfield",
        href: "/storage-springfield-va"
      }
    ],
    mapImage: {
      src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/norfolk-67219a30832c0.webp",
      alt: "Map of the Norfolk, VA area",
      width: 620,
      height: 548
    },
    featured: {
      title: "Shipping Container Park in Norfolk",
      paragraphs: [
        "Located at 776 Granby Street, in the NEON District, The Plot is an extraordinary temporary park that’s sure to give visitors a unique experience. It has been designed with creativity and innovation in mind by repurposing reclaimed materials into attractive gathering spots for all ages! You’ll find shipping containers used as vertical gardens and public art installations, an immense chessboard perfect for friendly competition among family or friends plus dedicated spaces meant to host performance art pieces. Get ready for something truly remarkable when you visit The Plot!",
        "The Plot is the perfect location to host special events, such as birthday parties or corporate get-togethers! To make sure that your event runs smoothly and legally, be sure to apply for a special permit from the Downtown Norfolk Council at least six weeks in advance. Not only can you find all of the guidelines here, or on their website but feel free to visit The Plot anytime, grab some lunch with friends, take a break from your day, and just enjoy people-watching."
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/shipping-container-park-in-norfolk.webp",
        alt: "Shipping Container Park in Norfolk",
        width: 800,
        height: 550
      }
    },
    news: {
      title: "Shipping Container Treasure Trove in Norfolk",
      paragraphs: [
        "Star Throwers, a Norfolk-based cancer charity devoted to supporting those battling the disease, has opened its second ‘Treasure Trove’ shop in an upcycled shipping container at their main center on Melton Road in Wymondham. Customers can peruse items from books and furniture to lifestyle goods with all proceeds going towards helping people affected by cancer. Star Throwers’ new shop is a 40ft shipping container conversion packed with extraordinary items like vintage furniture, clothing, and electrical pieces for sale.",
        "There are also plenty of second-hand treasures as well as fresh donations to choose from! With this additional retail outlet, they can generate more money that will be used to continue providing free cancer support services. Shop now and help us make a difference in the lives of those living with cancer! The charity gratefully accepts donations of small furniture items and electrical goods at their new premises. They also accept clothing, shoes, bags, jewelry, books (including DVDs/Blu-Rays), music (CDs/Vinyl/Instruments/Sheet Music), china ware, kitchenware ornaments pictures collectibles blankets curtains toys games wedding dresses coins, and other accessories to help those in need. Your kind donations will be greatly appreciated!"
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/star-throwers-new-shop.webp",
        alt: "Shipping Container Treasure Trove in Norfolk",
        width: 720,
        height: 720
      }
    },
    deliveredLead: [],
    seo: {
      title: "Shipping Container For Sale Norfolk | Top Quality & Low Prices",
      description: "At the most affordable pricing, we have a huge selection of shipping containers for sale in Norfolk. Get your container now!",
      ogImage: "https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2024/05/14063436/google-reviews.webp"
    }
  },
  {
    slug: "omaha-ne",
    depot: "Omaha, NE",
    depotId: 34,
    place: {
      city: "Omaha",
      region: "NE",
      regionName: "Nebraska",
      label: "Omaha, NE"
    },
    nearbyCities: [
      {
        name: "Beatrice",
        href: "/storage-units-in-beatrice-nebraska"
      },
      {
        name: "Gering",
        href: "/storage-units-gering-ne"
      },
      {
        name: "Lincoln",
        href: "/storage-units-lincoln-ne"
      },
      {
        name: "Scottsbluff",
        href: "/storage-units-scottsbluff-ne"
      },
      {
        name: "Bellevue",
        href: "/storage-units-bellevue-ne"
      },
      {
        name: "Grand Island",
        href: "/storage-units-grand-island-ne"
      },
      {
        name: "Norfolk",
        href: "/storage-units-norfolk-ne"
      },
      {
        name: "South Siox City",
        href: "/storage-units-in-south-sioux-ne"
      },
      {
        name: "Blair",
        href: "/storage-units-blair-ne"
      },
      {
        name: "Hastings",
        href: "/storage-units-hastings-ne"
      },
      {
        name: "North Platte",
        href: "/storage-units-north-platte-ne"
      },
      {
        name: "Columbus",
        href: "/storage-units-columbus-ne"
      },
      {
        name: "Kearney",
        href: "/storage-units-kearney-ne"
      },
      {
        name: "Omaha",
        href: "/cargo-containers-omaha-ne"
      },
      {
        name: "Elkhorn",
        href: "/storage-elkhorn-ne"
      },
      {
        name: "La Vista",
        href: "/storage-units-la-vista-ne"
      },
      {
        name: "Papillion",
        href: "/storage-units-papillion-ne"
      },
      {
        name: "Fremont",
        href: "/storage-units-fremont-ne"
      },
      {
        name: "Lexington",
        href: "/storage-units-lexington-ne"
      },
      {
        name: "Plattsmouth",
        href: "/storage-units-plattsmouth-ne"
      }
    ],
    mapImage: {
      src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/omaha-6721a3423c112.webp",
      alt: "Map of the Omaha, NE area",
      width: 577,
      height: 557
    },
    featured: {
      title: "Shipping Container Physical Hub in Omaha",
      paragraphs: [
        "John Cohorst and Holly Kranker, who recently received a Public Impact Grant, took the next step in their CAR>GO project by making an important delivery. They plan to renovate a generously donated shipping container as the physical base for this innovative concept – Community Activated Resource on the GO. This mobile shared workspace will be used by artists, architects, designers, and engineers alike to collaborate on neighborhood projects or discuss infrastructure-related topics while exchanging ideas with one another.",
        "Justin Caniglia, MCC’s Continuing Education Coordinator, explains that the Freight Farm is a cutting-edge farm operating on computer systems. “We have total control over our dashboard,” he adds. Daphne Cook, Director of Continuing Education at MCC confirms that it’s the first of its kind in Omaha to be used as an educational program classroom! MCC’s new Certification for the Sustainability program, coupled with other learning opportunities available to all ages, will be significantly enhanced by the presence of a shipping container. As Cook expressed: “Most people won’t have their own personal shipping container. But they can still access its concepts and learn how to apply them in the comforts of home through education.”"
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/shipping-container-indoor-farm-1024x682.webp",
        alt: "shipping container indoor farm",
        width: 800,
        height: 532
      }
    },
    news: {
      title: "Omaha Shipping Container Affordable Housing",
      paragraphs: [
        "Kail Walker, a local real estate agent, and his team are undertaking an ambitious project to provide Omaha with affordable housing and increased sustainability in the form of container homes. With 10 million unused shipping containers around the globe, bringing them to the city would not only help reduce waste but it would also give low-income families access to decent living conditions.",
        "Not only are container homes significantly more cost-effective to construct, but they also take considerably shorter periods of time. While a conventional house could take anywhere between 4 and 14 months to complete, it would take no longer than two months for a container home. Currently, these types of homes are being built in the south–cities like Austin and Dallas, as well as Arizona cities, included–so why not start this project in Omaha? Doing so will enable the city to seize its moment under the spotlight and increase its visibility!"
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/kail-walker.webp",
        alt: "kail walker",
        width: 799,
        height: 533
      }
    },
    deliveredLead: [],
    seo: {
      title: "Shipping Containers for Sale Omaha | Buy, Rent, Rent-to-Own",
      description: "Shipping containers for sale Omaha. Buy, rent, or rent-to-own new and used units with quick delivery and low prices. Call us now!",
      ogImage: "https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2024/05/14063436/google-reviews.webp"
    }
  },
  {
    slug: "phoenix-az",
    depot: "Phoenix, AZ",
    depotId: 35,
    place: {
      city: "Phoenix",
      region: "AZ",
      regionName: "Arizona",
      label: "Phoenix, AZ"
    },
    nearbyCities: [
      {
        name: "Avondale",
        href: "/avondale-storage-units"
      },
      {
        name: "Glendale",
        href: "/storage-units-glendale-az"
      },
      {
        name: "Phoenix",
        href: "/cargo-container-phoenix"
      },
      {
        name: "Tucson",
        href: "/storage-containers-for-sale-tucson"
      },
      {
        name: "Buckeye",
        href: "/storage-unit-buckeye-az"
      },
      {
        name: "Goodyear",
        href: "/storage-units-goodyear-az"
      },
      {
        name: "Prescott",
        href: "/prescott-storage-units"
      },
      {
        name: "Yuma",
        href: "/storage-yuma-az"
      },
      {
        name: "Casa Grande",
        href: "/casa-grande-storage"
      },
      {
        name: "Lake Havasu City",
        href: "/lake-havasu-city-storage"
      },
      {
        name: "San Tan Valley",
        href: "/san-tan-valley-storage"
      },
      {
        name: "Chandler",
        href: "/storage-chandler-az"
      },
      {
        name: "Maricopa",
        href: "/maricopa-storage"
      },
      {
        name: "Scottsdale",
        href: "/storage-units-scottsdale-az"
      },
      {
        name: "Flagstaff",
        href: "/shipping-containers-for-sale-flagstaff-az"
      },
      {
        name: "Mesa",
        href: "/storage-containers-mesa-az"
      },
      {
        name: "Surprise",
        href: "/storage-surprise-az"
      },
      {
        name: "Gilbert",
        href: "/storage-gilbert-az"
      },
      {
        name: "Peoria",
        href: "/storage-peoria-az"
      },
      {
        name: "Tempe",
        href: "/storage-tempe-az"
      }
    ],
    mapImage: {
      src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/arizona-6721a73556a58webpbv_resized_ipadwebpbv.webp",
      alt: "Map of the Phoenix, AZ area",
      width: 565,
      height: 559
    },
    featured: {
      title: "Shipping Container Cocktail Bar in Phoenix",
      paragraphs: [
        "Step into Downtown Phoenix and experience The Churchill’s newest urban marketplace, constructed of shipping containers. Here you can find the extraordinary bar, So Far, So Good, a concept helmed by beverage director Sam Olguin that will replace previous tenant Pobrecito upon its closure on August 31st. Enjoy an array of unique cocktails crafted from fresh fruits, vegetables, and herbs; it’s sure to be a delicious treat!",
        "After a month-long renovation, The Bar proudly presents its modern minimalistic décor with beautiful black, white, and gold accents. Similarly, the Brill Line bar next to So Far, So Good is also newly refurbished; offering patrons an enticing menu of draft cocktails, shareable punch bowls, and delectable “unique and lesser-known classics.” In addition to these refreshments are 10 small businesses located within The Churchill shipping container development. An expansive 9000 square foot courtyard complete with communal tables adorns this area for weekly curated events such as speakers series’, art classes, and pop-up galleries all in aid of non-profit fundraising initiatives!"
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/the-churchill-phoenix-1024x1024webpbv_resized_ipadwebpbv.webp",
        alt: "The Churchill phoenix",
        width: 820,
        height: 820
      }
    },
    news: {
      title: "Shipping Container Art Galleries in Phoenix",
      paragraphs: [
        "They often say that to create art, you need creative and innovative thinking. However, in downtown Phoenix, artists take it a step further by literally crafting their artwork inside the box! In an unremarkable gravel lot near Roosevelt and 5th Streets stand three massive shipping containers– Sarah Hurwitz quickly recognized this area as her new canvas for creation. After some effort with the heavy latch on one of them, she opened the door – entirely inspired by what lay beyond it. Upon reflecting on her childhood, the concept of making a life-size diorama box came to mind and that’s exactly what she did! Now when you step inside her art exhibit, it is like stepping into another world.",
        "Colorful paper leaves and toadstools line the walls as hidden treasures roost in the trees with animal sounds playing in the background; giving off an airy yet professional ambiance quite unlike any elementary school project from Hurwitz’s past. This unique exhibition was inspired by time spent creating exhibits for children’s museums around town. The Roosevelt Row Community Development Corporation has provided grant money to contract a variety of artists who will present their artwork in the containers each month. Hurwitz, an artist with upcoming exhibitions at two traditional galleries, found this particular showcase especially unique. When night falls and darkness takes over, the container radiates white light that stands out amongst its surroundings – creating a captivating atmosphere for viewers to observe artistry like never before!"
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/shipping-container-art-galleries-in-phoenixwebpbv_resized_ipadwebpbv.webp",
        alt: "Shipping Container Art Galleries in Phoenix",
        width: 700,
        height: 464
      }
    },
    deliveredLead: [],
    seo: {
      title: "Shipping Containers For Sale Phoenix AZ | Buy, or Rent Options",
      description: "Shop shipping containers for sale in Phoenix, AZ. Buy, rent, or rent-to-own with low prices and fast delivery. Call us now!",
      ogImage: "https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2024/05/14063436/google-reviews.webp"
    }
  },
  {
    slug: "portland-or",
    depot: "Portland, OR",
    depotId: 36,
    place: {
      city: "Portland",
      region: "OR",
      regionName: "Oregon",
      label: "Portland, OR"
    },
    nearbyCities: [
      {
        name: "Albany",
        href: "/shipping-containers-for-sale-albany"
      },
      {
        name: "Gresham",
        href: "/storage-units-gresham-oregon"
      },
      {
        name: "Medford",
        href: "/shipping-containers-for-sale-medford-oregon"
      },
      {
        name: "Springfield",
        href: "/shipping-containers-for-sale-springfield"
      },
      {
        name: "Beaverton",
        href: "/storage-units-beaverton"
      },
      {
        name: "Hillsboro",
        href: "/storage-units-hillsboro"
      },
      {
        name: "Oregon City",
        href: "/shipping-containers-for-sale-oregon-city"
      },
      {
        name: "Woodburn",
        href: "/woodburn-storage-units"
      },
      {
        name: "Bend",
        href: "/shipping-containers-bend-oregon"
      },
      {
        name: "Klamath Falls",
        href: "/storage-units-klamath-falls"
      },
      {
        name: "Portland",
        href: "/cargo-containers-for-sale-portland-oregon"
      },
      {
        name: "Corvallis",
        href: "/storage-units-corvallis"
      },
      {
        name: "Lake Oswego",
        href: "/storage-units-lake-oswego"
      },
      {
        name: "Redmond",
        href: "/storage-containers-redmond-oregon"
      },
      {
        name: "Eugene",
        href: "/shipping-container-eugene"
      },
      {
        name: "Lebanon",
        href: "/storage-containers-lebanon"
      },
      {
        name: "Roseburg",
        href: "/roseburg-storage-units"
      },
      {
        name: "Grants Pass",
        href: "/shipping-containers-for-sale-grants-pass"
      },
      {
        name: "McMinnville",
        href: "/storage-units-in-mcminnville"
      },
      {
        name: "Salem",
        href: "/shipping-container-salem"
      }
    ],
    mapImage: {
      src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/portland-6721aba7609f8.webp",
      alt: "Map of the Portland, OR area",
      width: 589,
      height: 555
    },
    featured: {
      title: "Starbucks Portland Shipping Container",
      paragraphs: [
        "Starbucks has launched its innovative modular stores in Portland that are constructed from reconfigured shipping containers. The Seattle-based retailer chose Rose City to host one of their new store designs located on Northeast 122nd Avenue near the greenway, having previously tested this concept in Tukwila, Washington. This store is the first to feature customized bike racks and landscaping for those who prefer walking or biking. Moreover, it offers a drive-through option too!",
        "Although modularly constructed off-site, this Starbucks location is meant to stay permanent in its current spot – according to an official spokesperson from Starbucks. Their design team worked diligently to craft a store aesthetic that reflects the unique culture of Portland. From their world-renowned bike lifestyle, temperate climate, and animal-friendly environment, to their commitment to sustainability and love for coffee – nothing was overlooked in creating this special installation."
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/starbucks-portland-shipping-container.webp",
        alt: "Starbucks Portland Shipping Container",
        width: 512,
        height: 289
      }
    },
    news: {
      title: "Shipping Container Port Modernization in Portland",
      paragraphs: [
        "Shipping Container Port Modernization in Portland The Port of Portland was recently awarded several grants, amounting to a grand total of $42 million in infrastructure improvements for Oregon’s only marine container terminal – Terminal 6. Most notably, the Connect Oregon grant program administered by the Oregon Department of Transportation contributed an impressive $7.3 million to this endeavor; its mission is to support and sustain non-highway modes of transportation so that the state’s entire transportation system remains reliable, comprehensive, and efficient. Enhancing the operational infrastructure to provide direct container services at T6 will be advantageous for Oregon and other West Coast exporters.",
        "The Port is extremely grateful for the backing of federal and state representatives, as their assistance was pivotal, and remains so in securing a successful future for this Terminal. The project at the Port of Portland will bring unprecedented prosperity to Oregon and west coast shippers and is designed with the intention of supporting economic growth in the region for many years to come. Not only will members of the community receive job opportunities during construction but also benefit from long-term employment prospects through its operation."
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/shipping-container-port-modernization-in-portland-1024x768.webp",
        alt: "Shipping Container Port Modernization in Portland",
        width: 800,
        height: 600
      }
    },
    deliveredLead: [],
    seo: {
      title: "Shipping Containers For Sale Portland Oregon | Lowest Pricing",
      description: "Shipping containers for sale Portland Oregon. Lowest pricing, huge selection, and quick delivery. Get your container now! Call us now!",
      ogImage: "https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2024/05/14063436/google-reviews.webp"
    }
  },
  {
    slug: "raleigh-nc",
    depot: "Raleigh, NC",
    depotId: 37,
    place: {
      city: "Raleigh",
      region: "NC",
      regionName: "North Carolina",
      label: "Raleigh, NC"
    },
    nearbyCities: [
      {
        name: "Asheville",
        href: "/all-city/shipping-container-asheville-nc"
      },
      {
        name: "Durham",
        href: "/all-city/shipping-containers-durham"
      },
      {
        name: "High Point",
        href: "/all-city/storage-units-high-point-nc"
      },
      {
        name: "Wilmington",
        href: "/all-city/shipping-containers-for-sale-wilmington-nc"
      },
      {
        name: "Burlington",
        href: "/all-city/portable-storage-burlington"
      },
      {
        name: "Fayetteville",
        href: "/all-city/portable-storage-fayetteville-nc"
      },
      {
        name: "Jacksonville",
        href: "/all-city/storage-containers-jacksonville-nc"
      },
      {
        name: "Winston Salem",
        href: "/all-city/shipping-containers-for-sale-winston-salem-nc"
      },
      {
        name: "Cary",
        href: "/all-city/storage-units-cary-nc"
      },
      {
        name: "Gastonia",
        href: "/all-city/shipping-containers-gastonia-nc"
      },
      {
        name: "Lexington",
        href: "/all-city/storage-units-lexington-nc"
      },
      {
        name: "Chapel Hill",
        href: "/all-city/storage-units-chapel-hill"
      },
      {
        name: "Greensboro",
        href: "/all-city/shipping-containers-for-sale-greensboro-nc"
      },
      {
        name: "Monroe",
        href: "/all-city/storage-units-monroe-nc"
      },
      {
        name: "Charlotte",
        href: "/all-city/steel-shipping-containers-charlotte-nc"
      },
      {
        name: "Greenville",
        href: "/all-city/storage-units-greenville-nc"
      },
      {
        name: "Raleigh",
        href: "/all-city/cargo-containers-for-sale-raleigh-nc"
      },
      {
        name: "Concord",
        href: "/all-city/storage-units-concord-nc"
      },
      {
        name: "Hickory",
        href: "/all-city/shipping-containers-for-sale-hickory-nc"
      },
      {
        name: "Salisbury",
        href: "/all-city/storage-units-salisbury-nc"
      }
    ],
    mapImage: {
      src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/raleigh-6721bdf0cb233.webp",
      alt: "Map of the Raleigh, NC area",
      width: 643,
      height: 559
    },
    featured: {
      title: "Shipping Container Hangout Spot in Raleigh",
      paragraphs: [
        "Extending the flourishing district across Peace Street is a groundbreaking partnership between developers CityPlat and Modalia Capital, in alliance with Local Icon Hospitality Group and Redline Design Group. The former auto inspection station will now become an inviting gathering spot located .32-acres next to Mellow Mushroom on Glenwood South – transforming dead space into a livelier social hub!",
        "Step inside The Yard and you’ll find a converted building with an upscale bar, as well as a small kitchen. Surrounding the main area are up to 20 shipping containers that have been transformed into multi-level bars and unique food establishments. Enjoy all this in their outdoor space which includes fire pits, games, and oftentimes different food trucks for your dining pleasure. So if it’s early to mid-June head over to The Yard -a great place for meeting friends, hanging out or simply just chilling!"
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/the-yard-raleigh-1024x683.webp",
        alt: "the yard raleigh",
        width: 800,
        height: 533
      }
    },
    news: {
      title: "Shipping Container Hangout Spot in Raleigh",
      paragraphs: [
        "Since being established as the hub of three prestigious research universities in 1959, Research Triangle Park (RTP) has thrived by pouring millions into creating a space where people and ideas are constantly intersecting. 40,000-plus employees currently work across more than 200 companies based at RTP; however, what’s still lacking is an area for these knowledge workers to enjoy life outside of their jobs. Build it here – and they will come back!",
        "Boxyard RTP is the ultimate hip entertainment hub and a sneak peek into what’s going on in this bustling epicenter. The 15,000 square feet of repurposed shipping containers-turned-playspace inspired by Boxyard Tulsa gives brainy talent a place to unwind before, during and after work. Everyone is abuzz about it though some may be wondering why it was built here in Raleigh! Boxyard RTP is the kind of vision that Park had been craving to come into fruition since its inception. Quality of life, such as what a giant HQ like Apple can offer just 4 miles away, should be taken into account by potential employers when making their decision on where to locate."
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/boxyard-raleigh.webp",
        alt: "boxyard raleigh",
        width: 768,
        height: 450
      }
    },
    deliveredLead: [],
    seo: {
      title: "Shipping Containers For Sale Raleigh NC | Quality & Low Prices",
      description: "Shipping Containers For Sale Raleigh NC. Huge inventory, lowest pricing, and quick delivery Get your container now!",
      ogImage: "https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2024/05/14063436/google-reviews.webp"
    }
  },
  {
    slug: "regina-sk",
    depot: "Regina, SK",
    depotId: 52,
    place: {
      city: "Regina",
      region: "SK",
      regionName: "Saskatchewan",
      label: "Regina, SK"
    },
    nearbyCities: [],
    mapImage: {
      src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/saska-67233f3be1a40.webp",
      alt: "Map of the Regina, SK area",
      width: 501,
      height: 557
    },
    featured: null,
    news: null,
    deliveredLead: [],
    seo: {
      title: "Regina, SK 2 - OnsiteStorage",
      description: "Discover durable and affordable shipping containers for sale in Regina, SK. Explore a range of sizes and configurations to find the perfect storage solution for your needs. Secure your belongings with quality shipping containers in Regina.",
      ogImage: "https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2024/05/14063436/google-reviews.webp"
    }
  },
  {
    slug: "salt-lake-city",
    depot: "Salt Lake City",
    depotId: 38,
    place: {
      city: "Salt Lake City",
      region: "",
      regionName: "Utah",
      label: "Salt Lake City"
    },
    nearbyCities: [
      {
        name: "American Fork",
        href: "/storage-units-american-fork"
      },
      {
        name: "Lehi",
        href: "/storage-units-lehi-utah"
      },
      {
        name: "Riverton",
        href: "/storage-units-riverton-utah"
      },
      {
        name: "Tooele",
        href: "/tooele-storage-units"
      },
      {
        name: "Bountiful",
        href: "/storage-units-bountiful-utah"
      },
      {
        name: "Logan",
        href: "/storage-units-logan-utah"
      },
      {
        name: "Saint George",
        href: "/saint-george-storage-units"
      },
      {
        name: "West Jordan",
        href: "/storage-units-west-jordan-utah"
      },
      {
        name: "Cedar City",
        href: "/shipping-containers-for-sale-cedar-city-utah"
      },
      {
        name: "Ogden",
        href: "/storage-units-ogden-utah"
      },
      {
        name: "Salt Lake City",
        href: "/cargo-containers-for-sale-utah"
      },
      {
        name: "Clearfield",
        href: "/storage-units-clearfield-utah"
      },
      {
        name: "Orem",
        href: "/storage-units-orem-utah"
      },
      {
        name: "Sandy",
        href: "/storage-units-sandy-utah"
      },
      {
        name: "Draper",
        href: "/storage-units-draper-utah"
      },
      {
        name: "Pleasant Grove",
        href: "/pleasant-grove-storage-units"
      },
      {
        name: "South Jordan",
        href: "/storage-units-south-jordan-utah"
      },
      {
        name: "Layton",
        href: "/layton-portable-storage"
      },
      {
        name: "Provo",
        href: "/storage-units-provo-utah"
      },
      {
        name: "Spanish Fork",
        href: "/storage-units-spanish-fork"
      }
    ],
    mapImage: {
      src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/salt-lake-6721c1e4132c1.webp",
      alt: "Map of the Salt Lake City area",
      width: 633,
      height: 559
    },
    featured: {
      title: "Shipping Container Hut System in Salt Lake City",
      paragraphs: [
        "Discover the Aquarius Trail Hut System – built exclusively for bikepacking through Utah Color Country. This expansive trail system stretches 190 miles, beginning at 11,300 feet atop Brian Head and concluding down in Escalante at a height of 5,820 feet. With five lavishly stocked huts set along this route, bikers can experience an unforgettable journey that is intense on biking yet easy on packing! Exploring the world with bikepacking has become increasingly popular among cyclists who seek autonomous, off-the-grid escapades. However, for those new to this activity, it can appear overwhelming as you find yourself pushing uphill on a heavy bicycle filled with additional gear and desperately attempting to manage any technical dilemmas while navigating toward suitable campgrounds. Fortunately, the Aquarius Hut System simplifies all of that so you can concentrate instead on what truly makes this sport fun: riding smooth trails through breathtaking landscapes!",
        "Step into the five huts, crafted from recycled shipping containers, stocked with an array of amenities. At each stop you’ll find a generous supply of energy generated by off-grid solar electricity to power a full fridge and freezer as well as gas grill, two-burner stove and all your cooking necessities. Indulge in delicious delights prepared in front of you such as grilled salmon paired with creamy mashed potatoes plus seasonal vegetables or classic burgers and pasta dishes accompanied by sweet desserts that round out any meal. For an extra $50 per person, you can enjoy a far superior menu compared to the typical freeze-dried meals for overnight adventures. Plus, they offer vegetarian and gluten-free options upon request! Cooking your meal is easy enough. All that’s left after savoring your meal is cleaning your appliances afterwards. Don’t miss out on this tantalizing treat while exploring nature!"
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/aquarius-trail-hut-system.webp",
        alt: "Aquarius Trail Hut System",
        width: 800,
        height: 533
      }
    },
    news: {
      title: "Shipping Container Apartment in Salt Lake City",
      paragraphs: [
        "After over a year of construction delays, Salt Lake City is at last near the finish line in their cutting-edge experiment to construct an apartment complex using recycled shipping containers. Rod Newman owner of Eco Box Fabricators and primary supporter of the ambitious “Box 500 Apartments” project claims that the metal six-story structure situated on 543 S. 500 West has achieved greater than 90% completion and its 84 budget friendly apartments are speculated to open soon for tenants. These studios measure 320 square feet while one-bedroom dwellings boast 640 square feet, with two bedrooms offering double that amount!",
        "With studios ranging from 320 square feet to two-bedroom rentals averaging 640 square feet, the Box 500 Apartments is set to be among the tallest structures constructed out of steel shipping containers. According to Newman, these living units will remain reasonably priced for those making 60% of their area’s median income."
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/500-box-apartment.webp",
        alt: "500 box apartment",
        width: 700,
        height: 500
      }
    },
    deliveredLead: [],
    seo: {
      title: "Shipping Container For Sale Salt Lake City | Quality & Low Prices",
      description: "At the most affordable pricing, we have a huge selection of shipping containers for sale in Salt Lake City. Get your container now!",
      ogImage: "https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2024/05/14063436/google-reviews.webp"
    }
  },
  {
    slug: "san-antonio-tx",
    depot: "San Antonio, TX",
    depotId: 39,
    place: {
      city: "San Antonio",
      region: "TX",
      regionName: "Texas",
      label: "San Antonio, TX"
    },
    nearbyCities: [
      {
        name: "Alvin",
        href: "/storage-alvin-tx"
      },
      {
        name: "Austin",
        href: "/shipping-container-for-sale-austin"
      },
      {
        name: "Beaumont",
        href: "/shipping-containers-for-sale-beaumont-texas"
      },
      {
        name: "College Station",
        href: "/extra-space-storage-college-station"
      },
      {
        name: "Conroe",
        href: "/shipping-containers-for-sale-conroe-tx"
      },
      {
        name: "Dallas",
        href: "/where-to-buy-shipping-containers/dallas-tx"
      },
      {
        name: "El Paso",
        href: "/where-to-buy-shipping-containers/el-paso-tx"
      },
      {
        name: "Fredericksburg",
        href: "/shipping-containers-fredericksburg-tx"
      },
      {
        name: "Houston",
        href: "/where-to-buy-shipping-containers/houston-tx"
      },
      {
        name: "Katy",
        href: "/storage-katy-tx"
      },
      {
        name: "Kerrville",
        href: "/storage-units-kerrville-tx"
      },
      {
        name: "Lake Jackson",
        href: "/storage-units-in-lake-jackson-texas"
      },
      {
        name: "Laredo",
        href: "/where-to-buy-shipping-containers/laredo-tx"
      },
      {
        name: "League City",
        href: "/storage-units-league-city"
      },
      {
        name: "New Braunfels",
        href: "/shipping-containers-for-sale-new-braunfels"
      },
      {
        name: "Pasadena",
        href: "/container-store-pasadena"
      },
      {
        name: "Port Arthur",
        href: "/storage-units-port-arthur-tx"
      },
      {
        name: "Round Rock",
        href: "/container-store-round-rock"
      },
      {
        name: "San Antonio",
        href: "/where-to-buy-shipping-containers/san-antonio-tx"
      },
      {
        name: "Sugar Land",
        href: "/storage-sugar-land-tx"
      }
    ],
    mapImage: {
      src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/san-antonio-6721df6a0105dwebpbv_resized_ipadwebpbv.webp",
      alt: "Map of the San Antonio, TX area",
      width: 579,
      height: 554
    },
    featured: {
      title: "Shipping Container Hotel in San Antonio",
      paragraphs: [
        "Round Top, Texas has been an essential stop for those seeking antiques, bargains and art pieces since the bi-annual Original Round Top Antique Fair began. With old favorites such as Royer’s Round Top Cafe and new places like Rancho Pillow popping up, it’s no wonder that Texans make a point of visiting this destination all year round! FlopHouze, a unique “shipping container hotel” located just moments away from downtown Round Top, is offering one more reason to take the two-hour drive from San Antonio.",
        "Inside the same property as The Round Top Ballroom and Recycling the Past lies this six-unit facility – making it Texas’ first entirely shipping container based hotel! With all these incredible features, you won’t want to miss out on this extraordinary experience. Constructed with the same care and precision as a mini home, each compact unit is full of style and comfort. Depending on its design, up to six people can sleep in these chic spaces that feature living areas, kitchenettes, bathrooms and sleeping quarters. And don’t fret you won’t miss out on external beauty! Expansive windows sourced from an old school building in Philadelphia give you stunning views of Round Top’s graceful sunsets. Plus every room has access to outdoor areas decked out with hammocks for lounging around in during balmy afternoons or star-studded evenings by the firepit!"
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/flophouze-1024x683webpbv_resized_ipadwebpbv.webp",
        alt: "Shipping Container Hotel in San Antonio",
        width: 820,
        height: 547
      }
    },
    news: {
      title: "Shipping Container Bar and Kitchen in San Antonio",
      paragraphs: [
        "Elsewhere Garden Bar & Kitchen is soon to be the talk of the town, brought to life by the entrepreneurial spirit of Terrin Fuhrmann and Nolan Ellis. This spring, they’re set to transform the venue into a verdant retreat, where guests can escape the daily grind and immerse themselves in nature. Picture this: you’re lounging in a haven filled with lush plants, sipping on your choice of craft beer or fine wine, all while being serenaded by live music during happy hours. The aim is to create an environment that not only delights the senses but also fosters relaxation and joy. Elsewhere is designed to be more than just a bar and kitchen; it’s envisioned as a sanctuary where the community can gather, unwind, and experience the bliss of simply being."
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/shipping-container-house-charleston-scwebpbv_resized_ipadwebpbv.webp",
        alt: "shipping container house charleston sc",
        width: 800,
        height: 600
      }
    },
    deliveredLead: [],
    seo: {
      title: "Shipping Containers for Sale San Antonio | Affordable & Secure",
      description: "Buy shipping containers for sale San Antonio. Durable, reliable containers with fast delivery to your location. Call us now!",
      ogImage: "https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2024/05/14063436/google-reviews.webp"
    }
  },
  {
    slug: "san-francisco-oakland-ca",
    depot: "San Francisco / Oakland, CA",
    depotId: 40,
    place: {
      city: "San Francisco / Oakland",
      region: "CA",
      regionName: "California",
      label: "San Francisco / Oakland, CA"
    },
    nearbyCities: [
      {
        name: "Anaheim",
        href: "/extra-space-storage-anaheim"
      },
      {
        name: "Bakersfield",
        href: "/shipping-containers-for-sale-bakersfield-ca"
      },
      {
        name: "Chula Vista",
        href: "/shipping-containers-in-chula-vista-ca"
      },
      {
        name: "Corona",
        href: "/extra-space-storage-corona"
      },
      {
        name: "Fontana",
        href: "/shipping-containers-in-fontana-ca"
      },
      {
        name: "Fremont",
        href: "/extra-space-storage-fremont"
      },
      {
        name: "Fresno",
        href: "/shipping-containers-for-sale-fresno"
      },
      {
        name: "Irvine",
        href: "/storage-containers-irvine"
      },
      {
        name: "Los Angeles / Long Beach",
        href: "/where-to-buy-shipping-containers/los-angeles-long-beach-ca"
      },
      {
        name: "Modesto",
        href: "/storage-containers-for-sale-modesto-ca"
      },
      {
        name: "Moreno Valley",
        href: "/extra-space-storage-moreno-valley"
      },
      {
        name: "Orange County",
        href: "/orange-county-storage-containers"
      },
      {
        name: "Riverside",
        href: "/shipping-containers-for-sale-riverside-ca"
      },
      {
        name: "Sacramento",
        href: "/shipping-containers-for-sale-sacramento"
      },
      {
        name: "San Bernardino",
        href: "/shipping-containers-for-sale-san-bernardino"
      },
      {
        name: "San Diego",
        href: "/shipping-containers-for-sale-san-diego"
      },
      {
        name: "San Francisco / Oakland",
        href: "/where-to-buy-shipping-containers/san-francisco-oakland-ca"
      },
      {
        name: "San Jose",
        href: "/shipping-containers-for-sale-san-jose-ca"
      },
      {
        name: "Santa Clarita",
        href: "/extra-space-storage-santa-clarita"
      },
      {
        name: "Stockton",
        href: "/shipping-containers-for-sale-stockton"
      }
    ],
    mapImage: {
      src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/california-6721e44a4c6dc.webp",
      alt: "Map of the San Francisco / Oakland, CA area",
      width: 553,
      height: 559
    },
    featured: {
      title: "Refrigerated Shipping Container Home in San Francisco",
      paragraphs: [
        "This refrigerated shipping container home in San Francisco, California, incorporates three pre-insulated containers into the structure of this three-bedroom, 1350-square-foot house. Made to withstand tremendous loads and, with built-in refrigerated units, to keep a low constant temperature, these refrigerated shipping containers make excellent architectural building blocks and they easily meet the existing building codes. Re-purposing used refrigerated shipping containers is extremely resource efficient. The containers act as weatherproof exterior siding, insulation, and structural frame.",
        "Minimal insulation needs to be added on the roof and floor. Framing is only needed where bay windows and interior partition walls are added. The house was also designed to minimize energy use through passive solar design. Deep eaves minimize summer solar gain while allowing winter solar heating. Well-placed windows supply excellent daylighting and summer ventilation. Additional energy and water-saving features such as stacked plumbing, roof rainwater collection, high efficacy lighting, and Solatubes further reduce ecological impacts. Three 40′ refrigerated shipping containers were used to build this home in San Francisco, California. Two containers were stacked on top of each other and the third container was cut in half. The refrigerated shipping containers are separated by an inner atrium with large floor-to-ceiling windows."
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/refrigerated-shipping-container-home-california.webp",
        alt: "Refrigerated Shipping Container Home in San Francisco",
        width: 500,
        height: 666
      }
    },
    news: {
      title: "San Francisco Shipping Container Robo-Restaurant",
      paragraphs: [
        "Shipping containers have already been transformed into trendy homes, and in the near future, they will become automated robot-restaurants as well. Presenting Mezli – the San Francisco-based startup that has taken robotic restaurants to a whole new level. The innovative team has launched their Mediterranean bowl meals from a ghost kitchen in California and is now hard at work constructing the automated restaurant part of it. This exciting concept promises an experience like no other. Upon completion, the self-sufficient restaurant will be able to cook, plate and package food without any manual input.",
        "Mezli’s first iteration will possess 15 ingredients which it can then strategically place in a container, rather than just randomly mixing them or merely piling them on top of each other. Mezli is just getting started on its mission, yet it can’t even tell you how many dishes its robot will be able to prepare in an hour. But they’ve already obtained a pre-seed round of funding and plan to have the first autonomous kitchen spot up and running within the month! If this inaugural robotic restaurant proves popular, there’s a strong chance one could appear near you soon enough!"
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/san-francisco-shipping-container-robo-restaurant-1024x576.webp",
        alt: "San Francisco Shipping Container Robo-Restaurant",
        width: 800,
        height: 450
      }
    },
    deliveredLead: [],
    seo: {
      title: "Shipping Container For Sale Oakland | Top Quality & Low Prices",
      description: "At the most affordable pricing, we have a huge selection of shipping containers for sale in Oakland. Get your container now!",
      ogImage: "https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2024/05/14063436/google-reviews.webp"
    }
  },
  {
    slug: "saskatoon-sk",
    depot: "Saskatoon, SK",
    depotId: 53,
    place: {
      city: "Saskatoon",
      region: "SK",
      regionName: "Saskatchewan",
      label: "Saskatoon, SK"
    },
    nearbyCities: [],
    mapImage: {
      src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/saskatkoon-672343425fe80.webp",
      alt: "Map of the Saskatoon, SK area",
      width: 577,
      height: 561
    },
    featured: null,
    news: null,
    deliveredLead: [],
    seo: {
      title: "Saskatoon, SK 2 - OnsiteStorage",
      description: "Are you in search of a shipping container for sale in Saskatoon, SK? Look no further! We offer a diverse range of top-notch containers at budget-friendly prices. Whether you need it for storage, transportation, or transforming it into an innovative living area, we have got you covered. Contact us today and discover the ideal shipping container that suits your requirements.",
      ogImage: "https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2024/05/14063436/google-reviews.webp"
    }
  },
  {
    slug: "savannah-ga",
    depot: "Savannah, GA",
    depotId: 41,
    place: {
      city: "Savannah",
      region: "GA",
      regionName: "Georgia",
      label: "Savannah, GA"
    },
    nearbyCities: [
      {
        name: "Albany",
        href: "/storage-albany-ga"
      },
      {
        name: "Alpharetta",
        href: "/extra-space-storage-alpharetta-georgia"
      },
      {
        name: "Athens",
        href: "/shipping-containers-for-sale-athens-ga"
      },
      {
        name: "Atlanta",
        href: "/where-to-buy-shipping-containers/atlanta-ga"
      },
      {
        name: "Augusta",
        href: "/shipping-containers-for-sale-augusta-ga"
      },
      {
        name: "Columbus",
        href: "/shipping-containers-for-sale-columbus-ga"
      },
      {
        name: "Cumming",
        href: "/storage-cumming-ga"
      },
      {
        name: "Decatur",
        href: "/decatur-storage-containers"
      },
      {
        name: "Douglasville",
        href: "/shipping-container-douglasville-ga"
      },
      {
        name: "Duluth",
        href: "/extra-space-storage-duluth-ga"
      },
      {
        name: "Gainesville",
        href: "/shipping-container-for-sale-gainesville-ga"
      },
      {
        name: "Kennesaw",
        href: "/extra-space-storage-kennesaw-georgia"
      },
      {
        name: "Lawrenceville",
        href: "/storage-lawrenceville-ga"
      },
      {
        name: "Macon",
        href: "/shipping-containers-for-sale-macon-ga"
      },
      {
        name: "Marietta",
        href: "/portable-storage-containers-marietta-ga"
      },
      {
        name: "Norcross",
        href: "/storage-norcross-ga"
      },
      {
        name: "Roswell",
        href: "/roswell-portable-storage-container"
      },
      {
        name: "Savannah",
        href: "/where-to-buy-shipping-containers/savannah-ga"
      },
      {
        name: "Stone Mountain",
        href: "/storage-stone-mountain-ga"
      },
      {
        name: "Valdosta",
        href: "/extra-space-storage-valdosta-ga"
      }
    ],
    mapImage: {
      src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/savannah-6721e8415ade1.webp",
      alt: "Map of the Savannah, GA area",
      width: 610,
      height: 555
    },
    featured: {
      title: "Savannah Contemporary Shipping Container Home",
      paragraphs: [
        "Who would have thought that this beautiful contemporary home was made from two industrial storage containers used at the Port of Savannah in Georgia? Not only is it stunning, but many of its interior elements are sourced from salvaged materials that were destined for the dump! This magnificent structure speaks to the power and potential of upcycling. Yet, this 970-square-foot edifice stands as an affirmation that luxurious living doesn’t have to be expensive. It was envisioned by artist Julio Garcia of the Miami fabrication studio Price Street Projects after six months of research and development.",
        "They were able to acquire two shipping containers through a port worker which they cleverly repurposed into this one-of-a-kind space. He described the most strenuous part of the project as figuring out how to transport these mammoth containers onto a lush, one-acre plot without damaging its beauty. To ensure no damage was done during delivery and placement, two weeks were invested in meticulously maneuvering them into place. Leaving the exterior in its original form, this structure boasts an industrial aesthetic highlighted by a striking deep blue hue. Don’t let that rustic façade deceive you though – sunlight beams through floor-to-ceiling windows and white double doors open onto a finished 600 square feet of decking for both indoor and outdoor use. Garcia stated that they wanted to make sure it could be used not only indoors but outdoors as well."
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/savannah-contemporary-shipping-container-home-1024x661.webp",
        alt: "Savannah Contemporary Shipping Container Home",
        width: 800,
        height: 516
      }
    },
    news: {
      title: "Shipping Container Yard in Savannah",
      paragraphs: [
        "While traveling through Savannah’s Starland District, you may have noticed a towering array of shipping containers – puzzling what use they could be put to. Well now the remarkable transformation is complete – introducing ‘Starland Yard’: an exquisite sanctuary for locals and visitors alike, featuring delicious cuisine and unique entertainment in tribute to the port city’s economy. Here lies something truly extraordinary: a breathtakingly vibrant space like no other! The conception of Starland Yard began to take shape in Savannah. This unique destination will be a place where individuals from Savannah as well as other nearby towns can connect with one another while having fun and savoring delicious food.",
        "These huge shipping containers are being cut, lifted, and placed all over the area. This new hangout will be new to the people of Savannah so you’re really in for some fun times. The repurposed containers are artfully arranged in a way that creates an inviting and open atmosphere. Every area of the yard has been carefully designed with vibrant colors, comfortable seating areas, and plenty of space for socializing. Starland Yard provides the perfect place to relax and enjoy live music, outdoor screenings, workshops and other events like pop-ups."
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/starland-yard-1024x682.webp",
        alt: "Starland Yard",
        width: 800,
        height: 532
      }
    },
    deliveredLead: [],
    seo: {
      title: "Shipping Containers in Savannah GA | Top Quality & Low Prices",
      description: "At the most affordable pricing, we have a huge selection of shipping containers in Savannah. Get your container now!",
      ogImage: "https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2024/05/14063436/google-reviews.webp"
    }
  },
  {
    slug: "seattle-wa",
    depot: "Seattle, WA",
    depotId: 42,
    place: {
      city: "Seattle",
      region: "WA",
      regionName: "Washington",
      label: "Seattle, WA"
    },
    nearbyCities: [
      {
        name: "Auburn",
        href: "/storage-auburn-wa"
      },
      {
        name: "Federal Way",
        href: "/storage-units-federal-way-wa"
      },
      {
        name: "Puyallup",
        href: "/storage-units-puyallup-wa"
      },
      {
        name: "Vancouver",
        href: "/storage-units-vanvouver-wa"
      },
      {
        name: "Bellevue",
        href: "/storage-units-bellevue-wa"
      },
      {
        name: "Kennewick",
        href: "/storage-units-kennewick-wa"
      },
      {
        name: "Redmond",
        href: "/storage-units-redmond-wa"
      },
      {
        name: "Yakima",
        href: "/storage-units-yakima-wa"
      },
      {
        name: "Bellingham",
        href: "/storage-units-bellingham-wa"
      },
      {
        name: "Kent",
        href: "/storage-kent-wa"
      },
      {
        name: "Renton",
        href: "/storage-units-renton-wa"
      },
      {
        name: "Bothell",
        href: "/storage-units-bothell-wa"
      },
      {
        name: "Kirkland",
        href: "/storage-kirkland-wa"
      },
      {
        name: "Seattle",
        href: "/cargo-container-seattle"
      },
      {
        name: "Bremerton",
        href: "/storage-units-bremerton-wa"
      },
      {
        name: "Lynnwood",
        href: "/storage-units-lynnwood-wa"
      },
      {
        name: "Spokane",
        href: "/shipping-containers-for-sale-spokane-wa"
      },
      {
        name: "Everett",
        href: "/shipping-containers-for-sale-everett-wa"
      },
      {
        name: "Olympia",
        href: "/shipping-containers-for-sale-olympia-wa"
      },
      {
        name: "Tacoma",
        href: "/tacoma-cargo-container"
      }
    ],
    mapImage: {
      src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/seattle-6721f4a646178.webp",
      alt: "Map of the Seattle, WA area",
      width: 593,
      height: 570
    },
    featured: {
      title: "Shipping Container Home in Seattle",
      paragraphs: [
        "When Julianna Carlson departed her parents’ Delridge home to pursue a college education in Santa Barbara, she never thought the West Coast sunshine would become dull. However, when the Pacific Northwesterner graduated in 2015 and returned home, something was different – nothing seemed familiar anymore. As homes within her budget weren’t up to par with what she wanted for herself and family, Carlson made an unconventional decision; despite having no architectural experience or training whatsoever, this political science major drew out plans for building her own unique dwelling from recycled shipping containers!",
        "Carlson acquired six 20-foot shipping containers and had them trucked in and laid out within two days during the spring of 2017. Although window openings were pre-cut to meet his particular specifications, the internal buildout comprising drywall for external walls, plumbing, electrical installation took almost a year due to difficulty getting correct permits; it turns out that local authorities weren’t sure how to handle such a residential container home. Carlson left the external aspects of the shipping container home untouched, with four at the bottom and two stacked on top. However, a quaint nautical vibe was created within these walls. The handrail to reach upstairs is mirroring those found in ferries; charming cargo boats have been artfully painted onto an accent wall downstairs; and if you peek inside the master bedroom walk-in closet, you’ll be captivated by its porthole window that transports one into feeling like they are at sea!"
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/shipping-container-home-in-seattle.webp",
        alt: "Shipping Container Home in Seattle",
        width: 567,
        height: 378
      }
    },
    news: {
      title: "Shipping Container Boutique in Seattle",
      paragraphs: [
        "Stop by Cupcake Royale in downtown Bellevue and catch a glimpse of the incredible 24-foot mobile solar powered boutique fashion shop made out of a salvaged shipping container! NuBe Green, an esteemed Capitol Hill retailer, brings you their best designs and products that are all manufactured right here in the US. Delightfully packaged inside a large rectangular box, this summer is sure to be memorable with these unique finds.",
        "June 20, 2013, NuBe and Cupcake Royale hosted their grand opening to celebrate the newly renovated Oddfellows Hall digs! They have plenty of food, music, activities such as DIY origami vegetable pots plus a BOGO ice cream offer from NuBe. As if that wasn’t enough already; they also get 10% off cuts and products at Rudy’s Barbershop next door and even score some FREE MOHAWKS. How awesome is that? Moreover, owner Ruth True has completely renovated the Oddfellows Hall digs, reducing their shop footprint significantly in the process."
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/nube-green-goes-mobile.webp",
        alt: "Shipping Container Boutique in Seattle",
        width: 416,
        height: 333
      }
    },
    deliveredLead: [
      {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/atlanta-8-671b565d04559webpbv.webp",
        alt: "Shipping container delivered in Atlanta",
        width: 365,
        height: 362
      },
      {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/new-orleans-4-671b565f2a44fwebpbv.webp",
        alt: "Shipping container delivered in New Orleans",
        width: 365,
        height: 362
      },
      {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/baltimore-7-671b565ebc2a2webpbv.webp",
        alt: "Shipping container delivered in Baltimore",
        width: 365,
        height: 362
      }
    ],
    seo: {
      title: "Shipping Containers for Sale Seattle | Buy, Rent, Rent-to-Own Deal",
      description: "Shipping containers for sale in Seattle. Buy, rent, or rent-to-own with fast delivery and affordable prices. Reserve your container today!",
      ogImage: "https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2024/05/14063436/google-reviews.webp"
    }
  },
  {
    slug: "st-louis-mo",
    depot: "St. Louis, MO",
    depotId: 43,
    place: {
      city: "St. Louis",
      region: "MO",
      regionName: "Missouri",
      label: "St. Louis, MO"
    },
    nearbyCities: [
      {
        name: "Ballwin",
        href: "/storage-units-ballwin-mo"
      },
      {
        name: "Florissant",
        href: "/storage-units-florissant-mo"
      },
      {
        name: "Liberty",
        href: "/storage-units-liberty-mo"
      },
      {
        name: "Springfield",
        href: "/shipping-containers-for-sale-springfield-mo"
      },
      {
        name: "Blue Springs",
        href: "/extra-space-storage-blue-springs-mo"
      },
      {
        name: "Independence",
        href: "/storage-units-independence-mo"
      },
      {
        name: "O Fallon",
        href: "/storage-o-fallon-mo"
      },
      {
        name: "Wentzville",
        href: "/storage-units-wentzville-mo"
      },
      {
        name: "Cape Girardeau",
        href: "/storage-units-cape-girardeau-mo"
      },
      {
        name: "Jefferson City",
        href: "/storage-units-jefferson-city-mo"
      },
      {
        name: "Saint Charles",
        href: "/storage-units-saint-charles-mo"
      },
      {
        name: "Chesterfield",
        href: "/storage-units-chesterfield-mo"
      },
      {
        name: "Joplin",
        href: "/shipping-containers-for-sale-joplin-mo"
      },
      {
        name: "Saint Joseph",
        href: "/storage-in-saint-joseph-mo"
      },
      {
        name: "Columbia",
        href: "/shipping-containers-columbia-mo"
      },
      {
        name: "Kansas City",
        href: "/portable-storage-containers-kansas-city-mo"
      },
      {
        name: "Saint Louis",
        href: "/cargo-containers-st-louis"
      },
      {
        name: "Fenton",
        href: "/storage-units-fenton-mo"
      },
      {
        name: "Lees Summit",
        href: "/storage-units-lees-summit-mo"
      },
      {
        name: "Saint Peters",
        href: "/storage-st-peters-mo"
      }
    ],
    mapImage: {
      src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/st-louis-6721fa7e5bd07webpbv_resized_ipadwebpbv.webp",
      alt: "Map of the St. Louis, MO area",
      width: 574,
      height: 555
    },
    featured: {
      title: "Artistic Shipping Container Home in St. Louis",
      paragraphs: [
        "Travis Sheridan, of Venture Cafe Global Institute, has had quite an entertaining time since he moved into his new abode—the doorbell camera catching a multitude of people trying to sneakily peek inside. On May 11th, St. Louisans and any other curious individuals will have the exclusive chance to witness what lies behind those doors with an Old North House and Community Tour. People can’t help but be fascinated by Smithey’s container home, which was co-created by Sheridan and Zack and is situated in St. Louis.",
        "When they were constructing the container house, Sheridan says they had the intention of having it on a tour. Not only did this give them an opportunity to show what’s achievable in St. Louis and North St. Louis alike, but also dismiss any false impressions that people may have about North St. Louis as well! After all, what better way to showcase their art than by inviting 300 strangers into your home? It is certainly something they enjoy doing too! The art of this house is prevalent, mainly from local artists in St. Louis and Fresno, California. A 15-panel piece from Firecracker Press – depicting a vibrantly colored solar system – hangs on the foyer wall and was used as inspiration for the home’s interior color palette. You can also find two custom floating walls that act as gallery spaces for additional artwork pieces throughout the home’s design journey."
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/shipping-container-home-in-st-louis-768x1024webpbv.webp",
        alt: "shipping container home in st louis",
        width: 680,
        height: 906
      }
    },
    news: {
      title: "St. Louis Shipping Container Restobar",
      paragraphs: [
        "The Sandbox will be a seasonal concession stand for both alcoholic and non-alcoholic beverages. It will be located next to the sand volleyball courts (hence the name) adjacent to the Missouri Rush Soccer Club fields. Llywelyn’s primary restaurant, currently under construction, will be located directly across from the Sandbox. The shipping container bar will help support and entertain the sand volleyball and soccer venues within the sports complex. The Sandbox took six weeks to modify. It has been outfitted with three custom-made canopies as well as awnings. Each concession window has a retractable countertop. This modified shipping container bar and restaurant have been painted and branded, and exterior lighting has been installed.",
        "This unit has a steel 3/0 man door on the exterior, and all-electric components have been installed in plain view. Inside you will find beverage coolers and beer taps to get your party going, as well as wall monitors for entertainment. It is clear that North St. Louis has some of the most unique and creative businesses around. These restaurants, bars, and other venues bring life to the community in a way that cannot be ignored – providing entertainment, delicious food, and outstanding art for all to enjoy!"
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/sandbox-shipping-container-bar-1024x683webpbv_resized_ipadwebpbv.webp",
        alt: "sandbox shipping container bar",
        width: 680,
        height: 453
      }
    },
    deliveredLead: [
      {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/atlanta-8-671b565d04559webpbv.webp",
        alt: "Shipping container delivered in Atlanta",
        width: 365,
        height: 362
      },
      {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/new-orleans-4-671b565f2a44fwebpbv.webp",
        alt: "Shipping container delivered in New Orleans",
        width: 365,
        height: 362
      },
      {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/baltimore-7-671b565ebc2a2webpbv.webp",
        alt: "Shipping container delivered in Baltimore",
        width: 365,
        height: 362
      }
    ],
    seo: {
      title: "Shipping Containers For Sale St Louis | Buy, Rent, or Rent-to-Own",
      description: "Shipping containers for sale St Louis. Buy, rent, or rent-to-own strong, secure containers with fast local delivery. Call now!",
      ogImage: "https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2024/05/14063436/google-reviews.webp"
    }
  },
  {
    slug: "tacoma-wa",
    depot: "Tacoma, WA",
    depotId: 44,
    place: {
      city: "Tacoma",
      region: "WA",
      regionName: "Washington",
      label: "Tacoma, WA"
    },
    nearbyCities: [
      {
        name: "Auburn",
        href: "/storage-auburn-wa"
      },
      {
        name: "Federal Way",
        href: "/storage-units-federal-way-wa"
      },
      {
        name: "Puyallup",
        href: "/storage-units-puyallup-wa"
      },
      {
        name: "Vancouver",
        href: "/storage-units-vanvouver-wa"
      },
      {
        name: "Bellevue",
        href: "/storage-units-bellevue-wa"
      },
      {
        name: "Kennewick",
        href: "/storage-units-kennewick-wa"
      },
      {
        name: "Redmond",
        href: "/storage-units-redmond-wa"
      },
      {
        name: "Yakima",
        href: "/storage-units-yakima-wa"
      },
      {
        name: "Bellingham",
        href: "/storage-units-bellingham-wa"
      },
      {
        name: "Kent",
        href: "/storage-kent-wa"
      },
      {
        name: "Renton",
        href: "/storage-units-renton-wa"
      },
      {
        name: "Bothell",
        href: "/storage-units-bothell-wa"
      },
      {
        name: "Kirkland",
        href: "/storage-kirkland-wa"
      },
      {
        name: "Seattle",
        href: "/cargo-container-seattle"
      },
      {
        name: "Bremerton",
        href: "/storage-units-bremerton-wa"
      },
      {
        name: "Lynnwood",
        href: "/storage-units-lynnwood-wa"
      },
      {
        name: "Spokane",
        href: "/shipping-containers-for-sale-spokane-wa"
      },
      {
        name: "Everett",
        href: "/shipping-containers-for-sale-everett-wa"
      },
      {
        name: "Olympia",
        href: "/shipping-containers-for-sale-olympia-wa"
      },
      {
        name: "Tacoma",
        href: "/tacoma-cargo-container"
      }
    ],
    mapImage: {
      src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/tacoma-67230b5e7d396.webp",
      alt: "Map of the Tacoma, WA area",
      width: 571,
      height: 551
    },
    featured: {
      title: "Off-Dock Container Facility in Tacoma",
      paragraphs: [
        "The Port is developing a new off-dock container support facility on 24.5 acres of Port-owned land in the Tideflats area, near Thorne Road and Maxwell Way. This new facility will improve container port operations by providing space away from the dock for storing, staging, and processing containers and chassis. This will help reduce supply chain congestion by easing ship, terminal, rail, and road traffic.",
        "Additionally, the facility aims to lower air emissions from ships, trucks, rail, and yard equipment, enhancing the safety and reliability of goods movement in and out of the Port. As part of the project, the Port has already created the Lower Wapato Creek habitat site, preserving over 110 native trees and planting around 150,000 trees, shrubs, and other plants to support local wildlife and the environment."
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/off-dock-container-facilities-tacoma-1024x469.webp",
        alt: "Off-dock container facilities tacoma",
        width: 800,
        height: 366
      }
    },
    news: {
      title: "Tacoma Mountain of Shipping Containers",
      paragraphs: [
        "The Port of Tacoma is bursting with a never-ending influx of thousands of shipping containers, some empty and others fully loaded – an extreme consequence caused by the COVID-19 pandemic that has driven up prices and created product shortages. An array of factors triggered by the pandemic have resulted in more containers coming into Tacoma than leaving it.",
        "The shipping industry thrives on the dependability of 40-foot steel containers, which can be swiftly unloaded from ships and then distributed via trucks or trains. These vessels arrive in Tacoma loaded with Asian furniture or electronics and leave carrying frozen potatoes or paper goods. Their efficient flow requires matching transports to come and go according to schedule, as well as personnel who load and transport items. A balanced supply and demand is essential for success within this system."
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/mountain-of-shipping-container-tacoma.webp",
        alt: "mountain of shipping container tacoma",
        width: 800,
        height: 449
      }
    },
    deliveredLead: [],
    seo: {
      title: "Shipping Container For Sale Tacoma | Top Quality & Low Prices",
      description: "At the most affordable pricing, we have a huge selection of shipping containers for sale in Tacoma. Get your container now!",
      ogImage: "https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2024/05/14063436/google-reviews.webp"
    }
  },
  {
    slug: "tampa-fl",
    depot: "Tampa, FL",
    depotId: 45,
    place: {
      city: "Tampa",
      region: "FL",
      regionName: "Florida",
      label: "Tampa, FL"
    },
    nearbyCities: [
      {
        name: "Boca Raton",
        href: "/all-city/storage-units-boca-raton"
      },
      {
        name: "Jacksonville",
        href: "/all-city/cargo-containers-for-sale-jacksonville-fl"
      },
      {
        name: "Orlando",
        href: "/all-city/shipping-containers-for-sale-orlando"
      },
      {
        name: "Tampa",
        href: "/all-city/cargo-containers-for-sale-tampa"
      },
      {
        name: "Bradenton",
        href: "/all-city/storage-units-bradenton-fl"
      },
      {
        name: "Kissimmee",
        href: "/all-city/storage-units-kissimmee-fl"
      },
      {
        name: "Pensacola",
        href: "/all-city/shipping-containers-for-sale-pensacola"
      },
      {
        name: "West Palm Beach",
        href: "/all-city/shipping-containers-for-sale-west-palm-beach"
      },
      {
        name: "Fort Lauderdale",
        href: "/all-city/shipping-containers-for-sale-fort-lauderdale"
      },
      {
        name: "Lake Worth",
        href: "/all-city/storage-units-lake-worth-fl"
      },
      {
        name: "Pompano Beach",
        href: "/all-city/storage-units-pompano-beach-fl"
      },
      {
        name: "Fort Myers",
        href: "/all-city/shipping-containers-for-sale-fort-myers-fl"
      },
      {
        name: "Lakeland",
        href: "/all-city/shipping-containers-lakeland-fl"
      },
      {
        name: "Saint Petersburg",
        href: "/all-city/storage-saint-petersburg-florida"
      },
      {
        name: "Hialeah",
        href: "/all-city/storage-units-hialeah"
      },
      {
        name: "Miami",
        href: "/all-city/cargo-containers-for-sale-miami"
      },
      {
        name: "Sarasota",
        href: "/all-city/storage-units-sarasota-fl"
      },
      {
        name: "Hollywood",
        href: "/all-city/storage-hollywood-fl"
      },
      {
        name: "Naples",
        href: "/all-city/shipping-containers-for-sale-naples-fl"
      },
      {
        name: "Tallahassee",
        href: "/all-city/shipping-containers-for-sale-tallahassee-fl"
      }
    ],
    mapImage: {
      src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/tampa-6723119a3d563.webp",
      alt: "Map of the Tampa, FL area",
      width: 570,
      height: 558
    },
    featured: {
      title: "Shipping Container Airbnb in Florida",
      paragraphs: [
        "Step into Rob DePiazza’s house and you’ll find yourself transported back to the heart of the 1960s’ pop art revolution. His home is filled with an array of Andy Warhol- and Keith Haring-style artwork, striking patterns, vibrant primary colors, and mid-century mod design; it’s like walking through a museum exhibit dedicated to these iconic cultural influences! Converted container homes have been gaining popularity in communities throughout the nation, captivating people with their utilitarian and rustic industrial style.",
        "When DePiazza constructed his residence at 1369 Prince Road, he intended it to be a refuge for him and his family; an alternative dwelling following Hurricane Irma devastatingly destroying the property adjacent to that of which they had called home for over three decades prior. DePiazza’s PRCH (Prince Road Container House) offers a memorable experience for only $350 per night. Guests will enjoy 1,600 square feet of living space with room to sleep six and many exciting amenities like: a BOSE sound system; Viking gas range; an elegant landing-pad lounge; retro-style dining booth/counter; and even a restored 1957 jukebox or art collection making it the perfect place for family getaways!"
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/shipping-container-airbnb-in-florida-1024x683.webp",
        alt: "Shipping Container Airbnb in Florida",
        width: 800,
        height: 533
      }
    },
    news: {
      title: "Shipping Container Commercial Hub in Tampa",
      paragraphs: [
        "In St. Petersburg, the owners of Getaway are constructing a chic container-style waterfront bar and kitchen to enhance their guests’ experience. Over in Tampa, Lightning fans are reveling in the NHL playoffs at Ferg’s Live – another one of architect Brandon Hicks’ captivating designs made from containers that is located conveniently close to Amalie Arena. Containers offer abundance when it comes to functionality and style; an idea that Hicks cleverly capitalized on with his projects!",
        "Beyond Ferg’s and the Getaway, a team of architects has been working diligently on an ambitious project called Mercado. Their dream is to build a 3.25 state acre plaza made out of containers at the intersection between Interstate 275 and Interstate 4; it would serve as both commercial hub and community center. At 12th Street Studio in Tampa, Hicks took charge of this endeavor after spending years perfecting container projects; but out of them all, The Getaway was the first one to come into fruition!"
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/shipping-container-tampa-bay.webp",
        alt: "shipping container tampa bay",
        width: 660,
        height: 380
      }
    },
    deliveredLead: [],
    seo: {
      title: "Shipping Containers for Sale Tampa | Rent-to-Own Deals",
      description: "Find budget-friendly shipping containers for sale Tampa. Low prices, flexible rent-to-own options & quick delivery. Call us now!",
      ogImage: "https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2024/05/14063436/google-reviews.webp"
    }
  },
  {
    slug: "temecula-ca",
    depot: "Temecula, CA",
    depotId: 144,
    place: {
      city: "Temecula",
      region: "CA",
      regionName: "California",
      label: "Temecula, CA"
    },
    phone: "(951) 399-2653",
    nearbyCities: [],
    mapImage: null,
    featured: {
      title: "Shipping Container Homes in Temecula",
      paragraphs: [
        "Inspired by their first foray into social entrepreneurship, the Wilsons are striving to repurpose empty shipping containers and transform them into homes for those experiencing homelessness. Their story began when they created \"weekend survival kits\" filled with food that over 100 homeless children pick up at school every Friday to take home to their families. Now, they have taken this mission a step further in an effort to make a lasting difference in the lives of others. With the support of the California Food Bank, the Wilsons have established a backpack program and are now searching for associates to transform 40-foot-long cargo containers into homes.",
        "To make this dream come true, they've asked Jay Orr from ARQ Architects to create plans for a line of container modifications that will fit on what once were vacant row house foundations after their deconstruction or demolition by Baltimore City. The stability and movability these containers provide give them an edge ideal for such uses, yet with one condition they must be designed in such a way as not to draw attention to themselves being cargo boxes. After conducting extensive research, the Wilsons determined that they can convert cargo containers into homes for around $20,000 each. They want to provide families with a rent-to-own option when it comes to these container houses - not as temporary shelters but as permanent housing. To make this dream come true, they visited City Hall and spoke with officials about what would be required of them in order to start their project; happily receiving a positive response along with some helpful advice on partners that could help bridge the disparity between affordable housing needs within the city limits."
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/a-sustainable-solution-1024x576_RcxAHZA.webp",
        alt: "A Sustainable Solution",
        width: 1024,
        height: 576
      }
    },
    news: {
      title: "Shipping Container 3-Star Kitchen in Temecula",
      paragraphs: [
        "When Thomas Keller and his team of architects, Envelope A+D, were pressed for time to build a stunning new kitchen for French Laundry's 20th-anniversary celebration, they came up with an inventive solution: cooking in shipping containers! Now one of the world's top restaurants is operating out of these structures. Four shipping containers artfully combined together, you'd almost think the restaurant had not gone through a single alteration. That is partially due to the fact that they managed to transition the prior kitchen's equipment layout in its entirety over to this new spot.",
        "David Breeden, Chef de Cuisine at French Laundry commented that his greatest difficulty was altering where each dish goes for final touches before being presented to guests; previously it ran from left to right while now it needs to go right-to-left. At first, it seemed impossible to close the restaurant for more than three months; however, six and then one year felt too long. After researching alternative venues, they realized that their current building already had a dining room - all they needed was a temporary kitchen. The architects came up with an innovative idea: utilizing shipping containers! Once the source of materials was secured and someone was available to modify them, their dream became a reality."
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/sustainability-and-efficiency-1024x576.webp",
        alt: "Sustainability and Efficiency",
        width: 1024,
        height: 576
      }
    },
    deliveredLead: [],
    seo: {
      title: "Temecula, CA - OnsiteStorage",
      description: "4.9 Shipping Containers For Sale Temecula, CA Shipping Containers For Sale Temecula, CA 100% Satisfaction Guaranteed – Highest Customer Satisfaction -Founded in 2002 (888) 977-9085 WE HAVE CONTAINERS FOR EVERY BUDGET! Explore our top-selling shipping containers available in Temecula, CA Get competitive prices and fast delivery across the Temecula, CA area. Click on each product...",
      ogImage: "https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2024/05/14063436/google-reviews.webp"
    },
    text: {
      buy: {
        heading: "Buy A Shipping Container In [[Temecula]] At the best price"
      }
    }
  },
  {
    slug: "toronto-on",
    depot: "Toronto, ON",
    depotId: 46,
    place: {
      city: "Toronto",
      region: "ON",
      regionName: "Ontario",
      label: "Toronto, ON"
    },
    nearbyCities: [
      {
        name: "Belleville",
        href: "/storage-units-belleville"
      },
      {
        name: "Toronto",
        href: "/metal-storage-toronto"
      },
      {
        name: "Sault Ste. Marie",
        href: "/storage-units-sault-ste-marie"
      },
      {
        name: "London",
        href: "/shipping-containers-london"
      },
      {
        name: "Kingston",
        href: "/shipping-container-for-sale-kingston"
      },
      {
        name: "Burlington",
        href: "/burlington-shipping-container"
      },
      {
        name: "St. Catharines",
        href: "/shipping-containers-st-catharines"
      },
      {
        name: "Vaughan",
        href: "/storage-units-vaughan"
      },
      {
        name: "Elliot Lake",
        href: "/elliot-lake-storages"
      },
      {
        name: "Stratford",
        href: "/storage-units-stratford"
      },
      {
        name: "Waterloo",
        href: "/storage-units-waterloo"
      },
      {
        name: "Hamilton",
        href: "/shipping-containers-for-sale-hamilton-2"
      },
      {
        name: "Thorold",
        href: "/storage-units-in-thorold"
      },
      {
        name: "Welland",
        href: "/storage-units-welland"
      },
      {
        name: "Niagara Falls",
        href: "/storage-units-niagara-falls"
      },
      {
        name: "Thunder Bay",
        href: "/shipping-containers-thunder-bay"
      },
      {
        name: "Windsor",
        href: "/shipping-container-windsor"
      },
      {
        name: "Peterborough",
        href: "/shipping-container-peterborough"
      },
      {
        name: "Timmins",
        href: "/shipping-container-timmins"
      },
      {
        name: "Woodstock",
        href: "/storage-units-woodstock"
      }
    ],
    mapImage: {
      src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/toronto-67232eb41df4c.webp",
      alt: "Map of the Toronto, ON area",
      width: 571,
      height: 557
    },
    featured: {
      title: "Shipping Container Market 707 in Toronto",
      paragraphs: [
        "The intersection of Bathurst and Dundas was a desolate void in comparison to the energetic hustle-and-bustle found at nearby Chinatown and Kensington Market. However, with the emergence of Market 707, this corner has been brought back to life! This street food and retail market have attracted people from all across Toronto while providing financial gain for those living in the area – all thanks to a couple of repurposed shipping containers. Pop-up infrastructure is quickly becoming an affordable trend within architecture and planning circles that can revolutionize communities just like it did here!",
        "When summer arrives, the hustle is on for entrepreneurs at Market 707! From serving up delicious Afghan food to providing cleaning services, they offer their creations and skills to visitors of Kensington Market as well as employees from the hospital nearby. Reap all that sunshine by taking your meal outdoors and enjoying it with friends or solo in one of the many benches available here. Don’t forget to try out some local favorites like Stuff’D Grilled Cheese, Nom Nom Nom Poutine, Nantana Gushi and more."
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/shipping-container-market-707-in-toronto-1024x683.webp",
        alt: "Shipping Container Market 707 in Toronto",
        width: 800,
        height: 533
      }
    },
    news: {
      title: "Shipping Container Home in Toronto",
      paragraphs: [
        "Carl was the mastermind behind this remarkable hybrid home, which is half composed of three used shipping containers and the other built conventionally with pillars to support its hovering presence above his couple’s restaurant. He crafted much of it himself such as welding large portions together and innovatively executing DIY features that make it truly unique.span class=\"dots\">.",
        "It took an entire nine years to complete this 3 bedroom, 320 sqm home into reality from designing it, getting approvals and finally building completion. The containers were modified offsite with all cut-outs done beforehand as well as spray foam insulation beneath them before they were delivered and placed using a crane. One of the biggest obstacles was finding a way to insulate the containers while connecting them to another structure, dropping them between two buildings via an alleyway that was too narrow for their size."
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/hybrid-home-shipping-container-toronto.webp",
        alt: "Hybrid home shipping container toronto",
        width: 300,
        height: 300
      }
    },
    deliveredLead: [],
    seo: {
      title: "Shipping Container For Sale Toronto | Top Quality & Low Prices",
      description: "At the most affordable pricing, we have a huge selection of shipping containers for sale in Toronto. Get your container now!",
      ogImage: "https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2024/05/14063436/google-reviews.webp"
    }
  },
  {
    slug: "vancouver-bc-delta-bc",
    depot: "Vancouver, BC / Delta, BC",
    depotId: 47,
    place: {
      city: "Vancouver / Delta",
      region: "BC",
      regionName: "British Columbia",
      label: "Vancouver, BC / Delta, BC"
    },
    nearbyCities: [
      {
        name: "Victoria",
        href: "/shipping-containers-victoria"
      },
      {
        name: "Vancouver",
        href: "/metal-storage-vancouver"
      },
      {
        name: "Nelson",
        href: "/nelson-shipping-containers"
      },
      {
        name: "Duncan",
        href: "/duncan-shipping-containers"
      },
      {
        name: "Greenwood",
        href: "/shipping-containers-for-sale-in-greenwood"
      },
      {
        name: "Kelowna",
        href: "/shipping-containers-for-sale-kelowna"
      },
      {
        name: "Revelstoke",
        href: "/revelstoke-storage"
      },
      {
        name: "Grand Forks",
        href: "/shipping-containers-grand-forks"
      },
      {
        name: "Penticton",
        href: "/storage-containers-penticton"
      },
      {
        name: "Kamloops",
        href: "/shipping-containers-for-sale-kamloops"
      },
      {
        name: "Parksville",
        href: "/shipping-container-parksville"
      },
      {
        name: "Whistler",
        href: "/whistler-storage-units"
      },
      {
        name: "Vernon",
        href: "/shipping-containers-for-sale-vernon-bc"
      },
      {
        name: "Port Alberni",
        href: "/port-alberni-storage"
      },
      {
        name: "Nanaimo",
        href: "/shipping-container-nanaimo"
      },
      {
        name: "Armstrong",
        href: "/armstrong-storage-units"
      },
      {
        name: "Merritt",
        href: "/portable-storage-containers-merritt"
      },
      {
        name: "Squamish",
        href: "/shipping-container-squamish"
      },
      {
        name: "Delta",
        href: "/storage-containers-delta"
      },
      {
        name: "Maple Ridge",
        href: "/storage-containers-maple-ridge-bc"
      }
    ],
    mapImage: {
      src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/vancouver-67233463359a0.webp",
      alt: "Map of the Vancouver, BC / Delta, BC area",
      width: 598,
      height: 555
    },
    featured: {
      title: "Shipping Container Pop-Up Patio in Vancouver",
      paragraphs: [
        "Today is the perfect day to explore False Creek seawall’s new custom-built shipping container patio. Located in Plaza of Nations, this innovative 10×20 foot trailer has been designed to reinvigorate ‘dead lots’ while they await redevelopment into residential and commercial sites. With a 70-seat licensed outdoor seating area that recently opened, it offers locals an ideal spot for Playa Patron and AYCE events! So don’t wait any longer – come experience one of Vancouver’s newest patios on the waterfront today!",
        "If you’re looking for a unique experience, Batch is the perfect spot, offering everything from Nightingale pizza to charcuterie. With local food vendors, craft breweries like 33 Acres and live music performances throughout the weekend – there’s something for everyone. And this Saturday specifically, Rosie’s BBQ & Smokehouse will be onsite with their 19-foot smoker Hank! Don’t miss out – come join us at Batch today. For a genuine taste of Central Texan BBQ, guests can savor an array of locally sourced meats smoked to perfection. From succulent brisket and ribs to the delectable Barbacoa beef and juicy burgers no craving will go unsatisfied! To complete your meal, indulge in some classic southern sides like cornbread and coleslaw for an unforgettable dining experience."
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/shipping-container-pop-up-patio-in-vancouver.webp",
        alt: "Shipping Container Pop-Up Patio in Vancouver",
        width: 800,
        height: 600
      }
    },
    news: {
      title: "Shipping Container Homes in Vancouver",
      paragraphs: [
        "Innovative social housing made from recycled shipping containers is set to be introduced in the Downtown Eastside of Vancouver. Atira Women’s Resource Society will construct a magnificent seven-storey building with 56 upcycled shipping containers at the corner Hastings St. and Hawks Ave., revolutionizing affordable living solutions in this troubled neighborhood.",
        "A total of 14 two-bedroom units, measuring a generous 420 square feet each and seven micro units at 280 square feet apiece will be constructed out of shipping containers. Every studio unit consists of two 8’x20′ container sections while the larger two bedroom homes are made up with three containers. In order to make this accessible for all income levels, rental rates have been set accordingly – $375/monthly for singles and $570/monthly for a person living with one child; both within the shelter component range in British Columbia’s welfare system. To promote community engagement amongst tenants, an amenity room has also been designed alongside an internal courtyard filled with garden plots providing nature buffers throughout the complex."
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/shipping-container-homes-in-vancouver.webp",
        alt: "Shipping Container Homes in Vancouver",
        width: 800,
        height: 449
      }
    },
    deliveredLead: [
      {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/atlanta-8-671b565d04559webpbv.webp",
        alt: "Shipping container delivered in Atlanta",
        width: 365,
        height: 362
      },
      {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/new-orleans-4-671b565f2a44fwebpbv.webp",
        alt: "Shipping container delivered in New Orleans",
        width: 365,
        height: 362
      },
      {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/baltimore-7-671b565ebc2a2webpbv.webp",
        alt: "Shipping container delivered in Baltimore",
        width: 365,
        height: 362
      }
    ],
    seo: {
      title: "Shipping Containers For Sale Vancouver BC | Buy or Rent Options",
      description: "Get shipping containers for sale in Vancouver, BC, with flexible buy or rent options. Durable, weatherproof, and affordable. Call us now!",
      ogImage: "https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2024/05/14063436/google-reviews.webp"
    }
  },
  {
    slug: "wilmington-nc",
    depot: "Wilmington, NC",
    depotId: 48,
    place: {
      city: "Wilmington",
      region: "NC",
      regionName: "North Carolina",
      label: "Wilmington, NC"
    },
    nearbyCities: [
      {
        name: "Asheville",
        href: "/all-city/shipping-container-asheville-nc"
      },
      {
        name: "Durham",
        href: "/all-city/shipping-containers-durham"
      },
      {
        name: "High Point",
        href: "/all-city/storage-units-high-point-nc"
      },
      {
        name: "Wilmington",
        href: "/all-city/shipping-containers-for-sale-wilmington-nc"
      },
      {
        name: "Burlington",
        href: "/all-city/portable-storage-burlington"
      },
      {
        name: "Fayetteville",
        href: "/all-city/portable-storage-fayetteville-nc"
      },
      {
        name: "Jacksonville",
        href: "/all-city/storage-containers-jacksonville-nc"
      },
      {
        name: "Winston Salem",
        href: "/all-city/shipping-containers-for-sale-winston-salem-nc"
      },
      {
        name: "Cary",
        href: "/all-city/storage-units-cary-nc"
      },
      {
        name: "Gastonia",
        href: "/all-city/shipping-containers-gastonia-nc"
      },
      {
        name: "Lexington",
        href: "/all-city/storage-units-lexington-nc"
      },
      {
        name: "Chapel Hill",
        href: "/all-city/storage-units-chapel-hill"
      },
      {
        name: "Greensboro",
        href: "/all-city/shipping-containers-for-sale-greensboro-nc"
      },
      {
        name: "Monroe",
        href: "/all-city/storage-units-monroe-nc"
      },
      {
        name: "Charlotte",
        href: "/all-city/steel-shipping-containers-charlotte-nc"
      },
      {
        name: "Greenville",
        href: "/all-city/storage-units-greenville-nc"
      },
      {
        name: "Raleigh",
        href: "/all-city/cargo-containers-for-sale-raleigh-nc"
      },
      {
        name: "Concord",
        href: "/all-city/storage-units-concord-nc"
      },
      {
        name: "Hickory",
        href: "/all-city/shipping-containers-for-sale-hickory-nc"
      },
      {
        name: "Salisbury",
        href: "/all-city/storage-units-salisbury-nc"
      }
    ],
    mapImage: {
      src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/wilmington-67231657cf784.webp",
      alt: "Map of the Wilmington, NC area",
      width: 587,
      height: 555
    },
    featured: {
      title: "Shipping Container Cargo District in Wilmington",
      paragraphs: [
        "Located at the intersection of 16th and Queen Street, stands an old metal Quonset hut known as ‘Outpost’ by its creators. Within this historic structure lies a new craft beer bar called Alcove Beer Garden. Chris Batten (owner of Bespoke Coffee) is brother to Billy Batten (who owns the bar in the back), providing insight into why these two businesses have come together beneath one roof. On the west side of the building, right beside the bar, five shipping containers are artfully stacked one on top of another.",
        "One is perched at a slant atop another with an internal wooden staircase leading to what will eventually become an upper patio – above a soon-to-open burger eatery. Ellie Craig from Front Street Brewery and President of Cape Fear Craft Beer Alliance likened this unusual structure to something that could exist only in a child’s imagination! Leslie Smith, the mastermind developer behind the Cargo District, a southwest Ardmore neighborhood with plentiful shipping container-themed apartments and start-ups boasts 85 commercial leases thus far. Establishments such as End of Days Distillery, Queen Street Barber Shop, Coworx, Encore Magazine and various design & technology firms are among them. His brilliant work has become immensely popular in the area!"
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/alcove-wilmington.webp",
        alt: "alcove wilmington",
        width: 800,
        height: 532
      }
    },
    news: {
      title: "Shipping Container Apartments in Wilmington",
      paragraphs: [
        "Introducing 1602 Queen Street: The Cargo District, an innovative urban mixed-use concept in Wilmington developed by L.S. Smith Inc and designed by Rob Romero of Romero Architecture is now pre-leasing the first residential portion of their project with nine stand-alone apartments composed entirely out of eighteen locally sourced shipping containers! Get ready to experience a whole new level of living that mixes modernity with sustainability. The Cargo District’s plans involve a unique blend of retail, office and residential spaces by repurposing recycled intermodal shipping containers. This includes the construction of nine one-bedroom “Live + Work” units comprising two 20-foot containers plus other traditional materials for roughly 600 square feet in living area.",
        "These residences are now available to be rented out at $1,050 per month–including utilities such as water, sewerage disposal services, trash collection and basic internet access! On the ground level, each of the Live + Work units will be equipped with a full-sized kitchen complete with reverse osmosis filtration system, spacious living room setup and paved patio. Moreover, there is also ample off-street parking for one vehicle as well as a small gardening area. As you ascend to the second floor, you are graced by another bedroom outfitted with a full bathroom along with a walk-in closet and private balcony that feature a stackable washer/dryer unit. To top it all off Smith has plans to add 50-70 more 1 or 2 bedrooms apartments through utilization of over 200 containers!"
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/shipping-container-apartments-wilmington-1024x683.webp",
        alt: "shipping container apartments wilmington",
        width: 800,
        height: 533
      }
    },
    deliveredLead: [
      {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/atlanta-8-671b565d04559webpbv.webp",
        alt: "Shipping container delivered in Atlanta",
        width: 365,
        height: 362
      },
      {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/new-orleans-4-671b565f2a44fwebpbv.webp",
        alt: "Shipping container delivered in New Orleans",
        width: 365,
        height: 362
      },
      {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/baltimore-7-671b565ebc2a2webpbv.webp",
        alt: "Shipping container delivered in Baltimore",
        width: 365,
        height: 362
      }
    ],
    seo: {
      title: "Shipping Containers Wilmington NC | Top Quality & Best Pricing",
      description: "Shipping Containers Wilmington NC. Lowest pricing, huge inventory, and fast delivery. Call us now for the best pricing!",
      ogImage: "https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2024/05/14063436/google-reviews.webp"
    }
  },
  {
    slug: "winnipeg-mb",
    depot: "Winnipeg, MB",
    depotId: 49,
    place: {
      city: "Winnipeg",
      region: "MB",
      regionName: "Manitoba",
      label: "Winnipeg, MB"
    },
    nearbyCities: [
      {
        name: "Brandon",
        href: "/storage-units-brandon"
      },
      {
        name: "Winnipeg",
        href: "/winnipeg-cargo-container"
      },
      {
        name: "Portage la Prairie",
        href: "/storage-units-portage-la-prairie"
      },
      {
        name: "Thompson",
        href: "/thompson-storage-unit"
      },
      {
        name: "Selkirk",
        href: "/storage-units-selkirk"
      },
      {
        name: "Steinbach",
        href: "/steinbach-storage"
      },
      {
        name: "Dauphin",
        href: "/dauphin-storage"
      },
      {
        name: "Winkler",
        href: "/storage-units-winkler"
      },
      {
        name: "Morden",
        href: "/morden-storage-units"
      },
      {
        name: "The Pas",
        href: "/the-pas-storage"
      },
      {
        name: "Flin Flon",
        href: "/flin-flon-storage-units"
      },
      {
        name: "Swan River",
        href: "/swan-river-storage-units"
      },
      {
        name: "Stonewall",
        href: "/stonewall-storage-units"
      },
      {
        name: "Altona",
        href: "/storage-units-altona"
      },
      {
        name: "Virden",
        href: "/storage-units-virden"
      },
      {
        name: "East St. Paul",
        href: "/east-st-paul-storage"
      },
      {
        name: "Neepawa",
        href: "/neepawa-storage-units"
      },
      {
        name: "Macdonald",
        href: "/macdonald-storage"
      },
      {
        name: "Pinawa",
        href: "/pinawa-storage"
      }
    ],
    mapImage: {
      src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/winnipeg-67233a30e6c31webpbv_resized_ipadwebpbv.webp",
      alt: "Map of the Winnipeg, MB area",
      width: 590,
      height: 552
    },
    featured: {
      title: "Shipping Container Cabin in Manitoba",
      paragraphs: [
        "This stunning lakefront cabin in Manitoba is like no other; it’s made from shipping containers! Dubbed the “Rare Lakefront Shipping Container Cabin,” this unique abode was designed by renowned architect David Penner and featured in Cottager Magazine. Plus, Asessippi Ski Resort is just a short 10-minute drive away. With its eye-catching bright yellow exterior, you can’t help but be amazed by what this remarkable place has to offer. Take a look for yourself! This spacious one thousand, one hundred square feet cabin is bursting with modern charm.",
        "The bright and open concept layout provides stunning lake views right from the living room which features a cozy EQ3 sectional in front of the wood stove! Plus new stainless appliances are found in both bathrooms. To complete this ultimate relaxation experience, pop open a bottle of wine while you take it all in – what could be better? There’s also two double-over-double bunk beds to really make your stay feel like home away from home. A tranquil oasis awaits you at this beautiful lake! As you stroll down the gentle slope of the yard, take in all its natural beauty. When winter arrives, go ice fishing or snowshoeing on the frozen terrain. In summer months, relax with a canoe ride and enjoy unparalleled views along your journey. All year round, this picturesque spot will be sure to give you peace and tranquility like no other place can offer!"
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/shipping-container-cabin-in-manitoba-1024x683webpbv_resized_ipadwebpbv.webp",
        alt: "Shipping Container Cabin in Manitoba",
        width: 820,
        height: 547
      }
    },
    news: {
      title: "Shipping Container Personal Care Home in Winnipeg",
      paragraphs: [
        "Manitoba has taken a huge step in helping its residents reconnect with their loved ones during the pandemic by collaborating with PCL Constructors Canada Inc. to invest $17.9 million for construction of all-season shelters at personal care homes. Minister Cameron Friesen and Central Services Minister Reg Helwer are providing this opportunity, allowing individuals to safely meet up and make cherished memories together!",
        "A total of 90 visitation shelters will be constructed from recycled, single-use shipping containers to form a fully completed visiting facility. Outfitted with electrical systems and heating/cooling units, these spaces will offer a secure area for visitors even during the harsh climates of winter or summer. Every unit contains an enclosed chamber that can accommodate one resident and up to five visitors simultaneously whereby guests enter through the outside entrance while residents have direct access from within their personal care home via an internal pathway."
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/shipping-container-homes-in-winnipegwebpbv_resized_ipadwebpbv.webp",
        alt: "shipping container homes in winnipeg",
        width: 820,
        height: 615
      }
    },
    deliveredLead: [],
    seo: {
      title: "Shipping Containers for Sale Winnipeg | Buy, Rent, or Rent-to-Own",
      description: "Shipping containers for sale in Winnipeg. Get secure, durable containers at the best prices with fast local delivery. Call us now!",
      ogImage: "https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2024/05/14063436/google-reviews.webp"
    }
  },
  {
    slug: "worcester-boston-ma",
    depot: "Worcester / Boston, MA",
    depotId: 50,
    place: {
      city: "Worcester / Boston",
      region: "MA",
      regionName: "Massachusetts",
      label: "Worcester / Boston, MA"
    },
    nearbyCities: [
      {
        name: "Boston",
        href: "/shipping-containers-for-sale-boston"
      },
      {
        name: "Framingham",
        href: "/storage-units-framingham"
      },
      {
        name: "Medford",
        href: "/shipping-containers-for-sale-medford"
      },
      {
        name: "Waltham",
        href: "/storage-waltham-ma"
      },
      {
        name: "Brockton",
        href: "/storage-units-in-brockton-ma"
      },
      {
        name: "Haverhill",
        href: "/haverhill-storage-containers"
      },
      {
        name: "New Bedford",
        href: "/storage-containers-new-bedford-ma"
      },
      {
        name: "Worcester",
        href: "/cargo-containers-worcester-boston"
      },
      {
        name: "Cambridge",
        href: "/cambridge-shipping-containers"
      },
      {
        name: "Lawrence",
        href: "/storage-containers-iawrence"
      },
      {
        name: "Plymouth",
        href: "/shipping-containers-for-sale-plymouth"
      },
      {
        name: "Chicopee",
        href: "/storage-units-chicopee-ma"
      },
      {
        name: "Lowell",
        href: "/storage-units-in-lowell-ma"
      },
      {
        name: "Quincy",
        href: "/storage-quincy"
      },
      {
        name: "Dorchester",
        href: "/storage-units-dorchester"
      },
      {
        name: "Lynn",
        href: "/storage-units-lynn"
      },
      {
        name: "Somerville",
        href: "/storage-units-somerville-ma"
      },
      {
        name: "Fall River",
        href: "/storage-units-in-fall-river"
      },
      {
        name: "Malden",
        href: "/malden-storage"
      },
      {
        name: "Springfield",
        href: "/shipping-containers-springfield-ma"
      }
    ],
    mapImage: {
      src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/worcester-67231d6ee177dwebpbv_resized_ipadwebpbv.webp",
      alt: "Map of the Worcester / Boston, MA area",
      width: 556,
      height: 557
    },
    featured: {
      title: "Innovative Shipping Container Kiosks in Boston",
      paragraphs: [
        "The Seaport District of Boston is home to an awe-inspiring intersection of art, innovation, and design: the Innovation and Design Building. Located at Summer Street and Congress Street, this multi-colored array of shipping containers is a vibrant backdrop for some of America’s most pioneering tech start-ups that call this building their headquarters. Whether viewed from afar or up close, its bold patterning won’t fail to draw attention—and with so much creativity within its walls, you can expect only the best in what these businesses offer.",
        "As American Field, a local exhibition and market of handcrafted goods, takes off at the Innovation and Design Building, Mei Mei & Roxy’s Grilled Cheese is proud to announce their opening alongside six other new vendors! With five shipping containers ready for action on site already- Jubali (juice/tea), Yankee Lobster Co. (seafood eatery), Triangle Coffee (high-end coffee stand), Niche Urban Garden Supply (boutique plant shop), Drydock Exchange(hardware supplier) & Cut Splice Salon – this place is not one to be missed! As part of the ongoing transformation plan for South Boston’s Innovation and Design Building, a former warehouse adopted by commercial tenants such as architects, engineers, tech companies, research and development firms, craftspeople, and showrooms – shipping container kiosks have been installed."
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/mei-mei-roxys-grilled-cheese-1024x683webpbv_resized_ipadwebpbv.webp",
        alt: "Mei Mei & Roxy’s Grilled Cheese",
        width: 820,
        height: 547
      }
    },
    news: {
      title: "Shipping Container Music Concert in Boston",
      paragraphs: [
        "For 10 days, the Celebrity Series of Boston presented 5,000 unique concerts featuring one musician and performer each in two pop-up locations across the city. Hosted on the Rose Kennedy Greenway in Boston and Harvard’s Science Center campus in Cambridge from 12:00 PM to 6:00 PM daily, these brief yet impactful performances are held within specially modified shipping containers for a truly memorable experience.",
        "An array of talented musicians, comprising genres such as jazz, classical, and world music, come together to create an extraordinary experience with “Concert for One”. A concept conceived by Rayna Yun Chou, who graduated from the New England Conservatory. With their fantastic performance over 120 hours comes a reward – each musician is paid for their talent! This show is born out of sympathy towards fellow musicians who feel isolated from audience members due to unforeseen circumstances, providing them a way to continue being creative during these uncertain times."
      ],
      image: {
        src: "https://bbq-spaces.sfo3.cdn.digitaloceanspaces.com/solana/shipping-container-music-barwebpbv_resized_ipadwebpbv.webp",
        alt: "shipping container music bar",
        width: 820,
        height: 547
      }
    },
    deliveredLead: [],
    seo: {
      title: "Shipping Containers for Sale Boston MA | New & Used Options",
      description: "Find shipping containers for sale in Boston, MA. Rent-to-own deals, low prices & quick delivery near you. Call us now to get the best deals.",
      ogImage: "https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/2024/05/14063436/google-reviews.webp"
    }
  }
]
