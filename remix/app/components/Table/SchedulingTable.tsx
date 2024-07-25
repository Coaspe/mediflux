/** @format */

import { useEffect, useRef, useState } from "react";
import { Socket, io } from "socket.io-client";
import { CONNECT, CONNECTED_USERS, JOIN_ROOM, PORT, SCHEDULING_ROOM_ID } from "shared";
import { useRecoilValue } from "recoil";
import { userState } from "~/recoil_state";
import ReadyTable from "./ReadyTable";
import ExceptReadyTable from "./ExecptReadyTable";

const SchedulingTable = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const user = useRecoilValue(userState);

  // Socket configuration
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
      <ReadyTable socket={socket} />
      <ExceptReadyTable socket={socket} />
    </div>
  );
};

export default SchedulingTable;
