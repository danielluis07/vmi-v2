import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { UserSidebar } from "@/components/user/sidebar/user-sidebar";
import { cookies } from "next/headers";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true";
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <UserSidebar />
      <main className="w-full">
        <SidebarTrigger />
        <div className="p-5 w-11/12 mx-auto">{children}</div>
      </main>
    </SidebarProvider>
  );
}
