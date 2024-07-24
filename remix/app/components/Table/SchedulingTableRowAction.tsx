/** @format */

import { FC, MutableRefObject } from "react";
import { PRecord, TableType, User } from "~/type";
import { Box, IconButton } from "@mui/material";
import { MRT_Row, MRT_TableInstance } from "material-react-table";
import { MoreHoriz } from "@mui/icons-material";
import { ListItemDecorator } from "@mui/joy";
import { nameChipRendererByRole } from "./ColumnRenderers";
import { Socket } from "socket.io-client";
import Dropdown from "@mui/joy/Dropdown";
import Menu from "@mui/joy/Menu";
import MenuButton from "@mui/joy/MenuButton";
import MenuItem from "@mui/joy/MenuItem";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useRecoilValue } from "recoil";
import { userState } from "~/recoil_state";

interface Props {
  row: MRT_Row<PRecord>;
  table: MRT_TableInstance<PRecord>;
  originalPRecord: MutableRefObject<PRecord | undefined>;
  emitLockRecord: (id: string, tableType: TableType, socket: Socket | null, user: User, roomId: string) => void;
  openDeleteConfirmModal: (row: MRT_Row<PRecord>) => void;
  socket: Socket | null;
  tableType: TableType;
  roomId: string;
}

const SchedulingTableRowAction: FC<Props> = ({ table, row, emitLockRecord, openDeleteConfirmModal, originalPRecord, tableType, socket, roomId }) => {
  const user = useRecoilValue(userState);
  const onClickEditIcon = () => {
    if (!user) {
      return;
    }
    if (row.original.LockingUser) {
      return;
    }
    originalPRecord.current = JSON.parse(JSON.stringify(row.original));
    table.setEditingRow(row);
    emitLockRecord(row.id, tableType, socket, user, roomId);
  };
  return (
    user && (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 100,
          width: "100%",
        }}>
        {row.original.LockingUser && row.original.LockingUser.id != user.id ? (
          nameChipRendererByRole(row.original.LockingUser.role!, row.original.LockingUser?.name)
        ) : (
          <Dropdown>
            <MenuButton slots={{ root: IconButton }} slotProps={{ root: { variant: "outlined", color: "neutral" } }}>
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
        )}
      </Box>
    )
  );
};

export default SchedulingTableRowAction;
