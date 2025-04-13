"use client";

import { z } from "zod";
import { useEffect, useState } from "react";
import { createUserEventSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldErrors, useFieldArray, useForm } from "react-hook-form";
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
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { uploadFile } from "@/actions/upload-file";
import { FileInput, FileUploader } from "@/components/ui/file-uploader";
import { DropzoneOptions } from "react-dropzone";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";

type FormData = z.infer<typeof createUserEventSchema>;

export const CreateUserEventForm = () => {
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
    resolver: zodResolver(createUserEventSchema),
    defaultValues: {
      title: "",
      city: "",
      province: "",
      address: "",
      uf: "",
      description: "",
      categoryId: "",
      mode: "IN_PERSON",
      date: undefined,
      image: undefined,
      ticket: {
        sectorId: "",
        price: 0,
        quantity: 1,
        gender: "MALE",
        isNominal: false,
        file: undefined,
        obs: "",
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

  const create = trpc.events.createUserEvent.useMutation({
    onSuccess: () => {
      utils.events.getMany.refetch();
      toast.success("Evento criado com sucesso!");
      setIsLoading(false);
      router.push("/user/events");
    },
    onError: (error) => {
      toast.error("Erro ao criar evento");
      console.error(error.message);
    },
  });

  const totalSteps = 4;

  type TicketFieldPaths = "ticket.sectorId" | "ticket.price" | "ticket.file";

  const requiredTicketFields: TicketFieldPaths[] = [
    "ticket.sectorId",
    "ticket.price",
    "ticket.file",
  ];

  const sector = ticketSectors.find(
    (sector) => sector.id === form.watch("ticket.sectorId")
  );
  const sectorName = sector?.name || "N/A";

  const handleNextStep = async () => {
    let fieldsToValidate: TicketFieldPaths[] | (keyof FormData)[] = [];
    const mode = form.watch("mode");

    const shouldSkipStep2 = mode !== "IN_PERSON";
    const nextStep = step === 1 && shouldSkipStep2 ? 3 : step + 1;

    switch (step) {
      case 1:
        fieldsToValidate = [
          "title",
          "categoryId",
          "mode",
          "description",
          "date",
        ];
        break;
      case 2:
        if (mode === "IN_PERSON") {
          fieldsToValidate = ["city", "province", "address", "uf"];
        }
        break;
      case 3:
        fieldsToValidate = requiredTicketFields;
        break;
    }

    const isStepValid = await form.trigger(fieldsToValidate);

    if (isStepValid && step < totalSteps) {
      setStep(nextStep);
    } else {
      if (step === 3 && form.formState.errors.ticket) {
        toast.error("Preencha todas as informações do ingresso.");
      } else {
        toast.error("Preencha todos os campos obrigatórios antes de avançar.");
      }
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
      create.mutate(values);
    } catch (error) {
      toast.error("Erro ao fazer upload dos arquivos");
      console.error(error);
    }
  };

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
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="ticket.sectorId"
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
                              placeholder="R$ 0,00"
                              onChange={(e) => {
                                const rawValue = e.target.value.replace(
                                  /\D/g,
                                  ""
                                );
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

                    <FormField
                      control={form.control}
                      name="ticket.quantity"
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

                    <FormField
                      control={form.control}
                      name="ticket.gender"
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
                      control={form.control}
                      name="ticket.file"
                      render={({ field: { onChange, ref, value } }) => (
                        <FormItem className="w-full">
                          <FormLabel>Ingresso</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-2">
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
                                id="file-input"
                              />

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
                                Anexar Arquivo
                              </Button>

                              {value instanceof File && (
                                <span className="w-[222px] h-8 text-sm text-secondary truncate border border-secondary rounded-md p-1">
                                  {value.name}
                                </span>
                              )}
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}>
                  <div className="p-6">
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

                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-gray-500">Data:</p>
                      <p className="font-medium">
                        {format(
                          new Date(form.watch("date")),
                          "dd/MM/yyyy 'às' HH:mm"
                        )}
                      </p>
                    </div>

                    <Separator className="my-4" />

                    <div>
                      <p className="text-gray-500">Descrição:</p>
                      <p className="text-gray-700">
                        {form.watch("description")}
                      </p>
                    </div>

                    <Separator className="my-4" />

                    <div className="border border-dashed rounded-md space-y-1 p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Ticket className="w-4 h-4 text-secondary" />
                        <span className="text-sm font-medium text-gray-700">
                          Ingresso
                        </span>
                      </div>

                      <p className="text-sm flex items-center gap-1">
                        <Hash className="w-4 h-4 text-gray-500" />
                        Setor: {sectorName}
                      </p>
                      <p className="text-sm flex items-center gap-1">
                        <Tag className="w-4 h-4 text-gray-500" />
                        Preço:{" "}
                        {formatCurrencyFromCents(form.watch("ticket.price"))}
                      </p>
                      <p className="text-sm flex items-center gap-1">
                        <Layers className="w-4 h-4 text-gray-500" />
                        Quantidade: {form.watch("ticket.quantity")}
                      </p>
                      <p className="text-sm flex items-center gap-1">
                        <User className="w-4 h-4 text-gray-500" />
                        Gênero:{" "}
                        {form.watch("ticket.gender") === "MALE"
                          ? "Masculino"
                          : form.watch("ticket.gender") === "FEMALE"
                          ? "Feminino"
                          : "Unisex"}
                      </p>
                      {form.watch("ticket.obs") && (
                        <p className="text-sm flex items-center gap-1 italic text-gray-500">
                          <Info className="w-4 h-4" />
                          Obs: {form.watch("ticket.obs")}
                        </p>
                      )}
                    </div>

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
