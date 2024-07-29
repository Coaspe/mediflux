/** @format */

import { useEffect, useRef, useState } from "react";
import { Socket, io } from "socket.io-client";
import { CONNECT, CONNECTED_USERS, JOIN_ROOM, LOCK_RECORD, PORT, SAVE_RECORD, SCHEDULING_ROOM_ID, UNLOCK_RECORD } from "shared";
import { useRecoilState } from "recoil";
import { userState } from "~/recoil_state";
import { ClientOnly } from "remix-utils/client-only";
import { useLoaderData } from "@remix-run/react";
import ReadyTable from "./ReadyTable";
import ExceptReadyTable from "./ExecptReadyTable";
import { PRecord } from "~/type";
import { AgGridReact } from "ag-grid-react";

export default function SchedulingTable() {
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
    <div className="w-full h-full gap-2 flex flex-col pb-5">
      <ClientOnly>{() => <ReadyTable socket={socket} gridRef={readyRef} theOtherGridRef={exceptReadyRef} />}</ClientOnly>
      <ClientOnly>{() => <ExceptReadyTable socket={socket} gridRef={exceptReadyRef} theOtherGridRef={readyRef} />}</ClientOnly>
    </div>
  );
}
