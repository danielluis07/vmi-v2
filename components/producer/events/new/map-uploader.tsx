import { useRef } from "react";
import Image from "next/image";
import { Trash2 } from "lucide-react";

interface MapUploaderProps {
  onImageSelect: (file: File | null) => void;
  imagePreview?: string | null;
}

export const MapUploader: React.FC<MapUploaderProps> = ({
  onImageSelect,
  imagePreview,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    onImageSelect(file);
  };

  return (
    <div className="relative flex flex-col items-center gap-4">
      {/* Clickable Upload Area - Matches Banner Size (Aspect Ratio 16:9) */}
      <div
        className="relative w-full aspect-[4/1] border-2 border-dashed rounded-lg flex justify-center items-center cursor-pointer bg-gray-100 hover:bg-gray-200 transition"
        onClick={() => fileInputRef.current?.click()}>
        {imagePreview ? (
          <Image
            src={imagePreview}
            alt="Preview"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 50vw"
            className="rounded-lg object-cover"
          />
        ) : (
          <p className="text-gray-500 text-center">Selecione uma imagem</p>
        )}
      </div>

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />

      {imagePreview && (
        <button
          type="button"
          className="absolute top-2 right-2 p-1 bg-gray-800 bg-opacity-50 rounded-full cursor-pointer"
          onClick={() => onImageSelect(null)}>
          <Trash2 className="size-5 text-white hover:text-destructive" />
          <span className="sr-only">Remover imagem</span>
        </button>
      )}
    </div>
  );
};
