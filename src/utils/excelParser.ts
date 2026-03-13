import * as XLSX from 'xlsx';
import { Product } from '../types';

/**
 * Función helper para buscar campos con variaciones de nombres
 */
const findField = (row: any, variations: string[]): any => {
  for (const v of variations) {
    if (row[v] !== undefined && row[v] !== null && row[v] !== '') {
      return row[v];
    }
  }
  return undefined;
};

/**
 * Mapea una fila de Excel a un objeto Product
 */
const mapRowToProduct = (row: any, index: number): Product => {
  // Construir medida combinando Ancho y Largo si están disponibles
  const ancho = findField(row, ['Ancho (mts)', 'Ancho(mts)', 'Ancho', 'ancho']);
  const largo = findField(row, ['Largo(mts)', 'Largo (mts)', 'Largo', 'largo']);
  let medida = findField(row, ['Medida', 'medida', 'MEDIDA', 'Dimensiones', 'dimensiones', 'DIMENSIONES', 'Tamaño', 'tamaño', 'TAMAÑO', 'Dimension', 'dimension']);
  
  // Si no hay medida pero hay ancho y/o largo, construir la medida
  if (!medida && (ancho || largo)) {
    if (ancho && largo) {
      medida = `${String(ancho).trim()} x ${String(largo).trim()} mts`;
    } else if (ancho) {
      medida = `${String(ancho).trim()} mts ancho`;
    } else if (largo) {
      medida = `${String(largo).trim()} mts largo`;
    }
  }

  // Buscar nombre de imagen (solo el nombre, sin ruta - el componente SmartImage manejará la ruta)
  const imagenNombre = findField(row, ['Producto_Imagen', 'Producto/Imagen', 'Producto / Imagen', 'Imagen', 'imagen', 'IMAGEN', 'Image', 'image']);
  
  // Debug: Log todas las imágenes para debugging
  if (imagenNombre && index < 3) {
    console.log(`Producto ${index}: "${row['Nombre'] || row['Nombre '] || 'sin nombre'}" -> Imagen: "${imagenNombre}"`);
  } else if (index < 5) {
    console.log(`Producto ${index}: SIN IMAGEN - Campos disponibles:`, Object.keys(row).filter(k => k.toLowerCase().includes('imagen')));
  }

  return {
    id: `prod-${index}`,
    nombre: findField(row, ['Nombre ', 'Nombre', 'nombre', 'NOMBRE', 'Producto', 'producto']) || '',
    categoria: findField(row, ['Categoría', 'categoria', 'Categoria', 'CATEGORIA']) || 'General',
    tipo: findField(row, ['Tipo', 'tipo', 'TIPO']) || 'Varios',
    calibre: findField(row, ['Calibre (")', 'Calibre (mm)', 'Calibre', 'calibre', 'CALIBRE', 'Espesor', 'espesor', 'ESPESOR']),
    medida,
    precio: findField(row, ['Precio(IVAInc.)', 'Precio (IVA Inc.)', 'Precio', 'precio', 'PRECIO', 'Precio en lista', 'Valor', 'valor']),
    imagen: imagenNombre,
    presentacion: findField(row, ['Presentacion ', 'Presentación ', 'Presentacion', 'presentacion', 'PRESENTACION', 'Presentación', 'Venta', 'venta']),
    observacion: findField(row, ['Observacion ', 'Observación ', 'Observacion', 'observacion', 'OBSERVACION', 'Observación', 'Obs', 'obs', 'Nota', 'nota']),
  };
};

export const parseExcelFile = (file: File): Promise<Product[]> => {
  return file.arrayBuffer().then(buffer => {
    const data = new Uint8Array(buffer);
    const workbook = XLSX.read(data, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    const products: Product[] = jsonData.map((row: any, index: number) => mapRowToProduct(row, index));
    return products;
  });
};

/**
 * Carga y parsea un archivo Excel desde una URL remota
 */
export const parseExcelFromUrl = async (url: string): Promise<Product[]> => {
  try {
    console.log('Iniciando carga de Excel desde:', url);
    
    // Fetch el archivo desde la URL
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
      },
    });

    console.log('Respuesta del servidor:', response.status, response.statusText);

    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
    }

    // Obtener el ArrayBuffer
    const arrayBuffer = await response.arrayBuffer();
    console.log('ArrayBuffer recibido, tamaño:', arrayBuffer.byteLength);
    
    const data = new Uint8Array(arrayBuffer);
    
    // Parsear el Excel
    console.log('Parseando Excel...');
    const workbook = XLSX.read(data, { type: 'array' });
    console.log('Hojas encontradas:', workbook.SheetNames);
    
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    console.log('Filas encontradas en Excel:', jsonData.length);
    
    // Mostrar nombres de columnas para debugging
    if (jsonData.length > 0) {
      console.log('Nombres de columnas en Excel:', Object.keys(jsonData[0]));
      console.log('Producto ejemplo (raw):', jsonData[0]);
      
      // Buscar columnas que contengan "imagen"
      const imagenColumns = Object.keys(jsonData[0]).filter(k => 
        k.toLowerCase().includes('imagen') || k.toLowerCase().includes('image')
      );
      console.log('Columnas de imagen encontradas:', imagenColumns);
    }

    // Map to Product interface con búsqueda flexible de columnas
    const products: Product[] = jsonData.map((row: any, index: number) => mapRowToProduct(row, index));
    
    // Mostrar un producto mapeado de ejemplo
    if (products.length > 0) {
      console.log('Producto ejemplo (mapeado):', products[0]);
    }

    console.log('Productos parseados:', products.length);
    return products;
  } catch (error) {
    console.error('Error detallado al cargar Excel:', error);
    throw error;
  }
};

