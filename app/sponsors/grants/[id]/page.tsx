'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  Wallet, 
  Users, 
  Target, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  Plus,
  UserPlus,
  Flag,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { initVoter, initMilestone, fundContract } from '@/lib/contractMethods';

export default function GrantDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { peraWallet, accountAddress } = useWallet();
  const [grant, setGrant] = useState<any>(null);
  const [voters, setVoters] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Add voter form
  const [voterAddress, setVoterAddress] = useState('');
  const [voterName, setVoterName] = useState('');
  
  // Add milestone form
  const [milestoneAmount, setMilestoneAmount] = useState('');
  const [milestoneDesc, setMilestoneDesc] = useState('');
  
  // Fund form
  const [fundAmount, setFundAmount] = useState('');

  useEffect(() => {
    fetchGrantDetails();
  }, [params.id]);

  const fetchGrantDetails = async () => {
    try {
      const [grantsRes, votersRes, milestonesRes] = await Promise.all([
        fetch(`/api/grants?_id=${params.id}`),
        fetch(`/api/voters?grantId=${params.id}`),
        fetch(`/api/milestones?grantId=${params.id}`)
      ]);

      const grantsData = await grantsRes.json();
      const votersData = await votersRes.json();
      const milestonesData = await milestonesRes.json();

      if (grantsData.grants && grantsData.grants.length > 0) {
        setGrant(grantsData.grants[0]);
      }
      setVoters(votersData.voters || []);
      setMilestones(milestonesData.milestones || []);
    } catch (err) {
      console.error('Failed to fetch grant details:', err);
    }
  };

  const handleAddVoter = async () => {
    if (!peraWallet || !accountAddress || !voterAddress) return;

    try {
      setLoading(true);
      setError('');

      // Initialize voter on blockchain
      const txid = await initVoter(peraWallet, accountAddress, voterAddress);

      // Store in database
      await fetch('/api/voters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grantId: params.id,
          voterAddress,
          voterName,
        }),
      });

      toast.success(`Voter added! TX: ${txid.slice(0, 8)}...`, {
        duration: 5000,
      });
      setVoterAddress('');
      setVoterName('');
      fetchGrantDetails();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMilestone = async () => {
    if (!peraWallet || !accountAddress || !milestoneAmount) return;

    try {
      setLoading(true);
      setError('');

      const milestoneId = milestones.length;
      const amountInMicroAlgos = parseFloat(milestoneAmount) * 1000000;

      // Initialize milestone on blockchain
      const txid = await initMilestone(
        peraWallet,
        accountAddress,
        milestoneId,
        amountInMicroAlgos
      );

      // Store in database
      await fetch('/api/milestones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grantId: params.id,
          milestoneId,
          amount: parseFloat(milestoneAmount),
          description: milestoneDesc,
        }),
      });

      toast.success(`Milestone created! TX: ${txid.slice(0, 8)}...`, {
        duration: 5000,
      });
      setMilestoneAmount('');
      setMilestoneDesc('');
      fetchGrantDetails();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFundContract = async () => {
    if (!peraWallet || !accountAddress || !fundAmount) return;

    try {
      setLoading(true);
      setError('');

      const amountInMicroAlgos = parseFloat(fundAmount) * 1000000;
      const txid = await fundContract(peraWallet, accountAddress, amountInMicroAlgos);

      // Update the grant's total funded amount in database
      await fetch('/api/grants', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grantId: params.id,
          totalFunded: parseFloat(fundAmount),
        }),
      });

      toast.success(`Contract funded with ${fundAmount} ALGO! TX: ${txid.slice(0, 8)}...`, {
        duration: 5000,
      });
      setFundAmount('');
      fetchGrantDetails();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!grant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading grant details...</p>
        </div>
      </div>
    );
  }

  const completedMilestones = milestones.filter(m => m.paid).length;
  const totalMilestoneValue = milestones.reduce((sum, m) => sum + m.amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 backdrop-blur-sm bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="bg-black text-white w-6 h-6 flex items-center justify-center font-bold text-sm rounded-sm transform -rotate-6">
                  X
                </div>
                <span className="font-semibold text-lg tracking-tight text-black">TrustFundX</span>
              </Link>
              <div className="h-6 w-[1px] bg-gray-300" />
              <Link
                href="/sponsors"
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Live on Algorand Testnet</span>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Grant Management</h1>
          <p className="text-gray-600">Manage voters, milestones, and funding for this grant</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2"
          >
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase">Milestones</span>
            </div>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold text-gray-900">{completedMilestones}</p>
              <p className="text-gray-500 mb-1">/ {milestones.length}</p>
            </div>
            <p className="text-sm text-gray-600 mt-1">Completed</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase">Total Value</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalMilestoneValue}</p>
            <p className="text-sm text-gray-600 mt-1">ALGO</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase">Voters</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{voters.length}</p>
            <p className="text-sm text-gray-600 mt-1">Registered</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase">Required</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{grant.requiredVotes}</p>
            <p className="text-sm text-gray-600 mt-1">Votes needed</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Grant Information Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Grant Information</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500 mb-1 block">Team Address</label>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="font-mono text-sm text-gray-900 break-all">{grant.teamAddress}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 mb-1 block">Status</label>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${grant.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span className="text-sm font-medium capitalize text-gray-900">{grant.status}</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500 mb-1 block">App ID</label>
                  <p className="text-sm font-mono text-gray-900">{grant.appId}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 mb-1 block">Transaction ID</label>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="font-mono text-xs text-gray-900 break-all">{grant.txId}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Fund Contract Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-sm border border-green-200 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Fund Contract</h3>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">Add ALGO tokens to the grant contract to enable milestone payments</p>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Amount (ALGO)</label>
                <input
                  type="number"
                  step="0.1"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                />
              </div>
              
              <button
                onClick={handleFundContract}
                disabled={loading || !fundAmount}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <DollarSign className="w-4 h-4" />
                    <span>Fund Contract</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>

        {/* Add Voter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Manage Voters</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Voter Name</label>
                <input
                  type="text"
                  value={voterName}
                  onChange={(e) => setVoterName(e.target.value)}
                  placeholder="Enter voter name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Wallet Address</label>
                <input
                  type="text"
                  value={voterAddress}
                  onChange={(e) => setVoterAddress(e.target.value)}
                  placeholder="Enter Algorand wallet address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                />
              </div>
              
              <button
                onClick={handleAddVoter}
                disabled={loading || !voterAddress}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Add Voter</span>
                  </>
                )}
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">Registered Voters</h4>
                <span className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">
                  {voters.length} total
                </span>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {voters.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>No voters registered yet</p>
                  </div>
                ) : (
                  voters.map((voter, index) => (
                    <motion.div
                      key={voter._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">{voter.voterName || 'Anonymous Voter'}</p>
                        <p className="text-sm text-gray-600 font-mono truncate">{voter.voterAddress}</p>
                      </div>
                      <div className="ml-4">
                        <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                          <CheckCircle2 className="w-3 h-3" />
                          {voter.status || 'Active'}
                        </span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Add Milestone Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <Flag className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Manage Milestones</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-1 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Amount (ALGO)</label>
                <input
                  type="number"
                  step="0.1"
                  value={milestoneAmount}
                  onChange={(e) => setMilestoneAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Description</label>
                <textarea
                  value={milestoneDesc}
                  onChange={(e) => setMilestoneDesc(e.target.value)}
                  placeholder="Describe this milestone..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  rows={4}
                />
              </div>
              
              <button
                onClick={handleAddMilestone}
                disabled={loading || !milestoneAmount}
                className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Create Milestone</span>
                  </>
                )}
              </button>
            </div>

            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">All Milestones</h4>
                <span className="text-sm bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-medium">
                  {milestones.length} total
                </span>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {milestones.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Target className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>No milestones created yet</p>
                  </div>
                ) : (
                  milestones.map((milestone, index) => (
                    <motion.div
                      key={milestone._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:border-orange-300 transition-all hover:shadow-md"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center justify-center w-6 h-6 bg-orange-600 text-white text-xs font-bold rounded">
                              {milestone.milestoneId}
                            </span>
                            <h5 className="font-semibold text-gray-900">Milestone #{milestone.milestoneId}</h5>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{milestone.description || 'No description provided'}</p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-2xl font-bold text-orange-600">{milestone.amount}</p>
                          <p className="text-xs text-gray-500">ALGO</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-3 border-t border-gray-300">
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-700">{milestone.approvals} approvals</span>
                          </div>
                        </div>
                        <div>
                          {milestone.paid ? (
                            <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                              <CheckCircle2 className="w-3 h-3" />
                              Paid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-medium">
                              <Clock className="w-3 h-3" />
                              Pending
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
