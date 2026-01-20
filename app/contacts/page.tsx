"use client"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { DataTable } from "./data-table2"
import type { Contact } from '@/types/contact';  // your Contact interface
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supbaseClient"
import { getContactWithAllDetails } from "../Services/supabaseService"
import GetContactForUserIdDTO from "@/types/InputDTO/GetContactForUserIdDTO"
import { getDataForContactsSection } from "../Services/CRMService"
import { LoaderIcon } from "lucide-react"

export default function Contacts() {
  const [data, setData] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data, error } = await getDataForContactsSection();
      if (error) console.error(error);
      else setData(data ?? []);
      setLoading(false);
    }

    fetchData();
  }, []);

  console.log("Contacts data:", data);

  return (
    <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4 flex-1">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Home
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Contacts</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center px-4">
            <ThemeToggle />
          </div>
        </header>
        {loading ? (
          <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
            <LoaderIcon className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <DataTable data={data} />
        )}
      </SidebarInset>
  )
}
