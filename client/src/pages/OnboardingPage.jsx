import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../utils/api.js';
import { DEFAULT_SERVICES } from '../data/defaultServices.js';
import Step1BusinessInfo from '../components/onboarding/Step1BusinessInfo.jsx';
import Step2BrandQuotes from '../components/onboarding/Step2BrandQuotes.jsx';
import Step3Services from '../components/onboarding/Step3Services.jsx';
import Step4Summary from '../components/onboarding/Step4Summary.jsx';

const STEPS = ['Business Info', 'Brand', 'Services', 'Ready!'];

export default function OnboardingPage() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    businessName: user?.businessName || '',
    businessType: user?.businessType || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: user?.address || '',
    brandColor: user?.brandColor || '#1B2A4A',
    templateStyle: user?.templateStyle || 'clean-minimal',
  });

  const [services, setServices] = useState([]);

  useEffect(() => {
    if (user?.onboardingCompleted) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const seedServices = (businessType) => {
    const defaults = DEFAULT_SERVICES[businessType] || DEFAULT_SERVICES['Other'];
    setServices(defaults.map(s => ({ ...s, _tempId: crypto.randomUUID() })));
  };

  const handleNext = async () => {
    setError('');
    setSaving(true);

    try {
      if (currentStep === 1) {
        if (!formData.businessName.trim()) {
          setError('Business name is required.');
          setSaving(false);
          return;
        }
        if (!formData.businessType) {
          setError('Please select your business type.');
          setSaving(false);
          return;
        }
        await updateProfile({
          businessName: formData.businessName.trim(),
          businessType: formData.businessType,
          phone: formData.phone.trim(),
          address: formData.address.trim(),
        });
        if (services.length === 0) {
          seedServices(formData.businessType);
        }
      } else if (currentStep === 2) {
        await updateProfile({
          brandColor: formData.brandColor,
          templateStyle: formData.templateStyle,
        });
      } else if (currentStep === 3) {
        const validServices = services.filter(s => s.name.trim());
        if (validServices.length === 0) {
          setError('Add at least one service to continue.');
          setSaving(false);
          return;
        }
        await api.fetch('/api/services/batch', {
          method: 'POST',
          body: JSON.stringify({
            services: validServices.map(s => ({
              name: s.name.trim(),
              description: s.description || '',
              unit: s.unit,
              defaultPrice: s.defaultPrice,
              category: s.category || 'General',
            })),
          }),
        });
      } else if (currentStep === 4) {
        await updateProfile({ onboardingCompleted: true });
        navigate('/dashboard', { replace: true });
        return;
      }

      setCurrentStep(prev => prev + 1);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    setError('');
    setCurrentStep(prev => prev - 1);
  };

  const handleFormChange = (newData) => {
    // If business type changed and we had seeded services, re-seed
    if (newData.businessType !== formData.businessType && newData.businessType) {
      seedServices(newData.businessType);
    }
    setFormData(newData);
  };

  return (
    <div className="min-h-screen flex items-start justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="font-display text-2xl text-navy">Set up your account</h1>
          <p className="text-sm text-navy/50 mt-1">Step {currentStep} of {STEPS.length}</p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex gap-2 mb-2">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className="flex-1 h-1.5 rounded-full transition-colors"
                style={{ backgroundColor: i < currentStep ? '#D4A843' : '#1B2A4A1A' }}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {STEPS.map((label, i) => (
              <span
                key={label}
                className={`flex-1 text-[11px] font-medium transition-colors ${i < currentStep ? 'text-gold-dark' : i === currentStep - 1 ? 'text-navy' : 'text-navy/30'}`}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Content card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <h2 className="font-display text-lg text-navy mb-5">
            {currentStep === 1 && 'Tell us about your business'}
            {currentStep === 2 && 'Brand your quotes'}
            {currentStep === 3 && 'Your service catalog'}
            {currentStep === 4 && 'Review & finish'}
          </h2>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {currentStep === 1 && (
            <Step1BusinessInfo data={formData} onChange={handleFormChange} />
          )}
          {currentStep === 2 && (
            <Step2BrandQuotes data={formData} onChange={setFormData} />
          )}
          {currentStep === 3 && (
            <Step3Services services={services} onServicesChange={setServices} />
          )}
          {currentStep === 4 && (
            <Step4Summary
              data={formData}
              serviceCount={services.filter(s => s.name.trim()).length}
            />
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                disabled={saving}
                className="h-12 px-6 rounded-lg border border-navy/20 text-navy font-medium text-sm hover:bg-navy/5 transition-colors cursor-pointer disabled:opacity-50"
              >
                Back
              </button>
            )}
            {currentStep === 4 && (
              <button
                type="button"
                onClick={async () => {
                  setSaving(true);
                  try {
                    await updateProfile({ onboardingCompleted: true });
                    navigate('/dashboard', { replace: true });
                  } catch (err) {
                    setError(err.message || 'Something went wrong.');
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={saving}
                className="h-12 px-6 rounded-lg border border-navy/20 text-navy/60 font-medium text-sm hover:bg-navy/5 hover:text-navy transition-colors cursor-pointer disabled:opacity-50"
              >
                Skip
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              disabled={saving}
              className="flex-1 h-12 rounded-lg bg-gold text-navy font-semibold text-base transition-all hover:bg-gold-light active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {saving ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </span>
              ) : currentStep === 4 ? (
                <>
                  Create Your First Quote
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
                  </svg>
                </>
              ) : (
                'Save & Continue'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
