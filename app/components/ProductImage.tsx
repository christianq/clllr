"use client";

import { useState, useEffect } from "react";

const FALLBACK_IMAGE = "/tote-product.png";

export default function ProductImage({ src, alt }: { src: string; alt: string }) {
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  return (
    <img
      src={imgSrc}
      alt={alt}
      width={240}
      height={240}
      className="object-contain mb-4"
      onError={() => setImgSrc(FALLBACK_IMAGE)}
    />
  );
}