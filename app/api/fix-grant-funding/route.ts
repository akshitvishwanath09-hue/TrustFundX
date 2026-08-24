import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// One-time script to fix existing grant funding amounts
export async function POST(request: NextRequest) {
  try {
    const { grantId, fundedAmount } = await request.json();

    if (!grantId || !fundedAmount) {
      return NextResponse.json(
        { error: 'Grant ID and funded amount are required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();
    
    const { ObjectId } = require('mongodb');
    
    // Update the grant with the correct totalFunded amount
    const result = await db.collection('grants').updateOne(
      { _id: new ObjectId(grantId) },
      { $set: { totalFunded: fundedAmount } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Grant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: `Grant updated successfully with ${fundedAmount} ALGO`,
      modified: result.modifiedCount 
    });
  } catch (error) {
    console.error('Fix grant funding error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
