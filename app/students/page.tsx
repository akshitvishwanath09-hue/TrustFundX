'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWallet } from '@/contexts/WalletContext';
import toast from 'react-hot-toast';

interface User {
  name: string;
  email: string;
  organization: string;
  walletAddress: string;
  role: string;
}

interface Grant {
  _id: string;
  sponsorAddress: string;
  teamAddress: string;
  milestoneCount: number;
  status: string;
}

interface Milestone {
  _id: string;
  milestoneId: number;
  description: string;
  amount: number;
  approvals: number;
  paid: boolean;
  submissionNote?: string;
  submissionFileUrl?: string;
}

export default function StudentDashboard() {
  const router = useRouter();
  const { accountAddress, disconnectWallet } = useWallet();
  const [user, setUser] = useState<User | null>(null);
  const [grants, setGrants] = useState<Grant[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [submissionNote, setSubmissionNote] = useState<{ [key: string]: string }>({});
  const [uploadingFile, setUploadingFile] = useState<string | null>(null);
  const [submittingMilestone, setSubmittingMilestone] = useState<string | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'student') {
      router.push('/login');
      return;
    }
    
    setUser(parsedUser);
  }, [router]);

  const fetchGrants = useCallback(async () => {
    if (!accountAddress) return;
    
    try {
      const response = await fetch(`/api/grants?teamAddress=${accountAddress}`);
      const data = await response.json();
      setGrants(data.grants || []);

      if (data.grants && data.grants.length > 0) {
        const grantId = data.grants[0]._id;
        const milestonesRes = await fetch(`/api/milestones?grantId=${grantId}`);
        const milestonesData = await milestonesRes.json();
        setMilestones(milestonesData.milestones || []);
      }
    } catch (err) {
      console.error('Failed to fetch grants:', err);
    }
  }, [accountAddress]);

  useEffect(() => {
    if (user && accountAddress) {
      fetchGrants();
    }
  }, [user, accountAddress, fetchGrants]);

  const handleLogout = () => {
    disconnectWallet();
    localStorage.removeItem('user');
    router.push('/login');
  };

  const openMilestoneDetails = (milestoneDbId: string) => {
    router.push(`/milestone/${milestoneDbId}`);
  };

  const handleFileUpload = async (milestoneId: string, file: File) => {
    try {
      setUploadingFile(milestoneId);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }
      
      const data = await response.json();
      
      if (!data.url) {
        throw new Error('No URL returned from upload');
      }
      
      return data.url;
    } catch (error) {
      console.error('File upload error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('Filestack API key not configured')) {
        toast.error('File upload is not configured. Please contact the administrator.', {
          duration: 6000,
        });
      } else {
        toast.error(`Failed to upload file: ${errorMessage}`);
      }
      
      return null;
    } finally {
      setUploadingFile(null);
    }
  };

  const handleSubmitMilestone = async (milestone: Milestone) => {
    try {
      setSubmittingMilestone(milestone._id);
      
      const note = submissionNote[milestone._id] || '';
      const fileInput = document.getElementById(`file-${milestone._id}`) as HTMLInputElement;
      const file = fileInput?.files?.[0];
      
      if (!note && !file) {
        toast.error('Please provide either a note or upload a file');
        return;
      }
      
      let fileUrl = null;
      if (file) {
        fileUrl = await handleFileUpload(milestone._id, file);
        if (!fileUrl) return;
      }
      
      const response = await fetch('/api/milestones', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          milestoneDbId: milestone._id,
          submissionNote: note,
          submissionFileUrl: fileUrl,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit milestone');
      }
      
      toast.success('Milestone submitted successfully!');
      setSubmissionNote({ ...submissionNote, [milestone._id]: '' });
      if (fileInput) fileInput.value = '';
      fetchGrants();
    } catch (error) {
      console.error('Submit milestone error:', error);
      toast.error('Failed to submit milestone');
    } finally {
      setSubmittingMilestone(null);
    }
  };

  if (!user) return null;

  const totalReceived = milestones.filter(m => m.paid).reduce((sum, m) => sum + (m.amount || 0), 0);
  const completedMilestones = milestones.filter(m => m.paid).length;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Soft Gradient Mesh Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-200/30 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-emerald-200/30 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-r from-purple-200/20 to-pink-200/20 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-lg shadow-lg group-hover:shadow-emerald-500/50 transition-shadow"></div>
                <span className="text-xl font-light">
                  TrustFund<span className="font-semibold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">X</span>
                </span>
              </Link>
              <div className="hidden md:flex items-center gap-6 text-sm">
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Dashboard</a>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Grants</a>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Progress</a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-gray-600">0 pts</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg hover:bg-white transition-all"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="mb-12 slide-up">
          <div className="inline-block mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Student Portal</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-light mb-3">
            Level up your <span className="font-normal bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">Trust Fund</span>
          </h1>
          <p className="text-gray-600 text-lg">Welcome back, {user?.name}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Stat Card 1 - Seed Level */}
          <div className="glass-card p-6 group hover-lift slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center">
              
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Active Grants</h3>
            <p className="text-3xl font-light text-gray-900 mb-1">{grants.length}</p>
            <div className="h-1 bg-gradient-to-r from-emerald-400 to-emerald-200 rounded-full w-3/4 mb-2"></div>
          </div>

          {/* Stat Card 2 - Sapling Level */}
          <div className="glass-card p-6 group hover-lift slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center">
                
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Total Received</h3>
            <p className="text-3xl font-light text-gray-900 mb-1">
              {totalReceived.toFixed(1)} <span className="text-lg text-gray-500">ALGO</span>
            </p>
            <div className="h-1 bg-gradient-to-r from-blue-400 to-blue-200 rounded-full w-2/3 mb-2"></div>
          </div>

          {/* Stat Card 3 - Forest Guardian */}
          <div className="glass-card-highlight p-6 group hover-lift slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-200 rounded-2xl flex items-center justify-center">
              
              </div>
            </div>
            <h3 className="text-sm font-medium text-emerald-700 mb-1">Completion Rate</h3>
            <p className="text-3xl font-light text-gray-900 mb-1">
              {milestones.length > 0 ? Math.round((completedMilestones / milestones.length) * 100) : 0}%
            </p>
            <div className="h-1 bg-gradient-to-r from-emerald-500 to-green-400 rounded-full mb-2" style={{ width: `${milestones.length > 0 ? (completedMilestones / milestones.length) * 100 : 0}%` }}></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Card */}
            <div className="glass-card p-8 slide-up" style={{ animationDelay: '0.4s' }}>
              <h2 className="text-2xl font-light text-gray-900 mb-6">Profile</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">Email</label>
                    <p className="text-sm text-gray-900">{user?.email}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">Organization</label>
                    <p className="text-sm text-gray-900">{user?.organization}</p>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 block">Wallet Address</label>
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
                    <span className="font-mono text-sm text-gray-700 truncate flex-1">{user?.walletAddress}</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(user?.walletAddress);
                        toast.success('Copied to clipboard');
                      }}
                      className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Milestones Section */}
            <div className="glass-card p-8 slide-up" style={{ animationDelay: '0.5s' }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-light text-gray-900">Milestone Progress</h2>
                <span className="text-sm text-gray-500">{completedMilestones} of {milestones.length} complete</span>
              </div>
              
              {milestones.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-gray-500">No milestones created yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {milestones.map((milestone, idx) => (
                    <div
                      key={milestone._id}
                      className="milestone-card p-5 cursor-pointer"
                      onClick={() => openMilestoneDetails(milestone._id)}
                      style={{ animationDelay: `${0.6 + idx * 0.1}s` }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 bg-gradient-to-r from-gray-100 to-gray-50 border border-gray-200 rounded-full text-xs font-medium text-gray-700">
                              M{milestone.milestoneId}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              milestone.paid 
                                ? 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200' 
                                : 'bg-gray-50 text-gray-600 border border-gray-200'
                            }`}>
                              {milestone.paid ? '✓ Completed' : 'In Progress'}
                            </span>
                          </div>
                          <h3 className="text-base font-medium text-gray-900 mb-1">{milestone.description}</h3>
                          <p className="text-sm text-gray-500">Approvals: {milestone.approvals}</p>
                        </div>
                        <div className="text-right ml-6">
                          <p className="text-2xl font-light text-gray-900">{milestone.amount}</p>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">ALGO</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="h-2 bg-gradient-to-r from-gray-100 to-gray-50 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-700 ${
                              milestone.paid 
                                ? 'bg-gradient-to-r from-emerald-500 to-green-400' 
                                : 'bg-gradient-to-r from-gray-300 to-gray-200'
                            }`}
                            style={{ width: milestone.paid ? '100%' : '0%' }}
                          ></div>
                        </div>
                      </div>

                      {/* Submission Section */}
                      {!milestone.paid && (
                        <div className="pt-4 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
                          {milestone.submissionNote || milestone.submissionFileUrl ? (
                            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-xs font-medium text-blue-900 uppercase tracking-wide">Submitted</span>
                              </div>
                              {milestone.submissionNote && (
                                <p className="text-sm text-blue-900 mb-2">{milestone.submissionNote}</p>
                              )}
                              {milestone.submissionFileUrl && (
                                <a 
                                  href={milestone.submissionFileUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="inline-flex items-center gap-2 text-sm text-blue-700 hover:text-blue-900 font-medium"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                  </svg>
                                  View Document
                                </a>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <textarea
                                value={submissionNote[milestone._id] || ''}
                                onChange={(e) => setSubmissionNote({ ...submissionNote, [milestone._id]: e.target.value })}
                                placeholder="Describe your completed work..."
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                                rows={3}
                              />
                              <input
                                id={`file-${milestone._id}`}
                                type="file"
                                accept=".pdf"
                                className="w-full text-sm text-gray-600 file:mr-3 file:px-4 file:py-2 file:rounded-lg file:border file:border-gray-200 file:bg-white file:text-gray-700 file:font-medium hover:file:bg-gray-50 cursor-pointer"
                              />
                              <button
                                onClick={() => handleSubmitMilestone(milestone)}
                                disabled={uploadingFile === milestone._id || submittingMilestone === milestone._id}
                                className="w-full px-4 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30"
                              >
                                {uploadingFile === milestone._id ? 'Uploading...' : submittingMilestone === milestone._id ? 'Submitting...' : 'Submit Work'}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Grants Card */}
            <div className="glass-card p-6 slide-up" style={{ animationDelay: '0.6s' }}>
              <h2 className="text-xl font-light text-gray-900 mb-4">Active Grants</h2>
              {grants.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500">No grants assigned</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {grants.map((grant, idx) => (
                    <div 
                      key={grant._id}
                      className="p-4 bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-md transition-all"
                      style={{ animationDelay: `${0.7 + idx * 0.1}s` }}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900 mb-1">
                            Grant #{grant._id.slice(-6).toUpperCase()}
                          </div>
                          <div className="font-mono text-xs text-gray-500">
                            {grant.sponsorAddress?.slice(0, 8)}...{grant.sponsorAddress?.slice(-6)}
                          </div>
                        </div>
                        <span className="px-2.5 py-1 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 text-emerald-700 text-xs font-medium rounded-full">
                          {grant.status || 'Active'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {grant.milestoneCount} milestones
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </main>

      <style jsx>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.8);
          border-radius: 24px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04);
          transition: all 0.3s ease;
        }

        .glass-card:hover {
          box-shadow: 0 12px 48px rgba(0, 0, 0, 0.08);
          transform: translateY(-2px);
        }

        .glass-card-highlight {
          background: linear-gradient(135deg, rgba(236, 253, 245, 0.8) 0%, rgba(209, 250, 229, 0.6) 100%);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: 24px;
          box-shadow: 0 8px 32px rgba(16, 185, 129, 0.08);
          transition: all 0.3s ease;
        }

        .glass-card-highlight:hover {
          box-shadow: 0 12px 48px rgba(16, 185, 129, 0.15);
          transform: translateY(-2px);
        }

        .milestone-card {
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(229, 231, 235, 0.8);
          border-radius: 20px;
          transition: all 0.3s ease;
        }

        .milestone-card:hover {
          background: rgba(255, 255, 255, 0.8);
          border-color: rgba(209, 213, 219, 1);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
          transform: translateY(-1px);
        }

        .hover-lift {
          transition: all 0.3s ease;
        }

        .hover-lift:hover {
          transform: translateY(-4px);
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .slide-up {
          animation: slideUp 0.6s ease-out forwards;
          opacity: 0;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}