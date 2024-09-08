import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "../css/Table.css";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { convertServerTreatmentToClient } from "~/utils/utils";
import { useSetRecoilState } from "recoil";
import { globalSnackbarState } from "~/recoil_state";
import { updateTreatment } from "~/utils/request.client";
import { TEST_TAG, TREATMENT_NAME_COLUMN } from "~/constant";
import { CustomAgGridReactProps, Treatment } from "~/type";
import { ColDef, CellEditingStoppedEvent, CellEditingStartedEvent, GridApi } from "ag-grid-community";
import { AgGridReactProps } from "ag-grid-react";
import { treatmentGroupColumn, treatmentDurationColumn, treatmentPriceColumn, treatmentPointColumn, treatementDeleteColumn } from "~/utils/Table/columnDef";
import { getAllTreatments } from "~/utils/request";
import SearchableGrid from "~/components/Table/SearchableGrid";
const Treatments: React.FC = () => {
  const gridRef = useRef<CustomAgGridReactProps<Treatment>>(null);
  const setGlobalSnackBar = useSetRecoilState(globalSnackbarState);
  const [data, setData] = useState<Treatment[]>([]);
  const [colDefs, setColDefs] = useState<ColDef<Treatment, any>[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getTreatments = async () => {
      try {
        setIsLoading(true);
        const rows = await getAllTreatments(TEST_TAG);
        if (rows.data) {
          const convertedData: Treatment[] = rows.data.map((t: any) => {
            let ret = convertServerTreatmentToClient(t);
            if (ret.title) {
              ret.searchTitle = ret.title.replace(/\s/g, "");
            }
            return ret;
          });

          convertedData.sort((a, b) => {
            if (a.group && b.group) {
              const groupComparison = a.group.localeCompare(b.group, "ko");
              if (groupComparison !== 0) {
                return groupComparison; // 1순위: group 기준 정렬
              } else {
                return a.title.localeCompare(b.title, "ko"); // 2순위: title 기준 정렬
              }
            } else if (b.group) {
              return 1;
            } else {
              return -1;
            }
          });
          setData(convertedData);
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
      treatmentGroupColumn(),
      treatmentDurationColumn(),
      treatmentPriceColumn(),
      treatmentPointColumn(),
      treatementDeleteColumn(setGlobalSnackBar),
    ]);
  }, []);

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
      if (field in copyTreatment) {
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

  const agGridProps: AgGridReactProps = {
    onCellEditingStopped,
    onCellEditingStarted,
    defaultColDef,
    columnDefs: colDefs,
    pagination: true,
    paginationPageSize: 20,
    rowSelection: "multiple",
    rowStyle,
    loading: isLoading,
    noRowsOverlayComponent,
  };
  return <SearchableGrid originalData={data} gridProps={agGridProps} addButton={true} />;
};

export default Treatments;
