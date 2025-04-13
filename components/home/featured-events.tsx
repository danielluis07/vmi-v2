"use client";

import { useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const FeaturedEvents = ({
  value,
  isLoading,
  data,
}: {
  value?: string | null;
  isLoading?: boolean;
  data: Array<{
    id: string;
    image: string;
    title: string;
    date: string;
    mode: string;
    city: string;
    uf: string;
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
          sectorId: string;
          price: number;
          quantity: number;
          gender: string;
          file: string;
          obs: string | null;
        }>;
      }>;
    }>;
  }>;
}) => {
  const [imageLoading, setImageLoading] = useState<Record<string, boolean>>({});

  const handleImageLoad = (id: string) => {
    setImageLoading((prev) => {
      if (prev[id] === false) return prev;
      return {
        ...prev,
        [id]: false,
      };
    });
  };

  return (
    <div className="w-full mt-8">
      <h2 className="text-3xl font-bold pl-12 text-primary">Destaques</h2>
      <div className="relative w-full mt-3">
        <Carousel
          opts={{ align: "start", dragFree: true }}
          className="w-full px-12 py-2">
          <CarouselContent className="-ml-3 py-2">
            {isLoading &&
              Array.from({ length: 6 }).map((_, index) => (
                <CarouselItem key={index} className="pl-3 basis-auto">
                  <Skeleton className="rounded-lg h-[300px] w-[350px]" />
                </CarouselItem>
              ))}
            {!isLoading &&
              data.map((event) => {
                let formattedDate = "";

                if (event.days && event.days.length > 0) {
                  const validDays = event.days.filter((d) => d?.date);

                  if (validDays.length > 0) {
                    const firstDay = validDays[0];
                    const lastDay = validDays[validDays.length - 1];

                    const startDate = format(new Date(firstDay.date), "dd/MM");
                    const endDate = format(new Date(lastDay.date), "dd/MM");

                    formattedDate =
                      startDate === endDate
                        ? startDate
                        : `${startDate} - ${endDate}`;
                  } else {
                    // fallback se não tiver data válida
                    formattedDate = "Data a definir";
                  }
                } else {
                  formattedDate = format(
                    new Date(event.date),
                    "dd 'de' MMMM 'às' HH:mm'h'",
                    { locale: ptBR }
                  );
                }

                const location =
                  event.mode === "ONLINE"
                    ? "Online"
                    : `${event.city}, ${event.uf}`;

                return (
                  <CarouselItem key={event.id} className="pl-3 basis-auto">
                    <Card className="overflow-hidden shadow-md cursor-pointer hover:shadow-xl transition-shadow duration-200 pt-0 h-[300px] w-[350px] flex flex-col">
                      <div className="relative w-full h-44 shrink-0">
                        <Image
                          src={event.image}
                          alt={event.title}
                          fill
                          className={cn(
                            imageLoading[event.id] === false
                              ? "opacity-100"
                              : "opacity-0",
                            "object-cover transition-opacity duration-300"
                          )}
                          loading="lazy"
                          onLoad={() => handleImageLoad(event.id)}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIyNSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjFmMWYxIi8+PC9zdmc+"
                        />
                      </div>
                      <CardContent className="px-3 flex flex-col justify-between">
                        <h3 className="text-lg leading-4 font-semibold line-clamp-2 min-h-[30px]">
                          {event.title}
                        </h3>

                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-muted-foreground gap-1">
                            <Calendar size={16} className="mr-1 text-primary" />
                            {formattedDate}
                          </div>

                          <div className="flex items-center text-sm text-muted-foreground gap-1">
                            <MapPin size={16} className="mr-1 text-secondary" />
                            {location}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                );
              })}
          </CarouselContent>
          <CarouselPrevious className="left-0 z-20 hidden sm:flex" />
          <CarouselNext className="right-0 z-20 hidden sm:flex" />
        </Carousel>
      </div>
    </div>
  );
};
