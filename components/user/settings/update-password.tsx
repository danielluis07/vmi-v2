"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { updatePasswordSchema } from "@/schemas";
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
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type FormData = z.infer<typeof updatePasswordSchema>;

export const UpdatePassword = () => {
  const form = useForm<FormData>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      password: "",
      repeat_password: "",
    },
  });
  const onInvalid = (error: FieldErrors<FormData>) => {
    console.log(error);
    toast.error("Você deve preencher todos os campos obrigatórios");
  };

  const onSubmit = async (values: FormData) => {
    console.log(values);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Atualizar Senha</CardTitle>
        <CardDescription>Atualize sua senha de acesso</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="space-y-6"
            onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha atual</FormLabel>
                  <FormControl>
                    <Input type="password" required {...field} />
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
                  <FormLabel>Repita a senha</FormLabel>
                  <FormControl>
                    <Input type="password" required {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="w-full" loadingLabel="Salvando">
              Salvar
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
