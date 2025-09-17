'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CITIES, PROPERTY_TYPES, BHK_OPTIONS, PURPOSES, 
  TIMELINES, SOURCES, STATUSES, buyerSchema 
} from '@/lib/validations/buyers';
import type { BuyerInput } from '@/lib/validations/buyers';

interface Buyer {
  id: string;
  fullName: string;
  email: string | null;
  phone: string;
  city: string;
  propertyType: string;
  bhk: string | null;
  purpose: string; // Database field (singular)
  budgetMin: number | null;
  budgetMax: number | null;
  timeline: string;
  source: string;
  status: string;
  notes: string | null;
  tags: string[];
  updatedAt: Date;
}

interface EditBuyerFormProps {
  buyer: Buyer;
}

export default function EditBuyerForm({ buyer }: EditBuyerFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<Partial<BuyerInput>>({
    fullName: buyer.fullName,
    email: buyer.email || '',
    phone: buyer.phone,
    city: buyer.city as any,
    propertyType: buyer.propertyType as any,
    bhk: buyer.bhk as any,
    purposes: buyer.purpose as any, // ✅ Map database 'purpose' to schema 'purposes'
    budgetMin: buyer.budgetMin,
    budgetMax: buyer.budgetMax,
    timeline: buyer.timeline as any,
    source: buyer.source as any,
    status: buyer.status as any,
    notes: buyer.notes || '',
    tags: buyer.tags,
  });
  const [tagInput, setTagInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      // Convert budget strings to numbers and prepare data
      const dataToValidate = {
        ...formData,
        budgetMin: formData.budgetMin ? Number(formData.budgetMin) : null,
        budgetMax: formData.budgetMax ? Number(formData.budgetMax) : null,
        email: formData.email || undefined,
        notes: formData.notes || undefined,
        // Clear BHK if not needed for property type
        bhk: (formData.propertyType === 'Apartment' || formData.propertyType === 'Villa') 
          ? formData.bhk : null,
      };

      console.log('Data to validate:', dataToValidate); // Debug log

      // Validate with schema
      const validatedData = buyerSchema.parse(dataToValidate);
      
      console.log('Validated data:', validatedData); // Debug log

      // Send update with updatedAt for concurrency check
      const res = await fetch(`/api/buyers/${buyer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...validatedData,
          updatedAt: buyer.updatedAt,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        console.error('API Error:', error); // Debug log
        
        if (res.status === 409) {
          // Concurrency conflict
          throw new Error(error.error || 'Record has been modified. Please refresh and try again.');
        }
        if (res.status === 400 && error.details) {
          // Validation error from API
          const newErrors: Record<string, string> = {};
          error.details.forEach((err: any) => {
            newErrors[err.path[0]] = err.message;
          });
          setErrors(newErrors);
          return;
        }
        throw new Error(error.error || error.message || 'Failed to update buyer');
      }

      router.push(`/buyers/${buyer.id}`);
      router.refresh();
    } catch (error: any) {
      console.error('Form submission error:', error); // Debug log
      
      if (error.errors) {
        // Zod validation errors
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          newErrors[err.path[0]] = err.message;
        });
        setErrors(newErrors);
      } else {
        setErrors({ form: error.message || 'Failed to update buyer' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this buyer lead? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/buyers/${buyer.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete buyer');
      }

      router.push('/buyers');
      router.refresh();
    } catch (error: any) {
      console.error('Delete error:', error);
      alert(error.message || 'Failed to delete buyer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(t => t !== tag) || [],
    });
  };

  const needsBHK = formData.propertyType === 'Apartment' || formData.propertyType === 'Villa';

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-2xl">Edit Buyer Lead</h2>
        
        {errors.form && (
          <div className="alert alert-error">
            <span>{errors.form}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: Name, Email, Phone */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Full Name *</span>
              </label>
              <input
                type="text"
                className={`input input-bordered ${errors.fullName ? 'input-error' : ''}`}
                value={formData.fullName || ''}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
              {errors.fullName && <span className="text-error text-xs mt-1">{errors.fullName}</span>}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                className={`input input-bordered ${errors.email ? 'input-error' : ''}`}
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              {errors.email && <span className="text-error text-xs mt-1">{errors.email}</span>}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Phone *</span>
              </label>
              <input
                type="tel"
                className={`input input-bordered ${errors.phone ? 'input-error' : ''}`}
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="10-15 digits"
                required
              />
              {errors.phone && <span className="text-error text-xs mt-1">{errors.phone}</span>}
            </div>
          </div>

          {/* Row 2: City, Property Type, BHK */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">City *</span>
              </label>
              <select
                className={`select select-bordered ${errors.city ? 'select-error' : ''}`}
                value={formData.city || ''}
                onChange={(e) => setFormData({ ...formData, city: e.target.value as any })}
                required
              >
                <option value="">Select City</option>
                {CITIES.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              {errors.city && <span className="text-error text-xs mt-1">{errors.city}</span>}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Property Type *</span>
              </label>
              <select
                className={`select select-bordered ${errors.propertyType ? 'select-error' : ''}`}
                value={formData.propertyType || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  propertyType: e.target.value as any,
                  // Clear BHK if property type doesn't need it
                  bhk: (e.target.value === 'Apartment' || e.target.value === 'Villa') 
                    ? formData.bhk : undefined
                })}
                required
              >
                <option value="">Select Property Type</option>
                {PROPERTY_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.propertyType && <span className="text-error text-xs mt-1">{errors.propertyType}</span>}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">BHK {needsBHK ? '*' : ''}</span>
              </label>
              <select
                className={`select select-bordered ${errors.bhk ? 'select-error' : ''}`}
                value={formData.bhk || ''}
                onChange={(e) => setFormData({ ...formData, bhk: e.target.value as any })}
                disabled={!needsBHK}
                required={needsBHK}
              >
                <option value="">Select BHK</option>
                {BHK_OPTIONS.map(bhk => (
                  <option key={bhk} value={bhk}>{bhk}</option>
                ))}
              </select>
              {errors.bhk && <span className="text-error text-xs mt-1">{errors.bhk}</span>}
            </div>
          </div>

          {/* Row 3: Purpose, Budget */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Purpose *</span>
              </label>
              <select
                className={`select select-bordered ${errors.purposes ? 'select-error' : ''}`}
                value={formData.purposes || ''}
                onChange={(e) => setFormData({ ...formData, purposes: e.target.value as any })}
                required
              >
                <option value="">Select Purpose</option>
                {PURPOSES.map(purpose => (
                  <option key={purpose} value={purpose}>{purpose}</option>
                ))}
              </select>
              {errors.purposes && <span className="text-error text-xs mt-1">{errors.purposes}</span>}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Budget Min (₹)</span>
              </label>
              <input
                type="number"
                className={`input input-bordered ${errors.budgetMin ? 'input-error' : ''}`}
                value={formData.budgetMin || ''}
                onChange={(e) => setFormData({ ...formData, budgetMin: Number(e.target.value) || null })}
                placeholder="Min budget"
              />
              {errors.budgetMin && <span className="text-error text-xs mt-1">{errors.budgetMin}</span>}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Budget Max (₹)</span>
              </label>
              <input
                type="number"
                className={`input input-bordered ${errors.budgetMax ? 'input-error' : ''}`}
                value={formData.budgetMax || ''}
                onChange={(e) => setFormData({ ...formData, budgetMax: Number(e.target.value) || null })}
                placeholder="Max budget"
              />
              {errors.budgetMax && <span className="text-error text-xs mt-1">{errors.budgetMax}</span>}
            </div>
          </div>

          {/* Row 4: Timeline, Source, Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Timeline *</span>
              </label>
              <select
                className={`select select-bordered ${errors.timeline ? 'select-error' : ''}`}
                value={formData.timeline || ''}
                onChange={(e) => setFormData({ ...formData, timeline: e.target.value as any })}
                required
              >
                <option value="">Select Timeline</option>
                {TIMELINES.map(timeline => (
                  <option key={timeline} value={timeline}>{timeline}</option>
                ))}
              </select>
              {errors.timeline && <span className="text-error text-xs mt-1">{errors.timeline}</span>}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Source *</span>
              </label>
              <select
                className={`select select-bordered ${errors.source ? 'select-error' : ''}`}
                value={formData.source || ''}
                onChange={(e) => setFormData({ ...formData, source: e.target.value as any })}
                required
              >
                <option value="">Select Source</option>
                {SOURCES.map(source => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
              {errors.source && <span className="text-error text-xs mt-1">{errors.source}</span>}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Status *</span>
              </label>
              <select
                className={`select select-bordered ${errors.status ? 'select-error' : ''}`}
                value={formData.status || ''}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                required
              >
                <option value="">Select Status</option>
                {STATUSES.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              {errors.status && <span className="text-error text-xs mt-1">{errors.status}</span>}
            </div>
          </div>

          {/* Notes */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Notes</span>
            </label>
            <textarea
              className={`textarea textarea-bordered h-24 ${errors.notes ? 'textarea-error' : ''}`}
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes (max 1000 characters)"
              maxLength={1000}
            />
            {errors.notes && <span className="text-error text-xs mt-1">{errors.notes}</span>}
          </div>

          {/* Tags */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Tags</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                className="input input-bordered flex-1"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add tags and press Enter"
              />
              <button type="button" className="btn btn-secondary" onClick={addTag}>
                Add Tag
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags?.map(tag => (
                <div key={tag} className="badge badge-primary gap-2">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)}>✕</button>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between mt-6">
            <button
              type="button"
              className="btn btn-error btn-outline"
              onClick={handleDelete}
              disabled={loading}
            >
              Delete
            </button>
            <div className="flex gap-4">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => router.push(`/buyers/${buyer.id}`)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`btn btn-primary ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}