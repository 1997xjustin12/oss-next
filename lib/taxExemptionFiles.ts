/** Zoho's limits on the certificate upload, as its own form script enforces them. */
export const MAX_CERTIFICATE_FILES = 3
export const MAX_CERTIFICATE_TOTAL_BYTES = 20 * 1024 * 1024

/** What is wrong with the chosen files, or an empty string if nothing is. */
export function certificateFilesError(files: readonly { size: number }[]): string {
  if (files.length > MAX_CERTIFICATE_FILES) return 'You can upload a maximum of three files at a time.'
  const total = files.reduce((sum, file) => sum + file.size, 0)
  return total > MAX_CERTIFICATE_TOTAL_BYTES ? 'Total file size should not exceed 20MB.' : ''
}
