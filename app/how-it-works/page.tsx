'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Wallet,
  FileText,
  Vote,
  CheckCircle,
  ArrowRight,
  CircleDollarSign,
  Shield,
  Zap,
  Activity,
  Binary,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import Footer from '../components/Footer';

const Navbar = () => {
  const { accountAddress, isConnected } = useWallet();
  const [userRole, setUserRole] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchUserRole = async () => {
      if (accountAddress && isConnected) {
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ walletAddress: accountAddress }),
          });
          const data = await res.json();
          if (res.ok && data.user) setUserRole(data.user.role);
        } catch {
          setUserRole(null);
        }
      } else {
        setUserRole(null);
      }
    };
    fetchUserRole();
  }, [accountAddress, isConnected]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/70 backdrop-blur-xl border-b border-border px-8 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-black text-white w-8 h-8 flex items-center justify-center font-bold text-lg rounded-xl shadow-lg transition-transform hover:rotate-6">X</div>
            <span className="font-bold text-xl tracking-tighter">TrustFundX</span>
          </Link>
          <div className="hidden md:flex gap-8 text-[11px] font-black uppercase tracking-widest text-text-secondary">
            <Link href="/how-it-works" className="text-primary transition-colors border-b-2 border-primary pb-1">How It Works</Link>
            <Link href="/sponsors-info" className="hover:text-primary transition-colors">Sponsors</Link>
            <Link href="/governance" className="hover:text-primary transition-colors">Governance</Link>
            <Link href="/faqs" className="hover:text-primary transition-colors">FAQs</Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {isConnected && userRole ? (
            <Link href={`/${userRole}s`}>
              <button className="flex items-center gap-2 bg-text-primary text-white text-xs font-black px-6 py-2.5 rounded-full hover:bg-black transition-all shadow-lg hover:-translate-y-0.5 uppercase tracking-widest">
                <Activity size={16} /> Dashboard
              </button>
            </Link>
          ) : (
            <div className="flex items-center gap-3">
               <Link href="/login" className="text-xs font-black uppercase tracking-widest text-text-secondary hover:text-text-primary transition-colors px-4">Sign In</Link>
               <Link href="/signup">
                  <button className="flex items-center gap-2 bg-black text-white text-xs font-black px-6 py-2.5 rounded-full hover:bg-black/90 transition-all shadow-lg hover:-translate-y-0.5 uppercase tracking-widest">
                    <Wallet size={16} /> Authorize
                  </button>
               </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

const StepCard = ({ number, title, desc, icon: Icon, delay, last }: { 
  number: number;
  title: string;
  desc: string;
  icon: React.ElementType;
  delay: number;
  last?: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ delay: delay * 0.1 }}
    className="flex gap-10 items-start group relative"
  >
    <div className="flex flex-col items-center flex-shrink-0 relative z-10">
       <div className="w-14 h-14 bg-white border-2 border-border rounded-2xl flex items-center justify-center font-black text-xl text-text-secondary group-hover:border-primary group-hover:text-primary transition-all shadow-sm">
          {number}
       </div>
       {!last && <div className="w-1 h-32 bg-border group-hover:bg-primary/30 transition-colors" />}
    </div>
    <div className="bg-white border border-border p-10 rounded-[32px] shadow-premium flex-1 group-hover:border-primary/20 group-hover:shadow-2xl transition-all duration-500 mb-12">
       <div className="w-12 h-12 bg-primary/5 text-primary rounded-xl flex items-center justify-center mb-6">
          <Icon size={24} strokeWidth={2.5} />
       </div>
       <h3 className="text-2xl font-black text-text-primary mb-4 tracking-tight uppercase tracking-tighter">{title}</h3>
       <p className="text-text-secondary font-medium leading-relaxed max-w-2xl">
          {desc}
       </p>
    </div>
  </motion.div>
);

const FeatureHighlight = ({ title, desc, icon: Icon }: { 
  title: string;
  desc: string;
  icon: React.ElementType;
}) => (
  <motion.div
    whileHover={{ y: -8 }}
    className="p-10 bg-white border border-border rounded-[40px] shadow-premium hover:shadow-2xl transition-all duration-500 group"
  >
    <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-500">
      <Icon size={28} strokeWidth={2.5} />
    </div>
    <h4 className="text-xl font-black uppercase tracking-tighter text-text-primary mb-4">{title}</h4>
    <p className="text-text-secondary font-medium text-sm leading-relaxed">{desc}</p>
  </motion.div>
);

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background text-text-primary selection:bg-primary/10 pb-32">
      <Navbar />

      <main className="max-w-7xl mx-auto px-8 pt-40">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-32"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/5 text-primary rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 border border-primary/10 shadow-sm">
            <Cpu size={12} strokeWidth={3} /> Protocol Blueprint
          </div>
          <h1 className="text-6xl md:text-7xl font-black text-text-primary tracking-tighter mb-8 leading-[0.9]">
            The Architecture <br className="hidden md:block" /> of Trust.
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto font-medium leading-relaxed">
            TrustFundX replaces traditional paper-based grants with immutable code, ensuring zero latency and total capital accountability.
          </p>
        </motion.section>

        {/* --- Process Flow --- */}
        <section className="mb-40 max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-16">
             <h2 className="text-3xl font-black uppercase tracking-tight">The Protocol Sequence</h2>
             <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] bg-primary/5 px-4 py-2 rounded-full">Synchronized v2.4</span>
          </div>
          
          <div className="relative">
            <StepCard
              number={1}
              title="Identity Authorization"
              desc="Participants authenticate via Pera Wallet. Your cryptographic signature becomes your unique protocol identity, eliminating passwords and ensuring non-repudiation."
              icon={Wallet}
              delay={0}
            />
            
            <StepCard
              number={2}
              title="Contract Deployment"
              desc="Sponsors initialize Grant Smart Contracts on the Algorand ledger, defining Phased Milestones and the verifying Voter Quorum requirements."
              icon={CircleDollarSign}
              delay={1}
            />
            
            <StepCard
              number={3}
              title="Capital Lock-up"
              desc="Allocated capital is transferred into a non-custodial TEAL escrow. Funds are cryptographically locked until milestone consensus is achieved."
              icon={Shield}
              delay={2}
            />
            
            <StepCard
              number={4}
              title="Artifact Logging"
              desc="Students submit technical deliverables directly to the protocol console. These artifacts serve as the evidence layer for voter auditing."
              icon={FileText}
              delay={3}
            />
            
            <StepCard
              number={5}
              title="Distributed Consensus"
              desc="Verified Voters audit submissions and sign approval transactions. The protocol tracks signatures in real-time until the quorum threshold is met."
              icon={Vote}
              delay={4}
            />
            
            <StepCard
              number={6}
              title="Atomic Settlement"
              desc="Upon consensus, the smart contract executes an Atomic Transfer, releasing funds to the student's wallet in ~3.3 seconds. No middleman. No delay."
              icon={CheckCircle}
              delay={5}
              last
            />
          </div>
        </section>

        {/* --- Core Features Matrix --- */}
        <section className="mb-40">
          <div className="text-center mb-16">
             <h2 className="text-3xl font-black uppercase tracking-tight">Why TrustFundX?</h2>
             <p className="text-text-secondary font-medium max-w-lg mx-auto mt-2">Institutional-grade grant infrastructure built on carbon-negative blockchain technology.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <FeatureHighlight
              title="Ledger Verified"
              desc="Total transparency. Every transaction and consensus vote is permanently indexed on the public Algorand blockchain."
              icon={Binary}
            />
            <FeatureHighlight
              title="Instant Liquidity"
              desc="Smart contracts eliminate administrative overhead, delivering capital at the exact moment of milestone success."
              icon={Zap}
            />
            <FeatureHighlight
              title="Consensus Audit"
              desc="Community-driven governance ensures that capital is only released for high-quality, verified student performance."
              icon={ShieldCheck}
            />
          </div>
        </section>

        {/* --- Global Action Banner --- */}
        <motion.section
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-[56px] bg-text-primary p-16 lg:p-24 text-center shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,#22D3EE,transparent)] opacity-10 pointer-events-none" />
           <div className="absolute inset-0 bg-[linear-gradient(to_right,#1E293B_1px,transparent_1px),linear-gradient(to_bottom,#1E293B_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
          
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight leading-[0.95] uppercase tracking-tighter">Ready to <br /> Initialize?</h2>
            <p className="text-gray-400 text-xl font-medium mb-12 leading-relaxed">
              Activate your protocol identity today and start deploying capital or building the decentralized future.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <button className="bg-primary text-white text-xs font-black px-10 py-5 rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2 uppercase tracking-widest">
                  Get Started <ArrowRight size={18} strokeWidth={3} />
                </button>
              </Link>
            </div>
          </div>
        </motion.section>

        <Footer />
      </main>
    </div>
  );
}
