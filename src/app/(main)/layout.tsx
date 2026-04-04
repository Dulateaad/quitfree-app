import { ConditionalHeader } from '../../components/layout/ConditionalHeader';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ConditionalHeader />
      {children}
    </>
  );
}
