'use client';

import { useState } from 'react';

interface FileUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  accept?: string;
}

export default function FileUpload({ label, value, onChange, accept }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.url) {
        onChange(data.url);
      } else {
        alert('Upload failed. Please try again.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <div className="flex gap-2">
        <input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
          id={`file-${label.replace(/\s+/g, '-')}`}
        />
        <label
          htmlFor={`file-${label.replace(/\s+/g, '-')}`}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-center disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : value ? 'Change File' : 'Choose File'}
        </label>
        {value && (
          <input
            type="text"
            value={value}
            readOnly
            className="flex-2 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
            placeholder="File URL"
          />
        )}
      </div>
      {value && (
        <p className="text-xs text-gray-500 mt-1 truncate">{value}</p>
      )}
    </div>
  );
}

