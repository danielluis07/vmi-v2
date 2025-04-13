"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateUserSchema } from "@/schemas";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FieldErrors, useForm } from "react-hook-form";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import { formatCpf, formatPhoneNumber, removeFormatting } from "@/lib/utils";
import { useEffect } from "react";

type FormData = z.infer<typeof updateUserSchema>;

export const UpdateInfo = ({
  user,
}: {
  user: {
    name: string;
    email: string;
    cpfCnpj: string | null;
    phone: string | null;
  };
}) => {
  const update = trpc.users.update.useMutation({
    onSuccess: () => {
      toast.success("Atualizado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar");
      console.error(error.message);
    },
  });

  const form = useForm<FormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      cpfCnpj: user.cpfCnpj || "",
      phone: user.phone || "",
    },
  });

  const onInvalid = (error: FieldErrors<FormData>) => {
    console.log(error);
    toast.error("Você deve preencher todos os campos obrigatórios");
  };

  const onSubmit = (values: FormData) => {
    const cleanCpfCnpj = removeFormatting(values.cpfCnpj || "");
    const cleanPhone = removeFormatting(values.phone || "");
    update.mutate({ ...values, cpfCnpj: cleanCpfCnpj, phone: cleanPhone });
  };

  useEffect(() => {
    const currentCpfValue = form.getValues("cpfCnpj");
    const currentPhoneValue = form.getValues("phone");

    if (currentCpfValue) {
      const formattedValue = formatCpf(currentCpfValue);
      form.setValue("cpfCnpj", formattedValue);
    }

    if (currentPhoneValue) {
      const formattedValue = formatPhoneNumber(currentPhoneValue);
      form.setValue("phone", formattedValue);
    }
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Informações básicas</CardTitle>
        <CardDescription>Atualize suas informações básicas</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input required {...field} />
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
                      <Input required {...field} />
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
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input
                        required
                        {...field}
                        onChange={(event) => {
                          const value = event.target.value;
                          const formattedValue = formatCpf(value);

                          field.onChange(formattedValue);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={(event) => {
                          const formattedPhoneNumber = formatPhoneNumber(
                            event.target.value
                          );
                          field.onChange(formattedPhoneNumber);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button
              isLoading={update.isPending}
              disabled={update.isPending}
              className="w-full mt-8"
              loadingLabel="Salvando">
              Salvar
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
