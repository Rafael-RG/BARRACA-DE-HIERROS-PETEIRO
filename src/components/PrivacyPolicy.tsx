import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Mail, Lock, Eye, Database } from 'lucide-react';

interface PrivacyPolicyProps {
  onBackToHome: () => void;
}

export default function PrivacyPolicy({ onBackToHome }: PrivacyPolicyProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white shadow-sm border-b border-gray-200"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-red-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Política de Privacidad</h1>
                <p className="text-sm text-gray-600">Barraca de Hierros Peteiro</p>
              </div>
            </div>
            <button
              onClick={onBackToHome}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al catálogo
            </button>
          </div>
        </div>
      </motion.header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-8 space-y-8"
        >
          {/* Fecha de actualización */}
          <div className="text-center pb-6 border-b border-gray-200">
            <p className="text-sm text-gray-600">
              Última actualización: <span className="font-semibold">30 de marzo de 2026</span>
            </p>
          </div>

          {/* Introducción */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Introducción</h2>
            <p className="text-gray-700 leading-relaxed">
              En Barraca de Hierros Peteiro valoramos y respetamos tu privacidad. Esta Política de Privacidad 
              describe qué información recopilamos cuando visitas nuestro catálogo de productos en línea.
            </p>
          </section>

          {/* Información que recopilamos */}
          <section>
            <div className="flex items-start gap-3 mb-4">
              <Database className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Información que Recopilamos</h2>
              </div>
            </div>
            
            <div className="space-y-4 ml-9">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Navegación del Catálogo</h3>
                <p className="text-gray-700 leading-relaxed mb-2">
                  <strong>No recopilamos información personal</strong> cuando navegas nuestro catálogo. 
                  Puedes ver productos, buscar, filtrar y consultar precios sin proporcionar ningún dato personal.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Cookies y Almacenamiento Local</h3>
                <p className="text-gray-700 leading-relaxed">
                  No utilizamos cookies de seguimiento ni de terceros. Solo guardamos preferencias básicas 
                  de visualización (como el modo de vista seleccionado) en el almacenamiento local de tu 
                  navegador, que permanece completamente privado y bajo tu control.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Consultas por WhatsApp</h3>
                <p className="text-gray-700 leading-relaxed">
                  Si decides contactarnos a través de WhatsApp para consultar sobre un producto, la 
                  comunicación se realiza directamente a través de la aplicación de WhatsApp según sus 
                  propias políticas de privacidad.
                </p>
              </div>
            </div>
          </section>

          {/* Cómo usamos tu información */}
          <section>
            <div className="flex items-start gap-3 mb-4">
              <Eye className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Qué NO Hacemos</h2>
              </div>
            </div>
            
            <div className="ml-9 space-y-3">
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>❌ No recopilamos tu nombre, email o número de teléfono</li>
                <li>❌ No utilizamos cookies de seguimiento o análisis</li>
                <li>❌ No compartimos ningún dato con terceros</li>
                <li>❌ No vendemos información de ningún tipo</li>
                <li>❌ No enviamos correos electrónicos ni mensajes no solicitados</li>
                <li>❌ No rastreamos tu comportamiento de navegación</li>
              </ul>
            </div>
          </section>

          {/* Seguridad */}
          <section>
            <div className="flex items-start gap-3 mb-4">
              <Lock className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Seguridad</h2>
              </div>
            </div>
            
            <div className="ml-9 space-y-3">
              <p className="text-gray-700 leading-relaxed">
                Nuestro sitio web se comunica a través de conexiones HTTPS seguras. No almacenamos 
                información personal en nuestros servidores porque simplemente no la recopilamos.
              </p>
            </div>
          </section>

          {/* Enlaces externos */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Enlaces Externos</h2>
            <div className="space-y-3 text-gray-700">
              <p className="leading-relaxed">
                Nuestro sitio puede contener enlaces a servicios externos como WhatsApp. Ten en cuenta que 
                estos servicios tienen sus propias políticas de privacidad y no somos responsables por su 
                contenido o prácticas de privacidad.
              </p>
            </div>
          </section>

          {/* Cambios a esta política */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cambios a esta Política</h2>
            <p className="text-gray-700 leading-relaxed">
              Podemos actualizar esta Política de Privacidad ocasionalmente. Te notificaremos sobre 
              cambios significativos actualizando la fecha de "Última actualización" en la parte superior 
              de esta página. Te recomendamos revisar esta política periódicamente.
            </p>
          </section>

          {/* Contacto */}
          <section className="bg-red-50 rounded-xl p-6 border border-red-100">
            <div className="flex items-start gap-3">
              <Mail className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Contacto</h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Si tienes preguntas sobre esta Política de Privacidad o sobre cómo manejamos tu 
                  información, puedes contactarnos:
                </p>
                <div className="space-y-2 text-gray-700">
                  <p>
                    <strong>Barraca de Hierros Peteiro</strong>
                  </p>
                  <p>Email: <a href="mailto:aguspeteirosilva1@gmail.com" className="text-red-600 hover:text-red-700 underline">aguspeteirosilva1@gmail.com</a></p>
                </div>
              </div>
            </div>
          </section>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-gray-600">
        <p>&copy; {new Date().getFullYear()} Barraca de Hierros Peteiro. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
