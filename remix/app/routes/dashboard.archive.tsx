/** @format */

import dayjs, { Dayjs } from "dayjs";
import { useCallback, useEffect, useRef, useState } from "react";
import ArchiveChart from "~/components/Archive/Chart";
import { CustomAgGridReactProps, Interval, User } from "~/types/type";
import { SelectChangeEvent } from "@mui/material/Select";
import SchedulingTable from "~/components/Table/SchedulingTable";
import { ARCHIVE_ROOM_ID, CONNECT, CONNECTED_USERS, JOIN_ROOM, PRecord, ServerPRecord } from "shared";
import { Socket, io } from "socket.io-client";
import { json, redirect, useLoaderData } from "@remix-run/react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { doctorSearchHelpState, globalSnackbarState, treatmentSearchHelpState, userState } from "~/recoil_state";
import { convertServerPRecordToPRecord, getDoctorSearchHelp, getTreatmentSearchHelp } from "~/utils/utils";
import { LoaderFunctionArgs } from "@remix-run/node";
import { getUserByID } from "~/utils/request.server";
import ArchiveHeader from "~/components/Archive/Header";
import { getUserSession } from "~/services/session.server";
import { DEFAULT_REDIRECT, TEST_TAG } from "~/constants/constant";
import { getRecords } from "~/utils/request";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const sessionData = await getUserSession(request);
  if (sessionData.id) {
    const { statusCode, body: { data: user = {}, error = null } = {} } = await getUserByID(sessionData.id);
    if (statusCode === 200) {
      return json({ user });
    } else {
      return redirect(DEFAULT_REDIRECT);
    }
  }
  return null;
};

export default function Archive() {
  const [numOfInterval, setNumOfInterval] = useState<number>(7);
  const [interval, setInterval] = useState<Interval>("day");
  const [baseDate, setBaseDate] = useState<Dayjs>(dayjs());
  const [socket, setSocket] = useState<Socket | null>(null);
  const [rowData, setRowData] = useState<PRecord[]>([]);
  const tableRef = useRef<CustomAgGridReactProps<PRecord>>(null);
  const setGlobalSnackBar = useSetRecoilState(globalSnackbarState);
  const loaderData = useLoaderData<{ user: User; records: PRecord[] }>();
  const [treatmentSearchHelp, setTreatmentSearchHelp] = useRecoilState(treatmentSearchHelpState);
  const [doctorSearchHelp, setDoctorSearchHelp] = useRecoilState(doctorSearchHelpState);
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
    getTreatmentSearchHelp(setTreatmentSearchHelp, window.ENV.FRONT_BASE_URL);
    getDoctorSearchHelp(setDoctorSearchHelp, window.ENV.FRONT_BASE_URL);
  }, [window.ENV.FRONT_BASE_URL]);

  useEffect(() => {
    const socketInstance = io(`${window.ENV.FRONT_BASE_URL}`, { path: "/socket" });
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

  const getData = async () => {
    let where = [];
    where.push(`and created_at <= '${dayjs(baseDate).endOf(interval).toISOString()}'`);
    where.push(
      `and created_at >= '${dayjs(baseDate)
        .startOf(interval)
        .subtract(numOfInterval - 1, interval)
        .toISOString()}'`
    );
    where.push(`and op_readiness = 'C'`);
    const {
      statusCode,
      body: { data, error },
    } = await getRecords(where, TEST_TAG, window.ENV.FRONT_BASE_URL);
    if (statusCode === 200) {
      setRowData(data.rows.map((record: ServerPRecord) => convertServerPRecordToPRecord(record)));
    } else {
      error && showErrorSnackbar(error);
    }
  };

  // Get records and process unlocked records.
  useEffect(() => {
    const { user: suser } = loaderData;
    if (!user || user.id != suser.id) {
      setUser(suser);
    }

    if (suser && window.ENV.FRONT_BASE_URL) {
      getData();
    }
  }, [socket, baseDate, interval, numOfInterval, loaderData, window.ENV.FRONT_BASE_URL]);

  return (
    <div className="w-full h-full">
      <ArchiveHeader
        handleBaseDateChange={handleBaseDateChange}
        handleIntervalChange={handleIntervalChange}
        handleNumOfIntervalChange={handleNumOfIntervalChange}
        baseDate={baseDate}
        interval={interval}
        numOfInterval={numOfInterval}
      />
      <ArchiveChart numOfInterval={numOfInterval} interval={interval} baseDate={baseDate} data={rowData} />
      <SchedulingTable
        tableType="Archive"
        gridRef={tableRef}
        socket={socket}
        roomId={ARCHIVE_ROOM_ID}
        records={rowData}
        doctorSearchHelp={doctorSearchHelp}
        treatmentSearchHelp={treatmentSearchHelp}
      />
    </div>
  );
}
