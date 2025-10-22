'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageUpload from '../components/ImageUpload';

export default function Home() {
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const handleUpload = async (file: File) => {
    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Upload the file and get the analysis
      const response = await fetch('/api/process-image', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to process image');
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to process image');
      }
      
      // Store the result in session storage
      sessionStorage.setItem(`analysis_${result.data.id}`, JSON.stringify(result.data));
      
      // Redirect to the results page with the analysis ID
      router.push(`/results/${result.data.id}`);
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="card p-6 md:p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Your Image</h2>
        <p className="text-gray-600">
          Drag and drop an image or click to browse. We'll analyze it with AI.
        </p>
      </div>
      
      <ImageUpload onUpload={handleUpload} isProcessing={isProcessing} />
      
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Powered by Next.js, Vercel, and AI/ML services</p>
      </div>
    </div>
  );
}
