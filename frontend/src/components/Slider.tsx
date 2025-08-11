import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

type Props = {
  images: string[];
  captions?: string[];
  intervalMs?: number;
  ctaLabels?: string[];
  ctaTo?: (string | undefined)[];
};

export default function Slider({ images, captions = [], intervalMs = 5000, ctaLabels = [], ctaTo = [] }: Props) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef<number | null>(null);

  const safeImages = useMemo(() => images.filter(Boolean), [images]);

  useEffect(() => {
    if (safeImages.length <= 1) return;
    timerRef.current = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % safeImages.length);
    }, intervalMs);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [safeImages.length, intervalMs]);

  if (safeImages.length === 0) return null;

  return (
    <div className="relative w-full h-full">
      <div className="absolute inset-0 bg-cover bg-center transition-all" style={{ backgroundImage: `url(${safeImages[index]})` }} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between pr-4">
        <div className="text-white">
          {captions[index] && (
            <h3 className="text-lg md:text-xl font-semibold drop-shadow">{captions[index]}</h3>
          )}
        </div>
        {ctaTo[index] && (
          <Link to={ctaTo[index] as string} className="inline-flex h-10 px-5 rounded-md bg-black text-white hover:bg-black/90 shadow-md">
            {ctaLabels[index] || 'Shop Now'}
          </Link>
        )}
      </div>
      <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-1">
        {safeImages.map((_, i) => (
          <button key={i} onClick={() => setIndex(i)} className={`w-2 h-2 rounded-full ${i === index ? 'bg-white' : 'bg-white/50'}`} />
        ))}
      </div>
    </div>
  );
}


