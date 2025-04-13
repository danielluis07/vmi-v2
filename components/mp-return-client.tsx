"use client";

import { trpc } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export const MpReturnClient = ({ code }: { code: string | undefined }) => {
  const router = useRouter();

  const mutation = trpc.mercadoPago.processCallback.useMutation({
    onSuccess: () => {
      setTimeout(() => {
        router.push("/producer/events");
      }, 2000);
    },
    onError: (error) => {
      console.error("Erro ao processar OAuth do Mercado Pago:", error.message);
    },
  });

  useEffect(() => {
    if (code) {
      mutation.mutate({ code });
    }
  }, [code]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50 px-4">
      {mutation.isPending && (
        <div className="flex flex-col items-center text-gray-600">
          <Loader2 className="animate-spin w-10 h-10 mb-4" />
          <p className="text-sm">Conectando com o Mercado Pago...</p>
        </div>
      )}

      {mutation.isSuccess && (
        <div className="flex flex-col items-center text-green-600">
          <CheckCircle className="w-10 h-10 mb-2" />
          <p className="text-sm">
            Conta conectada com sucesso! Redirecionando...
          </p>
        </div>
      )}

      {mutation.isError && (
        <div className="flex flex-col items-center text-red-600">
          <XCircle className="w-10 h-10 mb-2" />
          <p className="text-sm text-center max-w-xs">
            Ocorreu um erro ao conectar sua conta Mercado Pago. Por favor, tente
            novamente.
          </p>
        </div>
      )}
    </div>
  );
};
