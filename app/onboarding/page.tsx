'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

const STEPS = ['School Info', 'Admin Account', 'Done'];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [school, setSchool] = useState<any>(null);

  const [schoolForm, setSchoolForm] = useState({
    name: '', email: '', phone: '', address: '', subdomain: '',
  });

  const [adminForm, setAdminForm] = useState({
    full_name: '', email: '', password: '', confirm_password: '',
  });

  const handleSchoolSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Create super admin token needed — use public endpoint
      const res = await api.post('/schools/onboard', schoolForm);
      setSchool(res.data.school);
      setStep(1);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create school');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (adminForm.password !== adminForm.confirm_password) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/register', {
        full_name: adminForm.full_name,
        email: adminForm.email,
        password: adminForm.password,
        role: 'school_admin',
        school_id: school.id,
      });
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Edunova</h1>
          <p className="text-gray-500 mt-1">Set up your school in minutes</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition ${
                i < step ? 'bg-green-600 text-gray-900' :
                i === step ? 'bg-blue-600 text-gray-900' :
                'bg-gray-100 text-gray-500'
              }`}>
                {i < step ? '✓' : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-12 h-0.5 ${i < step ? 'bg-green-600' : 'bg-gray-100'}`} />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {step === 0 && (
          <form onSubmit={handleSchoolSubmit} className="bg-white rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-lg">School Information</h2>
            {[
              { key: 'name', label: 'School Name', placeholder: 'Greenfield Academy' },
              { key: 'email', label: 'School Email', placeholder: 'info@greenfield.edu.ng' },
              { key: 'phone', label: 'Phone Number', placeholder: '08012345678' },
              { key: 'address', label: 'Address', placeholder: 'Lagos, Nigeria' },
              { key: 'subdomain', label: 'Subdomain', placeholder: 'greenfield (your-school.edunova.com)' },
            ].map((f) => (
              <div key={f.key}>
                <label className="text-gray-500 text-sm mb-1 block">{f.label}</label>
                <input
                  value={(schoolForm as any)[f.key]}
                  onChange={(e) => setSchoolForm({ ...schoolForm, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  className="w-full bg-gray-100 text-gray-900 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            ))}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-gray-900 py-3 rounded-lg font-medium transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Continue'}
            </button>
          </form>
        )}

        {step === 1 && (
          <form onSubmit={handleAdminSubmit} className="bg-white rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-lg">Create Admin Account</h2>
            <p className="text-gray-500 text-sm">This will be the main administrator for {school?.name}</p>
            {[
              { key: 'full_name', label: 'Full Name', placeholder: 'John Doe', type: 'text' },
              { key: 'email', label: 'Email', placeholder: 'admin@greenfield.edu.ng', type: 'email' },
              { key: 'password', label: 'Password', placeholder: '••••••••', type: 'password' },
              { key: 'confirm_password', label: 'Confirm Password', placeholder: '••••••••', type: 'password' },
            ].map((f) => (
              <div key={f.key}>
                <label className="text-gray-500 text-sm mb-1 block">{f.label}</label>
                <input
                  type={f.type}
                  value={(adminForm as any)[f.key]}
                  onChange={(e) => setAdminForm({ ...adminForm, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  className="w-full bg-gray-100 text-gray-900 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            ))}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-gray-900 py-3 rounded-lg font-medium transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>
        )}

        {step === 2 && (
          <div className="bg-white rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-green-400 text-2xl">✓</span>
            </div>
            <h2 className="text-xl font-bold mb-2">You're all set!</h2>
            <p className="text-gray-500 text-sm mb-6">
              {school?.name} has been created on Edunova. Login with your admin account to get started.
            </p>
            <button
              onClick={() => router.push('/auth/login')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-gray-900 py-3 rounded-lg font-medium transition"
            >
              Go to Login
            </button>
          </div>
        )}

        <p className="text-center text-gray-500 text-sm mt-6">
          Already have an account?{' '}
          <button onClick={() => router.push('/auth/login')} className="text-blue-400 hover:text-blue-300">
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
