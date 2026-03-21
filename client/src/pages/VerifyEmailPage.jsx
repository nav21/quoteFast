import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import AuthLayout from '../components/AuthLayout.jsx';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resendVerification } = useAuth();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMsg('No verification token provided.');
      return;
    }

    api.fetch('/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    })
      .then(() => {
        setStatus('success');
        setTimeout(() => navigate('/login?verified=true', { replace: true }), 2000);
      })
      .catch((err) => {
        setStatus('error');
        setErrorMsg(err.message || 'Verification failed.');
      });
  }, [token, navigate]);

  const handleResend = async () => {
    if (!resendEmail.trim()) return;
    setResending(true);
    setResendSuccess(false);
    try {
      await resendVerification(resendEmail.trim());
      setResendSuccess(true);
    } catch (err) {
      // Silently handle
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout>
      <div className="text-center">
        {status === 'verifying' && (
          <>
            <svg className="animate-spin h-8 w-8 mx-auto mb-4 text-navy/30" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-navy/60 text-sm">Verifying your email...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="font-display text-xl text-navy mb-2">Email Verified!</h2>
            <p className="text-navy/60 text-sm">Redirecting to login...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-8 h-8 text-red-400">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="font-display text-xl text-navy mb-2">Verification Failed</h2>
            <p className="text-navy/60 text-sm mb-6">{errorMsg}</p>

            <div className="text-left space-y-3">
              <p className="text-xs text-navy/50">Enter your email to get a new verification link:</p>
              <input
                type="email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full h-12 px-4 text-base rounded-lg border border-navy/20 bg-cream/50 text-navy placeholder:text-navy/30 outline-none transition-all focus:border-gold focus:ring-2 focus:ring-gold/20"
              />
              {resendSuccess && (
                <p className="text-emerald-700 text-xs">New verification email sent!</p>
              )}
              <button
                onClick={handleResend}
                disabled={resending || !resendEmail.trim()}
                className="w-full h-12 rounded-lg bg-gold text-navy font-semibold text-sm transition-all hover:bg-gold-light active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {resending ? 'Sending...' : 'Resend Verification Email'}
              </button>
            </div>

            <div className="mt-6 pt-5 border-t border-navy/10">
              <Link to="/login" className="text-sm text-navy/60 hover:text-navy transition-colors">
                Back to Log In
              </Link>
            </div>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
