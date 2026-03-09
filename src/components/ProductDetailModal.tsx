import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Package, Tag, Ruler, DollarSign, Info } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductDetailModal({ product, isOpen, onClose }: Readonly<ProductDetailModalProps>) {
  if (!product) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-red-600/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden pointer-events-auto"
            >
              {/* Header */}
              <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-6 border-b border-gray-200">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 hover:bg-white rounded-full transition-colors"
                  aria-label="Cerrar"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                    <Package className="w-8 h-8 text-gray-700" />
                  </div>
                  <div className="flex-1 pr-12">
                    <h2 className="text-2xl font-bold leading-tight mb-2">
                      {product.nombre}
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs font-bold bg-red-600 text-white px-3 py-1 rounded-full">
                        {product.categoria}
                      </span>
                      <span className="text-xs font-bold bg-gray-200 text-gray-700 px-3 py-1 rounded-full">
                        {product.tipo}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6 space-y-6">
                {/* Imagen */}
                {product.imagen && (
                  <div className="aspect-video bg-gray-100 rounded-2xl overflow-hidden">
                    <img
                      src={product.imagen}
                      alt={product.nombre}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                {/* Precio destacado */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="w-6 h-6 text-green-700" />
                    <h3 className="font-bold text-green-900">Precio</h3>
                  </div>
                  <div className="text-4xl font-bold text-green-700">
                    {typeof product.precio === 'number'
                      ? `$${product.precio.toFixed(2)}`
                      : product.precio || 'Consultar'}
                  </div>
                  {product.presentacion && (
                    <p className="text-sm text-green-700 mt-2">
                      {product.presentacion}
                    </p>
                  )}
                </div>

                {/* Especificaciones */}
                <div className="space-y-4">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    Especificaciones
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {product.calibre && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Tag className="w-4 h-4 text-gray-600" />
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Calibre
                          </span>
                        </div>
                        <p className="text-lg font-semibold">{product.calibre}</p>
                      </div>
                    )}

                    {product.medida && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Ruler className="w-4 h-4 text-gray-600" />
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Medida
                          </span>
                        </div>
                        <p className="text-lg font-semibold">{product.medida}</p>
                      </div>
                    )}

                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Package className="w-4 h-4 text-gray-600" />
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Categoría
                        </span>
                      </div>
                      <p className="text-lg font-semibold">{product.categoria}</p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Tag className="w-4 h-4 text-gray-600" />
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Tipo
                        </span>
                      </div>
                      <p className="text-lg font-semibold">{product.tipo}</p>
                    </div>
                  </div>
                </div>

                {/* Observaciones */}
                {product.observacion && (
                  <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
                    <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      Observaciones
                    </h3>
                    <p className="text-sm text-blue-700 leading-relaxed">
                      {product.observacion}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                <button
                  onClick={onClose}
                  className="w-full bg-red-600 text-white py-3 px-6 rounded-full font-medium hover:bg-red-700 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
