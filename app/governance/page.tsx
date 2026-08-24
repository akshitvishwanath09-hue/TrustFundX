'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Wallet,
  Vote,
  Shield,
  Users,
  FileCheck,
  Scale,
  Eye,
  Lock,
  Zap,
  AlertCircle,
  Activity,
  Globe,
  Binary,
  Layers,
  ChevronRight,
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
            <Link href="/how-it-works" className="hover:text-primary transition-colors">How It Works</Link>
            <Link href="/sponsors-info" className="hover:text-primary transition-colors">Sponsors</Link>
            <Link href="/governance" className="text-primary transition-colors border-b-2 border-primary pb-1">Governance</Link>
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

const PillarCard = ({ title, desc, icon: Icon, color }: { 
  title: string;
  desc: string;
  icon: React.ElementType;
  color: string;
}) => (
  <motion.div
    whileHover={{ y: -8 }}
    className="relative p-10 bg-white border border-border rounded-[32px] shadow-premium hover:shadow-2xl transition-all group overflow-hidden"
  >
    <div className={`absolute top-0 right-0 p-8 opacity-[0.03] text-primary group-hover:opacity-[0.08] transition-opacity`}>
       <Icon size={120} />
    </div>
    
    <div className={`w-14 h-14 flex items-center justify-center rounded-2xl ${color} text-white mb-8 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
      <Icon size={28} strokeWidth={2.5} />
    </div>
    
    <h3 className="text-xl font-black text-text-primary mb-4 tracking-tight uppercase tracking-tighter">{title}</h3>
    <p className="text-text-secondary text-sm font-medium leading-[1.6]">
      {desc}
    </p>
  </motion.div>
);

const VotingStep = ({ number, title, desc, icon: Icon, last }: { 
  number: number;
  title: string;
  desc: string;
  icon: React.ElementType;
  last?: boolean;
}) => (
  <div className="flex gap-8 items-start relative">
    <div className="flex flex-col items-center flex-shrink-0 relative z-10">
      <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-white border-2 border-primary text-primary font-black text-xl shadow-xl mb-4 group-hover:bg-primary group-hover:text-white transition-all">
        {number}
      </div>
      {!last && <div className="w-1 h-24 bg-gradient-to-b from-primary/30 to-transparent" />}
    </div>
    <div className="flex-1 pt-2">
      <div className="flex items-center gap-3 mb-3">
        <Icon size={20} className="text-primary" strokeWidth={2.5} />
        <h4 className="text-lg font-black text-text-primary tracking-tight">{title}</h4>
      </div>
      <p className="text-text-secondary text-[15px] font-medium leading-relaxed max-w-lg">{desc}</p>
    </div>
  </div>
);

const StatBox = ({ icon: Icon, label, value, color }: { 
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="bg-white p-8 rounded-[32px] border border-border shadow-premium group hover:border-primary/20 transition-all duration-300"
  >
    <div className={`${color} w-12 h-12 rounded-xl flex items-center justify-center mb-6 text-white shadow-lg`}>
       <Icon size={24} strokeWidth={2.5} />
    </div>
    <div className="text-4xl font-black mb-1 tracking-tight">{value}</div>
    <div className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">{label}</div>
  </motion.div>
);

export default function GovernancePage() {
  return (
    <div className="min-h-screen bg-background text-text-primary selection:bg-primary/10 pb-32">
      <Navbar />

      <main className="max-w-7xl mx-auto px-8 pt-40">
        {/* --- Hero Section --- */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-24"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/5 text-primary rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 border border-primary/10 shadow-sm">
            <Cpu size={12} strokeWidth={3} /> Decentralized Consensus
          </div>
          <h1 className="text-6xl md:text-7xl font-black text-text-primary tracking-tighter mb-8 leading-[0.9]">
            Architected <br className="hidden md:block" /> for Integrity.
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto font-medium leading-relaxed">
            The TrustFundX protocol operates as an immutable DAO, where community audit nodes verify every capital deployment on-chain.
          </p>
        </motion.section>

        {/* --- Protocol Matrix --- */}
        <section className="mb-32">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatBox
              icon={Vote}
              label="Consensus Model"
              value="DAO/PoS"
              color="bg-primary"
            />
            <StatBox
              icon={Shield}
              label="Immutable Audit"
              value="100%"
              color="bg-indigo-600"
            />
            <StatBox
              icon={Users}
              label="Network Density"
              value="Sovereign"
              color="bg-cyan-600"
            />
            <StatBox
              icon={Layers}
              label="Settlement Layer"
              value="ALGO"
              color="bg-violet-600"
            />
          </div>
        </section>

        {/* --- Governance Pillars --- */}
        <section className="mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16"
          >
            <div className="max-w-2xl">
               <h2 className="text-4xl font-black mb-4 tracking-tight uppercase tracking-tighter">Protocol Pillars</h2>
               <p className="text-lg text-text-secondary font-medium">
                 Core mechanisms that ensure decentralized capital is allocated with institutional rigor and transparency.
               </p>
            </div>
            <div className="px-6 py-2 bg-text-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full">System Architecture v2.4</div>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <PillarCard
              title="Transparent Quorum"
              desc="Every vote is a cryptographically signed transaction on the Algorand ledger. No obscuration—only pure, verifiable consensus."
              icon={Eye}
              color="bg-blue-600"
            />
            <PillarCard
              title="Equitable Voting"
              desc="The protocol enforces one-wallet, one-vote across all milestone audits, preventing capital centralization from influencing outcomes."
              icon={Scale}
              color="bg-indigo-600"
            />
            <PillarCard
              title="Artifact Validation"
              desc="Voters interact with technical evidence stored via decentralized identifiers (DIDs) before authorizing fund releases."
              icon={FileCheck}
              color="bg-cyan-600"
            />
             <PillarCard
              title="Immutable Trails"
              desc="Governance actions are permanently indexed on the blockchain, creating an unalterable history of protocol decisions."
              icon={Binary}
              color="bg-violet-600"
            />
            <PillarCard
              title="Non-Custodial"
              desc="Capital is held in TEAL smart contracts. TrustFundX never assumes custody—funds move directly from escrow to students."
              icon={Lock}
              color="bg-slate-900"
            />
            <PillarCard
              title="Autonomous Flow"
              desc="Once quorum is reached, the protocol executes the release autonomously. No middleman, no bureaucracy, no latency."
              icon={Zap}
              color="bg-primary"
            />
          </div>
        </section>

        {/* --- Consensus Lifecycle --- */}
        <section className="mb-32 bg-white border border-border rounded-[48px] p-12 lg:p-20 shadow-premium relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-indigo-500 to-primary" />
           
           <div className="grid lg:grid-cols-5 gap-16">
              <div className="lg:col-span-2">
                 <h2 className="text-4xl font-black mb-6 tracking-tight leading-tight uppercase tracking-tighter">The Consensus <br /> Lifecycle</h2>
                 <p className="text-text-secondary font-medium leading-relaxed mb-10 italic">
                   &ldquo;A decentralized sequence designed for total capital accountability.&rdquo;
                 </p>
                 <div className="space-y-4">
                    <div className="flex items-center gap-4 text-xs font-black text-primary uppercase bg-primary/5 p-4 rounded-2xl border border-primary/20">
                       <ShieldCheck size={18} /> Verified by Algorand
                    </div>
                 </div>
              </div>
              
              <div className="lg:col-span-3 space-y-12">
                 <VotingStep
                    number={1}
                    title="Node Registration"
                    desc="Authorized identities (Voters) are registered during grant initialization, binding their cryptographic signatures to the contract."
                    icon={Users}
                 />
                 <VotingStep
                    number={2}
                    title="Artifact Submission"
                    desc="Students log milestone deliverables—technical documents, codebases, or proof-of-completion—directly to the protocol."
                    icon={FileCheck}
                 />
                 <VotingStep
                    number={3}
                    title="Distributed Audit"
                    desc="The voting quorum reviews artifacts through their decentralized consoles, examining evidence with institutional rigor."
                    icon={Shield}
                 />
                 <VotingStep
                    number={4}
                    title="Signature Protocol"
                    desc="Voters sign their consensus choice via Pera Wallet. The smart contract validates signatures and quorum thresholds."
                    icon={Binary}
                    last
                 />
              </div>
           </div>
        </section>

        {/* --- Safeguard Matrix --- */}
        <section className="mb-32">
           <div className="text-center mb-16">
              <h2 className="text-3xl font-black uppercase tracking-tight">Immutable Safeguards</h2>
              <p className="text-text-secondary font-medium mt-2">Redundant safety layers architected into the core protocol.</p>
           </div>
           
           <div className="grid md:grid-cols-2 gap-8">
              {[
                { title: "Anti-Sybil Logic", desc: "The protocol rejects redundant signatures from the same identity, ensuring quorum is truly distributed.", icon: AlertCircle, color: "bg-red-50 text-red-600 border-red-100" },
                { title: "Zero-Latency Payouts", desc: "Atomic Transfers ensure that payment only happens when the cryptographic conditions are met.", icon: Zap, color: "bg-amber-50 text-amber-600 border-amber-100" },
                { title: "Non-Fungible Evidence", desc: "All milestone proofs are indexed with hashes, making evidence tampering mathematically impossible.", icon: Lock, color: "bg-blue-50 text-blue-600 border-blue-100" },
                { title: "Public Reconciliation", desc: "The ledger is open 24/7 for public auditing by any network participant or oversight body.", icon: Globe, color: "bg-green-50 text-green-600 border-green-100" }
              ].map((guard, i) => (
                <div key={i} className={`p-10 rounded-[32px] border ${guard.color} transition-all hover:scale-[1.02] cursor-default`}>
                   <div className="flex items-start gap-6">
                      <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-white shadow-sm border border-current opacity-80">
                         <guard.icon size={24} strokeWidth={2.5} />
                      </div>
                      <div>
                         <h3 className="text-lg font-black mb-3 text-text-primary uppercase tracking-tighter">{guard.title}</h3>
                         <p className="text-sm font-medium leading-relaxed opacity-80">{guard.desc}</p>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </section>

        {/* --- Global CTA --- */}
        <motion.section
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-[48px] bg-text-primary p-16 lg:p-24 text-center shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#2563EB,transparent)] opacity-20 pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1E293B_1px,transparent_1px),linear-gradient(to_bottom,#1E293B_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
          
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight leading-[0.95] uppercase tracking-tighter">Become a <br /> Consensus Node.</h2>
            <p className="text-gray-400 text-xl font-medium mb-12 leading-relaxed">
              Join the decentralized network of auditors shaping the future of global education and innovation funding.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <button className="bg-primary text-white text-xs font-black px-10 py-5 rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2 uppercase tracking-widest">
                  Initialize Registry <ChevronRight size={18} strokeWidth={3} />
                </button>
              </Link>
              <Link href="/faqs">
                <button className="bg-white/10 text-white border border-white/20 text-xs font-black px-10 py-5 rounded-2xl hover:bg-white/20 transition-all backdrop-blur-md uppercase tracking-widest">
                  View FAQs
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
