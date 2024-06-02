import { FC } from "react";
import { PRecord, User } from "~/type";
import { Box, IconButton, Tooltip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { MRT_Row, MRT_TableInstance } from "material-react-table";
import { nameChipRendererByRole } from "./SchedulingTable";

interface Props {
    row: MRT_Row<PRecord>,
    table: MRT_TableInstance<PRecord>
    user: User
    emitChangeRecord: (id: string, record: PRecord) => void
    openDeleteConfirmModal: (row: MRT_Row<PRecord>) => void
}

const SchedulingTableRow: FC<Props> = ({ user, table, row, emitChangeRecord, openDeleteConfirmModal }) => {
    return (row.original.LockingUser && row.original.LockingUser.id != user.id ? (
        <Box sx={{ display: "flex", justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
            {nameChipRendererByRole(row.original.LockingUser.role!, row.original.LockingUser?.name)}
        </Box>) : <Box sx={{ display: "flex", gap: "1rem" }}>
        <Tooltip title="수정">
            <IconButton
                onClick={() => {
                    if (row.original.LockingUser) {
                        return
                    }
                    table.setEditingRow(row);
                    emitChangeRecord(row.id, row.original);
                }}
            >
                <EditIcon />
            </IconButton>
        </Tooltip>
        <Tooltip title="삭제">
            <IconButton color="error" onClick={() => openDeleteConfirmModal(row)}>
                <DeleteIcon />
            </IconButton>
        </Tooltip>
    </Box>)
}

export default SchedulingTableRow