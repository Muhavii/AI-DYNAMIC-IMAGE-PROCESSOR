'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiImage, FiX } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

interface ImageUploadProps {
  onUpload: (file: File) => Promise<void>;
  isProcessing: boolean;
}

export default function ImageUpload({ onUpload, isProcessing }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      
      setFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    disabled: isProcessing
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select an image to upload');
      return;
    }
    
    try {
      await onUpload(file);
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload image');
    }
  };

  const removeImage = () => {
    setFile(null);
    setPreview(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
          }`}
        >
          <input {...getInputProps()} />
          <div className="space-y-3">
            <div className="flex justify-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <FiUpload className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {isDragActive ? 'Drop the image here' : 'Drag & drop an image here'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                or click to select a file
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Supports: JPG, JPEG, PNG, WEBP (max 5MB)
              </p>
            </div>
          </div>
        </div>

        {preview && (
          <div className="relative group">
            <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-contain"
              />
            </div>
            <button
              type="button"
              onClick={removeImage}
              className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              disabled={isProcessing}
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!file || isProcessing}
            className={`btn btn-primary ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isProcessing ? 'Processing...' : 'Process Image'}
          </button>
        </div>
      </form>
    </div>
  );
}
