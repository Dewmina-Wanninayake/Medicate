import { toast as sonnerToast } from "sonner";

const useToast = () => {
  const toast = ({ title, description, variant = "default" }) => {
    const options = {
      description,
    };

    if (variant === "destructive") {
      return sonnerToast.error(title, options);
    } else if (variant === "success") {
      return sonnerToast.success(title, options);
    } else {
      return sonnerToast(title, options);
    }
  };

  return { toast };
};

export { useToast };
