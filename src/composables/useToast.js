import { useToast as shadcnUseToast } from "@/components/ui/toast/use-toast";

/**
 * Wrapper para facilitar o uso do toast do shadcn
 * Fornece métodos simples: success, error, info, warning
 */
export function useToast() {
  const { toast } = shadcnUseToast();

  return {
    success: (title, description = "") => {
      toast({
        title,
        description,
        variant: "default",
        duration: 3000,
      });
    },
    error: (title, description = "") => {
      toast({
        title,
        description,
        variant: "destructive",
        duration: 5000,
      });
    },
    info: (title, description = "") => {
      toast({
        title,
        description,
        variant: "default",
        duration: 3000,
      });
    },
    warning: (title, description = "") => {
      toast({
        title,
        description,
        variant: "destructive",
        duration: 4000,
      });
    },
    // Método direto para passar configuração completa
    toast: (config) => toast(config),
  };
}
