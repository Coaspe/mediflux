/** @format */

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, TextField } from "@mui/material";
import { convertServerTreatmentToClient } from "~/utils/utils";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { globalSnackbarState, treatmentSearchHelpState, userState } from "~/recoil_state";
import { getAllTreatments, updateRecord, updateTreatment } from "~/utils/request.client";
import { TEST_TAG, TREATMENT_NAME_COLUMN } from "~/constant";
import { CustomAgGridReactProps, Treatment } from "~/type";
import { ColDef, CellEditingStoppedEvent, CellEditingStartedEvent, GridApi } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { treatmentGroupColumn, treatmentDurationColumn, treatmentPriceColumn, treatmentPointColumn } from "~/utils/Table/columnDef";

const SearchableList: React.FC = () => {
  const user = useRecoilValue(userState);
  const [searchTerm, setSearchTerm] = useState("");
  const gridRef = useRef<CustomAgGridReactProps<Treatment>>(null);
  const setGlobalSnackBar = useSetRecoilState(globalSnackbarState);
  const [rowData, setRowData] = useState<Treatment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [colDefs, setColDefs] = useState<ColDef<Treatment, any>[]>([]);
  const [treatments, setTreatements] = useRecoilState(treatmentSearchHelpState);

  useEffect(() => {
    const getTreatments = async () => {
      try {
        const rows = await getAllTreatments(TEST_TAG);
        if (rows.data) {
          const convertedData = rows.data.map((t: any) => {
            let ret = convertServerTreatmentToClient(t);
            ret.searchTitle = ret.title.replace(/\s/g, "");
            return ret;
          });
          setRowData(convertedData.filter((treatment: any) => treatment.searchTitle?.toLowerCase().includes(searchTerm.replace(/\s/g, "").toLowerCase())));
        }
      } catch (error) {
        console.error("Error fetching treatments:", error);
      }
    };
    getTreatments();
  }, []);

  const showErrorSnackbar = useCallback(
    (message: string) => {
      setGlobalSnackBar({ open: true, msg: message, severity: "error" });
    },
    [setGlobalSnackBar]
  );

  useEffect(() => {
    setColDefs([
      { field: "id", headerName: "id", hide: true },
      { field: "title", headerName: "이름", width: TREATMENT_NAME_COLUMN },
      treatmentGroupColumn(treatments),
      treatmentDurationColumn(),
      treatmentPriceColumn(),
      treatmentPointColumn(),
    ]);
  }, []);

  const defaultColDef = useMemo<ColDef>(() => {
    return {
      editable: true,
    };
  }, []);

  const saveRecord = async (treatment: Treatment, oldValue: any, field: string, api: GridApi<Treatment>) => {
    const copyTreatment: Treatment = JSON.parse(JSON.stringify(treatment));

    try {
      const updateResult = await updateTreatment(treatment, TEST_TAG);

      if (updateResult.status === 200) {
        gridRef.current?.api.applyTransaction({
          update: [treatment],
        });
      }
    } catch (error) {
      if (field) {
        copyTreatment[field] = oldValue;
        await updateRecord(copyTreatment, TEST_TAG);
        api.applyTransaction({
          update: [copyTreatment],
        });
      }
      showErrorSnackbar("Internal server error");
    }
  };

  const onCellEditingStopped = async (event: CellEditingStoppedEvent<Treatment, any>) => {
    if (event.data && event.colDef.field && gridRef.current) {
      const data: Treatment = JSON.parse(JSON.stringify(event.data));
      saveRecord(data, event.oldValue, event.colDef.field, gridRef.current.api);
    }
  };

  const onCellEditingStarted = async (event: CellEditingStartedEvent<Treatment, any>) => {};

  const noRowsOverlayComponent = () => {
    return <span>차트가 존재하지 않습니다</span>;
  };

  const rowStyle = {
    fontSize: "0.75rem" /* 12px */,
    lineheight: "1rem" /* 16px */,
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 1000, mx: "auto", mt: 4 }}>
      <TextField fullWidth label="Search" variant="outlined" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} sx={{ mb: 2 }} />
      <div className="ag-theme-quartz" style={{ height: "50%", display: "flex", flexDirection: "column" }}>
        <AgGridReact
          ref={gridRef}
          onCellEditingStopped={onCellEditingStopped}
          onCellEditingStarted={onCellEditingStarted}
          defaultColDef={defaultColDef}
          rowData={rowData}
          columnDefs={colDefs}
          getRowId={(params) => params.data.id}
          pagination={true}
          paginationPageSize={20}
          rowSelection={"multiple"}
          rowStyle={rowStyle}
          loading={isLoading}
          noRowsOverlayComponent={noRowsOverlayComponent}
        />
      </div>
    </Box>
  );
};

export default SearchableList;
