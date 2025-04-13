import { ProducerEventsClient } from "@/components/producer/events/client";
import { HydrateClient, trpc } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

export const dynamic = "force-dynamic";

const EventsPage = async () => {
  void trpc.events.getMany.prefetch();
  return (
    <HydrateClient>
      <Suspense fallback={<div>Loading...</div>}>
        <ErrorBoundary fallback={<div>Something went wrong</div>}>
          <ProducerEventsClient />
        </ErrorBoundary>
      </Suspense>
    </HydrateClient>
  );
};

export default EventsPage;
