import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Grant } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: Grant = await request.json();
    const { sponsorAddress, teamAddress, requiredVotes, milestoneCount, appId, txId } = body;

    if (!sponsorAddress || !teamAddress || !requiredVotes || !milestoneCount || !appId || !txId) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();
    
    const result = await db.collection('grants').insertOne({
      sponsorAddress,
      teamAddress,
      requiredVotes,
      milestoneCount,
      appId,
      txId,
      status: 'active',
      totalFunded: 0,
      createdAt: new Date(),
    });

    return NextResponse.json(
      { message: 'Grant created successfully', grantId: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Grant creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sponsorAddress = searchParams.get('sponsorAddress');
    const teamAddress = searchParams.get('teamAddress');

    const client = await clientPromise;
    const db = client.db();
    
    let query: any = {};
    if (sponsorAddress) {
      query.sponsorAddress = sponsorAddress;
    }
    if (teamAddress) {
      query.teamAddress = teamAddress;
    }

    const grants = await db.collection('grants')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ grants });
  } catch (error) {
    console.error('Fetch grants error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { grantId, totalFunded } = await request.json();

    if (!grantId) {
      return NextResponse.json(
        { error: 'Grant ID is required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();
    
    const updateData: any = {};
    if (totalFunded !== undefined) {
      updateData.totalFunded = totalFunded;
    }

    const { ObjectId } = require('mongodb');
    const result = await db.collection('grants').updateOne(
      { _id: new ObjectId(grantId) },
      { $inc: { totalFunded: totalFunded } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Grant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: 'Grant updated successfully',
      modified: result.modifiedCount 
    });
  } catch (error) {
    console.error('Update grant error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
