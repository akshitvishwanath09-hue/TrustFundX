'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWallet } from '@/contexts/WalletContext';
import { createGrant } from '@/lib/contractMethods';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  ChevronRight,
  Plus,
  Wallet,
  Building2,
  User,
  CircleDollarSign,
  CheckCircle,
  Clock,
  Activity,
  Target,
  TrendingUp,
  AlertCircle,
  Loader2,
  Copy,
  ExternalLink
} from 'lucide-react';

export default function SponsorDashboard() {
  const router = useRouter();
  const { peraWallet, accountAddress, disconnectWallet } = useWallet();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [teamAddress, setTeamAddress] = useState('');
  const [requiredVotes, setRequiredVotes] = useState(2);
  const [milestoneCount, setMilestoneCount] = useState(3);
  const [grants, setGrants] = useState<any[]>([]);
  const [totalInvested, setTotalInvested] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'sponsor') {
      router.push('/login');
      return;
    }

    setUser(parsedUser);
  }, [router]);

  const handleLogout = () => {
    disconnectWallet();
    localStorage.removeItem('user');
    router.push('/login');
  };

  const handleInit = async () => {
    if (!peraWallet || !accountAddress) {
      setError('Please connect your wallet first');
      return;
    }

    if (!teamAddress.trim()) {
      setError('Please enter a team wallet address');
      return;
    }

    console.log('Pera Wallet instance:', peraWallet);
    console.log('Connected account:', accountAddress);
    console.log('Team address:', teamAddress);
    console.log('Required votes:', requiredVotes);
    console.log('Milestone count:', milestoneCount);

    try {
      setLoading(true);
      setError('');

      const txid = await createGrant(
        peraWallet,
        accountAddress,
        teamAddress,
        requiredVotes,
        milestoneCount
      );

      const response = await fetch('/api/grants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sponsorAddress: accountAddress,
          teamAddress,
          requiredVotes,
          milestoneCount,
          appId: parseInt(process.env.NEXT_PUBLIC_APP_ID || '0'),
          txId: txid,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to store grant in database');
      }

      toast.success(`Grant created successfully! TX: ${txid.slice(0, 8)}...`, {
        duration: 5000,
      });
      setTeamAddress('');
      setShowCreateForm(false);
      fetchGrants();
    } catch (err: any) {
      console.error('Grant creation error:', err);
      setError(err.message || 'Failed to create grant');
    } finally {
      setLoading(false);
    }
  };

  const fetchGrants = useCallback(async () => {
    if (!accountAddress) return;

    try {
      const response = await fetch(`/api/grants?sponsorAddress=${accountAddress}`);
      const data = await response.json();
      const fetchedGrants = data.grants || [];
      setGrants(fetchedGrants);

      let totalFundedAmount = 0;
      let totalPaidAmount = 0;

      for (const grant of fetchedGrants) {
        totalFundedAmount += grant.totalFunded || 0;

        const milestonesResponse = await fetch(`/api/milestones?grantId=${grant._id}`);
        const milestonesData = await milestonesResponse.json();
        const milestones = milestonesData.milestones || [];

        console.log('Grant ID:', grant._id);
        console.log('Total Funded for this grant:', grant.totalFunded);
        console.log('Milestones:', milestones);

        milestones.forEach((milestone: any) => {
          console.log('Milestone:', milestone.milestoneId, 'Amount:', milestone.amount, 'Paid:', milestone.paid);
          if (milestone.paid) {
            totalPaidAmount += milestone.amount;
          }
        });
      }

      console.log('Total Funded:', totalFundedAmount);
      console.log('Total Paid:', totalPaidAmount);

      setTotalInvested(totalFundedAmount);
      setTotalPaid(totalPaidAmount);
    } catch (err) {
      console.error('Failed to fetch grants:', err);
    }
  }, [accountAddress]);

  useEffect(() => {
    if (user && accountAddress) {
      fetchGrants();
    }
  }, [user, accountAddress, fetchGrants]);

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-10 h-10 border-4 border-black/10 border-t-black rounded-full"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-background selection:bg-primary/10">
      {/* Premium Header */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/70 backdrop-blur-xl border-b border-border px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-3">
              <div className="bg-black text-white w-8 h-8 flex items-center justify-center font-bold text-lg rounded-xl shadow-lg transition-transform hover:rotate-6">X</div>
              <span className="font-bold text-xl tracking-tighter">TrustFundX</span>
            </Link>
            <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-primary/5 rounded-full border border-primary/10">
              <Activity size={16} className="text-primary" strokeWidth={2.5} />
              <span className="text-[11px] font-black uppercase tracking-widest text-primary">Sponsor Console</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-text-secondary bg-background px-4 py-2 rounded-full border border-border">
              <User size={14} />
              <span>{user.name.split(' ')[0]}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-text-primary text-white text-xs font-black px-6 py-2.5 rounded-full hover:bg-black transition-all shadow-lg hover:-translate-y-0.5 uppercase tracking-widest"
            >
              Disconnect
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8 space-y-8">
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          {/* Profile Section - Left Side */}
          <div className="flex-1 bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
            <div className="flex items-start space-x-6 mb-8">
              <div className="w-20 h-20 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100 ring-4 ring-blue-50">
                <Building2 className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-1">Welcome back, {user.name}!</h2>
                <p className="text-blue-600 font-semibold tracking-wide text-sm uppercase">Sponsor Dashboard</p>
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
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center justify-between group">
                  <div className="flex items-center space-x-3">
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-mono text-slate-600 font-medium">
                      {user.walletAddress}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(user.walletAddress);
                      toast.success('Address copied to clipboard!');
                    }}
                    className="text-slate-400 hover:text-blue-600 transition-colors p-1"
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
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Funded Projects</p>
                  <p className="text-3xl font-bold text-gray-900">{grants.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Plus className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-medium">Total projects sponsored</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-l-emerald-500 min-h-[110px] flex flex-col justify-center">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Invested</p>
                  <p className="text-3xl font-bold text-gray-900">{totalInvested.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <CircleDollarSign className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-medium">Recorded ALGO</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-l-indigo-500 min-h-[110px] flex flex-col justify-center">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Paid</p>
                  <p className="text-3xl font-bold text-gray-900">{totalPaid.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-medium">Released to teams</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-l-orange-400 min-h-[110px] flex flex-col justify-center">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Active Grants</p>
                  <p className="text-3xl font-bold text-gray-900">{grants.filter(g => g.status === 'active').length}</p>
                </div>
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-500" />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-medium">Ongoing projects</p>
            </div>
          </div>
        </div>

        {/* Grants Section */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-3">
                <span>Grant Management</span>
                <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                  {grants.length}
                </span>
              </h3>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                <span>{showCreateForm ? 'Cancel' : 'Create Grant'}</span>
              </button>
            </div>
          </div>

          {/* Create Grant Form */}
          {showCreateForm && (
            <div className="p-6 bg-gray-50 border-b border-gray-200">
              <div className="max-w-2xl space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-2xl flex items-start space-x-3">
                    <div className="w-5 h-5 bg-red-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="font-medium">{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-900">Team Wallet Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Wallet className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={teamAddress}
                        onChange={(e) => setTeamAddress(e.target.value)}
                        placeholder="Enter Algorand wallet address"
                        className="w-full pl-9 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all duration-200"
                      />
                    </div>
                    <p className="text-xs text-slate-500">Enter a valid Algorand address (58 characters)</p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-900">Required Votes</label>
                    <input
                      type="number"
                      min="1"
                      value={requiredVotes}
                      onChange={(e) => setRequiredVotes(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-900">Number of Milestones</label>
                  <input
                    type="number"
                    min="1"
                    value={milestoneCount}
                    onChange={(e) => setMilestoneCount(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all duration-200"
                  />
                </div>

                <button
                  onClick={handleInit}
                  disabled={loading || !peraWallet || !accountAddress || !teamAddress.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2 w-full"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Creating Grant...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      <span>Create Grant</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Grants List */}
          <div className="p-6">
            {grants.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mb-6">
                  <Wallet className="w-12 h-12 text-slate-400" />
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-2">No grants yet</h4>
                <p className="text-slate-600 mb-6 max-w-md mx-auto">
                  Create your first grant to start funding innovative projects and teams.
                </p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-all duration-200"
                >
                  Create First Grant
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {grants.map((grant) => (
                  <div
                    key={grant._id}
                    className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition cursor-pointer"
                    onClick={() => router.push(`/sponsors/grants/${grant._id}`)}
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h4 className="text-base font-medium text-gray-900 mb-1">
                          Grant #{grant._id.slice(-6).toUpperCase()}
                        </h4>
                        <div className="flex items-center space-x-2 text-xs text-gray-500 font-mono">
                          <span>ID:</span>
                          <span className="font-semibold">{grant._id.slice(0, 8)}...</span>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${grant.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                        }`}>
                        {grant.status.toUpperCase()}
                      </div>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-2 text-slate-600">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>Team:</span>
                        </div>
                        <div className="font-mono font-semibold text-gray-900 bg-slate-100 px-3 py-1 rounded-xl text-sm">
                          {grant.teamAddress.slice(0, 8)}...{grant.teamAddress.slice(-6)}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <div className="w-8 h-8 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center">
                            <span className="text-sm font-semibold text-gray-700">{grant.milestoneCount}</span>
                          </div>
                          <span>Milestones</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <div className="w-8 h-8 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center">
                            <span className="text-sm font-semibold text-gray-700">{grant.requiredVotes}</span>
                          </div>
                          <span>Required Votes</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                      <div className="text-xs text-slate-500 font-mono">
                        TX: {grant.txId.slice(0, 8)}...{grant.txId.slice(-8)}
                      </div>
                      <div className="flex items-center space-x-2 text-blue-600 font-semibold text-sm group-hover:text-blue-700 transition-colors">
                        <span>Manage Grant</span>
                        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}