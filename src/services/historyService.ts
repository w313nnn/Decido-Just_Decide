import { DecisionRecord, FoodItem } from '../types/food';
import { doc, setDoc, deleteDoc, collection, onSnapshot, writeBatch } from 'firebase/firestore';
import { db, auth } from './firebase';
import { readStored, writeStored } from './storage';

export function isDecisionRecord(value: unknown): value is DecisionRecord {
  if (!value || typeof value !== 'object') return false;
  const r = value as DecisionRecord;
  return ['id', 'foodItemId', 'foodItemName', 'emoji', 'locationName', 'decidedAt', 'reason', 'campusId']
    .every(key => typeof r[key as keyof DecisionRecord] === 'string') &&
    ['food', 'drink', 'dessert'].includes(r.category) && Number.isFinite(r.price) && r.price >= 0 &&
    Number.isFinite(Date.parse(r.decidedAt));
}
export function getHistory(): DecisionRecord[] {
  const records = readStored<unknown>('history', []);
  return Array.isArray(records) ? records.filter(isDecisionRecord)
    .sort((a, b) => Date.parse(b.decidedAt) - Date.parse(a.decidedAt)) : [];
}
function reportSyncError() {
  window.dispatchEvent(new CustomEvent('decido-sync-error'));
}
interface PendingChanges { saves: DecisionRecord[]; deletes: string[]; }
function pending(): PendingChanges {
  const raw = readStored<Partial<PendingChanges> | null>('pending-history', null);
  return {
    saves: Array.isArray(raw?.saves) ? raw.saves.filter(isDecisionRecord) : [],
    deletes: Array.isArray(raw?.deletes) ? raw.deletes.filter(id => typeof id === 'string') : [],
  };
}
export function mergeHistory(remote: DecisionRecord[], changes: PendingChanges): DecisionRecord[] {
  const merged = new Map(remote.map(record => [record.id, record]));
  changes.saves.forEach(record => merged.set(record.id, record));
  changes.deletes.forEach(id => merged.delete(id));
  return [...merged.values()].sort((a,b) => Date.parse(b.decidedAt) - Date.parse(a.decidedAt));
}
function flushPending(userId: string) {
  const changes = pending();
  changes.saves.forEach(record => {
    void setDoc(doc(db, 'users', userId, 'decisions', record.id), { ...record, userId }).catch(reportSyncError);
  });
  changes.deletes.forEach(id => {
    void deleteDoc(doc(db, 'users', userId, 'decisions', id)).catch(reportSyncError);
  });
}
export function saveDecision(item: FoodItem, customReason?: string): DecisionRecord {
  const record: DecisionRecord = {
    id: `decision-${crypto.randomUUID()}`, foodItemId: item.id, foodItemName: item.name,
    emoji: item.emoji, category: item.category, price: item.price, locationName: item.locationName,
    decidedAt: new Date().toISOString(), reason: (customReason || 'Saved your choice.').slice(0, 256), campusId: item.campusId,
  };
  writeStored('history', [record, ...getHistory()]);
  const user = auth.currentUser;
  if (user && !user.isAnonymous) {
    const changes = pending();
    writeStored('pending-history', { ...changes, saves: [...changes.saves, record] });
    void setDoc(doc(db, 'users', user.uid, 'decisions', record.id), { ...record, userId: user.uid })
      .catch(reportSyncError);
  }
  return record;
}
export function removeDecision(id: string): DecisionRecord[] {
  const updated = getHistory().filter(r => r.id !== id);
  writeStored('history', updated);
  const user = auth.currentUser;
  if (user && !user.isAnonymous) {
    const changes = pending();
    writeStored('pending-history', { saves: changes.saves.filter(record => record.id !== id), deletes: [...new Set([...changes.deletes, id])] });
    void deleteDoc(doc(db, 'users', user.uid, 'decisions', id)).catch(reportSyncError);
  }
  return updated;
}
export async function clearAllHistory(): Promise<void> {
  const records = getHistory();
  const user = auth.currentUser;
  // Firestore batches allow at most 500 writes. Clear locally only after success.
  if (user && !user.isAnonymous) {
    for (let start = 0; start < records.length; start += 450) {
      const batch = writeBatch(db);
      records.slice(start, start + 450).forEach(r => batch.delete(doc(db, 'users', user.uid, 'decisions', r.id)));
      await batch.commit();
    }
  }
  writeStored('history', []);
  writeStored('pending-history', { saves: [], deletes: [] });
}
// Kept for old callers; sample data must never replace personal history.
export function resetToSeedHistory(): DecisionRecord[] { return getHistory(); }

export function subscribeToUserDecisions(userId: string, onUpdate: (records: DecisionRecord[]) => void): () => void {
  flushPending(userId);
  return onSnapshot(collection(db, 'users', userId, 'decisions'), { includeMetadataChanges: true }, snapshot => {
    if (auth.currentUser?.uid !== userId) return;
    const records = snapshot.docs.map(d => ({ ...d.data(), id: d.id })).filter(isDecisionRecord)
      .sort((a, b) => Date.parse(b.decidedAt) - Date.parse(a.decidedAt));
    let changes = pending();
    if (!snapshot.metadata.fromCache && !snapshot.metadata.hasPendingWrites) {
      const ids = new Set(records.map(record => record.id));
      changes = { saves: changes.saves.filter(record => !ids.has(record.id)), deletes: changes.deletes.filter(id => ids.has(id)) };
      writeStored('pending-history', changes);
    }
    // Preserve unacknowledged local work; an empty cloud snapshot is still valid.
    const merged = mergeHistory(records, changes);
    writeStored('history', merged);
    onUpdate(merged);
  }, reportSyncError);
}
export function getDaysAgo(isoDate: string): number {
  const date = new Date(isoDate);
  if (!Number.isFinite(date.getTime())) return Infinity;
  const now = new Date();
  const day = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.max(0, Math.round((today - day) / 86400000));
}
export function formatRelativeDate(isoDate: string): string {
  const days = getDaysAgo(isoDate);
  if (!Number.isFinite(days)) return 'Unknown date';
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days <= 7) return `${days} days ago`;
  return new Date(isoDate).toLocaleDateString('en-MY', { year: 'numeric', month: 'short', day: 'numeric' });
}
