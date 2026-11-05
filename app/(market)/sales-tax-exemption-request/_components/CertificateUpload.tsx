'use client'

import { useState } from 'react'
import { certificateFilesError } from '@/lib/taxExemptionFiles'

type Props = { name: string }

/**
 * The certificate upload: the page's only client code. It applies Zoho's file
 * limits, using the browser's own validation so a refused choice stops the
 * submit, and lists what was chosen. Without JavaScript the file still posts.
 */
export function CertificateUpload({ name }: Props) {
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState('')

  return (
    <div>
      <label htmlFor="tax-certificate" className="mb-1.5 block text-sm font-semibold text-theme-dark dark:text-neutral-200">
        Tax Exemption Certificate Document
      </label>
      <input
        id="tax-certificate"
        type="file"
        name={name}
        multiple
        aria-describedby="tax-certificate-hint"
        aria-invalid={error ? true : undefined}
        onChange={(e) => {
          const chosen = Array.from(e.target.files ?? [])
          const message = certificateFilesError(chosen)
          e.target.setCustomValidity(message)
          setFiles(chosen)
          setError(message)
        }}
        className="block w-full cursor-pointer rounded-md border border-dashed border-neutral-400 bg-theme-subtle p-3 text-sm text-theme-mid transition-colors
                   file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-theme-primary file:px-4 file:py-2.5 file:text-sm file:font-bold file:text-white
                   hover:border-theme-primary hover:file:bg-theme-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-primary
                   dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-300 dark:hover:border-red-400"
      />
      <p id="tax-certificate-hint" className="mt-1.5 text-sm text-theme-mid dark:text-neutral-400">
        Up to three files, 20MB in total.
      </p>
      {error && (
        <p role="alert" className="mt-1.5 text-sm font-semibold text-theme-primary dark:text-red-400">
          {error}
        </p>
      )}
      {!error && files.length > 1 && (
        <ul className="mt-2 space-y-1 text-sm text-theme-dark dark:text-neutral-200">
          {files.map((file) => (
            <li key={file.name} className="truncate">{file.name}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
