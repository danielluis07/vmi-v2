import { SettingsClient } from "@/components/user/settings/client";
import { HydrateClient, trpc } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

export const dynamic = "force-dynamic";

const SettingsPage = async () => {
  void trpc.users.getOne.prefetch();
  return (
    <HydrateClient>
      <Suspense fallback={<div>Loading...</div>}>
        <ErrorBoundary fallback={<div>Something went wrong</div>}>
          <SettingsClient />
        </ErrorBoundary>
      </Suspense>
    </HydrateClient>
  );
};

export default SettingsPage;
