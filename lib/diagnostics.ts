import algosdk from "algosdk";
import { algod, APP_ID } from "./algorand";

// Check if a vote exists for a voter on a milestone
export async function checkVoteExists(
  voterAddress: string,
  milestoneId: number
): Promise<boolean> {
  try {
    const votesBoxName = new Uint8Array([
      ...Buffer.from("votes"),
      ...algosdk.encodeUint64(milestoneId),
      ...algosdk.decodeAddress(voterAddress).publicKey
    ]);

    const boxResponse = await algod.getApplicationBoxByName(APP_ID, votesBoxName).do();
    return true;
  } catch (error: any) {
    if (error.status === 404) {
      return false;
    }
    console.error('Error checking vote:', error);
    throw error;
  }
}

// Check if voter is registered
export async function checkVoterRegistered(voterAddress: string): Promise<boolean> {
  try {
    const voterBoxName = new Uint8Array([
      ...Buffer.from("voters"),
      ...algosdk.decodeAddress(voterAddress).publicKey
    ]);

    const boxResponse = await algod.getApplicationBoxByName(APP_ID, voterBoxName).do();
    return true;
  } catch (error: any) {
    if (error.status === 404) {
      console.log('Voter is NOT registered');
      return false;
    }
    console.error('Error checking voter:', error);
    throw error;
  }
}

// Check if milestone exists
export async function checkMilestoneExists(milestoneId: number): Promise<boolean> {
  try {
    const milestoneBoxName = new Uint8Array([
      ...Buffer.from("milestones"),
      ...algosdk.encodeUint64(milestoneId)
    ]);

    const boxResponse = await algod.getApplicationBoxByName(APP_ID, milestoneBoxName).do();
    return true;
  } catch (error: any) {
    if (error.status === 404) {
      console.log('Milestone does NOT exist');
      return false;
    }
    console.error('Error checking milestone:', error);
    throw error;
  }
}
