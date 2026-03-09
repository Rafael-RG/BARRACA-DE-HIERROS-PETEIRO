import * as XLSX from 'xlsx';
import { Product } from '../types';

export const parseExcelFile = (file: File): Promise<Product[]> => {
  return file.arrayBuffer().then(buffer => {
    const data = new Uint8Array(buffer);
    const workbook = XLSX.read(data, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    const products: Product[] = jsonData.map((row: any, index: number) => ({
      id: `prod-${index}`,
      nombre: row['Nombre'] || row['nombre'] || '',
      categoria: row['Categoría'] || row['categoria'] || 'General',
      tipo: row['Tipo'] || row['tipo'] || 'Varios',
      calibre: row['Calibre'] || row['calibre'],
      medida: row['Medida'] || row['medida'],
      precio: row['Precio'] || row['precio'] || row['Precio(IVAInc.)'] || row['Precio en lista'],
      imagen: row['Imagen'] || row['imagen'],
      presentacion: row['Presentacion'] || row['presentacion'],
      observacion: row['Observacion'] || row['observacion'],
    }));
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

    // Map to Product interface
    const products: Product[] = jsonData.map((row: any, index: number) => ({
      id: `prod-${index}`,
      nombre: row['Nombre'] || row['nombre'] || '',
      categoria: row['Categoría'] || row['categoria'] || 'General',
      tipo: row['Tipo'] || row['tipo'] || 'Varios',
      calibre: row['Calibre'] || row['calibre'],
      medida: row['Medida'] || row['medida'],
      precio: row['Precio'] || row['precio'] || row['Precio(IVAInc.)'] || row['Precio en lista'],
      imagen: row['Imagen'] || row['imagen'],
      presentacion: row['Presentacion'] || row['presentacion'],
      observacion: row['Observacion'] || row['observacion'],
    }));

    console.log('Productos parseados:', products.length);
    return products;
  } catch (error) {
    console.error('Error detallado al cargar Excel:', error);
    throw error;
  }
};

