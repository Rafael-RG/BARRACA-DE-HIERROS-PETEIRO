// Configuración de la aplicación
export const config = {
  // URL del archivo Excel desde Google Sheets
  // Tu cliente puede editar el Google Sheets y los cambios se reflejarán automáticamente
  // https://docs.google.com/spreadsheets/d/1T1YNmJge14RrDwfJLgkImxpF2Tiysb4O9Z3Y5ekVBEE/edit
  excelUrl: import.meta.env.VITE_EXCEL_URL || 'https://docs.google.com/spreadsheets/d/1T1YNmJge14RrDwfJLgkImxpF2Tiysb4O9Z3Y5ekVBEE/export?format=xlsx&gid=1549489624',
};
