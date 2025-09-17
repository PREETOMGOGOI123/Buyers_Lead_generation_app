import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { buyerSchema } from '@/lib/validations/buyers';
import { z } from 'zod';

// GET - Get single buyer
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('GET /api/buyers/[id] - Starting request for ID:', id);

    if (!id || typeof id !== 'string') {
      console.error('Invalid ID format:', id);
      return NextResponse.json({ error: 'Invalid buyer ID' }, { status: 400 });
    }
    // Get current user
    let user;
    try {
      user = await getCurrentUser();
      console.log('Current user:', user?.email || 'No user');
    } catch (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch buyer
    let buyer;
    try {
      buyer = await prisma.buyer.findUnique({
      where: { id }, 
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
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    if (!buyer) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }

    // Parse tags safely
    let parsedTags = [];
    try {
      parsedTags = buyer.tags ? JSON.parse(buyer.tags) : [];
    } catch (parseError) {
      console.error('Failed to parse tags:', parseError);
      parsedTags = [];
    }

    const buyerWithParsedTags = {
      ...buyer,
      tags: parsedTags,
    };

    return NextResponse.json(buyerWithParsedTags);
  } catch (error) {
    console.error('Unexpected error in GET /api/buyers/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update buyer (partial update)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('PATCH /api/buyers/[id] - Starting request for ID:', id);

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Invalid buyer ID' }, { status: 400 });
    }
    // Get current user
    let user;
    try {
      user = await getCurrentUser();
    } catch (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    let rawBody;
    try {
      rawBody = await request.json();
      console.log('Update data received:', Object.keys(rawBody));
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    // Extract updatedAt for concurrent update checking (before validation)
    const clientUpdatedAt = rawBody.updatedAt;
    
    // Remove updatedAt from body before validation
    const { updatedAt, ...bodyWithoutTimestamp } = rawBody;

    // Validate with schema (partial validation for PATCH)
    let validatedBody;
    try {
      const partialSchema = buyerSchema.partial();
      validatedBody = partialSchema.parse(bodyWithoutTimestamp);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        console.error('Validation error:', validationError.issues);
        return NextResponse.json(
          { error: 'Validation failed', details: validationError.issues },
          { status: 400 }
        );
      }
      throw validationError;
    }
    
    // Check if buyer exists and user owns it
    let existingBuyer;
    try {
      existingBuyer = await prisma.buyer.findUnique({
      where: { id },
      });
    } catch (dbError) {
      console.error('Database error finding buyer:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    if (!existingBuyer) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }

    if (existingBuyer.ownerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check for concurrent updates using the extracted updatedAt
    if (clientUpdatedAt) {
      try {
        const buyerUpdatedAt = new Date(existingBuyer.updatedAt).getTime();
        const clientUpdatedAtTime = new Date(clientUpdatedAt).getTime();
        
        if (buyerUpdatedAt > clientUpdatedAtTime) {
          return NextResponse.json(
            { error: 'Record has been modified. Please refresh and try again.' },
            { status: 409 }
          );
        }
      } catch (dateError) {
        console.error('Date comparison error:', dateError);
        // Continue without concurrent update check
      }
    }

    // Prepare update data using validated body
    const updateData: any = { ...validatedBody };
    if (validatedBody.tags) {
      try {
        updateData.tags = JSON.stringify(validatedBody.tags);
      } catch (stringifyError) {
        console.error('Failed to stringify tags:', stringifyError);
        return NextResponse.json(
          { error: 'Invalid tags format' },
          { status: 400 }
        );
      }
    }

    // Calculate diff for history using validated body
    const changes: Record<string, any> = {};
    try {
      Object.keys(validatedBody).forEach(key => {
        const existingValue = existingBuyer[key as keyof typeof existingBuyer];
        const newValue = validatedBody[key as keyof typeof validatedBody];
        
        // Handle different data types properly
        if (key === 'tags') {
          // Compare parsed tags
          const existingTags = existingBuyer.tags ? JSON.parse(existingBuyer.tags) : [];
          if (JSON.stringify(existingTags) !== JSON.stringify(newValue)) {
            changes[key] = {
              old: existingTags,
              new: newValue,
            };
          }
        } else if (existingValue !== newValue) {
          changes[key] = {
            old: existingValue,
            new: newValue,
          };
        }
      });
    } catch (diffError) {
      console.error('Error calculating changes:', diffError);
      // Continue without history tracking
    }

    // Rest of your code remains the same...
    // Update buyer with history
    let updatedBuyer;
    try {
      updatedBuyer = await prisma.$transaction(async (tx) => {
        // Update buyer
        const buyer = await tx.buyer.update({
          where: { id },
          data: updateData,
        });

        // Create history entry if there are changes
        if (Object.keys(changes).length > 0) {
          await tx.buyerHistory.create({
            data: {
              buyerId: id,
              changedBy: user.id,
              diff: JSON.stringify(changes),
            },
          });
        }

        return buyer;
      });
    } catch (transactionError) {
      console.error('Transaction error:', transactionError);
      return NextResponse.json(
        { error: 'Failed to update buyer' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedBuyer);
  } catch (error) {
    console.error('Unexpected error in PATCH /api/buyers/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete buyer
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('DELETE /api/buyers/[id] - Starting request for ID:', id);

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Invalid buyer ID' }, { status: 400 });
    }
    // Get current user
    let user;
    try {
      user = await getCurrentUser();
    } catch (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if buyer exists and user owns it
    let buyer;
    try {
      buyer = await prisma.buyer.findUnique({
        where: { id },
      });
    } catch (dbError) {
      console.error('Database error finding buyer:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    if (!buyer) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }

    if (buyer.ownerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete buyer (history will cascade delete)
    try {
      await prisma.buyer.delete({
        where: { id },
      });
    } catch (deleteError) {
      console.error('Database error deleting buyer:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete buyer' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/buyers/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}