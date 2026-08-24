'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Users,
  Activity,
  Shield,
  Zap,
  Globe
} from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import Footer from './components/Footer';

// --- Blockchain Network Data ---
const networkNodes = [
  // Left side
  [5, 10], [20, 15], [35, 20], [10, 35], [25, 45],
  [5, 60], [20, 75], [35, 85], [15, 95],
  // Right side
  [65, 10], [80, 20], [95, 15], [75, 35], [90, 45],
  [65, 60], [80, 75], [95, 85], [70, 95]
];

const networkLines = [
  // Left side connections
  [5, 10, 20, 15], [20, 15, 35, 20], [5, 10, 10, 35],
  [20, 15, 25, 45], [35, 20, 25, 45], [10, 35, 25, 45],
  [10, 35, 5, 60], [25, 45, 20, 75], [5, 60, 20, 75],
  [20, 75, 35, 85], [5, 60, 15, 95], [20, 75, 15, 95],
  // Right side connections
  [65, 10, 80, 20], [80, 20, 95, 15], [65, 10, 75, 35],
  [80, 20, 90, 45], [80, 20, 75, 35], [75, 35, 90, 45],
  [75, 35, 65, 60], [90, 45, 80, 75], [65, 60, 80, 75],
  [80, 75, 95, 85], [65, 60, 70, 95], [80, 75, 70, 95],
  [90, 45, 95, 85]
];

// Generate random values once at module level (outside component)
const packetRandomValues = networkLines.map(() => ({
  speed: 2 + Math.random() * 2,
  delay: Math.random() * 4,
}));

const nodeRandomAnimations = networkNodes.map(() => ({
  duration: 4 + Math.random() * 2,
  delay: Math.random() * 2,
}));

// --- Packet Animation Hook ---
const usePackets = () =>
  useMemo(() => 
    networkLines.map(([x1, y1, x2, y2], index) => ({
      x1,
      y1,
      x2,
      y2,
      speed: packetRandomValues[index].speed,
      delay: packetRandomValues[index].delay,
    }))
  , []);

