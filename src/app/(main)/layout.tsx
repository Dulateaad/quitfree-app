'use client';

import { ConditionalHeader } from '../../components/layout/ConditionalHeader';
import { WaitlistGate } from '../../components/WaitlistGate';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <WaitlistGate>
      <ConditionalHeader />
      {children}
    </WaitlistGate>
  );
}
