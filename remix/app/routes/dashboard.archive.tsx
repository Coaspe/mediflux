/** @format */

import dayjs, { Dayjs } from "dayjs";
import { useEffect, useRef, useState } from "react";
import ArchiveChart from "~/components/Archive/Chart";
import { CustomAgGridReactProps, Interval, PRecord, PRecordWithFocusedRow } from "~/type";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import SchedulingTable from "~/components/Table/SchedulingTable";
import { ARCHIVE_ROOM_ID, CONNECT, CONNECTED_USERS, JOIN_ROOM, PORT } from "shared";
import { Socket, io } from "socket.io-client";
import { useLoaderData } from "@remix-run/react";
import { useRecoilState } from "recoil";
import { userState } from "~/recoil_state";

export default function Archive() {
  const [numOfInterval, setNumOfInterval] = useState<number>(7);
  const [interval, setInterval] = useState<Interval>("week");
  const [baseDate, setBaseDate] = useState<Dayjs>(dayjs());
  const [socket, setSocket] = useState<Socket | null>(null);
  const tableRef = useRef<CustomAgGridReactProps<PRecord>>(null);
  const editingRowRef = useRef<PRecordWithFocusedRow | null>(null);
  const data: any = useLoaderData();

  const [user, setUser] = useRecoilState(userState);

  useEffect(() => {
    const { user: suser } = data;
    if (!user || user.id != suser.id) {
      setUser(suser);
    }
  }, [data]);

  const handleIntervalChange = (event: SelectChangeEvent) => {
    setInterval(event.target.value as Interval);
  };
  const handleNumOfIntervalChange = (event: SelectChangeEvent<number>) => {
    setNumOfInterval(Number(event.target.value));
  };
  const haldneBaseDateChange = (value: Dayjs | null) => {
    if (value) {
      setBaseDate(value);
    }
  };

  useEffect(() => {
    const socketInstance = io(`http://localhost:${PORT}`);
    setSocket(socketInstance);

    // Default
    socketInstance.on(CONNECT, () => {
      socketInstance.emit(JOIN_ROOM, {
        userId: user && user.id,
        username: user && user.name,
        roomId: ARCHIVE_ROOM_ID,
      });
    });

    return () => {
      socketInstance.off(CONNECTED_USERS);
      socketInstance.disconnect();
    };
  }, []);
  return (
    <div className="w-full">
      <div className="flex gap-3 pb-5">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker label="Base Date" defaultValue={dayjs()} format="YYYY/MM/DD" onChange={haldneBaseDateChange} />
        </LocalizationProvider>
        <FormControl className="w-30">
          <InputLabel id="interval-select-label">Interval</InputLabel>
          <Select labelId="interval-select-label" id="interval-select" value={interval} label="Interval" onChange={handleIntervalChange}>
            <MenuItem value={"day"}>일(day)</MenuItem>
            <MenuItem value={"week"}>주(week)</MenuItem>
            <MenuItem value={"month"}>월(month)</MenuItem>
            <MenuItem value={"year"}>년(year)</MenuItem>
          </Select>
        </FormControl>
        <FormControl className="w-32">
          <InputLabel id="number-of-interval-select-label">Number Of Interval</InputLabel>
          <Select labelId="number-of-interval-select-label" id="number-of-interval-select" value={numOfInterval} label="Number of Interval" onChange={handleNumOfIntervalChange}>
            <MenuItem value={2}>2</MenuItem>
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={7}>7</MenuItem>
            <MenuItem value={10}>10</MenuItem>
          </Select>
        </FormControl>
      </div>
      <ArchiveChart numOfInterval={numOfInterval} interval={interval} baseDate={baseDate} />
      <SchedulingTable
        tableType="Archive"
        gridRef={tableRef}
        socket={socket}
        roomId={ARCHIVE_ROOM_ID}
        startDate={dayjs(baseDate).startOf(interval)}
        endDate={dayjs(baseDate)
          .startOf(interval)
          .add(numOfInterval - 1, interval)
          .endOf(interval)}
      />
    </div>
  );
}
