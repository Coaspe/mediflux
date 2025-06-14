/** @format */

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "../css/Table.css";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { globalSnackbarState, userState } from "~/recoil_state";
import { updateTreatment } from "~/utils/request.client";
import { ID, TITLE, TITLE_H, TREATMENT_NAME_COLUMN } from "~/constants/constant";
import { CustomAgGridReactProps, Treatment } from "~/types/type";
import { ColDef, CellEditingStoppedEvent, GridApi } from "ag-grid-community";
import { AgGridReactProps } from "ag-grid-react";
import { treatmentGroupColumn, treatmentDurationColumn, treatmentPriceColumn, treatmentPointColumn, treatementDeleteColumn } from "~/utils/Table/columnDef";
import { getAllTreatments } from "~/utils/request";
import SearchableGrid from "~/components/Table/SearchableGrid";
import { getSession } from "~/services/session.server";
import { useLoaderData } from "@remix-run/react";

export async function loader({ request }: { request: Request }) {
  const clinic = (await getSession(request)).get("clinic");
  const treatmentsResponse = await getAllTreatments(clinic, process.env.SERVER_BASE_URL);
  const {
    statusCode,
    body: {
      data: { rows: treatmentsData },
    },
  } = treatmentsResponse;

  if (statusCode === 200) {
    return { treatments: treatmentsData };
  }
  return null;
}

const Treatments: React.FC = () => {
  const gridRef = useRef<CustomAgGridReactProps<Treatment>>(null);
  const setGlobalSnackBar = useSetRecoilState(globalSnackbarState);
  const [data, setData] = useState<Treatment[]>([]);
  const [colDefs, setColDefs] = useState<ColDef<Treatment, any>[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const loaderData = useLoaderData<typeof loader>();
  const user = useRecoilValue(userState);

  useEffect(() => {
    const getTreatments = async () => {
      if (!loaderData) return;
      setIsLoading(true);
      const convertedData: Treatment[] = loaderData.treatments.map((t: Treatment) => {
        if (t.title) {
          t.searchTitle = t.title.replace(/\s/g, "");
        }
        return t;
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
      setIsLoading(false);
    };
    getTreatments();
  }, [loaderData]);

  // Columns definition
  useEffect(() => {
    if (!user) return;
    setColDefs([
      { field: ID, headerName: ID, hide: true },
      { field: TITLE, headerName: TITLE_H, width: TREATMENT_NAME_COLUMN },
      treatmentGroupColumn(),
      treatmentDurationColumn(),
      treatmentPriceColumn(),
      treatmentPointColumn(),
      treatementDeleteColumn(setGlobalSnackBar, user.clinic),
    ]);
  }, [user]);

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
    if (!user?.clinic) return;

    const copyTreatment: Treatment = JSON.parse(JSON.stringify(treatment));
    const result = await updateTreatment(treatment, user?.clinic, window.ENV.FRONT_BASE_URL);

    console.log(treatment);

    if (result.statusCode !== 200) {
      if (field in copyTreatment) {
        copyTreatment[field] = oldValue;
        api.applyTransaction({
          update: [copyTreatment],
        });
      }
      result.body.error && showErrorSnackbar(result.body.error);
    }
  };

  const onCellEditingStopped = async (event: CellEditingStoppedEvent<Treatment, any>) => {
    if (event.data && event.colDef.field && gridRef.current) {
      const data: Treatment = JSON.parse(JSON.stringify(event.data));
      saveTreatment(data, event.oldValue, event.colDef.field, gridRef.current.api);
    }
  };

  const noRowsOverlayComponent = () => {
    return <span>차트가 존재하지 않습니다</span>;
  };

  const rowStyle = {
    fontSize: "0.75rem" /* 12px */,
    lineheight: "1rem" /* 16px */,
  };

  const agGridProps: AgGridReactProps = {
    onCellEditingStopped,
    defaultColDef,
    columnDefs: colDefs,
    pagination: true,
    paginationPageSize: 20,
    rowSelection: "multiple",
    rowStyle,
    loading: isLoading,
    noRowsOverlayComponent,
  };
  return <SearchableGrid originalData={data} gridRef={gridRef} gridProps={agGridProps} addButton={true} />;
};

export default Treatments;
