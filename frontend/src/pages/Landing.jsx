import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  Menu, X, ArrowRight, Sparkles, Heart, Captions, ShieldAlert,
  MessageSquareText, GraduationCap, Mic, Code2, Bot, BrainCircuit,
  Terminal, Cpu, Check, Send, Star, Quote, Twitter, Github, ChevronLeft, ChevronRight,
  Linkedin, Instagram, Handshake,
} from "lucide-react";
import campusImage from '../assets/campus-green-building.webp';

/* --- DATA CONFIG --- */
const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Career Suite", href: "#career" },
  { label: "Feedback", href: "#feedback" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "#contact" },
];

const FEATURES = [
  {
    icon: Mic,
    title: "AI Interview",
    description: "Practice with our AI interviewer. Get real-time feedback on answers and confidence.",
  },
  {
    icon: Heart,
    title: "AI Matchmaker",
    description: "Smart algorithms pair you with study partners and collaborators based on interests.",
  },
  {
    icon: Captions,
    title: "Auto Captioning",
    description: "Real-time AI captions for lectures and calls. Never miss a word.",
  },
  {
    icon: ShieldAlert,
    title: "Red Flag Detection",
    description: "AI-powered moderation flags harmful content before it spreads.",
  },
  {
    icon: MessageSquareText,
    title: "Threaded Discussions",
    description: "Organized context-rich threads for clubs and campus conversations.",
  },
  {
    icon: GraduationCap,
    title: "Alumni Networking",
    description: "Bridge the gap between students and graduates. Find mentors easily.",
  },
];

const CAREER_CARDS = [
  {
    icon: Mic,
    title: "AI Mock Interviews",
    description: "Practice with our AI interviewer. Get real-time feedback on answers and confidence.",
    tags: [
      { icon: Bot, label: "Adaptive AI" },
      { icon: BrainCircuit, label: "Real-time Feedback" },
    ],
  },
  {
    icon: Code2,
    title: "Technical Assessments",
    description: "Sharpen coding skills with challenges. AI evaluates solutions for efficiency.",
    tags: [
      { icon: Terminal, label: "20+ Languages" },
      { icon: Cpu, label: "AI Code Review" },
    ],
  },
];

const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    role: "CS Senior, MIT",
    quote: "CampusConnect's AI Mock Interviews helped me nail my Google internship.",
    rating: 5,
  },
  {
    name: "James Okonkwo",
    role: "Business Major, NYU",
    quote: "The Alumni Networking feature connected me with a mentor who changed my career.",
    rating: 5,
  },
  {
    name: "Sofia Martinez",
    role: "Pre-Med, Stanford",
    quote: "Threaded Discussions keep my study group organized. No more losing messages.",
    rating: 5,
  },
  {
    name: "Alex Chen",
    role: "Engineering, UC Berkeley",
    quote: "Red Flag Detection caught misinformation before it went viral. Incredible moderation.",
    rating: 4,
  },
];

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started on campus.",
    features: [
      "AI Matchmaker (3 matches/mo)",
      "Threaded Discussions",
      "Basic Auto Captioning",
      "Community Access",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Campus Pro",
    price: "$9",
    period: "/month",
    description: "Unlock the full CampusConnect experience.",
    features: [
      "Unlimited AI Matchmaking",
      "Advanced Auto Captioning",
      "Red Flag Detection",
      "Alumni Networking",
      "AI Mock Interviews",
    ],
    cta: "Upgrade to Pro",
    highlighted: true,
  },
];

const SOCIALS = [
  { icon: Twitter, label: "Twitter", href: "#" },
  { icon: Github, label: "GitHub", href: "#" },
  { icon: Linkedin, label: "LinkedIn", href: "#" },
  { icon: Instagram, label: "Instagram", href: "#" },
];

