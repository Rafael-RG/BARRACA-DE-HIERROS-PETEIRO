// Configuración de la aplicación
export const config = {
  // URL del archivo Excel en Hostinger
  // Ejemplo: 'https://tudominio.com/data/productos.xlsx'
  // Para desarrollo local, puedes usar null y la app usará el Excel local en /productos.xlsx
  excelUrl: import.meta.env.VITE_EXCEL_URL || '/productos.xlsx',
};
