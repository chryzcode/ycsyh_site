'use client';

import { useState, useRef } from 'react';
import Toast, { ToastType } from './Toast';

interface FileUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  accept?: string;
}

// Maximum file sizes (in bytes) - matches backend
const MAX_FILE_SIZES = {
  image: 200 * 1024 * 1024, // 200MB
  audio: 200 * 1024 * 1024, // 200MB
  zip: 200 * 1024 * 1024, // 200MB
  default: 200 * 1024 * 1024, // 200MB
};

function getMaxFileSize(fileType: string): number {
  if (fileType.startsWith('image/')) return MAX_FILE_SIZES.image;
  if (fileType.startsWith('audio/')) return MAX_FILE_SIZES.audio;
  if (fileType.includes('zip') || fileType.includes('application/zip')) return MAX_FILE_SIZES.zip;
  return MAX_FILE_SIZES.default;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

export default function FileUpload({ label, value, onChange, accept }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);
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

    // Validate file size before upload
    const maxSize = getMaxFileSize(file.type);
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(0);
      showToast(`File size exceeds maximum allowed size of ${maxSizeMB}MB`, 'error');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setFileName(file.name);
    setFileSize(file.size);
    setUploading(true);
    setUploadProgress(0);

    // Cancel any existing upload
    if (xhrRef.current) {
      xhrRef.current.abort();
    }

    // For files larger than 4MB, use direct Cloudinary upload to avoid server body size limits
    // For smaller files, use server-side upload
    const USE_DIRECT_UPLOAD = file.size > 4 * 1024 * 1024; // 4MB threshold

    try {
      if (USE_DIRECT_UPLOAD) {
        // Direct Cloudinary upload for large files (requires CORS to be enabled in Cloudinary)
        await uploadDirectToCloudinary(file);
      } else {
        // Server-side upload for smaller files
        await uploadViaServer(file);
      }
    } catch (error) {
      console.error('Upload error:', error);
      showToast('Upload failed. Please try again.', 'error');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const uploadDirectToCloudinary = async (file: File) => {
    try {
      // Determine folder and resource type
      let folder = 'beats';
      let resourceType: 'auto' | 'image' | 'video' | 'raw' = 'auto';
      
      if (file.type.startsWith('image/')) {
        resourceType = 'image';
        folder = 'beats/images';
      } else if (file.type.startsWith('audio/')) {
        resourceType = 'video';
        folder = 'beats/audio';
      } else if (file.type.includes('zip') || file.type.includes('application/zip')) {
        resourceType = 'raw';
        folder = 'beats/trackouts';
      }

      // Get upload signature from server
      const sigRes = await fetch('/api/upload/signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder, resourceType }),
      });

      if (!sigRes.ok) {
        throw new Error('Failed to get upload signature');
      }

      const sigData = await sigRes.json();

      // Debug logging
      console.log('Signature data received:', {
        hasFolder: !!sigData.folder,
        hasResourceType: !!sigData.resourceType,
        timestamp: sigData.timestamp,
      });

      // Prepare form data for Cloudinary
      // IMPORTANT: Parameters must match exactly what was signed
      // FormData order doesn't matter for Cloudinary, but values must match
      const formData = new FormData();
      
      // Add file first (not included in signature)
      formData.append('file', file);
      
      // Add api_key (required, not in signature)
      formData.append('api_key', sigData.apiKey);
      
      // Add folder if it was in the signature
      if (sigData.folder) {
        formData.append('folder', String(sigData.folder));
      }
      
      // Add resource_type if it was in the signature
      if (sigData.resourceType) {
        formData.append('resource_type', String(sigData.resourceType));
      }
      
      // Add timestamp (must be string, must match signed value)
      formData.append('timestamp', String(sigData.timestamp));
      
      // Add signature last (not included in signature calculation)
      formData.append('signature', sigData.signature);
      
      // Debug: log what we're sending
      console.log('Uploading with params:', {
        folder: sigData.folder || 'none',
        resourceType: sigData.resourceType || 'none',
        timestamp: sigData.timestamp,
        hasSignature: !!sigData.signature,
      });

      // Upload directly to Cloudinary
      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr;

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(percentComplete);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const data = JSON.parse(xhr.responseText);
            if (data.secure_url) {
              onChange(data.secure_url);
              showToast('File uploaded successfully!', 'success');
              setUploadProgress(100);
            } else {
              showToast('Upload failed. Invalid response from Cloudinary.', 'error');
            }
          } catch (parseError) {
            showToast('Failed to parse Cloudinary response.', 'error');
          }
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText);
            const errorMsg = errorData.error?.message || errorData.error || `Upload failed with status ${xhr.status}`;
            console.error('Cloudinary upload error:', errorData);
            showToast(errorMsg, 'error');
          } catch {
            showToast(`Upload failed with status ${xhr.status}`, 'error');
          }
        }
        setUploading(false);
        xhrRef.current = null;
      });

      xhr.addEventListener('error', () => {
        // Check if it's a CORS error
        if (xhr.status === 0 && !xhr.responseText) {
          console.error('CORS error detected. Cloudinary CORS must be enabled in dashboard.');
          showToast('Upload failed: CORS error. Please enable CORS in Cloudinary settings for your domain.', 'error');
        } else {
          showToast('Network error. Please check your connection and try again.', 'error');
        }
        setUploading(false);
        setUploadProgress(0);
        xhrRef.current = null;
      });

      xhr.addEventListener('abort', () => {
        setUploading(false);
        setUploadProgress(0);
        xhrRef.current = null;
      });

      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${sigData.cloudName}/upload`;
      xhr.open('POST', cloudinaryUrl);
      xhr.send(formData);
    } catch (error: any) {
      console.error('Direct upload error:', error);
      showToast(error.message || 'Upload failed. Please try again.', 'error');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const uploadViaServer = async (file: File) => {
    // Use XMLHttpRequest for progress tracking
    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;

    const formData = new FormData();
    formData.append('file', file);

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percentComplete = Math.round((e.loaded / e.total) * 100);
        setUploadProgress(percentComplete);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        try {
          const data = JSON.parse(xhr.responseText);
          if (data.url) {
            onChange(data.url);
            showToast('File uploaded successfully!', 'success');
            setUploadProgress(100);
          } else {
            showToast(data.error || 'Upload failed. Please try again.', 'error');
          }
        } catch (parseError) {
          showToast('Failed to parse server response.', 'error');
        }
      } else {
        try {
          const errorData = JSON.parse(xhr.responseText);
          showToast(errorData.error || 'Upload failed. Please try again.', 'error');
        } catch {
          showToast(`Upload failed with status ${xhr.status}`, 'error');
        }
      }
      setUploading(false);
      xhrRef.current = null;
    });

    xhr.addEventListener('error', () => {
      showToast('Network error. Please check your connection and try again.', 'error');
      setUploading(false);
      setUploadProgress(0);
      xhrRef.current = null;
    });

    xhr.addEventListener('abort', () => {
      setUploading(false);
      setUploadProgress(0);
      xhrRef.current = null;
    });

    xhr.open('POST', '/api/upload');
    xhr.send(formData);
  };

  const handleCancel = () => {
    if (xhrRef.current) {
      xhrRef.current.abort();
      xhrRef.current = null;
    }
    setUploading(false);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <div className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
          id={`file-${label.replace(/\s+/g, '-')}`}
        />
        <label
          htmlFor={`file-${label.replace(/\s+/g, '-')}`}
          className={`flex-1 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-center transition-colors ${
            uploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {uploading ? 'Uploading...' : value ? 'Change File' : 'Choose File'}
        </label>
        {uploading && (
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            Cancel
          </button>
        )}
        {value && !uploading && (
          <input
            type="text"
            value={value}
            readOnly
            className="flex-2 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
            placeholder="File URL"
          />
        )}
      </div>
      
      {/* Upload Progress */}
      {uploading && (
        <div className="mt-2">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>{fileName}</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          {fileSize > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              {formatFileSize(fileSize)}
            </p>
          )}
        </div>
      )}
      
      {value && !uploading && (
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

