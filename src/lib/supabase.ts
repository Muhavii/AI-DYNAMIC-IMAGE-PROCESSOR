import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Define the database types
type Database = {
  public: {
    Tables: {
      image_analyses: {
        Row: {
          id: string;
          created_at: string;
          image_path: string;
          analysis_data: any;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          image_path: string;
          analysis_data: any;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          image_path?: string;
          analysis_data?: any;
          user_id?: string | null;
        };
      };
    };
  };
};

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Only initialize Supabase client if we have the required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Initialize the Supabase client
let supabase: SupabaseClient<Database> | null = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: isBrowser,
      autoRefreshToken: isBrowser,
      detectSessionInUrl: isBrowser,
    },
  });
} else if (isBrowser) {
  console.warn('Supabase URL or Anon Key is missing. Check your environment variables.');
}

// Helper function to upload files to Supabase Storage
export async function uploadFile(bucket: string, path: string, file: File) {
  if (!supabase) {
    throw new Error('Supabase client is not initialized');
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${path}/${fileName}`.replace(/^\/+/, ''); // Remove leading slashes

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Error uploading file:', error);
    throw error;
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  if (!publicUrl) {
    console.warn('Could not generate public URL for the uploaded file');
  }

  return {
    path: filePath,
    publicUrl,
    fileName
  };
}

// Export the Supabase client
export { supabase };
