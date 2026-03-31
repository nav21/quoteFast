import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AuthLayout from '../components/AuthLayout.jsx';

export default function LoginPage() {
  const { user, login, resendVerification, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const justVerified = searchParams.get('verified') === 'true';

  useEffect(() => {
    if (user) {
      navigate(user.onboardingCompleted ? '/dashboard' : '/onboarding', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (justVerified) {
      const timeout = setTimeout(() => {
        setSearchParams({}, { replace: true });
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [justVerified, setSearchParams]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse font-display text-2xl text-navy">QuoteFast</div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const loggedInUser = await login(email.trim(), password);
      navigate(loggedInUser.onboardingCompleted ? '/dashboard' : '/onboarding', { replace: true });
    } catch (err) {
      if (err.requiresVerification) {
        setNeedsVerification(true);
        setVerifyEmail(email.trim());
        setError('');
      } else {
        setError(err.message || 'Unable to log in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setResendSuccess(false);
    try {
      await resendVerification(verifyEmail);
      setResendSuccess(true);
    } catch (err) {
      // Silently handle
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} noValidate>
        <h2 className="font-display text-xl text-navy mb-6">Welcome back</h2>

        {justVerified && (
          <div className="mb-5 px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
            Email verified! You can now log in.
          </div>
        )}

        {needsVerification && (
          <div className="mb-5 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
            <p className="mb-2">Please verify your email before logging in.</p>
            {resendSuccess ? (
              <p className="text-emerald-700 text-xs">Verification email resent!</p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="text-xs text-gold-dark font-medium hover:text-gold transition-colors disabled:opacity-50 cursor-pointer"
              >
                {resending ? 'Sending...' : 'Resend verification email'}
              </button>
            )}
          </div>
        )}

        {error && (
          <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-navy/70 mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full h-12 px-4 text-base rounded-lg border border-navy/20 bg-cream/50 text-navy placeholder:text-navy/30 outline-none transition-all focus:border-gold focus:ring-2 focus:ring-gold/20"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-navy/70 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full h-12 px-4 pr-12 text-base rounded-lg border border-navy/20 bg-cream/50 text-navy placeholder:text-navy/30 outline-none transition-all focus:border-gold focus:ring-2 focus:ring-gold/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-navy/40 hover:text-navy/70 transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 0 0-1.06 1.06l14.5 14.5a.75.75 0 1 0 1.06-1.06l-1.745-1.745a10.029 10.029 0 0 0 3.3-4.38 1.651 1.651 0 0 0 0-1.185A10.004 10.004 0 0 0 9.999 3a9.956 9.956 0 0 0-4.744 1.194L3.28 2.22ZM7.752 6.69l1.092 1.092a2.5 2.5 0 0 1 3.374 3.373l1.092 1.092a4 4 0 0 0-5.558-5.558Z" clipRule="evenodd" />
                    <path d="m10.748 13.93 2.523 2.523a9.987 9.987 0 0 1-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 0 1 0-1.186A10.007 10.007 0 0 1 4.592 5.53L6.72 7.662a4 4 0 0 0 4.028 6.268Z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                    <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full h-12 rounded-lg bg-gold text-navy font-semibold text-base transition-all hover:bg-gold-light active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Logging in...
            </span>
          ) : (
            'Log In'
          )}
        </button>

        <p className="mt-6 text-center text-sm text-navy/60">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="text-gold-dark font-medium hover:text-gold transition-colors">
            Sign Up
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
