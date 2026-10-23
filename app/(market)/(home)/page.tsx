import { ROUTES } from "@/config/routes";
import { resolvePageMetadata } from "@/lib/seo";
import { HomePage } from "./_components/HomePage";

// Copy lives in config/pageSeoDefaults.ts so the admin Page Configurator can
// show it as the placeholder behind each field.
export function generateMetadata() {
  return resolvePageMetadata(ROUTES.HOME);
}

// The proxy normally rewrites `/` to the visitor's prebuilt variant at
// /home-variant/<n> (see handleAbTest in proxy.ts). This renders only if that
// did not happen, with the control variant. No request data is read, so the
// route stays fully static.
export default function Home() {
  return <HomePage variant={1} />;
}
