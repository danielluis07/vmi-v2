"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { motion, useInView } from "motion/react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, MapPin } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

const events = [
  {
    id: "1",
    title: "Festival de Música",
    description: "Um festival inesquecível com grandes atrações.",
    image:
      "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    status: "ACTIVE",
    date: "2025-04-27T16:20:00+00:00",
    mode: "IN_PERSON",
    city: "Florianópolis",
    uf: "SC",
    slug: "festival-de-musica",
  },
  {
    id: "2",
    title: "Workshop de Fotografia",
    description: "Aprenda com os melhores profissionais da área.",
    image:
      "https://images.unsplash.com/photo-1603425013520-e0b30e6e37dc?q=80&w=1742&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    status: "ACTIVE",
    date: "2025-05-12T19:00:00+00:00",
    mode: "ONLINE",
    slug: "workshop-de-fotografia",
  },
  {
    id: "3",
    title: "Campeonato de League of Legends",
    description: "Competição de eSports com prêmios incríveis.",
    image:
      "https://images.unsplash.com/photo-1580617971627-cffa74e39d1d?q=80&w=1853&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    status: "INACTIVE",
    date: "2025-05-30T14:00:00+00:00",
    mode: "IN_PERSON",
    city: "Joinville",
    uf: "SC",
    slug: "campeonato-de-league-of-legends",
  },
  {
    id: "4",
    title: "Workshop de Desenvolvimento Web",
    description: "Aprenda a criar sites e aplicações web.",
    image:
      "https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=1631&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    status: "ACTIVE",
    date: "2025-06-02T09:00:00+00:00",
    mode: "IN_PERSON",
    city: "Curitiba",
    uf: "PR",
    slug: "workshop-de-desenvolvimento-web",
  },
  {
    id: "5",
    title: "Palestra de Marketing Digital",
    description: "Aprenda as melhores estratégias de marketing.",
    image:
      "https://images.unsplash.com/photo-1559223694-98ed5e272fef?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    status: "ACTIVE",
    date: "2025-06-18T10:30:00+00:00",
    mode: "ONLINE",
    slug: "palestra-de-marketing-digital",
  },
  {
    id: "6",
    title: "Show de Rock Independente",
    description: "Uma noite de rock com bandas independentes.",
    image:
      "https://images.unsplash.com/photo-1521337581100-8ca9a73a5f79?q=80&w=1677&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    status: "ACTIVE",
    date: "2025-07-01T15:00:00+00:00",
    mode: "IN_PERSON",
    city: "São Paulo",
    uf: "SP",
    slug: "show-de-rock-independente",
  },
  {
    id: "7",
    title: "Real Madrid vs Barcelona",
    description: "Clássico do futebol espanhol.",
    image:
      "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    status: "ACTIVE",
    date: "2025-07-15T08:00:00+00:00",
    mode: "IN_PERSON",
    city: "Porto Alegre",
    uf: "RS",
    slug: "real-madrid-vs-barcelona",
  },
  {
    id: "8",
    title: "Tomorrowland Brasil",
    description:
      "O Tomorrowland Brasil é um dos maiores e mais icônicos festivais de música eletrônica do mundo. Com sua atmosfera única e palco deslumbrante, o evento reúne DJs renomados e milhares de fãs de diferentes partes do planeta. A cada edição, o festival oferece uma experiência inesquecível, repleta de performances épicas, luzes vibrantes e uma energia contagiante, fazendo com que os participantes vivenciem uma verdadeira celebração da música eletrônica.",
    image:
      "https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf?q=80&w=1674&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    status: "ACTIVE",
    date: "2025-08-05T20:00:00+00:00",
    mode: "IN_PERSON",
    city: "Rio de Janeiro",
    uf: "RJ",
    slug: "tomorrowland-brasil",
    days: [
      {
        date: "2025-04-17T03:00:00.000Z",
        startTime: "2025-04-17T18:00:00.000Z",
        endTime: "2025-04-17T21:30:00.000Z",
        batches: [
          {
            id: "c9c5ca67-4d99-4a3f-9571-13400f23f2e2",
            name: "Lote 1",
            startTime: "2025-04-08T18:10:00.000Z",
            endTime: "2025-04-08T19:00:00.000Z",
            tickets: [
              {
                sectorId: "da87288c-574d-4239-bc25-b958a274ea09",
                price: 1000,
                quantity: 3,
                gender: "FEMALE",
                file: "https://event-tickethub-files.s3.us-east-1.amazonaws.com/5224695a5e285345d899bfb836e1464efc13fe7fab7ff6ddb68493815a51aea8",
                obs: null,
              },
            ],
          },
          {
            id: "ddab6326-67d0-41d8-a029-3e0f48231485",
            name: "Lote 1",
            startTime: "2025-04-08T23:35:03.737Z",
            endTime: "2025-04-09T01:00:03.737Z",
            tickets: [
              {
                sectorId: "7aa30869-f34f-460c-b1e7-d74f5863c6cb",
                price: 500,
                quantity: 5,
                gender: "MALE",
                file: "https://event-tickethub-files.s3.us-east-1.amazonaws.com/1f2d448171fe942a943cae88c18a5b5d61332b6330698f33f0df590494a56c1f",
                obs: "Mauris vitae quam in justo dictum sodales. In eget tortor a nunc vehicula tempor.",
              },
            ],
          },
        ],
      },
      {
        date: "2025-04-18T23:35:03.000Z",
        startTime: "2025-04-18T23:00:00.000Z",
        endTime: "2025-04-19T01:00:00.000Z",
        batches: [
          {
            id: "c9c5ca67-4d99-4a3f-9571-13400f23f2e2",
            name: "Lote 1",
            startTime: "2025-04-08T18:10:00.000Z",
            endTime: "2025-04-08T19:00:00.000Z",
            tickets: [
              {
                sectorId: "da87288c-574d-4239-bc25-b958a274ea09",
                price: 1000,
                quantity: 3,
                gender: "FEMALE",
                file: "https://event-tickethub-files.s3.us-east-1.amazonaws.com/5224695a5e285345d899bfb836e1464efc13fe7fab7ff6ddb68493815a51aea8",
                obs: null,
              },
            ],
          },
          {
            id: "ddab6326-67d0-41d8-a029-3e0f48231485",
            name: "Lote 1",
            startTime: "2025-04-08T23:35:03.737Z",
            endTime: "2025-04-09T01:00:03.737Z",
            tickets: [
              {
                sectorId: "7aa30869-f34f-460c-b1e7-d74f5863c6cb",
                price: 500,
                quantity: 5,
                gender: "MALE",
                file: "https://event-tickethub-files.s3.us-east-1.amazonaws.com/1f2d448171fe942a943cae88c18a5b5d61332b6330698f33f0df590494a56c1f",
                obs: "Mauris vitae quam in justo dictum sodales. In eget tortor a nunc vehicula tempor.",
              },
            ],
          },
        ],
      },
    ],
  },
];

