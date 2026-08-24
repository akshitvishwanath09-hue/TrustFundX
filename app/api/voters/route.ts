import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { grantId, voterAddress, voterName } = await request.json();

    if (!grantId || !voterAddress) {
      return NextResponse.json(
        { error: 'Grant ID and voter address are required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();
    
    const result = await db.collection('voters').insertOne({
      grantId,
      voterAddress,
      voterName,
      status: 'active',
      createdAt: new Date(),
    });

    return NextResponse.json(
      { message: 'Voter added successfully', voterId: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Add voter error:', error);
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
    const voterAddress = searchParams.get('voterAddress');

    const client = await clientPromise;
    const db = client.db();
    
    const query: any = {};
    if (grantId) query.grantId = grantId;
    if (voterAddress) query.voterAddress = voterAddress;
    
    const voters = await db.collection('voters')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ voters });
  } catch (error) {
    console.error('Fetch voters error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}