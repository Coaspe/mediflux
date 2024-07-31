/** @format */

import { ChipColor, OpReadiness, PRecord, SearchHelp } from "../../type";
import { Autocomplete, Box, TextField, Tooltip } from "@mui/material";
import Chip from "@mui/material/Chip";
import { ROLE, Role, TREATMENTS } from "shared";
import { FIELDS_DOCTOR, FIELDS_NURSE, FIELDS_PAITENT } from "~/constant";
import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimeField } from "@mui/x-date-pickers/DateTimeField";
import { ReactNode, RefObject, useEffect, useRef, useState } from "react";
import { ChipPropsSizeOverrides } from "@mui/joy/Chip/ChipProps";
import { OverridableStringUnion } from "@mui/types";
import { AgGridReact, CustomCellEditorProps, CustomCellRendererProps } from "ag-grid-react";
import { autoCompleteKeyDownCapture, getValueWithId } from "~/utils/utils";

export const checkInTimeCell = (value: number) => {
  const date = dayjs(value * 1000);
  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
      <span>
        {date.format("YYYY/MM/DD")} {date.format("hh:mm A")}
      </span>
    </Box>
  );
};

export const checkInTimeEdit = (value: number, onValueChange: (value: number) => void) => {
  const onChange = (val: Dayjs | null) => {
    onValueChange(dayjs(val).unix());
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DateTimeField format="YYYY/MM/DD hh:mm A" slotProps={{ textField: { variant: "standard" } }} defaultValue={dayjs(value * 1000)} onChange={onChange} />
    </LocalizationProvider>
  );
};

export const getStatusChipColor = (label: ReactNode): ChipColor => {
  switch (label) {
    case "N":
      return "error";
    case "P":
      return "primary";
    case "D":
      return "info";
    case "C":
      return "secondary";
    default:
      return "success";
  }
};
export const opReadinessCellWithToolTip = (value: OpReadiness) => {
  return <OpReadinessCell value={value} />;
};

export const OpReadinessCell = ({ value }: { value: OpReadiness }) => {
  let size: OverridableStringUnion<"small" | "medium", ChipPropsSizeOverrides> = "small";
  let label: ReactNode = value;
  let color: ChipColor = getStatusChipColor(label);
  return <Chip size={size} label={label} color={color} />;
};

type OpReadicnessSearchHelp = {
  label: string;
  value: OpReadiness;
};
const OPREADINESSE_SEARCH_HELP: OpReadicnessSearchHelp[] = [
  { label: "준비 완료 (Y)", value: "Y" },
  { label: "준비 미완료 (N)", value: "N" },
  { label: "시술 완료 (C)", value: "C" },
  { label: "시술 중 (P)", value: "P" },
];

export const opReadinessEdit = ({ value, onValueChange }: CustomCellEditorProps) => {
  const onChange = (option: OpReadicnessSearchHelp | null) => {
    if (option) {
      onValueChange(option.value);
    }
  };
  let idx = OPREADINESSE_SEARCH_HELP.findIndex((element) => element.value === value);

  let options: OpReadicnessSearchHelp[] = OPREADINESSE_SEARCH_HELP;

  return (
    <Autocomplete
      sx={{ width: "100%" }}
      options={options}
      getOptionLabel={(option) => option.label}
      onChange={(_, option) => onChange(option)}
      value={OPREADINESSE_SEARCH_HELP[idx]}
      renderInput={(params) => <TextField {...params} variant="standard" />}
    />
  );
};
export const treatmentCell = ({ data, value, colDef }: CustomCellRendererProps) => {
  const number = colDef?.field?.charAt(colDef.field.length - 1);
  const field: keyof PRecord = `treatmentReady${number}`;
  return <span className={`${data[field] && "line-through"}`}>{getValueWithId(TREATMENTS, value).title}</span>;
};
export const autoCompleteEdit = ({ value, onValueChange }: CustomCellEditorProps, searchHelp: SearchHelp[], gridRef: RefObject<AgGridReact<PRecord>>) => {
  const optionRef = useRef("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isFirstKeyDown = useRef<boolean>(true);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [inputRef.current]);

  let idx = searchHelp.findIndex((t) => t.id === value);
  const onChange = (
    value: {
      id: string;
      group: string;
      title: string;
    } | null
  ) => {
    if (value) {
      onValueChange(value.id);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (inputRef.current && isFirstKeyDown.current) {
      inputRef.current.value = "";
      isFirstKeyDown.current = false;
    }
  };

  return (
    <Autocomplete
      sx={{ width: "100%" }}
      onHighlightChange={(event, option) => {
        if (option?.id) {
          optionRef.current = option?.id;
        }
      }}
      options={searchHelp}
      groupBy={(option) => option.group}
      getOptionLabel={(option) => option.title}
      onChange={(_, value) => onChange(value)}
      value={searchHelp[idx]}
      onKeyDownCapture={(event) => autoCompleteKeyDownCapture(event, onValueChange, gridRef, optionRef)}
      renderInput={(params) => <TextField onKeyDown={handleKeyDown} inputRef={inputRef} {...params} variant="standard" />}
    />
  );
};

export const nameChipRendererByFieldname = (fieldname: string | undefined, searchHelp: SearchHelp[], id?: string) => {
  let color: ChipColor = "warning";
  if (fieldname === undefined) {
    color = "default";
  } else if (FIELDS_DOCTOR.includes(fieldname)) {
    color = "primary";
  } else if (FIELDS_NURSE.includes(fieldname)) {
    color = "secondary";
  } else if (FIELDS_PAITENT.includes(fieldname)) {
    color = "default";
  }
  let title = "";
  for (let i = 0; i < searchHelp.length; i++) {
    const element = searchHelp[i];
    if (element.id === id) {
      title = element.title;
    }
  }
  return title ? (
    <div className="w-full h-full flex justify-center items-center">
      <Chip size="small" color={color} label={title} />
    </div>
  ) : (
    <></>
  );
};
export const nameChipRendererByRole = (role: Role, name?: string) => {
  let color: ChipColor;
  switch (role) {
    case ROLE.DOCTOR:
      color = "primary";
      break;
    case ROLE.NURSE:
      color = "secondary";
    case ROLE.STAFF:
      color = "default";
    default:
      color = "warning";
      break;
  }
  return name ? <Chip size="small" color={color} label={name} /> : <></>;
};

export const nameChipCell = (headerName: string | undefined, searchHelp: SearchHelp[], id?: string) => {
  return nameChipRendererByFieldname(headerName, searchHelp, id);
};
