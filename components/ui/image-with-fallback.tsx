'use client';

import { useEffect, useState, type ReactNode } from 'react';

interface ImageWithFallbackProps {
  /** Immagine principale da tentare per prima */
  src: string;
  /** Immagine secondaria tentata se `src` fallisce (es. favicon ad alta risoluzione) */
  fallbackSrc?: string;
  /** className applicata quando è visibile `fallbackSrc` (es. icona piccola centrata) */
  fallbackClassName?: string;
  /** Contenuto finale mostrato se anche `fallbackSrc` fallisce (emoji, testo, ecc.) */
  placeholder?: ReactNode;
  alt: string;
  className?: string;
}

/**
 * Immagine con fallback a cascata gestito via stato React:
 * src → fallbackSrc → placeholder. Sostituisce i pattern onError che
 * manipolano il DOM direttamente (document.createElement), fragili ai re-render.
 */
export function ImageWithFallback({
  src,
  fallbackSrc,
  fallbackClassName,
  placeholder,
  alt,
  className,
}: ImageWithFallbackProps) {
  // 0 = src, 1 = fallbackSrc, 2 = placeholder
  const [stage, setStage] = useState(0);

  useEffect(() => {
    setStage(0);
  }, [src, fallbackSrc]);

  // Se il fallback coincide con la sorgente, non ha senso ritentarlo
  const effectiveFallback = fallbackSrc && fallbackSrc !== src ? fallbackSrc : undefined;

  if (stage >= 2 || (stage === 1 && !effectiveFallback)) {
    return <>{placeholder}</>;
  }

  return (
    <img
      src={stage === 0 ? src : effectiveFallback}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      className={stage === 0 ? className : fallbackClassName ?? className}
      onError={() => setStage((s) => s + 1)}
    />
  );
}
