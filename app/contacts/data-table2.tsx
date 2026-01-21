"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  Row,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  CheckCircle2Icon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ColumnsIcon,
  LoaderIcon,
  MoreVerticalIcon,
  PlusIcon,
  TrendingUpIcon,
  XIcon,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { toast } from "sonner";
import { z } from "zod";

import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Group } from "@/types/Enums/Group";
import { Contact } from "@/types/contact";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { TooltipTrigger } from "@radix-ui/react-tooltip";
import { supabase } from "@/lib/supbaseClient";
import { Textarea } from "@/components/ui/textarea";
import { TagsInput } from "@/components/ui/tags-input";
import { updateContact, updateLocation, upsertSocials, upsertLocations, upsertReminder, deleteReminder } from "@/app/Services/supabaseService";
import { LocationType } from "@/types/Enums/LocationType";
import { ReminderType } from "@/types/Enums/ReminderType";
import { RecurringType } from "@/types/Enums/RecurringType";
import RemindersTable from "@/types/Supabase/RemindersTable";

const locationDataSchema = z.object({
  address: z.string().optional(),
  city: z.string(),
  country: z.string(),
  latitude: z.number(),
  longitude: z.number(),
});

export const contactSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  phone: z.string(),
  email: z.string(),
  jobTitle: z.string(),
  company: z.string(),

  groups: z.nativeEnum(Group).array(),

  location: locationDataSchema,
  pastLocations: locationDataSchema.array(),
  visited: locationDataSchema.array(),

  birthday: z.string(),
  anniversary: z.string().nullable().optional(),

  relatedPersons: z.string().array(),
  interests: z.string().array(),

  socialLinks: z.record(z.string().optional()),

  notes: z.string(),
  reminders: z.string().array(),

  createdAt: z.string(),
  updatedAt: z.string(),
});