// --- Visual Background: Mesh Network with TrustFundX Logos ---
const PremiumBackground = () => {
  const packets = usePackets();

  return (
    <div className="absolute inset-0 z-0 opacity-40 pointer-events-none overflow-hidden flex justify-center items-center">
      <svg
        className="w-[120%] h-[120%] max-w-[1600px] min-w-[1200px]"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Lines */}
        <g stroke="#CBD5E1" strokeWidth="0.1">
          {networkLines.map(([x1, y1, x2, y2], idx) => (
            <motion.line
              key={`line-${idx}`}
              x1={x1} y1={y1} x2={x2} y2={y2}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: idx * 0.02 }}
            />
          ))}
        </g>

        {/* Nodes with TrustFundX Logo */}
        <g>
          {networkNodes.map(([cx, cy], idx) => (
            <motion.g
              key={`node-${idx}`}
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: nodeRandomAnimations[idx].duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: nodeRandomAnimations[idx].delay,
              }}
            >
              <g transform={`translate(${cx}, ${cy}) scale(0.1)`}>
                {/* Hexagon Border */}
                <polygon
                  points="0,-18 15.58,-9 15.58,9 0,18 -15.58,9 -15.58,-9"
                  fill="none"
                  stroke="#9CA3AF"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
                {/* TrustFundX Logo */}
                <g transform="translate(-12, -12)">
                  <path
                    d="M13.874 0h3.673l1.61 5.963h3.789l-2.588 4.5 3.624 13.533h-3.757l-2.44-9.077-5.247 9.079H8.345l8.107-14.051-1.304-4.878L4.215 24H.018Z"
                    fill="#9CA3AF"
                  />
                </g>
              </g>
            </motion.g>
          ))}
        </g>

        {/* Animated Packets */}
        <g>
          {packets.map((packet, idx) => (
            <motion.circle
              key={`packet-${idx}`}
              r="0.3"
              fill="#1C4186"
              animate={{
                cx: [packet.x1, packet.x2],
                cy: [packet.y1, packet.y2],
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: packet.speed,
                delay: packet.delay,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}
        </g>
      </svg>
    </div>
  );
};

const Navbar = () => {
  const { accountAddress, isConnected } = useWallet();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
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
        } catch (err) {
          console.error(err);
        }
      } else {
        setUserRole(null);
      }
    };
    fetchUserRole();
  }, [accountAddress, isConnected]);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${scrolled ? 'py-3 bg-white/80 backdrop-blur-md border-b border-border shadow-sm' : 'py-6 bg-transparent'
      }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="bg-black text-white w-9 h-9 flex items-center justify-center font-bold text-xl rounded-xl shadow-lg rotate-[-8deg] group-hover:rotate-0 transition-all duration-300">
            X
          </div>
          <span className="font-bold text-2xl tracking-tight text-text-primary">TrustFundX</span>
        </Link>

        <div className="hidden md:flex items-center gap-10">
          <Link href="/how-it-works" className="text-[15px] font-medium text-text-secondary hover:text-primary transition-colors">How It Works</Link>
          <Link href="/sponsors-info" className="text-[15px] font-medium text-text-secondary hover:text-primary transition-colors">Sponsors</Link>
          <Link href="/governance" className="text-[15px] font-medium text-text-secondary hover:text-primary transition-colors">Governance</Link>
          <Link href="/faqs" className="text-[15px] font-medium text-text-secondary hover:text-primary transition-colors">FAQs</Link>
        </div>

        <div className="flex items-center gap-4">
          {isConnected && userRole ? (
            <Link href={`/${userRole}s`}>
              <button className="flex items-center gap-2 bg-black text-white text-[15px] font-bold px-6 py-2.5 rounded-full hover:bg-black/90 transition-all shadow-lg hover:-translate-y-0.5 active:translate-y-0">
                <Activity size={18} strokeWidth={2.5} />
                Dashboard
              </button>
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-[15px] font-bold text-text-primary hover:text-primary transition-colors px-4">Log in</Link>
              <Link href="/signup">
                <button className="bg-primary text-white text-[15px] font-bold px-6 py-2.5 rounded-full hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0">
                  Sign up
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

const FeatureCard = ({ icon: Icon, title, desc, delay, color }: {
  icon: React.ElementType;
  title: string;
  desc: string;
  delay: number;
  color: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    className="group relative p-8 bg-white border border-border rounded-2xl shadow-premium hover:shadow-premium-hover transition-all duration-300"
  >
    <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
      <Icon size={28} className="text-white" strokeWidth={1.5} />
    </div>
    <h3 className="text-xl font-bold text-text-primary mb-3">{title}</h3>
    <p className="text-text-secondary leading-relaxed text-[15px]">{desc}</p>
  </motion.div>
);

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-background selection:bg-primary/10">
      <Navbar />

      <main className="relative z-10">
        {/* --- Hero Section with Network Background --- */}
        <section className="relative pt-44 pb-20 px-6 max-w-7xl mx-auto text-center overflow-hidden">
          {/* Network Background - Only for Hero Section */}
          <PremiumBackground />
          
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-black/5 border border-black/10 rounded-full text-black font-bold text-xs uppercase tracking-widest mb-8"
            >
              <span className="w-2 h-2 bg-black rounded-full animate-pulse" />
              Empowering Next-Gen Students on Algorand
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl md:text-8xl font-black text-text-primary tracking-tight leading-[0.95] mb-8 text-balance"
            >
              Programmable <br /> Trust for Grants
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed mb-12 text-balance"
            >
              The world&apos;s most transparent grant management protocol. Automate funding releases through on-chain milestones and community governance.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <button className="w-full sm:w-auto bg-primary text-white font-bold text-lg px-10 py-4 rounded-full shadow-2xl shadow-primary/30 hover:bg-primary/90 hover:-translate-y-1 transition-all">
                Get Started
              </button>
              <button className="w-full sm:w-auto bg-white border border-border text-text-primary font-bold text-lg px-10 py-4 rounded-full shadow-premium hover:bg-background transition-all">
                View Governance
              </button>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-20 pt-10 border-t border-border flex flex-col items-center gap-8"
            >
              <span className="text-xs font-bold text-text-secondary uppercase tracking-[0.2em]">POWERING DECENTRALIZED INNOVATION</span>
              <div className="flex flex-wrap justify-center items-center gap-12 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                <div className="flex items-center gap-2 text-2xl font-bold">ALGORAND</div>
                <div className="flex items-center gap-2 text-2xl font-bold">PERA WALLET</div>
                <div className="flex items-center gap-2 text-2xl font-bold">DAO NODE</div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* --- Core Features --- */}
        <section className="py-24 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-text-primary tracking-tight mb-4">Architected for Transparency</h2>
            <p className="text-text-secondary max-w-xl mx-auto">Every transaction, vote, and milestone is permanently recorded and cryptographically verified.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={Shield}
              color="bg-primary"
              title="Immutable Escrow"
              desc="Funds are locked in autonomous smart contracts, releasing only when cryptographic proof of completion is validated."
              delay={0.1}
            />
            <FeatureCard
              icon={Users}
              color="bg-secondary"
              title="DAO Governance"
              desc="Independent voters act as objective validators, ensuring institutional integrity without sponsor-bias."
              delay={0.2}
            />
            <FeatureCard
              icon={Zap}
              color="bg-accent"
              title="Instant Latency"
              desc="Built on Algorand's high-speed protocol for near-instant fund release and zero-trust transactions."
              delay={0.3}
            />
          </div>
        </section>

        {/* --- Infrastructure Section --- */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto bg-text-primary rounded-[32px] p-12 md:p-24 overflow-hidden relative group">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(37,99,235,0.15),transparent)] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            <div className="grid md:grid-cols-2 gap-16 items-center relative z-10">
              <div>
                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-6 leading-tight">
                  Programmable Incentives. <br /> Guaranteed Impact.
                </h2>
                <p className="text-gray-400 text-lg mb-10 leading-relaxed">
                  Traditional grants are broken. TrustFundX provides a unified infrastructure for sponsors to fund talent with 100% confidence. No manual verification, no delays, no ambiguity.
                </p>

                <div className="space-y-6">
                  {[
                    { title: "Sovereign Authentication", desc: "No passwords. Pure wallet-based identity via Pera." },
                    { title: "TEAL Smart Contracts", desc: "Execution-layer security on the Algorand virtual machine." },
                    { title: "Real-time Audits", desc: "Publicly visible ledger for every ALGO movement." }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <CheckIcon className="text-primary" size={14} strokeWidth={3} />
                      </div>
                      <div>
                        <h4 className="text-white font-bold">{item.title}</h4>
                        <p className="text-gray-500 text-sm">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-primary to-secondary/20 rounded-3xl rotate-[6deg] group-hover:rotate-[3deg] transition-transform duration-700 shadow-2xl relative z-10 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Globe size={180} className="text-white/20 animate-pulse" strokeWidth={0.5} />
                  </div>
                </div>
                <div className="absolute inset-0 border border-white/10 rounded-3xl -rotate-[6deg] group-hover:-rotate-[3deg] transition-transform duration-700" />
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}

const CheckIcon = ({ className, size, strokeWidth }: {
  className?: string;
  size: number;
  strokeWidth: number;
}) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
