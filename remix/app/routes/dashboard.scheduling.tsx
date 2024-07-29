/** @format */

import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { useRecoilState } from "recoil";
import SchedulingTable from "~/components/Table/SchedulingTable";
import { userState } from "~/recoil_state";
import { checkSessionExists } from "~/services/session.server";
import { PRecord, User } from "~/type";
import { getUserByID } from "~/utils/request.server";
import { redirect } from "@remix-run/node";
import { AgGridReact } from "ag-grid-react";
import { PORT, CONNECT, JOIN_ROOM, SCHEDULING_ROOM_ID, CONNECTED_USERS } from "shared";
import { Socket, io } from "socket.io-client";
export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const uuid = await checkSessionExists(request);
    if (uuid) {
      const user = await getUserByID(uuid);
      return json({ user });
    } else {
      return redirect("/");
    }
  } catch (error) {
    return redirect("/");
  }
};

export default function Scheduling() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [user, setUser] = useRecoilState(userState);
  const data: any = useLoaderData();

  const readyRef = useRef<AgGridReact<PRecord>>(null);
  const exceptReadyRef = useRef<AgGridReact<PRecord>>(null);

  useEffect(() => {
    const { user: suser } = data;
    if (!user || user.id != suser.id) {
      setUser(suser);
    }
  }, [data]);

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
  }, []);

  return (
    <div className="flex w-full h-full flex-col">
      <SchedulingTable tableType="Ready" gridRef={readyRef} theOtherGridRef={exceptReadyRef} socket={socket} />
      <SchedulingTable tableType="ExceptReady" gridRef={exceptReadyRef} theOtherGridRef={readyRef} socket={socket} />
    </div>
  );
}
