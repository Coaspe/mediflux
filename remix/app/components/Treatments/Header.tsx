import { Dispatch, FC, SetStateAction } from "react";
import { TextField } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import AddCircleIcon from "@mui/icons-material/AddCircle";

type TreatmentHeaderProps = {
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
};
const TreatmentsHeader: FC<TreatmentHeaderProps> = ({ searchTerm, setSearchTerm }) => {
  const addTreatment = () => {};

  return (
    <div className="flex items-center mb-2 gap-2">
      <IconButton>
        <AddCircleIcon />
      </IconButton>
      <TextField fullWidth label="Search" variant="outlined" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
    </div>
  );
};

export default TreatmentsHeader;
