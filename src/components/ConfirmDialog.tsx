import React, { useEffect, useId, useRef, useState } from 'react';
export function ConfirmDialog({ open, title, description, confirmLabel, onCancel, onConfirm }: {
  open: boolean; title: string; description: string; confirmLabel: string;
  onCancel: () => void; onConfirm: () => void | Promise<void>;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const id = useId(); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  useEffect(() => {
    if (!open) { dialog.current?.close(); return; }
    setError('');
    const previous = document.activeElement as HTMLElement | null;
    dialog.current?.showModal();
    return () => { dialog.current?.close(); previous?.focus(); };
  }, [open]);
  return <dialog ref={dialog} aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`} className="confirm-dialog"
    onCancel={e => {e.preventDefault();if (!busy) onCancel();}}>
    <h2 id={`${id}-title`}>{title}</h2><p id={`${id}-description`} className="muted">{description}</p>
    {error && <p className="notice" role="alert">{error}</p>}
    <div className="actions"><button className="secondary" autoFocus disabled={busy} onClick={onCancel}>Cancel</button>
      <button className="primary" disabled={busy} onClick={async () => {
        setBusy(true);setError('');
        try {await onConfirm();} catch {setError('Could not complete that. Check your connection and try again.');}
        finally {setBusy(false);}
      }}>{busy ? 'Please wait…' : confirmLabel}</button></div>
  </dialog>;
}
