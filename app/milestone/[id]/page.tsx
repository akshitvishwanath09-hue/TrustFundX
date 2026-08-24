'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

type Milestone = {
  _id: string;
  grantId: string;
  milestoneId: number;
  amount: number;
  description?: string;
  approvals?: number;
  paid?: boolean;
  status?: string;
  createdAt?: string;
  submissionFileUrl?: string;
  submissionNote?: string;
  submittedAt?: string;
};

export default function MilestoneDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [milestone, setMilestone] = useState<Milestone | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadMilestone = async () => {
      try {
        setLoading(true);
        setError('');

        const res = await fetch(`/api/milestones?milestoneDbId=${params.id}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch milestone');
        }

        setMilestone(data.milestone);
      } catch (err: any) {
        setError(err.message || 'Failed to load milestone details');
      } finally {
        setLoading(false);
      }
    };

    if (params?.id) {
      loadMilestone();
    }
  }, [params?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error || !milestone) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-lg w-full bg-white border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600 font-medium">{error || 'Milestone not found'}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-black text-white w-6 h-6 flex items-center justify-center font-bold text-sm rounded-sm transform -rotate-6">
                X
              </div>
              <span className="font-semibold text-lg tracking-tight text-black">TrustFundX</span>
            </Link>
            <button
              onClick={() => router.back()}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              ← Back
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Milestone #{milestone.milestoneId}</h1>
              <p className="text-sm text-gray-500 mt-1">Grant #{milestone.grantId.slice(-6)}</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-2xl font-bold text-green-600">{milestone.amount} ALGO</p>
              <span
                className={`inline-flex mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                  milestone.paid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {milestone.status || (milestone.paid ? 'paid' : 'pending')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Milestone DB ID</p>
              <p className="text-sm text-gray-900 font-mono break-all mt-1">{milestone._id}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Approvals</p>
              <p className="text-sm text-gray-900 mt-1">{milestone.approvals ?? 0}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Created At</p>
              <p className="text-sm text-gray-900 mt-1">
                {milestone.createdAt ? new Date(milestone.createdAt).toLocaleString() : '-'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Submitted At</p>
              <p className="text-sm text-gray-900 mt-1">
                {milestone.submittedAt ? new Date(milestone.submittedAt).toLocaleString() : '-'}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Description</p>
            <p className="text-gray-800 leading-relaxed">{milestone.description || '-'}</p>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Submission Note</p>
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{milestone.submissionNote || '-'}</p>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Submission File</p>
            {milestone.submissionFileUrl ? (
              <Link
                href={milestone.submissionFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-medium"
              >
                Open uploaded proof
              </Link>
            ) : (
              <p className="text-gray-700">-</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
