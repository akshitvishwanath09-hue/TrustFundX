from algopy import ARC4Contract, arc4, GlobalState, BoxMap, UInt64, Account, Txn
from algopy.itxn import Payment

class GetFund(ARC4Contract):
    # -------------------------
    # Global State
    # -------------------------
    def __init__(self) -> None:
        self.sponsor = GlobalState(Account)
        self.team = GlobalState(Account)
        self.required_votes = GlobalState(UInt64)
        self.milestone_count = GlobalState(UInt64)
        
        # milestone_id -> (amount, approvals, paid)
        self.milestones = BoxMap(UInt64, arc4.Tuple[UInt64, UInt64, UInt64])
        
        # (milestone_id, voter) -> bool
        self.votes = BoxMap(arc4.Tuple[arc4.UInt64, arc4.Address], arc4.UInt64)
        
        # voter registry
        self.voters = BoxMap(Account, arc4.UInt64)

    # -------------------------
    # Create
    # -------------------------
    @arc4.abimethod
    def create(
        self,
        team: Account,
        required_votes: arc4.UInt64,
        milestone_count: arc4.UInt64,
    ) -> None:
        self.sponsor.value = Txn.sender
        self.team.value = team
        self.required_votes.value = required_votes.native
        self.milestone_count.value = milestone_count.native

    # -------------------------
    # Register Voter
    # -------------------------
    @arc4.abimethod
    def init_voter(self, voter: Account) -> None:
        assert Txn.sender == self.sponsor.value
        self.voters[voter] = arc4.UInt64(1)

    # -------------------------
    # Initialize Milestone
    # -------------------------
    @arc4.abimethod
    def init_milestone(
        self,
        milestone_id: arc4.UInt64,
        amount: arc4.UInt64,
    ) -> None:
        assert Txn.sender == self.sponsor.value
        
        # (amount, approvals, paid)
        self.milestones[milestone_id.native] = arc4.Tuple((
            amount.native,
            UInt64(0),
            UInt64(0),
        ))

    # -------------------------
    # Approve Milestone
    # -------------------------
    @arc4.abimethod
    def approve(self, milestone_id: arc4.UInt64) -> None:
        # must be registered voter
        assert self.voters[Txn.sender] == arc4.UInt64(1)
        
        # FIXED: Use direct box access instead of .maybe() to avoid compiler bug
        # Check if vote already exists by trying to read it
        vote_key = arc4.Tuple((milestone_id, arc4.Address(Txn.sender)))
        
        # The vote box should not exist yet (prevent double voting)
        # We'll let it fail naturally if the box already exists when we try to create it
        # Or we can use a different approach: check the value
        existing_vote = self.votes.get(vote_key, default=arc4.UInt64(0))
        assert existing_vote == arc4.UInt64(0), "Already voted"
        
        milestone_data = self.milestones[milestone_id.native]
        amount = milestone_data[0]
        approvals = milestone_data[1]
        paid = milestone_data[2]
        
        assert paid == UInt64(0)
        
        approvals = approvals + UInt64(1)
        
        self.votes[vote_key] = arc4.UInt64(1)
        
        if approvals >= self.required_votes.value:
            Payment(
                receiver=self.team.value,
                amount=amount,
            ).submit()
            
            self.milestones[milestone_id.native] = arc4.Tuple((
                amount,
                approvals,
                UInt64(1),
            ))
        else:
            self.milestones[milestone_id.native] = arc4.Tuple((
                amount,
                approvals,
                UInt64(0),
            ))

    # -------------------------
    # Fund Contract
    # -------------------------
    @arc4.abimethod
    def fund(self) -> None:
        # must be sponsor
        assert Txn.sender == self.sponsor.value
        
        # must send positive payment amount
        assert Txn.amount > UInt64(0)
