import { HydrateClient, trpc } from "@/trpc/server";
import { CreateUserEventForm } from "@/components/user/events/new/create-event-form";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

export const dynamic = "force-dynamic";

const CreateEventPage = async () => {
  void trpc.categories.getMany.prefetch();
  void trpc.ticketSectors.getMany.prefetch();
  return (
    <HydrateClient>
      <Suspense fallback={<div>Loading...</div>}>
        <ErrorBoundary fallback={<div>Something went wrong</div>}>
          <CreateUserEventForm />
        </ErrorBoundary>
      </Suspense>
    </HydrateClient>
  );
};

export default CreateEventPage;
