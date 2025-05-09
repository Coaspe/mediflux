/** @format */

import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import SchedulingTable from "~/components/Table/SchedulingTable";
import { doctorSearchHelpState, roomSearchHelpState, treatmentSearchHelpState, userState } from "~/recoil_state";
import { CustomAgGridReactProps, SearchHelp, Treatment, TreatmentRoom, User } from "~/types/type";
import { getUserByID } from "~/utils/request.server";
import { CONNECT, JOIN_ROOM, SCHEDULING_ROOM_ID, CONNECTED_USERS, PRecord, OpReadiness, Role, ServerUser } from "shared";
import { Socket, io } from "socket.io-client";
import { DEFAULT_REDIRECT } from "~/constants/constant";
import { convertServerPRecordToPRecord, convertServerUserToClientUser } from "~/utils/utils";
import { destoryBrowserSession, getSessionId } from "~/services/session.server";
import { getAllRoleEmployees, getAllRooms, getAllTreatments, getRecords } from "~/utils/request";
import { SerializeFrom } from "@remix-run/node";
import dayjs from "dayjs";
import TreatmentRoomManager from "~/components/TreatmentRoomManager/TreatmentRoomManager";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const sessionData = await getSessionId(request);

  if (sessionData.id) {
    const { statusCode, body: { data: user = {}, error = null } = {} } = await getUserByID(sessionData.id);
    if (statusCode === 200 && user) {
      const [doctorsResponse, recordsResponse, treatmentsResponse, roomsResponse] = await Promise.all([
        getAllRoleEmployees(Role.DOCTOR, user.clinic, process.env.SERVER_BASE_URL),
        getRecords([`and created_at >= '${dayjs().startOf("day").toISOString()}'`, `and created_at <= '${dayjs().endOf("day").toISOString()}'`], user.clinic, process.env.SERVER_BASE_URL),
        getAllTreatments(user.clinic, process.env.SERVER_BASE_URL),
        getAllRooms(user.clinic, process.env.SERVER_BASE_URL),
      ]);

      const {
        statusCode: s1,
        body: {
          data: { rows: doctors },
        },
      } = doctorsResponse;
      const {
        statusCode: s2,
        body: {
          data: { rows: records },
        },
      } = recordsResponse;
      const {
        statusCode: s3,
        body: {
          data: { rows: treatmentsData },
        },
      } = treatmentsResponse;

      const {
        statusCode: s4,
        body: {
          data: { rows: rooms },
        },
      } = roomsResponse;

      if (s1 === 200 && s2 === 200 && s3 === 200 && s4 === 200) {
        return json({ user, records, doctors, treatments: treatmentsData, rooms });
      } else {
        return await destoryBrowserSession(DEFAULT_REDIRECT, request);
      }
    }
  }
  return null;
};

const useInitializeSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const user = useRecoilValue(userState);

  useEffect(() => {
    if (!user) return;

    const socketInstance = io(`${window.ENV.FRONT_BASE_URL}`, { path: "/socket" });

    socketInstance.on(CONNECT, () => {
      socketInstance.emit(JOIN_ROOM, {
        userId: user.id,
        username: user.name,
        roomId: SCHEDULING_ROOM_ID,
        clinic: user.clinic,
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
const useUpdateLoaderData = (
  loaderData: SerializeFrom<{
    user: any;
    records: any;
    doctors: any;
    treatments: any;
    rooms: any;
  }> | null
) => {
  const setUser = useSetRecoilState(userState);
  const [readyData, setReadyData] = useState<PRecord[]>([]);
  const [exceptReadyData, setExceptReadyData] = useState<PRecord[]>([]);
  const [treatmentSearchHelp, setTreatmentSearchHelp] = useRecoilState(treatmentSearchHelpState);
  const [doctorSearchHelp, setDoctorSearchHelp] = useRecoilState(doctorSearchHelpState);
  const [roomSearchHelp, setRoomSearchHelp] = useRecoilState(roomSearchHelpState);

  useEffect(() => {
    if (!loaderData) return;
    const { user, doctors, treatments, records, rooms } = loaderData;
    setUser(user);

    setTreatmentSearchHelp(treatments.map((treatment: Treatment) => treatment as SearchHelp));
    setDoctorSearchHelp(doctors.map((user: ServerUser) => convertServerUserToClientUser(user)).map((user: User) => ({ id: user.id, title: user.name, group: "" } as SearchHelp)));
    // setRoomSearchHelp(rooms.map((room: any) => ({ id: room.id, title: room.name, name: room.name, group: "", equitments: new Set(room.equitments || []) } as TreatmentRoom)));

    if (user) {
      const recordsData: PRecord[] = records.map(convertServerPRecordToPRecord);
      const ready = recordsData.filter((record) => record.opReadiness === OpReadiness.Y);
      const exceptReady = recordsData.filter((record) => record.opReadiness !== OpReadiness.Y);

      setReadyData(ready);
      setExceptReadyData(exceptReady);
    }
  }, [loaderData]);

  return { readyData, exceptReadyData, treatmentSearchHelp, doctorSearchHelp, roomSearchHelp };
};

export default function Scheduling() {
  const loaderData = useLoaderData<typeof loader>();
  const { readyData, exceptReadyData, treatmentSearchHelp, doctorSearchHelp, roomSearchHelp } = useUpdateLoaderData(loaderData);
  const socket = useInitializeSocket();

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
    <div className="grid grid-cols-1 grid-rows-2 w-full h-full gap-5 pb-5">
      <TreatmentRoomManager treatmentRooms={roomSearchHelp} />
      <SchedulingTable
        tableType="Ready"
        gridRef={readyRef}
        // theOtherGridRef={exceptReadyRef}
        socket={socket}
        roomId={SCHEDULING_ROOM_ID}
        records={[...readyData, ...exceptReadyData]}
        treatmentSearchHelp={treatmentSearchHelp}
        doctorSearchHelp={doctorSearchHelp}
      />
      {/* <SchedulingTable
        tableType="ExceptReady"
        gridRef={exceptReadyRef}
        theOtherGridRef={readyRef}
        socket={socket}
        roomId={SCHEDULING_ROOM_ID}
        records={exceptReadyData}
        treatmentSearchHelp={treatmentSearchHelp}
        doctorSearchHelp={doctorSearchHelp}
      /> */}
    </div>
  );
}
