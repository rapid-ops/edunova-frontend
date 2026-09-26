'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import FileUpload from '@/components/ui/FileUpload';
import api from '@/lib/api';

export default function ProfilePage() {
  const router = useRouter();
  const { user, setAuth, logout } = useAuthStore();
  const [form, setForm] = useState({ full_name: '', email: '' });
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [avatar, setAvatar] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ full_name: user.full_name, email: user.email });
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await api.put(`/auth/profile/${user?.id}`, form);
      const updated = { ...user!, ...res.data.user };
      setAuth(updated, localStorage.getItem('token')!);
      setSuccess('Profile updated');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await api.put(`/auth/password/${user?.id}`, {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      setSuccess('Password updated');
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const getRoleRoute = () => {
    const role = user?.role;
    if (role === 'super_admin') return '/dashboard';
    if (role === 'school_admin') return '/school-admin';
    if (role === 'teacher') return '/teacher';
    if (role === 'student') return '/student';
    return '/dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
        <button onClick={() => router.push(getRoleRoute())} className="text-gray-500 hover:text-gray-900">←</button>
        <h1 className="text-xl font-bold">Profile Settings</h1>
      </div>

      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {success && <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-4 py-3 rounded-lg">{success}</div>}
        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">{error}</div>}

        {/* Avatar */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="font-semibold mb-4">Profile Picture</h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-xl font-bold overflow-hidden">
              {avatar ? (
                <img src={avatar} className="w-full h-full object-cover" />
              ) : (
                user?.full_name?.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <p className="font-medium">{user?.full_name}</p>
              <p className="text-gray-500 text-sm capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>
          <FileUpload
            endpoint="/upload/avatar"
            label="Upload new photo"
            accept={{ 'image/*': ['.jpg', '.jpeg', '.png'] }}
            onSuccess={(url) => setAvatar(url)}
          />
        </div>

        {/* Profile Info */}
        <form onSubmit={handleProfileUpdate} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold">Personal Information</h2>
          <div>
            <label className="text-gray-500 text-sm mb-1 block">Full Name</label>
            <input
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="w-full bg-gray-100 text-gray-900 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="text-gray-500 text-sm mb-1 block">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-gray-100 text-gray-900 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-gray-900 px-6 py-2 rounded-lg text-sm disabled:opacity-50"
          >
            Save Changes
          </button>
        </form>

        {/* Password */}
        <form onSubmit={handlePasswordUpdate} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold">Change Password</h2>
          {[
            { key: 'current_password', label: 'Current Password' },
            { key: 'new_password', label: 'New Password' },
            { key: 'confirm_password', label: 'Confirm New Password' },
          ].map((f) => (
            <div key={f.key}>
              <label className="text-gray-500 text-sm mb-1 block">{f.label}</label>
              <input
                type="password"
                value={(passwordForm as any)[f.key]}
                onChange={(e) => setPasswordForm({ ...passwordForm, [f.key]: e.target.value })}
                className="w-full bg-gray-100 text-gray-900 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                required
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-gray-900 px-6 py-2 rounded-lg text-sm disabled:opacity-50"
          >
            Update Password
          </button>
        </form>

        {/* Danger zone */}
        <div className="bg-white border border-red-500/20 rounded-xl p-6">
          <h2 className="font-semibold text-red-400 mb-2">Danger Zone</h2>
          <p className="text-gray-500 text-sm mb-4">Sign out of your account on this device.</p>
          <button
            onClick={() => { logout(); router.push('/auth/login'); }}
            className="bg-red-600 hover:bg-red-700 text-gray-900 px-6 py-2 rounded-lg text-sm"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
