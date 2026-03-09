# Guía de Configuración para Hostinger

## Paso 1: Preparar el archivo Excel

1. Asegúrate de que tu archivo Excel tenga las siguientes columnas (en este orden es recomendado):
   
   | Nombre | Categoría | Tipo | Calibre | Medida | Precio | Presentacion | Imagen | Observacion |
   |--------|-----------|------|---------|---------|--------|--------------|--------|-------------|
   | Chapas para techos, Sinusoidal, 30", 0,80 mts x 3,60mts | Chapas para techos | Sinusoidal | 30 | 0,80 mts x 3,60mts | 16.80 | x unidad | | |

2. Guarda el archivo como `productos.xlsx`

## Paso 2: Subir el Excel a Hostinger

1. Inicia sesión en tu panel de Hostinger
2. Ve a **Administrador de archivos** (File Manager)
3. Navega a la carpeta raíz de tu sitio web:
   - Generalmente es `public_html` o `domains/tudominio.com/public_html`
4. Crea una nueva carpeta llamada `data`:
   - Haz clic en **Nueva carpeta** (New Folder)
   - Nombre: `data`
5. Entra a la carpeta `data` y sube tu archivo Excel:
   - Haz clic en **Subir** (Upload)
   - Selecciona `productos.xlsx`
   - Espera a que se complete la carga

## Paso 3: Obtener la URL del Excel

La URL de tu archivo Excel será:
```
https://tudominio.com/data/productos.xlsx
```

Ejemplo real:
```
https://barracapeteiro.com/data/productos.xlsx
```

Para verificar que la URL es correcta:
1. Abre un navegador
2. Pega la URL completa
3. El archivo debería comenzar a descargarse

## Paso 4: Configurar la aplicación

### Opción A: Usando archivo .env.local (Recomendado para desarrollo)

1. En tu computadora, abre el proyecto
2. Crea o edita el archivo `.env.local` en la raíz del proyecto
3. Agrega la siguiente línea:
   ```
   VITE_EXCEL_URL=https://tudominio.com/data/productos.xlsx
   ```
4. Guarda el archivo

### Opción B: Editar directamente en el código (Para producción)

1. Abre el archivo `src/config.ts`
2. Cambia la línea:
   ```typescript
   excelUrl: import.meta.env.VITE_EXCEL_URL || null,
   ```
   Por:
   ```typescript
   excelUrl: 'https://tudominio.com/data/productos.xlsx',
   ```

## Paso 5: Compilar la aplicación

1. Abre una terminal/consola en la carpeta del proyecto
2. Ejecuta:
   ```bash
   npm install
   npm run build
   ```
3. Espera a que termine (creará una carpeta `dist`)

## Paso 6: Subir la aplicación a Hostinger

1. Ve al **Administrador de archivos** de Hostinger
2. Navega a `public_html` (o la carpeta raíz de tu dominio)
3. **Importante:** Elimina todos los archivos existentes en `public_html` EXCEPTO:
   - La carpeta `data` que creamos antes
   - Archivos de configuración como `.htaccess` (si existen)
4. Sube TODO el contenido de la carpeta `dist` a `public_html`:
   - Selecciona todos los archivos dentro de `dist`
   - Arrastra y suelta en `public_html`
   - O usa el botón **Subir** (Upload)

## Paso 7: Verificar que funciona

1. Abre tu navegador
2. Ve a `https://tudominio.com`
3. Deberías ver tu aplicación cargando los productos del Excel

## ¿Cómo actualizar los productos?

Para actualizar los productos después de que la app esté publicada:

1. Edita tu archivo Excel en tu computadora
2. Ve al **Administrador de archivos** de Hostinger
3. Ve a la carpeta `data`
4. Elimina el archivo `productos.xlsx` antiguo
5. Sube el nuevo archivo `productos.xlsx`
6. Los clientes verán los cambios la próxima vez que accedan a la página

**Importante:** Los cambios son automáticos. Cada vez que un cliente accede a la página, se cargan los datos más recientes del Excel.

## Solución de problemas

### No se cargan los productos

1. Verifica que la URL del Excel sea correcta:
   - Abre `https://tudominio.com/data/productos.xlsx` en tu navegador
   - Debería descargar el archivo

2. Verifica la consola del navegador:
   - Presiona F12
   - Ve a la pestaña "Console"
   - Busca errores en rojo

3. Verifica los permisos del archivo:
   - En Hostinger, haz clic derecho en `productos.xlsx`
   - Selecciona **Permisos** o **Permissions**
   - Asegúrate de que sea `644` o `-rw-r--r--`

### Error de CORS

Si aparece un error de CORS en la consola:

1. Crea un archivo `.htaccess` en la carpeta `data`
2. Agrega el siguiente contenido:
   ```apache
   <IfModule mod_headers.c>
       Header set Access-Control-Allow-Origin "*"
   </IfModule>
   ```

### La aplicación muestra "Catálogo de Muestra"

Esto significa que no se pudo cargar el Excel desde el servidor. Verifica:
1. Que la URL en la configuración sea correcta
2. Que el archivo Excel exista en Hostinger
3. Que sea accesible públicamente

## Notas adicionales

- La aplicación carga automáticamente los datos más recientes cada vez que un cliente accede a la página
- No es necesario que los clientes refresquen manualmente o hagan ninguna acción especial
- Los cambios en el Excel se reflejan inmediatamente para nuevas visitas
- La aplicación es de solo lectura para los clientes, solo tú puedes actualizar el Excel desde Hostinger
