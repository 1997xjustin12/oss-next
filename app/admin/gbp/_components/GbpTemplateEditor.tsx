'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ChevronRight, GripVertical, Plus, Trash2 } from 'lucide-react'
import { discardGbpRecordAction, publishGbpRecordAction, saveGbpTemplateDraftAction } from '@/actions/gbp'
import { EditorShell } from '@/components/admin/EditorShell'
import { DrawerPanel, Switch, same } from '@/components/admin/SectionDrawers'
import { GBP_TEMPLATE_DEFAULT } from '@/lib/data/gbpTemplate'
import { INPUT, ValueEditor, type FieldHints } from '@/components/admin/ValueEditor'
import type { GbpLibraryProps, GbpLibrarySectionType, GbpSectionInstance, GbpSectionStyle, GbpSectionType, GbpTemplate } from '@/types/gbp'

const LABELS: Record<GbpSectionType, string> = {
  hero: 'Hero',
  trustedBy: 'Trusted By (logos)',
  products: 'Products (Rent / Buy / RTO)',
  reviews: 'Reviews',
  types: 'Container types',
  resources: 'Blog cards',
  whyChoose: 'Why Choose Us',
  about: 'About Us',
  quote: 'Map + quote form',
  newsletter: 'Newsletter',
  faq: 'FAQ + video',
  textImage: 'Text + image',
  ctaBand: 'Call-to-action band',
  video: 'Video',
  spacer: 'Spacer',
}

const CORE: GbpSectionType[] = ['hero', 'trustedBy', 'products', 'reviews', 'types', 'resources', 'whyChoose', 'about', 'quote', 'newsletter', 'faq']
const LIBRARY: GbpLibrarySectionType[] = ['textImage', 'ctaBand', 'video', 'spacer']

const LIBRARY_DEFAULTS: { [K in GbpLibrarySectionType]: GbpLibraryProps[K] } = {
  textImage: { heading: '', body: '', image: null, imageSide: 'right', showCall: true },
  ctaBand: { heading: 'Call Our {city} Team Today', body: '' },
  video: { heading: '', youtubeId: '' },
  spacer: { size: 'md' },
}

const PLACEHOLDER_HELP = '{city}, {state} and {phone} are filled in per page. Mark red text with [[ ]].'

const LIBRARY_HINTS: FieldHints = {
  heading: { help: PLACEHOLDER_HELP },
  body: { multiline: true, help: 'Separate paragraphs with a blank line.' },
  image: { nullable: true, newItem: { src: '', alt: '', width: 1024, height: 576 } },
  imageSide: { kind: 'select', options: [{ value: 'right', label: 'Image on the right' }, { value: 'left', label: 'Image on the left' }] },
  showCall: { label: 'Show the call button' },
  youtubeId: { label: 'YouTube video', help: 'The id, or paste the link.' },
  size: { kind: 'select', options: [{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }] },
}

const STYLE_FIELDS: { key: keyof GbpSectionStyle; label: string }[] = [
  { key: 'background', label: 'Background' },
  { key: 'backgroundDark', label: 'Background (dark mode)' },
  { key: 'heading', label: 'Heading colour' },
  { key: 'headingDark', label: 'Heading colour (dark mode)' },
  { key: 'accent', label: 'Accent (red text) colour' },
]

const SETTINGS_HINTS: FieldHints = {
  theme: { label: 'Theme (every section)' },
  'theme.brand': { label: 'Brand colour', kind: 'color', help: 'Buttons, red bands, blog titles, footer.' },
  'theme.accent': { label: 'Accent colour', kind: 'color', help: 'The [[red]] runs in headings.' },
  'theme.font': { kind: 'select', options: [{ value: 'poppins', label: 'Poppins (as WordPress)' }, { value: 'roboto', label: 'Roboto (the storefront’s)' }] },
  header: { label: 'Header' },
  'header.showCallButton': { label: 'Show the call button (desktop)' },
  'header.background': { kind: 'color' },
  'header.backgroundDark': { label: 'Background (dark mode)', kind: 'color' },
  footer: { label: 'Footer' },
  'footer.showEmail': { label: 'Show the email' },
  'footer.showAddress': { label: 'Show the address' },
  'footer.showHours': { label: 'Show the store hours' },
}

