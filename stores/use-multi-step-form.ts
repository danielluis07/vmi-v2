import { create } from "zustand";

interface FormStore {
  step: number;
  image: File | null;
  imagePreviewUrl: string | null;
  setStep: (step: number) => void;
  setImage: (file: File | null) => void;
  clearImage: () => void;
}

export const useMultiStepFormStore = create<FormStore>((set) => ({
  step: 1,
  image: null,
  imagePreviewUrl: null,
  setStep: (step: number) => set({ step }),
  setImage: (file: File | null) =>
    set((state) => {
      if (file) {
        const newPreviewUrl = URL.createObjectURL(file);
        if (state.imagePreviewUrl) {
          URL.revokeObjectURL(state.imagePreviewUrl);
        }
        return { image: file, imagePreviewUrl: newPreviewUrl };
      }
      return { image: null, imagePreviewUrl: null };
    }),
  clearImage: () =>
    set((state) => {
      if (state.imagePreviewUrl) {
        URL.revokeObjectURL(state.imagePreviewUrl);
      }
      return { image: null, imagePreviewUrl: null };
    }),
}));
