export interface ComponentItem {
  id: string;
  name: string;
  description: string;
  category: string;
  baseCost: number;
  basePrice: number;
  isBase?: boolean;
  icon?: string;
}

export interface CalculatorConfig {
  profitMargin: number;
  components: ComponentItem[];
  csvFiles: CsvFile[];
}

export interface CsvFile {
  id: string;
  name: string;
  uploadedAt: Date;
  size: number;
}

export interface SelectedComponent {
  componentId: string;
  quantity: number;
}
