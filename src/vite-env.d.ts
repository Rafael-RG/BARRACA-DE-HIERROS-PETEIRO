/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_GOOGLE_API_KEY: string;
  readonly VITE_GOOGLE_SPREADSHEET_ID: string;
  readonly VITE_GOOGLE_SHEET_NAME: string;
  readonly VITE_EXCEL_URL: string;
  readonly VITE_AUTHORIZED_EMAILS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
