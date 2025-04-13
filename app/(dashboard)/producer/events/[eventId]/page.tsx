import { UpdateProducerEventForm } from "@/components/producer/events/event/update-event-form";
import { HydrateClient, trpc } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

export const dynamic = "force-dynamic";

const EventPage = async ({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) => {
  const { eventId } = await params;
  void trpc.events.getProducerEvent.prefetch({ id: eventId });
  void trpc.categories.getMany.prefetch();
  void trpc.ticketSectors.getMany.prefetch();

  return (
    <HydrateClient>
      <Suspense fallback={<div>Loading...</div>}>
        <ErrorBoundary fallback={<div>Something went wrong</div>}>
          <UpdateProducerEventForm eventId={eventId} />
        </ErrorBoundary>
      </Suspense>
    </HydrateClient>
  );
};

export default EventPage;
