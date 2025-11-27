'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useUploadThing } from '@/lib/uploadthing';
import Toast, { ToastType } from './Toast';

interface FileUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  accept?: string;
}

export default function FileUpload({ label, value, onChange, accept }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<number>(0);
  const [uploadSpeed, setUploadSpeed] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const progressHistoryRef = useRef<Array<{ time: number; progress: number }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  // Determine which uploader to use based on accept prop
  const getUploaderEndpoint = (): 'imageUploader' | 'audioUploader' | 'zipUploader' => {
    if (accept?.includes('image')) {
      return 'imageUploader';
    } else if (accept?.includes('audio')) {
      return 'audioUploader';
    } else if (accept?.includes('zip') || accept?.includes('application/zip')) {
      return 'zipUploader';
    }
    // Default to imageUploader if unclear
    return 'imageUploader';
  };

  const endpoint = getUploaderEndpoint();
  const { startUpload, isUploading } = useUploadThing(endpoint, {
    onClientUploadComplete: (res) => {
      if (res && res[0]?.url) {
        onChange(res[0].url);
        showToast('File uploaded successfully!', 'success');
        setUploadProgress(100);
        // Keep progress at 100% briefly before hiding
        setTimeout(() => {
          setUploading(false);
          setUploadProgress(0);
        }, 500);
      } else {
        showToast('Upload failed. Please try again.', 'error');
        setUploading(false);
        setUploadProgress(0);
      }
    },
    onUploadError: (error: Error) => {
      console.error('Upload error:', error);
      showToast(error.message || 'Upload failed. Please try again.', 'error');
      setUploading(false);
      setUploadProgress(0);
    },
    onUploadBegin: () => {
      setUploading(true);
      setUploadProgress(0);
      setUploadSpeed(0);
      setTimeRemaining(0);
      progressHistoryRef.current = [];
    },
    onUploadProgress: (progress) => {
      console.log('Upload progress:', progress);
      const now = Date.now();
      const history = progressHistoryRef.current;
      
      // Add current progress to history
      history.push({ time: now, progress });
      
      // Keep only last 5 entries for more responsive speed calculation
      if (history.length > 5) {
        history.shift();
      }
      
      setUploadProgress(progress);
      
      // Calculate upload speed if we have enough history
      if (history.length >= 2) {
        // Use the most recent 2 entries for more responsive speed
        const recent = history.slice(-2);
        const oldest = recent[0];
        const newest = recent[1];
        const timeDiff = (newest.time - oldest.time) / 1000; // seconds
        const progressDiff = newest.progress - oldest.progress; // percentage
        
        if (timeDiff > 0.5 && progressDiff > 0) { // Only calculate if at least 0.5 seconds have passed
          // Calculate bytes uploaded
          const bytesUploaded = (progressDiff / 100) * fileSize;
          const currentSpeed = bytesUploaded / timeDiff; // bytes per second
          
          // Smooth the speed calculation using exponential moving average
          setUploadSpeed(prevSpeed => {
            const smoothedSpeed = prevSpeed > 0 
              ? prevSpeed * 0.7 + currentSpeed * 0.3 // 70% old, 30% new
              : currentSpeed;
            
            // Calculate estimated time remaining
            const remainingProgress = 100 - progress;
            if (smoothedSpeed > 0 && remainingProgress > 0) {
              const remainingBytes = (remainingProgress / 100) * fileSize;
              const estimatedSeconds = remainingBytes / smoothedSpeed;
              setTimeRemaining(Math.max(0, estimatedSeconds));
            }
            
            return smoothedSpeed;
          });
        }
      }
      
      // Sync with hook's isUploading state
      if (!isUploading && progress < 100) {
        setUploading(true);
      }
    },
  });

  // Sync local uploading state with hook's isUploading
  useEffect(() => {
    if (isUploading && !uploading) {
      setUploading(true);
    } else if (!isUploading && uploading && uploadProgress === 0) {
      setUploading(false);
    }
  }, [isUploading, uploading, uploadProgress]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatTimeRemaining = (seconds: number): string => {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    } else if (seconds < 3600) {
      const mins = Math.floor(seconds / 60);
      const secs = Math.round(seconds % 60);
      return `${mins}m ${secs}s`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${mins}m`;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setFileSize(file.size);
    setUploading(true);
    setUploadProgress(0);

    try {
      await startUpload([file]);
    } catch (error) {
      console.error('Upload error:', error);
      showToast('Upload failed. Please try again.', 'error');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveFile = () => {
    onChange('');
    setFileName('');
    setFileSize(0);
    setUploadProgress(0);
    setUploadSpeed(0);
    setTimeRemaining(0);
    progressHistoryRef.current = [];
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
        {value && !uploading && (
          <>
            <input
              type="text"
              value={value}
              readOnly
              className="flex-2 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
              placeholder="File URL"
            />
            <button
              type="button"
              onClick={handleRemoveFile}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium text-sm whitespace-nowrap"
            >
              Remove
            </button>
          </>
        )}
      </div>
      
      {/* Upload Progress */}
      {uploading && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{fileName}</p>
              <p className="text-xs text-gray-500">{formatFileSize(fileSize)}</p>
            </div>
            <span className="text-sm font-semibold text-blue-600 ml-2">
              {uploadProgress > 0 ? `${uploadProgress}%` : 'Processing...'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden relative">
            {uploadProgress > 0 ? (
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              />
            ) : (
              <>
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '30%' }} />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/50 to-transparent animate-shimmer" style={{ width: '50%' }} />
              </>
            )}
          </div>
          <div className="flex justify-between items-center mt-2">
            <div className="flex-1">
              <p className="text-xs text-gray-500">
                {uploadProgress > 0 
                  ? `Uploading... ${uploadProgress}% complete` 
                  : 'Preparing upload... Please wait'}
              </p>
              {fileSize > 50 * 1024 * 1024 && uploadProgress < 5 && (
                <p className="text-xs text-gray-400 mt-0.5">
                  Large file detected. Upload speed depends on your internet connection.
                </p>
              )}
            </div>
            {uploadProgress > 0 && uploadSpeed > 0 && (
              <div className="text-xs text-gray-600 space-x-2 ml-2">
                <span className="font-medium">{formatFileSize(uploadSpeed)}/s</span>
                {timeRemaining > 0 && (
                  <span className="text-gray-500">• {formatTimeRemaining(timeRemaining)}</span>
                )}
              </div>
            )}
          </div>
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
