"use client";

import {
    Box,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    useTheme
} from "@mui/material";
import type { ColumnDef } from "@tanstack/react-table";
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable
} from "@tanstack/react-table";
interface CustomTableProps<T extends object> {
    data: T[];
    columns: ColumnDef<T, any>[];
    pagination?: boolean;
    sortable?: boolean;
    className?: string;
    loading?: boolean
    skeletonRows?: number,
    maxHeight?: string;
}

export default function CustomTable<T extends object>({
    data,
    columns,
    pagination = false,
    sortable = true,
    className,
    loading,
    skeletonRows = 8,
}: CustomTableProps<T>) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: pagination ? getPaginationRowModel() : undefined,
        getSortedRowModel: sortable ? getSortedRowModel() : undefined,
        getFilteredRowModel: getFilteredRowModel(),
    });

    const theme = useTheme();
    return (
        <Box className={`${className} h-full overflow-hidden`} >
            <TableContainer
                sx={{
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.separator.dark}`,
                }}
                className="w-full h-full overflow-auto">
                <Table className="h-full">
                    <TableHead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableCell
                                        key={header.id}
                                        sx={{
                                            position: "sticky",
                                            top: 0,
                                            zIndex: 2,
                                            backgroundColor: theme.palette.background.paper,
                                            // fontWeight: 600,
                                            borderBottom: `1px solid ${theme.palette.separator.dark}`,
                                        }}
                                        className="py-2! px-3! 2xl:px-4! 2xl:py-4!"
                                    >
                                        <Typography variant="subtitle2" color="text.middle" className="text-nowrap">
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                        </Typography>
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableHead>

                    <TableBody>
                        {loading ? (
                            Array.from({ length: skeletonRows }).map((_, rowIndex) => (
                                <TableRow key={`skeleton-${rowIndex}`}>
                                    {columns.map((_, cellIndex) => (
                                        <TableCell key={`skeleton-cell-${cellIndex}`} className="py-2! px-3! 2xl:px-4! 2xl:py-4!">
                                            <Skeleton
                                                variant="text"
                                                width={cellIndex === 0 ? "60%" : "80%"}
                                                height={24}
                                                sx={{
                                                    bgcolor: theme.palette.mode === 'dark'
                                                        ? 'rgba(255, 255, 255, 0.1)'
                                                        : 'rgba(0, 0, 0, 0.06)',
                                                }}
                                            />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} className="align-sub!">
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="py-2! px-3! 2xl:px-4! 2xl:py-4!">
                                            <Typography variant="body2" color="text.dark">
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </Typography>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
