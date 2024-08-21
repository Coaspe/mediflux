/** @format */

import dayjs, { Dayjs } from "dayjs";
import { useCallback, useEffect, useRef, useState } from "react";
import ArchiveChart from "~/components/Archive/Chart";
import { CustomAgGridReactProps, Interval, PRecord, User } from "~/type";
import { SelectChangeEvent } from "@mui/material/Select";
import SchedulingTable from "~/components/Table/SchedulingTable";
import { ARCHIVE_ROOM_ID, CONNECT, CONNECTED_USERS, JOIN_ROOM, PORT } from "shared";
import { Socket, io } from "socket.io-client";
import { json, redirect, useLoaderData } from "@remix-run/react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { globalSnackbarState, userState } from "~/recoil_state";
import { convertServerPRecordtToPRecord } from "~/utils/utils";
import { LoaderFunctionArgs } from "@remix-run/node";
import { getUserByID } from "~/utils/request.server";
import ArchiveHeader from "~/components/Archive/Header";
import { getUserSession } from "~/services/session.server";
import { getSchedulingRecords } from "~/utils/request.client";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const sessionData = await getUserSession(request);
    if (sessionData.id) {
      const result = await getUserByID(sessionData.id);
      if ("user" in result) {
        return json({ user: result.user });
      }
    }
  } catch (error) {
    return redirect("/");
  }
};

export default function Archive() {
  const [numOfInterval, setNumOfInterval] = useState<number>(7);
  const [interval, setInterval] = useState<Interval>("week");
  const [baseDate, setBaseDate] = useState<Dayjs>(dayjs());
  const [socket, setSocket] = useState<Socket | null>(null);
  const [rowData, setRowData] = useState<PRecord[]>([]);
  const tableRef = useRef<CustomAgGridReactProps<PRecord>>(null);
  const setGlobalSnackBar = useSetRecoilState(globalSnackbarState);
  const loaderData = useLoaderData<{ user: User; records: PRecord[] }>();

  const [user, setUser] = useRecoilState(userState);

  const showErrorSnackbar = useCallback(
    (message: string) => {
      setGlobalSnackBar({ open: true, msg: message, severity: "error" });
    },
    [setGlobalSnackBar]
  );

  const handleIntervalChange = (event: SelectChangeEvent<Interval>) => {
    setInterval(event.target.value as Interval);
  };
  const handleNumOfIntervalChange = (event: SelectChangeEvent<number>) => {
    setNumOfInterval(Number(event.target.value));
  };
  const handleBaseDateChange = (value: Dayjs | null) => {
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

  const getRecords = async () => {
    try {
      let where = [];
      where.push(`and check_in_time >= '${dayjs(baseDate).startOf(interval).toISOString()}'`);
      where.push(
        `and check_in_time <= '${dayjs(baseDate)
          .startOf(interval)
          .add(numOfInterval - 1, interval)
          .endOf(interval)
          .toISOString()}'`
      );
      const { data } = await getSchedulingRecords(where);
      const recordsData: PRecord[] = data.rows.map((record: any) => convertServerPRecordtToPRecord(record));
      setRowData(recordsData);
    } catch (error) {
      showErrorSnackbar("Internal server error");
    } finally {
      // setIsLoading(false);
    }
  };

  // Get records and process unlocked records.
  useEffect(() => {
    const { user: suser } = loaderData;
    if (!user || user.id != suser.id) {
      setUser(suser);
    }

    if (suser) {
      getRecords();
    }
  }, [socket, baseDate, interval, numOfInterval, loaderData]);

  return (
    <div className="w-full">
      <ArchiveHeader
        handleBaseDateChange={handleBaseDateChange}
        handleIntervalChange={handleIntervalChange}
        handleNumOfIntervalChange={handleNumOfIntervalChange}
        interval={interval}
        numOfInterval={numOfInterval}
      />
      <ArchiveChart numOfInterval={numOfInterval} interval={interval} baseDate={baseDate} data={rowData} />
      <SchedulingTable tableType="Archive" gridRef={tableRef} socket={socket} roomId={ARCHIVE_ROOM_ID} records={rowData} />
    </div>
  );
}
