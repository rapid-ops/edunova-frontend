'use client';
import { useState, useRef } from 'react';
import { Upload, Download, CheckCircle, XCircle } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL;
const TEMPLATE = 'full_name,email,phone,class_name,parent_phone,parent_email\nDare Adeola,dare@student.com,08012345678,JSS 1A,08098765432,parent@gmail.com\n';

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string[][]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  function handleFile(f: File) {
    setFile(f);
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target?.result as string;
      const rows = text.trim().split('\n').slice(0, 6).map(r => r.split(','));
      setPreview(rows);
    };
    reader.readAsText(f);
  }

  function downloadTemplate() {
    const blob = new Blob([TEMPLATE], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'student_import_template.csv';
    a.click();
  }

  async function uploadFile() {
    if (!file) return;
    setUploading(true);
    setProgress(30);
    const form = new FormData();
    form.append('file', file);
    form.append('school_id', user.school_id);
    try {
      setProgress(60);
      const res = await fetch(`${API}/api/import/students`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      setProgress(100);
      const data = await res.json();
      setResult(data);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-gray-800">Import Students</h1>
        <button onClick={downloadTemplate}
          className="text-sm text-blue-600 flex items-center gap-1 font-medium">
          <Download size={14} /> Template
        </button>
      </div>

      {/* Drop zone */}
      {!result && (
        <div
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition mb-4 ${drag ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-gray-50'}`}>
          <Upload size={32} className="mx-auto text-blue-600 mb-2" />
          <p className="font-medium text-gray-700">{file ? file.name : 'Drop CSV here or tap to browse'}</p>
          <p className="text-xs text-gray-400 mt-1">CSV format only</p>
          <input ref={inputRef} type="file" accept=".csv" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        </div>
      )}

      {/* Preview */}
      {preview.length > 0 && !result && (
        <div className="mb-4 overflow-x-auto">
          <p className="text-sm font-semibold text-gray-600 mb-2">Preview (first 5 rows):</p>
          <table className="w-full text-xs border-collapse">
            {preview.map((row, i) => (
              <tr key={i} className={i === 0 ? 'bg-blue-600 text-white' : 'border-b'}>
                {row.map((cell, j) => (
                  <td key={j} className="p-1.5 border">{cell}</td>
                ))}
              </tr>
            ))}
          </table>
        </div>
      )}

      {/* Progress */}
      {uploading && (
        <div className="mb-4">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 transition-all duration-500 rounded-full" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-center text-gray-500 mt-1">Uploading...</p>
        </div>
      )}

      {/* Upload button */}
      {file && !result && (
        <button onClick={uploadFile} disabled={uploading}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50">
          {uploading ? 'Importing...' : 'Start Import'}
        </button>
      )}

      {/* Result */}
      {result && (
        <div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <CheckCircle className="mx-auto text-green-500 mb-1" size={24} />
              <p className="text-2xl font-bold text-green-600">{result.created}</p>
              <p className="text-xs text-gray-500">Students Created</p>
            </div>
            <div className="bg-red-50 rounded-xl p-4 text-center">
              <XCircle className="mx-auto text-red-400 mb-1" size={24} />
              <p className="text-2xl font-bold text-red-500">{result.failed}</p>
              <p className="text-xs text-gray-500">Failed</p>
            </div>
          </div>

          {result.errors?.length > 0 && (
            <div className="border rounded-xl overflow-hidden mb-4">
              <p className="bg-red-50 text-red-600 text-xs font-semibold px-3 py-2">Failed Rows</p>
              {result.errors.map((e: any, i: number) => (
                <div key={i} className="px-3 py-2 border-t text-sm">
                  <span className="font-medium">{e.row}</span>
                  <span className="text-gray-400 text-xs ml-2">{e.reason}</span>
                </div>
              ))}
            </div>
          )}

          <button onClick={() => { setResult(null); setFile(null); setPreview([]); setProgress(0); }}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium">
          {result.errors?.length > 0 && (
            <button onClick={() => { const csv = "row,reason\n" + result.errors.map((e: any) => `"${e.row}","${e.reason}"`).join("\n"); const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = "import_errors.csv"; a.click(); }} className="w-full bg-red-50 text-red-600 py-3 rounded-xl font-medium mb-3">Download Error Report</button>
          )}
          <button onClick={() => { setResult(null); setFile(null); setPreview([]); setProgress(0); }} className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium">Import Another File</button>
          </button>
        </div>
      )}
    </div>
  );
}
