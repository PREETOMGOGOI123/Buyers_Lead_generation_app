
import Link from 'next/link'
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { CITIES, PROPERTY_TYPES, STATUSES, TIMELINES } from '@/lib/validations/buyers';
import BuyerFilters from '@/components/buyer-filter';
import BuyerTable from '@/components/buyer-table';
import Pagination from '@/components/pagination';

interface PageProps {
  searchParams: {
    page?: string;
    search?: string;
    city?: string;
    propertyType?: string;
    status?: string;
    timeline?: string;
    sortBy?: string;
    sortOrder?: string;
  };
}

export default async function BuyersPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const page = parseInt(searchParams.page || '1');
  const limit = 10;
  const search = searchParams.search || '';
  const city = searchParams.city || '';
  const propertyType = searchParams.propertyType || '';
  const status = searchParams.status || '';
  const timeline = searchParams.timeline || '';
  const sortBy = searchParams.sortBy || 'updatedAt';
  const sortOrder = searchParams.sortOrder || 'desc';

  // Build where clause
  const where: any = {};
  
  if (search) {
    where.OR = [
      { fullName: { contains: search } },
      { phone: { contains: search } },
      { email: { contains: search } },
    ];
  }

  if (city) where.city = city;
  if (propertyType) where.propertyType = propertyType;
  if (status) where.status = status;
  if (timeline) where.timeline = timeline;

  // Get total count
  const total = await prisma.buyer.count({ where });

  // Get paginated results
  const buyers = await prisma.buyer.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { [sortBy]: sortOrder as any },
    include: {
      owner: {
        select: { id: true, email: true, name: true },
      },
    },
  });

  // Parse tags for each buyer
  const buyersWithParsedTags = buyers.map(buyer => ({
    ...buyer,
    tags: JSON.parse(buyer.tags || '[]'),
  }));

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Buyer Leads</h1>
        <div className="flex gap-2">
          <Link href="/buyers/import" className="btn btn-outline">
            📥 Import CSV
          </Link>
          <Link href="/buyers/export" className="btn btn-outline">
            📤 Export CSV
          </Link>
          <Link href="/buyers/new" className="btn btn-primary">
            + Add Lead
          </Link>
        </div>
      </div>

      {/* Filters */}
      <BuyerFilters
        search={search}
        city={city}
        propertyType={propertyType}
        status={status}
        timeline={timeline}
      />

      {/* Results count */}
      <div className="text-sm opacity-70">
        Showing {buyers.length} of {total} results
      </div>

      {/* Table */}
      {buyers.length === 0 ? (
        <div className="card bg-base-100">
          <div className="card-body text-center py-12">
            <p className="text-lg opacity-70">No buyer leads found</p>
            <p className="text-sm opacity-50">Try adjusting your filters or add a new lead</p>
          </div>
        </div>
      ) : (
        <>
          <BuyerTable 
            buyers={buyersWithParsedTags} 
            currentUserId={user.id}
            sortBy={sortBy}
            sortOrder={sortOrder}
          />
          
          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              baseUrl="/buyers"
              searchParams={searchParams}
            />
          )}
        </>
      )}
    </div>
  );
}