import { ConfirmProvider } from "@/providers/confirm-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { UserSidebar } from "@/components/user/sidebar/user-sidebar";
import { cookies } from "next/headers";

export default async function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true";
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <UserSidebar />
      <ConfirmProvider>
        <main className="w-full">
          <div className="p-5 w-11/12 mx-auto">{children}</div>
        </main>
      </ConfirmProvider>
    </SidebarProvider>
  );
}
