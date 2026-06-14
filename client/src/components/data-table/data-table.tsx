import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type Table as TanStackTable,
} from "@tanstack/react-table";
import { useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/base/table";
import { cn } from "@/lib/utils";

import { DataTablePagination } from "./data-table-pagination";
import {
  DataTableView,
  type DataTableViewLayout,
  type DataTableViewVariant,
} from "./data-table-view";

const DEFAULT_PAGE_SIZE = 20;

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  emptyMessage?: string;
  enableRowSelection?: boolean;
  getRowId?: (row: TData) => string;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  toolbar?: React.ReactNode;
  showPagination?: boolean;
  selectedCountLabel?: string;
  variant?: DataTableViewVariant;
  layout?: DataTableViewLayout;
};

export function DataTable<TData, TValue>({
  columns,
  data,
  emptyMessage = "No results.",
  enableRowSelection = false,
  getRowId,
  rowSelection: controlledRowSelection,
  onRowSelectionChange: controlledOnRowSelectionChange,
  toolbar,
  showPagination = true,
  selectedCountLabel,
  variant = "card",
  layout = "inline",
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  });
  const [internalRowSelection, setInternalRowSelection] =
    useState<RowSelectionState>({});

  const rowSelection = controlledRowSelection ?? internalRowSelection;
  const onRowSelectionChange =
    controlledOnRowSelectionChange ?? setInternalRowSelection;

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination,
      rowSelection,
    },
    enableRowSelection,
    getRowId,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onRowSelectionChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const columnCount = table.getAllColumns().length;
  const selectedCount = Object.keys(rowSelection).length;

  const selectionLabel =
    selectedCount > 0 && selectedCountLabel
      ? selectedCountLabel.replace("{count}", String(selectedCount))
      : null;

  const tableContent = (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow
            key={headerGroup.id}
            className={cn(
              "bg-muted/40 hover:bg-muted/40",
              layout === "sticky" && "sticky top-0 z-10",
            )}
          >
            {headerGroup.headers.map((header, index) => (
              <TableHead
                key={header.id}
                className={cn(
                  "py-2.5 text-xs font-medium text-muted-foreground",
                  index === 0 ? "pl-4 pr-3" : "px-3",
                )}
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.length > 0 ? (
          table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() ? "selected" : undefined}
              className="data-[state=selected]:bg-muted/50"
            >
              {row.getVisibleCells().map((cell, index) => (
                <TableCell
                  key={cell.id}
                  className={cn(
                    "py-2.5",
                    index === 0 ? "pl-4 pr-3" : "px-3",
                  )}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={columnCount}
              className="h-24 px-3 py-2.5 text-center text-muted-foreground"
            >
              {emptyMessage}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <DataTableView
      toolbar={toolbar}
      selectionLabel={selectionLabel}
      footer={showPagination ? <DataTablePagination table={table} /> : null}
      variant={variant}
      layout={layout}
    >
      {layout === "sticky" ? (
        <div className="min-h-0 flex-1 overflow-auto">{tableContent}</div>
      ) : (
        tableContent
      )}
    </DataTableView>
  );
}

export type { TanStackTable };
