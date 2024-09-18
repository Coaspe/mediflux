/** @format */

import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { useRecoilState } from "recoil";
import SchedulingTable from "~/components/Table/SchedulingTable";
import { doctorSearchHelpState, treatmentSearchHelpState, userState } from "~/recoil_state";
import { CustomAgGridReactProps, User } from "~/types/type";
import { getUserByID } from "~/utils/request.server";
import { CONNECT, JOIN_ROOM, SCHEDULING_ROOM_ID, CONNECTED_USERS, PRecord, ServerPRecord, OpReadiness } from "shared";
import { Socket, io } from "socket.io-client";
import { DEFAULT_REDIRECT, TEST_TAG } from "~/constant";
import { convertServerPRecordToPRecord, getDoctorSearchHelp, getTreatmentSearchHelp } from "~/utils/utils";
import { destoryBrowserSession, getUserSession } from "~/services/session.server";
import dayjs from "dayjs";
import { getRecords } from "~/utils/request";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const sessionData = await getUserSession(request);

  if (sessionData.id) {
    const { statusCode, body: { data: user = {}, error = null } = {} } = await getUserByID(sessionData.id);
    if (statusCode === 200) {
      const where = [`and created_at >= '${dayjs().startOf("day").toISOString()}'`, `and created_at <= '${dayjs().endOf("day").toISOString()}'`];
      const {
        statusCode,
        body: { data },
      } = await getRecords(where, TEST_TAG, process.env.SERVER_BASE_URL);
      if (statusCode === 200) {
        return json({ user, records: data.rows });
      } else {
        return await destoryBrowserSession(DEFAULT_REDIRECT, request);
      }
    }
  }
  return null;
};

const useInitializeSocket = (user: User | null) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!user) return;

    const socketInstance = io(`${window.ENV.FRONT_BASE_URL}`, { path: "/socket" });

    socketInstance.on(CONNECT, () => {
      socketInstance.emit(JOIN_ROOM, {
        userId: user.id,
        username: user.name,
        roomId: SCHEDULING_ROOM_ID,
      });
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.off(CONNECTED_USERS);
      socketInstance.disconnect();
    };
  }, [user]);

  return socket;
};

const useFetchSearchHelpData = () => {
  const [treatmentSearchHelp, setTreatmentSearchHelp] = useRecoilState(treatmentSearchHelpState);
  const [doctorSearchHelp, setDoctorSearchHelp] = useRecoilState(doctorSearchHelpState);

  useEffect(() => {
    getTreatmentSearchHelp(setTreatmentSearchHelp, window.ENV.FRONT_BASE_URL);
    getDoctorSearchHelp(setDoctorSearchHelp, window.ENV.FRONT_BASE_URL);
  }, []);

  return { treatmentSearchHelp, doctorSearchHelp };
};

const useUpdateUserData = (loaderData: { user: User; records: ServerPRecord[] }) => {
  const [user, setUser] = useRecoilState(userState);
  const [readyData, setReadyData] = useState<PRecord[]>([]);
  const [exceptReadyData, setExceptReadyData] = useState<PRecord[]>([]);

  useEffect(() => {
    if (!user || user.id !== loaderData.user.id) {
      setUser(loaderData.user);
    }

    if (user) {
      const recordsData: PRecord[] = loaderData.records.map(convertServerPRecordToPRecord);
      const ready = recordsData.filter((record) => record.opReadiness === OpReadiness.Y);
      const exceptReady = recordsData.filter((record) => record.opReadiness !== OpReadiness.Y);

      setReadyData(ready);
      setExceptReadyData(exceptReady);
    }
  }, [loaderData, user, setUser]);

  return { readyData, exceptReadyData };
};

export default function Scheduling() {
  const loaderData = useLoaderData<{ user: User; records: ServerPRecord[] }>();
  const { treatmentSearchHelp, doctorSearchHelp } = useFetchSearchHelpData();
  const { readyData, exceptReadyData } = useUpdateUserData(loaderData);
  const socket = useInitializeSocket(loaderData.user);

  const readyRef = useRef<CustomAgGridReactProps<PRecord>>(null);
  const exceptReadyRef = useRef<CustomAgGridReactProps<PRecord>>(null);

  useEffect(() => {
    if (exceptReadyRef.current) {
      exceptReadyRef.current.tableType = "ExceptReady";
    }
    if (readyRef.current) {
      readyRef.current.tableType = "Ready";
    }
  }, []);

  return (
    <div className="flex flex-col w-full h-full gap-5 pb-5">
      <SchedulingTable
        tableType="Ready"
        gridRef={readyRef}
        theOtherGridRef={exceptReadyRef}
        socket={socket}
        roomId={SCHEDULING_ROOM_ID}
        records={readyData}
        treatmentSearchHelp={treatmentSearchHelp}
        doctorSearchHelp={doctorSearchHelp}
      />
      <SchedulingTable
        tableType="ExceptReady"
        gridRef={exceptReadyRef}
        theOtherGridRef={readyRef}
        socket={socket}
        roomId={SCHEDULING_ROOM_ID}
        records={exceptReadyData}
        treatmentSearchHelp={treatmentSearchHelp}
        doctorSearchHelp={doctorSearchHelp}
      />
    </div>
  );
}
