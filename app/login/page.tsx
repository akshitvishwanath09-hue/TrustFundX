'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWallet } from '@/contexts/WalletContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Wallet,
  ArrowRight,
  Activity,
  Zap,
  Lock,
  ChevronRight,
  Loader2,
  AlertCircle
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { connectWallet, accountAddress, isConnected } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingWallet, setCheckingWallet] = useState(true);

  useEffect(() => {
    const checkExistingWallet = async () => {
      if (accountAddress && isConnected) {
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ walletAddress: accountAddress }),
          });
          const data = await res.json();
          if (res.ok && data.user) {
            localStorage.setItem('user', JSON.stringify(data.user));
            router.push(`/${data.user.role}s`);
            return;
          }
        } catch (err) {
          console.error('Auto-login failed:', err);
        }
      }
      setCheckingWallet(false);
    };
    checkExistingWallet();
  }, [accountAddress, isConnected, router]);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      const accounts = await connectWallet();
      if (accounts.length > 0) {
        const walletAddress = accounts[0];
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ walletAddress }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Authorization failed.");
        localStorage.setItem('user', JSON.stringify(data.user));
        router.push(`/${data.user.role}s`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (checkingWallet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-4 border-black/10 border-t-black rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background selection:bg-primary/10 flex overflow-hidden">
      {/* --- Visual Branding Panel --- */}
      <div className="hidden lg:flex flex-1 bg-black p-16 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_30%,#FFFFFF,transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1E293B_1px,transparent_1px),linear-gradient(to_bottom,#1E293B_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-10" />

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 mb-24">
            <div className="bg-white text-black w-9 h-9 flex items-center justify-center font-bold text-xl rounded-xl shadow-lg transition-transform hover:rotate-6">X</div>
            <span className="font-bold text-2xl text-white tracking-tighter">TrustFundX</span>
          </Link>

          <h1 className="text-6xl font-black text-white tracking-tight leading-[0.95] mb-8">
            The Protocol <br /> Awaits.
          </h1>
          <p className="text-gray-400 text-xl max-w-md leading-relaxed">
            Authorize your identity via Pera Wallet to access the decentralized grant management infrastructure.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-8 text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">
          <div className="flex items-center gap-2"><ShieldCheck size={14} className="text-white opacity-40" /> Immutable Audit</div>
          <div className="flex items-center gap-2"><Zap size={14} className="text-white opacity-40" /> Instant Liquidity</div>
        </div>
      </div>

      {/* --- Login Action Panel --- */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background relative">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-border p-10 rounded-[32px] shadow-premium"
          >
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-black/5 rounded-2xl flex items-center justify-center mx-auto mb-6 text-black">
                <Wallet size={32} strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl font-black tracking-tight mb-2">Protocol Access</h2>
              <p className="text-text-secondary text-[15px] font-medium px-4">
                Sign in with your Algorand wallet to synchronize your dashboard.
              </p>
            </div>

            {error && (
              <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
                <AlertCircle className="text-red-500 w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="text-xs font-bold text-red-900 leading-normal">{error}</div>
              </div>
            )}

            <div className="space-y-4">
              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-black text-white font-black py-4 rounded-xl shadow-lg hover:bg-black/90 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Zap size={18} />}
                {loading ? 'CONNECTING PROTOCOL...' : 'CONNECT PERA WALLET'}
              </button>

              <Link href="/signup">
                <button className="w-full bg-white border border-border text-text-primary font-bold py-4 rounded-xl shadow-sm hover:bg-background transition-all flex items-center justify-center gap-2 group">
                  Register <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>

            <div className="mt-10 pt-8 border-t border-border flex justify-between items-center text-[10px] font-black text-text-secondary opacity-60 uppercase tracking-widest">
              <span>Algorand Verified</span>
              <div className="flex items-center gap-1"><Lock size={10} /> Secure Auth</div>
            </div>
          </motion.div>

          <p className="text-center mt-8 text-[11px] font-bold text-text-secondary uppercase tracking-[0.2em] opacity-40">
            © 2024 TrustFundX Autonomous Network
          </p>
        </div>
      </div>
    </div>
  );
}