import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  Search, 
  Package, 
  Filter, 
  ChevronRight, 
  ChevronLeft,
  Grid, 
  List as ListIcon,
  Download,
  AlertCircle,
  ArrowLeft,
  MessageCircle,
  Phone,
  MapPin,
  Wrench,
  Hammer,
  Sparkles,
  Instagram
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { parseExcelFromUrl } from './utils/excelParser';
import { Product, GroupedProducts } from './types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { config } from './config';
import { ProductDetailModal } from './components/ProductDetailModal';
import { SmartImage } from './components/SmartImage';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Constantes globales
const WHATSAPP_NUMBER = '59896407663'; // Uruguay: 096 407 663

// Sample data based on PDF for initial view
const SAMPLE_DATA: Product[] = [
  { id: 's1', nombre: 'Chapas para techos, Sinusoidal, 30", 0,80 mts x 3,60mts', categoria: 'Chapas para techos', tipo: 'Sinusoidal', calibre: '30', medida: '0,80 mts x 3,60mts', precio: 16.8, presentacion: 'x unidad' },
  { id: 's2', nombre: 'Chapas para techos, Sinusoidal, 30", 0,08 mts x 4,00mts', categoria: 'Chapas para techos', tipo: 'Sinusoidal', calibre: '30', medida: '0,08 mts x 4,00mts', precio: 18.9, presentacion: 'x unidad' },
  { id: 's3', nombre: 'Chapas para techos, Lisa, 14", 1mts x 2mts, Galvanizada', categoria: 'Chapas para techos', tipo: 'Lisa', calibre: '14', medida: '1mts x 2mts', precio: 'Consultar', presentacion: 'x unidad' },
  { id: 's4', nombre: 'Planchas de hierro, Lisas, 12", 1,22 mts x 3mts', categoria: 'Planchas de hierro', tipo: 'Lisas', calibre: '12', medida: '1,22 mts x 3mts', precio: 'Consultar', presentacion: 'x unidad' },
  { id: 's5', nombre: 'Caño de hierro, Redondo, 1,5", mts x 6mts', categoria: 'Caño de hierro', tipo: 'Redondo', calibre: '1,5', medida: 'mts x 6mts', precio: 1.72, presentacion: 'x metro lineal' },
];

