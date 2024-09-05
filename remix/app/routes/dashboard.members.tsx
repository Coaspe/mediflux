import { useRecoilValue } from "recoil";
import WorkInProgress from "~/components/WorkInProgress";
import { userState } from "~/recoil_state";

const Members = () => {
  const user = useRecoilValue(userState);

  return (
    <div className="flex items-center justify-center w-full h-full">
      <WorkInProgress />;
    </div>
  );
};

export default Members;
