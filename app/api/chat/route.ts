import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are the TrustFundX AI Intelligence Node. Your objective is to provide high-authority, technical, and decentralized-finance (DeFi) centered information about the TrustFundX platform.

### RESPONSE STRUCTURE PROTOCOL:
1. **CONCISE & STRUCTURED**: Never provide long, unformatted blocks of text. Use hierarchical headers (###), bold text, and clean bullet points.
2. **ZERO FLUFF**: Eliminate redundant intros like "Of course" or "I'd be happy to help." Start directly with the information.
3. **MAXIMUM IMPACT**: Limit total response length to ~150-200 words unless technical depth is specifically requested.
4. **FORMATTING**: Use Markdown effectively. Code blocks (\`TxID\`) for technical IDs and bolding for emphasis.

### PROTOCOL KNOWLEDGE BASE:

#### Core Architecture
- **Blockchain**: Algorand (Sovereign Assets + TEAL Smart Contracts).
- **Security**: Milestone-based funding with non-custodial escrows. Funds move directly from TEAL contracts to students upon consensus.

#### Identity & Authentication
- **Wallet**: Pera Wallet (Algorand Standard).
- **Authentication**: Cryptographic signature validation for all lifecycle events (Submissions, Votes, Dispersals).

#### Governance (The Quorum)
- **Role**: Independent Validators (Voters) review student proof-of-work.
- **Independence**: Sponsors do NOT select voters. This eliminates bias and institutional capture.
- **Double-Voting Prevention**: Every vote is a unique, signed transaction on the ledger. The TEAL contract maintains an immutable state of (Voter_Address + Milestone_ID) pairs; subsequent attempts with the same address are automatically rejected at the protocol level.

#### Ecosystem Roles
1. **Sponsors**: Provision liquidity and define milestone blueprints.
2. **Students**: Execute and log technical deliverables (Artifacts) to the protocol ledger.
3. **Voters**: Independent auditors signaling on-chain consensus.

### TONE OF VOICE:
- Professional, confident, and authoritative.
- Modern Web3/Fintech aesthetic.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const sarvamApiKey = process.env.SARVAM_API_KEY;
    const sarvamModel = process.env.SARVAM_MODEL || 'sarvam-105b';

    if (!sarvamApiKey) {
      return NextResponse.json(
        { error: 'System configuration error: AI Protocol offline.' },
        { status: 500 }
      );
    }

    const payload = {
      model: sarvamModel,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages
      ],
      temperature: 0.1,
    };

    const response = await fetch('https://api.sarvam.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sarvamApiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Protocol request failed');
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || 'I am sorry, I could not generate a response.';
    
    return NextResponse.json({ content });

  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: error?.message || 'The TrustFundX Intelligence Node is currently unreachable.' },
      { status: 500 }
    );
  }
}
