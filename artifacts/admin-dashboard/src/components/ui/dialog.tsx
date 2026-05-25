"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (open) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={() => onOpenChange(false)}
      className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl p-6 backdrop:bg-black/50"
      style={{
        zIndex: 1000,
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          {description && (
            <p className="text-sm text-slate-400 mt-1">{description}</p>
          )}
        </div>
        <button
          onClick={() => onOpenChange(false)}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="my-6">{children}</div>

      {footer && <div className="flex gap-3 justify-end">{footer}</div>}
    </dialog>
  );
}

export function DialogTrigger({
  asChild,
  children,
  onClick,
}: {
  asChild?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  if (asChild) {
    return <>{children}</>;
  }

  return (
    <button onClick={onClick} className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg transition-colors">
      {children}
    </button>
  );
}
