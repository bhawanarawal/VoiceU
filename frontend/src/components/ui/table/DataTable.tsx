import React from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from ".";

interface Column<T> {
  header: string;
  key: keyof T;
  align?: "left" | "center" | "right";
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  renderActions?: (row: T) => React.ReactNode;
  emptyMessage?: string;
}

function DataTable<T extends { [key: string]: any }>({
  columns,
  data,
  renderActions,
  emptyMessage = "No data found",
}: DataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          {/* Header */}
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={String(col.key)}
                  isHeader
                  className={`px-5 py-4 text-sm font-semibold text-gray-500 ${
                    col.align === "center"
                      ? "text-center"
                      : col.align === "right"
                      ? "text-right"
                      : "text-left"
                  }`}
                >
                  {col.header}
                </TableCell>
              ))}

              {renderActions && (
                <TableCell
                  isHeader
                  className="px-5 py-4 text-sm font-semibold text-gray-500 text-left"
                >
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHeader>

          {/* Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {data.length === 0 ? (
              <TableRow>
                <td
                  colSpan={columns.length + (renderActions ? 1 : 0)}
                  className="px-5 py-6 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow key={index}>
                  {columns.map((col) => (
                    <TableCell
                      key={String(col.key)}
                      className={`px-5 py-4 text-gray-800 dark:text-gray-200 ${
                        col.align === "center"
                          ? "text-center"
                          : col.align === "right"
                          ? "text-right"
                          : "text-left"
                      }`}
                    >
                      {row[col.key] ?? "-"}
                    </TableCell>
                  ))}

                  {renderActions && (
                    <TableCell className="px-5 py-4">
                      {renderActions(row)}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default DataTable;
