import { Button } from "@mui/joy";
import { AgGridReact } from "ag-grid-react"; // React Data Grid Component
import { PRecord } from "../../type";
import { Dispatch, FC, RefObject, SetStateAction, useState } from "react";
import { SCHEDULING_ROOM_ID } from "shared";
import { emitCreateRecord } from "~/utils/Table/socket";
import { Socket } from "socket.io-client";
import { insertRecord } from "~/utils/request.client";
import { converServerPRecordtToPRecord } from "~/utils/utils";
import axios from "axios";

type TableActionHeader = {
  gridRef: RefObject<AgGridReact<PRecord>>;
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
  const onAddRecord = async () => {
    if (gridRef.current) {
      let newRecord = {opReadiness: "N"} as PRecord;

      const result = await insertRecord(newRecord)      
      if (result) {
        newRecord = converServerPRecordtToPRecord(result)
        gridRef.current.api.applyTransaction({
          add: [newRecord],
          addIndex: 0,
        });
        emitCreateRecord(newRecord, "Ready", socket, SCHEDULING_ROOM_ID);
      }
    }
  };
  const onDeleteRecord = async () => {
    if (gridRef.current) {
      const records = gridRef.current.api.getSelectedRows()
      
      
      for (let i = 0; records.length; i++) {
        records[i].deleteYN = true
      }
      const result = await axios.post("http://localhost:5000/api/updateRecords", {records})
      if (result.status === 200){
        gridRef.current.api.applyTransaction({
          remove: records
        })
      }
    }
  }
  return  <>
      <Button onClick={onAddRecord}>추가</Button>
      <Button onClick={onDeleteRecord}>삭제</Button>
    </>
};
