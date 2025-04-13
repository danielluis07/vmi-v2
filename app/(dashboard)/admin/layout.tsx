import { ConfirmProvider } from "@/providers/confirm-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/sidebar/admin-sidebar";
import { cookies } from "next/headers";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true";
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AdminSidebar />
      <ConfirmProvider>
        <main className="w-full">
          <div className="p-5 w-11/12 mx-auto">{children}</div>
        </main>
      </ConfirmProvider>
    </SidebarProvider>
  );
}
