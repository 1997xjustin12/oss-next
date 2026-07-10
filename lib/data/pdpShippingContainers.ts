import type { ProductHit } from '@/types/product'
import { type ContainerVariantKey, resolveContainerVariant } from '@/lib/containerVariant'

export type SpecItem = { label: string; value: string }
export type FaqItem  = { question: string; answer: string }

export type PdpShippingContainerEntry = {
  quickSpecs: { cuFt: string; sqFt: string; lbsTare: string }
  specs:      SpecItem[]
  faq:        FaqItem[]
}

// Neither WordPress nor the new backend carries this data yet.
// `specs` reflects real spec-sheet copy provided directly for this catalog.
// `quickSpecs.cuFt` is still a generic published reference figure (no cu ft
// value has been provided yet) — flag for follow-up if that matters.
// `faq` per variant is real size-specific copy provided directly for this catalog.
const faq20S: FaqItem[] = [
  { question: 'How much does a 20 foot shipping container weigh?', answer: 'A standard empty (tare) 20 foot shipping container weighs approximately 2,300 kg (5,070 lbs). Its maximum gross weight, which is the total weight of the container and its contents, is around 24,000 kg (52,910 lbs). Therefore, it can carry up to approximately 21,700 kg (47,840 lbs) of cargo.' },
  { question: 'How much does a 20 foot shipping container cost?', answer: 'The cost of a 20 foot shipping container typically ranges from $1,300 to $5,000, depending on factors such as condition, type, and location. Used standard containers usually cost between $1,300 and $3,000, while new standard containers generally range from $3,500 to $5,000.' },
  { question: 'How much capacity is in a 20 ft container?', answer: 'A 20 ft container has a cubic capacity of 33 cubic meters. It can typically hold up to 11 EUR pallets, each measuring 120 by 80 centimeters. The 20-foot shipping container is the most widely used type around the world.' },
  { question: 'How large is a 20-foot shipping container?', answer: 'A standard 20-foot container has external dimensions of 20 feet in length, 8 feet in width, and 8.6 feet in height (equivalent to 6.06 meters long, 2.44 meters wide, and 2.59 meters high).' },
  { question: 'How many pallets are in a 20ft container?', answer: 'A 20ft container can accommodate around 10 standard pallets or 11 Euro pallets in a single layer. However, the exact number of pallets may vary based on the specific pallet dimensions and the way they are arranged inside the container.' },
]

const faq40S: FaqItem[] = [
  { question: 'How much does a 40 ft shipping container cost?', answer: 'Used 40 ft shipping containers can start at around $1,850, but prices can rise to $3,500 in markets with limited supply. One-trip 40-foot containers, which are nearly new, typically cost between $4,500 and $7,000, depending on availability.' },
  { question: 'How much capacity is in a 40 ft container?', answer: 'The payload capacity refers to the maximum load a container can carry, which is 28,800 kilograms for a 40-foot container. This is only slightly higher than the 25,000-kilogram payload capacity of a 20-foot container. Additionally, a 40-foot dry container offers a volume of up to 67 cubic meters.' },
  { question: 'How much does a 40 foot shipping container weigh?', answer: 'An empty 40 foot shipping container weighs about 8,265 lbs (3,750 kg). It can carry a maximum cargo weight of 58,935 lbs (26,730 kg), with a total weight limit including both the container and its cargo of approximately 67,200 lbs (30,480 kg).' },
  { question: 'How many square feet in a 40 foot shipping container?', answer: 'A standard 40-foot container measures 40 feet long, 8 feet wide, and 8.5 feet high on the outside. This results in an exterior floor area of 320 square feet.' },
  { question: 'What are the dimensions of a 40 foot shipping container?', answer: 'A standard 40-foot shipping container measures 40 feet (12.2 meters) in length, 8 feet (2.44 meters) in width, and 8.5 feet (2.59 meters) in height on the outside. Its interior dimensions are slightly smaller, with a length of 39.5 feet (12.03 meters), a width of 7.7 feet (2.35 meters), and a height of 7.9 feet (2.39 meters).' },
]

