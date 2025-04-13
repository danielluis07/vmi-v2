"use client";

import { z } from "zod";
import { updateProducerEventSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Control,
  FieldErrors,
  useFieldArray,
  useForm,
  useFormContext,
} from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { trpc } from "@/trpc/client";
import { Paperclip, Plus, Trash2 } from "lucide-react";
import { DropzoneOptions } from "react-dropzone";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { formatCurrency, states } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DateTimePicker, TimePicker } from "@/components/ui/date-time-picker";
import { toast } from "sonner";
import { uploadFile } from "@/actions/upload-file";
import { useRouter } from "next/navigation";
import { FileInput, FileUploader } from "@/components/update-image";
import {
  FileInput as MapInput,
  FileUploader as MapUploader,
} from "@/components/producer/events/event/update-map";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { useState } from "react";
import { useConfirm } from "@/providers/confirm-provider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type FormData = z.infer<typeof updateProducerEventSchema>;

export const UpdateProducerEventForm = ({ eventId }: { eventId: string }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [event] = trpc.events.getProducerEvent.useSuspenseQuery({
    id: eventId,
  });
  const [categories] = trpc.categories.getMany.useSuspenseQuery();
  const [ticketSectors] = trpc.ticketSectors.getMany.useSuspenseQuery();
  const deleteEvent = trpc.events.deleteProducerEvent.useMutation({
    onSuccess: () => {
      utils.events.getMany.refetch();
      router.push("/user/events");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const utils = trpc.useUtils();

  const update = trpc.events.updateProducerEvent.useMutation({
    onSuccess: (input) => {
      utils.events.getProducerEvent.refetch({ id: input.eventId });
      utils.events.getMany.refetch();
      setIsLoading(false);
      toast.success("Evento atualizado com sucesso!");
      router.push("/producer/events");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar o evento");
      console.error(error.message);
    },
  });

  const { confirm, closeConfirm, setPending } = useConfirm();

  const form = useForm<FormData>({
    resolver: zodResolver(updateProducerEventSchema),
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
      status: event.status,
      image: event.image,
      map: event.map,
      days: event.days.map((day) => ({
        date: day.date,
        startTime: day.startTime,
        endTime: day.endTime,
        batches: day.batches.map((batch) => ({
          name: batch.name,
          startTime: batch.startTime,
          endTime: batch.endTime,
          tickets: batch.tickets.map((ticket) => ({
            sectorId: ticket.sectorId,
            price: ticket.price,
            quantity: ticket.quantity,
            gender: ticket.gender,
            file: ticket.file,
            obs: ticket.obs || "",
          })),
        })),
      })),
    },
  });

  const router = useRouter();

  const handleDelete = async (id: string) => {
    const confirmed = await confirm(
      "Tem certeza?",
      "Você está prestes a deletar esse evento"
    );

    if (confirmed) {
      setPending(true);

      deleteEvent.mutate(
        { id },
        {
          onSuccess: () => {
            setPending(false);
            closeConfirm();
          },
          onError: () => {
            setPending(false);
            closeConfirm();
          },
        }
      );
    }
  };

  const eventModes = [
    { label: "Local", value: "IN_PERSON" },
    { label: "Online", value: "ONLINE" },
  ];

  const dropzone = {
    accept: {
      "image/*": [".jpg", ".jpeg", ".png"],
    },
    multiple: false,
    maxFiles: 1,
    maxSize: 1024 * 1024 * 5,
  } satisfies DropzoneOptions;

  const { control } = form;

  const {
    fields: days,
    append: addDay,
    remove: removeDay,
  } = useFieldArray({
    control,
    name: "days",
  });

  const onInvalid = (error: FieldErrors<FormData>) => {
    console.log(error);
    toast.error("Você deve preencher todos os campos obrigatórios");
  };

  const mode = form.watch("mode");

  const onSubmit = async (values: FormData) => {
    setIsLoading(true);
    const uploadPromises = [];

    const allTicketsHaveFile = form
      .getValues("days")
      .every((day) =>
        day.batches.every((batch) =>
          batch.tickets.every((ticket) => !!ticket.file)
        )
      );

    if (!allTicketsHaveFile) {
      toast.error("Todos os ingressos devem ter um arquivo associado.");
      return;
    }

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

    if (values.map instanceof File) {
      uploadPromises.push(
        uploadFile(values.map).then(({ success, message, url }) => {
          if (!success || !url) {
            toast.error(message);
          } else {
            values.map = url;
          }
        })
      );
    }

    for (const day of values.days) {
      for (const batch of day.batches) {
        for (const ticket of batch.tickets) {
          if (ticket.file instanceof File) {
            uploadPromises.push(
              uploadFile(ticket.file).then(({ success, message, url }) => {
                if (!success || !url) {
                  toast.error(message);
                } else {
                  ticket.file = url;
                }
              })
            );
          }
        }
      }
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
    <div className="w-full mb-8 px-14">
      <h1 className="text-2xl font-bold mb-3">Atualizar Evento</h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, onInvalid)}
          className="h-full flex flex-col gap-y-3">
          <div className="flex items-center justify-between w-full">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="rounded-lg border p-3 shadow-sm">
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex gap-4">
                      <FormItem className="flex items-center space-y-0">
                        <FormControl>
                          <RadioGroupItem value="ACTIVE" />
                        </FormControl>
                        <FormLabel className="font-normal">Ativo</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-y-0">
                        <FormControl>
                          <RadioGroupItem value="INACTIVE" />
                        </FormControl>
                        <FormLabel className="font-normal">Inativo</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant="destructive"
              disabled={isLoading}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleDelete(event.id);
              }}>
              Deletar
            </Button>
          </div>
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => {
              const normalizedValue = field.value ? [field.value] : null;

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

          {mode === "IN_PERSON" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Cidade"
                        {...field}
                        value={field.value || ""}
                        required={mode === "IN_PERSON"}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Endereço"
                        {...field}
                        value={field.value || ""}
                        required={mode === "IN_PERSON"}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="province"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bairro</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Bairro"
                        {...field}
                        value={field.value || ""}
                        required={mode === "IN_PERSON"}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="uf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      required={mode === "IN_PERSON"}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione uma categoria" />
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
          )}

          <ScrollArea className="border rounded-md p-2 h-[500px] mt-10">
            <h1 className="text-2xl font-bold text-center mb-5">
              Datas do Evento
            </h1>
            <div className="flex justify-end">
              <Button
                disabled={isLoading}
                type="button"
                className="w-full"
                onClick={() =>
                  addDay({
                    date: new Date(),
                    startTime: new Date(),
                    endTime: new Date(),
                    batches: [
                      {
                        name: "",
                        startTime: new Date(),
                        endTime: new Date(),
                        tickets: [
                          {
                            sectorId: "",
                            price: 0,
                            quantity: 1,
                            gender: "MALE",
                            file: undefined,
                            obs: "",
                          },
                        ],
                      },
                    ],
                  })
                }>
                Adicionar Dia
                <Plus />
              </Button>
            </div>

            {days.map((day, dayIndex) => (
              <div key={day.id} className="mb-4 mt-5">
                <Separator className="my-5" />
                <div className="flex gap-x-5">
                  <h1 className="text-2xl font-bold">Dia {dayIndex + 1}</h1>
                  <FormField
                    control={control}
                    name={`days.${dayIndex}.date`}
                    render={({ field }) => (
                      <FormItem className="w-[250px]">
                        <FormControl>
                          <DateTimePicker
                            granularity="day"
                            value={field.value || undefined}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`days.${dayIndex}.startTime`}
                    render={({ field }) => (
                      <FormItem className="w-[250px]">
                        <FormControl>
                          <TimePicker
                            date={field.value}
                            onChange={(time) => {
                              if (!time) return; // Prevent errors
                              const selectedDate = form.getValues(
                                `days.${dayIndex}.date`
                              ); // Get chosen date
                              if (selectedDate) {
                                const updatedDateTime = new Date(selectedDate); // Copy the date
                                updatedDateTime.setHours(
                                  time.getHours(),
                                  time.getMinutes(),
                                  0
                                ); // Merge time
                                field.onChange(updatedDateTime); // Update field
                              }
                            }}
                            granularity="minute"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`days.${dayIndex}.endTime`}
                    render={({ field }) => (
                      <FormItem className="w-[250px]">
                        <FormControl>
                          <TimePicker
                            date={field.value}
                            onChange={(time) => {
                              if (!time) return; // Prevent errors
                              const selectedDate = form.getValues(
                                `days.${dayIndex}.date`
                              ); // Get chosen date
                              if (selectedDate) {
                                const updatedDateTime = new Date(selectedDate); // Copy the date
                                updatedDateTime.setHours(
                                  time.getHours(),
                                  time.getMinutes(),
                                  0
                                ); // Merge time
                                field.onChange(updatedDateTime); // Update field
                              }
                            }}
                            granularity="minute"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {days.length > 1 && (
                    <div className="flex justify-end">
                      <Button
                        disabled={isLoading}
                        type="button"
                        variant="destructive"
                        onClick={() => removeDay(dayIndex)}>
                        Remover Dia {dayIndex + 1}
                      </Button>
                    </div>
                  )}
                </div>

                <BatchesFieldArray
                  control={control}
                  dayIndex={dayIndex}
                  isLoading={isLoading}
                  ticketSectors={ticketSectors}
                />
              </div>
            ))}
          </ScrollArea>

          <Separator className="my-5" />

          <FormField
            control={form.control}
            name="map"
            render={({ field }) => {
              const normalizedValue = field.value ? [field.value] : null;

              const previewUrl =
                field.value instanceof File
                  ? URL.createObjectURL(field.value)
                  : typeof field.value === "string"
                  ? field.value
                  : null;

              return (
                <FormItem className="h-[500px] border rounded-md p-2">
                  <FormLabel className="text-2xl font-bold text-center mx-auto">
                    Mapa do Evento
                  </FormLabel>
                  <FormControl>
                    <MapUploader
                      value={normalizedValue}
                      onValueChange={(files) => {
                        const file = files?.[0] ?? null;
                        field.onChange(file);
                      }}
                      dropzoneOptions={dropzone}
                      orientation="vertical">
                      <MapInput className="h-80" previewurl={previewUrl}>
                        Arraste ou clique para selecionar uma imagem
                      </MapInput>
                    </MapUploader>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <Button
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

const BatchesFieldArray = ({
  control,
  dayIndex,
  ticketSectors,
  isLoading,
}: {
  control: Control<FormData>;
  dayIndex: number;
  isLoading: boolean;
  ticketSectors: {
    id: string;
    name: string;
    createdAt: Date | null;
    updatedAt: Date | null;
  }[];
}) => {
  const {
    fields: batches,
    append: addBatch,
    remove: removeBatch,
  } = useFieldArray({
    control,
    name: `days.${dayIndex}.batches`,
  });

  const { getValues } = useFormContext();
  return (
    <div>
      {batches.map((batch, batchIndex) => (
        <div key={batch.id} className="border p-4 rounded mb-4 mt-2 relative">
          <div className="flex items-center gap-x-8">
            <FormField
              control={control}
              name={`days.${dayIndex}.batches.${batchIndex}.name`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lote {batchIndex + 1}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="w-[250px]"
                      placeholder="Nome do Lote"
                      required
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`days.${dayIndex}.batches.${batchIndex}.startTime`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Início</FormLabel>
                  <FormControl>
                    <TimePicker
                      date={field.value}
                      onChange={field.onChange}
                      granularity="minute"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`days.${dayIndex}.batches.${batchIndex}.endTime`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Término</FormLabel>
                  <FormControl>
                    <TimePicker
                      date={field.value}
                      onChange={field.onChange}
                      granularity="minute"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {batches.length > 1 && (
              <Button
                type="button"
                variant="destructive"
                disabled={isLoading}
                className="mt-5"
                onClick={() => removeBatch(batchIndex)}>
                Remover Lote
              </Button>
            )}
          </div>

          <TicketsFieldArray
            control={control}
            dayIndex={dayIndex}
            batchIndex={batchIndex}
            ticketSectors={ticketSectors}
          />
        </div>
      ))}

      <Button
        type="button"
        className="w-full"
        onClick={() => {
          const previousEndDate = getValues(
            `days.${dayIndex}.batches.${batches.length - 1}.endTime`
          );
          addBatch({
            name: "",
            startTime: previousEndDate || "", // Now properly accessing endDate from the form state
            endTime: new Date(),
            tickets: [
              {
                sectorId: "",
                price: 0,
                quantity: 1,
                gender: "MALE",
                file: undefined,
                obs: "",
              },
            ],
          });
        }}>
        Adicionar Lote
        <Plus />
      </Button>
    </div>
  );
};

const TicketsFieldArray = ({
  control,
  dayIndex,
  batchIndex,
  ticketSectors,
}: {
  control: Control<FormData>;
  dayIndex: number;
  batchIndex: number;
  ticketSectors: {
    id: string;
    name: string;
    createdAt: Date | null;
    updatedAt: Date | null;
  }[];
}) => {
  const {
    fields: tickets,
    append: addTicket,
    remove: removeTicket,
  } = useFieldArray({
    control,
    name: `days.${dayIndex}.batches.${batchIndex}.tickets`,
  });

  const { getValues } = useFormContext();

  return (
    <div>
      <Button
        type="button"
        className="w-full mt-5"
        variant="secondary"
        onClick={() => {
          // get previous ticket quantity
          const previousQuantity = getValues(
            `days.${dayIndex}.batches.${batchIndex}.tickets.${
              tickets.length - 1
            }.quantity`
          );

          // get previous ticket sectorId
          const previousSectorId = getValues(
            `days.${dayIndex}.batches.${batchIndex}.tickets.${
              tickets.length - 1
            }.sectorId`
          );

          // get previous ticket gender
          const previousGender = getValues(
            `days.${dayIndex}.batches.${batchIndex}.tickets.${
              tickets.length - 1
            }.gender`
          );

          addTicket({
            sectorId: previousSectorId || "",
            price: 0,
            gender: previousGender,
            quantity: previousQuantity || 0,
            isNominal: false,
            file: undefined,
            obs: "",
          });
        }}>
        Adicionar Ingresso
        <Plus />
      </Button>

      {tickets.map((ticket, ticketIndex) => (
        <div
          key={ticket.id}
          className="relative mt-8 border rounded-md p-4 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormField
              control={control}
              name={`days.${dayIndex}.batches.${batchIndex}.tickets.${ticketIndex}.sectorId`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Setor</FormLabel>
                  <FormControl>
                    <Select
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

            <FormField
              control={control}
              name={`days.${dayIndex}.batches.${batchIndex}.tickets.${ticketIndex}.price`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={formatCurrency(field.value)}
                      required
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
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`days.${dayIndex}.batches.${batchIndex}.tickets.${ticketIndex}.quantity`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantidade</FormLabel>
                  <FormControl>
                    <Input
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

            <FormField
              control={control}
              name={`days.${dayIndex}.batches.${batchIndex}.tickets.${ticketIndex}.gender`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gênero</FormLabel>
                  <FormControl>
                    <Select
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

            <FormField
              control={control}
              name={`days.${dayIndex}.batches.${batchIndex}.tickets.${ticketIndex}.file`}
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
                        id={`file-input-${dayIndex}-${batchIndex}-${ticketIndex}`}
                      />

                      {/* Botão para anexar ou substituir arquivo */}
                      <Button
                        type="button"
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => {
                          const input = document.getElementById(
                            `file-input-${dayIndex}-${batchIndex}-${ticketIndex}`
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

          <FormField
            control={control}
            name={`days.${dayIndex}.batches.${batchIndex}.tickets.${ticketIndex}.obs`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observação</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    value={field.value || ""}
                    placeholder="Insira alguma observação"
                    maxLength={100}
                    className="resize-none"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {tickets.length > 1 && (
            <div className="flex justify-end">
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => removeTicket(ticketIndex)}
                disabled={tickets.length === 1}>
                <Trash2 size={16} />
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
