/** @format */

import { useEffect, useRef, useState } from "react";
import { Socket, io } from "socket.io-client";
import { CONNECT, CONNECTED_USERS, JOIN_ROOM, LOCK_RECORD, PORT, SAVE_RECORD, SCHEDULING_ROOM_ID, UNLOCK_RECORD } from "shared";
import { useRecoilValue } from "recoil";
import { userState } from "~/recoil_state";
import GridExample from "./Test";
import { ClientOnly } from "remix-utils/client-only";
import axios from "axios";

export const loader = async () => {
  const result = await axios("http://localhost:5000/api/getAllRecords");
  console.log(result);

  if (result.status === 200) {
    return result.data.records.data;
  }
  return [];
};
const SchedulingTable = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const user = useRecoilValue(userState);

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
      {/* Assignment Modal */}
      <ClientOnly>{() => <GridExample socket={socket} />}</ClientOnly>
    </div>
  );
};

export default SchedulingTable;
