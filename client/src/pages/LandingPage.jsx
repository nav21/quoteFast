import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  const flowRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    const steps = flowRef.current?.querySelectorAll('.flow-step');
    steps?.forEach((step) => observer.observe(step));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-dark">
      {/* ===== NAV ===== */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-dark/60 backdrop-blur-xl border-b border-gold/10">
        <span className="font-display text-xl font-bold text-cream">
          Quote<span className="text-gold">Fast</span>
        </span>
        <div className="flex items-center gap-5">
          <Link to="/login" className="text-sm text-cream/50 hover:text-cream/80 transition-colors duration-200">
            Log In
          </Link>
          <Link
            to="/signup"
            className="bg-gold text-dark text-sm font-bold px-5 py-2 rounded-lg hover:bg-gold-light transition-colors duration-200"
          >
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="relative min-h-[70vh] flex items-center justify-center px-6 py-12 overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-dark" />

        {/* Gradient orbs */}
        <div
          className="absolute -top-24 -right-20 w-[400px] h-[400px] rounded-full opacity-80"
          style={{
            background: 'radial-gradient(circle, rgba(27,42,74,0.8) 0%, transparent 70%)',
            filter: 'blur(80px)',
            animation: 'orbFloat1 18s ease-in-out infinite',
          }}
        />
        <div
          className="absolute -bottom-16 -left-10 w-[300px] h-[300px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(212,168,67,0.25) 0%, transparent 70%)',
            filter: 'blur(80px)',
            animation: 'orbFloat2 15s ease-in-out infinite',
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-[200px] h-[200px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(212,168,67,0.1) 0%, transparent 70%)',
            filter: 'blur(60px)',
            animation: 'orbFloat3 20s ease-in-out infinite',
          }}
        />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(212,168,67,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(212,168,67,0.03) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            animation: 'gridDrift 30s linear infinite',
          }}
        />

        {/* Noise texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'repeating-conic-gradient(rgba(253,251,247,0.015) 0% 25%, transparent 0% 50%) 0 0 / 3px 3px',
          }}
        />

        {/* Gold accent line */}
        <div className="absolute top-0 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

        {/* Hero content */}
        <div className="relative z-10 text-center max-w-[620px]">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[2.5px] text-gold bg-gold/[0.08] border border-gold/15 px-5 py-2 rounded-full mb-6"
            style={{ animation: 'fadeSlideUp 500ms ease-out both' }}
          >
            <span
              className="w-1.5 h-1.5 bg-gold rounded-full"
              style={{
                boxShadow: '0 0 8px rgba(212,168,67,0.6)',
                animation: 'glowPulse 2s ease-in-out infinite',
              }}
            />
            AI-Powered Quoting
          </div>

          {/* Headline */}
          <h1
            className="font-display text-5xl sm:text-6xl font-bold text-cream leading-[1.1] tracking-tight mb-5"
            style={{ animation: 'fadeSlideUp 600ms ease-out 100ms both' }}
          >
            Professional Quotes
            <br />
            in Under{' '}
            <em className="italic text-gold relative">
              60 Seconds
              <span className="absolute bottom-0.5 left-0 right-0 h-0.5 bg-gradient-to-r from-gold to-transparent opacity-40" />
            </em>
          </h1>

          {/* Subtext */}
          <p
            className="text-lg text-cream/50 leading-relaxed mb-8 max-w-[500px] mx-auto"
            style={{ animation: 'fadeSlideUp 600ms ease-out 250ms both' }}
          >
            Describe the job in plain English. AI builds the line items.
            Send a link. Client approves on their phone.
          </p>

          {/* CTAs */}
          <div
            className="flex gap-3.5 justify-center flex-wrap"
            style={{ animation: 'fadeSlideUp 600ms ease-out 400ms both' }}
          >
            <Link
              to="/signup"
              className="bg-gold text-dark px-10 py-4 rounded-xl text-base font-bold hover:bg-gold-light transition-all duration-200"
              style={{ boxShadow: '0 0 20px rgba(212,168,67,0.25), 0 4px 12px rgba(0,0,0,0.3)' }}
            >
              Get Started Free
            </Link>
            <a
              href="#how-it-works"
              className="bg-cream/5 text-cream/70 px-10 py-4 rounded-xl text-base font-semibold border border-cream/10 hover:bg-cream/10 hover:text-cream transition-all duration-200"
            >
              See How It Works
            </a>
          </div>
        </div>
      </section>

      {/* ===== FLOW STRIP ===== */}
      <section id="how-it-works" className="relative bg-dark-deep px-6 py-14" ref={flowRef}>
        {/* Gold hairline top */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

        <div className="max-w-3xl mx-auto bg-cream/[0.03] border border-gold/[0.08] rounded-2xl p-8 sm:p-10 backdrop-blur-sm">
          <p className="text-center text-xs font-bold uppercase tracking-[3px] text-gold mb-8">
            How It Works
          </p>
          <div className="flex flex-col sm:flex-row gap-8 sm:gap-0">
            {/* Step 1 */}
            <div className="flow-step flex-1 text-center px-4 relative sm:border-r sm:border-gold/10 sm:last:border-r-0">
              <div className="w-12 h-12 mx-auto mb-3 bg-gold/[0.08] border border-gold/[0.12] rounded-xl flex items-center justify-center font-display text-lg font-bold text-gold">
                01
              </div>
              <h3 className="text-base font-bold text-cream mb-1.5">Describe the Job</h3>
              <p className="text-sm text-cream/40 leading-relaxed">
                Type what the client needs in plain English. Like texting a coworker.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flow-step flex-1 text-center px-4 relative sm:border-r sm:border-gold/10 sm:last:border-r-0" style={{ transitionDelay: '150ms' }}>
              <div className="w-12 h-12 mx-auto mb-3 bg-gold/[0.08] border border-gold/[0.12] rounded-xl flex items-center justify-center font-display text-lg font-bold text-gold">
                02
              </div>
              <h3 className="text-base font-bold text-cream mb-1.5">AI Builds the Quote</h3>
              <p className="text-sm text-cream/40 leading-relaxed">
                Line items, pricing, and terms generated from your service catalog.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flow-step flex-1 text-center px-4 relative" style={{ transitionDelay: '300ms' }}>
              <div className="w-12 h-12 mx-auto mb-3 bg-gold/[0.08] border border-gold/[0.12] rounded-xl flex items-center justify-center font-display text-lg font-bold text-gold">
                03
              </div>
              <h3 className="text-base font-bold text-cream mb-1.5">Client Approves</h3>
              <p className="text-sm text-cream/40 leading-relaxed">
                Share a link. They see a branded quote and approve with one tap.
              </p>
            </div>
          </div>
        </div>

        {/* Gold hairline bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      </section>

      {/* ===== CLOSING CTA ===== */}
      <section className="relative bg-dark px-6 py-14 text-center overflow-hidden">
        {/* Gold glow behind headline */}
        <div
          className="absolute top-[-60px] left-1/2 -translate-x-1/2 w-[300px] h-[120px] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse, rgba(212,168,67,0.12) 0%, transparent 70%)',
            filter: 'blur(30px)',
          }}
        />
        <h2 className="relative z-10 font-display text-3xl sm:text-4xl font-bold text-cream mb-3">
          Stop writing quotes by hand.
        </h2>
        <p className="relative z-10 text-base text-cream/40 mb-6">
          Free to start. No credit card required.
        </p>
        <Link
          to="/signup"
          className="relative z-10 inline-block bg-gold text-dark px-10 py-4 rounded-xl text-base font-bold hover:bg-gold-light transition-all duration-200"
          style={{ boxShadow: '0 0 24px rgba(212,168,67,0.2)' }}
        >
          Create Your First Quote
        </Link>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-dark-deepest px-6 py-4 text-center text-xs text-cream/20 border-t border-gold/5">
        &copy; 2026 QuoteFast. Built with care for people who build things.
      </footer>
    </div>
  );
}
