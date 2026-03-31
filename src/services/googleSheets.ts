import { Product } from '../types';

// Declaración de tipos para las APIs de Google cargadas desde CDN
declare const google: any;
declare const gapi: any;

// Configuración de Google API
// IMPORTANTE: Estas credenciales deben configurarse en Google Cloud Console
export const GOOGLE_CONFIG = {
  clientId: import.meta.env?.VITE_GOOGLE_CLIENT_ID || '',
  apiKey: import.meta.env?.VITE_GOOGLE_API_KEY || '',
  scopes: 'https://www.googleapis.com/auth/spreadsheets',
  discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
};

// ID del Google Sheet (extraído de la URL)
// https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
export const SPREADSHEET_ID = import.meta.env?.VITE_GOOGLE_SPREADSHEET_ID || '';
export const SHEET_NAME = import.meta.env?.VITE_GOOGLE_SHEET_NAME || 'CVS'; // Nombre de la pestaña

// Lista de emails autorizados (separados por comas)
// Dejar vacío para permitir cualquier email (no recomendado en producción)
const AUTHORIZED_EMAILS = import.meta.env?.VITE_AUTHORIZED_EMAILS || '';

// Mapeo de columnas del Excel:
// A=0: Producto_Imagen, B=1: Imagen, C=2: Nombre, D=3: Nombre(solo valores),
// E=4: Categoría, F=5: Medidas, G=6: Tipo, H=7: Medida concatenadas,
// I=8: Calibre("), J=9: Calibre(mm), K=10: Diametro("), L=11: Diametro(mm),
// M=12: Medida(Alto x ancho), N=13: Calidad, O=14: Ancho("), P=15: Ancho(mm),
// Q=16: Ancho(cm), R=17: Ancho(mts), S=18: Largo(mts), T=19: Color,
// U=20: Precio(IVAInc.), V=21: Presentacion, W=22: Observacion, X=23: Activo
const COLUMN_INDEX = {
  PRODUCTO_IMAGEN: 0,  // A
  IMAGEN: 1,          // B
  NOMBRE: 2,          // C
  CATEGORIA: 4,       // E
  TIPO: 6,            // G
  MEDIDA: 7,          // H - Medida concatenadas
  CALIBRE: 8,         // I - Calibre(")
  PRECIO: 20,         // U - Precio(IVAInc.)
  PRESENTACION: 21,   // V
  OBSERVACION: 22,    // W
  ACTIVO: 23         // X
};

class GoogleSheetsService {
  private isInitialized = false;
  private isSignedIn = false;
  private accessToken: string | null = null;
  private userEmail: string | null = null;
  private tokenClient: any = null;

