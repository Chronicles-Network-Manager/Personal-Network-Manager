"use client"

import { useEffect, useState } from "react"
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
import { ChevronRight, ChevronLeft, LoaderIcon } from "lucide-react"
import { getAllRemindersWithContacts } from "@/app/Services/supabaseService"
import { ReminderType } from "@/types/Enums/ReminderType"
import { RecurringType } from "@/types/Enums/RecurringType"
import RemindersTable from "@/types/Supabase/RemindersTable"
import ContactsTable from "@/types/Supabase/ContactsTable"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

// Map ReminderType to calendar colors
const getReminderColor = (type: string): string => {
  switch (type) {
    case ReminderType.BIRTHDAY:
      return "pink" // Pink for birthdays
    case ReminderType.ANNIVERSARY:
      return "purple" // Purple for anniversaries
    case ReminderType.EVENT:
      return "blue" // Blue for events
    default:
      return "gray"
  }
}

// Transform reminder to calendar events (returns array for recurring reminders)
const transformReminderToEvents = (reminder: RemindersTable & { Contacts: ContactsTable | ContactsTable[] | null }): Array<{ 
  id: string; 
  start: Date; 
  end: Date; 
  title: string; 
  color: string;
  reminder: RemindersTable & { Contacts: ContactsTable | ContactsTable[] | null };
}> => {
  // Parse the date (YYYY-MM-DD format)
  if (!reminder.date) {
    console.warn('Reminder missing date:', reminder)
    return []
  }
  
  const [year, month, day] = reminder.date.split('-').map(Number)
  
  // Parse send time if available (HH:MM:SS format)
  let hours = 9 // Default to 9 AM
  let minutes = 0
  
  if (reminder.send) {
    const timeParts = reminder.send.split(':')
    if (timeParts.length >= 2) {
      hours = parseInt(timeParts[0]) || 9
      minutes = parseInt(timeParts[1]) || 0
    }
  }
  
  // Get contact name - Supabase returns Contacts as an object when using select with foreign key
  let contactName = 'Unknown Contact'
  
  if (reminder.Contacts) {
    const contact = Array.isArray(reminder.Contacts) ? reminder.Contacts[0] : reminder.Contacts
    if (contact && contact.firstName) {
      contactName = `${contact.firstName} ${contact.middleNames ? contact.middleNames + ' ' : ''}${contact.lastName || ''}`.trim()
    }
  }
  
  // Create title with contact name and message
  let title = `${contactName} - ${reminder.type}`
  if (reminder.message) {
    title += `: ${reminder.message}`
  }
  
  const color = getReminderColor(reminder.type)
  const events: Array<{ 
    id: string; 
    start: Date; 
    end: Date; 
    title: string; 
    color: string;
    reminder: RemindersTable & { Contacts: ContactsTable | ContactsTable[] | null };
  }> = []
  
  // Check if reminder is recurring
  if (reminder.isRecurring && reminder.recurringType) {
    const currentYear = new Date().getFullYear()
    const startYear = year
    const endYear = currentYear + 5 // Show 5 years into the future
    
    switch (reminder.recurringType) {
      case RecurringType.EVERY_YEAR:
        // Generate events for every year from original year to 5 years in the future
        for (let y = Math.min(startYear, currentYear - 2); y <= endYear; y++) {
          const start = new Date(y, month - 1, day, hours, minutes)
          const end = new Date(start.getTime() + 60 * 60 * 1000) // Add 1 hour
          
          events.push({
            id: `${reminder.id}-${y}`, // Unique ID for each occurrence
            start,
            end,
            title,
            color,
            reminder,
          })
        }
        break
        
      case RecurringType.EVERY_MONTH:
        // Generate events for the next 24 months
        const now = new Date()
        for (let i = 0; i < 24; i++) {
          const eventDate = new Date(now.getFullYear(), now.getMonth() + i, day, hours, minutes)
          // Skip if the day doesn't exist in that month (e.g., Feb 30)
          if (eventDate.getDate() === day || i === 0) {
            const start = eventDate
            const end = new Date(start.getTime() + 60 * 60 * 1000)
            events.push({
              id: `${reminder.id}-${start.getTime()}`,
              start,
              end,
              title,
              color,
              reminder,
            })
          }
        }
        break
        
      case RecurringType.EVERY_WEEK:
        // Generate events for the next 52 weeks
        const weekStart = new Date(year, month - 1, day, hours, minutes)
        // Find the next occurrence from today
        const today = new Date()
        const weeksUntilStart = Math.ceil((weekStart.getTime() - today.getTime()) / (7 * 24 * 60 * 60 * 1000))
        const startWeeksFromNow = weeksUntilStart > 0 ? weeksUntilStart : 0
        
        for (let w = startWeeksFromNow; w < startWeeksFromNow + 52; w++) {
          const start = new Date(weekStart.getTime() + (w * 7 * 24 * 60 * 60 * 1000))
          const end = new Date(start.getTime() + 60 * 60 * 1000)
          events.push({
            id: `${reminder.id}-${start.getTime()}`,
            start,
            end,
            title,
            color,
            reminder,
          })
        }
        break
        
      case RecurringType.EVERY_DAY:
        // Generate events for the next 365 days
        const dayStart = new Date(year, month - 1, day, hours, minutes)
        const today2 = new Date()
        today2.setHours(0, 0, 0, 0)
        let currentDay = dayStart < today2 ? new Date(today2) : new Date(dayStart)
        
        for (let d = 0; d < 365; d++) {
          const start = new Date(currentDay.getTime() + (d * 24 * 60 * 60 * 1000))
          start.setHours(hours, minutes, 0, 0)
          const end = new Date(start.getTime() + 60 * 60 * 1000)
          events.push({
            id: `${reminder.id}-${start.getTime()}`,
            start,
            end,
            title,
            color,
            reminder,
          })
        }
        break
        
      case RecurringType.DOES_NOT_REPEAT:
      default:
        // Non-recurring or unknown type - just show the original date
        const start = new Date(year, month - 1, day, hours, minutes)
        const end = new Date(start.getTime() + 60 * 60 * 1000)
        events.push({
          id: reminder.id,
          start,
          end,
          title,
          color,
          reminder,
        })
        break
    }
  } else {
    // Non-recurring reminder - just show the original date
    const start = new Date(year, month - 1, day, hours, minutes)
    const end = new Date(start.getTime() + 60 * 60 * 1000)
    events.push({
      id: reminder.id,
      start,
      end,
      title,
      color,
      reminder,
    })
  }
  
  return events
}

