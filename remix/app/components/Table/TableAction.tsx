import { Box, Button } from "@mui/joy";
import { AgGridReact } from "ag-grid-react"; // React Data Grid Component
import { PRecord } from "../../type";
import { Dispatch, FC, RefObject, SetStateAction, useState } from "react";
import { SCHEDULING_ROOM_ID } from "shared";
import { emitCreateRecord } from "~/utils/Table/socket";
import { Socket } from "socket.io-client";
import { insertRecord } from "~/utils/request.client";
import { convertServerPRecordtToPRecord } from "~/utils/utils";
import axios from "axios";
import { MOCK } from "~/constant";
import dayjs from "dayjs";

type TableActionHeader = {
  gridRef: RefObject<AgGridReact<PRecord>>;
  setPinnedTopRowData: Dispatch<SetStateAction<PRecord[]>>;
  socket: Socket | null;
};

export const TableAction: FC<TableActionHeader> = ({ gridRef, setPinnedTopRowData, socket }) => {
  const onAddRecord = async () => {
    if (gridRef.current) {
      let newRecord = { opReadiness: "N" } as PRecord;

      const result = await insertRecord(newRecord);
      if (result) {
        newRecord = convertServerPRecordtToPRecord(result);
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
      const records = gridRef.current.api.getSelectedRows();

      const result = await axios.put("http://localhost:5000/api/hideRecords", { ids: records.map((records) => records.id) });
      if (result.status === 200) {
        gridRef.current.api.applyTransaction({
          remove: records,
        });
      }
    }
  };

  const onClickInsertAll = async () => {
    // const records = MOCK.slice(0, 100);
    // for (let i = 0; i < records.length; i++) {
    //   if (records[i].opReadiness === "N" || records[i].opReadiness === "Y") {
    //     records[i].doctor = undefined;
    //   }
    //   if (records[i].checkInTime) {
    //     records[i].checkInTime *= 1000;
    //     console.log(records[i].checkInTime);
    //   }
    // }
    // const result = await axios.post("http://localhost:5000/api/insertRecords", { records });
    // console.log(result);
  };

  const onGetAllRecords = async () => {
    console.log(dayjs().unix());

    const results = await axios.get("http://localhost:5000/api/getAllRecords");
    const records = results.data.records.rows;
    if (records) {
      console.log(records);
    }
  };
  return (
    <div>
      <Button onClick={onAddRecord}>추가</Button>
      <Button onClick={onDeleteRecord}>삭제</Button>
      {/* <Button onClick={onClickInsertAll}>100개 추가</Button> */}
      {/* <Button onClick={onGetAllRecords}>모든 레코드</Button> */}
    </div>
  );
};
