/** @format */
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { AgGridReactProps, AgGridReact } from "ag-grid-react";
import { useState, useEffect } from "react";
import LoadingOverlay from "../Loading";
import { Box } from "@mui/material";
import { Dispatch, FC, SetStateAction } from "react";
import { TextField } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { useSetRecoilState } from "recoil";
import { insertTreatment } from "~/utils/request.client";
import { TEST_TAG } from "~/constants/constant";
import { GridApi } from "ag-grid-community";
import { globalSnackbarState } from "~/recoil_state";
import { SearchableType } from "~/types/type";

type SearchableGridProps = {
  originalData: SearchableType[];
  gridProps: AgGridReactProps;
  gridRef: React.RefObject<AgGridReact>;
  addButton: boolean;
};
const SearchableGrid: React.FC<SearchableGridProps> = ({ originalData, gridProps, addButton, gridRef }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [rowData, setRowData] = useState<any[]>([]);

  useEffect(() => {
    setRowData(originalData.filter((data) => data.searchTitle?.toLowerCase().includes(searchTerm.replace(/\s/g, "").toLowerCase())));
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
    const {
      statusCode,
      body: { data: { rows = [] } = {}, error = null },
    } = await insertTreatment(TEST_TAG, window.ENV.FRONT_BASE_URL);

    if (statusCode === 200) {
      const row = rows[0];
      if (row && api) {
        api.applyTransaction({
          add: [row],
          addIndex: 0,
        });
      }
    } else {
      error && setGlobalSnackBar({ open: true, msg: error, severity: "error" });
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
