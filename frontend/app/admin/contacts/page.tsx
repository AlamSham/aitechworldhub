import AdminContacts from '../../../src/components/admin/AdminContacts';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Messages | Admin',
};

export default function ContactsPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <AdminContacts />
    </main>
  );
}
