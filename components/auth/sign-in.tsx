"use client";

import { z } from "zod";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FieldErrors } from "react-hook-form";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signInSchema } from "@/schemas";
import { getErrorMessage } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type FormData = z.infer<typeof signInSchema>;

export const SignInForm = () => {
  const { signIn, getSession } = authClient;
  const [loading, setLoading] = useState<boolean>(false);
  const form = useForm<FormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const router = useRouter();

  const onInvalid = (errors: FieldErrors<FormData>) => {
    console.log(errors);
  };

  const onSubmit = async (values: FormData) => {
    await signIn.email(
      {
        email: values.email,
        password: values.password,
      },
      {
        onRequest: () => {
          setLoading(true);
        },
        onSuccess: async () => {
          const session = await getSession();

          if (!session.data?.user) {
            toast.error("Usuário não encontrado");
            setLoading(false);
            return;
          }

          router.push(`/${session.data.user.role.toLowerCase()}`);
        },
        onError: (ctx) => {
          toast.error(getErrorMessage(ctx.error.code, "ptBr"));
          setLoading(false);
        },
      }
    );
  };

  return (
    <Card className="w-full max-w-[400px]">
      <CardHeader>
        <CardTitle className="text-center">Entre em sua conta</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="meuemail@exemplo.com"
                      {...field}
                      disabled={loading}
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      {...field}
                      disabled={loading}
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              className="w-full"
              disabled={loading}
              isLoading={loading}
              loadingLabel="Entrando">
              Entrar
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter
        className={cn(
          loading && "pointer-events-none",
          "justify-center text-sm gap-1"
        )}>
        Não possui uma conta?{" "}
        <Link href="/auth/sign-up" className="underline underline-offset-4">
          Cadastre-se
        </Link>
      </CardFooter>
    </Card>
  );
};
