// components/TreatmentRoomCard.tsx
import React, { useEffect } from "react";
import clsx from "clsx";
import { TreatmentRoom, TreatmentRoomStatus } from "~/types/type";
import { PRecord } from "shared";
import { TREATMENT_NUMBERS } from "~/constants/constant";
import dayjs from "dayjs";

interface TreatmentRoomCardProps {
  roomInfo: TreatmentRoom;
  precord?: PRecord;
}

const statusColorMap: Record<TreatmentRoomStatus, string> = {
  "사용 중": "bg-blue-100 text-blue-700",
  "사용 가능": "bg-green-100 text-green-700",
  "점검 중": "bg-red-100 text-red-700",
  "예약 됨": "bg-yellow-100 text-yellow-700",
};

// Returns in progress treatment's name and start time
const findInProgressTreatment = (precord?: PRecord) => {
  if (!precord) return null;
  for (const number of TREATMENT_NUMBERS) {
    const treatment = precord[`treatment${number}`];
    const startTime = precord[`treatmentStart${number}`];
    const endTime = precord[`treatmentEnd${number}`];
    if (treatment && startTime && !endTime) {
      return { name: treatment, time: startTime };
    }
  }
  return null;
};
export const TreatmentRoomCard: React.FC<TreatmentRoomCardProps> = ({ roomInfo, precord }) => {
  const [currentTreatment, setCurrentTreatment] = React.useState<{ name: string; time: string } | null>(null);

  useEffect(() => {
    setCurrentTreatment(findInProgressTreatment(precord));
  }, [precord?.opReadiness]);

  return (
    <div className="border rounded-xl p-4 shadow-sm bg-white space-y-3">
      <div className="flex justify-between items-start">
        <h2 className="font-semibold text-lg">{roomInfo.id}번 시술실</h2>
        <span className={clsx("text-sm font-medium px-2 py-0.5 rounded-full", statusColorMap[roomInfo.status])}>{roomInfo.status}</span>
      </div>

      <div className="space-y-2">
        <div>
          <p className="text-sm text-gray-500">시술 종류:</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {(roomInfo.treatmentType || []).map((type) => (
              <span key={type} className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded">
                {type}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-500">보유 장비:</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {(roomInfo.equitments || []).map((device) => (
              <span key={device} className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">
                {device}
              </span>
            ))}
          </div>
        </div>

        {currentTreatment && precord && (
          <div className="bg-gray-50 border rounded-md p-2 mt-2">
            <p className="text-sm text-gray-500">현재 환자</p>
            <p className="font-medium text-sm">{precord.name}</p>
            <p className="text-xs text-gray-500">
              {currentTreatment.name} | {dayjs(currentTreatment.time).format("hh:mm A")}
              {" ~"}
            </p>
          </div>
        )}

        {/* {nextPatient && (
          <div className="bg-yellow-50 border rounded-md p-2 mt-2">
            <p className="text-sm text-gray-500">다음 환자</p>
            <p className="font-medium text-sm">{nextPatient.name}</p>
            <p className="text-xs text-gray-500">
              {nextPatient.treatment} | {nextPatient.time}
            </p>
          </div>
        )} */}
      </div>
    </div>
  );
};
