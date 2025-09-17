import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import EditBuyerForm from '@/components/edit-buyer-form';

interface PageProps {
  params: Promise<{ id: string }>; // ✅ Changed to Promise
}

export default async function EditBuyerPage({ params }: PageProps) {
  const { id } = await params; // ✅ Await params first
  
  const user = await getCurrentUser();
  if (!user) {
    redirect('/buyers');
  }

  const buyer = await prisma.buyer.findUnique({
    where: { id }, // ✅ Use destructured id instead of params.id
  });

  if (!buyer) {
    notFound();
  }

  // Check ownership
  if (buyer.ownerId !== user.id) {
    redirect(`/buyers/${buyer.id}`);
  }

  // Parse tags
  const buyerWithParsedTags = {
    ...buyer,
    tags: JSON.parse(buyer.tags || '[]'),
  };

  return (
    <div className="max-w-4xl mx-auto">
      <EditBuyerForm buyer={buyerWithParsedTags} />
    </div>
  );
}