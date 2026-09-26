'use client';
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import api from '@/lib/api';

interface FileUploadProps {
  endpoint: string;
  label?: string;
  accept?: Record<string, string[]>;
  onSuccess?: (url: string) => void;
  extraData?: Record<string, string>;
}

export default function FileUpload({ endpoint, label, accept, onSuccess, extraData }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState('');
  const [error, setError] = useState('');

  const onDrop = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (extraData) {
        Object.entries(extraData).forEach(([k, v]) => formData.append(k, v));
      }
      const res = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = res.data.url || res.data.submission?.file_url;
      setUploaded(url);
      onSuccess?.(url);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, [endpoint, extraData, onSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept || {
      'image/*': ['.jpg', '.jpeg', '.png'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
  });

  return (
    <div className="w-full">
      {label && <label className="text-gray-500 text-sm mb-1 block">{label}</label>}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl px-6 py-8 text-center cursor-pointer transition ${
          isDragActive ? 'border-blue-500 bg-blue-500/5' : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <p className="text-gray-500 text-sm">Uploading...</p>
        ) : uploaded ? (
          <div>
            <p className="text-green-400 text-sm">Uploaded successfully</p>
            {uploaded.match(/\.(jpg|jpeg|png)$/i) && (
              <img src={uploaded} className="mt-3 w-20 h-20 object-cover rounded-lg mx-auto" />
            )}
          </div>
        ) : (
          <div>
            <p className="text-gray-500 text-sm">
              {isDragActive ? 'Drop file here' : 'Tap or drag file to upload'}
            </p>
            <p className="text-gray-600 text-xs mt-1">Max 10MB</p>
          </div>
        )}
      </div>
      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
    </div>
  );
}
