'use client';

import { useState } from 'react';
import Toast, { ToastType } from './Toast';

interface FileUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  accept?: string;
}

export default function FileUpload({ label, value, onChange, accept }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
    message: '',
    type: 'info',
    isVisible: false,
  });

  const showToast = (message: string, type: ToastType = 'error') => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast({ ...toast, isVisible: false });
  };

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
        showToast('File uploaded successfully!', 'success');
      } else {
        showToast('Upload failed. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showToast('Upload failed. Please try again.', 'error');
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
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
}

