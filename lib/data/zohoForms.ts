/**
 * The two Zoho CRM web-to-contact forms the GBP pages carried over from
 * WordPress, now shared: the pricing form ("Get the Best Pricing Now!") is also
 * the homepage's quote form (components/shared/ZohoPricingForm.tsx), and the
 * newsletter form stays on the GBP pages.
 *
 * Not content: the hidden values identify each form to Zoho and the field names
 * are Zoho's API names, so a submission lands in the same CRM fields wherever
 * it is sent from. They are public (in every page's HTML). The GBP pages'
 * visible copy for these forms is in GBP_SHARED_DEFAULTS (lib/data/gbpShared.ts).
 *
 * Its own module so the homepage can import the form without the GBP pages'
 * data along with it.
 */
export const ZOHO_FORMS = {
  quote: {
    anchor: 'request_quote',
    action: 'https://crm.zoho.com/crm/WebToContactForm',
    hidden: {
      xnQsjsdp: 'ba855d1d474179ecfe2c84a0deca923fe375978a51af4252d4276a7ceab13b7a',
      xmIwtLD: '9805cfa7fb65bef5be2e5079ef5722d2473f265ad63883da9080fdea3023c9a18251f415be3b42febd6b648cdc6e86d4',
      actionType: 'Q29udGFjdHM=',
      returnURL: 'null',
      zc_gad: '',
      /** Honeypot: must stay empty. */
      aG9uZXlwb3Q: '',
    },
    fields: [
      { name: 'First Name', label: 'First Name', required: true, maxLength: 40 },
      { name: 'Last Name', label: 'Last Name', required: true, maxLength: 80 },
      { name: 'Phone', label: 'Phone', required: true, maxLength: 50 },
      { name: 'Email', label: 'Email', required: true, maxLength: 100, type: 'email' },
      { name: 'CONTACTCF7', label: 'Shipping Zip', required: true, maxLength: 255 },
      {
        name: 'CONTACTCF23',
        label: 'Container Size',
        required: true,
        options: [
          '20ft Container',
          '40ft Container',
          '40ft High Cube Container',
          '45ft Container',
          '20ft Refrigerated Container',
          '40ft Refrigerated Container',
          'Other Size or Type',
        ],
      },
      { name: 'CONTACTCF30', label: 'Comments', required: false, maxLength: 255 },
    ],
    /**
     * Zoho's image captcha: the image comes from here, the answer goes in
     * `enterdigest`. Reload appends `&d<timestamp>`, as Zoho's own script does.
     * Loaded straight from Zoho (never through an image proxy): the answer is
     * checked against the image the visitor's browser was served.
     */
    captcha: {
      imageUrl:
        'https://crm.zoho.com/crm/CaptchaServlet?formId=9805cfa7fb65bef5be2e5079ef5722d2473f265ad63883da9080fdea3023c9a18251f415be3b42febd6b648cdc6e86d4&grpid=ba855d1d474179ecfe2c84a0deca923fe375978a51af4252d4276a7ceab13b7a',
      field: 'enterdigest',
    },
  },
  newsletter: {
    action: 'https://crm.zoho.com/crm/WebToContactForm',
    hidden: {
      xnQsjsdp: '85905851531a3da2ed4dc5227fc2ef5a9dfd7c9c3bac16738c267e18094e46d2',
      xmIwtLD: 'f5391198eccf7e3cb0651c1aec64fdb099998dec93534d6ea887853ceb392978b24da7b9583368657f02a1554a3699ce',
      actionType: 'Q29udGFjdHM=',
      returnURL: 'https://onsitestorage.com/thank-you-newsletter',
      zc_gad: '',
    },
    /** "Full Name" is sent as Zoho's Last Name. */
    fields: [
      { name: 'Last Name', label: 'Full Name', required: true, maxLength: 80 },
      { name: 'Email', label: 'Email', required: true, maxLength: 100, type: 'email' },
    ],
    /** Google reCAPTCHA v2 (not Zoho's image captcha). */
    recaptchaSiteKey: '6Lda2_chAAAAAHcDQfLME3EAFPRxWLvaWFl62TaG',
  },
} as const

/** The pricing form, wherever it is shown. */
export const ZOHO_PRICING_FORM = ZOHO_FORMS.quote
