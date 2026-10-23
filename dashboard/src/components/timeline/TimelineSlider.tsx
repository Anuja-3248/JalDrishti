import { useEffect, useRef, useState } from "react";

interface TimelineSliderProps {
  value: number;
  max: number;
  marks: number[];
  onChange: (value: number) => void;
}

export default function TimelineSlider({ value, max, marks, onChange }: TimelineSliderProps) {
  const [playing, setPlaying] = useState(false);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    const step = (now: number) => {
      const dt = now - last;
      last = now;
      onChange(Math.min(max, value + dt * 0.012));
      frame.current = requestAnimationFrame(step);
    };
    frame.current = requestAnimationFrame(step);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, value, max]);

  useEffect(() => {
    if (value >= max) setPlaying(false);
  }, [value, max]);

  return (
    <div className="flex h-16 shrink-0 items-center gap-4 border-t border-stroke bg-panel px-4 shadow-card">
      <button
        onClick={() => {
          if (value >= max) onChange(0);
          setPlaying((p) => !p);
        }}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-sonar/50 bg-sonar/10 text-sonar transition hover:bg-sonar/25"
        aria-label={playing ? "Pause" : "Play"}
      >
        {playing ? "❚❚" : "▶"}
      </button>

      <div className="flex-1">
        <div className="mb-1 flex items-center justify-between font-mono text-[10px] text-ink-muted">
          <span>Detection T0</span>
          <span className="font-semibold text-sonar">
            +{value.toFixed(1)}h {playing && "· forecasting"}
          </span>
          <span>+{max}h</span>
        </div>
        <div className="relative">
          <input
            type="range"
            min={0}
            max={max}
            step={0.1}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="h-2 w-full appearance-none rounded-full bg-stroke accent-sonar cursor-pointer"
          />
          <div className="pointer-events-none absolute -bottom-3.5 left-0 right-0 flex justify-between px-0.5">
            {marks.map((m) => (
              <span key={m} className="font-mono text-[9px] font-medium text-ink-faint">
                {m}h
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
