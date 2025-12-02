'use client';

import { useState, useRef } from 'react';
import { upload } from '@vercel/blob/client';
import { Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export default function ImageUpload({
  value,
  onChange,
  disabled
}: ImageUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    const file = event.target.files[0];
    setIsLoading(true);

    try {
      const newBlob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      });

      onChange(newBlob.url);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Error uploading image');
    } finally {
      setIsLoading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    onChange('');
  };

  return (
    <div className="space-y-4 w-full flex flex-col items-center justify-center">
      {value ? (
        <div className="relative w-full h-48 rounded-md overflow-hidden border border-gray-200">
          <img
            src={value}
            alt="Thumbnail"
            className="w-full h-full object-cover"
          />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition"
            type="button"
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-48 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition"
        >
          {isLoading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="h-10 w-10 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">Click to upload thumbnail</p>
            </div>
          )}
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
        disabled={isLoading || disabled}
      />
    </div>
  );
}
