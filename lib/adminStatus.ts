/** What a draft-and-publish record reports about itself (GBP pages, location pages). */
type RecordStamps = { draftUpdatedAt?: string; draftUpdatedBy?: string; publishedAt?: string; publishedBy?: string }

function stamp(iso: string | undefined, by: string | undefined): string | undefined {
  if (!iso) return undefined
  const when = new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'UTC' })
  return `${when} UTC${by ? ` by ${by}` : ''}`
}

/** A record's draft and published stamps, for the editor's status line. */
export function editorStatus(state: RecordStamps): { draft?: string; published?: string } {
  return { draft: stamp(state.draftUpdatedAt, state.draftUpdatedBy), published: stamp(state.publishedAt, state.publishedBy) }
}