export default function CalendarPage() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  useEffect(() => {
    async function fetchReminders() {
      setLoading(true)
      try {
        const { data, error } = await getAllRemindersWithContacts()
        
        if (error) {
          console.error('Error fetching reminders:', error)
          console.error('Error message:', error.message)
          console.error('Error details:', error)
          setEvents([])
        } else if (data && Array.isArray(data)) {
          // Transform reminders to calendar events
          // For recurring reminders, this will return multiple events
          const calendarEvents = data
            .flatMap(transformReminderToEvents)
          
          console.log(`Loaded ${data.length} reminders as ${calendarEvents.length} calendar events`)
          setEvents(calendarEvents)
        } else {
          console.log('No reminders data received or data is not an array')
          console.log('Data received:', data)
          setEvents([])
        }
      } catch (error) {
        console.error('Error in fetchReminders:', error)
        setEvents([])
      } finally {
        setLoading(false)
      }
    }

    fetchReminders()
  }, [])

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
          {loading ? (
            <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
              <LoaderIcon className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Calendar 
              events={events}
              onEventClick={(event) => {
                setSelectedEvent(event)
                setIsDetailsOpen(true)
              }}
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
          )}
        </div>

        {/* Event Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Reminder Details</DialogTitle>
              <DialogDescription>
                View details about this reminder
              </DialogDescription>
            </DialogHeader>
            {selectedEvent && (
              <div className="space-y-4 py-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">{selectedEvent.title}</h3>
                  <div className="flex gap-2 flex-wrap">
                    <Badge 
                      variant="outline" 
                      className={`${
                        selectedEvent.color === 'pink' ? 'bg-pink-100 text-pink-800 border-pink-300' :
                        selectedEvent.color === 'purple' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                        selectedEvent.color === 'blue' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                        'bg-gray-100 text-gray-800 border-gray-300'
                      }`}
                    >
                      {selectedEvent.reminder?.type || 'EVENT'}
                    </Badge>
                    {selectedEvent.reminder?.isRecurring && (
                      <Badge variant="secondary">
                        Recurring: {selectedEvent.reminder.recurringType?.replace('EVERY_', '').replace('_', ' ')}
                      </Badge>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Date:</span>
                    <span className="text-sm">{selectedEvent.start.toLocaleDateString('en-US', { 
                      weekday: 'long',
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Time:</span>
                    <span className="text-sm">{selectedEvent.start.toLocaleTimeString('en-US', { 
                      hour: 'numeric', 
                      minute: '2-digit' 
                    })}</span>
                  </div>
                </div>

                {selectedEvent.reminder?.message && (
                  <>
                    <Separator />
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Message:</span>
                      <p className="text-sm mt-1">{selectedEvent.reminder.message}</p>
                    </div>
                  </>
                )}

                {selectedEvent.reminder?.Contacts && (
                  <>
                    <Separator />
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Contact:</span>
                      <p className="text-sm mt-1">
                        {(() => {
                          const contact = Array.isArray(selectedEvent.reminder.Contacts) 
                            ? selectedEvent.reminder.Contacts[0] 
                            : selectedEvent.reminder.Contacts
                          if (contact) {
                            return `${contact.firstName} ${contact.middleNames ? contact.middleNames + ' ' : ''}${contact.lastName || ''}`.trim()
                          }
                          return 'Unknown Contact'
                        })()}
                      </p>
                    </div>
                  </>
                )}

                <Separator />

                <div className="text-xs text-muted-foreground">
                  <p>Created: {selectedEvent.reminder?.createdAt 
                    ? new Date(selectedEvent.reminder.createdAt).toLocaleString('en-US')
                    : 'Unknown'}
                  </p>
                  {selectedEvent.reminder?.updatedAt && (
                    <p>Updated: {new Date(selectedEvent.reminder.updatedAt).toLocaleString('en-US')}</p>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </SidebarInset>
  )
}
