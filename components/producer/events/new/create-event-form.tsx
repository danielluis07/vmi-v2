"use client";

import { z } from "zod";
import { useEffect, useState } from "react";
import { createProducerEventSchema } from "@/schemas";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { useMultiStepFormStore } from "@/stores/use-multi-step-form";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/trpc/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  formatCurrency,
  formatCurrencyFromCents,
  formatDate,
  getFormattedDateTime,
  states,
} from "@/lib/utils";
import { DateTimePicker, TimePicker } from "@/components/ui/date-time-picker";
import {
  CalendarDays,
  CircleArrowLeft,
  CircleArrowRight,
  Clock,
  Hash,
  Info,
  Layers,
  Paperclip,
  Plus,
  Tag,
  Ticket,
  Trash2,
  User,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { uploadFile } from "@/actions/upload-file";
import { FileInput, FileUploader } from "@/components/ui/file-uploader";
import { DropzoneOptions } from "react-dropzone";
import {
  FileUploader as MapFileUploader,
  FileInput as MapInputUploader,
} from "@/components/producer/events/new/upload-map";

type FormData = z.infer<typeof createProducerEventSchema>;

export const CreateProducerEventForm = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [categories] = trpc.categories.getMany.useSuspenseQuery();
  const [ticketSectors] = trpc.ticketSectors.getMany.useSuspenseQuery();
  const utils = trpc.useUtils();

  const router = useRouter();

  const eventModes = [
    { label: "Local", value: "IN_PERSON" },
    { label: "Online", value: "ONLINE" },
  ];

  const { step, setStep, image, imagePreviewUrl, setImage, clearImage } =
    useMultiStepFormStore();
  const form = useForm<FormData>({
    resolver: zodResolver(createProducerEventSchema),
    defaultValues: {
      title: "",
      city: "",
      province: "",
      address: "",
      uf: "",
      description: "",
      categoryId: "",
      mode: "IN_PERSON",
      image: undefined,
      map: undefined,
      days: [
        {
          date: undefined,
          startTime: undefined,
          endTime: undefined,
          batches: [
            {
              name: "",
              startTime: undefined,
              endTime: undefined,
              tickets: [
                {
                  sectorId: "",
                  price: undefined,
                  quantity: 1,
                  gender: "MALE",
                  file: undefined,
                  obs: undefined,
                },
              ],
            },
          ],
        },
      ],
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

  const create = trpc.producerEvents.create.useMutation({
    onSuccess: () => {
      utils.producerEvents.getMany.refetch();
      toast.success("Evento criado com sucesso!");
      setIsLoading(false);
      router.push("/producer/events");
    },
    onError: (error) => {
      toast.error("Erro ao criar evento");
      console.error(error.message);
    },
  });

  const totalSteps = 5;

  const handleNextStep = async () => {
    let fieldsToValidate: (keyof FormData)[] = [];
    const mode = form.watch("mode");

    const shouldSkipStep2 = mode !== "IN_PERSON";
    const nextStep = step === 1 && shouldSkipStep2 ? 3 : step + 1;

    switch (step) {
      case 1:
        fieldsToValidate = ["title", "categoryId", "mode", "description"];
        break;
      case 2:
        if (mode === "IN_PERSON") {
          fieldsToValidate = ["city", "province", "address", "uf"];
        }
        break;
      case 3:
        fieldsToValidate = ["days"];
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
        break;
    }

    const isStepValid = await form.trigger(fieldsToValidate);

    if (isStepValid && step < totalSteps) {
      setStep(nextStep);
    } else {
      toast.error("Preencha todos os campos obrigatórios antes de avançar.");
    }
  };

  const handlePrevStep = () => {
    const mode = form.watch("mode");
    const shouldSkipStep2 = mode !== "IN_PERSON";
    const prevStep = step === 3 && shouldSkipStep2 ? 1 : step - 1;

    if (step > 1) {
      setStep(prevStep);
    }
  };

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
      create.mutate(values);
    } catch (error) {
      toast.error("Erro ao fazer upload dos arquivos");
      console.error(error);
    }
  };

  const { control } = form;

  const {
    fields: days,
    append: addDay,
    remove: removeDay,
  } = useFieldArray({
    control,
    name: "days",
  });

  useEffect(() => {
    setStep(1);
  }, []);

  return (
    <div className="w-full flex">
      <div>
        <Button
          type="button"
          className="sticky left-0 top-1/2 transform -translate-y-1/2 pointer-events-auto z-50"
          onClick={handlePrevStep}
          disabled={step === 1}>
          <CircleArrowLeft />
        </Button>
      </div>
      <div className="px-5 overflow-hidden w-full mx-3">
        <Progress value={(step / totalSteps) * 100} className="my-5" />
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, onInvalid)}
            className="h-full flex flex-col gap-y-3">
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Banner do Evento</FormLabel>
                  <FormControl>
                    <FileUploader
                      value={image ? [image] : null}
                      onValueChange={(file) => {
                        if (file) {
                          field.onChange(file?.[0] ?? null);
                          setImage(file?.[0] ?? null);
                        } else {
                          clearImage();
                        }
                      }}
                      dropzoneOptions={dropzone}>
                      <FileInput className="h-64" previewurl={imagePreviewUrl}>
                        Arraste ou clique para selecionar uma imagem
                      </FileInput>
                    </FileUploader>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}>
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
                                  <SelectItem
                                    key={category.id}
                                    value={category.id}>
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
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-2 gap-4 pb-2">
                  <div className="w-full">
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
                            onValueChange={field.onChange}
                            defaultValue={field.value}>
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
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}>
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      disabled={isLoading}
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
                        <h1 className="text-2xl font-bold">
                          Dia {dayIndex + 1}
                        </h1>
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
                                      const updatedDateTime = new Date(
                                        selectedDate
                                      ); // Copy the date
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
                                      const updatedDateTime = new Date(
                                        selectedDate
                                      ); // Copy the date
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

                      {/* Manage Batches inside each Day */}
                      <BatchesFieldArray
                        control={control}
                        dayIndex={dayIndex}
                        ticketSectors={ticketSectors}
                      />
                    </div>
                  ))}
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}>
                  <FormField
                    control={form.control}
                    name="map"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mapa do Evento</FormLabel>
                        <FormControl>
                          <MapFileUploader
                            value={field.value ? [field.value] : null}
                            onValueChange={(files) => {
                              const file = files?.[0] ?? null;
                              field.onChange(file);
                            }}
                            dropzoneOptions={dropzone}
                            orientation="vertical">
                            <MapInputUploader
                              className="h-80"
                              previewurl={
                                field.value instanceof File
                                  ? URL.createObjectURL(field.value)
                                  : typeof field.value === "string"
                                  ? field.value
                                  : null
                              }>
                              Arraste ou clique para selecionar uma imagem
                            </MapInputUploader>
                          </MapFileUploader>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
              )}

              {step === 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}>
                  <div className="p-6">
                    {/* Main Event Details */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-500">Título:</p>
                        <p className="font-medium">{form.watch("title")}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Categoria:</p>
                        <p className="font-medium">
                          {
                            categories.find(
                              (c) => c.id === form.watch("categoryId")
                            )?.name
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Tipo:</p>
                        <p className="font-medium">
                          {
                            eventModes.find(
                              (m) => m.value === form.watch("mode")
                            )?.label
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Local:</p>
                        {form.watch("mode") === "IN_PERSON" ? (
                          <p className="font-medium">
                            {form.watch("city")}, {form.watch("province")} -{" "}
                            {form.watch("uf")}
                          </p>
                        ) : (
                          <p className="font-medium">Evento Online</p>
                        )}
                      </div>
                    </div>

                    <Separator className="my-4" />

                    {/* Event Description */}
                    <div>
                      <p className="text-gray-500">Descrição:</p>
                      <p className="text-gray-700">
                        {form.watch("description")}
                      </p>
                    </div>

                    <Separator className="my-4" />

                    {/* Days & Batches */}
                    <ScrollArea className="h-[300px] border rounded-md p-4">
                      <h3 className="text-lg font-semibold">Programação</h3>
                      <div className="space-y-4 mt-2">
                        {form.watch("days")?.map((day, dayIndex) => (
                          <div key={dayIndex} className="mb-10">
                            <div className="flex items-center gap-2 mb-1">
                              <CalendarDays className="w-5 h-5 text-secondary" />
                              <h2 className="text-xl font-bold text-secondary">
                                Dia {dayIndex + 1}
                              </h2>
                            </div>
                            <p className="text-sm text-gray-600 mb-4 flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {day.date
                                ? `${formatDate(
                                    day.date
                                  )} | ${getFormattedDateTime(
                                    day.date,
                                    day.startTime
                                  )} - ${getFormattedDateTime(
                                    day.date,
                                    day.endTime
                                  )}`
                                : "Data não definida"}
                            </p>

                            <div className="space-y-6">
                              {day.batches.map((batch, batchIdx) => (
                                <div
                                  key={batchIdx}
                                  className="border border-gray-200 rounded-xl p-4 shadow-sm bg-white">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Layers className="w-5 h-5 text-primary" />
                                    <p className="text-lg font-medium text-gray-800">
                                      Lote: {batch.name || "Sem nome"}
                                    </p>
                                  </div>

                                  <p className="text-sm text-gray-500 flex items-center gap-1 mb-3">
                                    <Clock className="w-4 h-4" />
                                    {getFormattedDateTime(
                                      day.date,
                                      batch.startTime
                                    )}{" "}
                                    -{" "}
                                    {getFormattedDateTime(
                                      day.date,
                                      batch.endTime
                                    )}
                                  </p>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {batch.tickets.map((ticket, ticketIdx) => {
                                      const sector = ticketSectors.find(
                                        (sector) =>
                                          sector.id === ticket.sectorId
                                      );
                                      const sectorName = sector?.name || "N/A";

                                      return (
                                        <div
                                          key={ticketIdx}
                                          className="border border-dashed rounded-md space-y-1 p-3 bg-gray-50">
                                          <div className="flex items-center gap-2 mb-1">
                                            <Ticket className="w-4 h-4 text-secondary" />
                                            <span className="text-sm font-medium text-gray-700">
                                              Ingresso {ticketIdx + 1}
                                            </span>
                                          </div>

                                          <p className="text-sm flex items-center gap-1">
                                            <Hash className="w-4 h-4 text-gray-500" />
                                            Setor: {sectorName}
                                          </p>
                                          <p className="text-sm flex items-center gap-1">
                                            <Tag className="w-4 h-4 text-gray-500" />
                                            Preço:{" "}
                                            {formatCurrencyFromCents(
                                              ticket.price
                                            )}
                                          </p>
                                          <p className="text-sm flex items-center gap-1">
                                            <Layers className="w-4 h-4 text-gray-500" />
                                            Quantidade: {ticket.quantity}
                                          </p>
                                          <p className="text-sm flex items-center gap-1">
                                            <User className="w-4 h-4 text-gray-500" />
                                            Gênero:{" "}
                                            {ticket.gender === "MALE"
                                              ? "Masculino"
                                              : ticket.gender === "FEMALE"
                                              ? "Feminino"
                                              : "Unisex"}
                                          </p>
                                          {ticket.obs && (
                                            <p className="text-sm flex items-center gap-1 italic text-gray-500">
                                              <Info className="w-4 h-4" />
                                              Obs: {ticket.obs}
                                            </p>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    <Button
                      className="w-full mt-5"
                      disabled={isLoading}
                      isLoading={isLoading}
                      loadingLabel="Criando">
                      Criar Evento
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </Form>
      </div>
      <div className="relative">
        <Button
          type="button"
          className="sticky right-0 top-1/2 transform -translate-y-1/2 pointer-events-auto z-50"
          onClick={handleNextStep}
          disabled={step === totalSteps}>
          <CircleArrowRight />
        </Button>
      </div>
    </div>
  );
};

const BatchesFieldArray = ({
  control,
  dayIndex,
  ticketSectors,
}: {
  control: Control<FormData>;
  dayIndex: number;
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

  const { getValues } = useFormContext(); // <-- Get form values to access endDate dynamically

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

// Component for Managing Tickets Inside Each Batch
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
                            onChange(file);
                          }
                        }}
                        style={{ display: "none" }}
                        id={`file-input-${dayIndex}-${batchIndex}-${ticketIndex}`}
                      />

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
                        Anexar Arquivo
                      </Button>

                      {value instanceof File && (
                        <span className="w-80 h-8 text-sm text-secondary truncate border border-secondary rounded-md p-1">
                          {value.name}
                        </span>
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
