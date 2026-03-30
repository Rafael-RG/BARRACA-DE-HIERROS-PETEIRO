import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { X, Save, AlertCircle } from 'lucide-react';
import { Product } from '../types';
import { cn } from '../utils/cn';

interface ProductFormProps {
  product?: Product; // Si existe, es edición; si no, es creación
  categories: string[];
  onSave: (product: Omit<Product, 'id'>) => Promise<void>;
  onCancel: () => void;
}

export default function ProductForm({ product, categories, onSave, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState({
    nombre: product?.nombre || '',
    categoria: product?.categoria || '',
    tipo: product?.tipo || '',
    calibre: product?.calibre || '',
    medida: product?.medida || '',
    precio: product?.precio?.toString() || '',
    presentacion: product?.presentacion || '',
    imagen: product?.imagen || '',
    observacion: product?.observacion || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }

    if (!formData.categoria.trim()) {
      newErrors.categoria = 'La categoría es obligatoria';
    }

    if (!formData.tipo.trim()) {
      newErrors.tipo = 'El tipo es obligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSaving(true);

    try {
      await onSave({
        nombre: formData.nombre.trim(),
        categoria: formData.categoria.trim(),
        tipo: formData.tipo.trim(),
        calibre: formData.calibre.trim() || undefined,
        medida: formData.medida.trim() || undefined,
        precio: formData.precio.trim() || undefined,
        presentacion: formData.presentacion.trim() || undefined,
        imagen: formData.imagen.trim() || undefined,
        observacion: formData.observacion.trim() || undefined,
      });
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {product ? 'Editar Producto' : 'Agregar Nuevo Producto'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nombre del Producto <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              className={cn(
                'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600',
                errors.nombre ? 'border-red-300 bg-red-50' : 'border-gray-300'
              )}
              placeholder="Ej: Chapas para techos, Sinusoidal, 30&quot;, 0,80 mts x 3,60mts"
            />
            {errors.nombre && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.nombre}
              </p>
            )}
          </div>

          {/* Categoría y Tipo en dos columnas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Categoría <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.categoria}
                onChange={(e) => handleChange('categoria', e.target.value)}
                list="categories-list"
                className={cn(
                  'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600',
                  errors.categoria ? 'border-red-300 bg-red-50' : 'border-gray-300'
                )}
                placeholder="Ej: Chapas para techos"
              />
              <datalist id="categories-list">
                {categories.map(cat => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
              {errors.categoria && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.categoria}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tipo <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.tipo}
                onChange={(e) => handleChange('tipo', e.target.value)}
                className={cn(
                  'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600',
                  errors.tipo ? 'border-red-300 bg-red-50' : 'border-gray-300'
                )}
                placeholder="Ej: Sinusoidal"
              />
              {errors.tipo && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.tipo}
                </p>
              )}
            </div>
          </div>

          {/* Calibre y Medida */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Calibre
              </label>
              <input
                type="text"
                value={formData.calibre}
                onChange={(e) => handleChange('calibre', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600"
                placeholder="Ej: 30"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Medida
              </label>
              <input
                type="text"
                value={formData.medida}
                onChange={(e) => handleChange('medida', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600"
                placeholder="Ej: 0,80 mts x 3,60mts"
              />
            </div>
          </div>

          {/* Precio y Presentación */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Precio
              </label>
              <input
                type="text"
                value={formData.precio}
                onChange={(e) => handleChange('precio', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600"
                placeholder="Ej: 16.80 o Consultar"
              />
              <p className="mt-1 text-xs text-gray-500">
                Número o texto (ej: "Consultar")
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Presentación
              </label>
              <input
                type="text"
                value={formData.presentacion}
                onChange={(e) => handleChange('presentacion', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600"
                placeholder="Ej: x unidad, x metro lineal"
              />
            </div>
          </div>

          {/* Imagen */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nombre de Imagen
            </label>
            <input
              type="text"
              value={formData.imagen}
              onChange={(e) => handleChange('imagen', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600"
              placeholder="Ej: Chapa_Sinusoidal_30.jpg"
            />
            <p className="mt-1 text-xs text-gray-500">
              Solo el nombre del archivo (debe estar en /Imagenes/Productos/)
            </p>
          </div>

          {/* Observación */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Observación
            </label>
            <textarea
              value={formData.observacion}
              onChange={(e) => handleChange('observacion', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 resize-none"
              placeholder="Notas adicionales sobre el producto..."
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {product ? 'Actualizar' : 'Agregar'}
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