export const NextEvents = ({ isLoading }: { isLoading: boolean }) => {
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
    <section className="py-10 px-4 md:px-10">
      <h2 className="text-3xl font-bold mb-6 text-primary text-center sm:text-start">
        Próximos eventos
      </h2>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading &&
          Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="w-[230px] h-[320px]" />
          ))}
        {!isLoading &&
          events.map((event) => {
            const ref = useRef(null);
            const isInView = useInView(ref, { once: true, margin: "-50px" });

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
              event.mode === "ONLINE" ? "Online" : `${event.city}, ${event.uf}`;

            return (
              <motion.div
                key={event.id}
                ref={ref}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, ease: "easeOut" }}>
                <Link href={`/event/${event.slug}`}>
                  <Card className="overflow-hidden shadow-md cursor-pointer hover:shadow-xl transition-shadow duration-200 pt-0 w-80 mx-auto sm:w-full h-[320px] flex flex-col">
                    <div className="relative w-full h-36 shrink-0">
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
                    <CardContent className="px-3 flex flex-col justify-between flex-1 space-y-2">
                      <div className="space-y-1">
                        <h3 className="text-md leading-4 font-semibold line-clamp-2 min-h-[44px]">
                          {event.title}
                        </h3>

                        <div className="flex items-center text-xs text-muted-foreground gap-1">
                          <Calendar size={14} className="mr-1 text-primary" />
                          {formattedDate}
                        </div>

                        <div className="flex items-center text-xs text-muted-foreground gap-1">
                          <MapPin size={14} className="mr-1 text-secondary" />
                          {location}
                        </div>
                      </div>

                      <p className="text-muted-foreground text-xs line-clamp-2 mt-1 min-h-[32px]">
                        {event.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
      </div>
    </section>
  );
};
