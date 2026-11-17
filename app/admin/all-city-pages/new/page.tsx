import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createAllCityPageAction } from '@/actions/allCityPages'
import { ADMIN_ROUTES } from '@/config/admin'
import { ALL_CITY_STATE_NAMES } from '@/lib/allCityPage'
import { ALL_CITY_STATES } from '@/lib/allCityValidate'
import { ALL_CITY_DEPOTS } from '@/lib/data/allCityDepots'
import { AllCityNewPageForm } from '../_components/AllCityNewPageForm'

export const metadata: Metadata = { title: 'All City Pages — New page', robots: { index: false, follow: false } }

export default function AllCityNewPageAdmin() {
  return (
    <>
      <Link href={ADMIN_ROUTES.ALL_CITY} className="inline-flex items-center gap-1 text-sm text-theme-muted hover:text-theme-dark dark:text-neutral-400">
        <ArrowLeft className="h-4 w-4" />
        All City Pages
      </Link>
      <h1 className="mt-2 mb-5 text-2xl font-extrabold tracking-tight sm:text-3xl">New page</h1>
      <AllCityNewPageForm
        stateOptions={ALL_CITY_STATES.map((st) => ({ value: st, label: `${ALL_CITY_STATE_NAMES[st]} (${st})` }))}
        depotOptions={Object.values(ALL_CITY_DEPOTS)
          .map((depot) => ({ value: depot.key, label: depot.depot, state: depot.state }))
          .sort((a, b) => a.label.localeCompare(b.label))}
        create={createAllCityPageAction}
        editorBase={ADMIN_ROUTES.ALL_CITY_PAGE('').replace(/\/$/, '')}
      />
    </>
  )
}
