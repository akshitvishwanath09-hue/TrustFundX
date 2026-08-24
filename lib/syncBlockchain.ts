import algosdk from "algosdk";
import { algod, APP_ID } from "./algorand";

// Get milestone data from blockchain
export async function getMilestoneFromBlockchain(milestoneId: number) {
  try {
    const milestoneBoxName = new Uint8Array([
      ...Buffer.from("milestones"),
      ...algosdk.encodeUint64(milestoneId)
    ]);

    console.log('Fetching milestone box:', {
      milestoneId,
      boxName: Buffer.from(milestoneBoxName).toString('hex')
    });

    const boxResponse = await algod.getApplicationBoxByName(APP_ID, milestoneBoxName).do();
    const value = new Uint8Array(boxResponse.value);

    console.log('Box value (hex):', Array.from(value).map(b => b.toString(16).padStart(2, '0')).join(' '));
    console.log('Box value length:', value.length);

    // Decode the tuple (amount, approvals, paid)
    // Each uint64 is 8 bytes
    const amount = new DataView(value.buffer, value.byteOffset).getBigUint64(0, false);
    const approvals = new DataView(value.buffer, value.byteOffset).getBigUint64(8, false);
    const paid = new DataView(value.buffer, value.byteOffset).getBigUint64(16, false);

    console.log('Decoded values:', {
      amount: amount.toString(),
      approvals: approvals.toString(),
      paid: paid.toString()
    });

    return {
      amount: Number(amount),
      approvals: Number(approvals),
      paid: paid === BigInt(1)
    };
  } catch (error: any) {
    if (error.status === 404) {
      console.error('Milestone box not found on blockchain');
      return null;
    }
    console.error('Error fetching milestone from blockchain:', error);
    throw error;
  }
}

// Sync milestone data from blockchain to database (via API)
export async function syncMilestoneFromBlockchain(
  milestoneDbId: string,
  milestoneId: number
) {
  try {
    console.log('Syncing milestone:', { milestoneDbId, milestoneId });

    const response = await fetch('/api/sync-milestone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        milestoneDbId,
        milestoneId
      }),
    });

    const result = await response.json();
    console.log('Sync result:', result);

    if (!response.ok) {
      console.error('Sync failed:', result);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error syncing milestone:', error);
    return false;
  }
}
