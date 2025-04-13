import { UserEventsClient } from "@/components/user/events/client";
import { HydrateClient, trpc } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

export const dynamic = "force-dynamic";

const CreateEventPage = async () => {
  void trpc.events.getMany.prefetch();
  return (
    <HydrateClient>
      <Suspense fallback={<div>Loading...</div>}>
        <ErrorBoundary fallback={<div>Something went wrong</div>}>
          <UserEventsClient />
        </ErrorBoundary>
      </Suspense>
    </HydrateClient>
  );
};

export default CreateEventPage;
