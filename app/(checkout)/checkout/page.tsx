import { CheckoutForm } from "@/components/checkout/form";
import { CheckoutSummary } from "@/components/checkout/summary";
import { Separator } from "@/components/ui/separator";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const CheckoutPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col bg-card text-card-foreground gap-6 rounded-xl border py-6 px-5 shadow-sm max-w-5xl w-full">
        <h2 className="text-lg font-semibold text-secondary">
          Resumo da compra
        </h2>
        <CheckoutSummary />
        <Separator />
        <CheckoutForm session={session} />
      </div>
    </div>
  );
};

export default CheckoutPage;
