import { ConfirmProvider } from "@/providers/confirm-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ProducerSidebar } from "@/components/producer/sidebar/producer-sidebar";
import { cookies } from "next/headers";

export default async function ProducerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true";
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <ProducerSidebar />
      <ConfirmProvider>
        <main className="w-full">
          <div className="p-5 w-11/12 mx-auto">{children}</div>
        </main>
      </ConfirmProvider>
    </SidebarProvider>
  );
}
