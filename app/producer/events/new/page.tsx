import { HydrateClient, trpc } from "@/trpc/server";
import { NewEventsForm } from "@/components/producer/events/form";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

export const dynamic = "force-dynamic";

const NewEventPage = async () => {
  void trpc.categories.getMany.prefetch();
  void trpc.ticketSectors.getMany.prefetch();
  return (
    <HydrateClient>
      <Suspense fallback={<div>Loading...</div>}>
        <ErrorBoundary fallback={<div>Something went wrong</div>}>
          <NewEventsForm />
        </ErrorBoundary>
      </Suspense>
    </HydrateClient>
  );
};

export default NewEventPage;
