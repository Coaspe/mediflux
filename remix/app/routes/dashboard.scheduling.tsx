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
      const where = [];
      where.push(`and created_at >= '${dayjs().startOf("day").toISOString()}'`);
      where.push(`and created_at <= '${dayjs().endOf("day").toISOString()}'`);
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

export default function Scheduling() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [user, setUser] = useRecoilState(userState);
  const loaderData = useLoaderData<{ user: User; records: ServerPRecord[] }>();
  const [readyData, setReadyData] = useState<PRecord[]>([]);
  const [exceptReadyData, setExceptReadyData] = useState<PRecord[]>([]);
  const readyRef = useRef<CustomAgGridReactProps<PRecord>>(null);
  const exceptReadyRef = useRef<CustomAgGridReactProps<PRecord>>(null);

  const [treatmentSearchHelp, setTreatmentSearchHelp] = useRecoilState(treatmentSearchHelpState);
  const [doctorSearchHelp, setDoctorSearchHelp] = useRecoilState(doctorSearchHelpState);

  useEffect(() => {
    if (exceptReadyRef.current) {
      exceptReadyRef.current.tableType = "ExceptReady";
    }
    if (readyRef.current) {
      readyRef.current.tableType = "Ready";
    }
    getTreatmentSearchHelp(setTreatmentSearchHelp, window.ENV.FRONT_BASE_URL);
    getDoctorSearchHelp(setDoctorSearchHelp, window.ENV.FRONT_BASE_URL);
  }, []);

  useEffect(() => {
    const { user: suser, records } = loaderData;
    if (!user || user.id != suser.id) {
      setUser(suser);
    }

    if (user) {
      const recordsData: PRecord[] = records.map((record) => convertServerPRecordToPRecord(record));
      const ready = [];
      const exceptReady = [];

      while (recordsData.length > 0) {
        const record = recordsData.pop();
        if (!record) continue;
        if (record?.opReadiness === OpReadiness.Y) {
          ready.push(record);
        } else {
          exceptReady.push(record);
        }
      }

      setReadyData(ready);
      setExceptReadyData(exceptReady);
    }
  }, [loaderData]);

  useEffect(() => {
    const socketInstance = io(`${window.ENV.FRONT_BASE_URL}`, { path: "/socket" });
    setSocket(socketInstance);

    // Default
    socketInstance.on(CONNECT, () => {
      socketInstance.emit(JOIN_ROOM, {
        userId: user && user.id,
        username: user && user.name,
        roomId: SCHEDULING_ROOM_ID,
      });
    });

    return () => {
      socketInstance.off(CONNECTED_USERS);
      socketInstance.disconnect();
    };
  }, [user]);

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
