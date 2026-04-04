import { collection, addDoc, doc, updateDoc, Timestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';

const WAITLIST_COLLECTION = 'waitlist';

export async function addToWaitlist(email: string, opts?: { addedToHomeScreen?: boolean; pushSubscription?: PushSubscriptionJSON; source?: string }): Promise<string> {
  const docRef = await addDoc(collection(db, WAITLIST_COLLECTION), {
    email: email.trim().toLowerCase(),
    createdAt: Timestamp.now(),
    source: opts?.source ?? 'landing',
    addedToHomeScreen: opts?.addedToHomeScreen ?? false,
    pushSubscription: opts?.pushSubscription ?? null,
    platform: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
  });
  return docRef.id;
}

export async function updateWaitlistA2HS(docId: string): Promise<void> {
  await updateDoc(doc(db, WAITLIST_COLLECTION, docId), {
    addedToHomeScreen: true,
    a2hsUpdatedAt: Timestamp.now(),
  });
}

export async function updateWaitlistPush(docId: string, subscription: PushSubscriptionJSON): Promise<void> {
  await updateDoc(doc(db, WAITLIST_COLLECTION, docId), {
    pushSubscription: subscription,
    pushUpdatedAt: Timestamp.now(),
  });
}

export async function findWaitlistByEmail(email: string): Promise<string | null> {
  const q = query(
    collection(db, WAITLIST_COLLECTION),
    where('email', '==', email.trim().toLowerCase())
  );
  const snap = await getDocs(q);
  return snap.empty ? null : snap.docs[0].id;
}
