import { z } from "zod";

// Base schemas

// const baseSchema...

// Custom schemas

export const signUpSchema = z
  .object({
    name: z.string(),
    email: z.string(),
    role: z.string().min(1, "Campo obrigatório"),
    cpfCnpj: z.string().min(11, "Campo obrigatório"),
    password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
    repeat_password: z
      .string()
      .min(6, "A senha deve ter pelo menos 8 caracteres"),
  })
  .refine((data) => data.password === data.repeat_password, {
    message: "As senhas não coincidem",
    path: ["repeat_password"],
  });

export const signInSchema = z.object({
  email: z.string(),
  password: z.string().nonempty("Campo obrigatório"),
});

export const batchesSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório"),
  startTime: z.preprocess(
    (val) => {
      if (typeof val === "string" || val instanceof Date) {
        return new Date(val);
      }
      return undefined;
    },
    z.date({
      required_error: "O horário de início é obrigatório",
      invalid_type_error: "Horário de início inválido",
    })
  ),
  endTime: z.preprocess(
    (val) => {
      if (typeof val === "string" || val instanceof Date) {
        return new Date(val);
      }
      return undefined;
    },
    z.date({
      required_error: "O horário de término é obrigatório",
      invalid_type_error: "Horário de término inválido",
    })
  ),
  tickets: z.array(
    z.object({
      sectorId: z.string().min(1, "O setor é obrigatório"),
      price: z.number().min(0, "O preço é obrigatório"),
      quantity: z.number().min(1, "A quantidade é obrigatória"),
      gender: z.string().min(1, "O gênero é obrigatório"),
      obs: z.string().optional(),
      isNominal: z.boolean().optional(),
      file: z.union([z.instanceof(File), z.string().url()]).optional(),
    })
  ),
});

export const createProducerEventSchema = z.object({
  title: z.string().min(1, "O título é obrigatório"),
  description: z.string().min(1, "A descrição é obrigatória"),
  address: z.string().min(1, "O Endereço é obrigatório"),
  province: z.string().min(1, "O Bairro é obrigatório"),
  categoryId: z.string().min(1, "A Categoria é obrigatória"),
  mode: z.string().min(1, "O tipo é obrigatório"),
  city: z.string().min(1, "A Cidade é obrigatória"),
  uf: z.string().min(1, "O estado é obrigatório"),
  image: z.union([
    z.instanceof(File).refine((file) => file instanceof File, {
      message: "A imagem do evento é obrigatória",
    }),
    z.string().url(),
  ]),
  map: z.union([z.instanceof(File), z.string().url(), z.null()]).optional(),
  days: z.array(
    z.object({
      batches: z.array(batchesSchema),
      date: z.preprocess(
        (val) => {
          if (typeof val === "string" || val instanceof Date) {
            return new Date(val);
          }
          return undefined;
        },
        z.date({
          required_error: "A data é obrigatória",
          invalid_type_error: "Data inválida",
        })
      ),
      startTime: z.preprocess(
        (val) => {
          if (typeof val === "string" || val instanceof Date) {
            return new Date(val);
          }
          return undefined;
        },
        z.date({
          required_error: "O horário de início é obrigatório",
          invalid_type_error: "Horário de início inválido",
        })
      ),
      endTime: z.preprocess(
        (val) => {
          if (typeof val === "string" || val instanceof Date) {
            return new Date(val);
          }
          return undefined;
        },
        z.date({
          required_error: "O horário de término é obrigatório",
          invalid_type_error: "Horário de término inválido",
        })
      ),
    })
  ),
});

export const updateProducerEventSchema = createProducerEventSchema.extend({
  id: z.string().min(1, "O ID do evento é obrigatório"),
});
