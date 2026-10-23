import { notFound } from "next/navigation";
import { ROUTES } from "@/config/routes";
import { resolvePageMetadata } from "@/lib/seo";
import { HOME_VARIANTS, HomePage, parseHomeVariant } from "../../_components/HomePage";

type Props = { params: Promise<{ variant: string }> };

// All three variants are built at deploy time, so `/` is served from the CDN
// whichever one a visitor is enrolled in.
export function generateStaticParams() {
  return HOME_VARIANTS.map((variant) => ({ variant: String(variant) }));
}

// The same metadata as `/`, canonical included: this route is only ever seen
// through the proxy's rewrite of `/`, which keeps the visitor's URL. Requested
// directly it is a 404 (proxy.ts), so it is never a second homepage URL.
export function generateMetadata() {
  return resolvePageMetadata(ROUTES.HOME);
}

export default async function HomeVariantPage({ params }: Props) {
  const variant = parseHomeVariant((await params).variant);
  if (!variant) notFound();
  return <HomePage variant={variant} />;
}
