import { Dispatch, FC, SetStateAction } from "react";
import { TextField } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { Treatment } from "~/type";
import { useSetRecoilState } from "recoil";
import { insertTreatment } from "~/utils/request.client";
import { TEST_TAG } from "~/constant";
import { GridApi } from "ag-grid-community";
import { convertServerTreatmentToClient } from "~/utils/utils";
import { globalSnackbarState } from "~/recoil_state";

type TreatmentHeaderProps = {
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  api: GridApi<Treatment> | undefined;
};
const TreatmentsHeader: FC<TreatmentHeaderProps> = ({ searchTerm, setSearchTerm, api }) => {
  const setGlobalSnackBar = useSetRecoilState(globalSnackbarState);

  const onClick = async () => {
    try {
      const result = await insertTreatment(TEST_TAG);
      console.log(result);

      if (result.status && result.status === 200) {
        const row = result.data.rows[0];
        if (row && api) {
          api.applyTransaction({
            add: [convertServerTreatmentToClient(row)],
            addIndex: 0,
          });
        }
      }
    } catch (error: any) {
      console.log(error);
      setGlobalSnackBar({ open: true, msg: "Internal server error", severity: "error" });
    }
  };

  return (
    <div className="flex items-center mb-2 gap-2">
      <IconButton onClick={onClick}>
        <AddCircleIcon />
      </IconButton>
      <TextField fullWidth label="Search" variant="outlined" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
    </div>
  );
};

export default TreatmentsHeader;
