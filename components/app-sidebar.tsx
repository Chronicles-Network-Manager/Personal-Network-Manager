"use client"

import * as React from "react"
import {
  BookUser,
  Bot,
  CalendarDays,
  CloudUpload,
  Command,
  FolderSync,
  Globe,
  LifeBuoy,
  Phone,
  Send,
  Settings2,
} from "lucide-react"

import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NavSecondary } from "./nav-secondary"

// This is sample data.
const data = {
  user: {
    name: "jrs296",
    email: "jsamuel@gmail.com",
    avatar: "/avatars/shadcn.jpg",
  },
  projects: [
    {
      name: "Phonebook",
      url: "/contacts",
      icon: BookUser,
    },
    {
      name: "Assitant",
      url: "/assistant",
      icon: Bot,
    },
    {
      name: "Calls",
      url: "/calls",
      icon: Phone,
    },
    {
      name: "Connect",
      url: "/connect",
      icon: FolderSync,
    },
    {
      name: "Calender",
      url: "/calender",
      icon: CalendarDays,
    },
    {
      name: "World Map",
      url: "/world",
      icon: Globe,
    }
  ],
  settings: [
    {
      name: "Import Data",
      url: "/import",
      icon: CloudUpload,
    },
    {
      name: "Settings",
      url: "/settings",
      icon: Settings2,
    }
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
      <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">One CRM</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </a>
            </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <NavProjects projects={data.projects} title="CRM" />
        <NavProjects projects={data.settings} title="Others" />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
