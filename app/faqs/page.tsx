'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import {
  Wallet,
  ChevronDown,
  Search,
  HelpCircle,
  Shield,
  Zap,
  Users,
  Activity,
  Loader2,
  Bot,
  Sparkles,
  Globe,
  LifeBuoy,
  X
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
            <div className="bg-black text-white w-8 h-8 flex items-center justify-center font-bold text-lg rounded-xl shadow-lg transition-transform hover:scale-110">X</div>
            <span className="font-bold text-xl tracking-tighter">TrustFundX</span>
          </Link>
          <div className="hidden md:flex gap-8 text-[13px] font-black uppercase tracking-widest text-text-secondary">
            <Link href="/how-it-works" className="hover:text-primary transition-colors">How It Works</Link>
            <Link href="/sponsors-info" className="hover:text-primary transition-colors">Sponsors</Link>
            <Link href="/governance" className="hover:text-primary transition-colors">Governance</Link>
            <Link href="/faqs" className="text-primary transition-colors">FAQs</Link>
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

interface FAQItemProps {
  question: string;
  answer: string;
  icon: React.ElementType;
  category: string;
}

const FAQItem = ({ question, answer, icon: Icon, category }: FAQItemProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`group bg-white border ${isOpen ? 'border-primary/30 shadow-2xl ring-4 ring-primary/5' : 'border-border shadow-premium'} rounded-[24px] overflow-hidden transition-all duration-300`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-8 text-left flex items-start gap-6 hover:bg-background/50 transition-colors"
      >
        <div className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all ${isOpen ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-primary/5 text-primary group-hover:bg-primary/10'}`}>
          <Icon size={20} strokeWidth={2.5} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isOpen ? 'text-primary' : 'text-text-secondary'}`}>{category}</div>
              <h3 className="text-lg font-black text-text-primary tracking-tight">{question}</h3>
            </div>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className={`flex-shrink-0 w-8 h-8 rounded-full border border-border flex items-center justify-center ${isOpen ? 'bg-primary border-primary text-white' : 'text-text-secondary group-hover:border-primary group-hover:text-primary transition-colors'}`}
            >
              <ChevronDown size={18} strokeWidth={3} />
            </motion.div>
          </div>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-8 pb-8 pl-[88px]">
              <p className="text-text-secondary font-medium leading-relaxed max-w-2xl">{answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function FAQsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const faqs = [
    {
      category: 'Protocol Core',
      icon: HelpCircle,
      question: 'What is TrustFundX?',
      answer: 'TrustFundX is a decentralized grant management layer built on Algorand. It enforces immutable funding schedules through TEAL smart contracts, ensuring total transparency between capital allocators (sponsors) and project leads (students). Every release is governed by a decentralized quorum of verified voters.'
    },
    {
      category: 'Onboarding',
      icon: Wallet,
      question: 'How do I get started?',
      answer: 'TrustFundX utilizes Pera Wallet as its primary identity provider. To begin, connect your wallet via the Authorize button. Your cryptographic address serves as your protocol ID, eliminating the need for traditional authentication while maintaining institutional-grade security.'
    },
    {
      category: 'Architecture',
      icon: Shield,
      question: 'Chain Infrastructure & Security',
      answer: 'The protocol is anchored on the Algorand blockchain, leveraging its instant finality and zero-forking guarantee. Funds are held in escrow within non-custodial smart contracts, only releasable upon the cryptographically signed approval of the designated voting quorum.'
    },
    {
      category: 'Governance',
      icon: Users,
      question: 'The Voting Quorum',
      answer: 'Voters are verified protocol participants designated during the grant initialization phase. They act as independent auditors, reviewing technical artifacts (milestone proofs) before authorizing the smart contract to release capital allocations.'
    },
    {
      category: 'Economics',
      icon: Zap,
      question: 'Instant Fund Settlement',
      answer: 'Unlike traditional grants, TrustFundX settlements are instantaneous. Once the smart contract detects the required threshold of approval signatures, it triggers an Atomic Transfer, delivering ALGO directly to the builder\'s wallet within ~3.3 seconds.'
    }
  ];

  const filteredFAQs = searchQuery
    ? faqs.filter(
      faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : faqs;

  const handleAskAi = async () => {
    if (!searchQuery.trim() || isAiLoading) return;

    setAiAnswer(null);
    setIsAiLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: searchQuery.trim() }]
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setAiAnswer(data.content);
      } else {
        setAiAnswer('**Protocol Error:** Intelligence node unreachable. Please re-initiate search.');
      }
    } catch {
      setAiAnswer('**Connectivity Warning:** Failed to synchronize with platform context.');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary selection:bg-primary/10 pb-32">
      <Navbar />

      <main className="max-w-7xl mx-auto px-8 pt-40">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-24"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/5 text-primary rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 border border-primary/10 shadow-sm">
            <Globe size={12} strokeWidth={3} /> Intelligence Hub
          </div>
          <h1 className="text-6xl md:text-7xl font-black text-text-primary tracking-tighter mb-8 leading-[0.9]">
            Autonomous <br className="hidden md:block" /> Protocol Support
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto font-medium leading-relaxed">
            Synchronize with the TrustFundX ecosystem through our decentralized knowledge base and AI-driven assistant.
          </p>
        </motion.section>

        {/* --- Search & AI Assistant --- */}
        <section className="mb-24 relative z-10">
          <div className="max-w-3xl mx-auto">
            <div className={`group relative p-2 rounded-[32px] bg-white border-2 transition-all duration-500 shadow-2xl flex items-center ${searchQuery ? 'border-primary ring-[12px] ring-primary/5' : 'border-border'}`}>
              <div className="pl-6 pr-4 text-text-secondary group-focus-within:text-primary transition-colors">
                <Search size={24} strokeWidth={2.5} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (aiAnswer) setAiAnswer(null);
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleAskAi()}
                placeholder="Search questions or ask the protocol AI..."
                className="flex-1 py-5 bg-transparent text-lg font-bold text-text-primary outline-none placeholder:text-gray-400"
              />
              <div className="flex gap-2 pr-2">
                {searchQuery && (
                  <button
                    onClick={handleAskAi}
                    disabled={isAiLoading}
                    className="flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-[20px] font-black hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-primary/20"
                  >
                    {isAiLoading ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} strokeWidth={2.5} />}
                    <span className="hidden sm:inline uppercase tracking-widest text-xs">Ask AI</span>
                  </button>
                )}
              </div>
            </div>

            <AnimatePresence>
              {(aiAnswer || isAiLoading) && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="mt-8 bg-white border border-primary/20 rounded-[40px] shadow-2xl p-10 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-primary">
                    <Bot size={180} />
                  </div>

                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                        <Bot size={24} />
                      </div>
                      <div>
                        <h4 className="text-sm font-black uppercase tracking-widest text-text-primary">Protocol Assistant</h4>
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-primary uppercase tracking-tighter">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" /> Platform Context Synced
                        </div>
                      </div>
                    </div>
                    <button onClick={() => setAiAnswer(null)} className="p-2 hover:bg-background rounded-full transition-all border border-border text-text-secondary"><X size={18} strokeWidth={3} /></button>
                  </div>

                  {isAiLoading ? (
                    <div className="flex items-center gap-4 py-8">
                      <div className="flex gap-2">
                        {[0.2, 0.4, 0.6].map((delay, i) => (
                          <motion.div
                            key={i}
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 1, delay }}
                            className="w-2 h-2 bg-primary rounded-full"
                          />
                        ))}
                      </div>
                      <span className="text-text-secondary font-black text-xs uppercase tracking-widest animate-pulse">Analyzing Ledger Context...</span>
                    </div>
                  ) : (
                    <div className="prose prose-slate max-w-none prose-p:text-text-secondary prose-p:font-medium prose-p:leading-relaxed prose-headings:text-text-primary prose-headings:font-black prose-strong:text-text-primary prose-strong:font-black prose-li:text-text-secondary">
                      <ReactMarkdown>
                        {aiAnswer || ''}
                      </ReactMarkdown>
                    </div>
                  )}

                  <div className="mt-10 pt-8 border-t border-border flex items-center justify-end">
                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Autonomous Response Node</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* --- FAQ Matrix --- */}
        <section className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 gap-6">
            {filteredFAQs.map((faq, i) => (
              <FAQItem key={i} {...faq} />
            ))}
          </div>

          {filteredFAQs.length === 0 && !aiAnswer && !isAiLoading && (
            <div className="text-center py-32 bg-white border border-dashed border-border rounded-[40px]">
              <LifeBuoy size={64} className="text-border mx-auto mb-6" strokeWidth={1} />
              <h3 className="text-2xl font-black text-text-primary mb-2">No results matching "{searchQuery}"</h3>
              <p className="text-text-secondary font-medium mb-10 max-w-sm mx-auto">The protocol knowledge base doesn't have a direct answer. Consult the AI Assistant for a custom response.</p>
              <button
                onClick={handleAskAi}
                className="bg-primary text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-xs"
              >
                Ask Protocol AI
              </button>
            </div>
          )}
        </section>

        <Footer />
      </main>
    </div>
  );
}
