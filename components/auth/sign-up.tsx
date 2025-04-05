"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FieldErrors } from "react-hook-form";
import { authClient } from "@/lib/auth-client";

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
import { signUpSchema } from "@/schemas";
import { useState } from "react";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import Link from "next/link";
import { cn, formatCnpj, formatCpf, removeFormatting } from "@/lib/utils";
import { useRouter } from "next/navigation";

type FormData = z.infer<typeof signUpSchema>;

export const SignUpForm = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const form = useForm<FormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "",
      cpfCnpj: "",
      password: "",
      repeat_password: "",
    },
  });

  const onInvalid = (errors: FieldErrors<FormData>) => {
    console.log(errors);
  };

  const onSubmit = async (values: FormData) => {
    const cleanCpfCnpj = removeFormatting(values.cpfCnpj);
    await authClient.signUp.email(
      {
        email: values.email, // user email address
        password: values.password, // user password -> min 8 characters by default
        name: values.name, // user display name
        role: values.role, // user role
        cpfCnpj: cleanCpfCnpj, // user cpf or cnpj
      },
      {
        onRequest: () => {
          setLoading(true);
        },
        onSuccess: () => {
          router.push("/dashboard");
        },
        onError: (ctx) => {
          // display the error message
          toast.error(ctx.error.message);
        },
      }
    );
  };

  return (
    <Card className="w-full max-w-[400px]">
      <CardHeader>
        <CardTitle className="text-center">Criar conta</CardTitle>
      </CardHeader>
      <CardContent>
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
                    <Input {...field} required disabled={loading} />
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
                      {...field}
                      required
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Tipo de Conta</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      className="flex items-center">
                      {[
                        ["Usuário", "USER"],
                        ["Produtor", "PRODUCER"],
                      ].map((option, index) => (
                        <FormItem
                          className="flex items-center space-x-3 space-y-0"
                          key={index}>
                          <FormControl>
                            <RadioGroupItem value={option[1]} />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {option[0]}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cpfCnpj"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {form.watch("role") === "USER" ? "CPF" : "CNPJ"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      onChange={(event) => {
                        const value = event.target.value;
                        const formattedValue =
                          form.watch("role") === "USER"
                            ? formatCpf(value)
                            : formatCnpj(value);

                        field.onChange(formattedValue);
                      }}
                      disabled={loading}
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
                      required
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="repeat_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Repita a Senha</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      {...field}
                      required
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button className="w-full" disabled={loading}>
              Cadastrar
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter
        className={cn(
          loading && "pointer-events-none",
          "justify-center text-sm gap-1"
        )}>
        Já possui uma conta?{" "}
        <Link href="/auth/sign-in" className="underline underline-offset-4">
          Entre
        </Link>
      </CardFooter>
    </Card>
  );
};
