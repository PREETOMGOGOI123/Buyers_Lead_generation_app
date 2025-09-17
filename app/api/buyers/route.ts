import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { buyerSchema } from '@/lib/validations/buyers';
import { z } from 'zod';

// GET - List buyers with filters
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const city = searchParams.get('city') || '';
    const propertyType = searchParams.get('propertyType') || '';
    const status = searchParams.get('status') || '';
    const timeline = searchParams.get('timeline') || '';
    const sortBy = searchParams.get('sortBy') || 'updatedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build where clause
    const where: any = {};
    
    // Search in fullName, phone, email
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filters
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
      orderBy: { [sortBy]: sortOrder },
      include: {
        owner: {
          select: { id: true, email: true, name: true },
        },
      },
    });

    return NextResponse.json({
      buyers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching buyers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch buyers' },
      { status: 500 }
    );
  }
}


// POST - Create new buyer
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate input
    const validatedData = buyerSchema.parse(body);

    // Create buyer with history entry
    const buyer = await prisma.$transaction(async (tx) => {
      // Destructure to exclude 'purposes' and get the rest
      const { purposes, ...restOfData } = validatedData;
      
      // Create buyer
      const newBuyer = await tx.buyer.create({
        data: {
        ...restOfData,
        purpose: purposes,
        tags: JSON.stringify(validatedData.tags || []),
        ownerId: user.id,
        propertyType: validatedData.propertyType || '',
        timeline: validatedData.timeline || '', 
        },
      });

      // Create history entry
      await tx.buyerHistory.create({
        data: {
          buyerId: newBuyer.id,
          changedBy: user.id,
          diff: JSON.stringify({
            action: 'created',
            data: validatedData,
          }),
        },
      });

      return newBuyer;
    });

    return NextResponse.json(buyer, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    
    console.error('Error creating buyer:', error);
    return NextResponse.json(
      { error: 'Failed to create buyer' },
      { status: 500 }
    );
  }
}