function SectionRow({
  section,
  changed,
  onChange,
  onOpen,
  onRemove,
}: {
  section: GbpSectionInstance
  /** The draft changes it (or it is new): publish to put it live. */
  changed: boolean
  onChange: (next: GbpSectionInstance) => void
  onOpen: () => void
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id })
  const isLibrary = (LIBRARY as string[]).includes(section.type)
  const style = section.style ?? {}

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`rounded-md border border-theme-border bg-theme-bg dark:border-neutral-800 dark:bg-neutral-900 ${isDragging ? 'relative z-10 shadow-lg' : ''} ${section.enabled ? '' : 'opacity-60'}`}
    >
      <div className="flex items-center gap-2 p-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`Drag to reorder: ${LABELS[section.type]}. With the keyboard, press space, then the arrow keys.`}
          className="cursor-grab rounded p-1.5 text-theme-muted hover:bg-theme-subtle active:cursor-grabbing dark:hover:bg-neutral-800"
        >
          <GripVertical className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={onOpen}
          data-drawer-row={section.id}
          className="flex min-h-10 min-w-0 flex-1 items-center gap-2 rounded px-1 text-left text-sm font-semibold hover:bg-theme-subtle focus-visible:outline-2 focus-visible:outline-theme-primary dark:hover:bg-neutral-800"
        >
          <span className="min-w-0 truncate">{LABELS[section.type]}</span>
          {isLibrary && <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[11px] font-bold text-sky-800 dark:bg-sky-500/15 dark:text-sky-300">Library</span>}
          {Object.values(style).some(Boolean) && <span className="text-[11px] font-normal text-theme-muted">styled</span>}
          {changed && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-bold text-amber-900 dark:bg-amber-500/15 dark:text-amber-300">Changed</span>}
          <span className="ml-auto inline-flex items-center gap-0.5 text-xs font-semibold text-theme-muted">
            {isLibrary ? 'Content & style' : 'Style'}
            <ChevronRight aria-hidden className="h-4 w-4" />
          </span>
        </button>
        <Switch checked={section.enabled} onChange={(on) => onChange({ ...section, enabled: on })} label={`Show ${LABELS[section.type]}`} />
        <button type="button" onClick={onRemove} aria-label={`Remove ${LABELS[section.type]}`} className="rounded p-1.5 text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

    </li>
  )
}

