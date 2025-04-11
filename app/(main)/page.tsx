import { Categories } from "@/components/home/categories";
import { NextEvents } from "@/components/home/next-events";
import { Hero } from "@/components/home/hero";
import { FeaturedEvents } from "@/components/home/featured-events";

const dummyCategories = [
  { id: "1", name: "Categoria 1" },
  { id: "2", name: "Categoria 2" },
  { id: "3", name: "Categoria 3" },
  { id: "4", name: "Categoria 4" },
  { id: "5", name: "Categoria 5" },
  { id: "6", name: "Categoria 6" },
  { id: "7", name: "Categoria 7" },
  { id: "8", name: "Categoria 8" },
  { id: "9", name: "Categoria 9" },
  { id: "10", name: "Categoria 10" },
  { id: "11", name: "Categoria 11" },
  { id: "12", name: "Categoria 12" },
  { id: "13", name: "Categoria 13" },
  { id: "14", name: "Categoria 14" },
  { id: "15", name: "Categoria 15" },
  { id: "16", name: "Categoria 16" },
  { id: "17", name: "Categoria 17" },
  { id: "18", name: "Categoria 18" },
  { id: "19", name: "Categoria 19" },
  { id: "20", name: "Categoria 20" },
];

const events = [
  {
    id: "1",
    title: "Rock in Rio",
    description: "O maior festival de música do Brasil.",
    image:
      "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bXVzaWMlMjBmZXN0aXZhbHxlbnwwfHwwfHx8MA%3D%3D",
    status: "ACTIVE",
    date: "2025-04-27T16:20:00+00:00",
    mode: "IN_PERSON",
    city: "Florianópolis",
    uf: "SC",
  },
  {
    id: "2",
    title: "Tomorrowland Brasil",
    description: "Festival de música eletrônica com DJs renomados.",
    image:
      "https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf?q=80&w=1674&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
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
  {
    id: "3",
    title: "Festival Coachella",
    description: "Festival de música e arte na Califórnia.",
    image:
      "https://images.unsplash.com/photo-1501238295340-c810d3c156d2?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    status: "INACTIVE",
    date: "2025-05-30T14:00:00+00:00",
    mode: "IN_PERSON",
    city: "Joinville",
    uf: "SC",
  },
  {
    id: "4",
    title: "Miami Heat vs Los Angeles Lakers",
    description: "Jogo de basquete da NBA.",
    image:
      "https://images.unsplash.com/photo-1570587031956-6b6d5694ea11?q=80&w=1635&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    status: "ACTIVE",
    date: "2025-06-02T09:00:00+00:00",
    mode: "IN_PERSON",
    city: "Curitiba",
    uf: "PR",
  },
  {
    id: "5",
    title: "Eclipse Solar 2025",
    description: "Observação do eclipse solar total.",
    image:
      "https://images.unsplash.com/photo-1503416997304-7f8bf166c121?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    status: "ACTIVE",
    date: "2025-06-18T10:30:00+00:00",
    mode: "ONLINE",
    city: "São Paulo",
    uf: "SP",
  },
  {
    id: "6",
    title: "Brasil Game Fest",
    description: "Maior evento de games do Brasil.",
    image:
      "https://images.unsplash.com/photo-1711390811937-1b061eaf28ea?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    status: "ACTIVE",
    date: "2025-07-01T15:00:00+00:00",
    mode: "IN_PERSON",
    city: "São Paulo",
    uf: "SP",
  },
];

export default function Home() {
  return (
    <div>
      <Hero />
      <div className="px-0 sm:px-3 md:px-10 lg:px-20 xl:px-42">
        <Categories data={dummyCategories} />
        <FeaturedEvents data={events} />
        <NextEvents />
      </div>
    </div>
  );
}
