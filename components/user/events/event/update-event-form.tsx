"use client";

import { z } from "zod";
import { useState } from "react";
import { updateUserEventSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldErrors, useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useMultiStepFormStore } from "@/stores/use-multi-step-form";
import { trpc } from "@/trpc/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, states } from "@/lib/utils";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Paperclip, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { uploadFile } from "@/actions/upload-file";
import { FileInput, FileUploader } from "@/components/update-image";
import { DropzoneOptions } from "react-dropzone";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";
import { useRouter } from "next/navigation";

type FormData = z.infer<typeof updateUserEventSchema>;

export const UpdateUserEventForm = ({ eventId }: { eventId: string }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [event] = trpc.userEvents.getOne.useSuspenseQuery({ id: eventId });
  const [categories] = trpc.categories.getMany.useSuspenseQuery();
  const [ticketSectors] = trpc.ticketSectors.getMany.useSuspenseQuery();
  const utils = trpc.useUtils();

  const { image } = useMultiStepFormStore();

  const eventModes = [
    { label: "Local", value: "IN_PERSON" },
    { label: "Online", value: "ONLINE" },
  ];

  const form = useForm<FormData>({
    resolver: zodResolver(updateUserEventSchema),
    defaultValues: {
      id: event.id,
      title: event.title,
      city: event.city || "",
      province: event.province || "",
      address: event.address || "",
      uf: event.uf || "",
      description: event.description || "",
      categoryId: event.categoryId,
      mode: event.mode,
      date: event.date || undefined,
      image: event.image,
      ticket: {
        sectorId: event.ticket.sectorId,
        price: event.ticket.price,
        quantity: event.ticket.quantity,
        gender: event.ticket.gender,
        isNominal: event.ticket.isNominal,
        file: event.ticket.file,
        obs: event.ticket.obs || "",
      },
    },
  });

  const dropzone = {
    accept: {
      "image/*": [".jpg", ".jpeg", ".png"],
    },
    multiple: false,
    maxFiles: 1,
    maxSize: 1024 * 1024 * 5,
  } satisfies DropzoneOptions;

  const router = useRouter();

  const update = trpc.userEvents.update.useMutation({
    onSuccess: (input) => {
      utils.userEvents.getOne.refetch({ id: input.eventId });
      utils.userEvents.getMany.refetch();
      toast.success("Evento atualizado com sucesso!");
      setIsLoading(false);
      router.push("/user/events");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar o evento");
      console.error(error.message);
    },
  });

  const onInvalid = (error: FieldErrors<FormData>) => {
    console.log(error);
    toast.error("Você deve preencher todos os campos obrigatórios");
  };

  const onSubmit = async (values: FormData) => {
    setIsLoading(true);

    const uploadPromises = [];

    if (values.image instanceof File) {
      uploadPromises.push(
        uploadFile(values.image).then(({ success, message, url }) => {
          if (!success || !url) {
            toast.error(message);
          } else {
            values.image = url;
          }
        })
      );
    }

    if (values.ticket.file instanceof File) {
      uploadPromises.push(
        uploadFile(values.ticket.file).then(({ success, message, url }) => {
          if (!success || !url) {
            toast.error(message);
          } else {
            values.ticket.file = url;
          }
        })
      );
    }

    try {
      await Promise.all(uploadPromises);
      update.mutate(values);
    } catch (error) {
      toast.error("Erro ao fazer upload dos arquivos");
      console.error(error);
    }
  };

  return (
    <div className="w-full mb-8">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, onInvalid)}
          className="h-full flex flex-col gap-y-3">
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => {
              const normalizedValue = image ? [image] : null;

              const previewUrl =
                field.value instanceof File
                  ? URL.createObjectURL(field.value)
                  : typeof field.value === "string"
                  ? field.value
                  : null;

              return (
                <FormItem>
                  <FormControl>
                    <FileUploader
                      value={normalizedValue}
                      onValueChange={(files) => {
                        const file = files?.[0] ?? null;
                        field.onChange(file);
                      }}
                      dropzoneOptions={dropzone}
                      orientation="vertical">
                      <FileInput className="h-64" previewurl={previewUrl}>
                        Arraste ou clique para selecionar uma imagem
                      </FileInput>
                    </FileUploader>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <div className="flex items-center justify-between gap-x-4">
            <div className="w-full">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder="Insira o título do evento"
                        required
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="w-full">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select
                      disabled={isLoading}
                      onValueChange={field.onChange}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="w-full">
              <FormField
                control={form.control}
                name="mode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Evento</FormLabel>
                    <Select
                      disabled={isLoading}
                      onValueChange={field.onChange}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione o tipo de evento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {eventModes.map((mode, i) => (
                          <SelectItem key={i} value={mode.value}>
                            {mode.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="w-full">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data do Evento</FormLabel>
                    <FormControl>
                      <DateTimePicker
                        placeholder="Selecione a data do evento"
                        onChange={field.onChange}
                        value={field.value}
                        granularity="minute"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className="mt-8 pb-2">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição do Evento</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Conte sobre seu evento"
                      className="resize-none h-34"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Separator className="my-4" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="w-full">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder="Cidade"
                        {...field}
                        value={field.value || ""}
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="w-full">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder="Endereço"
                        {...field}
                        value={field.value || ""}
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="w-full">
              <FormField
                control={form.control}
                name="province"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bairro</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder="Bairro"
                        {...field}
                        value={field.value || ""}
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="w-full">
              <FormField
                control={form.control}
                name="uf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select
                      disabled={isLoading}
                      onValueChange={field.onChange}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione um estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {states.map((state, i) => (
                          <SelectItem key={i} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Separator className="my-4" />

          <div className="grid grid-cols-6 gap-4">
            <div className="col-span-1">
              <FormField
                control={form.control}
                name="ticket.sectorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Setor</FormLabel>
                    <FormControl>
                      <Select
                        disabled={isLoading}
                        onValueChange={field.onChange}
                        defaultValue={field.value}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione um setor" />
                        </SelectTrigger>
                        <SelectContent>
                          {ticketSectors.map((sector) => (
                            <SelectItem key={sector.id} value={sector.id}>
                              {sector.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-1">
              <FormField
                control={form.control}
                name="ticket.price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={formatCurrency(field.value)}
                        required
                        disabled={isLoading}
                        placeholder="R$ 0,00"
                        onChange={(e) => {
                          const rawValue = e.target.value.replace(/\D/g, "");
                          const numericValue = rawValue
                            ? parseInt(rawValue, 10)
                            : 0;
                          field.onChange(numericValue);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-4">
              <FormField
                control={form.control}
                name="ticket.file"
                render={({ field: { onChange, ref, value } }) => (
                  <FormItem className="w-full">
                    <FormLabel>Ingresso</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        {/* Hidden input de arquivo */}
                        <input
                          type="file"
                          ref={ref}
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) {
                              onChange(file); // Atualiza o valor com o novo arquivo
                            }
                          }}
                          style={{ display: "none" }}
                          id="file-input"
                        />

                        {/* Botão para anexar ou substituir arquivo */}
                        <Button
                          type="button"
                          variant="outline"
                          className="flex items-center gap-2"
                          onClick={() => {
                            const input = document.getElementById(
                              "file-input"
                            ) as HTMLInputElement;
                            input?.click();
                          }}>
                          <Paperclip className="size-4" />
                          {value ? "Substituir Arquivo" : "Anexar Arquivo"}
                        </Button>

                        {value && (
                          <div className="flex items-center gap-2">
                            {value instanceof File ? (
                              <span className="w-80 h-8 text-sm text-secondary truncate border border-secondary rounded-md p-1">
                                {value.name}
                              </span>
                            ) : typeof value === "string" ? (
                              <Link
                                href={value}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-80 h-8 text-sm text-secondary truncate border border-secondary rounded-md p-1">
                                {value.split("/").pop()}
                              </Link>
                            ) : (
                              <span className="w-80 h-8 text-sm text-secondary truncate border border-secondary rounded-md p-1">
                                Arquivo
                              </span>
                            )}

                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => onChange(null)}>
                              <Trash2 className="size-4 text-destructive" />
                              <span className="sr-only">Remover arquivo</span>
                            </Button>
                          </div>
                        )}
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-2">
              <FormField
                control={form.control}
                name="ticket.quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        type="number"
                        className="text-center"
                        required
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value
                            ? parseInt(e.target.value, 10)
                            : 0;
                          field.onChange(isNaN(value) ? 0 : value);
                        }}
                        max={999}
                        min={1}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-2">
              <FormField
                control={form.control}
                name="ticket.gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gênero</FormLabel>
                    <FormControl>
                      <Select
                        disabled={isLoading}
                        onValueChange={field.onChange}
                        defaultValue={field.value}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione o gênero" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MALE">Masculino</SelectItem>
                          <SelectItem value="FEMALE">Feminino</SelectItem>
                          <SelectItem value="UNISEX">Unisex</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-2">
              <FormField
                control={form.control}
                name="ticket.isNominal"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Ingresso nominal</FormLabel>
                      <FormDescription>
                        Controla se o ingresso é nominal ou não
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Button
            className="w-full mt-4"
            disabled={isLoading}
            isLoading={isLoading}
            loadingLabel="Atualizando">
            Atualizar
          </Button>
        </form>
      </Form>
    </div>
  );
};
