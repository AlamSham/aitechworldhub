import AdminSubscribers from '../../../src/components/admin/AdminSubscribers';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Subscribers | Admin',
};

export default function SubscribersPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <AdminSubscribers />
    </main>
  );
}
