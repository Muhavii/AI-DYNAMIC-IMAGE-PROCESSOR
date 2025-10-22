'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { FiLoader, FiAlertCircle, FiCheckCircle, FiImage } from 'react-icons/fi';

interface AnalysisResult {
  id: string;
  imageUrl: string;
  description: string;
  tags: string[];
  processedAt: string;
}

export default function ResultsPage() {
  const params = useParams();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setIsLoading(true);
        
        // Get the analysis data from session storage
        const analysisData = sessionStorage.getItem(`analysis_${params.id}`);
        
        if (!analysisData) {
          throw new Error('Analysis data not found. Please try uploading the image again.');
        }
        
        const parsedData = JSON.parse(analysisData);
        
        // Get the image URL from the response data
        const imageUrl = parsedData.data?.imageUrl || parsedData.imageUrl;
        
        if (!imageUrl) {
          throw new Error('Image data not found in the analysis results.');
        }
        
        console.log('Setting result with data:', parsedData); // Debug log
        
        setResult({
          id: params.id as string,
          imageUrl: imageUrl,
          description: parsedData.data?.analysis || parsedData.description || 'No description available',
          tags: Array.isArray(parsedData.data?.tags) 
            ? parsedData.data.tags 
            : (Array.isArray(parsedData.tags) ? parsedData.tags : []),
          processedAt: parsedData.processedAt || new Date().toISOString(),
        });
      } catch (err) {
        console.error('Failed to fetch results:', err);
        setError('Failed to load analysis results. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <FiLoader className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <h2 className="text-xl font-semibold text-gray-800">Analyzing your image...</h2>
        <p className="text-gray-500 mt-2">This may take a few moments.</p>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <div className="bg-red-100 p-4 rounded-full mb-4">
          <FiAlertCircle className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Something went wrong</h2>
        <p className="text-gray-600 mb-6">{error || 'Unable to load analysis results.'}</p>
        <button
          onClick={() => window.location.reload()}
          className="btn btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Analysis Results</h2>
        <p className="text-gray-600">Here's what our AI found in your image</p>
      </div>

      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Preview */}
          <div className="bg-gray-100 rounded-lg overflow-hidden aspect-square flex items-center justify-center">
            {result.imageUrl ? (
              <img
                src={result.imageUrl}
                alt="Analyzed content"
                className="w-full h-full object-contain"
                onError={(e) => {
                  console.error('Error loading image');
                  // Use a placeholder from a reliable CDN
                  e.currentTarget.src = 'https://placehold.co/600x400?text=Image+Not+Available';
                }}
              />
            ) : (
              <div className="text-gray-400 p-4 text-center">
                <FiImage className="w-12 h-12 mx-auto mb-2" />
                <p>Image not available</p>
              </div>
            )}
          </div>

          {/* Analysis Results */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                {result.description}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Detected Tags</h3>
              <div className="flex flex-wrap gap-2">
                {result.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center text-sm text-gray-500">
                <FiCheckCircle className="w-4 h-4 mr-2 text-green-500" />
                <span>Analyzed on {new Date(result.processedAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={() => window.location.href = '/'}
          className="btn btn-outline"
        >
          Analyze Another Image
        </button>
      </div>
    </div>
  );
}
