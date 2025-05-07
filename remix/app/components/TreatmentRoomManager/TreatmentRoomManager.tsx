import { TreatmentRoom } from "~/types/type";
import { TreatmentRoomCard } from "./TreatmentRommCard";
import { OpReadiness, PRecord } from "shared";

type TreatmentRoomManagerProps = {
  treatmentRooms?: TreatmentRoom[];
};

const TreatmentRoomManager: React.FC<TreatmentRoomManagerProps> = () => {
  const MOCK: TreatmentRoom[] = [
    {
      id: "1",
      name: "시술실 1",
      group: "",
      title: "시술실 1",
      status: "사용 중",
      treatmentType: ["레이저 치료", "치아 교정"],
      equitments: ["A급 레이저", "B급 레이저"],
      roomChartNum: "1",
    },
  ];

  const PRECORD_MOCK: PRecord = {
    id: "1",
    name: "홍길동",
    treatment1: "레이저 치료",
    treatmentStart1: "2023-10-01T10:00:00Z",
    opReadiness: OpReadiness.Y,
  };

  return (
    <div className="flex flex-col w-full h-full border border-gray-300 rounded-lg p-4">
      {/* grid */}
      <div className="grid grid-cols-5 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {MOCK.map((room) => (
          <TreatmentRoomCard key={room.id} roomInfo={room} precord={PRECORD_MOCK} />
        ))}
      </div>
    </div>
  );
};

export default TreatmentRoomManager;
