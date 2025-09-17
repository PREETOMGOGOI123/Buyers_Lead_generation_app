'use client'


import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  searchParams: Record<string, string | undefined>;
}

export default function Pagination({ currentPage, totalPages, baseUrl, searchParams }: PaginationProps) {
  const createPageUrl = (page: number) => {
    const params = new URLSearchParams();
    
    // Add existing search params
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value && key !== 'page') {
        params.set(key, value);
      }
    });
    
    params.set('page', page.toString());
    return `${baseUrl}?${params.toString()}`;
  };

  const pages = [];
  const maxVisible = 5;
  
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className="flex justify-center">
      <div className="join">
        {/* Previous */}
        {currentPage > 1 ? (
          <Link href={createPageUrl(currentPage - 1)} className="join-item btn">
            «
          </Link>
        ) : (
          <button className="join-item btn" disabled>«</button>
        )}
        
        {/* First page if not visible */}
        {start > 1 && (
          <>
            <Link href={createPageUrl(1)} className="join-item btn">
              1
            </Link>
            {start > 2 && <button className="join-item btn" disabled>...</button>}
          </>
        )}
        
        {/* Page numbers */}
        {pages.map(page => (
          <Link
            key={page}
            href={createPageUrl(page)}
            className={`join-item btn ${page === currentPage ? 'btn-active' : ''}`}
          >
            {page}
          </Link>
        ))}
        
        {/* Last page if not visible */}
        {end < totalPages && (
          <>
            {end < totalPages - 1 && <button className="join-item btn" disabled>...</button>}
            <Link href={createPageUrl(totalPages)} className="join-item btn">
              {totalPages}
            </Link>
          </>
        )}
        
        {/* Next */}
        {currentPage < totalPages ? (
          <Link href={createPageUrl(currentPage + 1)} className="join-item btn">
            »
          </Link>
        ) : (
          <button className="join-item btn" disabled>»</button>
        )}
      </div>
    </div>
  );
}