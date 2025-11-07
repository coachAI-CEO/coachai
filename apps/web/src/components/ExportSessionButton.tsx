'use client';

import { useState } from 'react';

type Props = { id: string };

function download(url: string) {
  // open in same tab to trigger browser download
  window.location.href = url;
}

export function ExportSessionButton({ id }: Props) {
  const [busy, setBusy] = useState<null | 'md' | 'json' | 'pdf'>(null);

  const onClick = async (fmt: 'md' | 'json' | 'pdf') => {
    try {
      setBusy(fmt);
      const q = fmt === 'md' ? '' : `?format=${fmt}`;
      download(`/api/export/session/${id}${q}`);
    } finally {
      setBusy(null);
    }
  };

  const baseBtn =
    'inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-sm bg-white hover:bg-gray-50';

  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={() => onClick('md')}
        className={baseBtn}
        aria-label="Export Markdown"
        disabled={busy !== null}
      >
        {busy === 'md' ? 'Exporting…' : 'Export (.md)'}
      </button>

      <button
        type="button"
        onClick={() => onClick('json')}
        className={baseBtn}
        aria-label="Export JSON"
        disabled={busy !== null}
      >
        {busy === 'json' ? 'Exporting…' : 'Export (.json)'}
      </button>

      <button
        type="button"
        onClick={() => onClick('pdf')}
        className={baseBtn}
        aria-label="Export PDF"
        disabled={busy !== null}
      >
        {busy === 'pdf' ? 'Exporting…' : 'Export (.pdf)'}
      </button>
    </div>
  );
}
