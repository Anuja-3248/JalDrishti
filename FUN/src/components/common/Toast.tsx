import { useEffect } from "react";

interface ToastProps {
  message: string;
  onDismiss: () => void;
}

export default function Toast({ message, onDismiss }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3200);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className="fixed bottom-20 left-1/2 z-[2500] -translate-x-1/2 rounded-md border border-sonar/40 bg-cream-light px-4 py-2.5 shadow-panel">
      <p className="flex items-center gap-2 text-xs font-medium text-ink-dark">
        <span className="h-2 w-2 rounded-full bg-sonar" />
        {message}
      </p>
    </div>
  );
}
