// Configuración de la aplicación
export const config = {
  // URL del archivo Excel desde Google Sheets
  // Tu cliente puede editar el Google Sheets y los cambios se reflejarán automáticamente
  // https://docs.google.com/spreadsheets/d/1svGWJfEoFG-Y23rA0XBFpH1C2T_MT8R9/edit
  excelUrl: import.meta.env.VITE_EXCEL_URL || 'https://docs.google.com/spreadsheets/d/1svGWJfEoFG-Y23rA0XBFpH1C2T_MT8R9/export?format=xlsx',
};
