"use client";

import { trpc } from "@/trpc/client";
import { ConnectMercadoPago } from "./connect-mp";
import { UpdateInfo } from "./update-info";
import { UpdatePassword } from "./update-password";

export const SettingsClient = () => {
  const [user] = trpc.users.getOne.useSuspenseQuery();
  return (
    <div className="w-full">
      <ConnectMercadoPago user={user} />
      <div className="flex flex-col md:flex-row md:justify-between gap-4 mt-8">
        <UpdateInfo user={user} />
        <UpdatePassword />
      </div>
    </div>
  );
};
