'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';


interface Buyer {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  city: string;
  propertyType: string;
  bhk: string | null;
  purpose: string;
  budgetMin: number | null;
  budgetMax: number | null;
  timeline: string;
  status: string;
  updatedAt: Date;
  ownerId: string;
  tags: string[];
  owner: {
    id: string;
    email: string;
    name: string | null;
  };
}

interface BuyerTableProps {
  buyers: Buyer[];
  currentUserId: string;
  sortBy: string;
  sortOrder: string;
}

export default function BuyerTable({ buyers, currentUserId, sortBy, sortOrder }: BuyerTableProps) {
  const router = useRouter();
  const [updating, setUpdating] = useState<string | null>(null);

  const formatBudget = (min: number | null, max: number | null) => {
    if (!min && !max) return '-';
    if (min && !max) return `₹${(min / 100000).toFixed(1)}L+`;
    if (!min && max) return `Up to ₹${(max / 100000).toFixed(1)}L`;
    return `₹${(min! / 100000).toFixed(1)}L - ₹${(max! / 100000).toFixed(1)}L`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
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

  const updateStatus = async (buyerId: string, newStatus: string) => {
    setUpdating(buyerId);
    try {
      const res = await fetch(`/api/buyers/${buyerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra bg-base-100">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>City</th>
            <th>Property</th>
            <th>Budget</th>
            <th>Timeline</th>
            <th>Status</th>
            <th>Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {buyers.map((buyer) => (
            <tr key={buyer.id}>
              <td>
                <div>
                  <div className="font-bold">{buyer.fullName}</div>
                  {buyer.email && (
                    <div className="text-sm opacity-50">{buyer.email}</div>
                  )}
                </div>
              </td>
              <td>{buyer.phone}</td>
              <td>{buyer.city}</td>
              <td>
                <div>
                  <div>{buyer.propertyType}</div>
                  {buyer.bhk && (
                    <div className="text-sm opacity-50">{buyer.bhk} BHK</div>
                  )}
                </div>
              </td>
              <td className="text-sm">{formatBudget(buyer.budgetMin, buyer.budgetMax)}</td>
              <td>{buyer.timeline}</td>
              <td>
                {currentUserId === buyer.ownerId ? (
                  <select
                    className={`select select-bordered select-xs ${getStatusColor(buyer.status)}`}
                    value={buyer.status}
                    onChange={(e) => updateStatus(buyer.id, e.target.value)}
                    disabled={updating === buyer.id}
                  >
                    {['New', 'Qualified', 'Contacted', 'Visited', 'Negotiation', 'Converted', 'Dropped'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                ) : (
                  <span className={`badge ${getStatusColor(buyer.status)}`}>
                    {buyer.status}
                  </span>
                )}
              </td>
              <td className="text-sm">{formatDate(buyer.updatedAt)}</td>
              <td>
                <div className="flex gap-2">
                  <Link href={`/buyers/${buyer.id}`} className="btn btn-ghost btn-xs">
                    View
                  </Link>
                  {currentUserId === buyer.ownerId && (
                    <Link href={`/buyers/${buyer.id}/edit`} className="btn btn-ghost btn-xs">
                      Edit
                    </Link>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}