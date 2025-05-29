import { AppSidebar } from "@/components/app-sidebar"
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

export default function Home() {
  return (
    <SidebarInset>
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        className="fixed top-0 left-0 w-full h-full bg-black" // Video stays in the background
      >
        <source src="/Earth from Space 4K 60fps - Three Day Time Lapse from the Himawari 8 Satellite (1).mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Semi-Transparent Overlay */}
      <div className="fixed top-0 left-0 w-full h-full bg-black/50 z-0"></div> {/* Overlay with 50% opacity */}

      {/* Content */}
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 relative z-10">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1 text-white" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>                
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 relative z-10">
        {/* Grid Container for the Three Boxes */}
        <div className="flex justify-end"> {/* Align the column to the right */}
          <div className="flex flex-col gap-4 w-1/4"> {/* Adjust width as needed */}
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
          </div>
        </div>
      </div>
    </SidebarInset>
  )
}