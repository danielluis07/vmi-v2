import { EventClient } from "@/components/event/client";

const data = {
  id: "1",
  title: "Tomorrowland Brasil",
  description:
    "O Tomorrowland Brasil é um dos maiores e mais icônicos festivais de música eletrônica do mundo. Com sua atmosfera única e palco deslumbrante, o evento reúne DJs renomados e milhares de fãs de diferentes partes do planeta. A cada edição, o festival oferece uma experiência inesquecível, repleta de performances épicas, luzes vibrantes e uma energia contagiante, fazendo com que os participantes vivenciem uma verdadeira celebração da música eletrônica.",
  image:
    "https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf?q=80&w=1674&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  date: new Date(),
  mode: "IN_PERSON" as "IN_PERSON" | "ONLINE",
  city: "São Paulo",
  uf: "SP",
  creatorRole: "PRODUCER" as "USER" | "PRODUCER",
  address: "Rua Exemplo, 123",
  ticket: {
    id: "1",
    eventId: "1",
    sectorId: "1234",
    sector: "VIP",
    price: 1000,
    quantity: 3,
    gender: "MALE",
    file: "https://event-tickethub-files.s3.us-east-1.amazonaws.com/5224695a5e285345d899bfb836e1464efc13fe7fab7ff6ddb68493815a51aea8",
    obs: null,
  },
  days: [
    {
      date: "2025-04-17T03:00:00.000Z",
      startTime: "2025-04-17T18:00:00.000Z",
      endTime: "2025-04-17T21:30:00.000Z",
      batches: [
        {
          id: "c9c5ca67-4d99-4a3f-9571-13400f23f2e2",
          name: "Lote 1",
          startTime: "2025-04-17T18:10:00.000Z",
          endTime: "2025-04-08T19:00:00.000Z",
          tickets: [
            {
              id: "1",
              eventId: "1",
              sectorId: "1234",
              sector: "VIP",
              price: 1000,
              quantity: 3,
              gender: "MALE",
              file: "https://event-tickethub-files.s3.us-east-1.amazonaws.com/5224695a5e285345d899bfb836e1464efc13fe7fab7ff6ddb68493815a51aea8",
              obs: null,
            },
            {
              id: "2",
              eventId: "1",
              sectorId: "1234",
              sector: "VIP",
              price: 2000,
              quantity: 3,
              gender: "FEMALE",
              file: "https://event-tickethub-files.s3.us-east-1.amazonaws.com/5224695a5e285345d899bfb836e1464efc13fe7fab7ff6ddb68493815a51aea8",
              obs: null,
            },
          ],
        },
      ],
    },
    {
      date: "2025-04-18T03:00:00.000Z",
      startTime: "2025-04-18T21:00:00.000Z",
      endTime: "2025-04-18T23:30:00.000Z",
      batches: [
        {
          id: "c9c5ca67-4d99-4a3f-9571-13400f23f2e2",
          name: "Lote 1",
          startTime: "2025-04-08T21:10:00.000Z",
          endTime: "2025-04-08T23:00:00.000Z",
          tickets: [
            {
              id: "1",
              eventId: "1",
              sectorId: "1234",
              sector: "VIP",
              price: 1000,
              quantity: 3,
              gender: "UNISSEX",
              file: "https://event-tickethub-files.s3.us-east-1.amazonaws.com/5224695a5e285345d899bfb836e1464efc13fe7fab7ff6ddb68493815a51aea8",
              obs: null,
            },
            {
              id: "2",
              eventId: "1",
              sectorId: "1234",
              sector: "VIP",
              price: 2000,
              quantity: 3,
              gender: "FEMALE",
              file: "https://event-tickethub-files.s3.us-east-1.amazonaws.com/5224695a5e285345d899bfb836e1464efc13fe7fab7ff6ddb68493815a51aea8",
              obs: null,
            },
          ],
        },
      ],
    },
  ],
};

const EventPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  return (
    <div>
      <EventClient data={data} />
    </div>
  );
};

export default EventPage;
