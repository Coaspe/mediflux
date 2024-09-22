/** @format */

import dayjs, { Dayjs } from "dayjs";
import { useCallback, useEffect, useRef, useState } from "react";
import ArchiveChart from "~/components/Archive/Chart";
import { CustomAgGridReactProps, Interval, SearchHelp, Treatment, User } from "~/types/type";
import { SelectChangeEvent } from "@mui/material/Select";
import SchedulingTable from "~/components/Table/SchedulingTable";
import { ARCHIVE_ROOM_ID, CONNECT, CONNECTED_USERS, JOIN_ROOM, PRecord, Role, ServerPRecord, ServerUser } from "shared";
import { Socket, io } from "socket.io-client";
import { json, redirect, useLoaderData } from "@remix-run/react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { doctorSearchHelpState, globalSnackbarState, treatmentSearchHelpState, userState } from "~/recoil_state";
import { convertServerPRecordToPRecord, convertServerUserToClientUser } from "~/utils/utils";
import { LoaderFunctionArgs } from "@remix-run/node";
import { getUserByID } from "~/utils/request.server";
import ArchiveHeader from "~/components/Archive/Header";
import { getSessionId } from "~/services/session.server";
import { DEFAULT_REDIRECT } from "~/constants/constant";
import { getAllRoleEmployees, getAllTreatments, getRecords } from "~/utils/request";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const sessionData = await getSessionId(request);
  if (sessionData.id) {
    const { statusCode, body: { data: user = {}, error = null } = {} } = await getUserByID(sessionData.id);
    if (statusCode === 200) {
      const [doctorsResponse, treatmentsResponse] = await Promise.all([
        getAllRoleEmployees(Role.DOCTOR, user.clinic, process.env.SERVER_BASE_URL),
        getAllTreatments(user.clinic, process.env.SERVER_BASE_URL),
      ]);

      const {
        statusCode: s1,
        body: {
          data: { rows: doctors },
        },
      } = doctorsResponse;
      const {
        statusCode: s,
        body: {
          data: { rows: treatmentsData },
        },
      } = treatmentsResponse;

      return json({ user, doctors, treatments: treatmentsData });
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
  const loaderData = useLoaderData<typeof loader>();
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
    if (!user || !window.ENV.FRONT_BASE_URL) return;
    let where = [
      `and created_at <= '${dayjs(baseDate).endOf(interval).toISOString()}'`,
      `and created_at >= '${dayjs(baseDate)
        .startOf(interval)
        .subtract(numOfInterval - 1, interval)
        .toISOString()}'`,
      `and op_readiness = 'C'`,
    ];
    const {
      statusCode,
      body: { data, error },
    } = await getRecords(where, user?.clinic, window.ENV.FRONT_BASE_URL);
    if (statusCode === 200) {
      setRowData(data.rows.map((record: ServerPRecord) => convertServerPRecordToPRecord(record)));
    } else {
      error && showErrorSnackbar(error);
    }
  };

  // Get records and process unlocked records.
  useEffect(() => {
    if (user && window.ENV.FRONT_BASE_URL && socket && baseDate && interval && numOfInterval) {
      getData();
    }
  }, [socket, baseDate, interval, numOfInterval, user, window.ENV.FRONT_BASE_URL]);

  useEffect(() => {
    if (!loaderData) return;
    const { user, doctors, treatments } = loaderData;
    setUser(user);
    setTreatmentSearchHelp(treatments.map((treatment: Treatment) => treatment as SearchHelp));
    setDoctorSearchHelp(doctors.map((user: ServerUser) => convertServerUserToClientUser(user)).map((user: User) => ({ id: user.id, title: user.name, group: "" } as SearchHelp)));
  }, [loaderData]);

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
