import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useToast } from "../../context/ToastContext";

function ToastViewport() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="toast-viewport" aria-live="polite">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            className={`toast toast-${toast.type}`}
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.98 }}
            transition={{ duration: 0.18 }}
          >
            <p>{toast.message}</p>
            <button className="icon-btn" onClick={() => removeToast(toast.id)} aria-label="Close">
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default ToastViewport;
