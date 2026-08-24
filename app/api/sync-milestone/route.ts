import { NextRequest, NextResponse } from 'next/server';
import algosdk from 'algosdk';
import clientPromise from '@/lib/mongodb';

const algod = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', '');
const APP_ID = parseInt(process.env.NEXT_PUBLIC_APP_ID || '0');

export async function POST(request: NextRequest) {
  try {
    const { milestoneDbId, milestoneId } = await request.json();

    if (!milestoneDbId || milestoneId === undefined) {
      return NextResponse.json(
        { error: 'Milestone DB ID and milestone ID are required' },
        { status: 400 }
      );
    }

    // Fetch milestone data from blockchain
    const milestoneBoxName = new Uint8Array([
      ...Buffer.from("milestones"),
      ...algosdk.encodeUint64(milestoneId)
    ]);

    console.log('Fetching milestone from blockchain:', {
      milestoneId,
      boxName: Buffer.from(milestoneBoxName).toString('hex')
    });

    const boxResponse = await algod.getApplicationBoxByName(APP_ID, milestoneBoxName).do();
    const value = new Uint8Array(boxResponse.value);

    console.log('Box value (hex):', Array.from(value).map(b => b.toString(16).padStart(2, '0')).join(' '));

    // Decode the tuple (amount, approvals, paid)
    const amount = new DataView(value.buffer, value.byteOffset).getBigUint64(0, false);
    const approvals = new DataView(value.buffer, value.byteOffset).getBigUint64(8, false);
    const paid = new DataView(value.buffer, value.byteOffset).getBigUint64(16, false);

    console.log('Decoded blockchain data:', {
      amount: amount.toString(),
      approvals: approvals.toString(),
      paid: paid.toString()
    });

    const blockchainData = {
      amount: Number(amount),
      approvals: Number(approvals),
      paid: paid === BigInt(1)
    };

    // Update database
    const client = await clientPromise;
    const db = client.db();
    const { ObjectId } = require('mongodb');

    const result = await db.collection('milestones').updateOne(
      { _id: new ObjectId(milestoneDbId) },
      {
        $set: {
          approvals: blockchainData.approvals,
          paid: blockchainData.paid,
          status: blockchainData.paid ? 'paid' : 'pending'
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Milestone not found in database' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Milestone synced successfully',
      blockchainData,
      modified: result.modifiedCount
    });
  } catch (error: any) {
    console.error('Sync milestone error:', error);
    
    if (error.status === 404) {
      return NextResponse.json(
        { error: 'Milestone not found on blockchain' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