const faq40H: FaqItem[] = [
  { question: 'What is the difference between 40ft container and 40ft high cube?', answer: 'A 40ft High Cube (HC) container is taller than a standard 40ft container, providing additional interior space and volume. However, this usually comes with a higher cost and increased weight. While standard 40-foot containers are 8 feet 6 inches (2.59 meters) tall, High Cube containers measure 9 feet 6 inches (2.89 meters) in height.' },
  { question: 'How much is a 40ft high cube container?', answer: 'Used 40ft High Cube shipping containers typically start at around $2,000, but prices can reach up to $3,500 in areas with limited supply. One-trip 40-foot High Cube containers, which are nearly new, generally range in price from $4,750 to $7,000, depending on availability.' },
  { question: 'How much can a 40 ft HQ container hold?', answer: 'Depending on the type of cargo and how it is packed, a 40ft HQ container can typically hold 25 to 27 Euro pallets or 20 to 22 standard pallets. It can carry up to 60,000 pounds (27,000 kilograms), though this is subject to local transport regulations. The extra vertical space also makes it ideal for bulky or irregularly shaped items.' },
  { question: 'How many cbm are in a 40ft high cube container?', answer: 'A 40-foot High Cube (HC) container can hold approximately 76 cubic meters (m³) of cargo. It has a payload capacity of up to 28,560 kilograms (62,974.8 pounds).' },
  { question: 'What are the dimensions of a 40ft high cube container?', answer: 'A 40ft High Cube container has external dimensions of 40 feet in length, 8 feet in width, and 9 feet 6 inches in height. Internally, it measures approximately 39 feet 5.6 inches in length, 7 feet 8.5 inches in width, and 8 feet 10 inches in height.' },
]

// 40S and 40H share every dimension except external/internal height —
// built from one function so the shared rows aren't duplicated verbatim
// between the two variant entries below.
function build40FtSpecs(externalHeight: string, internalHeight: string): SpecItem[] {
  return [
    { label: 'External Length', value: '40 ft' },
    { label: 'External Width', value: '8 ft' },
    { label: 'External Height', value: externalHeight },
    { label: 'Internal Length', value: '39 ft 5 in' },
    { label: 'Internal Width', value: '7 ft 8 in' },
    { label: 'Internal Height', value: internalHeight },
    { label: 'Floor Space', value: 'Approx. 306 sq ft' },
    { label: 'Door Width', value: '7 ft 8 in' },
    { label: 'Door Height', value: '7 ft 5 in' },
    { label: 'Wall Material', value: 'Corrugated steel panels' },
    { label: 'Roof Material', value: 'Corrugated steel panel' },
    { label: 'Tare Weight', value: 'Approx. 8,000–8,400 lbs (varies by manufacturer)' },
    { label: 'Max Gross Weight', value: '52,831 lbs (23,956 kg)' },
    { label: 'Max Payload', value: '47,899 lbs (21,717 kg)' },
    { label: 'Forklift Pockets', value: 'Yes (standard configuration)' },
    { label: 'Cargo Doors', value: 'Double swing doors, lockable' },
    { label: 'Corner Castings', value: 'Cast steel corner posts for secure stacking' },
    { label: 'Cargo Securing', value: 'Internal tie-down points' },
    { label: 'Exterior Finish', value: 'Original shipping line paint & markings (custom paint available)' },
  ]
}

export const PDP_SHIPPING_CONTAINERS: Record<ContainerVariantKey, PdpShippingContainerEntry> = {
  '20S': {
    quickSpecs: { cuFt: '1,170', sqFt: '160', lbsTare: '4,914' },
    specs: [
      { label: 'External Length', value: '20 ft' },
      { label: 'External Width', value: '8 ft' },
      { label: 'External Height', value: '8 ft 6 in (18 inches shorter than a basketball rim)' },
      { label: 'Internal Length', value: '19 ft 11 in' },
      { label: 'Internal Width', value: '7 ft 9 in' },
      { label: 'Internal Height', value: '7 ft 10 in (8 inches shorter than external height)' },
      { label: 'Door Width', value: '7 ft 8 in' },
      { label: 'Door Height', value: '7 ft 5 in' },
      { label: 'Tare Weight', value: '4,914 lbs (varies by manufacturer and specs)' },
      { label: 'Best Use', value: 'Fits a queen-sized mattress flat or large refrigerator upright' },
      { label: 'Space', value: 'Occupies space of a large single parking spot' },
    ],
    faq: faq20S,
  },
  '40S': {
    quickSpecs: { cuFt: '2,390', sqFt: '306', lbsTare: '8,000–8,400' },
    specs: build40FtSpecs('8 ft 6 in', '7 ft 10 in'),
    faq: faq40S,
  },
  '40H': {
    quickSpecs: { cuFt: '2,700', sqFt: '306', lbsTare: '8,000–8,400' },
    specs: build40FtSpecs('9 ft 6 in', '8 ft 10 in'),
    faq: faq40H,
  },
}

export function getQuickSpecs(product: ProductHit) {
  return PDP_SHIPPING_CONTAINERS[resolveContainerVariant(product)].quickSpecs
}
