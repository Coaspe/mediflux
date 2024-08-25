/** @format */

import { useState } from "react";
import { useRecoilValue } from "recoil";
import RankRow from "~/components/Members/RankRow";
import { userState } from "~/recoil_state";

const Members = () => {
  const user = useRecoilValue(userState);

  const [columnWidths, setColumnWidths] = useState([200, 200, 200]);
  // const resizerRefs = useRef([]);

  const handleMouseDown = (index: any) => (e: any) => {
    const startX = e.clientX;
    const startWidth = columnWidths[index];

    const handleMouseMove = (e: any) => {
      const newWidth = startWidth + (e.clientX - startX);
      const updatedWidths = [...columnWidths];
      updatedWidths[index] = Math.max(newWidth, 50); // 최소 너비 설정
      setColumnWidths(updatedWidths);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div className="flex flex-col border border-gray-300 w-max">
      <div className="flex">
        {["이름", "포인트", "Column 3"].map((header, index) => (
          <div key={index} className="relative flex items-center p-2 bg-gray-200 font-bold border-r border-gray-300" style={{ width: `${columnWidths[index]}px` }}>
            {header}
            <div
              className="absolute top-0 right-0 w-2 h-full cursor-ew-resize bg-transparent hover:bg-gray-400"
              // ref={(el) => (resizerRefs.current[index] = el)}
              onMouseDown={handleMouseDown(index)}
            />
          </div>
        ))}
      </div>
      {user && (
        <div className="flex">
          {[user].map((data, index) => (
            <RankRow width={`${columnWidths[index]}px`} user={user} key={index} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Members;
