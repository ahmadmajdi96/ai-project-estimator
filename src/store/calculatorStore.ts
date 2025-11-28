import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SelectedComponent {
  componentId: string;
  quantity: number;
}

interface CalculatorState {
  selectedComponents: SelectedComponent[];
  
  // Actions
  toggleComponent: (componentId: string) => void;
  setComponentQuantity: (componentId: string, quantity: number) => void;
  clearSelection: () => void;
}

export const useCalculatorStore = create<CalculatorState>()(
  persist(
    (set) => ({
      selectedComponents: [],

      toggleComponent: (componentId) =>
        set((state) => {
          const exists = state.selectedComponents.find(
            (sc) => sc.componentId === componentId
          );
          if (exists) {
            return {
              selectedComponents: state.selectedComponents.filter(
                (sc) => sc.componentId !== componentId
              ),
            };
          }
          return {
            selectedComponents: [
              ...state.selectedComponents,
              { componentId, quantity: 1 },
            ],
          };
        }),

      setComponentQuantity: (componentId, quantity) =>
        set((state) => ({
          selectedComponents: state.selectedComponents.map((sc) =>
            sc.componentId === componentId ? { ...sc, quantity } : sc
          ),
        })),

      clearSelection: () => set({ selectedComponents: [] }),
    }),
    {
      name: 'calculator-selection',
    }
  )
);
