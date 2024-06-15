import { FC, MutableRefObject } from "react";
import { PRecord, TableType, User } from "~/type";
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
import { OP_READINESS } from "~/constant";

interface Props {
    row: MRT_Row<PRecord>,
    table: MRT_TableInstance<PRecord>
    user: User
    originalPRecord: MutableRefObject<PRecord | undefined>
    emitChangeRecord: (id: string, record: PRecord, tableType: TableType) => void
    openDeleteConfirmModal: (row: MRT_Row<PRecord>) => void
    tableType: TableType
}

const SchedulingTableRowAction: FC<Props> = ({ user, table, row, emitChangeRecord, openDeleteConfirmModal, originalPRecord, tableType }) => {
    const onClickEditIcon = () => {
        if (row.original.LockingUser) {
            return
        }
        originalPRecord.current = JSON.parse(JSON.stringify(row.original))
        table.getColumn(OP_READINESS).columnDef.editSelectOptions = [{ label: '준비 완료', value: 'Y' }, { label: '준비 미완료', value: 'N' }, { label: '시술 완료', value: 'C' }, { label: "시술 중", value: 'P' }]
        table.setEditingRow(row);
        emitChangeRecord(row.id, row.original, tableType);
    }
    return <Box sx={{ display: "flex", justifyContent: 'center', alignItems: 'center', zIndex: 100, width: '100%' }}>
        {row.original.LockingUser && row.original.LockingUser.id != user.id
            ? nameChipRendererByRole(row.original.LockingUser.role!, row.original.LockingUser?.name)
            : <Dropdown>
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
            </Dropdown>}
    </Box>
}

export default SchedulingTableRowAction