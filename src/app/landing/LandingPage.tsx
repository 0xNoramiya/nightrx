import { motion } from 'framer-motion';
import { useState } from 'react';
import { useStore } from '../../store/store';
import { checkServerStatus } from '../../midnight/api';

const CONTRACT_ADDRESS = '05d3e2900cf0a09f73dca91225f1594928d7dbcfcfa22bbcc4990ffcddf98ea5';
const EXPLORER_URL = 'https://preprod.midnightexplorer.com/contracts/5741';

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: [0.25, 0.4, 0.25, 1] },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

function ShieldIcon({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function LockIcon({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

function CheckCircleIcon({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function DocumentIcon({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function EyeOffIcon({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

function ArrowRightIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
  );
}

function ExternalLinkIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );
}

function ZapIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

export default function LandingPage() {
  const { setWalletConnected, setContractDeployed, setIsOnChain, setError, runDemoSetup } = useStore();
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);
    setError(null);
    try {
      const serverOnline = await checkServerStatus();
      if (serverOnline) {
        setWalletConnected(true, 'preprod');
        setContractDeployed(CONTRACT_ADDRESS);
        setIsOnChain(true);
      } else {
        runDemoSetup();
        setIsOnChain(false);
        setError('Backend not reachable — running in demo mode.');
      }
    } catch {
      runDemoSetup();
      setIsOnChain(false);
      setError('Backend not reachable — running in demo mode.');
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200/60 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-sm font-bold text-white shadow-sm">
              Rx
            </div>
            <span className="text-xl font-semibold tracking-tight text-gray-900">
              Night<span className="text-brand-600">Rx</span>
            </span>
          </div>
          <button
            onClick={handleConnect}
            disabled={connecting}
            className="btn-primary flex items-center gap-2 !py-2.5 !px-5 text-sm"
          >
            {connecting ? (
              <>
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full"
                />
                Connecting...
              </>
            ) : (
              <>
                <ZapIcon className="w-4 h-4" />
                Launch App
              </>
            )}
          </button>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial from-brand-100/40 via-transparent to-transparent pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, rgba(224,231,255,0.5) 0%, transparent 70%)' }} />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-24 pb-12 sm:pb-20">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.div
              variants={fadeUp}
              custom={0}
              className="inline-flex items-center gap-2 bg-brand-50 border border-brand-100 text-brand-700 text-xs font-medium px-4 py-1.5 rounded-full mb-8"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
              Built on Midnight Blockchain
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-[1.1] mb-6"
            >
              Prove medication eligibility{' '}
              <span className="text-brand-600">without revealing your diagnosis</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-base sm:text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto mb-8 sm:mb-10"
            >
              NightRx uses zero-knowledge proofs on Midnight to let patients prove they are eligible for medication
              — without pharmacies ever seeing their diagnosis, condition, or medical records.
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="btn-primary flex items-center gap-2 text-base"
              >
                {connecting ? 'Connecting...' : 'Get Started'}
                <ArrowRightIcon />
              </button>
              <a
                href={EXPLORER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary flex items-center gap-2 text-base"
              >
                View Contract
                <ExternalLinkIcon />
              </a>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="mt-12 sm:mt-20 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto"
          >
            {[
              { label: 'Clinic', desc: 'Issues credential', icon: <DocumentIcon className="w-6 h-6" />, color: 'brand' },
              { label: 'Patient', desc: 'Generates ZK proof', icon: <LockIcon className="w-6 h-6" />, color: 'brand' },
              { label: 'Pharmacy', desc: 'Verifies privately', icon: <CheckCircleIcon className="w-6 h-6" />, color: 'emerald' },
            ].map((step, i) => (
              <motion.div
                key={step.label}
                variants={fadeUp}
                custom={4 + i}
                className="relative"
              >
                <div className="bg-white border border-gray-200/60 rounded-2xl p-6 text-center shadow-card hover:shadow-card-hover transition-shadow">
                  <div className={`w-12 h-12 rounded-xl ${step.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 'bg-brand-50 text-brand-600'} flex items-center justify-center mx-auto mb-3`}>
                    {step.icon}
                  </div>
                  <div className="text-xs text-gray-400 font-medium mb-1">Step {i + 1}</div>
                  <div className="font-semibold text-gray-900">{step.label}</div>
                  <div className="text-sm text-gray-500 mt-1">{step.desc}</div>
                </div>
                {i < 2 && (
                  <div className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 w-8 h-8 bg-gray-100 border border-gray-200 rounded-full items-center justify-center">
                    <ArrowRightIcon className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-12 sm:py-24 bg-white border-y border-gray-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 text-xs font-medium text-red-500 bg-red-50 border border-red-100 px-4 py-1.5 rounded-full mb-6">
              The Problem
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Healthcare privacy is broken
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-gray-500 text-base sm:text-lg leading-relaxed mb-8 sm:mb-12">
              Today, patients must reveal sensitive diagnoses just to pick up a prescription.
              This leads to stigma, discrimination, and patients avoiding treatment altogether.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
            {[
              {
                icon: <EyeOffIcon className="w-6 h-6" />,
                title: 'Unnecessary Exposure',
                desc: 'Pharmacies see full diagnosis codes to dispense medication, exposing sensitive conditions.',
              },
              {
                icon: <ShieldIcon className="w-6 h-6" />,
                title: 'Fear of Stigma',
                desc: 'Patients skip medication for conditions like HIV or mental health due to fear of judgment.',
              },
              {
                icon: <DocumentIcon className="w-6 h-6" />,
                title: 'Data Breaches',
                desc: 'Centralized health records are high-value targets. Millions of records leak every year.',
              },
            ].map((item, i) => (
              <motion.div key={item.title} variants={fadeUp} custom={i} className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
                <div className="w-11 h-11 rounded-xl bg-red-50 text-red-500 flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-12 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="text-center mb-10 sm:mb-16"
          >
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 text-xs font-medium text-brand-600 bg-brand-50 border border-brand-100 px-4 py-1.5 rounded-full mb-6">
              How It Works
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Privacy through zero-knowledge proofs
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-gray-500 text-base sm:text-lg max-w-2xl mx-auto">
              Three simple steps. No diagnosis ever leaves the patient's device.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8"
          >
            {[
              {
                step: '01',
                icon: <ShieldIcon className="w-8 h-8" />,
                color: 'brand',
                title: 'Clinic Issues Credential',
                desc: 'A trusted clinic issues a private credential containing the patient\'s medication eligibility. The credential is cryptographically signed and stored only on the patient\'s device.',
              },
              {
                step: '02',
                icon: <LockIcon className="w-8 h-8" />,
                color: 'brand',
                title: 'Patient Generates ZK Proof',
                desc: 'The patient generates a zero-knowledge proof that proves "I am eligible for this medication" without revealing the underlying diagnosis or medical details.',
              },
              {
                step: '03',
                icon: <CheckCircleIcon className="w-8 h-8" />,
                color: 'emerald',
                title: 'Pharmacy Verifies Privately',
                desc: 'The pharmacy verifies the proof on Midnight\'s blockchain. They learn only that the patient is eligible -- never the diagnosis, doctor, or condition.',
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                variants={fadeUp}
                custom={i}
                className="card relative overflow-hidden group"
              >
                <div className="absolute top-4 right-4 text-6xl font-black text-gray-100 group-hover:text-gray-200 transition-colors leading-none select-none">
                  {item.step}
                </div>
                <div className={`w-14 h-14 rounded-2xl ${item.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 'bg-brand-50 text-brand-600'} flex items-center justify-center mb-5`}>
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-12 sm:py-24 bg-white border-y border-gray-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="text-center mb-10 sm:mb-16"
          >
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-200 px-4 py-1.5 rounded-full mb-6">
              Built on Midnight
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Powered by Midnight's privacy stack
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-gray-500 text-base sm:text-lg max-w-2xl mx-auto">
              Midnight provides the confidential smart contract platform that makes NightRx possible.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            {[
              {
                title: 'Zero-Knowledge Proofs',
                desc: 'Halo 2 proof system enables patients to prove eligibility without revealing any private health data.',
                icon: <LockIcon className="w-6 h-6" />,
              },
              {
                title: 'Selective Disclosure',
                desc: 'Patients choose exactly what to share. Pharmacies verify only the minimum needed to dispense.',
                icon: <EyeOffIcon className="w-6 h-6" />,
              },
              {
                title: 'Confidential Contracts',
                desc: 'Smart contract state is shielded. On-chain verification without exposing credential contents.',
                icon: <ShieldIcon className="w-6 h-6" />,
              },
            ].map((item, i) => (
              <motion.div key={item.title} variants={fadeUp} custom={i} className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
                <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="text-center"
          >
            <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 bg-gray-50 border border-gray-200 rounded-xl px-3 sm:px-5 py-3 max-w-full">
              <span className="text-xs text-gray-400 font-medium">Contract</span>
              <code className="text-xs font-mono text-gray-600 truncate max-w-[200px] sm:max-w-none">{CONTRACT_ADDRESS.slice(0, 20)}...{CONTRACT_ADDRESS.slice(-12)}</code>
              <a
                href={EXPLORER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-600 hover:text-brand-700 flex items-center gap-1 text-xs font-medium"
              >
                Explorer
                <ExternalLinkIcon className="w-3 h-3" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-10 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center"
          >
            <motion.p variants={fadeUp} custom={0} className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-6">
              Tech Stack
            </motion.p>
            <motion.div variants={fadeUp} custom={1} className="flex flex-wrap items-center justify-center gap-3">
              {[
                'Midnight SDK',
                'Compact (DSL)',
                'Halo 2 Proofs',
                'React + Vite',
                'TypeScript',
                'Framer Motion',
                'Tailwind CSS',
              ].map((tech) => (
                <span
                  key={tech}
                  className="bg-white border border-gray-200 text-gray-600 text-sm font-medium px-4 py-2 rounded-xl shadow-card"
                >
                  {tech}
                </span>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-12 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="relative bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl sm:rounded-3xl p-8 sm:p-12 lg:p-16 text-center overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/4" />

            <motion.h2
              variants={fadeUp}
              custom={0}
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 relative"
            >
              Ready to see it in action?
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="text-brand-200 text-base sm:text-lg mb-8 max-w-xl mx-auto relative"
            >
              Connect to Midnight's preprod network and try the full credential issuance, proof generation, and verification flow.
            </motion.p>
            <motion.div variants={fadeUp} custom={2} className="relative">
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="bg-white text-brand-700 font-semibold px-8 py-4 rounded-xl text-base hover:bg-brand-50 transition-all shadow-lg hover:shadow-xl active:scale-[0.98] inline-flex items-center gap-2"
              >
                {connecting ? 'Connecting...' : 'Try the Demo'}
                <ArrowRightIcon className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-gray-200/60 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-[10px] font-bold text-white">
              Rx
            </div>
            <span className="text-sm text-gray-500">
              Night<span className="text-brand-600 font-medium">Rx</span> -- Midnight Hackathon 2026
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <a href={EXPLORER_URL} target="_blank" rel="noopener noreferrer" className="hover:text-brand-600 transition-colors flex items-center gap-1">
              Midnight Explorer
              <ExternalLinkIcon className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
