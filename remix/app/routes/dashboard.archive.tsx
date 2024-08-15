/** @format */

import dayjs, { Dayjs } from "dayjs";
import { useEffect, useRef, useState } from "react";
import ArchiveChart from "~/components/Archive/Chart";
import { CustomAgGridReactProps, Interval, PRecord } from "~/type";
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
import { getSchedulingRecords, unlockRecord } from "~/utils/request.client";
import { emitUnlockRecord } from "~/utils/Table/socket";
import { convertServerPRecordtToPRecord } from "~/utils/utils";

export default function Archive() {
  const [numOfInterval, setNumOfInterval] = useState<number>(7);
  const [interval, setInterval] = useState<Interval>("week");
  const [baseDate, setBaseDate] = useState<Dayjs>(dayjs());
  const [socket, setSocket] = useState<Socket | null>(null);
  const [rowData, setRowData] = useState<PRecord[]>([]);
  const tableRef = useRef<CustomAgGridReactProps<PRecord>>(null);
  const data: any = useLoaderData();

  const [user, setUser] = useRecoilState(userState);

  useEffect(() => {
    if (data) {
      const { user: suser } = data;
      if (!user || user.id != suser.id) {
        setUser(suser);
      }
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
  // Get records and process unlocked records.
  useEffect(() => {
    if (!socket || !user || data) return;
    const getData = async () => {
      try {
        let where = "";
        where += ` and check_in_time >= '${dayjs(baseDate).startOf(interval).toISOString()}'`;
        where += ` and check_in_time <= '${dayjs(baseDate)
          .startOf(interval)
          .add(numOfInterval - 1, interval)
          .endOf(interval)
          .toISOString()}'`;

        const { data } = await getSchedulingRecords(where);
        const records: PRecord[] = data.rows.map((record: any) => convertServerPRecordtToPRecord(record));

        const mustBeUnlocked = [];

        for (let i = 0; i < records.length; i++) {
          const record = records[i];
          if (record.lockingUser === user?.id) {
            record.lockingUser = null;
            mustBeUnlocked.push(record);
            break;
          }
        }

        const promised = mustBeUnlocked.map((record) => unlockRecord(record.id));
        await Promise.all(promised);

        mustBeUnlocked.forEach((record) => emitUnlockRecord(record.id, "Archive", socket, ARCHIVE_ROOM_ID));
        records.sort((a, b) => (b.checkInTime ?? 0) - (a.checkInTime ?? 0));
        setRowData(records);

        return records;
      } catch (error) {
        // showErrorSnackbar("Internal server error");
      } finally {
        // setIsLoading(false);
      }
    };

    if (user?.id) {
      getData();
    }
  }, [user, socket]);
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
      <ArchiveChart numOfInterval={numOfInterval} interval={interval} baseDate={baseDate} data={rowData} />
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