/** A section's drawer: a library section's content, and every section's style. */
function SectionContent({ section, onChange }: { section: GbpSectionInstance; onChange: (next: GbpSectionInstance) => void }) {
  const isLibrary = (LIBRARY as string[]).includes(section.type)
  const style = section.style ?? {}
  return (
    <div className="space-y-4">
      {isLibrary && section.props && (
        <ValueEditor value={section.props} onChange={(props) => onChange({ ...section, props: props as GbpSectionInstance['props'] })} hints={LIBRARY_HINTS} />
      )}
      <div>
        <p className="text-xs font-bold text-theme-muted uppercase dark:text-neutral-500">Style (empty = the section’s default)</p>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          {STYLE_FIELDS.map(({ key, label }) => (
            <label key={key} className="block text-sm">
              <span className="font-semibold">{label}</span>
              <span className="mt-1 flex items-center gap-2">
                <input
                  type="color"
                  value={style[key] && /^#[0-9a-f]{6}$/i.test(style[key] as string) ? (style[key] as string) : '#ffffff'}
                  onChange={(e) => onChange({ ...section, style: { ...style, [key]: e.target.value.toUpperCase() } })}
                  className="h-9 w-12 cursor-pointer rounded border border-theme-border dark:border-neutral-700"
                  aria-label={`${label} colour picker`}
                />
                <input
                  value={(style[key] as string | undefined) ?? ''}
                  placeholder="default"
                  onChange={(e) => onChange({ ...section, style: { ...style, [key]: e.target.value || undefined } })}
                  className={`${INPUT} font-mono`}
                />
              </span>
            </label>
          ))}
          <label className="block text-sm">
            <span className="font-semibold">Vertical padding</span>
            <select
              value={style.paddingY ?? ''}
              onChange={(e) => onChange({ ...section, style: { ...style, paddingY: (e.target.value || undefined) as GbpSectionStyle['paddingY'] } })}
              className={`mt-1 ${INPUT}`}
            >
              <option value="">Default</option>
              <option value="none">None</option>
              <option value="sm">Small</option>
              <option value="md">Medium</option>
              <option value="lg">Large</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  )
}

function Sections({
  sections,
  published,
  onChange,
  onOpen,
}: {
  sections: GbpSectionInstance[]
  /** The live sections: a row differing from its live copy (by id) is marked. */
  published: readonly GbpSectionInstance[]
  onChange: (next: GbpSectionInstance[]) => void
  onOpen: (id: string) => void
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))
  const [adding, setAdding] = useState<GbpSectionType | ''>('')
  // A stable id: dnd-kit otherwise numbers its accessibility ids per render, and
  // the server's and the browser's numbers differ (a hydration mismatch).
  const dndId = useId()
  const present = new Set(sections.map((s) => s.type))
  const addable = [...CORE.filter((t) => !present.has(t)), ...LIBRARY]

  function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return
    const from = sections.findIndex((s) => s.id === active.id)
    const to = sections.findIndex((s) => s.id === over.id)
    onChange(arrayMove(sections, from, to))
  }

  function add(type: GbpSectionType) {
    const isLibrary = (LIBRARY as string[]).includes(type)
    const section: GbpSectionInstance = isLibrary
      ? { id: `${type}-${crypto.randomUUID().slice(0, 8)}`, type, enabled: true, props: structuredClone(LIBRARY_DEFAULTS[type as GbpLibrarySectionType]) }
      : { id: type, type, enabled: true }
    onChange([...sections, section])
    setAdding('')
  }

  return (
    <section className="rounded-lg border border-theme-border bg-theme-bg p-4 sm:p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <h2 className="text-sm font-extrabold tracking-tight">
        Sections
        {!same(sections.map((s) => s.id), published.map((s) => s.id)) && <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-bold text-amber-900 dark:bg-amber-500/15 dark:text-amber-300">Order changed</span>}
      </h2>
      <p className="mt-1 text-xs text-theme-muted dark:text-neutral-500">
        Drag to reorder (or focus the handle, press space, then the arrow keys). Header and footer stay at the top and bottom.
      </p>
      <DndContext id={dndId} sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <ol className="mt-3 space-y-2">
            {sections.map((section, i) => (
              <SectionRow
                key={section.id}
                section={section}
                changed={!same(section, published.find((p) => p.id === section.id))}
                onOpen={() => onOpen(section.id)}
                onChange={(next) => onChange(sections.map((s, j) => (j === i ? next : s)))}
                onRemove={() => {
                  if (window.confirm(`Remove "${LABELS[section.type]}" from the template?${(LIBRARY as string[]).includes(section.type) ? ' Its content is lost.' : ' You can add it back.'}`)) {
                    onChange(sections.filter((_, j) => j !== i))
                  }
                }}
              />
            ))}
          </ol>
        </SortableContext>
      </DndContext>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <select value={adding} onChange={(e) => setAdding(e.target.value as GbpSectionType | '')} className={`${INPUT} max-w-xs`} aria-label="Section to add">
          <option value="">Add a section…</option>
          {addable.map((type) => (
            <option key={type} value={type}>
              {LABELS[type]}
              {(LIBRARY as string[]).includes(type) ? ' (library)' : ' (built-in)'}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={!adding}
          onClick={() => adding && add(adding)}
          className="inline-flex items-center gap-1.5 rounded-md border border-theme-border px-3 py-2 text-sm font-semibold disabled:opacity-50 dark:border-neutral-700"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>
    </section>
  )
}

type Props = {
  initialValue: GbpTemplate
  /** What the pages show now: the lists mark what the draft changes. */
  published: GbpTemplate
  hasDraft: boolean
  status: { draft?: string; published?: string }
  previewHref: string
  locations: readonly { slug: string; label: string }[]
}

type SettingsKey = 'theme' | 'header' | 'footer'
const SETTINGS: { key: SettingsKey; label: string }[] = [
  { key: 'theme', label: 'Theme (colours and font)' },
  { key: 'header', label: 'Header' },
  { key: 'footer', label: 'Footer' },
]

/** The section list and the page settings, or one of them in its drawer. */
function TemplateBody({ value, setValue, published }: { value: GbpTemplate; setValue: (value: GbpTemplate) => void; published: GbpTemplate }) {
  const [openId, setOpenId] = useState<string | null>(null)
  // Closing a drawer puts focus back on the row that opened it.
  const lastOpened = useRef<string | null>(null)
  useEffect(() => {
    if (openId) lastOpened.current = openId
    else if (lastOpened.current) document.querySelector<HTMLElement>(`[data-drawer-row="${window.CSS.escape(lastOpened.current)}"]`)?.focus()
  }, [openId])
  const openSection = value.sections.find((s) => s.id === openId)
  const openSetting = SETTINGS.find((s) => s.key === openId)

  if (openSection) {
    const update = (next: GbpSectionInstance) => setValue({ ...value, sections: value.sections.map((s) => (s.id === next.id ? next : s)) })
    return (
      <DrawerPanel
        title={LABELS[openSection.type]}
        onBack={() => setOpenId(null)}
        shown={{ checked: openSection.enabled, onChange: (on) => update({ ...openSection, enabled: on }) }}
        help="Reorder, add and remove sections on the list. A built-in section's words are on the Shared screen; a library section's are here."
      >
        <SectionContent section={openSection} onChange={update} />
      </DrawerPanel>
    )
  }
  if (openSetting) {
    return (
      <DrawerPanel
        title={openSetting.label}
        onBack={() => setOpenId(null)}
        onReset={() => setValue({ ...value, [openSetting.key]: structuredClone(GBP_TEMPLATE_DEFAULT[openSetting.key]) })}
      >
        <ValueEditor
          value={value[openSetting.key]}
          onChange={(next) => setValue({ ...value, [openSetting.key]: next })}
          hints={{ ...SETTINGS_HINTS, [openSetting.key]: { ...SETTINGS_HINTS[openSetting.key], label: undefined } }}
          path={[openSetting.key]}
        />
      </DrawerPanel>
    )
  }
  return (
    <div className="space-y-5">
      <Sections sections={value.sections} published={published.sections} onChange={(sections) => setValue({ ...value, sections })} onOpen={setOpenId} />
      <section aria-label="Page settings" className="rounded-lg border border-theme-border bg-theme-bg p-3 sm:p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="px-1 text-sm font-extrabold tracking-tight">Page settings</h2>
        <ul className="mt-3 divide-y divide-theme-border overflow-hidden rounded-md border border-theme-border dark:divide-neutral-800 dark:border-neutral-800">
          {SETTINGS.map(({ key, label }) => (
            <li key={key}>
              <button
                type="button"
                onClick={() => setOpenId(key)}
                data-drawer-row={key}
                className="flex min-h-12 w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-semibold hover:bg-theme-subtle focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-theme-primary dark:hover:bg-neutral-800"
              >
                <span className="flex-1">{label}</span>
                {!same(value[key], published[key]) && (
                  <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-bold text-amber-900 dark:bg-amber-500/15 dark:text-amber-300">Changed</span>
                )}
                <ChevronRight aria-hidden className="h-4 w-4 text-theme-muted" />
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

/** The GBP template: section order and visibility, library sections, styles, theme, header and footer. */
export function GbpTemplateEditor({ published, previewHref, locations, ...props }: Props) {
  return (
    <EditorShell
      {...props}
      layout="split"
      scope="every GBP page"
      preview={{ href: previewHref, locations }}
      save={(value) => saveGbpTemplateDraftAction(value as unknown as Record<string, unknown>)}
      publish={() => publishGbpRecordAction('template')}
      discard={() => discardGbpRecordAction('template')}
    >
      {(value, setValue) => <TemplateBody value={value} setValue={setValue} published={published} />}
    </EditorShell>
  )
}
