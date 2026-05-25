"use client";

import { useToastStore } from "@/store/toast";
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";

export function ToastContainer() {
  const { messages, remove } = useToastStore();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {messages.map((message) => {
        const icons = {
          success: <CheckCircle className="w-5 h-5" />,
          error: <AlertCircle className="w-5 h-5" />,
          info: <Info className="w-5 h-5" />,
          warning: <AlertTriangle className="w-5 h-5" />,
        };

        const bgColors = {
          success: "bg-green-600/20 border-green-600/50 text-green-400",
          error: "bg-red-600/20 border-red-600/50 text-red-400",
          info: "bg-primary/20 border-blue-600/50 text-primary",
          warning: "bg-yellow-600/20 border-yellow-600/50 text-yellow-400",
        };

        return (
          <div
            key={message.id}
            className={`flex items-center gap-3 px-4 py-3 border rounded-lg animate-in fade-in slide-in-from-right-2 ${bgColors[message.type]}`}
          >
            {icons[message.type]}
            <p className="flex-1">{message.message}</p>
            <button
              onClick={() => remove(message.id)}
              className="text-current opacity-70 hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
