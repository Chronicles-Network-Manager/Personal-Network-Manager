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
import { ThemeToggle } from "@/components/theme-toggle"
import { Calendar, CalendarDayView, CalendarWeekView, CalendarMonthView, CalendarYearView, CalendarNextTrigger, CalendarTodayTrigger, CalendarPrevTrigger, CalendarViewTrigger, CalendarCurrentDate } from "@/components/ui/full-calendar"
import { ChevronRight, ChevronLeft } from "lucide-react"

export default function Assistant() {
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
                  <BreadcrumbPage>Calendar</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center px-4">
            <ThemeToggle />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Calendar
  events={[
    {
      id: '1',
      start: new Date('2024-08-26T09:30:00Z'),
      end: new Date('2024-08-26T14:30:00Z'),
      title: 'event A',
      color: 'pink',
    },
    {
      id: '2',
      start: new Date('2024-08-26T10:00:00Z'),
      end: new Date('2024-08-26T10:30:00Z'),
      title: 'event B',
      color: 'blue',
    },
  ]}
>
  <div className="h-dvh py-6 flex flex-col">
    <div className="flex px-6 items-center gap-2 mb-6">
      <CalendarViewTrigger className="aria-[current=true]:bg-accent" view="day">
        Day
      </CalendarViewTrigger>
      <CalendarViewTrigger
        view="week"
        className="aria-[current=true]:bg-accent"
      >
        Week
      </CalendarViewTrigger>
      <CalendarViewTrigger
        view="month"
        className="aria-[current=true]:bg-accent"
      >
        Month
      </CalendarViewTrigger>
      <CalendarViewTrigger
        view="year"
        className="aria-[current=true]:bg-accent"
      >
        Year
      </CalendarViewTrigger>

      <span className="flex-1" />

      <CalendarCurrentDate />

      <CalendarPrevTrigger>
        <ChevronLeft size={20} />
        <span className="sr-only">Previous</span>
      </CalendarPrevTrigger>

      <CalendarTodayTrigger>Today</CalendarTodayTrigger>

      <CalendarNextTrigger>
        <ChevronRight size={20} />
        <span className="sr-only">Next</span>
      </CalendarNextTrigger>
    </div>

    <div className="flex-1 overflow-auto px-6 relative">
      <CalendarDayView />
      <CalendarWeekView />
      <CalendarMonthView />
      <CalendarYearView />
    </div>
  </div>
</Calendar>
        </div>
      </SidebarInset>
  )
}
