"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { useConfirm } from "@/providers/confirm-provider";
import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { Calendar, Globe, MapPin, PlusCircle, Trash2 } from "lucide-react";
import Image from "next/image";
import { useMultiStepFormStore } from "@/stores/use-multi-step-form";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const ProducerEventsClient = () => {
  const [imageLoading, setImageLoading] = useState<Record<string, boolean>>({});
  const [events] = trpc.events.getMany.useSuspenseQuery();
  const utils = trpc.useUtils();
  const deleteEvent = trpc.events.deleteProducerEvent.useMutation({
    onSuccess: () => {
      utils.events.getMany.invalidate();
      toast.success("Evento excluído com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { step, setStep, image, setImage } = useMultiStepFormStore();

  const { confirm, closeConfirm, setPending } = useConfirm();

  const handleImageLoad = (id: string) => {
    setImageLoading((prev) => {
      if (prev[id] === false) return prev;
      return {
        ...prev,
        [id]: false,
      };
    });
  };

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

  useEffect(() => {
    if (step !== 1 || image !== null) {
      if (step !== 1) setStep(1);
      if (image !== null) setImage(null);
    }
  }, [step, image]);

  return (
    <div className="w-full">
      <div
        className={cn(
          events.length > 0 && "flex justify-between items-center",
          "mb-6"
        )}>
        <h1 className="text-3xl font-bold text-secondary">Meus Eventos</h1>

        {events.length > 0 && (
          <Link
            href="/producer/events/new"
            className="inline-flex items-center">
            <Button>
              <PlusCircle className="size-5" />
              <span>Criar Evento</span>
            </Button>
          </Link>
        )}
      </div>
      {events.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {events.map((event) => (
            <Link href={`/producer/events/${event.id}`} key={event.id}>
              <Card className="h-[360px] overflow-hidden hover:shadow-lg transition-shadow duration-300 pt-0 group">
                <div className="relative w-full pt-[56.25%]">
                  {imageLoading[event.id] !== false && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="size-8 border-4 border-gray-300 border-t-primary rounded-full animate-spin"></div>
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
                  <button
                    type="button"
                    className="hidden absolute top-2 right-2 p-1 bg-gray-800 bg-opacity-50 rounded-full cursor-pointer group-hover:flex"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleDelete(event.id);
                    }}>
                    <Trash2 className="size-5 text-white hover:text-destructive" />
                    <span className="sr-only">Excluir evento</span>
                  </button>
                </div>
                <CardContent className="flex flex-col justify-between flex-1 space-y-2">
                  <CardTitle className="line-clamp-2 pb-1">
                    {event.title}
                  </CardTitle>
                  <p className="text-sm line-clamp-3 min-h-[32px]">
                    {event.description}
                  </p>
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
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {events.length === 0 && (
        <div className="flex flex-col items-center justify-center h-[400px]">
          <Calendar className="size-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100">
            Nenhum evento encontrado
          </h3>

          <Link href="/producer/events/new" className="mt-6">
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
