import { useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Comprar() {
  const [, setLocation] = useLocation();
  
  // Redirect to home page - sales are closed
  useEffect(() => {
    toast.error("Vendas online encerradas. Fale conosco no WhatsApp!");
    setLocation("/");
  }, [setLocation]);
  
  return null;
}
