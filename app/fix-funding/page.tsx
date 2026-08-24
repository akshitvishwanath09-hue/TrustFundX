'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Settings, 
  Zap, 
  Database, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck,
  Cpu,
  Loader2
} from 'lucide-react';

export default function FixFundingPage() {
  const router = useRouter();
  const [grantId, setGrantId] = useState('');
  const [fundedAmount, setFundedAmount] = useState('10');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleFix = async () => {
    if (!grantId || !fundedAmount) {
      setError('Required: Grant ID and Settlement Amount must be provided.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setMessage('');

      const response = await fetch('/api/fix-grant-funding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grantId,
          fundedAmount: parseFloat(fundedAmount),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Protocol Update Failed');
      }

      setMessage(data.message);
      setTimeout(() => {
        router.push('/sponsors');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary selection:bg-primary/10 flex flex-col">
      {/* --- Global Navbar --- */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/70 backdrop-blur-xl border-b border-border px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
             <div className="bg-primary text-white w-8 h-8 flex items-center justify-center font-bold text-lg rounded-xl shadow-lg shadow-primary/20">X</div>
             <span className="font-bold text-xl tracking-tighter">TrustFundX</span>
          </Link>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 group text-xs font-black uppercase tracking-widest text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft size={16} strokeWidth={3} className="group-hover:-translate-x-1 transition-transform" /> Cancel
          </button>
        </div>
      </nav>

      {/* --- Utility Interface --- */}
      <div className="flex-1 flex items-center justify-center p-6 pt-24">
         <motion.div 
           initial={{ opacity: 0, scale: 0.98 }}
           animate={{ opacity: 1, scale: 1 }}
           className="w-full max-w-lg bg-white border border-border rounded-[40px] shadow-premium p-10 lg:p-12 relative overflow-hidden"
         >
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] text-primary pointer-events-none">
               <Settings size={200} />
            </div>

            <div className="mb-10">
               <div className="flex items-center gap-2 mb-4">
                  <div className="px-3 py-1 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-primary/10 flex items-center gap-1.5">
                     <Cpu size={12} strokeWidth={3} /> Protocol Utility
                  </div>
               </div>
               <h1 className="text-3xl font-black tracking-tighter text-text-primary uppercase tracking-tighter">Grant <br /> Synchronization</h1>
               <p className="text-text-secondary text-sm font-medium mt-2">Adjust settlement records for administrative parity.</p>
            </div>

            <div className="space-y-6 relative z-10">
               {/* Grant ID Input */}
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Target Grant Identifier</label>
                  <div className="relative group">
                     <Database className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors" size={18} />
                     <input 
                       type="text" 
                       value={grantId}
                       onChange={(e) => setGrantId(e.target.value)}
                       placeholder="e.g. 507f1f77bcf86cd..."
                       className="w-full bg-background border border-border rounded-xl pl-12 pr-4 py-4 text-sm font-bold placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                     />
                  </div>
               </div>

               {/* Amount Input */}
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Allocated Amount (ALGO)</label>
                  <div className="relative group">
                     <Zap className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors" size={18} />
                     <input 
                       type="number" 
                       step="0.1"
                       value={fundedAmount}
                       onChange={(e) => setFundedAmount(e.target.value)}
                       className="w-full bg-background border border-border rounded-xl pl-12 pr-12 py-4 text-sm font-black text-text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                     />
                     <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest text-text-secondary">ALGO</div>
                  </div>
               </div>

               {/* Action Button */}
               <button 
                 onClick={handleFix}
                 disabled={loading || !grantId || !fundedAmount}
                 className="w-full bg-primary text-white font-black py-5 rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 uppercase tracking-widest text-xs"
               >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} strokeWidth={3} />}
                  {loading ? 'Initializing Update...' : 'Commit Protocol Fix'}
               </button>

               {/* Feedback States */}
               {(message || error) && (
                 <motion.div 
                   initial={{ opacity: 0, y: 10 }} 
                   animate={{ opacity: 1, y: 0 }}
                   className={`p-4 rounded-2xl flex items-start gap-3 border ${message ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}
                 >
                    {message ? <CheckCircle2 className="text-green-500 w-5 h-5 flex-shrink-0 mt-0.5" /> : <AlertTriangle className="text-red-500 w-5 h-5 flex-shrink-0 mt-0.5" />}
                    <div className={`text-xs font-bold leading-normal ${message ? 'text-green-900' : 'text-red-900'}`}>
                       {message || error}
                       {message && <div className="mt-1 opacity-60 text-[10px]">SYNC SUCCESSFUL. REDIRECTING TO CONSOLE...</div>}
                    </div>
                 </motion.div>
               )}
            </div>

            {/* Protocol Warning */}
            <div className="mt-10 p-6 bg-amber-50/50 border border-amber-100 rounded-[24px]">
               <div className="flex items-start gap-4">
                  <AlertTriangle className="text-amber-500 w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] font-bold text-amber-900 leading-relaxed uppercase tracking-wide">
                     <strong>Security Advisory:</strong> This utility performs a low-level synchronization between the ledger and database. Ensure Grant ID accuracy before commitment.
                  </p>
               </div>
            </div>
         </motion.div>
      </div>

      <footer className="p-8 text-center">
         <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] opacity-40">
           © 2024 TrustFundX. Protocol Maintenance Channel.
         </p>
      </footer>
    </div>
  );
}
