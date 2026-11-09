import { HomePage, homePreviewMetadata } from "../_components/HomePage";

// A public, shareable look at homepage variant 3, so the client can see it
// without being enrolled in it. Not part of the A/B test (see HomePage's
// `preview`), and noindex with `/` as canonical (homePreviewMetadata).
export function generateMetadata() {
  return homePreviewMetadata();
}

export default function HomeVersion3() {
  return <HomePage variant={3} preview />;
}
