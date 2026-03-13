import React, { useState, useEffect } from 'react';
import { Package } from 'lucide-react';

interface SmartImageProps {
  basePath: string;
  fileName: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
  fallbackElement?: React.ReactNode;
}

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];

export function SmartImage({ 
  basePath, 
  fileName, 
  alt, 
  className = '', 
  onLoad,
  fallbackElement 
}: SmartImageProps) {
  const [currentPath, setCurrentPath] = useState<string | null>(null);
  const [extensionIndex, setExtensionIndex] = useState(0);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Reset cuando cambia el fileName
    setExtensionIndex(0);
    setHasError(false);
    
    // Si el fileName ya tiene extensión, úsalo directamente
    if (fileName && /\.(png|jpg|jpeg|webp|gif)$/i.test(fileName)) {
      setCurrentPath(`${basePath}/${fileName}`);
    } else if (fileName) {
      // Intenta con la primera extensión
      setCurrentPath(`${basePath}/${fileName}${IMAGE_EXTENSIONS[0]}`);
    } else {
      setCurrentPath(null);
    }
  }, [basePath, fileName]);

  const handleError = () => {
    // Intentar con la siguiente extensión
    const nextIndex = extensionIndex + 1;
    
    if (nextIndex < IMAGE_EXTENSIONS.length && fileName && !/\.(png|jpg|jpeg|webp|gif)$/i.test(fileName)) {
      setExtensionIndex(nextIndex);
      setCurrentPath(`${basePath}/${fileName}${IMAGE_EXTENSIONS[nextIndex]}`);
    } else {
      // No más extensiones para probar
      setHasError(true);
      setCurrentPath(null);
    }
  };

  const handleLoad = () => {
    setHasError(false);
    if (onLoad) {
      onLoad();
    }
  };

  if (!currentPath || hasError) {
    return (
      <>
        {fallbackElement || (
          <div className={`w-full h-full flex items-center justify-center text-gray-300 bg-gray-100 ${className}`}>
            <Package className="w-1/3 h-1/3" />
          </div>
        )}
      </>
    );
  }

  return (
    <img
      src={currentPath}
      alt={alt}
      className={className}
      onError={handleError}
      onLoad={handleLoad}
    />
  );
}
