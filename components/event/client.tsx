"use client";

import Image from "next/image";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, MapPin, Video } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import Link from "next/link";

import { Tag, DollarSign, Info, User } from "lucide-react";

type Data = {
  id: string;
  title: string;
  description: string;
  image: string;
  creatorRole: "USER" | "PRODUCER";
  date: Date;
  mode: "IN_PERSON" | "ONLINE";
  city?: string;
  uf?: string;
  address?: string;
  province?: string;
  ticket: {
    price: number;
    quantity: number;
  };
  days?: Array<{
    date: string;
    startTime: string;
    endTime: string;
    batches: Array<{
      id: string;
      name: string;
      startTime: string;
      endTime: string;
      tickets: Array<{
        sector: string;
        price: number;
        quantity: number;
        gender: string;
        file: string;
        obs: string | null;
      }>;
    }>;
  }>;
};

const formatDate = (date: Date) => {
  try {
    return format(date, "PPPPp", { locale: ptBR });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Data inválida";
  }
};

const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const EventClient = ({ data }: { data: Data }) => {
  const dateObject =
    typeof data.date === "string" ? new Date(data.date) : data.date;
  const formattedDate = formatDate(dateObject);

  const formattedPrice = formatCurrency(data.ticket.price);
  const locationString =
    data.mode === "IN_PERSON"
      ? [data.address, data.city, data.uf].filter(Boolean).join(", ")
      : "Evento Online";

  return (
    <div className="w-full">
      <div className="relative w-full h-64 md:h-96 lg:h-[500px]">
        <Image
          src={data.image}
          alt={data.title}
          fill
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 1200px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black opacity-30"></div>
      </div>
      <Card className="max-w-4xl mx-auto -mt-16 md:-mt-24 relative z-10 rounded-none border-b-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1),0_-2px_4px_-2px_rgba(0,0,0,0.1)]">
        <CardHeader>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-secondary">
            {data.title}
          </h1>
        </CardHeader>

        <CardContent className="pt-5">
          <div className="flex flex-col md:flex-row md:justify-between md:px-2 gap-6 mb-6">
            <div className="flex items-start space-x-3 text-gray-700">
              <CalendarDays
                className="w-5 h-5 text-primary mt-1 flex-shrink-0"
                strokeWidth={1.5}
              />{" "}
              <div>
                <p className="font-semibold text-gray-800">Data e Hora</p>
                <p className="text-sm">{formattedDate}</p>{" "}
              </div>
            </div>
            <div className="flex items-start space-x-3 text-gray-700">
              {data.mode === "IN_PERSON" ? (
                <MapPin
                  className="w-5 h-5 text-primary mt-1 flex-shrink-0"
                  strokeWidth={1.5}
                />
              ) : (
                <Video
                  className="w-5 h-5 text-primary mt-1 flex-shrink-0"
                  strokeWidth={1.5}
                />
              )}
              <div>
                <p className="font-semibold text-gray-800">
                  {data.mode === "IN_PERSON" ? "Localização" : "Modo"}
                </p>
                <p className="text-sm">{locationString}</p>
                {data.mode === "IN_PERSON" && data.address && (
                  <Link
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      locationString
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm transition duration-150 ease-in-out font-medium" // Match link style
                  >
                    Ver no mapa
                  </Link>
                )}
              </div>
            </div>
            <div className="flex items-center text-gray-700">
              <div className="flex flex-col items-start space-y-2">
                {data.creatorRole === "USER" ? (
                  <div className="flex items-center gap-x-3">
                    <span className="text-3xl font-bold">{formattedPrice}</span>
                    <Input min={1} type="number" className="w-20 text-center" />
                  </div>
                ) : (
                  <div className="flex items-center gap-x-3">
                    <span className="text-3xl font-bold">{formattedPrice}</span>
                  </div>
                )}
                <Button className="w-full">Comprar</Button>
              </div>
            </div>
          </div>
          <Separator className="my-6" />
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-secondary mb-4">
              Sobre este evento
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700">
              <p>{data.description}</p>
            </div>
          </div>
          {data.days && data.days.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-semibold text-secondary">
                Ingressos
              </h2>

              <Separator className="my-6" />

              <div className="space-y-10">
                {data.days.map((day, index) => (
                  <div key={index}>
                    <div className="mb-4">
                      <p className="text-xl font-bold text-primary">
                        {capitalizeFirstLetter(
                          format(new Date(day.date), "EEEE, dd 'de' MMMM", {
                            locale: ptBR,
                          })
                        )}
                      </p>
                      <p className="text-sm text-gray-600">
                        Das {format(new Date(day.startTime), "HH:mm")} às{" "}
                        {format(new Date(day.endTime), "HH:mm")}
                      </p>
                    </div>

                    <div className="space-y-6">
                      {day.batches.map((batch, batchIndex) => (
                        <div
                          key={batch.id + batchIndex}
                          className="border border-dashed rounded-lg p-4 bg-slate-50">
                          <p className="text-lg font-medium text-secondary mb-2">
                            {batch.name}
                          </p>

                          <div className="grid md:grid-cols-2 gap-4">
                            {batch.tickets.map((ticket, i) => (
                              <div
                                key={i}
                                className="flex flex-col md:flex-row md:items-center justify-between border p-4 rounded-lg bg-white shadow-sm space-y-3 md:space-y-0">
                                <div className="w-full md:w-11/12 md:pr-5 space-y-2">
                                  <div className="flex items-center gap-2 text-sm text-gray-800">
                                    <User className="w-4 h-4 text-primary" />
                                    <p>
                                      <span className="font-semibold">
                                        Gênero:{" "}
                                      </span>
                                      {ticket.gender === "FEMALE"
                                        ? "Feminino"
                                        : "Masculino"}
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-2 text-sm text-gray-700">
                                    <Tag className="w-4 h-4 text-primary" />
                                    <p>
                                      <span className="font-semibold">
                                        Setor:{" "}
                                      </span>{" "}
                                      {ticket.sector}
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-2 text-sm text-gray-700">
                                    <DollarSign className="w-4 h-4 text-primary" />
                                    <p>
                                      <span className="font-semibold">
                                        Preço: {""}
                                      </span>
                                      {formatCurrency(ticket.price)}
                                    </p>
                                  </div>

                                  {ticket.obs && (
                                    <div className="flex items-start gap-2 text-sm text-gray-600 italic pt-1">
                                      <Info className="w-4 h-4 mt-0.5 text-secondary flex-shrink-0" />
                                      <span className="break-words">
                                        {ticket.obs}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                <Input
                                  type="number"
                                  min={1}
                                  value={1}
                                  onChange={(e) => {}}
                                  max={ticket.quantity}
                                  className="w-full md:w-20 text-center"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
