"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Dispatch,
  SetStateAction,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  useDropzone,
  DropzoneState,
  FileRejection,
  DropzoneOptions,
} from "react-dropzone";
import { toast } from "sonner";
import { Trash2 as RemoveIcon } from "lucide-react";
import Image from "next/image";

type DirectionOptions = "rtl" | "ltr" | undefined;

type FileUploaderContextType = {
  dropzoneState: DropzoneState;
  isLOF: boolean;
  isFileTooBig: boolean;
  removeFileFromSet: () => void;
  activeIndex: number;
  setActiveIndex: Dispatch<SetStateAction<number>>;
  orientation: "horizontal" | "vertical";
  direction: DirectionOptions;
};

const FileUploaderContext = createContext<FileUploaderContextType | null>(null);

export const useFileUpload = () => {
  const context = useContext(FileUploaderContext);
  if (!context) {
    throw new Error("useFileUpload must be used within a FileUploaderProvider");
  }
  return context;
};

type FileUploaderProps = {
  value: File[] | null;
  reSelect?: boolean;
  onValueChange: (value: File[] | null) => void;
  dropzoneOptions: DropzoneOptions;
  orientation?: "horizontal" | "vertical";
};

// Componente FileUploader
export const FileUploader = forwardRef<
  HTMLDivElement,
  FileUploaderProps & React.HTMLAttributes<HTMLDivElement>
>(
  (
    {
      className,
      dropzoneOptions,
      value,
      onValueChange,
      reSelect,
      orientation = "vertical",
      children,
      dir,
      ...props
    },
    ref
  ) => {
    const [isFileTooBig, setIsFileTooBig] = useState(false);
    const [isLOF, setIsLOF] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    const {
      accept = { "image/*": [".jpg", ".jpeg", ".png", ".gif"] },
      maxSize = 4 * 1024 * 1024,
    } = dropzoneOptions;

    const direction: DirectionOptions = dir === "rtl" ? "rtl" : "ltr";

    const removeFileFromSet = useCallback(() => {
      onValueChange(null); // Limpa o valor no formulário
    }, [onValueChange]);

    const onDrop = useCallback(
      (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
        const file = acceptedFiles[0];
        if (!file) {
          toast.error("Erro no arquivo, provavelmente muito grande");
          return;
        }
        onValueChange([file]);

        if (rejectedFiles.length > 0) {
          for (let i = 0; i < rejectedFiles.length; i++) {
            if (rejectedFiles[i].errors[0]?.code === "file-too-large") {
              toast.error(
                `Arquivo muito grande. Tamanho máximo é ${
                  maxSize / 1024 / 1024
                }MB`
              );
              break;
            }
            if (rejectedFiles[i].errors[0]?.message) {
              toast.error(rejectedFiles[i].errors[0].message);
              break;
            }
          }
        }
      },
      [maxSize, onValueChange]
    );

    useEffect(() => {
      if (!value || value.length === 0) {
        setIsLOF(false);
      } else if (value.length === 1) {
        setIsLOF(true);
      }
    }, [value]);

    const opts = {
      accept,
      maxFiles: 1,
      maxSize,
      multiple: false,
    };

    const dropzoneState = useDropzone({
      ...opts,
      onDrop,
      onDropRejected: () => setIsFileTooBig(true),
      onDropAccepted: () => setIsFileTooBig(false),
    });

    return (
      <FileUploaderContext.Provider
        value={{
          dropzoneState,
          isLOF,
          isFileTooBig,
          removeFileFromSet,
          activeIndex,
          setActiveIndex,
          orientation,
          direction,
        }}>
        <div
          ref={ref}
          tabIndex={0}
          className={cn(
            "grid w-full focus:outline-none overflow-hidden",
            className
          )}
          dir={dir}
          {...props}>
          {children}
        </div>
      </FileUploaderContext.Provider>
    );
  }
);

FileUploader.displayName = "FileUploader";

// Componente FileInput ajustado
export const FileInput = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { previewurl?: string | null }
>(({ className, children, previewurl, ...props }, ref) => {
  const { dropzoneState, isFileTooBig, isLOF, removeFileFromSet } =
    useFileUpload();
  const rootProps = isLOF ? {} : dropzoneState.getRootProps();

  const handleRemove = () => {
    removeFileFromSet();
  };

  return (
    <div
      ref={ref}
      {...props}
      className={cn(
        "relative w-full",
        isLOF ? "opacity-100" : "cursor-pointer",
        className
      )}>
      {previewurl ? (
        <div className="relative w-full aspect-[4/1]">
          <Image
            src={previewurl}
            alt="Preview"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 50vw"
            className="rounded-lg object-cover"
          />
          <button
            type="button"
            className="absolute top-2 right-2 p-1 bg-gray-800 bg-opacity-50 rounded-full cursor-pointer"
            onClick={handleRemove}>
            <RemoveIcon className="size-5 text-white hover:text-red-500" />
            <span className="sr-only">Remover imagem</span>
          </button>
        </div>
      ) : (
        <div
          className={cn(
            `flex items-center justify-center w-full rounded-lg border-2 border-dashed p-4 text-center duration-300 ease-in-out
          ${
            dropzoneState.isDragAccept
              ? "border-green-500"
              : dropzoneState.isDragReject || isFileTooBig
              ? "border-red-500"
              : "border-gray-300"
          }`,
            className
          )}
          {...rootProps}>
          {children || "Arraste ou clique para selecionar uma imagem"}
          <Input
            ref={dropzoneState.inputRef}
            disabled={isLOF}
            {...dropzoneState.getInputProps()}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
});

FileInput.displayName = "FileInput";
