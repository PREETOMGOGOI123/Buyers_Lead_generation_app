'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ImportBuyersPage() {
  const router = useRouter();
  const [fileName, setFileName] = useState('');
  const [importing, setImporting] = useState(false);
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  };
  
  const handleImport = () => {
    if (!fileName) return;
    
    setImporting(true);
    
    // Simulate import
    setTimeout(() => {
      alert('✅ CSV imported successfully! (This is a demo - no actual import)');
      router.push('/buyers');
    }, 2000);
  };
  
  const downloadTemplate = () => {
    alert('📥 Template download started! (This is a demo)');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Import Buyers</h1>
        <Link href="/buyers" className="btn btn-ghost">
          ← Back to List
        </Link>
      </div>

      {/* Instructions */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Import Instructions</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Maximum 200 rows per import</li>
            <li>CSV must have headers matching the template</li>
            <li>Only valid rows will be imported</li>
            <li>Tags should be comma-separated values</li>
            <li>Budget values should be numbers without formatting</li>
          </ul>
          <div className="mt-4">
            <button onClick={downloadTemplate} className="btn btn-secondary btn-sm">
              📥 Download Template CSV
            </button>
          </div>
        </div>
      </div>

      {/* File Upload */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Select CSV File</h2>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="file-input file-input-bordered w-full max-w-xs"
          />
          
          {fileName && (
            <div className="mt-4">
              <p className="text-sm">Selected file: <strong>{fileName}</strong></p>
              <button
                onClick={handleImport}
                className={`btn btn-primary mt-4 ${importing ? 'loading' : ''}`}
                disabled={importing}
              >
                {importing ? 'Importing...' : 'Import CSV'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Demo Note */}
      <div className="alert alert-info">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <span>This is a UI demo. CSV import functionality is simulated.</span>
      </div>
    </div>
  );
}

