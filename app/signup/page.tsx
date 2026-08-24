'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWallet } from '@/contexts/WalletContext';
import { UserRole } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Wallet,
  ArrowRight,
  User,
  Mail,
  Building2,
  ChefHat,
  GraduationCap,
  Briefcase,
  Vote,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Zap
} from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { connectWallet, accountAddress, isConnected } = useWallet();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    role: 'student' as UserRole,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingWallet, setCheckingWallet] = useState(true);

  useEffect(() => {
    const checkExistingUser = async () => {
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
          console.error('Auto-login check failed:', err);
        }
      }
      setCheckingWallet(false);
    };
    checkExistingUser();
  }, [accountAddress, isConnected, router]);

  const handleNext = () => {
    if (!formData.name || !formData.email || !formData.organization) {
      setError('Required fields: Name, Email, and Organization must be provided.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleConnectWallet = async () => {
    try {
      setLoading(true);
      setError('');
      const accounts = await connectWallet();
      if (accounts.length > 0) {
        await handleSignup(accounts[0]);
      }
    } catch (err) {
      setError('Protocol Error: Pera Wallet connection timed out or rejected.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (walletAddress: string) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          walletAddress,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Onboarding failed.");

      localStorage.setItem('user', JSON.stringify({ ...formData, walletAddress }));
      router.push(`/${formData.role}s`);
    } catch (err: any) {
      setError(err.message);
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
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_70%_70%,#FFFFFF,transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1E293B_1px,transparent_1px),linear-gradient(to_bottom,#1E293B_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-10" />

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 mb-24">
            <div className="bg-white text-black w-9 h-9 flex items-center justify-center font-bold text-xl rounded-xl shadow-lg transition-transform hover:-rotate-6">X</div>
            <span className="font-bold text-2xl text-white tracking-tighter">TrustFundX</span>
          </Link>

          <h1 className="text-6xl font-black text-white tracking-tight leading-[0.95] mb-8">
            Join the <br /> Ecosystem.
          </h1>
          <p className="text-gray-400 text-xl max-w-md leading-relaxed">
            Create your decentralized identity to begin sponsoring innovative projects or building the future.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap gap-8 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mt-auto">
          <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-white opacity-40" /> Verified Identity</div>
          <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-white opacity-40" /> Secure Onboarding</div>
          <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-white opacity-40" /> Algorand Native</div>
        </div>
      </div>

      {/* --- Signup Onboarding Panel --- */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background relative overflow-y-auto">
        <div className="w-full max-w-md my-12">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white border border-border p-10 rounded-[32px] shadow-premium"
          >
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                {[1, 2].map((s) => (
                  <div key={s} className={`h-1.5 rounded-full transition-all duration-500 ${step >= s ? 'w-8 bg-primary' : 'w-4 bg-border'}`} />
                ))}
              </div>
              <h2 className="text-2xl font-black tracking-tight mb-2">Protocol Onboarding</h2>
              <p className="text-text-secondary text-sm font-medium">
                {step === 1 ? 'Configure your identity profile.' : 'Connect your Pera wallet.'}
              </p>
            </div>

            {error && (
              <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
                <AlertCircle className="text-red-500 w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="text-xs font-bold text-red-900 leading-normal">{error}</div>
              </div>
            )}

            {step === 1 ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">Legal Name / Pseudonym</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-black transition-colors" size={18} />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Satoshi Nakamoto"
                      className="w-full bg-background border border-border rounded-xl pl-12 pr-4 py-3.5 text-sm font-bold placeholder:text-gray-400 focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">Email Communication</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-black transition-colors" size={18} />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="satoshi@bitcoin.org"
                      className="w-full bg-background border border-border rounded-xl pl-12 pr-4 py-3.5 text-sm font-bold placeholder:text-gray-400 focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">Affiliation / Organization</label>
                  <div className="relative group">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-black transition-colors" size={18} />
                    <input
                      type="text"
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      placeholder="Decentralized Autonomous Hub"
                      className="w-full bg-background border border-border rounded-xl pl-12 pr-4 py-3.5 text-sm font-bold placeholder:text-gray-400 focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">Protocol Role Selection</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'student', icon: GraduationCap, label: 'Student' },
                      { id: 'sponsor', icon: Briefcase, label: 'Sponsor' },
                      { id: 'voter', icon: Vote, label: 'Voter' }
                    ].map((role) => (
                      <button
                        key={role.id}
                        onClick={() => setFormData({ ...formData, role: role.id as UserRole })}
                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${formData.role === role.id ? 'border-primary bg-primary/5 text-primary shadow-lg shadow-primary/5' : 'border-border bg-white text-text-secondary hover:border-text-secondary/20'}`}
                      >
                        <role.icon size={24} strokeWidth={formData.role === role.id ? 2.5 : 1.5} />
                        <span className="text-[10px] font-black uppercase mt-2">{role.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleNext}
                  className="w-full bg-black text-white font-black py-4 rounded-xl shadow-lg hover:bg-black/90 transition-all flex items-center justify-center gap-2 group mt-4"
                >
                  Next Operation <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            ) : (
              <div className="space-y-8 text-center">
                <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto text-primary animate-pulse">
                  <Wallet size={40} strokeWidth={1} />
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-black">Final Authorization</h3>
                  <p className="text-text-secondary text-sm font-medium px-6 leading-relaxed">
                    Connect your Pera Wallet to bind your identity with the TrustFundX protocol.
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleConnectWallet}
                    disabled={loading}
                    className="w-full bg-primary text-white font-black py-4 rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Zap size={18} />}
                    {loading ? 'INITIALIZING PROTOCOL...' : 'CONNECT PERA WALLET'}
                  </button>

                  <button
                    onClick={() => setStep(1)}
                    className="w-full bg-white border border-border text-text-primary font-bold py-4 rounded-xl shadow-sm hover:bg-background transition-all"
                  >
                    Modify Profile
                  </button>
                </div>
              </div>
            )}

            <div className="mt-10 pt-8 border-t border-border text-center">
              <p className="text-sm text-text-secondary font-medium">
                Already registered? {' '}
                <Link href="/login" className="text-primary font-black hover:underline underline-offset-4">Sign In</Link>
              </p>
            </div>
          </motion.div>

          <p className="text-center mt-8 text-[11px] font-bold text-text-secondary uppercase tracking-[0.2em] opacity-40">
            Secured by Algorand Governance Infrastructure
          </p>
        </div>
      </div>
    </div>
  );
}