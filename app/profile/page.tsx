'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import { ArrowLeft, Camera, Save, Lock, LogOut } from 'lucide-react';
import LoadingScreen from '@/components/LoadingScreen';

export default function ProfilePage() {
  const router = useRouter();
  const { user, setAuth, logout } = useAuthStore();
  const [form, setForm] = useState({ full_name: '', email: '' });
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const getRoleRoute = () => {
    const role = user?.role;
    if (role === 'super_admin') return '/dashboard';
    if (role === 'school_admin') return '/school-admin';
    if (role === 'teacher') return '/teacher';
    if (role === 'student') return '/student';
    if (role === 'parent') return '/parent';
    return '/dashboard';
  };

  useEffect(() => {
    if (user) setForm({ full_name: user.full_name, email: user.email });
  }, [user]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post('/upload/avatar', fd);
      const url = res.data.url;
      const updated = { ...user!, avatar_url: url };
      setAuth(updated, localStorage.getItem('token')!);
      setSuccess('Profile photo updated');
    } catch {
      setError('Failed to upload photo');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      const res = await api.put(`/auth/profile/${user?.id}`, form);
      const updated = { ...user!, ...res.data.user };
      setAuth(updated, localStorage.getItem('token')!);
      setSuccess('Profile updated successfully');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update');
    } finally { setLoading(false); }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (passwordForm.new_password !== passwordForm.confirm_password) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      await api.put(`/auth/password/${user?.id}`, { current_password: passwordForm.current_password, new_password: passwordForm.new_password });
      setSuccess('Password updated successfully');
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update password');
    } finally { setLoading(false); }
  };

  if (!user) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-8">
      <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center gap-3">
        <button onClick={() => router.push(getRoleRoute())}><ArrowLeft size={20} className="text-gray-500" /></button>
        <h1 className="text-lg font-bold">Profile Settings</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {success && <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl">{success}</div>}
        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-xl font-bold overflow-hidden text-white">
                {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" alt="avatar" /> : user.full_name?.[0]?.toUpperCase()}
              </div>
              <label className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer border-2 border-white">
                {avatarUploading ? <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" /> : <Camera size={10} className="text-white" />}
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user.full_name}</p>
              <p className="text-sm text-gray-400 capitalize">{user.role?.replace('_', ' ')}</p>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleProfileUpdate} className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Personal Information</h2>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Full Name</label>
            <input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} className="w-full bg-gray-100 text-gray-900 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Email</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full bg-gray-100 text-gray-900 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <button type="submit" disabled={loading} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50">
            <Save size={15} />{loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

        <form onSubmit={handlePasswordUpdate} className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2"><Lock size={16} />Change Password</h2>
          {[
            { key: 'current_password', label: 'Current Password' },
            { key: 'new_password', label: 'New Password' },
            { key: 'confirm_password', label: 'Confirm New Password' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs text-gray-400 mb-1 block">{f.label}</label>
              <input type="password" value={(passwordForm as any)[f.key]} onChange={e => setPasswordForm({ ...passwordForm, [f.key]: e.target.value })} className="w-full bg-gray-100 text-gray-900 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••" required />
            </div>
          ))}
          <button type="submit" disabled={loading} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50">
            <Lock size={15} />{loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>

        <div className="bg-white border border-red-100 rounded-xl p-5">
          <h2 className="font-semibold text-red-500 mb-1">Sign Out</h2>
          <p className="text-gray-400 text-sm mb-4">Sign out of your account on this device.</p>
          <button onClick={() => { logout(); router.push('/auth/login'); }} className="flex items-center gap-2 bg-red-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium">
            <LogOut size={15} />Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
