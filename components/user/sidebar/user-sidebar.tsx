import { Calendar, Home, Inbox, Search, Settings } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavUser } from "@/components/user/sidebar/nav-user";
import Link from "next/link";

const items = [
  {
    title: "Eventos",
    url: "#",
    icon: Home,
  },
  {
    title: "Relatórios",
    url: "#",
    icon: Inbox,
  },
  {
    title: "Email Marketing",
    url: "#",
    icon: Calendar,
  },
  {
    title: "Impulsionar",
    url: "#",
    icon: Search,
  },
  {
    title: "Scanner",
    url: "#",
    icon: Settings,
  },
  {
    title: "Financeiro",
    url: "#",
    icon: Settings,
  },
  {
    title: "Ajustes",
    url: "#",
    icon: Settings,
  },
];

export const UserSidebar = () => {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>VMI</SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item, i) => (
                <SidebarMenuItem key={i}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
};
