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
  activo?: string; // 'Si' o 'No'
}

export interface GroupedProducts {
  [category: string]: {
    [type: string]: Product[];
  };
}
