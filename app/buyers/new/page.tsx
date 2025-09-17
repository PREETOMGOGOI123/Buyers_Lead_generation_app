'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CITIES, PROPERTY_TYPES, BHK_OPTIONS, PURPOSES, 
  TIMELINES, SOURCES, buyerSchema 
} from '@/lib/validations/buyers';
import type { BuyerInput } from '@/lib/validations/buyers';

export default function CreateBuyerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<Partial<BuyerInput>>({
    fullName: '',
    email: '',
    phone: '',
    city: 'Chandigarh',
    propertyType: 'Apartment', // Note: using 'Appartment' to match your PROPERTY_TYPES constant
    bhk: '2',
    purposes: 'Buy', // Fixed: changed from 'purposes' to 'purpose'
    timeline: '0-3m',
    source: 'Website',
    notes: '',
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      // Convert budget strings to numbers
      const dataToValidate = {
        ...formData,
        budgetMin: formData.budgetMin ? Number(formData.budgetMin) : undefined,
        budgetMax: formData.budgetMax ? Number(formData.budgetMax) : undefined,
        email: formData.email || undefined,
        notes: formData.notes || undefined,
        bhk: (formData.propertyType === 'Apartment' || formData.propertyType === 'Villa') 
          ? formData.bhk : undefined,
      };

      // Validate
      const validatedData = buyerSchema.parse(dataToValidate);

      // Send to API
      const res = await fetch('/api/buyers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to create buyer');
      }

      router.push('/buyers');
      router.refresh();
    } catch (error: any) {
      if (error.errors) {
        // Zod validation errors
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          newErrors[err.path[0]] = err.message;
        });
        setErrors(newErrors);
      } else {
        setErrors({ form: error.message || 'Failed to create buyer' });
      }
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
    <div className="max-w-4xl mx-auto">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl">Create New Lead</h2>
          
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
                  className="select select-bordered"
                  value={formData.city || ''}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value as any })}
                >
                  <option value="">Select City</option>
                  {CITIES.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Property Type *</span>
                </label>
                <select
                  className="select select-bordered"
                  value={formData.propertyType || ''}
                  onChange={(e) => setFormData({ ...formData, propertyType: e.target.value as any })}
                >
                  <option value="">Select Property Type</option>
                  {PROPERTY_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
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
                  className="select select-bordered"
                  value={formData.purposes || ''}
                  onChange={(e) => setFormData({ ...formData, purposes: e.target.value as any })}
                >
                  <option value="">Select Purpose</option>
                  {PURPOSES.map(purpose => (
                    <option key={purpose} value={purpose}>{purpose}</option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Budget Min (₹)</span>
                </label>
                <input
                  type="number"
                  className={`input input-bordered ${errors.budgetMin ? 'input-error' : ''}`}
                  value={formData.budgetMin || ''}
                  onChange={(e) => setFormData({ ...formData, budgetMin: Number(e.target.value) || undefined })}
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
                  onChange={(e) => setFormData({ ...formData, budgetMax: Number(e.target.value) || undefined })}
                  placeholder="Max budget"
                />
                {errors.budgetMax && <span className="text-error text-xs mt-1">{errors.budgetMax}</span>}
              </div>
            </div>

            {/* Row 4: Timeline, Source */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Timeline *</span>
                </label>
                <select
                  className="select select-bordered"
                  value={formData.timeline || ''}
                  onChange={(e) => setFormData({ ...formData, timeline: e.target.value as any })}
                >
                  <option value="">Select Timeline</option>
                  {TIMELINES.map(timeline => (
                    <option key={timeline} value={timeline}>{timeline}</option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Source *</span>
                </label>
                <select
                  className="select select-bordered"
                  value={formData.source || ''}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value as any })}
                >
                  <option value="">Select Source</option>
                  {SOURCES.map(source => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
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
            <div className="flex gap-4 mt-6">
              <button
                type="submit"
                className={`btn btn-primary ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Lead'}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => router.push('/buyers')}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}