import { DecisionRecord, FoodItem } from '../types/food';
import { doc, setDoc, deleteDoc, collection, onSnapshot, writeBatch } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';

const STORAGE_KEY = 'makanmana_decision_history_v1';

// Initial realistic seed history for UTAR Sungai Long so the user immediately experiences
// the recency penalty algorithm on their first visit without having to manually log 4 days.
export const DEFAULT_SEED_HISTORY: DecisionRecord[] = [
  {
    id: 'seed-hist-1',
    foodItemId: 'sl-hainan-chicken-rice',
    foodItemName: 'Steamed Hainanese Chicken Rice',
    emoji: '🍗',
    category: 'food',
    price: 8.5,
    locationName: 'Kedai Kopi Sungai Long (Jalan SL 1/11)',
    decidedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Yesterday
    reason: 'Quick lunch before 2 PM lecture at KB Block.',
    campusId: 'utar-sungai-long',
  },
  {
    id: 'seed-hist-2',
    foodItemId: 'sl-mixue-lemonade',
    foodItemName: 'Mixue Fresh Squeezed Lemonade',
    emoji: '🍋',
    category: 'drink',
    price: 3.5,
    locationName: 'Mixue (Jalan SL 1/3, beside KB Block)',
    decidedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Yesterday afternoon
    reason: 'Hot afternoon study break refresher beside campus.',
    campusId: 'utar-sungai-long',
  },
  {
    id: 'seed-hist-3',
    foodItemId: 'sl-zap-fan-mixed-rice',
    foodItemName: 'Economical Mixed Rice (Zap Fan)',
    emoji: '🍱',
    category: 'food',
    price: 7.5,
    locationName: 'Ah Seng Economy Rice (Jalan SL 1/3, behind Maybank)',
    decidedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    reason: 'Budget lunch with 2 greens and 1 tofu meat dish.',
    campusId: 'utar-sungai-long',
  },
  {
    id: 'seed-hist-4',
    foodItemId: 'sl-curry-mee',
    foodItemName: 'Kopitiam Fragrant Curry Mee',
    emoji: '🍲',
    category: 'food',
    price: 9.0,
    locationName: 'Restoran Good Taste (Jalan SL 1/11)',
    decidedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    reason: 'Rich coconut curry noodles with cockles and tau pok.',
    campusId: 'utar-sungai-long',
  },
];

export function getHistory(): DecisionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // First time initialization: initialize with seed history
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SEED_HISTORY));
      return DEFAULT_SEED_HISTORY;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_SEED_HISTORY;

    // Migrate/upgrade previous seed items to accurate real locations
    return parsed.map((record) => {
      const matchSeed = DEFAULT_SEED_HISTORY.find((s) => s.id === record.id);
      if (matchSeed) {
        return {
          ...record,
          locationName: matchSeed.locationName,
          foodItemName: matchSeed.foodItemName,
        };
      }
      return record;
    });
  } catch {
    return DEFAULT_SEED_HISTORY;
  }
}

export function saveDecision(item: FoodItem, customReason?: string): DecisionRecord {
  const current = getHistory();
  const newRecord: DecisionRecord = {
    id: `decision-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    foodItemId: item.id,
    foodItemName: item.name,
    emoji: item.emoji,
    category: item.category,
    price: item.price,
    locationName: item.locationName,
    decidedAt: new Date().toISOString(),
    reason: customReason || `Decided for today's RM${item.price.toFixed(2)} meal.`,
    campusId: item.campusId,
  };

  const updated = [newRecord, ...current];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  // Sync to Firestore if authenticated with real Firebase user
  if (auth.currentUser && !auth.currentUser.isAnonymous) {
    const uid = auth.currentUser.uid;
    const docPath = `users/${uid}/decisions/${newRecord.id}`;
    setDoc(doc(db, 'users', uid, 'decisions', newRecord.id), {
      userId: uid,
      foodItemId: newRecord.foodItemId,
      foodItemName: newRecord.foodItemName,
      emoji: newRecord.emoji,
      category: newRecord.category,
      price: newRecord.price,
      locationName: newRecord.locationName,
      decidedAt: newRecord.decidedAt,
      reason: newRecord.reason,
      campusId: newRecord.campusId,
    }).catch((err) => {
      handleFirestoreError(err, OperationType.CREATE, docPath);
    });
  }

  return newRecord;
}

export function removeDecision(id: string): DecisionRecord[] {
  const current = getHistory();
  const updated = current.filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  if (auth.currentUser && !auth.currentUser.isAnonymous) {
    const uid = auth.currentUser.uid;
    const docPath = `users/${uid}/decisions/${id}`;
    deleteDoc(doc(db, 'users', uid, 'decisions', id)).catch((err) => {
      handleFirestoreError(err, OperationType.DELETE, docPath);
    });
  }

  return updated;
}

export function clearAllHistory(): void {
  const current = getHistory();
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));

  if (auth.currentUser && !auth.currentUser.isAnonymous && current.length > 0) {
    const uid = auth.currentUser.uid;
    const path = `users/${uid}/decisions`;
    try {
      const batch = writeBatch(db);
      current.forEach((rec) => {
        batch.delete(doc(db, 'users', uid, 'decisions', rec.id));
      });
      batch.commit().catch((err) => {
        handleFirestoreError(err, OperationType.DELETE, path);
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  }
}

export function resetToSeedHistory(): DecisionRecord[] {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SEED_HISTORY));

  if (auth.currentUser && !auth.currentUser.isAnonymous) {
    const uid = auth.currentUser.uid;
    const path = `users/${uid}/decisions`;
    try {
      const batch = writeBatch(db);
      DEFAULT_SEED_HISTORY.forEach((rec) => {
        batch.set(doc(db, 'users', uid, 'decisions', rec.id), {
          userId: uid,
          foodItemId: rec.foodItemId,
          foodItemName: rec.foodItemName,
          emoji: rec.emoji,
          category: rec.category,
          price: rec.price,
          locationName: rec.locationName,
          decidedAt: rec.decidedAt,
          reason: rec.reason,
          campusId: rec.campusId,
        });
      });
      batch.commit().catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, path);
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }

  return DEFAULT_SEED_HISTORY;
}

export function subscribeToUserDecisions(
  userId: string,
  onUpdate: (records: DecisionRecord[]) => void
): () => void {
  const path = `users/${userId}/decisions`;
  const q = collection(db, 'users', userId, 'decisions');
  return onSnapshot(
    q,
    (snapshot) => {
      if (!snapshot.empty) {
        const records: DecisionRecord[] = snapshot.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            foodItemId: d.foodItemId || '',
            foodItemName: d.foodItemName || '',
            emoji: d.emoji || '🍜',
            category: d.category || 'food',
            price: Number(d.price) || 0,
            locationName: d.locationName || '',
            decidedAt: d.decidedAt || new Date().toISOString(),
            reason: d.reason || '',
            campusId: d.campusId || 'utar-sungai-long',
          };
        });
        records.sort((a, b) => new Date(b.decidedAt).getTime() - new Date(a.decidedAt).getTime());
        onUpdate(records);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export function getDaysAgo(isoDate: string): number {
  const date = new Date(isoDate);
  const now = new Date();

  // Reset hours to compare calendar days
  const d1 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const d2 = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffTime = d2.getTime() - d1.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

export function formatRelativeDate(isoDate: string): string {
  const days = getDaysAgo(isoDate);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days === 2) return '2 days ago';
  if (days === 3) return '3 days ago';
  if (days <= 7) return `${days} days ago`;
  return new Date(isoDate).toLocaleDateString('en-MY', {
    month: 'short',
    day: 'numeric',
  });
}