  /**
   * Inicializa el cliente de Google API
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    return new Promise((resolve, reject) => {
      // Esperar a que los scripts se carguen
      const checkLoaded = () => {
        if (typeof gapi === 'undefined' || typeof google === 'undefined') {
          setTimeout(checkLoaded, 100);
          return;
        }

        try {
          // Inicializar gapi client
          gapi.load('client', async () => {
            try {
              await gapi.client.init({
                apiKey: GOOGLE_CONFIG.apiKey,
                discoveryDocs: GOOGLE_CONFIG.discoveryDocs,
              });

              // Verificar si hay un token guardado en sessionStorage
              const savedToken = sessionStorage.getItem('google_access_token');
              const savedEmail = sessionStorage.getItem('google_user_email');
              
              if (savedToken && savedEmail) {
                // Validar si el email guardado está autorizado antes de restaurar
                if (this.isEmailAuthorized(savedEmail)) {
                  // Restaurar el token
                  this.accessToken = savedToken;
                  this.userEmail = savedEmail;
                  this.isSignedIn = true;
                  
                  gapi.client.setToken({
                    access_token: savedToken,
                  });
                  
                  console.log('Sesión de Google restaurada desde sessionStorage');
                } else {
                  // El email ya no está autorizado, limpiar sesión
                  console.warn('Email guardado ya no está autorizado. Limpiando sesión...');
                  sessionStorage.removeItem('google_access_token');
                  sessionStorage.removeItem('google_user_email');
                }
              }

              // Inicializar Google Identity Services (GIS) Token Client
              this.tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: GOOGLE_CONFIG.clientId,
                scope: GOOGLE_CONFIG.scopes,
                callback: (response: any) => {
                  if (response.error) {
                    console.error('Error getting token:', response);
                    return;
                  }
                  this.accessToken = response.access_token;
                  this.isSignedIn = true;
                  
                  // Guardar token en sessionStorage
                  sessionStorage.setItem('google_access_token', response.access_token);
                  
                  // Obtener email del usuario usando la nueva API
                  this.fetchUserEmail();
                },
              });

              this.isInitialized = true;
              resolve();
            } catch (error) {
              console.error('Error initializing gapi client:', error);
              reject(error);
            }
          });
        } catch (error) {
          console.error('Error loading gapi:', error);
          reject(error);
        }
      };

      checkLoaded();
    });
  }

  /**
   * Obtiene el email del usuario usando Google People API
   */
  private async fetchUserEmail(): Promise<void> {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        this.userEmail = data.email;
        // Guardar email en sessionStorage
        sessionStorage.setItem('google_user_email', data.email);
      }
    } catch (error) {
      console.error('Error fetching user email:', error);
    }
  }

  /**
   * Verifica si un email está en la lista de autorizados
   */
  private isEmailAuthorized(email: string | null): boolean {
    // Si no hay email, denegar acceso
    if (!email) {
      return false;
    }

    // Si no hay lista de emails autorizados, permitir cualquier email
    // (solo para desarrollo, en producción se debe configurar la lista)
    if (!AUTHORIZED_EMAILS || AUTHORIZED_EMAILS.trim() === '') {
      console.warn('ADVERTENCIA: No hay lista de emails autorizados configurada. Se permite acceso a cualquier usuario.');
      return true;
    }

    // Convertir la lista de emails en un array y normalizar (trim y lowercase)
    const authorizedList = AUTHORIZED_EMAILS
      .split(',')
      .map(e => e.trim().toLowerCase())
      .filter(e => e.length > 0);

    // Verificar si el email del usuario está en la lista
    const isAuthorized = authorizedList.includes(email.toLowerCase());
    
    if (!isAuthorized) {
      console.warn(`Acceso denegado para el email: ${email}`);
    }

    return isAuthorized;
  }

  /**
   * Inicia sesión con Google usando GIS
   */
  async signIn(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      try {
        // Actualizar el callback para resolver la promesa
        this.tokenClient.callback = async (response: any) => {
          if (response.error) {
            console.error('Error getting token:', response);
            reject(new Error('No se pudo obtener el token de acceso'));
            return;
          }
          
          this.accessToken = response.access_token;
          this.isSignedIn = true;
          
          // Guardar token en sessionStorage
          sessionStorage.setItem('google_access_token', response.access_token);
          
          // Establecer el token en gapi client
          gapi.client.setToken({
            access_token: this.accessToken,
          });
          
          // Obtener email del usuario
          await this.fetchUserEmail();
          
          // Validar si el email está autorizado
          if (!this.isEmailAuthorized(this.userEmail)) {
            // Limpiar sesión si el usuario no está autorizado
            this.accessToken = null;
            this.isSignedIn = false;
            this.userEmail = null;
            sessionStorage.removeItem('google_access_token');
            sessionStorage.removeItem('google_user_email');
            gapi.client.setToken(null);
            
            reject(new Error('Acceso denegado. Tu email no está autorizado para acceder al panel de administración.'));
            return;
          }
          
          console.log('Sesión de Google iniciada y guardada en sessionStorage');
          resolve();
        };

        // Solicitar token de acceso (abre popup de Google)
        this.tokenClient.requestAccessToken({ prompt: 'consent' });
      } catch (error) {
        console.error('Error signing in:', error);
        reject(new Error('No se pudo iniciar sesión con Google'));
      }
    });
  }

  /**
   * Cierra sesión
   */
  async signOut(): Promise<void> {
    if (!this.isSignedIn) return;

    try {
      if (this.accessToken) {
        // Revocar el token de acceso
        google.accounts.oauth2.revoke(this.accessToken, () => {
          console.log('Token revoked');
        });
      }
      
      this.accessToken = null;
      this.isSignedIn = false;
      this.userEmail = null;
      gapi.client.setToken(null);
      
      // Limpiar sessionStorage
      sessionStorage.removeItem('google_access_token');
      sessionStorage.removeItem('google_user_email');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return this.isSignedIn;
  }

  /**
   * Obtiene el email del usuario autenticado
   */
  getCurrentUserEmail(): string | null {
    return this.userEmail;
  }

  /**
   * Lee todos los datos del Google Sheet
   */
  async readSheet(): Promise<Product[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const response = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A:X`, // Columnas A-X (24 columnas)
      });

      const rows = response.result.values || [];
      
      if (rows.length === 0) {
        return [];
      }

      const products: Product[] = [];

      // Procesar cada fila (empezando desde la segunda, saltando header)
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row[COLUMN_INDEX.NOMBRE]) continue; // Saltar filas sin nombre

        // Usar Producto_Imagen si existe, sino usar Imagen
        const imagen = row[COLUMN_INDEX.PRODUCTO_IMAGEN] || row[COLUMN_INDEX.IMAGEN] || undefined;

        const product: Product = {
          id: `gs-${i}`, // ID basado en la fila
          nombre: row[COLUMN_INDEX.NOMBRE] || '',
          categoria: row[COLUMN_INDEX.CATEGORIA] || '',
          tipo: row[COLUMN_INDEX.TIPO] || '',
          calibre: row[COLUMN_INDEX.CALIBRE] || undefined,
          medida: row[COLUMN_INDEX.MEDIDA] || undefined,
          precio: row[COLUMN_INDEX.PRECIO] || undefined,
          presentacion: row[COLUMN_INDEX.PRESENTACION] || undefined,
          imagen: imagen,
          observacion: row[COLUMN_INDEX.OBSERVACION] || undefined,
          activo: row[COLUMN_INDEX.ACTIVO] || 'Si', // Por defecto 'Si'
        };

        products.push(product);
      }

      return products;
    } catch (error) {
      console.error('Error reading sheet:', error);
      throw new Error('No se pudo leer el Google Sheet');
    }
  }

  /**
   * Actualiza el precio de un producto en el Google Sheet
   */
  async updateProductPrice(rowIndex: number, newPrice: string | number): Promise<void> {
    if (!this.isSignedIn) {
      throw new Error('Debes iniciar sesión para editar el sheet');
    }

    try {
      // La columna U (índice 20) es donde está el precio
      const columnLetter = 'U'; // Precio(IVAInc.)
      const range = `${SHEET_NAME}!${columnLetter}${rowIndex + 1}`; // +1 porque Excel es 1-indexed y +1 por el header

      await gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: range,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [[newPrice]],
        },
      });
    } catch (error) {
      console.error('Error updating price:', error);
      throw new Error('No se pudo actualizar el precio');
    }
  }

  /**
   * Actualiza múltiples precios de una vez (batch update)
   */
  async updateMultiplePrices(updates: Array<{ rowIndex: number; price: string | number }>): Promise<void> {
    if (!this.isSignedIn) {
      throw new Error('Debes iniciar sesión para editar el sheet');
    }

    try {
      const data = updates.map(update => ({
        range: `${SHEET_NAME}!U${update.rowIndex + 1}`, // Columna U = Precio
        values: [[update.price]],
      }));

      await gapi.client.sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        resource: {
          valueInputOption: 'USER_ENTERED',
          data: data,
        },
      });
    } catch (error) {
      console.error('Error updating multiple prices:', error);
      throw new Error('No se pudieron actualizar los precios');
    }
  }

  /**
   * Activa o desactiva un producto (columna X - Activo)
   */
  async toggleProductActive(rowIndex: number, isActive: boolean): Promise<void> {
    if (!this.isSignedIn) {
      throw new Error('Debes iniciar sesión para editar el sheet');
    }

    try {
      const columnLetter = 'X'; // Columna Activo
      const range = `${SHEET_NAME}!${columnLetter}${rowIndex + 1}`;
      const value = isActive ? 'Si' : 'No';

      await gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: range,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [[value]],
        },
      });
    } catch (error) {
      console.error('Error toggling product active status:', error);
      throw new Error('No se pudo cambiar el estado del producto');
    }
  }

  /**
   * Agrega un nuevo producto al final del Google Sheet
   */
  async addProduct(product: Omit<Product, 'id'>): Promise<void> {
    if (!this.isSignedIn) {
      throw new Error('Debes iniciar sesión para agregar productos');
    }

    try {
      // Crear un array de 24 elementos (columnas A-X) con los valores en las posiciones correctas
      const row = new Array(24).fill('');
      row[COLUMN_INDEX.PRODUCTO_IMAGEN] = product.imagen || ''; // A
      row[COLUMN_INDEX.IMAGEN] = product.imagen || '';          // B
      row[COLUMN_INDEX.NOMBRE] = product.nombre;                 // C
      row[COLUMN_INDEX.CATEGORIA] = product.categoria;           // E
      row[COLUMN_INDEX.TIPO] = product.tipo;                     // G
      row[COLUMN_INDEX.MEDIDA] = product.medida || '';           // H
      row[COLUMN_INDEX.CALIBRE] = product.calibre || '';         // I
      row[COLUMN_INDEX.PRECIO] = product.precio || '';           // U
      row[COLUMN_INDEX.PRESENTACION] = product.presentacion || ''; // V
      row[COLUMN_INDEX.OBSERVACION] = product.observacion || '';   // W
      row[COLUMN_INDEX.ACTIVO] = product.activo || 'Si';          // X

      await gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A:X`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [row],
        },
      });
    } catch (error) {
      console.error('Error adding product:', error);
      throw new Error('No se pudo agregar el producto');
    }
  }

  /**
   * Elimina un producto (marca la fila como vacía)
   */
  async deleteProduct(rowIndex: number): Promise<void> {
    if (!this.isSignedIn) {
      throw new Error('Debes iniciar sesión para eliminar productos');
    }

    try {
      // Limpiar toda la fila (columnas A-X)
      const range = `${SHEET_NAME}!A${rowIndex + 1}:X${rowIndex + 1}`;

      await gapi.client.sheets.spreadsheets.values.clear({
        spreadsheetId: SPREADSHEET_ID,
        range: range,
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      throw new Error('No se pudo eliminar el producto');
    }
  }

  /**
   * Actualiza un producto completo
   */
  async updateProduct(rowIndex: number, product: Product): Promise<void> {
    if (!this.isSignedIn) {
      throw new Error('Debes iniciar sesión para editar productos');
    }

    try {
      // Crear un array de 24 elementos (columnas A-X) con los valores en las posiciones correctas
      const row = new Array(24).fill('');
      row[COLUMN_INDEX.PRODUCTO_IMAGEN] = product.imagen || ''; // A
      row[COLUMN_INDEX.IMAGEN] = product.imagen || '';          // B
      row[COLUMN_INDEX.NOMBRE] = product.nombre;                 // C
      row[COLUMN_INDEX.CATEGORIA] = product.categoria;           // E
      row[COLUMN_INDEX.TIPO] = product.tipo;                     // G
      row[COLUMN_INDEX.MEDIDA] = product.medida || '';           // H
      row[COLUMN_INDEX.CALIBRE] = product.calibre || '';         // I
      row[COLUMN_INDEX.PRECIO] = product.precio || '';           // U
      row[COLUMN_INDEX.PRESENTACION] = product.presentacion || ''; // V
      row[COLUMN_INDEX.OBSERVACION] = product.observacion || '';   // W
      row[COLUMN_INDEX.ACTIVO] = product.activo || 'Si';          // X

      const range = `${SHEET_NAME}!A${rowIndex + 1}:X${rowIndex + 1}`;

      await gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: range,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [row],
        },
      });
    } catch (error) {
      console.error('Error updating product:', error);
      throw new Error('No se pudo actualizar el producto');
    }
  }
}

// Exportar una instancia única (singleton)
export const googleSheetsService = new GoogleSheetsService();
