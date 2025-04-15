import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCheckoutStore = create<CheckoutStore>()(
  persist(
    (set) => ({
      tickets: [],
      addTicket: (ticket) =>
        set((state) => {
          console.log("Adicionando ticket:", ticket);
          return {
            tickets: [...state.tickets, ticket],
          };
        }),
      removeTicket: (index) =>
        set((state) => {
          const updated = [...state.tickets];
          updated.splice(index, 1);
          return { tickets: updated };
        }),
      reset: () => set({ tickets: [] }),
    }),
    {
      name: "checkout-storage",
    }
  )
);
