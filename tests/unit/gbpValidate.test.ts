// The GBP records' validation (lib/gbpValidate.ts): what the admin can store,
// and what a bad record falls back to.
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { conformGbpPage, conformGbpShared, conformGbpTemplate, decodeEntities, hex, mapsEmbedUrl, optionalYoutubeId, phoneE164, youtubeId } from '@/lib/gbpValidate'
import { GBP_PAGES } from '@/lib/data/gbpPages'
import { GBP_SHARED_DEFAULTS } from '@/lib/data/gbpShared'
import { GBP_TEMPLATE_DEFAULT } from '@/lib/data/gbpTemplate'

const seed = GBP_PAGES[0]

describe('the code seed passes its own validation', () => {
  it('every location page round-trips unchanged', () => {
    for (const page of GBP_PAGES) assert.deepEqual(conformGbpPage(structuredClone(page), page), page, page.slug)
  })
  it('the shared content and the template round-trip unchanged', () => {
    assert.deepEqual(conformGbpShared(structuredClone(GBP_SHARED_DEFAULTS), GBP_SHARED_DEFAULTS), GBP_SHARED_DEFAULTS)
    assert.deepEqual(conformGbpTemplate(structuredClone(GBP_TEMPLATE_DEFAULT), GBP_TEMPLATE_DEFAULT), GBP_TEMPLATE_DEFAULT)
  })
})

describe('conformGbpPage', () => {
  it('renders the seed when Redis has nothing, or garbage', () => {
    assert.deepEqual(conformGbpPage(undefined, seed), seed)
    assert.deepEqual(conformGbpPage('nope', seed), seed)
  })

  it('takes a valid field and falls back per field on an invalid one', () => {
    const page = conformGbpPage({ about: ['New copy'], mapEmbedUrl: 'https://evil.example/frame', contact: { phone: '' } }, seed)
    assert.deepEqual(page.about, ['New copy'])
    assert.equal(page.mapEmbedUrl, seed.mapEmbedUrl, 'only a Google Maps embed is accepted')
    assert.deepEqual(page.contact, seed.contact, 'an incomplete contact block keeps the seed')
  })

  it('drops a bad item from a list instead of the list', () => {
    const page = conformGbpPage({ faqs: [{ question: 'Q?', answer: 'A.' }, { question: '' }] }, seed)
    assert.deepEqual(page.faqs, [{ question: 'Q?', answer: 'A.' }])
  })

  it('keeps manual and blog-list cards side by side, and drops a post card with no slug', () => {
    const manual = { title: 'A post', excerpt: 'About it.', url: null, image: '/images/a.webp', imageAlt: 'A' }
    const page = conformGbpPage({ blogCards: [{ post: 'what-not-to-store' }, manual, { post: '' }, { post: '../admin' }] }, seed)
    assert.deepEqual(page.blogCards, [{ post: 'what-not-to-store' }, manual])
  })

  it('never lets a record change the slug', () => {
    assert.equal(conformGbpPage({ slug: 'somewhere-else' }, seed).slug, seed.slug)
  })
})

describe('conformGbpTemplate', () => {
  it('keeps one of each built-in section and unique ids', () => {
    const t = conformGbpTemplate(
      {
        sections: [
          { id: 'hero', type: 'hero', enabled: true },
          { id: 'hero-2', type: 'hero', enabled: true },
          { id: 'x', type: 'spacer', enabled: true, props: { size: 'md' } },
          { id: 'x', type: 'spacer', enabled: true, props: { size: 'lg' } },
        ],
      },
      GBP_TEMPLATE_DEFAULT,
    )
    assert.deepEqual(t.sections.map((s) => s.id), ['hero', 'x'])
  })

  it('drops a library section without valid content, and unknown types', () => {
    const t = conformGbpTemplate(
      { sections: [{ id: 'a', type: 'video', enabled: true, props: { heading: '', youtubeId: 'bad' } }, { id: 'b', type: 'carousel', enabled: true }] },
      GBP_TEMPLATE_DEFAULT,
    )
    assert.deepEqual(t.sections, [])
  })

  it('keeps only valid style values', () => {
    const t = conformGbpTemplate(
      { sections: [{ id: 'faq', type: 'faq', enabled: false, style: { background: '#ff0000', accent: 'red; position:fixed', paddingY: 'huge' } }] },
      GBP_TEMPLATE_DEFAULT,
    )
    assert.deepEqual(t.sections, [{ id: 'faq', type: 'faq', enabled: false, style: { background: '#FF0000' } }])
  })
})

describe('formatted values', () => {
  it('hex colours', () => {
    assert.equal(hex('#c60c29'), '#C60C29')
    assert.equal(hex('red'), undefined)
    assert.equal(hex('#fff'), undefined)
  })
  it('phone numbers to E.164', () => {
    assert.equal(phoneE164('(619) 839-0222'), '+16198390222')
    assert.equal(phoneE164('1-619-839-0222'), '+16198390222')
    assert.equal(phoneE164('839-0222'), undefined)
  })
  it('YouTube ids, also out of a pasted link', () => {
    assert.equal(youtubeId('M8Xidc3_vKY'), 'M8Xidc3_vKY')
    assert.equal(youtubeId('https://youtu.be/M8Xidc3_vKY?si=x'), 'M8Xidc3_vKY')
    assert.equal(youtubeId('https://www.youtube.com/watch?v=M8Xidc3_vKY'), 'M8Xidc3_vKY')
    assert.equal(youtubeId('nope'), undefined)
  })
  it("a page's FAQ video can be none: '' is kept, not replaced by the seed's", () => {
    assert.equal(optionalYoutubeId(''), '')
    assert.equal(optionalYoutubeId('  '), '')
    assert.equal(optionalYoutubeId('https://youtu.be/M8Xidc3_vKY'), 'M8Xidc3_vKY')
    assert.equal(optionalYoutubeId('nope'), undefined)
    assert.equal(conformGbpPage({ youtubeId: '' }, { ...seed, youtubeId: 'M8Xidc3_vKY' }).youtubeId, '')
  })
  it('map embeds only from Google Maps', () => {
    assert.ok(mapsEmbedUrl('https://www.google.com/maps/embed?pb=!1m18'))
    assert.equal(mapsEmbedUrl('https://www.google.com/search?q=x'), undefined)
  })
})

describe('decodeEntities', () => {
  it('decodes the entities WordPress copy carried, and leaves other text alone', () => {
    assert.equal(decodeEntities('20&#8242; x 8&#x2032; &amp; more&#8230;'), '20′ x 8′ & more…')
    assert.equal(decodeEntities('R&D, &unknown; stays'), 'R&D, &unknown; stays')
  })

  it('applies to a page’s FAQs as read from Redis', () => {
    const page = conformGbpPage({ faqs: [{ question: 'Size?', answer: '20&#8242; long' }] }, seed)
    assert.equal(page.faqs[0].answer, '20′ long')
  })
})
