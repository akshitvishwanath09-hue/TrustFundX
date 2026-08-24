import algosdk from "algosdk";
import { algod, APP_ID } from "./algorand";

// Create Grant
export async function createGrant(
  peraWallet: any,
  walletAddress: string,
  teamAddress: string,
  requiredVotes: number,
  milestoneCount: number
) {
  try {
    if (!algosdk.isValidAddress(teamAddress)) {
      throw new Error('Invalid team wallet address. Please provide a valid Algorand address.');
    }

    console.log('Getting transaction params...');
    const params = await algod.getTransactionParams().do();

    const contract = new algosdk.ABIContract({
      name: "GetFund",
      methods: [
        {
          name: "create",
          args: [
            { type: "address", name: "team" },
            { type: "uint64", name: "required_votes" },
            { type: "uint64", name: "milestone_count" }
          ],
          returns: { type: "void" }
        }
      ]
    });

    const method = contract.getMethodByName("create");
    
    const atc = new algosdk.AtomicTransactionComposer();
    atc.addMethodCall({
      appID: APP_ID,
      method: method,
      methodArgs: [teamAddress, requiredVotes, milestoneCount],
      sender: walletAddress,
      suggestedParams: params,
      signer: async (txnGroup: algosdk.Transaction[]) => {
        const txnsToSign = txnGroup.map(txn => ({ txn }));
        const signedTxns = await peraWallet.signTransaction([txnsToSign]);
        return signedTxns;
      }
    });

    console.log('Requesting signature from Pera Wallet...');
    const result = await atc.execute(algod, 4);

    console.log("Grant created with txid:", result.txIDs[0]);
    return result.txIDs[0];
  } catch (error: any) {
    console.error('Grant creation error:', error);
    throw new Error(error.message || 'Failed to create grant');
  }
}

// Initialize Voter
export async function initVoter(
  peraWallet: any,
  sponsorAddress: string,
  voterAddress: string
) {
  try {
    if (!algosdk.isValidAddress(voterAddress)) {
      throw new Error('Invalid voter wallet address.');
    }

    const params = await algod.getTransactionParams().do();

    const contract = new algosdk.ABIContract({
      name: "GetFund",
      methods: [
        {
          name: "init_voter",
          args: [{ type: "address", name: "voter" }],
          returns: { type: "void" }
        }
      ]
    });

    const method = contract.getMethodByName("init_voter");
    
    // The contract uses box storage for voters
    // Box name is "voters" + voter address
    const voterBoxName = new Uint8Array([
      ...Buffer.from("voters"),
      ...algosdk.decodeAddress(voterAddress).publicKey
    ]);
    
    const atc = new algosdk.AtomicTransactionComposer();
    atc.addMethodCall({
      appID: APP_ID,
      method: method,
      methodArgs: [voterAddress],
      sender: sponsorAddress,
      suggestedParams: params,
      // Specify box references for box storage access
      boxes: [
        { appIndex: APP_ID, name: voterBoxName }
      ],
      signer: async (txnGroup: algosdk.Transaction[]) => {
        const txnsToSign = txnGroup.map(txn => ({ txn }));
        const signedTxns = await peraWallet.signTransaction([txnsToSign]);
        return signedTxns;
      }
    });

    const result = await atc.execute(algod, 4);
    return result.txIDs[0];
  } catch (error: any) {
    console.error('Init voter error:', error);
    throw new Error(error.message || 'Failed to initialize voter');
  }
}

// Initialize Milestone
export async function initMilestone(
  peraWallet: any,
  sponsorAddress: string,
  milestoneId: number,
  amount: number
) {
  try {
    const params = await algod.getTransactionParams().do();

    const contract = new algosdk.ABIContract({
      name: "GetFund",
      methods: [
        {
          name: "init_milestone",
          args: [
            { type: "uint64", name: "milestone_id" },
            { type: "uint64", name: "amount" }
          ],
          returns: { type: "void" }
        }
      ]
    });

    const method = contract.getMethodByName("init_milestone");
    
    // Box name is "milestones" + milestone_id (as 8 bytes)
    const milestoneBoxName = new Uint8Array([
      ...Buffer.from("milestones"),
      ...algosdk.encodeUint64(milestoneId)
    ]);
    
    const atc = new algosdk.AtomicTransactionComposer();
    atc.addMethodCall({
      appID: APP_ID,
      method: method,
      methodArgs: [milestoneId, amount],
      sender: sponsorAddress,
      suggestedParams: params,
      boxes: [
        { appIndex: APP_ID, name: milestoneBoxName }
      ],
      signer: async (txnGroup: algosdk.Transaction[]) => {
        const txnsToSign = txnGroup.map(txn => ({ txn }));
        const signedTxns = await peraWallet.signTransaction([txnsToSign]);
        return signedTxns;
      }
    });

    const result = await atc.execute(algod, 4);
    return result.txIDs[0];
  } catch (error: any) {
    console.error('Init milestone error:', error);
    throw new Error(error.message || 'Failed to initialize milestone');
  }
}

