import { create } from 'zustand';

interface ForgotPasswordState {
  step: number;
  setStep: (step: number) => void;
  clear: () => void;
}

export const useForgotPasswordStore = create<ForgotPasswordState>((set) => ({
  step: 1,
  setStep: (step) => set({ step }),
  clear: () => set({ step: 1 }),
}));
