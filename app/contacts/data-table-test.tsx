"use client"

import * as React from "react"
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
} from "@tanstack/react-table"
import {
  CheckCircle2Icon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ColumnsIcon,
  MoreVerticalIcon,
  PlusIcon,
} from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"

import { useIsMobile } from "@/hooks/use-mobile"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Group } from "@/types/Enums/Group"
import { Contact } from "@/types/contact"

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
    size: 40,
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 text-muted-foreground data-[state=open]:bg-muted"
          >
            <MoreVerticalIcon className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
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
    size: 40,
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
    size: 180,
    cell: ({ row }) => {
      return <TableCellViewer contact={row.original} />
    },
    enableHiding: false,
  },
  {
    accessorKey: "phone",
    header: "Phone",
    size: 140,
    cell: ({ row }) => (
      <div className="truncate">
        {row.original.phone || <span className="text-muted-foreground">-</span>}
      </div>
    ),
  },
  {
    accessorKey: "company",
    header: "Company",
    size: 150,
    cell: ({ row }) => (
      <Badge variant="outline" className="truncate px-1.5 text-muted-foreground">
        {row.original.company}
      </Badge>
    ),
  },
  {
    accessorKey: "jobTitle",
    header: "Job Title",
    size: 150,
    cell: ({ row }) => (
      <div className="truncate">
        {row.original.jobTitle || <span className="text-muted-foreground">-</span>}
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    size: 180,
    cell: ({ row }) => (
      <div className="truncate">
        {row.original.email || <span className="text-muted-foreground">-</span>}
      </div>
    ),
  },
  {
    accessorKey: "location",
    header: "Location",
    size: 150,
    cell: ({ row }) => (
      <div className="truncate">
        {row.original.location.city+", "+row.original.location.country || 
         <span className="text-muted-foreground">-</span>}
      </div>
    ),
  },
  {
    accessorKey: "groups",
    header: "Groups",
    size: 200,
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.original.groups.length > 0 ? (
          row.original.groups.slice(0, 3).map(group => (
            <Badge key={group} variant="secondary" className="truncate max-w-[80px]">
              {group}
            </Badge>
          ))
        ) : (
          <span className="text-muted-foreground">None</span>
        )}
        {row.original.groups.length > 3 && (
          <Badge variant="outline" className="text-muted-foreground">
            +{row.original.groups.length - 3}
          </Badge>
        )}
      </div>
    ),
  },
]

export function DataTable({ data }: { data: Contact[] }) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })

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
    getRowId: (row) => row.id,
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
  })

  return (
    <Tabs defaultValue="contacts" className="w-full">
      <div className="flex items-center justify-between px-4 py-2">
        <TabsList className="hidden md:flex">
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="groups" className="gap-1">
            Groups
            <Badge variant="secondary" className="h-5 w-5 p-0">
              {data.reduce((acc, contact) => acc + contact.groups.length, 0)}
            </Badge>
          </TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <ColumnsIcon className="mr-2 h-4 w-4" />
                <span>Columns</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {table.getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" className="h-8">
            <PlusIcon className="mr-2 h-4 w-4" />
            <span>Add</span>
          </Button>
        </div>
      </div>

      <TabsContent value="contacts" className="px-4">
        <div className="rounded-md border">
          <Table className="[&_td]:px-3 [&_td]:py-2 [&_th]:px-3 [&_th]:py-2">
            <TableHeader className="bg-muted">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead 
                      key={header.id} 
                      style={{ width: `${header.getSize()}px` }}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="truncate">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No contacts found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between py-2">
          <div className="text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} selected
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>
              <div className="text-sm">
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="groups" className="px-4">
        <div className="flex h-60 items-center justify-center rounded-md border border-dashed">
          <div className="text-muted-foreground">Groups content</div>
        </div>
      </TabsContent>
    </Tabs>
  )
}

function TableCellViewer({ contact }: { contact: Contact }) {
  const isMobile = useIsMobile()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="link" className="h-auto p-0 text-left">
          {contact.name}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col">
        <SheetHeader className="gap-1">
          <SheetTitle>{contact.name}</SheetTitle>
          <SheetDescription>
            {contact.jobTitle} at {contact.company}
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 space-y-4 overflow-y-auto py-4 text-sm">
          {!isMobile && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-muted-foreground">Email</div>
                  <div>{contact.email || "-"}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">Phone</div>
                  <div>{contact.phone || "-"}</div>
                </div>
              </div>
              <Separator />
            </>
          )}
          <form className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input defaultValue={contact.name} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Company</Label>
                <Input defaultValue={contact.company} />
              </div>
              <div className="space-y-2">
                <Label>Job Title</Label>
                <Input defaultValue={contact.jobTitle || ""} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input defaultValue={contact.email} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input defaultValue={contact.phone} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input defaultValue={`${contact.location.city}, ${contact.location.country}`} />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <div className="rounded-md border p-3 text-sm">
                {contact.notes || "No notes"}
              </div>
            </div>
          </form>
        </div>
        <SheetFooter className="gap-2 sm:flex-col">
          <Button>Save Changes</Button>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}