import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";

const PaymentSuccessPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-fulltext-center">
        <Check className="h-14 w-14 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl text-center font-semibold text-gray-800 mb-2">
          Pagamento aprovado
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          Seu pagamento foi processado com sucesso. Você receberá um e-mail de
          confirmação em breve.
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

export default PaymentSuccessPage;
