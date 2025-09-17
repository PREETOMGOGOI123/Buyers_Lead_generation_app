import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

interface PageProps {
  params: { id: string };
}

export default async function ViewBuyerPage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const buyer = await prisma.buyer.findUnique({
    where: { id: params.id },
    include: {
      owner: {
        select: { id: true, email: true, name: true },
      },
      history: {
        take: 5,
        orderBy: { changedAt: 'desc' },
        include: {
          user: {
            select: { email: true, name: true },
          },
        },
      },
    },
  });

  if (!buyer) {
    notFound();
  }

  const tags = JSON.parse(buyer.tags || '[]');
  const isOwner = buyer.ownerId === user.id;

  const formatBudget = (min: number | null, max: number | null) => {
    if (!min && !max) return 'Not specified';
    if (min && !max) return `₹${(min / 100000).toFixed(1)} Lakhs+`;
    if (!min && max) return `Up to ₹${(max / 100000).toFixed(1)} Lakhs`;
    return `₹${(min! / 100000).toFixed(1)} - ₹${(max! / 100000).toFixed(1)} Lakhs`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const parseHistory = (diff: string) => {
    try {
      const changes = JSON.parse(diff);
      if (changes.action === 'created') {
        return 'Created buyer lead';
      }
      
      const fields = Object.keys(changes);
      if (fields.length === 1 && fields[0] === 'status') {
        return `Status: ${changes.status.old} → ${changes.status.new}`;
      }
      
      return `Updated ${fields.length} field${fields.length > 1 ? 's' : ''}: ${fields.join(', ')}`;
    } catch {
      return 'Updated';
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'New': 'badge-info',
      'Qualified': 'badge-primary',
      'Contacted': 'badge-secondary',
      'Visited': 'badge-accent',
      'Negotiation': 'badge-warning',
      'Converted': 'badge-success',
      'Dropped': 'badge-error',
    };
    return colors[status] || '';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Buyer Details</h1>
        <div className="flex gap-2">
          <Link href="/buyers" className="btn btn-ghost">
            ← Back
          </Link>
          {isOwner && (
            <Link href={`/buyers/${buyer.id}/edit`} className="btn btn-primary">
              Edit
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Basic Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm opacity-70">Full Name</label>
                  <p className="font-semibold">{buyer.fullName}</p>
                </div>
                <div>
                  <label className="text-sm opacity-70">Email</label>
                  <p className="font-semibold">{buyer.email || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm opacity-70">Phone</label>
                  <p className="font-semibold">{buyer.phone}</p>
                </div>
                <div>
                  <label className="text-sm opacity-70">City</label>
                  <p className="font-semibold">{buyer.city}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Property Requirements */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Property Requirements</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm opacity-70">Property Type</label>
                  <p className="font-semibold">{buyer.propertyType}</p>
                </div>
                {buyer.bhk && (
                  <div>
                    <label className="text-sm opacity-70">BHK</label>
                    <p className="font-semibold">{buyer.bhk}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm opacity-70">Purpose</label>
                  <p className="font-semibold">{buyer.purpose}</p>
                </div>
                <div>
                  <label className="text-sm opacity-70">Budget</label>
                  <p className="font-semibold">{formatBudget(buyer.budgetMin, buyer.budgetMax)}</p>
                </div>
                <div>
                  <label className="text-sm opacity-70">Timeline</label>
                  <p className="font-semibold">{buyer.timeline}</p>
                </div>
                <div>
                  <label className="text-sm opacity-70">Source</label>
                  <p className="font-semibold">{buyer.source}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes & Tags */}
          {(buyer.notes || tags.length > 0) && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Additional Information</h2>
                {buyer.notes && (
                  <div>
                    <label className="text-sm opacity-70">Notes</label>
                    <p className="mt-1">{buyer.notes}</p>
                  </div>
                )}
                {tags.length > 0 && (
                  <div className="mt-4">
                    <label className="text-sm opacity-70">Tags</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map((tag: string) => (
                        <span key={tag} className="badge badge-primary">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Meta */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Status</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm opacity-70">Current Status</label>
                  <div className="mt-1">
                    <span className={`badge ${getStatusColor(buyer.status)}`}>
                      {buyer.status}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm opacity-70">Owner</label>
                  <p className="font-semibold">{buyer.owner.name || buyer.owner.email}</p>
                </div>
                <div>
                  <label className="text-sm opacity-70">Created</label>
                  <p className="text-sm">{formatDate(buyer.createdAt)}</p>
                </div>
                <div>
                  <label className="text-sm opacity-70">Last Updated</label>
                  <p className="text-sm">{formatDate(buyer.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* History */}
          {buyer.history.length > 0 && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Recent History</h2>
                <div className="space-y-3">
                  {buyer.history.map((entry) => (
                    <div key={entry.id} className="border-l-2 border-base-300 pl-3">
                      <p className="text-sm font-semibold">
                        {parseHistory(entry.diff)}
                      </p>
                      <p className="text-xs opacity-70">
                        by {entry.user.name || entry.user.email} • {formatDate(entry.changedAt)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}