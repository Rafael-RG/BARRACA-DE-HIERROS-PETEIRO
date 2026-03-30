<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Barraca de Hierros Peteiro

Aplicación web para mostrar el catálogo de productos de la Barraca de Hierros Peteiro a los clientes.

## Características

- 📊 Carga automática de productos desde Excel alojado en Hostinger
- 🔍 Búsqueda y filtrado por categorías
- 📱 Diseño responsive y moderno
- 🎨 Vista de lista y grilla
- 🚀 Actualización automática al cargar la página
- 🔐 **Panel de Administración** para gestionar precios (nuevo)

## 🔐 Panel de Administración

El sitio incluye un **panel admin** para actualizar precios sin necesidad de editar el Excel cada vez.

### Acceso
- URL: `https://tudominio.com/#/admin`
- Contraseña por defecto: `peteiro2025`
- También accesible desde el enlace "Admin" en el footer

### Características del Panel
- ✅ Editar precios en tiempo real
- ✅ Búsqueda de productos
- ✅ Exportar Excel con precios actualizados
- ✅ Restaurar precios originales
- ✅ Cambios se aplican instantáneamente en el sitio

### Documentación Completa
Ver [ADMIN_PANEL_GUIA.md](ADMIN_PANEL_GUIA.md) para instrucciones detalladas sobre:
- Cómo cambiar la contraseña
- Cómo funciona el sistema de precios
- Flujo de trabajo recomendado
- Troubleshooting

---

## Configuración para Hostinger

### 1. Preparar el archivo Excel

1. Asegúrate de que tu archivo Excel tenga las siguientes columnas:
   - `Nombre` - Nombre del producto
   - `Categoría` - Categoría del producto (ej: "Chapas para techos", "Caños de hierro")
   - `Tipo` - Tipo específico (ej: "Sinusoidal", "Lisa", "Redondo")
   - `Calibre` - Calibre o grosor (opcional)
   - `Medida` - Medidas del producto (opcional)
   - `Precio` - Precio del producto (número o "Consultar")
   - `Presentacion` - Forma de venta (ej: "x unidad", "x metro lineal") (opcional)
   - `Imagen` - URL de la imagen del producto (opcional)
   - `Observacion` - Notas adicionales (opcional)

2. Sube el archivo Excel al administrador de archivos de Hostinger:
   - Accede al panel de Hostinger
   - Ve a **Administrador de archivos**
   - Crea una carpeta llamada `data` en la raíz de tu sitio (ej: `public_html/data/`)
   - Sube tu archivo Excel (ej: `productos.xlsx`)

### 2. Configurar la aplicación

1. Copia el archivo `.env.example` a `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edita `.env.local` y configura la URL de tu Excel:
   ```env
   VITE_EXCEL_URL=https://tudominio.com/data/productos.xlsx
   ```
   
   Reemplaza `tudominio.com` con tu dominio real de Hostinger.

### 3. Compilar para producción

```bash
npm run build
```

Esto generará una carpeta `dist` con los archivos listos para subir a Hostinger.

### 4. Subir a Hostinger

1. Accede al administrador de archivos de Hostinger
2. Ve a la carpeta `public_html` (o la carpeta raíz de tu dominio)
3. Sube todo el contenido de la carpeta `dist` a `public_html`

### 5. Actualizar productos

Para actualizar los productos:
1. Accede al administrador de archivos de Hostinger
2. Edita o reemplaza el archivo Excel en la carpeta `data`
3. Los clientes verán los cambios la próxima vez que accedan a la página

**Nota:** Los cambios son automáticos. No es necesario recompilar la aplicación.

## Desarrollo Local

**Prerrequisitos:** Node.js

1. Instala las dependencias:
   ```bash
   npm install
   ```

2. Configura las variables de entorno en `.env.local`:
   ```env
   VITE_EXCEL_URL=https://tudominio.com/data/productos.xlsx
   ```
   
   O déjalo vacío para usar datos de muestra durante el desarrollo.

3. Ejecuta la aplicación:
   ```bash
   npm run dev
   ```

La 

## Estructura del Proyecto

```
├── src/
│   ├── App.tsx              # Componente principal
│   ├── config.ts            # Configuración de la app
│   ├── types.ts             # Definiciones de tipos TypeScript
│   └── utils/
│       └── excelParser.ts   # Utilidad para parsear archivos Excel
├── .env.example             # Ejemplo de variables de entorno
└── README.md                # Este archivo
```

## Solución de Problemas

### Los productos no cargan desde el servidor

1. Verifica que la URL en `.env.local` sea correcta
2. Asegúrate de que el archivo Excel esté accesible públicamente
3. Revisa la consola del navegador para ver errores específicos
4. Verifica que el archivo Excel tenga el formato correcto

### Error de CORS

Si ves errores de CORS, asegúrate de que:
1. El archivo Excel esté en el mismo dominio que la aplicación
2. O configura los headers CORS en Hostinger para permitir el acceso

### El Excel no se actualiza

1. Haz clic en el botón de refrescar 🔄 en la aplicación
2. Verifica que hayas guardado los cambios en el archivo Excel en Hostinger
3. Limpia la caché del navegador (Ctrl+F5 o Cmd+Shift+R)

## Soporte

Para preguntas o problemas, contacta al desarrollador.
Los cambios se verán la próxima vez que alguien cargue la página