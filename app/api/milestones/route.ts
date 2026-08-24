import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const { grantId, milestoneId, amount, description } = await request.json();

    if (!grantId || milestoneId === undefined || !amount) {
      return NextResponse.json(
        { error: 'Grant ID, milestone ID, and amount are required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();
    
    const result = await db.collection('milestones').insertOne({
      grantId,
      milestoneId,
      amount,
      description,
      approvals: 0,
      paid: false,
      status: 'pending',
      createdAt: new Date(),
    });

    return NextResponse.json(
      { message: 'Milestone created successfully', milestoneDbId: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create milestone error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const grantId = searchParams.get('grantId');
    const milestoneDbId = searchParams.get('milestoneDbId');

    const client = await clientPromise;
    const db = client.db();

    if (milestoneDbId) {
      const milestone = await db.collection('milestones').findOne({
        _id: new ObjectId(milestoneDbId),
      });

      if (!milestone) {
        return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
      }

      return NextResponse.json({ milestone });
    }
    
    const query = grantId ? { grantId } : {};
    const milestones = await db.collection('milestones')
      .find(query)
      .sort({ milestoneId: 1 })
      .toArray();

    return NextResponse.json({ milestones });
  } catch (error) {
    console.error('Fetch milestones error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { milestoneDbId, approvals, paid, status, submissionNote, submissionFileUrl } = await request.json();

    if (!milestoneDbId) {
      return NextResponse.json(
        { error: 'Milestone ID is required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();
    
    const updateData: any = {};
    if (approvals !== undefined) updateData.approvals = approvals;
    if (paid !== undefined) updateData.paid = paid;
    if (status !== undefined) updateData.status = status;
    if (submissionNote !== undefined) {
      updateData.submissionNote = submissionNote;
      updateData.submittedAt = new Date();
    }
    if (submissionFileUrl !== undefined) {
      updateData.submissionFileUrl = submissionFileUrl;
      if (!updateData.submittedAt) updateData.submittedAt = new Date();
    }

    const result = await db.collection('milestones').updateOne(
      { _id: new ObjectId(milestoneDbId) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Milestone not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: 'Milestone updated successfully',
      modified: result.modifiedCount 
    });
  } catch (error) {
    console.error('Update milestone error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
