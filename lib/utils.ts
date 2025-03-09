import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrencyFromCents = (amount: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount / 100);
};

export const formatCurrency = (value: string | number) => {
  if (!value) return "";
  const numericValue = Number(value) / 100;
  return numericValue.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

export const formatPhoneNumber = (value: string) => {
  const digits = value.replace(/\D/g, "");

  let formattedNumber = "";

  if (digits.length > 2) {
    formattedNumber += `(${digits.slice(0, 2)}) `;
  } else {
    formattedNumber += digits;
  }

  if (digits.length > 7) {
    formattedNumber += digits.slice(2, 7) + "-" + digits.slice(7, 11);
  } else if (digits.length > 2) {
    formattedNumber += digits.slice(2, 7);
  }

  return formattedNumber;
};

export const removeFormatting = (value: string) => {
  return value.replace(/\D/g, "");
};

export const formatCpf = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

export const formatCnpj = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  return digits
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,4})/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
};

export const formatPostalCode = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return digits.replace(/(\d{5})(\d{1,3})/, "$1-$2");
};
