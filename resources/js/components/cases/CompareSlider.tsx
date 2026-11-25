import { useCallback, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { MoveHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Drag-to-compare before/after slider. Pointer, touch and keyboard (arrow
 * keys, Home/End) all move the divider; the handle is an ARIA slider.
 * Images are right-click/drag protected like ProtectedImage.
 */
export function CompareSlider({
  before,
  after,
  beforeLabel = "Before",
  afterLabel = "After",
  alt,
  className,
  compact = false,
}: {
  before: string;
  after: string;
  beforeLabel?: string;
  afterLabel?: string;
  alt: string;
  className?: string;
  /** Static split for small cards: no handle chrome, no interaction. */
  compact?: boolean;
}) {
  const [pos, setPos] = useState(50);
  const frame = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const moveTo = useCallback((clientX: number) => {
    const rect = frame.current?.getBoundingClientRect();
    if (!rect) return;
    setPos(Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)));
  }, []);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (compact) return;
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    moveTo(e.clientX);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragging.current) moveTo(e.clientX);
  };
  const stop = () => {
    dragging.current = false;
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 10 : 2;
    const next =
      e.key === "ArrowLeft" ? pos - step
      : e.key === "ArrowRight" ? pos + step
      : e.key === "Home" ? 0
      : e.key === "End" ? 100
      : null;
    if (next === null) return;
    e.preventDefault();
    setPos(Math.min(100, Math.max(0, next)));
  };

  const img = "absolute inset-0 size-full select-none object-cover";
  const chip =
    "pointer-events-none absolute top-4 max-w-[calc(50%-1.5rem)] truncate rounded-full px-3.5 py-1.5 text-xs font-semibold backdrop-blur-sm";

  return (
    <div
      ref={frame}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={stop}
      onPointerCancel={stop}
      onContextMenu={(e) => e.preventDefault()}
      className={cn(
        "relative aspect-[4/3] w-full overflow-hidden bg-teal-50",
        !compact && "cursor-ew-resize touch-pan-y",
        className,
      )}
    >
      {/* After underneath, before clipped on top from the left. */}
      <img src={after} alt={`${afterLabel} — ${alt}`} draggable={false} loading="lazy" className={img} />
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      >
        <img src={before} alt={`${beforeLabel} — ${alt}`} draggable={false} loading="lazy" className={img} />
      </div>

      <span className={cn(chip, "left-4 bg-white/90 text-teal-800")}>{beforeLabel}</span>
      <span className={cn(chip, "right-4 bg-teal-900/80 text-white")}>{afterLabel}</span>

      {/* Divider + handle */}
      <div
        aria-hidden={compact}
        className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_0_1px_rgb(4_75_77/0.15)]"
        style={{ left: `${pos}%` }}
      >
        {!compact ? (
          <div
            role="slider"
            tabIndex={0}
            aria-label="Compare before and after"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(pos)}
            aria-valuetext={`${Math.round(pos)}% ${beforeLabel}`}
            onKeyDown={onKeyDown}
            className="pointer-events-auto absolute left-1/2 top-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-teal-800 shadow-lift ring-1 ring-line transition-transform duration-200 hover:scale-105 focus-visible:scale-105"
          >
            <MoveHorizontal className="size-5" strokeWidth={2} aria-hidden />
          </div>
        ) : null}
      </div>
    </div>
  );
}
