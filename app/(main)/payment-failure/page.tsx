import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import Link from "next/link";

const PaymentFailurePage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-fulltext-center">
        <XCircle className="h-14 w-14 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl text-center font-semibold text-gray-800 mb-2">
          Pagamento não aprovado
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          Algo deu errado durante o processo de pagamento com o Mercado Pago.
          Por favor, tente novamente ou escolha outro método.
        </p>
        <div className="flex justify-center">
          <Link href="/">
            <Button>Voltar à página inicial</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailurePage;
