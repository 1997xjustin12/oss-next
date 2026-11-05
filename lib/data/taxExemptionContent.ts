/**
 * Copy and form wiring for /sales-tax-exemption-request, carried over from the
 * WordPress page it replaced. Edit the copy here; the components only lay it out.
 */

export const TAX_EXEMPTION_HERO = {
  eyebrow: 'For Eligible Individuals & Organizations',
  heading: { accent: 'Sales Tax Exemption', rest: 'Form' },
  intro: 'Looking to make tax-exempt purchases on our website? We’ve got you covered! Our sales tax exemption form is here to help eligible individuals and organizations save money.',
  cta: 'Start Your Request',
  image: '/images/home-banners/hero-image.webp',
} as const

export const TAX_EXEMPTION_STEPS = [
  { title: 'Fill in your details', body: 'Tell us who you are and which state you are requesting the exemption for.' },
  { title: 'Upload your certificate', body: 'Add a copy of your tax exemption certificate, which varies depending on the state of delivery or pick up.' },
  { title: 'We review your request', body: 'Our team carefully assesses each application and notifies you promptly if you’re approved.' },
] as const

export const TAX_EXEMPTION_SELLER = {
  heading: 'Seller Information',
  note: 'Use these details on your exemption certificate.',
  name: 'On-Site Storage Solutions, Inc.',
  address: ['21050 Union Street, Suite 4', 'Wildomar, CA 92595'],
} as const

export const TAX_EXEMPTION_CLOSING = 'We look forward to reviewing your application and helping you save money on your next purchase.'

/**
 * The form itself, which posts straight from the browser to Zoho CRM, as it did
 * on WordPress. The certificates never pass through this app.
 *
 * Not content: the hidden values identify the form to Zoho and the field names
 * are Zoho's API names, so a submission lands in the same CRM fields as before.
 * They are public (in the page's HTML). Its own module rather than
 * lib/data/zohoForms.ts, which the homepage's form bundle imports.
 *
 * The first two look swapped and are not: Zoho requires its "Last Name" field, so
 * WordPress's form collects the required first name in it, and the optional last
 * name in Zoho's "First Name".
 */
export const TAX_EXEMPTION_FORM = {
  id: 'tax-exemption-form',
  action: 'https://crm.zoho.com/crm/WebToContactForm',
  hidden: {
    xnQsjsdp: 'd3037f4435390bfb35aa1d7f705ca794464ebf79d3b5a6fe8ee0d95eafa1b06c',
    xmIwtLD: '2aadffe0b3639daae20e5c883d7659c22573389a0603e561deae36b1e4a3a614',
    actionType: 'Q29udGFjdHM=',
    returnURL: 'https://onsitestorage.com/sales-tax-exemption-request-thank-you',
    zc_gad: '',
  },
  fileField: 'theFile',
  notesField: { name: 'Description', label: 'Notes' },
} as const

type FieldKind = 'text' | 'email' | 'tel' | 'date' | 'state'

export type TaxExemptionField = {
  /** Zoho's API name. */
  name: string
  label: string
  required?: boolean
  maxLength?: number
  kind?: FieldKind
  autoComplete?: string
  hint?: string
  /** Takes the row's full width from `sm` up, instead of half of it. */
  wide?: boolean
}

export const TAX_EXEMPTION_CONTACT_FIELDS: readonly TaxExemptionField[] = [
  { name: 'Last Name', label: 'First Name', required: true, maxLength: 80, autoComplete: 'given-name' },
  { name: 'First Name', label: 'Last Name', maxLength: 40, autoComplete: 'family-name' },
  { name: 'CONTACTCF33', label: 'Company Name', required: true, maxLength: 30, autoComplete: 'organization', wide: true },
  { name: 'Phone', label: 'Phone', required: true, maxLength: 50, kind: 'tel', autoComplete: 'tel' },
  {
    name: 'Email',
    label: 'Email',
    required: true,
    maxLength: 100,
    kind: 'email',
    autoComplete: 'email',
    hint: 'If approved, only this email can make tax-exempt purchases on our webshop.',
  },
  { name: 'CONTACTCF7', label: 'Address', required: true, maxLength: 255, autoComplete: 'street-address', wide: true },
  { name: 'CONTACTCF4', label: 'Zip Code', maxLength: 255, autoComplete: 'postal-code' },
]

export const TAX_EXEMPTION_CERTIFICATE_FIELDS: readonly TaxExemptionField[] = [
  { name: 'CONTACTCF2', label: 'Request State To Be Exempt', kind: 'state' },
  { name: 'CONTACTCF32', label: 'Certificate Business Type', maxLength: 255 },
  { name: 'CONTACTCF5', label: 'Certificate Effective Date', kind: 'date' },
  { name: 'CONTACTCF1', label: 'Certificate Expiration Date', kind: 'date' },
  { name: 'CONTACTCF34', label: 'Certificate Exemption Number', maxLength: 255, wide: true },
]

/** Sent as the full name. Canada too, since the store delivers there. */
export const TAX_EXEMPTION_REGIONS = [
  {
    label: 'United States',
    options: [
      'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'District of Columbia',
      'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine',
      'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
      'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
      'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia',
      'Washington', 'West Virginia', 'Wisconsin', 'Wyoming',
    ],
  },
  {
    label: 'Canada',
    options: [
      'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador', 'Northwest Territories',
      'Nova Scotia', 'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan', 'Yukon',
    ],
  },
] as const
