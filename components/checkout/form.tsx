"use client";

import { z } from "zod";
import { useForm, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { checkoutSchema } from "@/schemas";
import { Session } from "@/lib/auth-client";
import { useCheckoutStore } from "@/stores/use-checkout-data";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type FormData = z.infer<typeof checkoutSchema>;

export const CheckoutForm = ({ session }: { session: Session | null }) => {
  const user = session?.user || null;
  const { tickets, reset } = useCheckoutStore();
  const form = useForm<FormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  const router = useRouter();

  const mutation = trpc.mercadoPago.createPayment.useMutation({
    onSuccess: (data) => {
      reset();
      useCheckoutStore.persist.clearStorage();
      if (data.url) {
        router.push(data.url);
      }
    },
    onError: (error) => {
      console.error("Error creating payment:", error);
      toast.error(
        "Ocorreu um erro ao criar o pagamento. Tente novamente mais tarde."
      );
    },
  });

  const onInvalid = (errors: FieldErrors<FormData>) => {
    console.log(errors);
  };

  const onSubmit = async (values: FormData) => {
    const checkoutPayment: CheckoutPayment = {
      userId: user?.id,
      email: values.email,
      name: values.name,
      tickets: tickets,
    };

    mutation.mutate(checkoutPayment);
  };

  return (
    <Form {...form}>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  readOnly={!!user?.name}
                  placeholder="Seu nome completo"
                  {...field}
                  required
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  readOnly={!!user?.email}
                  placeholder="meuemail@exemplo.com"
                  {...field}
                  required
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {!session && (
          <div className="text-sm text-center text-muted-foreground py-4">
            Já tem conta?{" "}
            <Link href="/login" className="underline underline-offset-4">
              Faça login
            </Link>{" "}
            ou{" "}
            <Link href="/signup" className="underline underline-offset-4">
              crie uma conta
            </Link>{" "}
            para acompanhar seus pedidos.
          </div>
        )}

        <Button
          className="w-full"
          disabled={mutation.isPending}
          isLoading={mutation.isPending}
          loadingLabel="Processando">
          Continuar para o pagamento
        </Button>
      </form>
    </Form>
  );
};
