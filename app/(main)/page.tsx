import { Categories } from "@/components/home/categories";
import { NextEvents } from "@/components/home/next-events";
import { Hero } from "@/components/home/hero";
import { FeaturedEvents } from "@/components/home/featured-events";

const dummyCategories = [
  { id: "1", name: "Category 1" },
  { id: "2", name: "Category 2" },
  { id: "3", name: "Category 3" },
  { id: "4", name: "Category 4" },
  { id: "5", name: "Category 5" },
  { id: "6", name: "Category 6" },
  { id: "7", name: "Category 7" },
  { id: "8", name: "Category 8" },
  { id: "9", name: "Category 9" },
  { id: "10", name: "Category 10" },
  { id: "11", name: "Category 11" },
  { id: "12", name: "Category 12" },
  { id: "13", name: "Category 13" },
  { id: "14", name: "Category 14" },
  { id: "15", name: "Category 15" },
  { id: "16", name: "Category 16" },
  { id: "17", name: "Category 17" },
  { id: "18", name: "Category 18" },
  { id: "19", name: "Category 19" },
  { id: "20", name: "Category 20" },
];

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
    city: "São Paulo",
    uf: "SP",
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
    city: "São Paulo",
    uf: "SP",
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

export default function Home() {
  return (
    <div>
      <Hero />
      <div className="px-0 sm:px-3 md:px-10 lg:px-20">
        <Categories data={dummyCategories} />
        <FeaturedEvents data={events} />
        <NextEvents />
      </div>
    </div>
  );
}
