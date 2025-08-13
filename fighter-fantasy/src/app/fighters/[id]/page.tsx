export default async function FighterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Fighter Profile</h1>
      <p className="text-text-secondary">Fighter ID: {id}</p>
      <p className="text-text-muted mt-4">Full fighter profile coming in Phase 2...</p>
    </div>
  );
} 