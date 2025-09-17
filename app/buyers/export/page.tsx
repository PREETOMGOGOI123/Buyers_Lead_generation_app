'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ExportBuyersPage() {
  const router = useRouter();
  const [exporting, setExporting] = useState(true);
  
  useEffect(() => {
    // Simulate export
    const timer = setTimeout(() => {
      setExporting(false);
      alert('📤 CSV exported successfully! (This is a demo - no actual file download)');
      setTimeout(() => {
        router.push('/buyers');
      }, 1000);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body text-center">
          <h2 className="card-title justify-center">Exporting Buyers</h2>
          
          {exporting ? (
            <>
              <div className="loading loading-spinner loading-lg mx-auto my-4"></div>
              <p>Preparing your CSV file...</p>
            </>
          ) : (
            <>
              <div className="text-green-500 text-5xl mb-4">✓</div>
              <p>Export complete!</p>
              <p className="text-sm opacity-70 mt-2">Redirecting to buyer list...</p>
            </>
          )}
          
          <div className="card-actions justify-center mt-4">
            <button 
              className="btn btn-ghost"
              onClick={() => router.push('/buyers')}
            >
              Back to List
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
