import { AgGridReactProps, AgGridReact } from "ag-grid-react";
import { useState, useRef, useEffect } from "react";
import { Treatment, CustomAgGridReactProps } from "~/type";
import LoadingOverlay from "../Loading";
import { Box } from "@mui/material";
import { Dispatch, FC, SetStateAction } from "react";
import { TextField } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { useSetRecoilState } from "recoil";
import { insertTreatment } from "~/utils/request.client";
import { TEST_TAG } from "~/constant";
import { GridApi } from "ag-grid-community";
import { convertServerTreatmentToClient } from "~/utils/utils";
import { globalSnackbarState } from "~/recoil_state";

type SearchableGridProps<T> = {
  originalData: T[];
  gridProps: AgGridReactProps;
  addButton: boolean;
};
const SearchableGrid: React.FC<SearchableGridProps<any>> = ({ originalData, gridProps, addButton }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const gridRef = useRef<CustomAgGridReactProps<any>>(null);
  const [rowData, setRowData] = useState<any[]>([]);

  useEffect(() => {
    setRowData(originalData.filter((data: any) => data.searchTitle?.toLowerCase().includes(searchTerm.replace(/\s/g, "").toLowerCase())));
  }, [searchTerm, originalData]);

  return (
    <Box sx={{ width: "100%", height: "100%", maxWidth: 680, maxHeight: 600, mx: "auto", mt: 4 }}>
      <SearchGridHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} api={gridRef.current?.api} addButton={addButton} />
      <div className="ag-theme-quartz" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <AgGridReact ref={gridRef} rowData={rowData} getRowId={(params) => params.data.id.toString()} loadingOverlayComponent={LoadingOverlay} className="animate-fadeIn" {...gridProps} />
      </div>
    </Box>
  );
};

type SearchGridHeaderProps = {
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  api: GridApi<any> | undefined;
  addButton: boolean;
};
const SearchGridHeader: FC<SearchGridHeaderProps> = ({ searchTerm, setSearchTerm, api, addButton }) => {
  const setGlobalSnackBar = useSetRecoilState(globalSnackbarState);

  const onClick = async () => {
    try {
      const result = await insertTreatment(TEST_TAG);

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
      {addButton && (
        <IconButton onClick={onClick}>
          <AddCircleIcon />
        </IconButton>
      )}
      <TextField fullWidth label="Search" variant="outlined" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
    </div>
  );
};

export default SearchableGrid;
