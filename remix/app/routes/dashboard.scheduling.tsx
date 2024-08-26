/** @format */

import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { useRecoilState } from "recoil";
import SchedulingTable from "~/components/Table/SchedulingTable";
import { userState } from "~/recoil_state";
import { CustomAgGridReactProps, PRecord, SearchHelp, User } from "~/type";
import { getRecords, getUserByID } from "~/utils/request.server";
import { PORT, CONNECT, JOIN_ROOM, SCHEDULING_ROOM_ID, CONNECTED_USERS } from "shared";
import { Socket, io } from "socket.io-client";
import { OP_READINESS_Y, TEST_TAG } from "~/constant";
import { convertServerPRecordtToPRecord, getDoctorSearchHelp, getTreatmentSearchHelp } from "~/utils/utils";
import { destoryBrowserSession, getUserSession } from "~/services/session.server";
import dayjs from "dayjs";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const sessionData = await getUserSession(request);

    if (sessionData.id) {
      const result = await getUserByID(sessionData.id);
      if ("user" in result) {
        const where = [];
        where.push(`and created_at >= '${dayjs().startOf("day").toISOString()}'`);
        where.push(`and created_at <= '${dayjs().endOf("day").toISOString()}'`);
        const { data } = await getRecords(where, TEST_TAG);
        return json({ user: result.user, records: data.rows });
      }
    }
  } catch (error) {
    return await destoryBrowserSession("/", request);
  }
  return null;
};

export default function Scheduling() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [user, setUser] = useRecoilState(userState);
  const loaderData = useLoaderData<{ user: User; records: PRecord[] }>();

  const [readyData, setReadyData] = useState<PRecord[]>([]);
  const [exceptReadyData, setExceptReadyData] = useState<PRecord[]>([]);

  const readyRef = useRef<CustomAgGridReactProps<PRecord>>(null);
  const exceptReadyRef = useRef<CustomAgGridReactProps<PRecord>>(null);

  const [treatmentSearchHelp, setTreatmentSearchHelp] = useState<SearchHelp[]>([]);
  const [doctorSearchHelp, setDoctorSearchHelp] = useState<SearchHelp[]>([]);

  useEffect(() => {
    if (exceptReadyRef.current) {
      exceptReadyRef.current.tableType = "ExceptReady";
    }
    if (readyRef.current) {
      readyRef.current.tableType = "Ready";
    }
    getTreatmentSearchHelp(setTreatmentSearchHelp);
    getDoctorSearchHelp(setDoctorSearchHelp);
  }, []);

  useEffect(() => {
    const { user: suser, records } = loaderData;
    if (!user || user.id != suser.id) {
      setUser(suser);
    }

    if (user) {
      const recordsData: PRecord[] = records.map((record: any) => convertServerPRecordtToPRecord(record));
      const ready = [];
      const exceptReady = [];

      while (recordsData.length > 0) {
        const record = recordsData.pop();
        if (!record) continue;
        if (record?.opReadiness === OP_READINESS_Y) {
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
    const socketInstance = io(`http://localhost:${PORT}`);
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
    <div className="flex w-full h-full flex-col gap-5 pb-5">
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
