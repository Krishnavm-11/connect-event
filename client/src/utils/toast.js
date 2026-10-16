
import toast from "react-hot-toast";
import { CheckCircle2, XCircle, Info, LoaderCircle } from "lucide-react";

const baseStyle = {
  background: "#111827",
  color: "#f9fafb",
  border: "1px solid #374151",
  borderRadius: "14px",
  padding: "14px 16px",
  fontSize: "14px",
  fontWeight: "500",
  boxShadow: "0 12px 35px rgba(0, 0, 0, 0.35)",
  maxWidth: "380px",
};

export const notify = {
  success(message) {
    return toast(message, {
      icon: <CheckCircle2 size={21} color="#34d399" />,
      duration: 3000,
      style: {
        ...baseStyle,
        border: "1px solid rgba(52, 211, 153, 0.35)",
      },
    });
  },

  error(message) {
    return toast(message, {
      icon: <XCircle size={21} color="#fb7185" />,
      duration: 4000,
      style: {
        ...baseStyle,
        border: "1px solid rgba(251, 113, 133, 0.4)",
      },
    });
  },

  info(message) {
    return toast(message, {
      icon: <Info size={21} color="#60a5fa" />,
      duration: 3000,
      style: {
        ...baseStyle,
        border: "1px solid rgba(96, 165, 250, 0.35)",
      },
    });
  },

  loading(message) {
    return toast.loading(message, {
      icon: <LoaderCircle size={21} color="#60a5fa" />,
      style: baseStyle,
    });
  },

  dismiss(id) {
    toast.dismiss(id);
  },
};

export default notify;
