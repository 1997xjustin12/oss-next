'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, RefreshCw } from 'lucide-react';

type Props = { disabled: boolean; running: boolean };

const POLL_MS = 5000;

/** Starts a run (POST /api/feeds/generate), then refreshes the screen until it ends. */
export function GenerateFeedsButton({ disabled, running }: Props) {
  const router = useRouter();
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => router.refresh(), POLL_MS);
    return () => clearInterval(timer);
  }, [running, router]);

  async function generate() {
    setStarting(true);
    setError('');
    const answer = await fetch('/api/feeds/generate', { method: 'POST' })
      .then(async (res) => ({ ok: res.ok, status: res.status, body: (await res.json().catch(() => null)) as { error?: string } | null }))
      .catch(() => null);
    setStarting(false);
    // 409: someone else's run. Showing it is the answer, so it is not an error.
    if (answer?.ok || answer?.status === 409) router.refresh();
    else setError(answer?.body?.error ?? 'It could not be started. Try again.');
  }

  const busy = starting || running;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {error && <span role="alert" className="text-xs font-semibold text-theme-primary dark:text-red-300">{error}</span>}
      <button
        type="button"
        onClick={generate}
        disabled={disabled || busy}
        className="inline-flex items-center gap-1.5 rounded-md bg-theme-primary px-3.5 py-2 text-sm font-bold text-white transition-colors hover:bg-theme-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary/40 disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <RefreshCw className="h-4 w-4" aria-hidden />}
        {busy ? 'Generating…' : 'Regenerate Now'}
      </button>
    </div>
  );
}