/* --- ANIMATION COMPONENT --- */
function Reveal({ children, className = "", delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* --- MAIN COMPONENT --- */
export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const nextScrolled = window.scrollY > 20;
        setScrolled((prev) => (prev === nextScrolled ? prev : nextScrolled));
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handlePrevTestimonial = () => {
    setActiveTestimonial((prev) => (prev === 0 ? TESTIMONIALS.length - 1 : prev - 1));
  };

  const handleNextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleContact = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setContactSubmitted(true);
    setContactForm({ name: "", email: "", message: "" });
    setIsSubmitting(false);
    setTimeout(() => setContactSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-cyan-500/30">

      {/* ====== NAVBAR ====== */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled
          ? "bg-slate-950/80 shadow-lg shadow-cyan-500/5 backdrop-blur-xl border-b border-slate-800/50"
          : "bg-transparent py-4"
          }`}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <a href="#" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500 transition-transform group-hover:scale-110">
              <Handshake className="h-5 w-5 text-slate-50" />
            </div>
            <span className="text-lg font-bold tracking-tight">CampusConnect</span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-sm font-medium text-slate-400 transition-colors hover:text-slate-50"
              >
                {l.label}
              </a>
            ))}
          </div>

          <a
            href="/auth"
            className="hidden md:inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-50 transition-all hover:bg-cyan-500 hover:shadow-lg hover:shadow-cyan-500/25"
          >
            Join Now
          </a>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-50 md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-t border-slate-800/50 bg-slate-950/95 backdrop-blur-xl md:hidden"
            >
              <div className="flex flex-col gap-1 px-6 py-4">
                {NAV_LINKS.map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-4 py-3 text-sm font-medium text-slate-400 hover:bg-slate-800/50 hover:text-slate-50"
                  >
                    {l.label}
                  </a>
                ))}
                <a
                  href="/auth"
                  onClick={() => setMobileOpen(false)}
                  className="mt-2 flex items-center justify-center rounded-lg bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-50 hover:bg-cyan-500/90"
                >
                  Join Now
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ====== HERO SECTION ====== */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-20">
        {/* Background Image (Using standard img tag now) */}
        <div className="absolute inset-0 z-0">
          <img
            src={campusImage}
            alt="Campus"
            className="h-full w-full object-cover opacity-40"
          />
        </div>
        <div className="absolute inset-0 bg-slate-950/75 z-0" />

        {/* Glowing Orbs */}
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute left-1/2 top-1/2 h-125 w-125 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/20 blur-[120px]" />
          <div className="absolute right-1/4 bottom-1/3 h-75 w-75 rounded-full bg-sky-500/10 blur-[100px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-sm font-medium text-cyan-300 backdrop-blur-sm"
          >
            <Sparkles className="h-4 w-4" />
            AI-Powered Campus Platform
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-balance text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl"
          >
            Your Campus,{" "}
            <span className="bg-linear-to-r from-cyan-400 via-cyan-300 to-sky-400 bg-clip-text text-transparent">
              Supercharged
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-300 sm:text-xl"
          >
            Connect with peers, ace mock interviews, and tap into alumni networks —
            all powered by AI.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <a href="/auth" className="group inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-7 py-3.5 text-sm font-semibold transition-all hover:bg-cyan-500/90 hover:shadow-xl hover:shadow-cyan-500/25">
              Get Started Free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a href="#features" className="inline-flex items-center gap-2 rounded-xl border border-slate-600 bg-slate-900/60 px-7 py-3.5 text-sm font-semibold text-slate-300 backdrop-blur-sm transition-all hover:border-slate-500 hover:text-slate-50">
              Explore Features
            </a>
          </motion.div>
        </div>
      </section>

      {/* ====== FEATURES ====== */}
      <section id="features" className="relative px-6 py-28">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mb-16 text-center">
            <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-widest text-cyan-400">Features</span>
            <h2 className="text-3xl font-bold sm:text-5xl">Everything Your Campus Needs</h2>
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.08}>
                <div className="group relative flex h-full flex-col rounded-2xl border border-slate-800/60 bg-slate-900/40 p-7 transition-all hover:border-cyan-500/30 hover:bg-slate-900/60 hover:scale-105">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20">
                    <f.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
                  <p className="text-sm text-slate-400">{f.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ====== CAREER SUITE ====== */}
      <section id="career" className="relative px-6 py-28 bg-cyan-900/10">
        <div className="relative z-10 mx-auto max-w-6xl">
          <Reveal className="mb-16 text-center">
            <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-widest text-cyan-400">Career Suite</span>
            <h2 className="text-3xl font-bold sm:text-5xl">Launch Your Career</h2>
          </Reveal>

          <div className="grid gap-6 md:grid-cols-2">
            {CAREER_CARDS.map((c, i) => (
              <Reveal key={c.title} delay={i * 0.12}>
                <div className="group relative h-full rounded-2xl border border-slate-800/60 bg-slate-900/50 p-8 hover:border-cyan-500/30">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
                    <c.icon className="h-7 w-7" />
                  </div>
                  <h3 className="mb-3 text-2xl font-bold">{c.title}</h3>
                  <p className="mb-8 text-slate-400">{c.description}</p>
                  <div className="flex flex-wrap gap-3">
                    {c.tags.map((t) => (
                      <span key={t.label} className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/50 px-4 py-2.5 text-sm text-slate-300">
                        <t.icon className="h-4 w-4 text-cyan-400" />
                        {t.label}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ====== PRICING ====== */}
      <section id="pricing" className="relative px-6 py-28">
        <div className="mx-auto max-w-5xl">
          <Reveal className="mb-16 text-center">
            <h2 className="text-3xl font-bold sm:text-5xl">Pricing</h2>
            <p className="mt-4 text-slate-400">Choose the plan that works best for you and your team.</p>
          </Reveal>

          <div className="grid gap-6 md:grid-cols-2">
            {PLANS.map((p, i) => (
              <Reveal key={p.name} delay={i * 0.12}>
                <div className="relative flex h-full flex-col rounded-2xl border p-8 border-cyan-500/40 bg-slate-900/60">
                  {p.highlighted && <span className="absolute right-6 top-6 rounded-full bg-cyan-500/15 px-3 py-1 text-xs font-semibold text-cyan-300">Popular</span>}
                  <h3 className="text-lg font-semibold">{p.name}</h3>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{p.price}</span>
                    <span className="text-sm text-slate-500">{p.period}</span>
                  </div>
                  <ul className="mt-8 flex flex-1 flex-col gap-3">
                    {p.features.map((feat) => (
                      <li key={feat} className="flex items-center gap-3 text-sm text-slate-300">
                        <Check className="h-4 w-4 text-cyan-400" /> {feat}
                      </li>
                    ))}
                  </ul>
                  <button className="mt-8 w-full rounded-xl py-3 text-sm font-semibold transition-all border border-slate-700 hover:bg-slate-800">
                    {p.cta}
                  </button>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ====== FEEDBACK ====== */}
      <section id="feedback" className="relative px-6 py-28">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mb-16 text-center">
            <h2 className="text-3xl font-bold sm:text-5xl">Loved by Students</h2>
          </Reveal>

          <Reveal>
            <div className="mx-auto max-w-3xl rounded-3xl border border-slate-800/60 bg-slate-900/40 p-5 sm:p-7">
              <div className="relative overflow-hidden rounded-2xl border border-slate-800/50 bg-slate-950/40 p-6 sm:p-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={TESTIMONIALS[activeTestimonial].name}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  >
                    <Quote className="mb-5 h-9 w-9 text-cyan-500/30" />
                    <p className="mb-8 text-lg leading-relaxed text-slate-300">
                      {`"${TESTIMONIALS[activeTestimonial].quote}"`}
                    </p>
                    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-800/50 pt-5">
                      <div>
                        <p className="text-base font-semibold">{TESTIMONIALS[activeTestimonial].name}</p>
                        <p className="text-sm text-slate-500">{TESTIMONIALS[activeTestimonial].role}</p>
                      </div>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="h-4 w-4 text-slate-700"
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {TESTIMONIALS.map((t, index) => (
                    <button
                      key={t.name}
                      type="button"
                      onClick={() => setActiveTestimonial(index)}
                      className="h-2.5 rounded-full transition-all w-2.5 bg-slate-700 hover:bg-slate-600"
                      aria-label={`Go to testimonial ${index + 1}`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrevTestimonial}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-900/70 text-slate-400 transition-all hover:border-slate-600 hover:text-slate-50"
                    aria-label="Previous testimonial"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextTestimonial}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-900/70 text-slate-400 transition-all hover:border-slate-600 hover:text-slate-50"
                    aria-label="Next testimonial"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ====== FOOTER ====== */}
      <footer id="contact" className="border-t border-slate-800/50 px-6 pt-20 pb-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            <div>
              <h2 className="text-3xl font-bold mb-4">Have a Question?</h2>
              <p className="text-slate-400">Drop us a message and we&apos;ll get back to you soon.</p>
            </div>
            <form onSubmit={handleContact} className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-5 sm:p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <label htmlFor="contact-name" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">Name</label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    value={contactForm.name}
                    onChange={handleContactChange}
                    placeholder="Your name"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm outline-none transition-colors focus:border-cyan-500"
                    required
                  />
                </div>
                <div className="sm:col-span-1">
                  <label htmlFor="contact-email" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">Email</label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    value={contactForm.email}
                    onChange={handleContactChange}
                    placeholder="you@campus.edu"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm outline-none transition-colors focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="contact-message" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">Message</label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={4}
                  value={contactForm.message}
                  onChange={handleContactChange}
                  placeholder="Tell us how we can help..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm outline-none transition-colors focus:border-cyan-500"
                  required
                />
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-500">We usually reply within 24 hours.</p>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 text-sm font-bold transition-all hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Send className="h-4 w-4" />
                  {isSubmitting ? "Sending..." : contactSubmitted ? "Sent!" : "Send Message"}
                </button>
              </div>

              {contactSubmitted && (
                <p className="mt-3 text-sm font-medium text-cyan-300">Thanks! Your message has been sent.</p>
              )}
            </form>
          </div>

          <div className="border-t border-slate-800/50 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Handshake className="text-cyan-500" /> <span className="font-bold">CampusConnect</span>
            </div>
            <p className="text-sm text-slate-500">© 2026 CampusConnect. All rights reserved.</p>
            <div className="flex gap-4 text-slate-500">
              {SOCIALS.map((s) => <a key={s.label} href={s.href} className="hover:text-cyan-400"><s.icon className="h-5 w-5" /></a>)}
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}