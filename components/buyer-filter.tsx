'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { CITIES, PROPERTY_TYPES, STATUSES, TIMELINES } from '@/lib/validations/buyers';

interface BuyerFiltersProps {
  search: string;
  city: string;
  propertyType: string;
  status: string;
  timeline: string;
}

export default function BuyerFilters(props: BuyerFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(props.search);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout>();

  // Debounced search
  useEffect(() => {
    if (searchTimeout) clearTimeout(searchTimeout);
    
    const timeout = setTimeout(() => {
      updateFilter('search', search);
    }, 500);
    
    setSearchTimeout(timeout);
    
    return () => clearTimeout(timeout);
  }, [search]);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    // Reset to page 1 when filters change
    if (key !== 'page') {
      params.set('page', '1');
    }
    
    router.push(`/buyers?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearch('');
    router.push('/buyers');
  };

  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="form-control">
            <input
              type="text"
              placeholder="Search name, phone, email..."
              className="input input-bordered input-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* City Filter */}
          <div className="form-control">
            <select
              className="select select-bordered select-sm"
              value={props.city}
              onChange={(e) => updateFilter('city', e.target.value)}
            >
              <option value="">All Cities</option>
              {CITIES.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          {/* Property Type Filter */}
          <div className="form-control">
            <select
              className="select select-bordered select-sm"
              value={props.propertyType}
              onChange={(e) => updateFilter('propertyType', e.target.value)}
            >
              <option value="">All Properties</option>
              {PROPERTY_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="form-control">
            <select
              className="select select-bordered select-sm"
              value={props.status}
              onChange={(e) => updateFilter('status', e.target.value)}
            >
              <option value="">All Status</option>
              {STATUSES.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {/* Timeline Filter */}
          <div className="form-control">
            <select
              className="select select-bordered select-sm"
              value={props.timeline}
              onChange={(e) => updateFilter('timeline', e.target.value)}
            >
              <option value="">All Timelines</option>
              {TIMELINES.map(timeline => (
                <option key={timeline} value={timeline}>{timeline}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear button if any filters active */}
        {(props.search || props.city || props.propertyType || props.status || props.timeline) && (
          <div className="mt-2">
            <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}