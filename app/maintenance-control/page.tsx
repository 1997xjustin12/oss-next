import { MaintenanceControl } from './_components/MaintenanceControl'

// Admin-only tool for flipping the maintenance wall from a browser. The page
// itself is harmless to expose — it does nothing without the token, which is
// verified server-side by /api/maintenance. Exempted from the wall in proxy.ts
// so it stays reachable while the site is down.
export const metadata = {
  title: 'Maintenance Control',
  robots: { index: false, follow: false },
}

export default function MaintenanceControlPage() {
  return <MaintenanceControl />
}
