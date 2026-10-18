'use client';
import { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { fieldCls, iconBoxCls, inputCls } from '@/components/auth/styles';

export default function PasswordField({ id, label, value, onChange, placeholder }: { id: string; label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-[#0b1a4a]">{label} <span className="text-red-500">*</span></label>
      <div className={fieldCls}>
        <span className={iconBoxCls}><Lock className="h-4 w-4" /></span>
        <input id={id} type={show ? 'text' : 'password'} value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} placeholder={placeholder} required autoComplete="new-password" />
        <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'} className="flex h-12 w-12 items-center justify-center text-slate-500 hover:text-slate-700">
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