export default function App() {
  const [products, setProducts] = useState<Product[]>(SAMPLE_DATA);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isUsingRemoteData, setIsUsingRemoteData] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set());
  const [typePages, setTypePages] = useState<Map<string, number>>(new Map());
  const [currentView, setCurrentView] = useState<'categories' | 'products' | 'about' | 'contact'>('categories');
  
  const PRODUCTS_PER_PAGE = 20;

  // Log version on mount
  useEffect(() => {
    console.log('%c🏗️ Barraca de Hierros Peteiro v1.0.0', 'color: #dc2626; font-size: 14px; font-weight: bold');
    console.log('Build date:', new Date().toISOString().split('T')[0]);
  }, []);

  // Cargar Excel desde URL remota
  const loadRemoteExcel = useCallback(async () => {
    if (!config.excelUrl) {
      console.log('No hay URL de Excel configurada, usando datos de muestra');
      return;
    }
    
    console.log('Intentando cargar Excel desde:', config.excelUrl);
    setIsLoading(true);
    setLoadError(null);
    
    try {
      const parsedProducts = await parseExcelFromUrl(config.excelUrl);
      console.log('Excel cargado exitosamente, productos:', parsedProducts.length);
      setProducts(parsedProducts);
      setSelectedCategory(null);
      setIsUsingRemoteData(true);
    } catch (error) {
      console.error('Error cargando Excel:', error);
      setLoadError(`No se pudo cargar el archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      setIsUsingRemoteData(false);
      // Mantener los datos de muestra en caso de error
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cargar automáticamente al iniciar si hay URL configurada
  useEffect(() => {
    if (config.excelUrl) {
      loadRemoteExcel();
    }
  }, [loadRemoteExcel]);

  // La página siempre carga datos frescos al entrar, no necesita auto-refresh

  const filteredProducts = useMemo(() => {
    const filtered = products.filter(p => {
      const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.categoria.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || p.categoria === selectedCategory;
      return matchesSearch && matchesCategory;
    });
    return filtered;
  }, [products, searchTerm, selectedCategory]);

  const groupedProducts = useMemo(() => {
    const grouped: GroupedProducts = {};
    filteredProducts.forEach(p => {
      if (!grouped[p.categoria]) grouped[p.categoria] = {};
      if (!grouped[p.categoria][p.tipo]) grouped[p.categoria][p.tipo] = [];
      grouped[p.categoria][p.tipo].push(p);
    });
    return grouped;
  }, [filteredProducts]);

  const categories = useMemo(() => {
    return Array.from(new Set(products.map(p => p.categoria)));
  }, [products]);

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setCurrentView('products');
  };

  const handleBackToCategories = () => {
    setCurrentView('categories');
    setSelectedCategory(null);
    setSearchTerm('');
    setTypePages(new Map());
  };

  const toggleType = (category: string, type: string) => {
    const key = `${category}-${type}`;
    setExpandedTypes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const getTypePage = (category: string, type: string): number => {
    const key = `${category}-${type}`;
    return typePages.get(key) || 1;
  };

  const setTypePage = (category: string, type: string, page: number) => {
    const key = `${category}-${type}`;
    setTypePages(prev => {
      const newMap = new Map(prev);
      newMap.set(key, page);
      return newMap;
    });
  };

  // Resetear páginas cuando cambien filtros o búsqueda
  useEffect(() => {
    setTypePages(new Map());
  }, [searchTerm, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-red-600/5 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <motion.div 
              className="h-16 w-auto flex items-center justify-center cursor-pointer"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
              onClick={handleBackToCategories}
            >
              <img 
                src="/Imagenes/Logo/Barraca_De_Hierros_Peteiro.png" 
                alt="Barraca de Hierros Peteiro"
                className="h-full w-auto object-contain"
              />
            </motion.div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleBackToCategories}
              className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Inicio
            </button>
            <button
              onClick={() => setCurrentView('about')}
              className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Sobre Nosotros
            </button>
            <button
              onClick={() => setCurrentView('contact')}
              className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Contacto
            </button>
          </div>
        </div>
      </header>

      <main className="w-full mx-auto px-4 lg:px-8 xl:px-12 py-8 flex-1">
        {/* Loading State - Barra de progreso centrada */}
        {isLoading && (
          <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-40 flex items-center justify-center">
            <div className="w-80 space-y-4">
              {/* Iconos animados */}
              <div className="flex justify-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Wrench className="w-8 h-8 text-red-600" />
                </motion.div>
                <motion.div
                  animate={{ 
                    rotate: -360,
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 1.5, repeat: Infinity, ease: "linear" },
                    scale: { duration: 1, repeat: Infinity }
                  }}
                >
                  <Hammer className="w-8 h-8 text-red-600" />
                </motion.div>
              </div>
              
              {/* Texto */}
              <div className="text-center">
                <h3 className="font-bold text-red-900 text-lg">Cargando productos...</h3>
              </div>
              
              {/* Barra de progreso */}
              <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                {/* Barra animada */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-red-500 via-red-600 to-red-500 bg-[length:200%_100%]"
                  animate={{
                    backgroundPosition: ['0% 0%', '200% 0%']
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
                
                {/* Brillo metálico que se mueve */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                  animate={{
                    x: ['-100%', '200%']
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {loadError && (
          <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="font-bold text-red-900">Error al cargar</h3>
              <p className="text-sm text-red-700">{loadError}</p>
            </div>
          </div>
        )}

        {currentView === 'categories' && (
          /* Vista de Categorías */
          <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-4xl font-bold tracking-tight mb-4">Nuestro Catálogo</h2>
              <p className="text-lg text-gray-600">Selecciona una categoría para ver nuestros productos</p>
            </div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {categories.map((category, index) => {
                const categoryProducts = products.filter(p => p.categoria === category);
                return (
                  <motion.button
                    key={category}
                    onClick={() => handleCategoryClick(category)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    className="group relative bg-white border-2 border-red-600/5 rounded-3xl p-8 hover:border-red-600 hover:shadow-2xl transition-all duration-300 text-left overflow-hidden"
                  >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    {/* Brillo metálico en hover */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-red-200/30 to-transparent opacity-0 group-hover:opacity-100"
                      initial={{ x: '-100%' }}
                      whileHover={{ 
                        x: '100%',
                        transition: { duration: 0.6, ease: "easeInOut" }
                      }}
                    />
                    
                    {/* Chispas decorativas */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Sparkles className="w-5 h-5 text-red-600/40" />
                    </div>
                    
                    <div className="relative z-10">
                      <motion.div 
                        className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mb-6 relative overflow-hidden"
                        whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                        transition={{ duration: 0.3 }}
                      >
                        {/* Pulso de fondo */}
                        <motion.div
                          className="absolute inset-0 bg-red-400 rounded-2xl"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 0, 0.5]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                        <Package className="w-8 h-8 text-white relative z-10" />
                      </motion.div>
                      
                      <h3 className="text-2xl font-bold mb-2 group-hover:text-red-600 transition-colors">
                        {category}
                      </h3>
                      
                      <p className="text-gray-500 text-sm mb-4">
                        {categoryProducts.length} {categoryProducts.length === 1 ? 'producto' : 'productos'}
                      </p>
                      
                      <div className="flex items-center gap-2 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Ver productos
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          </div>
        )}

        {currentView === 'about' && (
          /* Vista de Sobre Nosotros */
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <img 
                  src="/Imagenes/Logo/Barraca_De_Hierros_Peteiro.png" 
                  alt="Barraca de Hierros Peteiro"
                  className="h-32 w-auto object-contain rounded-2xl shadow-lg"
                />
              </div>
              <h2 className="text-4xl font-bold tracking-tight mb-4 text-red-600">Sobre Nosotros</h2>
            </div>

            {/* Sección: Quiénes Somos */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-red-600/10">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                En <span className="font-bold text-red-600">Barraca de Hierro Peteiro</span> nos especializamos en la 
                venta de hierros y materiales para construcción en Uruguay, brindando atención cercana, ágil y profesional.
              </p>
              <p className="text-gray-700 leading-relaxed mb-6">
                Desde 2005, acompañamos el desarrollo de obras en la costa este del país con productos de calidad y 
                soluciones pensadas para cada escala de proyecto. Nuestra primera sucursal en <span className="font-semibold">Parque del Plata (Canelones)</span> fue 
                el punto de partida de un camino que hoy se expande hacia el este con la apertura de nuestra nueva 
                sede en <span className="font-semibold">Punta del Diablo (Rocha)</span>.
              </p>
              <p className="text-gray-700 leading-relaxed mb-6">
                Con más de <span className="font-bold text-red-600">20 años de experiencia</span>, nos hemos consolidado como un{' '}
                <span className="font-bold">referente en el rubro</span> gracias a nuestro compromiso, asesoramiento 
                personalizado y vocación de servicio.
              </p>
            </div>

            {/* Sección: Qué nos diferencia */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-red-600/10">
              <h3 className="text-2xl font-bold mb-6 text-red-600">¿Qué nos diferencia?</h3>
              <ul className="space-y-3 text-gray-700 leading-relaxed">
                <li className="flex items-start gap-3">
                  <span className="text-red-600 text-xl">•</span>
                  <span>Atención cálida y humana</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 text-xl">•</span>
                  <span>Entregas en tiempo y forma</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 text-xl">•</span>
                  <span>Variedad de productos para obras grandes o pequeñas</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 text-xl">•</span>
                  <span>Asesoramiento técnico para elegir el producto correcto</span>
                </li>
              </ul>
            </div>

            {/* Sección: Mensaje de cierre */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-3xl p-8 shadow-lg border border-red-200">
              <p className="text-lg text-gray-800 leading-relaxed text-center italic">
                Estamos acá para <span className="font-bold text-red-700">ayudarte a construir</span> con seguridad, 
                confianza y la tranquilidad de trabajar con una empresa familiar que{' '}
                <span className="font-bold text-red-700">valora cada obra como si fuera propia</span>.
              </p>
              <p className="text-right text-gray-700 font-semibold mt-4">
                – Familia Peteiro
              </p>
            </div>

            <div className="text-center pt-8">
              <button
                onClick={handleBackToCategories}
                className="bg-red-600 text-white py-3 px-8 rounded-full font-medium hover:bg-red-700 transition-colors inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Volver al Catálogo
              </button>
            </div>
          </div>
        )}

        {currentView === 'contact' && (
          /* Vista de Contacto */
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
              <h2 className="text-4xl font-bold tracking-tight mb-4 text-red-600">Contacto</h2>
              <p className="text-lg text-gray-600">Estamos para ayudarte</p>
            </div>

            {/* Sección: Contáctanos */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-red-600/10">
              <h3 className="text-2xl font-bold mb-6 text-center">Canales de Contacto</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-3 p-6 bg-green-50 hover:bg-green-100 rounded-2xl transition-colors group"
                >
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg">WhatsApp</div>
                    <div className="text-sm text-gray-600">Contáctanos ahora</div>
                  </div>
                </a>

                <div className="flex flex-col items-center gap-3 p-6 bg-red-50 rounded-2xl">
                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                    <Phone className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg mb-2">Teléfonos</div>
                    <a href="tel:096610184" className="block text-sm text-gray-700 hover:text-red-600 font-medium transition-colors">
                      096 610 184
                    </a>
                    <a href="tel:096407663" className="block text-sm text-gray-700 hover:text-red-600 font-medium transition-colors">
                      096 407 663
                    </a>
                  </div>
                </div>

                <a
                  href="https://www.instagram.com/peteiro.barracadehierros/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-3 p-6 bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-2xl transition-colors group"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Instagram className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg">Instagram</div>
                    <div className="text-sm text-gray-600">@peteiro.barracadehierros</div>
                  </div>
                </a>
              </div>
            </div>

            {/* Sección: Sucursales */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-red-600/10">
              <h3 className="text-2xl font-bold mb-6 text-center">Nuestras Sucursales</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-2xl overflow-hidden">
                  <div className="aspect-video w-full">
                    <iframe
                      src="https://www.google.com/maps?q=-34.751879,-55.714363&hl=es&z=15&output=embed"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                  <div className="p-6 text-center">
                    <div className="font-bold text-lg mb-1">Parque del Plata</div>
                    <div className="text-sm text-gray-600 mb-3">Canelones</div>
                    <a
                      href="https://www.google.com/maps/search/-34.751879,+-55.714363"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
                    >
                      <MapPin className="w-4 h-4" />
                      Ver en Google Maps
                    </a>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl overflow-hidden">
                  <div className="aspect-video w-full">
                    <iframe
                      src="https://www.google.com/maps?q=-34.039037,-53.585109&hl=es&z=15&output=embed"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                  <div className="p-6 text-center">
                    <div className="font-bold text-lg mb-1">Punta del Diablo</div>
                    <div className="text-sm text-gray-600 mb-3">Rocha</div>
                    <a
                      href="https://www.google.com/maps/place/XC67%2B9XJ,+27200+Punta+del+Diablo,+Departamento+de+Rocha/@-34.039037,-53.585109,15z"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
                    >
                      <MapPin className="w-4 h-4" />
                      Ver en Google Maps
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center pt-8">
              <button
                onClick={handleBackToCategories}
                className="bg-red-600 text-white py-3 px-8 rounded-full font-medium hover:bg-red-700 transition-colors inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Volver al Catálogo
              </button>
            </div>
          </div>
        )}

        {currentView === 'products' && (
          /* Vista de Productos */
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar Filters */}
            <aside className="w-full md:w-64 shrink-0 space-y-6">
              {/* Barra de búsqueda */}
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                  <Search className="w-3 h-3" /> Buscar
                </h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text"
                    placeholder="Buscar productos..."
                    className="w-full pl-10 pr-4 py-2 bg-white border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Botón cambiar vista */}
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                  Vista
                </h2>
                <button 
                  onClick={() => setViewMode(v => v === 'grid' ? 'list' : 'grid')}
                  className="w-full flex items-center justify-center gap-2 p-3 hover:bg-gray-100 rounded-lg transition-colors border-2 border-gray-200 bg-white"
                  title="Cambiar vista"
                >
                  {viewMode === 'grid' ? (
                    <>
                      <ListIcon className="w-5 h-5" />
                      <span className="text-sm font-medium">Vista Lista</span>
                    </>
                  ) : (
                    <>
                      <Grid className="w-5 h-5" />
                      <span className="text-sm font-medium">Vista Cuadrícula</span>
                    </>
                  )}
                </button>
              </div>

              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                  <Filter className="w-3 h-3" /> Categorías
                </h2>
                <div className="space-y-1">
                  <button 
                    onClick={() => setSelectedCategory(null)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                      selectedCategory === null ? "bg-red-600 text-white font-medium" : "hover:bg-gray-200"
                    )}
                  >
                    Todas las categorías
                  </button>
                  {categories.map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                        selectedCategory === cat ? "bg-red-600 text-white font-medium" : "hover:bg-gray-200"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Product Display */}
            <div className="flex-1 min-w-0">
              {products === SAMPLE_DATA && !searchTerm && !selectedCategory && !isUsingRemoteData && (
                <div className="mb-8 p-6 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                      <Download className="text-amber-600 w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-amber-900">Catálogo de Muestra</h3>
                      <p className="text-sm text-amber-700">Estás viendo productos de ejemplo. Los datos reales se cargarán automáticamente una vez configurado.</p>
                    </div>
                  </div>
                </div>
              )}

              <AnimatePresence mode="wait">
                {Object.keys(groupedProducts).length > 0 ? (
                  <motion.div 
                    key="product-list"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-12"
                  >
                    {Object.entries(groupedProducts).map(([category, types]) => (
                      <section key={category} id={category.replaceAll(/\s+/g, '-').toLowerCase()}>
                        <div className="flex items-center gap-4 mb-6">
                          <h2 className="text-2xl font-bold tracking-tight">{category}</h2>
                          <div className="h-px bg-gray-200 flex-1" />
                        </div>

                        <div className="space-y-8">
                          {Object.entries(types).map(([type, items]) => {
                            const typeKey = `${category}-${type}`;
                            const isExpanded = expandedTypes.has(typeKey);
                            const currentPage = getTypePage(category, type);
                            const totalPages = Math.ceil(items.length / PRODUCTS_PER_PAGE);
                            const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
                            const endIndex = startIndex + PRODUCTS_PER_PAGE;
                            const paginatedItems = items.slice(startIndex, endIndex);
                            
                            return (
                              <div key={type} className="space-y-4">
                                <button
                                  onClick={() => toggleType(category, type)}
                                  className="w-full text-left flex items-center justify-between gap-4 group hover:bg-red-50 border border-gray-200 hover:border-red-300 px-6 py-4 rounded-xl transition-all shadow-sm hover:shadow-md"
                                >
                                  <div className="flex items-center gap-3 flex-1">
                                    <div className={cn(
                                      "w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center transition-transform",
                                      isExpanded && "bg-red-700"
                                    )}>
                                      <ChevronRight className={cn(
                                        "w-4 h-4 text-white transition-transform",
                                        isExpanded && "rotate-90"
                                      )} />
                                    </div>
                                    <h3 className="text-base font-bold text-gray-700 uppercase tracking-wide">
                                      {type}
                                    </h3>
                                  </div>
                                  <div className="flex items-center gap-6">
                                    <span className="text-sm text-gray-500 font-medium px-4 py-2 bg-gray-100 rounded-full">
                                      {items.length} {items.length === 1 ? 'producto' : 'productos'}
                                    </span>
                                    <div className="text-xs text-gray-400 font-medium">
                                      {isExpanded ? 'Click para colapsar' : 'Click para expandir'}
                                    </div>
                                  </div>
                                </button>
                                
                                <AnimatePresence>
                                  {isExpanded && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.3 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="space-y-4">
                                        <div className={cn(
                                          "grid gap-4",
                                          viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
                                        )}>
                                          {paginatedItems.map(item => (
                                            <ProductCard 
                                              key={item.id} 
                                              product={item} 
                                              viewMode={viewMode}
                                              whatsappNumber={WHATSAPP_NUMBER}
                                              onClick={() => setSelectedProduct(item)}
                                            />
                                          ))}
                                        </div>

                                        {/* Paginación por tipo */}
                                        {totalPages > 1 && (
                                          <div className="flex items-center justify-between border-t border-gray-200 pt-4 mt-4">
                                            <div className="text-sm text-gray-600">
                                              Mostrando <span className="font-medium">{startIndex + 1}</span> - <span className="font-medium">{Math.min(endIndex, items.length)}</span> de <span className="font-medium">{items.length}</span>
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                              <button
                                                onClick={() => setTypePage(category, type, Math.max(1, currentPage - 1))}
                                                disabled={currentPage === 1}
                                                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                                title="Página anterior"
                                              >
                                                <ChevronLeft className="w-4 h-4" />
                                              </button>
                                              
                                              <div className="flex items-center gap-1">
                                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                                                  if (
                                                    page === 1 ||
                                                    page === totalPages ||
                                                    (page >= currentPage - 1 && page <= currentPage + 1)
                                                  ) {
                                                    return (
                                                      <button
                                                        key={page}
                                                        onClick={() => setTypePage(category, type, page)}
                                                        className={cn(
                                                          "min-w-[35px] h-9 rounded-lg font-medium transition-colors text-sm",
                                                          page === currentPage
                                                            ? "bg-red-600 text-white"
                                                            : "hover:bg-gray-100"
                                                        )}
                                                      >
                                                        {page}
                                                      </button>
                                                    );
                                                  } else if (
                                                    page === currentPage - 2 ||
                                                    page === currentPage + 2
                                                  ) {
                                                    return <span key={page} className="px-1 text-gray-400 text-sm">...</span>;
                                                  }
                                                  return null;
                                                })}
                                              </div>
                                              
                                              <button
                                                onClick={() => setTypePage(category, type, Math.min(totalPages, currentPage + 1))}
                                                disabled={currentPage === totalPages}
                                                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                                title="Página siguiente"
                                              >
                                                <ChevronRight className="w-4 h-4" />
                                              </button>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          })}
                        </div>
                      </section>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div 
                    key="empty-state"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-20 text-center"
                  >
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold">No se encontraron productos</h3>
                    <p className="text-gray-500">Intenta ajustar tu búsqueda o filtros.</p>
                    <button 
                      onClick={() => { setSearchTerm(''); setSelectedCategory(null); }}
                      className="mt-4 text-sm font-medium text-red-600 underline underline-offset-4"
                    >
                      Limpiar todos los filtros
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </main>

      {/* Modal de Detalle */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        whatsappNumber={WHATSAPP_NUMBER}
      />

      {/* Botón flotante de WhatsApp */}
      <motion.a
        href={`https://wa.me/${WHATSAPP_NUMBER}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-colors z-50"
        title="Contáctanos por WhatsApp"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          boxShadow: [
            '0 10px 30px rgba(34, 197, 94, 0.3)',
            '0 10px 40px rgba(34, 197, 94, 0.5)',
            '0 10px 30px rgba(34, 197, 94, 0.3)'
          ]
        }}
        transition={{
          boxShadow: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
      >
        <MessageCircle className="w-7 h-7" />
      </motion.a>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <p className="text-sm text-gray-400 mb-2">
            Copyright © 2025 Barraca de Hierros Peteiro
          </p>
          <p className="text-sm text-gray-400">
            Sitio creado por{' '}
            <a
              href="https://wa.me/59892952528"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-400 hover:text-red-300 font-medium transition-colors"
            >
              Kiwibyte Studio™
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

interface ProductCardProps {
  product: Product;
  viewMode: 'grid' | 'list';
  onClick?: () => void;
  whatsappNumber: string;
}

function ProductCard({ product, viewMode, onClick, whatsappNumber }: Readonly<ProductCardProps>) {
  // Determinar si el producto tiene precio válido
  const hasPrice = product.precio && 
    ((typeof product.precio === 'number' && product.precio > 0) || 
    (typeof product.precio === 'string' && product.precio.trim() !== '' && product.precio.trim() !== '-'));
  
  // Debug: Log productos sin precio
  if (!hasPrice) {
    console.log('Producto sin precio:', product.nombre, 'Valor precio:', product.precio, 'Tipo:', typeof product.precio);
  }
  
  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que abra el modal
    const message = `Hola! Me interesa consultar por: ${product.nombre}`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
  };
  
  if (viewMode === 'list') {
    return (
      <motion.div 
        layout
        onClick={onClick}
        className="bg-white border border-red-600/5 rounded-2xl overflow-hidden hover:shadow-xl hover:border-red-600/10 transition-all group cursor-pointer p-4"
      >
        <div className="flex items-center gap-6">
          {/* Image */}
          <div className="bg-gray-100 shrink-0 relative overflow-hidden w-32 h-32 rounded-xl">
            {product.imagen ? (
              <SmartImage
                basePath="/Imagenes/Productos"
                fileName={product.imagen.split('/').pop() || ''}
                alt={product.nombre}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <Package className="w-12 h-12" />
              </div>
            )}
          </div>

          {/* Content - usando todo el ancho */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-[2fr_1fr_auto] gap-4 items-center">
            {/* Nombre y badges */}
            <div>
              <h4 className="font-bold text-base leading-tight mb-2 group-hover:text-red-600 transition-colors">
                {product.nombre}
              </h4>
              <div className="flex flex-wrap gap-2">
                {product.calibre && (
                  <span className="text-xs font-bold bg-red-50 text-red-700 px-2.5 py-1 rounded-md uppercase tracking-wide border border-red-200">
                    Cal: {product.calibre}
                  </span>
                )}
                {product.medida && (
                  <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md tracking-wide border border-blue-200">
                    {product.medida}
                  </span>
                )}
              </div>
              {product.observacion && (
                <div className="mt-2 text-xs text-gray-500 italic">
                  * {product.observacion}
                </div>
              )}
            </div>

            {/* Presentación */}
            {product.presentacion && (
              <div className="text-left lg:text-center">
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest block mb-1">Venta</span>
                <span className="text-sm font-medium text-gray-700">{product.presentacion}</span>
              </div>
            )}

            {/* Precio o botón consultar */}
            <div className="flex items-center justify-end">
              {hasPrice ? (
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest block mb-1">Precio</span>
                  <span className="text-2xl font-bold text-red-600">
                    {typeof product.precio === 'number' ? `$${product.precio.toFixed(2)}` : product.precio}
                  </span>
                </div>
              ) : (
                <button
                  onClick={handleWhatsAppClick}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-lg text-sm font-bold transition-colors whitespace-nowrap"
                >
                  <MessageCircle className="w-4 h-4" />
                  Consultar precio
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid view
  return (
    <motion.div 
      layout
      onClick={onClick}
      className="bg-white border border-red-600/5 rounded-2xl overflow-hidden hover:shadow-xl hover:border-red-600/10 transition-all group cursor-pointer p-0"
    >
      {/* Image Placeholder or Real Image */}
      <div className="bg-gray-100 shrink-0 relative overflow-hidden aspect-square w-full">
        {product.imagen ? (
          <SmartImage
            basePath="/Imagenes/Productos"
            fileName={product.imagen.split('/').pop() || ''}
            alt={product.nombre}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <Package className="w-1/3 h-1/3" />
          </div>
        )}
        {product.precio && typeof product.precio === 'number' && (
          <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
            ${product.precio.toFixed(2)}
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex flex-col h-full">
          <div className="mb-3">
            <h4 className="font-bold text-sm leading-tight mb-2 group-hover:text-red-600 transition-colors">
              {product.nombre}
            </h4>
            <div className="flex flex-wrap gap-2 mb-2">
              {product.calibre && (
                <span className="text-xs font-bold bg-red-50 text-red-700 px-2.5 py-1 rounded-md uppercase tracking-wide border border-red-200">
                  Cal: {product.calibre}
                </span>
              )}
              {product.medida && (
                <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md tracking-wide border border-blue-200">
                  {product.medida}
                </span>
              )}
            </div>
          </div>

          <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-50">
            {hasPrice ? (
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Precio</span>
                <span className="text-sm font-bold">
                  {typeof product.precio === 'number' ? `$${product.precio.toFixed(2)}` : product.precio}
                </span>
              </div>
            ) : (
              <button
                onClick={handleWhatsAppClick}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-xs font-bold transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Consultar precio
              </button>
            )}
            {product.presentacion && (
              <div className="text-right">
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Venta</span>
                <span className="block text-xs font-medium text-gray-600">{product.presentacion}</span>
              </div>
            )}
          </div>
          
          {product.observacion && (
            <div className="mt-3 text-[10px] text-gray-400 italic line-clamp-1">
              * {product.observacion}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
