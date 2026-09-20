'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function ImportPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('school_id', '1');
      const res = await api.post('/import/students', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const csv = 'full_name,email,password\nJohn Doe,john@school.com,password123\nJane Smith,jane@school.com,password123';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student-import-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center gap-3">
        <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-white">←</button>
        <h1 className="text-xl font-bold">Bulk Import Students</h1>
      </div>

      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="font-semibold mb-2">CSV Format</h2>
          <p className="text-gray-400 text-sm mb-4">
            Your CSV must have these columns: <span className="text-blue-400">full_name, email, password</span>
          </p>
          <button
            onClick={downloadTemplate}
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm"
          >
            Download Template
          </button>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold">Upload CSV</h2>
          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
              id="csv-input"
            />
            <label htmlFor="csv-input" className="cursor-pointer">
              <p className="text-gray-400 text-sm">
                {file ? file.name : 'Tap to select CSV file'}
              </p>
            </label>
          </div>

          <button
            onClick={handleImport}
            disabled={!file || loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {loading ? 'Importing...' : 'Import Students'}
          </button>
        </div>

        {result && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="font-semibold mb-4">Import Results</h2>
            <div className="flex gap-4 mb-4">
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3 flex-1 text-center">
                <p className="text-green-400 text-2xl font-bold">{result.imported}</p>
                <p className="text-gray-400 text-sm">Imported</p>
              </div>
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 flex-1 text-center">
                <p className="text-red-400 text-2xl font-bold">{result.failed}</p>
                <p className="text-gray-400 text-sm">Failed</p>
              </div>
            </div>

            {result.errors.length > 0 && (
              <>
                <p className="text-gray-400 text-sm font-medium mb-2">Errors:</p>
                <div className="space-y-2">
                  {result.errors.map((e: any, i: number) => (
                    <div key={i} className="bg-red-500/5 border border-red-500/20 rounded-lg px-3 py-2">
                      <p className="text-red-400 text-sm">{e.email} — {e.error}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
