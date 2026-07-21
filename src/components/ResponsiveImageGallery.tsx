type ResponsiveImageGalleryProps = {
  images: string[];
  alt: string;
  className?: string;
  imageClassName?: string;
};

export function ResponsiveImageGallery({
  images,
  alt,
  className = "",
  imageClassName = "",
}: ResponsiveImageGalleryProps) {
  const visibleImages = images.filter(Boolean).slice(0, 4);

  if (!visibleImages.length) {
    return <div className={`bg-slate-100 ${className}`} aria-hidden="true" />;
  }

  if (visibleImages.length === 1) {
    return (
      <img
        src={visibleImages[0]}
        alt={alt}
        loading="lazy"
        decoding="async"
        data-zoomable
        data-zoom-images={JSON.stringify(visibleImages)}
        data-zoom-index={0}
        className={`h-full w-full object-contain ${imageClassName} ${className}`}
      />
    );
  }

  return (
    <div className={`grid h-full w-full grid-cols-2 gap-2 ${className}`}>
      {visibleImages.map((image, index) => (
        <div
          key={`${image}-${index}`}
          className="relative min-h-0 overflow-hidden rounded-xl bg-white/75"
        >
          <img
            src={image}
            alt={`${alt}，第 ${index + 1} 张`}
            loading="lazy"
            decoding="async"
            data-zoomable
            data-zoom-images={JSON.stringify(visibleImages)}
            data-zoom-index={index}
            className={`h-full w-full object-contain ${imageClassName}`}
          />
          {index === visibleImages.length - 1 && images.length > 4 ? (
            <span className="absolute bottom-2 right-2 rounded-full bg-slate-950/70 px-2 py-1 text-xs font-semibold text-white">
              +{images.length - 4}
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}
