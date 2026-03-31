import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, 
  LogOut, 
  Save, 
  Search, 
  X,
  DollarSign,
  Package,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { Product } from '../types';
import { cn } from '../utils/cn';
import { googleSheetsService, GOOGLE_CONFIG } from '../services/googleSheets';
import ProductForm from './ProductForm';

interface AdminPanelProps {
  products: Product[];
  onBackToHome: () => void;
  onReloadData: () => Promise<void>;
}

const USE_GOOGLE_SHEETS = !!(GOOGLE_CONFIG.clientId && GOOGLE_CONFIG.apiKey); // Habilitar si hay credenciales

export default function AdminPanel({ products, onBackToHome, onReloadData }: AdminPanelProps) {
  // Google Sheets (también sirve como autenticación)
  const [isGoogleAuthenticated, setIsGoogleAuthenticated] = useState(false);
  const [isInitializingGoogle, setIsInitializingGoogle] = useState(true);
  const [authError, setAuthError] = useState('');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [googleSheetProducts, setGoogleSheetProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  
  const [editedPrices, setEditedPrices] = useState<Record<string, string | number>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  
  // Product Form
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  
  // Usar productos de Google Sheets si está autenticado, sino usar los del prop
  const activeProducts = isGoogleAuthenticated && googleSheetProducts.length > 0 ? googleSheetProducts : products;

  // Inicializar Google Sheets API
  useEffect(() => {
    if (USE_GOOGLE_SHEETS) {
      googleSheetsService.initialize()
        .then(() => {
          const isSignedIn = googleSheetsService.isAuthenticated();
          setIsGoogleAuthenticated(isSignedIn);
          if (isSignedIn) {
            const email = googleSheetsService.getCurrentUserEmail();
            setUserEmail(email);
          }
          setIsInitializingGoogle(false);
        })
        .catch(err => {
          console.error('Error initializing Google Sheets:', err);
          setIsInitializingGoogle(false);
        });
    } else {
      setIsInitializingGoogle(false);
    }
  }, []);

  // Cargar precios editados desde localStorage
  useEffect(() => {
    const saved = localStorage.getItem('admin_price_overrides');
    if (saved) {
      try {
        setEditedPrices(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading saved prices:', e);
      }
    }
  }, []);

  // Verificar si hay cambios sin guardar
  useEffect(() => {
    const saved = localStorage.getItem('admin_price_overrides');
    const savedObj = saved ? JSON.parse(saved) : {};
    setHasUnsavedChanges(JSON.stringify(editedPrices) !== JSON.stringify(savedObj));
  }, [editedPrices]);

  // Cargar productos desde Google Sheets cuando esté autenticado
  useEffect(() => {
    const loadGoogleSheetProducts = async () => {
      if (isGoogleAuthenticated && USE_GOOGLE_SHEETS) {
        setIsLoadingProducts(true);
        try {
          const productsFromSheet = await googleSheetsService.readSheet();
          setGoogleSheetProducts(productsFromSheet);
        } catch (error) {
          console.error('Error loading products from Google Sheets:', error);
        } finally {
          setIsLoadingProducts(false);
        }
      }
    };
    
    loadGoogleSheetProducts();
  }, [isGoogleAuthenticated]);

  const handleGoogleSignIn = async () => {
    try {
      await googleSheetsService.signIn();
      
      const email = googleSheetsService.getCurrentUserEmail();
      setIsGoogleAuthenticated(true);
      setUserEmail(email);
      setAuthError('');
    } catch (error) {
      console.error('Error signing in:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al conectar con Google. Verifica tus credenciales.';
      setAuthError(errorMessage);
      setTimeout(() => setAuthError(''), 5000); // Mostrar por 5 segundos si es error de autorización
    }
  };

  const handleGoogleSignOut = async () => {
    if (hasUnsavedChanges) {
      if (!confirm('Tienes cambios sin guardar. ¿Seguro que quieres cerrar sesión?')) {
        return;
      }
    }
    
    try {
      await googleSheetsService.signOut();
      setIsGoogleAuthenticated(false);
      setUserEmail(null);
      setAuthError('');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handlePriceChange = (productId: string, newPrice: string) => {
    // Encontrar el producto original
    const product = activeProducts.find(p => p.id === productId);
    if (!product) return;

    const originalPrice = product.precio?.toString().trim() || '';
    const trimmedNewPrice = newPrice.trim();

    setEditedPrices(prev => {
      const updated = { ...prev };
      
      // Si el nuevo precio está vacío o es igual al original, eliminarlo de editedPrices
      if (trimmedNewPrice === '' || trimmedNewPrice === originalPrice) {
        delete updated[productId];
      } else {
        // Solo guardar si hay un cambio real
        updated[productId] = newPrice;
      }
      
      return updated;
    });
  };

  const handleSaveChanges = async () => {
    if (USE_GOOGLE_SHEETS && isGoogleAuthenticated) {
      // Guardar directamente en Google Sheets
      try {
        const updates = Object.entries(editedPrices).map(([productId, price]) => {
          const rowIndex = parseInt(productId.replace('gs-', ''));
          return { rowIndex, price };
        });

        await googleSheetsService.updateMultiplePrices(updates);
        
        setEditedPrices({});
        setHasUnsavedChanges(false);
        setSaveMessage({ type: 'success', text: 'Precios actualizados en Google Sheets' });
        
        // Recargar datos desde Google Sheets
        const productsFromSheet = await googleSheetsService.readSheet();
        setGoogleSheetProducts(productsFromSheet);
        
        setTimeout(() => setSaveMessage(null), 3000);
      } catch (error) {
        console.error('Error saving to Google Sheets:', error);
        setSaveMessage({ type: 'error', text: 'Error al guardar en Google Sheets' });
        setTimeout(() => setSaveMessage(null), 3000);
      }
    } else {
      // Guardar en localStorage (modo legacy)
      try {
        localStorage.setItem('admin_price_overrides', JSON.stringify(editedPrices));
        setSaveMessage({ type: 'success', text: 'Precios guardados localmente' });
        setHasUnsavedChanges(false);
        setTimeout(() => setSaveMessage(null), 3000);
      } catch (e) {
        setSaveMessage({ type: 'error', text: 'Error al guardar los precios' });
        setTimeout(() => setSaveMessage(null), 3000);
      }
    }
  };

  const handleAddProduct = async (productData: Omit<Product, 'id'>) => {
    try {
      await googleSheetsService.addProduct(productData);
      setSaveMessage({ type: 'success', text: 'Producto agregado exitosamente' });
      setShowProductForm(false);
      
      // Recargar datos desde Google Sheets
      const productsFromSheet = await googleSheetsService.readSheet();
      setGoogleSheetProducts(productsFromSheet);
      
      setTimeout(() => setSaveMessage(null), 3000);
   } catch (error) {
      console.error('Error adding product:', error);
      setSaveMessage({ type: 'error', text: 'Error al agregar el producto' });
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleEditProduct = async (productData: Omit<Product, 'id'>) => {
    if (!editingProduct) {
      setSaveMessage({ type: 'error', text: 'Error: No se especificó el producto a editar' });
      setTimeout(() => setSaveMessage(null), 3000);
      return;
    }

    try {
      const rowIndex = parseInt(editingProduct.id.replace('gs-', ''));
      await googleSheetsService.updateProduct(rowIndex, { ...productData, id: editingProduct.id });
      
      setSaveMessage({ type: 'success', text: 'Producto actualizado exitosamente' });
      setShowProductForm(false);
      setEditingProduct(undefined);
      
      // Recargar datos desde Google Sheets
      const productsFromSheet = await googleSheetsService.readSheet();
      setGoogleSheetProducts(productsFromSheet);
      
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Error updating product:', error);
      setSaveMessage({ type: 'error', text: 'Error al actualizar el producto' });
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleResetPrice = (productId: string) => {
    const newPrices = { ...editedPrices };
    delete newPrices[productId];
    setEditedPrices(newPrices);
  };

  const handleToggleActive = async (productId: string, currentActive: string | undefined) => {
    if (!isGoogleAuthenticated) return;
    
    try {
      const rowIndex = parseInt(productId.replace('gs-', ''));
      const newActive = currentActive === 'Si';
      
      await googleSheetsService.toggleProductActive(rowIndex, !newActive);
      
      // Actualizar el producto localmente
      const updatedProducts = googleSheetProducts.map(p => 
        p.id === productId ? { ...p, activo: !newActive ? 'Si' : 'No' } : p
      );
      setGoogleSheetProducts(updatedProducts);
      
      setSaveMessage({ type: 'success', text: `Producto ${!newActive ? 'activado' : 'desactivado'}` });
      setTimeout(() => setSaveMessage(null), 2000);
    } catch (error) {
      console.error('Error toggling product:', error);
      setSaveMessage({ type: 'error', text: 'Error al cambiar el estado del producto' });
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };



  const filteredProducts = useMemo(() => {
    if (!searchTerm) return activeProducts;
    
    const term = searchTerm.toLowerCase();
    return activeProducts.filter(p => 
      p.nombre.toLowerCase().includes(term) ||
      p.categoria.toLowerCase().includes(term) ||
      p.tipo.toLowerCase().includes(term)
    );
  }, [activeProducts, searchTerm]);

  // Agrupar productos por categoría y tipo
  const groupedProducts = useMemo(() => {
    const grouped: Record<string, Record<string, Product[]>> = {};
    
    filteredProducts.forEach(product => {
      if (!grouped[product.categoria]) {
        grouped[product.categoria] = {};
      }
      if (!grouped[product.categoria][product.tipo]) {
        grouped[product.categoria][product.tipo] = [];
      }
      grouped[product.categoria][product.tipo].push(product);
    });
    
    return grouped;
  }, [filteredProducts]);

  // Expandir/colapsar automáticamente según búsqueda
  useEffect(() => {
    if (searchTerm.trim()) {
      // Expandir todas las secciones cuando hay búsqueda
      const allKeys = new Set<string>();
      Object.entries(groupedProducts).forEach(([category, types]) => {
        Object.keys(types).forEach(type => {
          allKeys.add(`${category}-${type}`);
        });
      });
      setExpandedSections(allKeys);
    }
  }, [searchTerm, groupedProducts]);

  const toggleSection = (category: string, type: string) => {
    const key = `${category}-${type}`;
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    const allKeys = new Set<string>();
    Object.entries(groupedProducts).forEach(([category, types]) => {
      Object.keys(types).forEach(type => {
        allKeys.add(`${category}-${type}`);
      });
    });
    setExpandedSections(allKeys);
  };

  const collapseAll = () => {
    setExpandedSections(new Set());
  };

  const statistics = useMemo(() => {
    const total = activeProducts.length;
    const edited = Object.keys(editedPrices).length;
    const withPrice = activeProducts.filter(p => p.precio && p.precio !== '' && p.precio !== '-').length;
    const withoutPrice = total - withPrice;
    
    return { total, edited, withPrice, withoutPrice };
  }, [activeProducts, editedPrices]);

  if (!isGoogleAuthenticated) {
    return (
      <div className="min-h-screen relative bg-gradient-to-br from-slate-900 via-red-900/20 to-slate-900 flex items-center justify-center p-4 overflow-hidden">
        {/* Elementos decorativos de fondo */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Círculos decorativos con gradiente */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-red-500/5 to-orange-500/5 rounded-full blur-3xl"></div>
          
          {/* Patrón de cuadrícula sutil */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
              backgroundSize: '50px 50px'
            }}
          ></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full relative z-10"
        >
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl mb-4 shadow-lg shadow-red-500/30"
              >
                <Lock className="w-10 h-10 text-white" />
              </motion.div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel de Administración</h1>
              <p className="text-gray-600">Barraca de Hierros Peteiro</p>
            </div>

            <div className="space-y-4">
              {isInitializingGoogle ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-600">Inicializando...</span>
                </div>
              ) : !USE_GOOGLE_SHEETS ? (
                <div className="text-center py-4">
                  <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                  <p className="text-gray-700 mb-2 font-medium">Configuración Pendiente</p>
                  <p className="text-sm text-gray-600">
                    Las credenciales de Google no están configuradas.
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Consulta GOOGLE_SHEETS_API_SETUP.md
                  </p>
                </div>
              ) : (
                <>
                  <motion.button
                    onClick={handleGoogleSignIn}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-4 px-6 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 flex items-center justify-center gap-3 shadow-md hover:shadow-lg"
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-base">Iniciar sesión con Google</span>
                  </motion.button>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-2 bg-white text-gray-500">Acceso seguro</span>
                    </div>
                  </div>
                </>
              )}

              <AnimatePresence>
                {authError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-start gap-2 text-red-600 text-sm bg-red-50/80 backdrop-blur-sm p-4 rounded-lg border border-red-100"
                  >
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>{authError}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                type="button"
                onClick={onBackToHome}
                whileHover={{ x: -4 }}
                className="w-full text-gray-600 hover:text-gray-900 text-sm font-medium py-3 flex items-center justify-center gap-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al catálogo
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Panel Admin</h1>
              {userEmail && (
                <p className="text-xs text-gray-500">{userEmail}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onBackToHome}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Ver sitio
            </button>
            <button
              onClick={handleGoogleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Save Message */}
        <AnimatePresence>
          {saveMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={cn(
                'mb-6 flex items-center gap-2 p-4 rounded-lg',
                saveMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              )}
            >
              {saveMessage.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              {saveMessage.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Total productos</div>
            <div className="text-2xl font-bold text-gray-900">{statistics.total}</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Precios editados</div>
            <div className="text-2xl font-bold text-red-600">{statistics.edited}</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Con precio</div>
            <div className="text-2xl font-bold text-green-600">{statistics.withPrice}</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Sin precio</div>
            <div className="text-2xl font-bold text-orange-600">{statistics.withoutPrice}</div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200">
          <div className="flex flex-col gap-4">
            {/* Search and View Controls Row */}
            <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">
              <div className="relative flex-1 max-w-md w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* View Toggle Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={expandAll}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors text-sm border border-gray-300"
                >
                  <ChevronRight className="w-4 h-4" />
                  Expandir todo
                </button>

                <button
                  onClick={collapseAll}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors text-sm border border-gray-300"
                >
                  <ChevronRight className="w-4 h-4 rotate-90" />
                  Colapsar todo
                </button>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="flex flex-wrap gap-2">
              {/* Add Product Button - Temporarily hidden */}
              {/* {USE_GOOGLE_SHEETS && isGoogleAuthenticated && (
                <button
                  onClick={() => {
                    setEditingProduct(undefined);
                    setShowProductForm(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Package className="w-4 h-4" />
                  Agregar Producto
                </button>
              )} */}

              <button
                onClick={handleSaveChanges}
                disabled={!hasUnsavedChanges}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
                  hasUnsavedChanges
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                )}
              >
                <Save className="w-4 h-4" />
                Guardar cambios
              </button>

              <button
                onClick={async () => {
                  setIsLoadingProducts(true);
                  try {
                    const productsFromSheet = await googleSheetsService.readSheet();
                    setGoogleSheetProducts(productsFromSheet);
                    setSaveMessage({ type: 'success', text: 'Datos recargados desde Google Sheets' });
                  } catch (error) {
                    console.error('Error reloading data:', error);
                    setSaveMessage({ type: 'error', text: 'Error al recargar los datos' });
                  } finally {
                    setIsLoadingProducts(false);
                    setTimeout(() => setSaveMessage(null), 3000);
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Recargar datos
              </button>
            </div>
          </div>

          {hasUnsavedChanges && (
            <div className="mt-3 flex items-center gap-2 text-sm text-orange-600 bg-orange-50 p-2 rounded">
              <AlertCircle className="w-4 h-4" />
              Tienes cambios sin guardar
            </div>
          )}
        </div>

        {/* Products Grouped by Category and Type */}
        <div className="space-y-6">
          {Object.keys(groupedProducts).length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
              No se encontraron productos
            </div>
          ) : (
            Object.entries(groupedProducts).map(([category, types]) => (
              <div key={category} className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <Package className="w-5 h-5 text-red-600" />
                  {category}
                </h2>
                
                {Object.entries(types).map(([type, items]) => {
                  const sectionKey = `${category}-${type}`;
                  const isExpanded = expandedSections.has(sectionKey);
                  const editedInSection = items.filter(p => editedPrices[p.id] !== undefined).length;
                  
                  return (
                    <div key={sectionKey} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      {/* Section Header - Clickeable */}
                      <button
                        onClick={() => toggleSection(category, type)}
                        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <ChevronRight className={cn(
                            'w-5 h-5 text-gray-500 transition-transform',
                            isExpanded && 'rotate-90'
                          )} />
                          <h3 className="text-lg font-semibold text-gray-800">{type}</h3>
                          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            {items.length} {items.length === 1 ? 'producto' : 'productos'}
                          </span>
                          {editedInSection > 0 && (
                            <span className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded-full font-medium">
                              {editedInSection} editado{editedInSection > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </button>

                      {/* Products Table - Collapsible */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="border-t border-gray-200">
                              <div className="overflow-x-auto">
                                <table className="w-full">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Producto</th>
                                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Precio Actual</th>
                                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Nuevo Precio</th>
                                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Estado</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200">
                                    {items.map((product) => {
                                      const hasEdit = editedPrices[product.id] !== undefined;
                                      const currentPrice = product.precio || 'Sin precio';
                                      const editedPrice = editedPrices[product.id];

                                      return (
                                        <tr key={product.id} className={cn(
                                          'hover:bg-gray-50 transition-colors',
                                          hasEdit && 'bg-red-50/30'
                                        )}>
                                          <td className="px-4 py-3">
                                            <div className="text-sm font-medium text-gray-900">{product.nombre}</div>
                                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                              {product.calibre && (
                                                <span className="bg-gray-100 px-2 py-0.5 rounded">
                                                  Calibre: {product.calibre}
                                                </span>
                                              )}
                                              {product.medida && (
                                                <span className="bg-gray-100 px-2 py-0.5 rounded">
                                                  {product.medida}
                                                </span>
                                              )}
                                            </div>
                                          </td>
                                          <td className="px-4 py-3">
                                            <div className="text-sm font-medium text-gray-900">
                                              {typeof currentPrice === 'number' ? `U$S ${currentPrice.toFixed(2)}` : currentPrice}
                                            </div>
                                            {product.presentacion && (
                                              <div className="text-xs text-gray-500">{product.presentacion}</div>
                                            )}
                                          </td>
                                          <td className="px-4 py-3">
                                            <div className="relative">
                                              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                              <input
                                                type="text"
                                                value={editedPrice !== undefined ? editedPrice : (typeof currentPrice === 'number' ? currentPrice : '')}
                                                onChange={(e) => handlePriceChange(product.id, e.target.value)}
                                                placeholder="0.00"
                                                className={cn(
                                                  'w-36 pl-8 pr-3 py-2 border rounded-lg text-sm',
                                                  hasEdit 
                                                    ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-600 focus:border-red-600' 
                                                    : 'border-gray-300 focus:ring-2 focus:ring-red-600 focus:border-red-600'
                                                )}
                                              />
                                            </div>
                                          </td>
                                          <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-2">
                                              <span className={cn(
                                                'px-2 py-1 text-xs font-semibold rounded-full',
                                                product.activo === 'Si' 
                                                  ? 'bg-green-100 text-green-800' 
                                                  : 'bg-gray-100 text-gray-800'
                                              )}>
                                                {product.activo === 'Si' ? 'Activo' : 'Inactivo'}
                                              </span>
                                              <button
                                                onClick={() => handleToggleActive(product.id, product.activo)}
                                                className={cn(
                                                  'px-3 py-1 text-xs font-medium rounded transition-colors',
                                                  product.activo === 'Si'
                                                    ? 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                                    : 'bg-green-200 hover:bg-green-300 text-green-800'
                                                )}
                                                title={product.activo === 'Si' ? 'Desactivar producto' : 'Activar producto'}
                                              >
                                                {product.activo === 'Si' ? 'Desactivar' : 'Activar'}
                                              </button>
                                            </div>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </main>

      {/* Product Form Modal */}
      <AnimatePresence>
        {showProductForm && (
          <ProductForm
            product={editingProduct}
            categories={Array.from(new Set(activeProducts.map(p => p.categoria)))}
            onSave={editingProduct ? handleEditProduct : handleAddProduct}
            onCancel={() => {
              setShowProductForm(false);
              setEditingProduct(undefined);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
