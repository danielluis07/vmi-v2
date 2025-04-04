import { create } from "zustand";

interface FormData {
  firstName?: string;
  email?: string;
  phone?: string;
  [key: string]: any;
}

interface FormStore {
  step: number;
  formData: FormData;
  setStep: (step: number) => void;
  setFormData: (data: Partial<FormData>) => void;
}

export const useMultiStepFormStore = create<FormStore>((set) => ({
  step: 1,
  formData: {},
  setStep: (step: number) => set({ step }),
  setFormData: (data: Partial<FormData>) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),
}));
