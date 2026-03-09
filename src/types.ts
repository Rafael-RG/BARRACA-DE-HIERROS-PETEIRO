export interface Product {
  id: string;
  nombre: string;
  categoria: string;
  tipo: string;
  calibre?: string;
  medida?: string;
  precio?: string | number;
  imagen?: string;
  presentacion?: string;
  observacion?: string;
}

export interface GroupedProducts {
  [category: string]: {
    [type: string]: Product[];
  };
}
