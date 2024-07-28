import { Button } from "@mui/joy";
import dayjs from "dayjs";
import { AgGridReact } from "ag-grid-react"; // React Data Grid Component
import { PRecord } from "../../type";
import { Dispatch, FC, RefObject, SetStateAction, useState } from "react";
import { SCHEDULING_ROOM_ID } from "shared";
import { emitCreateRecord } from "~/utils/Table/socket";
import { Socket } from "socket.io-client";

type TableActionHeader = {
  gridRef: RefObject<AgGridReact<any>>;
  setPinnedTopRowData: Dispatch<SetStateAction<PRecord[]>>;
  socket: Socket | null;
};

export const TableAction: FC<TableActionHeader> = ({ gridRef, setPinnedTopRowData, socket }) => {
  const [isCreating, setIsCreating] = useState(false);
  function generateRandomString(length: number) {
    const characters = "abcdefghijklmnopqrstuvwxyz";
    let result = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
    }
    return result;
  }
  const onAddRecord = () => {
    if (gridRef.current) {
      const newRecord = {
        id: generateRandomString(10),
        checkInTime: dayjs().unix(),
      } as PRecord;
      gridRef.current.api.applyTransaction({
        add: [newRecord],
        addIndex: 0,
      });
      emitCreateRecord(newRecord, "Ready", socket, SCHEDULING_ROOM_ID);
    }
  };
  return isCreating ? (
    <>
      <Button onClick={onAddRecord}>취소</Button>
      <Button>완료</Button>
    </>
  ) : (
    <Button onClick={onAddRecord}>추가</Button>
  );
};
