export interface WaitlistEntry {
  id?: string;
  email: string;
  createdAt: Date;
  source?: string;
  addedToHomeScreen?: boolean;
  pushSubscription?: PushSubscriptionJSON | null;
  platform?: string;
}
