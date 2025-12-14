import React, { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type = "info",
  duration = 3000,
  onClose,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), duration - 200);
    const removeTimer = setTimeout(onClose, duration);
    return () => {
      clearTimeout(timer);
      clearTimeout(removeTimer);
    };
  }, [duration, onClose]);

  const colors = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  };

  const icons = {
    success: "✔️",
    error: "❌",
    info: "ℹ️",
  };

  return (
    <div
      className={`
        fixed bottom-5 right-5 flex items-center gap-2 px-5 py-3 rounded-lg text-white shadow-lg
        transform transition-all duration-300
        ${visible ? "translate-x-0 opacity-100" : "translate-x-20 opacity-0"}
        ${colors[type]}
      `}
    >
      <span className="text-lg">{icons[type]}</span>
      <span>{message}</span>
    </div>
  );
};

export default Toast;