// Approve Milestone (Voter)
export async function approveMilestone(
  peraWallet: any,
  voterAddress: string,
  milestoneId: number,
  teamAddress: string // Pass team address from the grant data
) {
  try {
    const params = await algod.getTransactionParams().do();
    
    // Increase fee to cover inner transaction (payment to team)
    // App call fee (1000) + inner payment fee (1000) = 2000 microAlgos
    params.fee = BigInt(2000);
    params.flatFee = true;

    const contract = new algosdk.ABIContract({
      name: "GetFund",
      methods: [
        {
          name: "approve",
          args: [{ type: "uint64", name: "milestone_id" }],
          returns: { type: "void" }
        }
      ]
    });

    const method = contract.getMethodByName("approve");
    
    // The approve method accesses multiple boxes
    const voterBoxName = new Uint8Array([
      ...Buffer.from("voters"),
      ...algosdk.decodeAddress(voterAddress).publicKey
    ]);
    
    const milestoneBoxName = new Uint8Array([
      ...Buffer.from("milestones"),
      ...algosdk.encodeUint64(milestoneId)
    ]);
    
    // votes box key is "votes" + ARC4 encoded milestone_id (8 bytes) + voter address (32 bytes)
    const votesBoxName = new Uint8Array([
      ...Buffer.from("votes"),
      ...algosdk.encodeUint64(milestoneId),
      ...algosdk.decodeAddress(voterAddress).publicKey
    ]);
    
    const atc = new algosdk.AtomicTransactionComposer();
    
    console.log('Team address for payment:', teamAddress);
    
    // Add method call with all box references and accounts
    atc.addMethodCall({
      appID: APP_ID,
      method: method,
      methodArgs: [milestoneId],
      sender: voterAddress,
      suggestedParams: params,
      boxes: [
        { appIndex: APP_ID, name: voterBoxName },
        { appIndex: APP_ID, name: milestoneBoxName },
        { appIndex: APP_ID, name: votesBoxName }
      ],
      appAccounts: [teamAddress], // Include team address for payment
      signer: async (txnGroup: algosdk.Transaction[]) => {
        const txnsToSign = txnGroup.map(txn => ({ txn }));
        const signedTxns = await peraWallet.signTransaction([txnsToSign]);
        return signedTxns;
      }
    });

    const result = await atc.execute(algod, 4);
    return result.txIDs[0];
  } catch (error: any) {
    console.error('Approve milestone error:', error);
    
    // Provide helpful error messages
    if (error.message?.includes('below min')) {
      throw new Error(
        'Insufficient ALGO balance. You need more ALGO to cover the minimum balance requirement. ' +
        'Get testnet ALGO from: https://bank.testnet.algorand.network/'
      );
    }
    
    if (error.message?.includes('Already voted')) {
      throw new Error('You have already voted on this milestone');
    }
    
    if (error.message?.includes('logic eval error')) {
      throw new Error(
        'Smart contract error. Please check that the milestone is initialized and not already paid.'
      );
    }
    
    throw new Error(error.message || 'Failed to approve milestone');
  }
}

// Fund Contract (Sponsor)
export async function fundContract(
  peraWallet: any,
  sponsorAddress: string,
  amount: number
) {
  try {
    // Simply send a payment to the app address
    // The contract will receive it
    const params = await algod.getTransactionParams().do();

    const paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      sender: sponsorAddress,
      receiver: algosdk.getApplicationAddress(APP_ID),
      amount: amount,
      suggestedParams: params,
    });

    // Sign and send
    const txnsToSign = [{ txn: paymentTxn }];
    const signedTxns = await peraWallet.signTransaction([txnsToSign]);
    
    const { txid } = await algod.sendRawTransaction(signedTxns).do();
    await algosdk.waitForConfirmation(algod, txid, 4);
    
    return txid;
  } catch (error: any) {
    console.error('Fund contract error:', error);
    throw new Error(error.message || 'Failed to fund contract');
  }
}