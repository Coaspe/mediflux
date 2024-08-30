/** @format */

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box } from "@mui/material";
import { convertServerTreatmentToClient } from "~/utils/utils";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { globalSnackbarState, treatmentSearchHelpState, userState } from "~/recoil_state";
import { getAllTreatments, updateTreatment } from "~/utils/request.client";
import { TEST_TAG, TREATMENT_NAME_COLUMN } from "~/constant";
import { CustomAgGridReactProps, Treatment } from "~/type";
import { ColDef, CellEditingStoppedEvent, CellEditingStartedEvent, GridApi } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { treatmentGroupColumn, treatmentDurationColumn, treatmentPriceColumn, treatmentPointColumn, treatementDeleteColumn } from "~/utils/Table/columnDef";
import TreatmentsHeader from "~/components/Treatments/Header";
import "../css/Table.css";
const SearchableList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const gridRef = useRef<CustomAgGridReactProps<Treatment>>(null);
  const setGlobalSnackBar = useSetRecoilState(globalSnackbarState);
  const [originData, setOriginData] = useState<Treatment[]>([]);
  const [rowData, setRowData] = useState<Treatment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [colDefs, setColDefs] = useState<ColDef<Treatment, any>[]>([]);
  const [treatments, setTreatements] = useRecoilState(treatmentSearchHelpState);

  useEffect(() => {
    const getTreatments = async () => {
      try {
        setIsLoading(true);
        const rows = await getAllTreatments(TEST_TAG);
        if (rows.data) {
          const convertedData: Treatment[] = rows.data.map((t: any) => {
            let ret = convertServerTreatmentToClient(t);
            ret.searchTitle = ret.title.replace(/\s/g, "");
            return ret;
          });
          convertedData.sort((a, b) => {
            const groupComparison = a.group.localeCompare(b.group, "ko");
            if (groupComparison !== 0) {
              return groupComparison; // 1순위: group 기준 정렬
            } else {
              return a.title.localeCompare(b.title, "ko"); // 2순위: title 기준 정렬
            }
          });
          setOriginData(convertedData);
        }
      } catch (error) {
        setGlobalSnackBar({ msg: "Internal server error", severity: "error", open: true });
        console.error("Error fetching treatments:", error);
      } finally {
        setIsLoading(false);
      }
    };
    getTreatments();
  }, []);
  // Columns definition
  useEffect(() => {
    setColDefs([
      { field: "id", headerName: "id", hide: true },
      { field: "title", headerName: "이름", width: TREATMENT_NAME_COLUMN },
      treatmentGroupColumn(treatments),
      treatmentDurationColumn(),
      treatmentPriceColumn(),
      treatmentPointColumn(),
      treatementDeleteColumn(setGlobalSnackBar),
    ]);
  }, []);

  useEffect(() => {
    setRowData(originData.filter((treatment: any) => treatment.searchTitle?.toLowerCase().includes(searchTerm.replace(/\s/g, "").toLowerCase())));
  }, [searchTerm, originData]);

  const showErrorSnackbar = useCallback(
    (message: string) => {
      setGlobalSnackBar({ open: true, msg: message, severity: "error" });
    },
    [setGlobalSnackBar]
  );

  const defaultColDef = useMemo<ColDef>(() => {
    return {
      editable: true,
    };
  }, []);

  const saveTreatment = async (treatment: Treatment, oldValue: any, field: string, api: GridApi<Treatment>) => {
    const copyTreatment: Treatment = JSON.parse(JSON.stringify(treatment));

    try {
      await updateTreatment(treatment, TEST_TAG);
    } catch (error) {
      if (field) {
        copyTreatment[field] = oldValue;
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
      saveTreatment(data, event.oldValue, event.colDef.field, gridRef.current.api);
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
    <Box sx={{ width: "100%", height: "100%", maxWidth: 680, maxHeight: 600, mx: "auto", mt: 4 }}>
      <TreatmentsHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <div className="ag-theme-quartz" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <AgGridReact
          ref={gridRef}
          onCellEditingStopped={onCellEditingStopped}
          onCellEditingStarted={onCellEditingStarted}
          defaultColDef={defaultColDef}
          rowData={rowData}
          columnDefs={colDefs}
          getRowId={(params) => params.data.id.toString()}
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
