import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ComponentItem, CsvFile, SelectedComponent } from '@/types/calculator';

interface CalculatorState {
  profitMargin: number;
  components: ComponentItem[];
  csvFiles: CsvFile[];
  selectedComponents: SelectedComponent[];
  
  // Actions
  setProfitMargin: (margin: number) => void;
  addComponent: (component: ComponentItem) => void;
  updateComponent: (id: string, updates: Partial<ComponentItem>) => void;
  deleteComponent: (id: string) => void;
  addCsvFile: (file: CsvFile) => void;
  deleteCsvFile: (id: string) => void;
  toggleComponent: (componentId: string) => void;
  setComponentQuantity: (componentId: string, quantity: number) => void;
  clearSelection: () => void;
}

const defaultComponents: ComponentItem[] = [
  {
    id: '1',
    name: 'Base Website',
    description: 'Modern responsive website with up to 5 pages',
    category: 'Website',
    baseCost: 1500,
    basePrice: 2000,
    isBase: true,
    icon: 'Globe',
  },
  {
    id: '2',
    name: 'Additional Page',
    description: 'Extra page with custom design and content',
    category: 'Website',
    baseCost: 75,
    basePrice: 100,
    icon: 'FileText',
  },
  {
    id: '3',
    name: 'AI Chatbot',
    description: 'Intelligent chatbot with custom training',
    category: 'AI Services',
    baseCost: 2200,
    basePrice: 3000,
    icon: 'Bot',
  },
  {
    id: '4',
    name: 'E-commerce Integration',
    description: 'Full shopping cart and payment processing',
    category: 'Features',
    baseCost: 1800,
    basePrice: 2500,
    icon: 'ShoppingCart',
  },
  {
    id: '5',
    name: 'User Authentication',
    description: 'Secure login system with social auth options',
    category: 'Features',
    baseCost: 600,
    basePrice: 800,
    icon: 'Shield',
  },
  {
    id: '6',
    name: 'Custom API Development',
    description: 'RESTful API with documentation',
    category: 'Backend',
    baseCost: 1200,
    basePrice: 1600,
    icon: 'Code',
  },
  {
    id: '7',
    name: 'AI Image Generation',
    description: 'Custom AI-powered image generation feature',
    category: 'AI Services',
    baseCost: 1500,
    basePrice: 2000,
    icon: 'Image',
  },
  {
    id: '8',
    name: 'Analytics Dashboard',
    description: 'Real-time analytics and reporting',
    category: 'Features',
    baseCost: 900,
    basePrice: 1200,
    icon: 'BarChart3',
  },
];

export const useCalculatorStore = create<CalculatorState>()(
  persist(
    (set) => ({
      profitMargin: 25,
      components: defaultComponents,
      csvFiles: [],
      selectedComponents: [],

      setProfitMargin: (margin) => set({ profitMargin: margin }),

      addComponent: (component) =>
        set((state) => ({
          components: [...state.components, component],
        })),

      updateComponent: (id, updates) =>
        set((state) => ({
          components: state.components.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),

      deleteComponent: (id) =>
        set((state) => ({
          components: state.components.filter((c) => c.id !== id),
          selectedComponents: state.selectedComponents.filter(
            (sc) => sc.componentId !== id
          ),
        })),

      addCsvFile: (file) =>
        set((state) => ({
          csvFiles: [...state.csvFiles, file],
        })),

      deleteCsvFile: (id) =>
        set((state) => ({
          csvFiles: state.csvFiles.filter((f) => f.id !== id),
        })),

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
      name: 'calculator-storage',
    }
  )
);
