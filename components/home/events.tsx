"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { motion, useInView } from "motion/react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, MapPin } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

const events = [
  {
    id: "1",
    title: "Festival de Música",
    description: "Um festival inesquecível com grandes atrações.",
    image:
      "https://event-tickethub-files.s3.us-east-1.amazonaws.com/06ef7e6b95dc7d2c2b499744cac99741f419c7e12478b6751a0c04833663cf69",
    status: "ACTIVE",
    date: "2025-04-27T16:20:00+00:00",
    mode: "IN_PERSON",
    city: "Florianópolis",
    uf: "SC",
  },
  {
    id: "2",
    title: "Workshop de Fotografia",
    description: "Aprenda com os melhores profissionais da área.",
    image:
      "https://event-tickethub-files.s3.us-east-1.amazonaws.com/06ef7e6b95dc7d2c2b499744cac99741f419c7e12478b6751a0c04833663cf69",
    status: "ACTIVE",
    date: "2025-05-12T19:00:00+00:00",
    mode: "ONLINE",
  },
  {
    id: "3",
    title: "Feira de Startups",
    description: "Oportunidades de networking e investimento.",
    image:
      "https://event-tickethub-files.s3.us-east-1.amazonaws.com/06ef7e6b95dc7d2c2b499744cac99741f419c7e12478b6751a0c04833663cf69",
    status: "INACTIVE",
    date: "2025-05-30T14:00:00+00:00",
    mode: "IN_PERSON",
    city: "Joinville",
    uf: "SC",
  },
  {
    id: "4",
    title: "Encontro de Desenvolvedores",
    description: "Tecnologia, código e networking em um só lugar.",
    image:
      "https://event-tickethub-files.s3.us-east-1.amazonaws.com/06ef7e6b95dc7d2c2b499744cac99741f419c7e12478b6751a0c04833663cf69",
    status: "ACTIVE",
    date: "2025-06-02T09:00:00+00:00",
    mode: "IN_PERSON",
    city: "Curitiba",
    uf: "PR",
  },
  {
    id: "5",
    title: "Congresso de Marketing",
    description: "Tendências do marketing digital com grandes nomes.",
    image:
      "https://event-tickethub-files.s3.us-east-1.amazonaws.com/06ef7e6b95dc7d2c2b499744cac99741f419c7e12478b6751a0c04833663cf69",
    status: "ACTIVE",
    date: "2025-06-18T10:30:00+00:00",
    mode: "ONLINE",
  },
  {
    id: "6",
    title: "Expo Vegan Brasil",
    description: "Feira de produtos veganos e sustentabilidade.",
    image:
      "https://event-tickethub-files.s3.us-east-1.amazonaws.com/06ef7e6b95dc7d2c2b499744cac99741f419c7e12478b6751a0c04833663cf69",
    status: "ACTIVE",
    date: "2025-07-01T15:00:00+00:00",
    mode: "IN_PERSON",
    city: "São Paulo",
    uf: "SP",
  },
  {
    id: "7",
    title: "Hackathon Universitário",
    description: "Maratona de inovação e tecnologia.",
    image:
      "https://event-tickethub-files.s3.us-east-1.amazonaws.com/06ef7e6b95dc7d2c2b499744cac99741f419c7e12478b6751a0c04833663cf69",
    status: "ACTIVE",
    date: "2025-07-15T08:00:00+00:00",
    mode: "IN_PERSON",
    city: "Porto Alegre",
    uf: "RS",
  },
  {
    id: "8",
    title: "Festival de Cinema Independente",
    description: "Mostra de filmes autorais e debates com diretores.",
    image:
      "https://event-tickethub-files.s3.us-east-1.amazonaws.com/06ef7e6b95dc7d2c2b499744cac99741f419c7e12478b6751a0c04833663cf69",
    status: "ACTIVE",
    date: "2025-08-05T20:00:00+00:00",
    mode: "IN_PERSON",
    city: "Rio de Janeiro",
    uf: "RJ",
  },
];

export const Events = () => {
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
      <h2 className="text-3xl font-bold mb-6">Próximos eventos</h2>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {events.map((event) => {
          const ref = useRef(null);
          const isInView = useInView(ref, { once: true, margin: "-50px" });

          const formattedDate = format(
            new Date(event.date),
            "dd 'de' MMMM 'às' HH:mm'h'",
            { locale: ptBR }
          );

          const location =
            event.mode === "ONLINE" ? "Online" : `${event.city}, ${event.uf}`;

          return (
            <motion.div
              key={event.id}
              ref={ref}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: "easeOut" }}>
              <Card className="overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-shadow pt-0 h-[320px] flex flex-col">
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
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
