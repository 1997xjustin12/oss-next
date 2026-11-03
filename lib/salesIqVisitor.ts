type SalesIqVisitor = {
  name?: (name: string) => void
  email?: (email: string) => void
}

/**
 * Tells the Zoho SalesIQ chat who this visitor is, from a quote form they just
 * submitted, so a chat afterwards shows their name and email to the team. The same
 * thing WordPress's quote form does (its `trackVisitor`).
 *
 * Does nothing if the widget hasn't loaded, as on a page that leaves the chat out
 * (lib/salesIq.ts) or a GBP page. Never throws: a chat label isn't worth a lead.
 */
export function identifySalesIqVisitor(firstName: string, lastName: string, email: string): void {
  try {
    const visitor = (window as { $zoho?: { salesiq?: { visitor?: SalesIqVisitor } } }).$zoho?.salesiq?.visitor
    const name = `${firstName} ${lastName}`.trim()
    if (name) visitor?.name?.(name)
    if (email) visitor?.email?.(email)
  } catch (err) {
    console.error('[live-chat] could not set the visitor', err)
  }
}
