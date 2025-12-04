'use client';

import { useState, useRef } from 'react';
import { upload } from '@vercel/blob/client';
import { Loader2, Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { MediaPicker } from '@/components/admin/media-picker';

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
  const [showMediaPicker, setShowMediaPicker] = useState(false);
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
    <div className="space-y-4 w-full">
      <MediaPicker
        open={showMediaPicker}
        onOpenChange={setShowMediaPicker}
        onSelect={(url) => onChange(url)}
      />

      {value ? (
        <div className="relative w-full h-48 rounded-md overflow-hidden border border-gray-200 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Thumbnail"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
             <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowMediaPicker(true)}
                disabled={disabled}
             >
                 Replace
             </Button>
             <Button
                variant="destructive"
                size="sm"
                onClick={handleRemove}
                disabled={disabled}
             >
                 <X className="h-4 w-4" />
             </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
             <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-32 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition"
            >
                {isLoading ? (
                    <div className="flex flex-col items-center">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">Uploading...</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                    <Upload className="h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">Click to upload</p>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2 w-full">
                <div className="h-px bg-gray-200 flex-1"></div>
                <span className="text-xs text-gray-400 font-medium">OR</span>
                <div className="h-px bg-gray-200 flex-1"></div>
            </div>

            <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setShowMediaPicker(true)}
                disabled={disabled || isLoading}
            >
                <ImageIcon className="h-4 w-4 mr-2" />
                Select from Media Library
            </Button>
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
