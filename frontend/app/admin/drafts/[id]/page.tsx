import AdminEditor from '../../../../src/components/admin/AdminEditor';

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminDraftEditorPage({ params }: Props) {
  const { id } = await params;

  return (
    <main className="grid gap-6">
      <AdminEditor id={id} />
    </main>
  );
}
