import React, { useState } from 'react';
import { DecisionRecord } from '../types/food';
import { formatRelativeDate } from '../services/historyService';
import { AnimatedPanel } from './AnimatedPanel';
import { ConfirmDialog } from './ConfirmDialog';
export function HistoryView({ history, onRemoveItem, onClearAll }: {
  history: DecisionRecord[]; onRemoveItem: (id: string) => void; onClearAll: () => void | Promise<void>; onResetSeed: () => void;
}) {
  const [confirm, setConfirm] = useState(false);
  return <AnimatedPanel scroll animationKey={history.map(r => r.id).join(',')} className="section-stack">
    <div className="page-intro" data-reveal><h1>Your history</h1><p>Choices you’ve saved. We use them to suggest a little more variety.</p></div>
    {history.length ? <><div className="row-between"><p className="muted">{history.length} saved {history.length === 1 ? 'choice' : 'choices'}</p><button className="text-button danger" onClick={() => setConfirm(true)}>Clear history</button></div>
      {history.map(record => <article key={record.id} className="surface history-row" data-reveal><span className="history-emoji" aria-hidden="true">{record.emoji}</span>
        <div className="grow"><p className="eyebrow">{formatRelativeDate(record.decidedAt)}</p><h2>{record.foodItemName}</h2><p className="small muted">{record.locationName}</p><p className="small">Listed price: RM{record.price.toFixed(2)}</p></div>
        <button className="text-button danger" aria-label={`Remove ${record.foodItemName} from history`} onClick={() => onRemoveItem(record.id)}>Remove</button>
      </article>)}
    </> : <section className="surface" data-reveal><h2>No choices saved yet</h2><p className="muted">Find a suggestion in Decide, then choose “Save this choice”. It will appear here.</p></section>}
    <ConfirmDialog open={confirm} title="Clear your history?" description="This removes all your saved choices. You can’t undo it." confirmLabel="Clear history" onCancel={() => setConfirm(false)} onConfirm={async () => {await onClearAll();setConfirm(false);}} />
  </AnimatedPanel>;
}
