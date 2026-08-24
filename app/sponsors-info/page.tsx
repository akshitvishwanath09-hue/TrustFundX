'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Wallet,
  Shield,
  BarChart3,
  Bell,
  ArrowRight,
  CheckCircle,
  FileText,
  Users,
  Activity,
  Globe,
  ShieldCheck,
  PieChart,
  Zap,
  Target
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
            <Link href="/sponsors-info" className="text-primary transition-colors border-b-2 border-primary pb-1">Sponsors</Link>
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

const AdvantageCard = ({ title, desc, icon: Icon, color }: { 
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

const StatCard = ({ value, label, icon: Icon }: { 
  value: string;
  label: string;
  icon: React.ElementType;
}) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="p-8 bg-white border border-border rounded-[32px] shadow-premium group hover:border-primary/20 transition-all duration-300"
  >
    <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-primary text-white mb-6 shadow-lg shadow-primary/20">
      <Icon size={24} strokeWidth={2.5} />
    </div>
    <div className="text-4xl font-black text-text-primary mb-1 tracking-tight">{value}</div>
    <div className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">{label}</div>
  </motion.div>
);

const ProcessStep = ({ number, title, desc, last }: { number: number, title: string, desc: string, last?: boolean }) => (
  <div className="flex gap-8 relative">
    <div className="flex flex-col items-center flex-shrink-0 relative z-10">
      <div className="w-14 h-14 bg-white border-2 border-primary text-primary font-black text-xl rounded-2xl flex items-center justify-center shadow-xl group-hover:bg-primary group-hover:text-white transition-all">
        {number}
      </div>
      {!last && <div className="w-1 h-24 bg-gradient-to-b from-primary/30 to-transparent" />}
    </div>
    <div className="flex-1 pt-2 pb-12">
      <h4 className="text-lg font-black text-text-primary mb-3 uppercase tracking-tighter">{title}</h4>
      <p className="text-text-secondary text-sm font-medium leading-relaxed max-w-lg">{desc}</p>
    </div>
  </div>
);

export default function SponsorsPage() {
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
            <Target size={12} strokeWidth={3} /> Capital Allocation
          </div>
          <h1 className="text-6xl md:text-7xl font-black text-text-primary tracking-tighter mb-8 leading-[0.9]">
            Optimize Impact. <br className="hidden md:block" /> Scalable Grants.
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto font-medium leading-relaxed">
            Deploy institutional capital through sovereign smart contracts. Ensure every ALGO is allocated to verifiable, milestone-driven technical progress.
          </p>
          <div className="mt-12 flex justify-center">
             <Link href="/signup">
                <button className="bg-primary text-white text-xs font-black px-10 py-5 rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 hover:-translate-y-1 active:translate-y-0 inline-flex items-center justify-center gap-2 uppercase tracking-widest">
                  Become a Sponsor <ArrowRight size={18} strokeWidth={3} />
                </button>
             </Link>
          </div>
        </motion.section>

        {/* --- Protocol Matrix --- */}
        <section className="mb-32">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard value="100%" label="Capital Efficiency" icon={PieChart} />
            <StatCard value="Verified" label="Impact Compliance" icon={ShieldCheck} />
            <StatCard value="Real-time" label="Portfolio Audit" icon={Activity} />
            <StatCard value="Global" label="Student Supply" icon={Globe} />
          </div>
        </section>

        {/* --- Capital Advantages --- */}
        <section className="mb-32">
          <div className="text-center mb-16">
             <h2 className="text-3xl font-black uppercase tracking-tight">The Sponsor Advantage</h2>
             <p className="text-text-secondary font-medium mt-2">Redefining capital allocation with institutional rigor and Web3 transparency.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AdvantageCard
              title="Immutable Security"
              desc="Deploy funds into non-custodial smart contracts. Capital only releases upon verifiable consensus from independent auditors."
              icon={Shield}
              color="bg-primary"
            />
            <AdvantageCard
              title="Phased Release"
              desc="Eliminate capital risk by releasing funds in phases. Smart contracts protect your investment until the student delivers results."
              icon={CheckCircle}
              color="bg-indigo-600"
            />
            <AdvantageCard
              title="Audit Analytics"
              desc="Monitor your entire grant portfolio through a high-authority dashboard. Track every milestone and release in real-time."
              icon={BarChart3}
              color="bg-cyan-600"
            />
             <AdvantageCard
              title="Quorum Selection"
              desc="Designate your own audit quorum. Select trusted experts to verify technical artifacts before capital deployment."
              icon={Users}
              color="bg-violet-600"
            />
            <AdvantageCard
              title="Pulse Updates"
              desc="Receive cryptographic notifications for every protocol event—milestone submissions, consensus achievements, and released funds."
              icon={Bell}
              color="bg-slate-900"
            />
            <AdvantageCard
              title="Consolidated Reporting"
              desc="Export on-chain audit trails for institutional compliance. Complete visibility into every ALGO unit's lifecycle."
              icon={FileText}
              color="bg-slate-900"
            />
          </div>
        </section>

        {/* --- Allocation Lifecycle --- */}
        <section className="mb-32 bg-white border border-border rounded-[48px] p-12 lg:p-20 shadow-premium relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-indigo-500 to-primary" />
           
           <div className="grid lg:grid-cols-5 gap-16">
              <div className="lg:col-span-2">
                 <h2 className="text-4xl font-black mb-6 tracking-tight leading-tight uppercase tracking-tighter">The Allocation <br /> Lifecycle</h2>
                 <p className="text-text-secondary font-medium leading-relaxed mb-10">
                   From authorization to impact—a streamlined sequence for institutional capital.
                 </p>
                 <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
                    <div className="flex items-center gap-3 text-primary text-xs font-black uppercase mb-2">
                       <Zap size={16} /> Instant Execution
                    </div>
                    <p className="text-[10px] font-bold text-text-secondary uppercase leading-relaxed">
                       Built on Algorand&apos;s high-performance settlement layer with zero administrative latency.
                    </p>
                 </div>
              </div>
              
              <div className="lg:col-span-3 space-y-4 pt-4">
                 <ProcessStep
                    number={1}
                    title="Initialize Node"
                    desc="Authorize your sponsor identity via Pera Wallet. Secure, passwordless access to the capital allocation console."
                 />
                 <ProcessStep
                    number={2}
                    title="Design Governance"
                    desc="Configure grant parameters—milestone frequency, release amounts, and the designated auditor quorum."
                 />
                 <ProcessStep
                    number={3}
                    title="Initialize Escrow"
                    desc="Deploy ALGO into the non-custodial smart contract escrow. Capital is cryptographically reserved for student phases."
                 />
                 <ProcessStep
                    number={4}
                    title="Monitor Performance"
                    desc="Track student artifact submissions and consensus progress via your sovereign portfolio dashboard."
                    last
                 />
              </div>
           </div>
        </section>

        {/* --- Global Action Banner --- */}
        <motion.section
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-[56px] bg-text-primary p-16 lg:p-24 text-center shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#4F46E5,transparent)] opacity-20 pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1E293B_1px,transparent_1px),linear-gradient(to_bottom,#1E293B_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
          
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight leading-[0.95] uppercase tracking-tighter">Initialize Your <br /> Portfolio.</h2>
            <p className="text-gray-400 text-xl font-medium mb-12 leading-relaxed">
              Activate your institutional capital node today and start funding the next generation of building blocks.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <button className="bg-primary text-white text-xs font-black px-10 py-5 rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2 uppercase tracking-widest">
                  Get Started <ArrowRight size={18} strokeWidth={3} />
                </button>
              </Link>
              <Link href="/how-it-works">
                <button className="bg-white/10 text-white border border-white/20 text-xs font-black px-10 py-5 rounded-2xl hover:bg-white/20 transition-all backdrop-blur-md uppercase tracking-widest">
                  Protocol Audit
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
