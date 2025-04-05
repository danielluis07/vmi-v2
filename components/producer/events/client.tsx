"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { Calendar, Globe, MapPin, PlusCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export const EventsClient = () => {
  const [imageLoading, setImageLoading] = useState<Record<string, boolean>>({});
  const [producerEvents] = trpc.producerEvents.getMany.useSuspenseQuery();

  const handleImageLoad = (id: string) => {
    setImageLoading((prev) => ({
      ...prev,
      [id]: false,
    }));
  };

  return (
    <div className="w-full">
      <div
        className={cn(
          producerEvents.length > 0 && "flex justify-between items-center",
          "mb-6"
        )}>
        <h1 className="text-3xl font-bold text-secondary">Meus Eventos</h1>

        {producerEvents.length > 0 && (
          <Link href="/events/create" className="inline-flex items-center">
            <Button>
              <PlusCircle className="size-5" />
              <span>Criar Evento</span>
            </Button>
          </Link>
        )}
      </div>
      {producerEvents.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {producerEvents.map((event) => (
            <Link href={`/producer/events/${event.id}`} key={event.id}>
              <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="relative w-full pt-[56.25%]">
                  {imageLoading[event.id] !== false && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-gray-300 border-t-primary rounded-full animate-spin"></div>
                    </div>
                  )}
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
                <CardHeader>
                  <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm line-clamp-3">{event.description}</p>
                </CardContent>
                <CardFooter>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    {event.mode === "ONLINE" ? (
                      <Globe className="h-4 w-4 mr-1" />
                    ) : (
                      <MapPin className="h-4 w-4 mr-1" />
                    )}
                    <span>
                      {event.mode === "ONLINE"
                        ? "Online"
                        : event.city || "In Person"}
                    </span>
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {producerEvents.length === 0 && (
        <div className="flex flex-col items-center justify-center h-[400px]">
          <Calendar className="size-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100">
            Nenhum evento encontrado
          </h3>

          <Link href="/events/create" className="mt-6">
            <Button>
              <PlusCircle className="size-5" />
              <span>Crie seu primeiro evento</span>
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};
