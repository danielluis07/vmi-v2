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

export const updateUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  cpfCnpj: z.string().optional(),
  phone: z.string().optional(),
});

export const updatePasswordSchema = z
  .object({
    password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
    repeat_password: z
      .string()
      .min(8, "A senha deve ter pelo menos 8 caracteres"),
  })
  .refine((data) => data.password === data.repeat_password, {
    message: "As senhas não coincidem",
    path: ["repeat_password"],
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
      id: z.string().optional(),
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

// Producer event schemas

// create

export const baseProducerEventSchema = z.object({
  title: z.string().min(1, "O título é obrigatório"),
  description: z.string().min(1, "A descrição é obrigatória"),
  categoryId: z.string().min(1, "A Categoria é obrigatória"),
  mode: z.string().min(1, "O tipo é obrigatório"),
  address: z.string(),
  province: z.string(),
  city: z.string(),
  uf: z.string(),
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

const onlineProducerEventSchema = baseProducerEventSchema.extend({
  mode: z.literal("IN_PERSON"),
  address: z.string().min(1, "O endereço é obrigatório"),
  province: z.string().min(1, "A província é obrigatória"),
  city: z.string().min(1, "A cidade é obrigatória"),
  uf: z.string().min(1, "O UF é obrigatório"),
});

const inPersonProducerEventSchema = baseProducerEventSchema.extend({
  mode: z.literal("ONLINE"),
  address: z.string().optional(),
  province: z.string().optional(),
  city: z.string().optional(),
  uf: z.string().optional(),
});

export const createProducerEventSchema = z.discriminatedUnion("mode", [
  onlineProducerEventSchema,
  inPersonProducerEventSchema,
]);

// update

export const baseUpdateProducerEventSchema = z.object({
  id: z.string().min(1, "O ID do evento é obrigatório"),
  title: z.string().min(1, "O título é obrigatório"),
  description: z.string().min(1, "A descrição é obrigatória"),
  categoryId: z.string().min(1, "A Categoria é obrigatória"),
  mode: z.string().min(1, "O tipo é obrigatório"),
  address: z.string(),
  province: z.string(),
  city: z.string(),
  uf: z.string(),
  status: z.enum(["ACTIVE", "INACTIVE", "ENDED"]),
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

const updateOnlineProducerEventSchema = baseUpdateProducerEventSchema.extend({
  mode: z.literal("IN_PERSON"),
  address: z.string().min(1, "O endereço é obrigatório"),
  province: z.string().min(1, "A província é obrigatória"),
  city: z.string().min(1, "A cidade é obrigatória"),
  uf: z.string().min(1, "O UF é obrigatório"),
});

const updateInPersonProducerEventSchema = baseUpdateProducerEventSchema.extend({
  mode: z.literal("ONLINE"),
  address: z.string().optional(),
  province: z.string().optional(),
  city: z.string().optional(),
  uf: z.string().optional(),
});

export const updateProducerEventSchema = z.discriminatedUnion("mode", [
  updateOnlineProducerEventSchema,
  updateInPersonProducerEventSchema,
]);

// User event schemas

// create

export const baseUserEventSchema = z.object({
  title: z.string().min(1, "O título é obrigatório"),
  description: z.string().min(1, "A descrição é obrigatória"),
  categoryId: z.string().min(1, "A Categoria é obrigatória"),
  mode: z.string().min(1, "O tipo é obrigatório"),
  address: z.string(),
  province: z.string(),
  city: z.string(),
  uf: z.string(),
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
  image: z.union([
    z.instanceof(File).refine((file) => file instanceof File, {
      message: "A imagem do evento é obrigatória",
    }),
    z.string().url(),
  ]),
  ticket: z.object({
    id: z.string().optional(),
    sectorId: z.string().min(1, "O setor é obrigatório"),
    price: z.number().min(1, "O preço é obrigatório"),
    quantity: z.number().min(1, "A quantidade é obrigatória"),
    gender: z.string().min(1, "O gênero é obrigatório"),
    obs: z.string().optional(),
    isNominal: z.boolean(),
    file: z.union([z.instanceof(File), z.string().url()]),
  }),
});

const onlineUserEventSchema = baseUserEventSchema.extend({
  mode: z.literal("IN_PERSON"),
  address: z.string().min(1, "O endereço é obrigatório"),
  province: z.string().min(1, "A província é obrigatória"),
  city: z.string().min(1, "A cidade é obrigatória"),
  uf: z.string().min(1, "O UF é obrigatório"),
});

const inPersonUserEventSchema = baseUserEventSchema.extend({
  mode: z.literal("ONLINE"),
  address: z.string().optional(),
  province: z.string().optional(),
  city: z.string().optional(),
  uf: z.string().optional(),
});

export const createUserEventSchema = z.discriminatedUnion("mode", [
  onlineUserEventSchema,
  inPersonUserEventSchema,
]);

// update

export const baseUpdateUserEventSchema = z.object({
  id: z.string().min(1, "O ID do evento é obrigatório"),
  title: z.string().min(1, "O título é obrigatório"),
  description: z.string().min(1, "A descrição é obrigatória"),
  categoryId: z.string().min(1, "A Categoria é obrigatória"),
  mode: z.string().min(1, "O tipo é obrigatório"),
  address: z.string(),
  status: z.enum(["ACTIVE", "INACTIVE", "ENDED"]),
  province: z.string(),
  city: z.string(),
  uf: z.string(),
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
  image: z.union([
    z.instanceof(File).refine((file) => file instanceof File, {
      message: "A imagem do evento é obrigatória",
    }),
    z.string().url(),
  ]),
  ticket: z.object({
    id: z.string().optional(),
    sectorId: z.string().min(1, "O setor é obrigatório"),
    price: z.number().min(1, "O preço é obrigatório"),
    quantity: z.number().min(1, "A quantidade é obrigatória"),
    gender: z.string().min(1, "O gênero é obrigatório"),
    obs: z.string().optional(),
    isNominal: z.boolean(),
    file: z.union([z.instanceof(File), z.string().url()]),
  }),
});

const updateOnlineUserEventSchema = baseUpdateUserEventSchema.extend({
  mode: z.literal("IN_PERSON"),
  address: z.string().min(1, "O endereço é obrigatório"),
  province: z.string().min(1, "A província é obrigatória"),
  city: z.string().min(1, "A cidade é obrigatória"),
  uf: z.string().min(1, "O UF é obrigatório"),
});

const updateInPersonUserEventSchema = baseUpdateUserEventSchema.extend({
  mode: z.literal("ONLINE"),
  address: z.string().optional(),
  province: z.string().optional(),
  city: z.string().optional(),
  uf: z.string().optional(),
});

export const updateUserEventSchema = z.discriminatedUnion("mode", [
  updateOnlineUserEventSchema,
  updateInPersonUserEventSchema,
]);
