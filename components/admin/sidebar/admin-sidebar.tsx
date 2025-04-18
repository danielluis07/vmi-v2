"use client";

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
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { NavAdmin } from "@/components/admin/sidebar/nav-admin";
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

export const AdminSidebar = () => {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        VMI
        <SidebarTrigger />
      </SidebarHeader>
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
        <NavAdmin />
      </SidebarFooter>
    </Sidebar>
  );
};