const columns: ColumnDef<Contact>[] = [
  {
    id: "actions",
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
            size="icon"
          >
            <MoreVerticalIcon />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-50">
          <DropdownMenuItem>
            <span className="text-red-500">Request Contact Data</span>
          </DropdownMenuItem>
          <Separator className="my-1" />
          <DropdownMenuItem>Mark As Favourite</DropdownMenuItem>
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem>Message</DropdownMenuItem>
          <DropdownMenuItem>Add to group</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      return <TableCellViewer contact={row.original} />;
    },
    enableHiding: false,
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => (
      <div className="w-32">
        {row.original.phone || (
          <span className="text-muted-foreground">Not specified</span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "company",
    header: "Company",
    cell: ({ row }) => (
      <div className="w-32">
        <Badge variant="outline" className="px-1.5 text-muted-foreground">
          {row.original.company}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "jobTitle",
    header: "Job Title",
    cell: ({ row }) => (
      <div className="w-32">
        {row.original.jobTitle || (
          <span className="text-muted-foreground">Not specified</span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <div className="w-40 truncate">
        {row.original.email || (
          <span className="text-muted-foreground">Not specified</span>
        )}
      </div>
    ),
  },

  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => (
      <div className="w-32">
        {row.original.location.city + ", " + row.original.location.country || (
          <span className="text-muted-foreground">Not specified</span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "groups",
    header: "Groups",
    cell: ({ row }) => {
      const groupColors: Record<string, string> = {
        USER: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
        FAMILY: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
        FRIENDS: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        WORK: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
        ACQUAINTANCE: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
        SCHOOL: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
        COLLEGE: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
        OTHER: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
      };

      return (
        <div className="flex flex-wrap gap-1">
          {row.original.groups.length > 0 ? (
            row.original.groups.slice(0, 3).map((group) => (
              <Badge
                key={group}
                className={`truncate ${groupColors[group] || groupColors.OTHER}`}
              >
                {group}
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground">None</span>
          )}
          {row.original.groups.length > 3 && (
            <Badge variant="outline" className="text-muted-foreground">
              +{row.original.groups.length - 3} more
            </Badge>
          )}
        </div>
      );
    },
  },
];

export function DataTable({ data: initialData }: { data: Contact[] }) {
  const [data, setData] = React.useState(() => initialData);
  const [email, setEmail] = React.useState("");
  const [otpLoading, setOtpLoading] = React.useState(false);
  const [message, setMessage] = React.useState("");

  const sendEmailToUser = async () => {
    setOtpLoading(true);
    setMessage("");

    if (!email) {
      setMessage("Please enter a valid email.");
      setOtpLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: "https://chronicles-form.netlify.app/form", // Optional: your redirect URL after click
      },
    });

    if (error) {
      setMessage(`Failed to send OTP: ${error.message}`);
    } else {
      setMessage(`OTP sent to ${email}. Please check your email.`);
    }

    setOtpLoading(false);
  };

  React.useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.userId,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <Tabs
      defaultValue="contacts"
      className="flex w-full flex-col justify-start"
    >
      <div className="flex items-center justify-between px-4 lg:px-6">
        <Label htmlFor="view-selector" className="sr-only">
          View
        </Label>
        <Select defaultValue="contacts">
          <SelectTrigger
            className="@4xl/main:hidden flex w-fit"
            id="view-selector"
          >
            <SelectValue placeholder="Select a view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="contacts">Contacts</SelectItem>
            <SelectItem value="groups">Groups</SelectItem>
            <SelectItem value="reminders">Reminders</SelectItem>
            <SelectItem value="analytics">Analytics</SelectItem>
          </SelectContent>
        </Select>
        <TabsList className="@4xl/main:flex hidden">
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="groups" className="gap-1">
            Groups{" "}
            <Badge
              variant="secondary"
              className="flex h-5 w-5 items-center justify-center rounded-full bg-muted-foreground/30"
            >
              {data.reduce((acc, contact) => acc + contact.groups.length, 0)}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="reminders" className="gap-1">
            Reminders{" "}
            <Badge
              variant="secondary"
              className="flex h-5 w-5 items-center justify-center rounded-full bg-muted-foreground/30"
            >
              {data.reduce((acc, contact) => acc + (contact.reminders?.length || 0), 0)}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <ColumnsIcon />
                <span className="hidden lg:inline">Customize Columns</span>
                <span className="lg:hidden">Columns</span>
                <ChevronDownIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <PlusIcon />
                <span className="hidden lg:inline">Add Contact</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[1000px]">
              <DialogHeader>
                <DialogTitle>Add a Contact</DialogTitle>
                <DialogDescription>
                  Choose a method to add contacts below
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-0 py-4">
                {/* Email Section */}
                <div className="space-y-4 px-6 border-r">
                  <Input
                    type="email"
                    placeholder="Enter contact's email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Button
                    onClick={sendEmailToUser}
                    className="w-full"
                    disabled={otpLoading}
                  >
                    {otpLoading ? "Sending OTP..." : "Request Information"}
                  </Button>
                </div>

                {/* QR Code Section */}
                <div className="flex flex-col items-center space-y-4 px-6 border-r">
                  <div className="relative w-full pb-[100%] rounded-md overflow-hidden border">
                    <img
                      src="./qr.png"
                      alt="QR Code"
                      className="absolute top-0 left-0 w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* CSV Upload Section */}
                <div className="space-y-4 px-6">
                  <Input type="file" />
                  <div className="flex gap-2">
                    <Button size="sm">Submit</Button>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="outline"
                            aria-label="Help"
                          >
                            ?
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          Upload a CSV file with headers:{" "}
                          <code>name,email,phone</code>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <TabsContent
        value="contacts"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-muted">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="**:data-[slot=table-cell]:first:w-8">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No contacts found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} contact(s) selected.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeftIcon />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeftIcon />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRightIcon />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRightIcon />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="groups" className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent value="reminders" className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent value="analytics" className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
    </Tabs>
  );
}

function TableCellViewer({ contact }: { contact: Contact }) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  
  // Form state
  const [firstName, setFirstName] = React.useState(contact.firstName);
  const [middleName, setMiddleName] = React.useState(contact.middleName || ""); // UI uses middleName, DB uses middleNames
  const [lastName, setLastName] = React.useState(contact.lastName);
  const [phone, setPhone] = React.useState(contact.phone);
  const [email, setEmail] = React.useState(contact.email);
  const [otherPhones, setOtherPhones] = React.useState<string[]>(contact.otherPhones || []);
  const [otherEmails, setOtherEmails] = React.useState<string[]>(contact.otherEmails || []);
  const [jobTitle, setJobTitle] = React.useState(contact.jobTitle || "");
  const [company, setCompany] = React.useState(contact.company || "");
  const [work, setWork] = React.useState(contact.work || "");
  const [workLink, setWorkLink] = React.useState((contact as any).workLink || "");
  const [notes, setNotes] = React.useState(contact.notes || "");
  const [groups, setGroups] = React.useState<Group[]>(contact.groups || []);
  const [interests, setInterests] = React.useState<string[]>(() => {
    // Convert interests from Pair[] to string[]
    try {
      if (!contact.interests) return [];
      if (Array.isArray(contact.interests)) {
        return contact.interests.map((item: any) => {
          if (typeof item === 'string') return item;
          // If it's a Pair, format it as "key - value"
          if (item?.key && item?.value) {
            return `${item.key} - ${item.value}`;
          }
          return item?.key || item?.value || String(item);
        });
      }
      return [];
    } catch (error) {
      console.error("Error initializing interests:", error);
      return [];
    }
  });
  const [yoe, setYoe] = React.useState((contact as any).yoe || "");
  const [favourites, setFavourites] = React.useState((contact as any).favourites || "");
  
  // Location state - current location (array for consistency with form)
  const [currentLocation, setCurrentLocation] = React.useState<Array<{
    address?: string;
    address2?: string;
    city: string;
    country: string;
    state?: string;
    postalcode?: string;
    latitude: number;
    longitude: number;
  }>>(() => {
    if (contact.location) {
      return [{
        address: contact.location.address || "",
        city: contact.location.city || "",
        country: contact.location.country || "",
        latitude: contact.location.latitude || 0,
        longitude: contact.location.longitude || 0,
      }];
    }
    return [{
      city: "",
      country: "",
      latitude: 0,
      longitude: 0,
    }];
  });
  
  // Past locations
  const [pastLocations, setPastLocations] = React.useState<Array<{
    city: string;
    country: string;
    latitude: number;
    longitude: number;
  }>>(contact.pastLocations || []);
  
  // Visited locations
  const [visitedLocations, setVisitedLocations] = React.useState<Array<{
    city: string;
    country: string;
    latitude: number;
    longitude: number;
  }>>(contact.visited || []);
  
  // Social links state
  const [socialLinks, setSocialLinks] = React.useState({
    instagram: contact.socialLinks?.instagram || "",
    linkedin: contact.socialLinks?.linkedin || "",
    discord: contact.socialLinks?.discord || "",
    reddit: contact.socialLinks?.reddit || "",
    github: contact.socialLinks?.github || "",
    other: contact.socialLinks?.other || "",
  });

  // Reminders state
  const [reminders, setReminders] = React.useState<Array<{
    id?: string;
    type: string;
    message?: string;
    date: string;
    isRecurring?: boolean;
    recurringType: string;
    send?: string;
  }>>(() => {
    if (!contact.reminders || !Array.isArray(contact.reminders)) return [];
    return contact.reminders.map(r => ({
      id: r.id,
      type: r.type || ReminderType.EVENT,
      message: r.message || "",
      date: r.date || "",
      isRecurring: r.isRecurring || false,
      recurringType: r.recurringType || RecurringType.DOES_NOT_REPEAT,
      send: r.send || "",
    }));
  });

  const groupColors: Record<string, string> = {
    USER: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    FAMILY: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
    FRIENDS: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    WORK: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    ACQUAINTANCE: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    SCHOOL: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    COLLEGE: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
    OTHER: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  };

  const handleGroupToggle = (group: Group) => {
    setGroups(prev => 
      prev.includes(group)
        ? prev.filter(g => g !== group)
        : [...prev, group]
    );
  };

  const handleAddOtherPhone = () => {
    setOtherPhones([...otherPhones, ""]);
  };

  const handleRemoveOtherPhone = (index: number) => {
    setOtherPhones(otherPhones.filter((_, i) => i !== index));
  };

  const handleOtherPhoneChange = (index: number, value: string) => {
    const updated = [...otherPhones];
    updated[index] = value;
    setOtherPhones(updated);
  };

  const handleAddOtherEmail = () => {
    setOtherEmails([...otherEmails, ""]);
  };

  const handleRemoveOtherEmail = (index: number) => {
    setOtherEmails(otherEmails.filter((_, i) => i !== index));
  };

  const handleOtherEmailChange = (index: number, value: string) => {
    const updated = [...otherEmails];
    updated[index] = value;
    setOtherEmails(updated);
  };

  const handleAddReminder = () => {
    setReminders([...reminders, {
      type: ReminderType.EVENT,
      message: "",
      date: "",
      isRecurring: false,
      recurringType: RecurringType.DOES_NOT_REPEAT,
      send: "",
    }]);
  };

  const handleRemoveReminder = (index: number) => {
    setReminders(reminders.filter((_, i) => i !== index));
  };

  const handleReminderChange = (index: number, field: string, value: string | boolean) => {
    const updated = [...reminders];
    updated[index] = { ...updated[index], [field]: value };
    setReminders(updated);
  };

  const handleAddPastLocation = () => {
    setPastLocations([...pastLocations, { city: "", country: "", latitude: 0, longitude: 0 }]);
  };

  const handleRemovePastLocation = (index: number) => {
    setPastLocations(pastLocations.filter((_, i) => i !== index));
  };

  const handlePastLocationChange = (index: number, field: string, value: string | number) => {
    const updated = [...pastLocations];
    updated[index] = { ...updated[index], [field]: value };
    setPastLocations(updated);
  };

  const handleAddVisitedLocation = () => {
    setVisitedLocations([...visitedLocations, { city: "", country: "", latitude: 0, longitude: 0 }]);
  };

  const handleRemoveVisitedLocation = (index: number) => {
    setVisitedLocations(visitedLocations.filter((_, i) => i !== index));
  };

  const handleVisitedLocationChange = (index: number, field: string, value: string | number) => {
    const updated = [...visitedLocations];
    updated[index] = { ...updated[index], [field]: value };
    setVisitedLocations(updated);
  };

  const handleCurrentLocationChange = (index: number, field: string, value: string | number) => {
    const updated = [...currentLocation];
    updated[index] = { ...updated[index], [field]: value };
    setCurrentLocation(updated);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Convert interests from string[] to Pair[] format
      const interestsAsPairs = interests
        .filter(i => i.trim() !== "")
        .map(interest => {
          // If interest contains " - ", split it into key and value
          if (interest.includes(" - ")) {
            const [key, ...valueParts] = interest.split(" - ");
            return { key: key.trim(), value: valueParts.join(" - ").trim() };
          }
          // Otherwise, use the whole string as the key
          return { key: interest.trim(), value: "" };
        });

      // Validate required fields (according to schema: firstName, lastName, phone, email are required)
      if (!firstName || !lastName || !phone || !email) {
        toast.error("Please fill in all required fields (First Name, Last Name, Phone, Email)");
        setIsSaving(false);
        return;
      }

      // Validate yoe if provided (must be a positive integer > 0)
      if (yoe) {
        const yoeNum = parseInt(yoe);
        if (isNaN(yoeNum) || yoeNum <= 0) {
          toast.error("Years of Experience must be a positive integer greater than 0");
          setIsSaving(false);
          return;
        }
      }

      // Ensure groups is an array
      const groupsArray = Array.isArray(groups) ? groups : [];

      // Prepare contact update data
      const contactUpdateData: any = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        groups: groupsArray,
        interests: interestsAsPairs.length > 0 ? interestsAsPairs : [],
      };

      // Only include optional fields if they have values
      // Note: Schema uses middleNames (plural), but UI uses middleName (singular) for better UX
      if (middleName) contactUpdateData.middleNames = middleName.trim();
      if (otherPhones.filter(p => p.trim() !== "").length > 0) {
        contactUpdateData.otherPhones = otherPhones.filter(p => p.trim() !== "");
      }
      if (otherEmails.filter(e => e.trim() !== "").length > 0) {
        contactUpdateData.otherEmails = otherEmails.filter(e => e.trim() !== "");
      }
      if (jobTitle) contactUpdateData.jobTitle = jobTitle.trim();
      if (company) contactUpdateData.company = company.trim();
      if (work) contactUpdateData.work = work.trim();
      if (notes) contactUpdateData.notes = notes.trim();
      if (yoe) {
        const yoeNum = parseInt(yoe);
        if (!isNaN(yoeNum) && yoeNum > 0) {
          contactUpdateData.yoe = yoeNum;
        }
      }
      if (workLink) contactUpdateData.workLink = workLink.trim();
      if (favourites) contactUpdateData.favourites = favourites.trim();

      // Update contact
      const { data: contactData, error: contactError } = await updateContact(contact.userId, contactUpdateData);

      if (contactError) {
        console.error("Error updating contact:", contactError);
        toast.error(`Failed to update contact: ${contactError.message || contactError}`);
        setIsSaving(false);
        return;
      }

      // Update socials
      const { error: socialsError } = await upsertSocials(contact.userId, socialLinks);

      if (socialsError) {
        console.error("Error updating socials:", socialsError);
        toast.error(`Failed to update socials: ${socialsError.message || socialsError}`);
        // Don't return here, contact was saved successfully
      }

      // Update locations - append new locations
      // For current location, replace existing (only one current location)
      if (currentLocation.length > 0 && currentLocation[0].city) {
        // Delete existing current location first
        const { error: deleteError } = await supabase
          .from("Location")
          .delete()
          .eq("userId", contact.userId)
          .eq("type", LocationType.CURRENT);
        
        if (!deleteError) {
          // Then insert the new one
          const { error: currentLocError } = await upsertLocations(
            contact.userId,
            currentLocation.map(loc => ({
              address: loc.address,
              address2: loc.address2,
              city: loc.city,
              country: loc.country,
              state: loc.state,
              postalcode: loc.postalcode,
              latitude: loc.latitude,
              longitude: loc.longitude,
            })),
            LocationType.CURRENT
          );
          if (currentLocError) {
            console.error("Error updating current location:", currentLocError);
            toast.error(`Failed to update current location: ${currentLocError.message || currentLocError}`);
          }
        }
      }

      // Append past locations (don't delete existing)
      const newPastLocations = pastLocations.filter(loc => loc.city && loc.country && loc.city.trim() !== "" && loc.country.trim() !== "");
      if (newPastLocations.length > 0) {
        const { error: pastLocError } = await upsertLocations(
          contact.userId,
          newPastLocations.map(loc => ({
            city: loc.city,
            country: loc.country,
            latitude: loc.latitude,
            longitude: loc.longitude,
          })),
          LocationType.PREVIOUS
        );
        if (pastLocError) {
          console.error("Error adding past locations:", pastLocError);
          toast.error(`Failed to add past locations: ${pastLocError.message || pastLocError}`);
        }
      }

      // Append visited locations (don't delete existing)
      const newVisitedLocations = visitedLocations.filter(loc => loc.city && loc.country && loc.city.trim() !== "" && loc.country.trim() !== "");
      if (newVisitedLocations.length > 0) {
        const { error: visitedLocError } = await upsertLocations(
          contact.userId,
          newVisitedLocations.map(loc => ({
            city: loc.city,
            country: loc.country,
            latitude: loc.latitude,
            longitude: loc.longitude,
          })),
          LocationType.VISITED
        );
        if (visitedLocError) {
          console.error("Error adding visited locations:", visitedLocError);
          toast.error(`Failed to add visited locations: ${visitedLocError.message || visitedLocError}`);
        }
      }

      // Save reminders
      const validReminders = reminders.filter(r => r.date.trim() !== "");
      
      // Get existing reminder IDs to track which ones to delete
      const existingReminderIds = contact.reminders?.map(r => r.id).filter(Boolean) || [];
      const currentReminderIds = validReminders.map(r => r.id).filter(Boolean) as string[];
      const remindersToDelete = existingReminderIds.filter(id => !currentReminderIds.includes(id));

      // Delete removed reminders
      for (const reminderId of remindersToDelete) {
        await deleteReminder(reminderId);
      }

      // Upsert reminders
      for (const reminder of validReminders) {
        const { error: reminderError } = await upsertReminder(
          reminder.id || null,
          contact.userId,
          {
            type: reminder.type,
            message: reminder.message?.trim() || undefined,
            date: reminder.date.trim(),
            isRecurring: reminder.isRecurring || false,
            recurringType: reminder.recurringType,
            send: reminder.send?.trim() || undefined,
          }
        );
        if (reminderError) {
          console.error("Error saving reminder:", reminderError);
          toast.error(`Failed to save reminder: ${reminderError.message || reminderError}`);
        }
      }

      toast.success("Contact updated successfully");
      setIsOpen(false);
      
      // Refresh the page data after a short delay to ensure the toast is visible
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error: any) {
      console.error("Error updating contact:", error);
      toast.error(`Failed to update contact: ${error?.message || "Unknown error"}`);
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="link" className="w-fit px-0 text-left text-foreground">
          {contact.firstName} {contact.lastName}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="gap-1">
          <SheetTitle>Edit Contact</SheetTitle>
          <SheetDescription>
            Update contact information below
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-6 overflow-y-auto py-4 text-sm">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="location">Location</TabsTrigger>
              <TabsTrigger value="dates">Dates</TabsTrigger>
              <TabsTrigger value="social">Social</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="middleName">Middle Name(s)</Label>
                <Input
                  id="middleName"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input
                    id="jobTitle"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="work">Work</Label>
                  <Input
                    id="work"
                    value={work}
                    onChange={(e) => setWork(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="workLink">Work Link</Label>
                  <Input
                    id="workLink"
                    type="url"
                    value={workLink}
                    onChange={(e) => setWorkLink(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="yoe">Years of Experience</Label>
                <Input
                  id="yoe"
                  type="number"
                  min="1"
                  value={yoe}
                  onChange={(e) => setYoe(e.target.value)}
                  placeholder="Must be greater than 0"
                />
                <p className="text-xs text-muted-foreground">
                  Enter a positive integer greater than 0
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="favourites">Favourites</Label>
                <Input
                  id="favourites"
                  value={favourites}
                  onChange={(e) => setFavourites(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Groups</Label>
                <div className="flex flex-wrap gap-2">
                  {Object.values(Group)
                    .filter((value) => typeof value === "string")
                    .map((group) => (
                      <div key={group} className="flex items-center space-x-2">
                        <Checkbox
                          id={`group-${group}`}
                          checked={groups.includes(group as unknown as Group)}
                          onCheckedChange={() => handleGroupToggle(group as unknown as Group)}
                        />
                        <Label
                          htmlFor={`group-${group}`}
                          className={`text-sm font-normal cursor-pointer px-2 py-1 rounded-md ${groups.includes(group as unknown as Group) ? groupColors[group] : "bg-muted"}`}
                        >
                          {group}
                        </Label>
                      </div>
                    ))}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Interests and Hobbies</Label>
                <TagsInput
                  value={interests}
                  onValueChange={setInterests}
                  placeholder="Enter your tags (e.g., Music - I play the Piano)"
                />
                <p className="text-xs text-muted-foreground">
                  Enter interests one by one! Format: Interest - Description (e.g., Music - I play the Piano)
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </TabsContent>

            <TabsContent value="contact" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
              <Separator />
              <div className="flex flex-col gap-2">
                <Label>Other Phones</Label>
                {otherPhones.map((phone, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => handleOtherPhoneChange(index, e.target.value)}
                      placeholder="Additional phone number"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveOtherPhone(index)}
                    >
                      <XIcon className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddOtherPhone}
                  className="w-fit"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Phone
                </Button>
              </div>
              <Separator />
              <div className="flex flex-col gap-2">
                <Label>Other Emails</Label>
                {otherEmails.map((email, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => handleOtherEmailChange(index, e.target.value)}
                      placeholder="Additional email address"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveOtherEmail(index)}
                    >
                      <XIcon className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddOtherEmail}
                  className="w-fit"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Email
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="dates" className="space-y-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label>Reminders / Important Dates</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddReminder}
                    className="w-fit"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Reminder
                  </Button>
                </div>
                {reminders.map((reminder, index) => (
                  <div key={index} className="space-y-3 p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium">Reminder {index + 1}</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveReminder(index)}
                      >
                        <XIcon className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <Label>Type</Label>
                        <Select
                          value={reminder.type}
                          onValueChange={(value) => handleReminderChange(index, "type", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(ReminderType).map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>Date *</Label>
                        <Input
                          type="date"
                          value={reminder.date}
                          onChange={(e) => handleReminderChange(index, "date", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label>Message / Note</Label>
                      <Input
                        value={reminder.message || ""}
                        onChange={(e) => handleReminderChange(index, "message", e.target.value)}
                        placeholder="E.g., Birthday reminder"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`recurring-${index}`}
                          checked={reminder.isRecurring || false}
                          onCheckedChange={(checked) => handleReminderChange(index, "isRecurring", !!checked)}
                        />
                        <Label htmlFor={`recurring-${index}`} className="text-sm font-normal cursor-pointer">
                          Recurring
                        </Label>
                      </div>
                      {reminder.isRecurring && (
                        <div className="flex flex-col gap-2">
                          <Label>Recurring Type</Label>
                          <Select
                            value={reminder.recurringType}
                            onValueChange={(value) => handleReminderChange(index, "recurringType", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.values(RecurringType).map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                    {reminder.isRecurring && reminder.recurringType === RecurringType.DOES_NOT_REPEAT && (
                      <p className="text-xs text-muted-foreground">
                        Please select a recurring type when recurring is enabled
                      </p>
                    )}
                    <div className="flex flex-col gap-2">
                      <Label>Send Time (optional)</Label>
                      <Input
                        type="time"
                        value={reminder.send || ""}
                        onChange={(e) => handleReminderChange(index, "send", e.target.value)}
                      />
                    </div>
                  </div>
                ))}
                {reminders.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No reminders added. Click "Add Reminder" to create one.
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="location" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Current Location</Label>
                </div>
                {currentLocation.map((loc, index) => (
                  <div key={index} className="space-y-4 p-4 border rounded-lg">
                    <div className="flex flex-col gap-2">
                      <Label>Address</Label>
                      <Input
                        value={loc.address || ""}
                        onChange={(e) => handleCurrentLocationChange(index, "address", e.target.value)}
                        placeholder="Street address"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label>Address 2</Label>
                      <Input
                        value={loc.address2 || ""}
                        onChange={(e) => handleCurrentLocationChange(index, "address2", e.target.value)}
                        placeholder="Apartment, suite, etc."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <Label>City *</Label>
                        <Input
                          value={loc.city}
                          onChange={(e) => handleCurrentLocationChange(index, "city", e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>Country *</Label>
                        <Input
                          value={loc.country}
                          onChange={(e) => handleCurrentLocationChange(index, "country", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex flex-col gap-2">
                        <Label>State</Label>
                        <Input
                          value={loc.state || ""}
                          onChange={(e) => handleCurrentLocationChange(index, "state", e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>Postal Code</Label>
                        <Input
                          value={loc.postalcode || ""}
                          onChange={(e) => handleCurrentLocationChange(index, "postalcode", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <Label>Latitude</Label>
                        <Input
                          type="number"
                          step="any"
                          value={loc.latitude}
                          onChange={(e) => handleCurrentLocationChange(index, "latitude", parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>Longitude</Label>
                        <Input
                          type="number"
                          step="any"
                          value={loc.longitude}
                          onChange={(e) => handleCurrentLocationChange(index, "longitude", parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Previously Lived</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddPastLocation}
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Location
                  </Button>
                </div>
                {pastLocations.map((loc, index) => (
                  <div key={index} className="space-y-4 p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium">Location {index + 1}</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemovePastLocation(index)}
                      >
                        <XIcon className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <Label>City</Label>
                        <Input
                          value={loc.city}
                          onChange={(e) => handlePastLocationChange(index, "city", e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>Country</Label>
                        <Input
                          value={loc.country}
                          onChange={(e) => handlePastLocationChange(index, "country", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <Label>Latitude</Label>
                        <Input
                          type="number"
                          step="any"
                          value={loc.latitude}
                          onChange={(e) => handlePastLocationChange(index, "latitude", parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>Longitude</Label>
                        <Input
                          type="number"
                          step="any"
                          value={loc.longitude}
                          onChange={(e) => handlePastLocationChange(index, "longitude", parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Visited Places</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddVisitedLocation}
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Location
                  </Button>
                </div>
                {visitedLocations.map((loc, index) => (
                  <div key={index} className="space-y-4 p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium">Location {index + 1}</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveVisitedLocation(index)}
                      >
                        <XIcon className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <Label>City</Label>
                        <Input
                          value={loc.city}
                          onChange={(e) => handleVisitedLocationChange(index, "city", e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>Country</Label>
                        <Input
                          value={loc.country}
                          onChange={(e) => handleVisitedLocationChange(index, "country", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <Label>Latitude</Label>
                        <Input
                          type="number"
                          step="any"
                          value={loc.latitude}
                          onChange={(e) => handleVisitedLocationChange(index, "latitude", parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>Longitude</Label>
                        <Input
                          type="number"
                          step="any"
                          value={loc.longitude}
                          onChange={(e) => handleVisitedLocationChange(index, "longitude", parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="social" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={socialLinks.instagram}
                    onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                    placeholder="@username"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={socialLinks.linkedin}
                    onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                    placeholder="Profile URL"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="discord">Discord</Label>
                  <Input
                    id="discord"
                    value={socialLinks.discord}
                    onChange={(e) => setSocialLinks({ ...socialLinks, discord: e.target.value })}
                    placeholder="username#1234"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="reddit">Reddit</Label>
                  <Input
                    id="reddit"
                    value={socialLinks.reddit}
                    onChange={(e) => setSocialLinks({ ...socialLinks, reddit: e.target.value })}
                    placeholder="u/username"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="github">GitHub</Label>
                  <Input
                    id="github"
                    value={socialLinks.github}
                    onChange={(e) => setSocialLinks({ ...socialLinks, github: e.target.value })}
                    placeholder="username"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="socialOther">Other</Label>
                  <Input
                    id="socialOther"
                    value={socialLinks.other}
                    onChange={(e) => setSocialLinks({ ...socialLinks, other: e.target.value })}
                    placeholder="Other social link"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        <SheetFooter className="mt-auto flex gap-2 sm:flex-col sm:space-x-0 pt-4 border-t">
          <Button 
            className="w-full" 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
          <SheetClose asChild>
            <Button variant="outline" className="w-full">
              Close
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
