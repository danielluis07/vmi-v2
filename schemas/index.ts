import { z } from "zod";
// import { createInsertSchema } from "drizzle-zod";
// import { user } from "@/db/schema";

// Base schemas

// const baseUserSchema = createInsertSchema(user);

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
