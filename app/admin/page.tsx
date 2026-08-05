import { redirect } from 'next/navigation';
import { ADMIN_ROUTES } from '@/config/admin';

// /admin has nothing of its own to show yet, so it hands straight off to the
// only section there is. When a second section lands, replace this with a real
// landing page rather than picking a favourite to redirect to.
//
// In production this never runs: the layout's gate returns without rendering
// children, so the redirect is unreachable and the proxy 404s the path first.
export default function AdminIndexPage() {
  redirect(ADMIN_ROUTES.PAGE_CONFIGURATOR);
}
