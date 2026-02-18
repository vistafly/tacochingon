/**
 * Animated loading dots placeholder for images.
 * Renders as an absolutely-positioned layer — place inside a `relative` container
 * before the <Image /> so the image covers it once loaded.
 */
export function ImageLoadingDots({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute inset-0 flex items-center justify-center bg-gray-800 ${className}`}>
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-amarillo animate-[loading-dot_1.2s_ease-in-out_infinite]"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
}
