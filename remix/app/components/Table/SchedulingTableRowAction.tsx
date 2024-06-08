import { FC, MutableRefObject } from "react";
import { PRecord, User } from "~/type";
import { Box, IconButton } from "@mui/material";
import Dropdown from '@mui/joy/Dropdown';
import Menu from '@mui/joy/Menu';
import MenuButton from '@mui/joy/MenuButton';
import MenuItem from '@mui/joy/MenuItem';
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { MRT_Row, MRT_TableInstance } from "material-react-table";
import { MoreHoriz } from "@mui/icons-material";
import { ListItemDecorator } from "@mui/joy";
import { nameChipRendererByRole } from "./ColumnRenderers";

interface Props {
    row: MRT_Row<PRecord>,
    table: MRT_TableInstance<PRecord>
    user: User
    originalPRecord: MutableRefObject<PRecord | undefined>
    emitChangeRecord: (id: string, record: PRecord) => void
    openDeleteConfirmModal: (row: MRT_Row<PRecord>) => void
}

const SchedulingTableRowAction: FC<Props> = ({ user, table, row, emitChangeRecord, openDeleteConfirmModal, originalPRecord }) => {
    const onClickEditIcon = () => {
        if (row.original.LockingUser) {
            return
        }
        originalPRecord.current = JSON.parse(JSON.stringify(row.original))
        table.setEditingRow(row);
        emitChangeRecord(row.id, row.original);
    }
    return (row.original.LockingUser && row.original.LockingUser.id != user.id ? (
        <Box sx={{ display: "flex", justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
            {nameChipRendererByRole(row.original.LockingUser.role!, row.original.LockingUser?.name)}
        </Box>) :
        <Dropdown>
            <MenuButton
                slots={{ root: IconButton }}
                slotProps={{ root: { variant: 'outlined', color: 'neutral' } }}
            >
                <MoreHoriz />
            </MenuButton>
            <Menu>
                <MenuItem onClick={onClickEditIcon}>
                    <ListItemDecorator>
                        <EditIcon />
                    </ListItemDecorator>
                    수정
                </MenuItem>
                <MenuItem color="danger" onClick={() => openDeleteConfirmModal(row)}>
                    <ListItemDecorator>
                        <DeleteIcon />
                    </ListItemDecorator>
                    삭제
                </MenuItem>
            </Menu>
        </Dropdown>
    )
}

export default SchedulingTableRowAction