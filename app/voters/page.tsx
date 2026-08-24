'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWallet } from '@/contexts/WalletContext';
import { approveMilestone } from '@/lib/contractMethods';
import { checkVoteExists, checkVoterRegistered, checkMilestoneExists } from '@/lib/diagnostics';
import { syncMilestoneFromBlockchain } from '@/lib/syncBlockchain';
import toast from 'react-hot-toast';
import {
  CheckCircle,
  Clock,
  Users as UserGroupIcon,
  FileText as DocumentTextIcon,
  RefreshCw as ArrowPathIcon,
  XCircle as XCircleIcon,
  ChevronRight as ChevronRightIcon
} from 'lucide-react';

export default function VoterDashboard() {
  const router = useRouter();
  const { peraWallet, accountAddress, disconnectWallet } = useWallet();
  const [user, setUser] = useState<any>(null);
  const [grants, setGrants] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'voter') {
      router.push('/login');
      return;
    }

    setUser(parsedUser);
  }, [router]);

  useEffect(() => {
    if (user && accountAddress) {
      fetchVoterData();
    }
  }, [user, accountAddress]);

  const fetchVoterData = async () => {
    if (!accountAddress) return;

    try {
      const votersRes = await fetch(`/api/voters?voterAddress=${accountAddress}`);
      const votersData = await votersRes.json();

      if (votersData.voters && votersData.voters.length > 0) {
        const grantIds: string[] = Array.from(new Set(votersData.voters.map((v: any) => v.grantId as string)));

        const grantsPromises = grantIds.map((id: string) =>
          fetch(`/api/grants?_id=${id}`).then(r => r.json())
        );
        const grantsResults = await Promise.all(grantsPromises);
        const fetchedGrants = grantsResults.map(r => r.grants[0]).filter(Boolean);
        setGrants(fetchedGrants);

        const milestonesPromises = grantIds.map((id: string) =>
          fetch(`/api/milestones?grantId=${id}`).then(r => r.json())
        );
        const milestonesResults = await Promise.all(milestonesPromises);
        const allMilestones = milestonesResults.flatMap(r => r.milestones || []);

        const uniqueMilestones = allMilestones.filter((milestone, index, self) =>
          index === self.findIndex((m) => m._id === milestone._id)
        );

        const milestonesWithVoteStatus = await Promise.all(
          uniqueMilestones.map(async (milestone) => {
            const hasVoted = await checkVoteExists(accountAddress, milestone.milestoneId);
            // Check if voter is registered on blockchain for this milestone's grant
            const isRegisteredOnChain = await checkVoterRegistered(accountAddress);
            return {
              ...milestone,
              hasVoted,
              isRegisteredOnChain
            };
          })
        );

        // Only show milestones where the voter is registered on the blockchain
        const filteredMilestones = milestonesWithVoteStatus.filter(m => m.isRegisteredOnChain);
        setMilestones(filteredMilestones);

        // Check if there are milestones filtered out due to blockchain registration
        const filteredOutCount = milestonesWithVoteStatus.length - filteredMilestones.length;
        if (filteredOutCount > 0) {
          console.warn(
            `${filteredOutCount} milestone(s) hidden because you're not registered on the blockchain. ` +
            `The sponsor needs to register your wallet address on the smart contract.`
          );
        }
      }
    } catch (err) {
      console.error('Failed to fetch voter data:', err);
    }
  };

  const handleApprove = async (milestone: any) => {
    if (!peraWallet || !accountAddress) return;

    try {
      setLoading(milestone._id);
      setError('');

      const isVoterRegistered = await checkVoterRegistered(accountAddress);
      if (!isVoterRegistered) {
        throw new Error(
          'You are not registered as a voter for this grant. ' +
          'Please ask the sponsor to register your wallet address: ' +
          accountAddress
        );
      }

      const milestoneExists = await checkMilestoneExists(milestone.milestoneId);
      if (!milestoneExists) {
        throw new Error('Milestone does not exist on the blockchain');
      }

      const alreadyVoted = await checkVoteExists(accountAddress, milestone.milestoneId);
      if (alreadyVoted) {
        throw new Error('You have already voted on this milestone');
      }

      const grant = grants.find(g => g._id === milestone.grantId);
      if (!grant) {
        throw new Error('Grant not found');
      }

      const txid = await approveMilestone(
        peraWallet,
        accountAddress,
        milestone.milestoneId,
        grant.teamAddress
      );

      console.log('Blockchain approval successful:', txid);

      const synced = await syncMilestoneFromBlockchain(
        milestone._id,
        milestone.milestoneId
      );

      if (!synced) {
        console.warn('Failed to sync milestone data from blockchain');
      }

      toast.success(`Milestone approved! TX: ${txid.slice(0, 8)}...`, {
        duration: 5000,
      });
      await fetchVoterData();
    } catch (err: any) {
      console.error('Approval error:', err);
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  const handleSyncMilestone = async (milestone: any) => {
    try {
      setLoading(milestone._id);
      setError('');

      const synced = await syncMilestoneFromBlockchain(
        milestone._id,
        milestone.milestoneId
      );

      if (synced) {
        toast.success('Milestone synced successfully!');
        await fetchVoterData();
      } else {
        throw new Error('Failed to sync milestone');
      }
    } catch (err: any) {
      console.error('Sync error:', err);
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  const handleLogout = () => {
    disconnectWallet();
    localStorage.removeItem('user');
    router.push('/login');
  };

  const openMilestoneDetails = (milestoneDbId: string) => {
    router.push(`/milestone/${milestoneDbId}`);
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-pulse bg-gray-200 rounded-xl h-12 w-12"></div>
    </div>
  );

  const pendingMilestones = milestones.filter(m => !m.paid && !m.hasVoted);
  const totalVotesCast = milestones.filter(m => m.hasVoted).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center gap-2 mr-4">
                <div className="bg-black text-white w-6 h-6 flex items-center justify-center font-bold text-sm rounded-sm transform -rotate-6">
                  X
                </div>
                <span className="font-semibold text-lg tracking-tight text-black">TrustFundX</span>
              </Link>
              <div className="h-6 w-[1px] bg-gray-300" />
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center shadow-sm ml-3">
                <UserGroupIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Voter Dashboard
                </h1>
                <p className="text-sm text-gray-500">Review and approve milestones</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 shadow-sm transition-all duration-200 flex items-center space-x-2 text-sm"
            >
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3 shadow-sm">
            <XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-900 text-sm mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          {/* Profile Section - Left Side */}
          <div className="flex-1 bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
            <div className="flex items-start space-x-6 mb-8">
              <div className="w-20 h-20 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-100 ring-4 ring-green-50">
                <UserGroupIcon className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-1">Hello, {user.name}!</h2>
                <p className="text-green-600 font-semibold tracking-wide text-sm uppercase">Voter Dashboard</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-100">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Address</p>
                <p className="text-gray-900 font-medium">{user.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Organization</p>
                <p className="text-gray-900 font-medium">{user.organization}</p>
              </div>
              <div className="md:col-span-2 space-y-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Wallet Address</p>
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center justify-between group">
                  <div className="flex items-center space-x-3">
                    <div className="w-2.5 h-2.5 bg-green-600 rounded-full animate-pulse"></div>
                    <span className="text-sm font-mono text-emerald-900 font-medium truncate max-w-[200px] md:max-w-none">
                      {user.walletAddress}
                    </span>
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(user.walletAddress || '');
                      toast.success('Address copied to clipboard!');
                    }}
                    className="text-emerald-400 hover:text-green-600 transition-colors p-1 flex-shrink-0"
                    title="Copy Address"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section - Right Side Stacked */}
          <div className="w-full lg:w-80 flex flex-col gap-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-l-blue-500 min-h-[110px] flex flex-col justify-center">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Pending Actions</p>
                  <p className="text-3xl font-bold text-gray-900">{pendingMilestones.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-medium">Awaiting review</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-l-green-500 min-h-[110px] flex flex-col justify-center">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Votes Submitted</p>
                  <p className="text-3xl font-bold text-gray-900">{totalVotesCast}</p>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-medium">Total approvals cast</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-l-purple-500 min-h-[110px] flex flex-col justify-center">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Active Grants</p>
                  <p className="text-3xl font-bold text-gray-900">{grants.length}</p>
                </div>
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                  <UserGroupIcon className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-medium">Projects you're reviewing</p>
            </div>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Pending Approvals</h3>
              {pendingMilestones.length > 0 && (
                <div className="ml-auto px-2.5 py-0.5 bg-white text-gray-600 text-xs font-medium rounded-full border border-gray-200">
                  {pendingMilestones.length} waiting
                </div>
              )}
            </div>
          </div>

          <div className="p-6">
            {pendingMilestones.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <Clock className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Nothing to review</h4>
                <p className="text-sm text-gray-500 max-w-sm mx-auto">
                  All milestones are either approved or awaiting other voters. You'll be notified when new submissions arrive.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingMilestones.map((milestone) => {
                  const grant = grants.find(g => g._id === milestone.grantId);
                  return (
                    <div
                      key={milestone._id}
                      className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => openMilestoneDetails(milestone._id)}
                    >
                      <div className="flex items-start justify-between mb-5">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="text-base font-semibold text-gray-900">Milestone #{milestone.milestoneId}</h4>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{milestone.description}</p>
                          {grant && (
                            <div className="flex items-center space-x-2 text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-md w-fit border border-gray-100">
                              <span>Grant #{grant._id.slice(-6)}</span>
                              <span>•</span>
                              <span className="font-mono">{grant.teamAddress.slice(0, 8)}...{grant.teamAddress.slice(-6)}</span>
                            </div>
                          )}
                        </div>
                        <div className="text-right flex flex-col items-end space-y-1">
                          <div className="text-xl font-bold text-green-600">
                            {milestone.amount} ALGO
                          </div>
                          <div className="flex items-center space-x-1 text-xs text-gray-500 mt-2">
                            <span>Progress:</span>
                            <div className="w-16 bg-gray-200 rounded-full h-1.5 ml-1">
                              <div
                                className="bg-blue-600 h-1.5 rounded-full"
                                style={{ width: `${Math.min((milestone.approvals || 0) / (grant?.requiredVotes || 1) * 100, 100)}%` }}
                              />
                            </div>
                            <span className="font-semibold text-gray-700 ml-1">{milestone.approvals || 0}</span>
                            {grant && <span>/ {grant.requiredVotes}</span>}
                          </div>
                        </div>
                      </div>

                      {/* Team Submission */}
                      {(milestone.submissionNote || milestone.submissionFileUrl) && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-5">
                          <div className="flex items-center space-x-2 mb-3">
                            <DocumentTextIcon className="w-4 h-4 text-gray-600" />
                            <h5 className="font-medium text-gray-900 text-sm">Team Submission</h5>
                          </div>
                          {milestone.submissionNote && (
                            <div className="mb-3">
                              <div className="flex items-center gap-1.5 mb-1 text-xs font-medium text-gray-600">
                                <DocumentTextIcon className="w-3.5 h-3.5" />
                                <p>Notes</p>
                              </div>
                              <p className="text-sm text-gray-800">{milestone.submissionNote}</p>
                            </div>
                          )}
                          {milestone.submissionFileUrl && (
                            <div className="mb-3">
                              <div className="flex items-center gap-1.5 mb-1 text-xs font-medium text-gray-600">
                                <DocumentTextIcon className="w-3.5 h-3.5" />
                                <p>Documentation</p>
                              </div>
                              <a
                                href={milestone.submissionFileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center px-3 py-1.5 bg-white border border-gray-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                <DocumentTextIcon className="w-4 h-4 mr-2 text-gray-400" />
                                View PDF
                              </a>
                            </div>
                          )}
                          {milestone.submittedAt && (
                            <p className="text-xs text-gray-500 mt-2">
                              Submitted {new Date(milestone.submittedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100">
                        <div className="text-xs text-gray-500">
                          Your vote releases funds to the team.
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSyncMilestone(milestone);
                            }}
                            disabled={loading === milestone._id}
                            className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ArrowPathIcon className="w-4 h-4 text-gray-500" />
                            <span>Sync</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApprove(milestone);
                            }}
                            disabled={loading === milestone._id}
                            className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-5 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                          >
                            {loading === milestone._id ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Processing</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4" />
                                <span>Approve</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity - Approved Milestones */}
        {milestones.filter(m => m.hasVoted).length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Your Recent Approvals</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {milestones.filter(m => m.hasVoted).slice(0, 6).map((milestone) => {
                const grant = grants.find(g => g._id === milestone.grantId);
                return (
                  <div
                    key={milestone._id}
                    className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow cursor-pointer"
                    onClick={() => openMilestoneDetails(milestone._id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="space-y-1">
                        <h4 className="font-medium text-sm text-gray-900">
                          M#{milestone.milestoneId}
                        </h4>
                        <div className="flex items-center space-x-1.5 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-md w-fit border border-green-100">
                          <CheckCircle className="w-3 h-3" />
                          <span>Recorded</span>
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-green-600">
                        {milestone.amount} ALGO
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-gray-600 line-clamp-2">{milestone.description}</p>
                      {grant && (
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-2">
                          <span className="text-xs text-gray-500">Grant #{grant._id.slice(-6)}</span>
                          <span className={`flex items-center gap-1 text-xs font-medium ${milestone.paid ? 'text-green-600' : 'text-yellow-600'}`}>
                            {milestone.paid ? (
                              <><CheckCircle className="w-3.5 h-3.5" />Paid</>
                            ) : (
                              <><Clock className="w-3.5 h-3.5" />Awaiting votes</>
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}