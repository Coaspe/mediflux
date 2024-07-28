/** @format */

import { ChipColor, OpReadiness, PRecord, SearchHelp } from "../../type";
import { Autocomplete, Box, TextField } from "@mui/material";
import Chip from "@mui/material/Chip";
import { ROLE, Role, TREATMENTS } from "shared";
import { CONSULTANT, COORDINATOR, DOCTOR, FIELDS_DOCTOR, FIELDS_NURSE, FIELDS_PAITENT, NURSINGSTAFF1, NURSINGSTAFF2, SKINCARESPECIALIST1, SKINCARESPECIALIST2 } from "~/constant";
import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimeField } from "@mui/x-date-pickers/DateTimeField";
import { ReactNode, useEffect, useRef, useState } from "react";
import { ChipPropsColorOverrides, ChipPropsSizeOverrides } from "@mui/joy/Chip/ChipProps";
import { OverridableStringUnion } from "@mui/types";
import { CustomCellEditorProps } from "ag-grid-react";

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

const OpReadinessChip = ({
  label,
  size,
  color,
}: {
  label: ReactNode;
  size: OverridableStringUnion<"small" | "medium", ChipPropsSizeOverrides>;
  color: OverridableStringUnion<"default" | "error" | "primary" | "secondary" | "info" | "success" | "warning", ChipPropsColorOverrides>;
}) => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLElement | null>(null);
  const popperRef = useRef<HTMLDivElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    anchorRef.current = event.target as HTMLElement;
    setOpen((prev) => !prev);
  };

  const handleClose = (event: MouseEvent | TouchEvent) => {
    if (popperRef.current && anchorRef.current && !popperRef.current.contains(event.target as Node) && !anchorRef.current.contains(event.target as Node)) {
      setOpen(false);
    }
  };

  useEffect(() => {
    if (open) {
      document.addEventListener("mousedown", handleClose);
      document.addEventListener("touchstart", handleClose);
    } else {
      document.removeEventListener("mousedown", handleClose);
      document.removeEventListener("touchstart", handleClose);
    }

    return () => {
      document.removeEventListener("mousedown", handleClose);
      document.removeEventListener("touchstart", handleClose);
    };
  }, [open]);

  return label ? (
    <div className="w-full h-full flex justify-center items-center">
      <Chip onClick={handleClick} style={{ cursor: "pointer", transition: "transform 0.2s ease-in-out" }} sx={{ "&:hover": { transform: "scale(1.1)" } }} size={size} label={label} color={color} />
    </div>
  ) : (
    <div></div>
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

export const opReadinessCell = (value: OpReadiness) => {
  let size: OverridableStringUnion<"small" | "medium", ChipPropsSizeOverrides> = "small";
  let label: ReactNode = value;
  let color: ChipColor = getStatusChipColor(label);
  return <OpReadinessChip label={label} size={size} color={color} />;
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
  return (
    <Autocomplete
      sx={{ width: "100%" }}
      options={OPREADINESSE_SEARCH_HELP}
      getOptionLabel={(option) => option.label}
      onChange={(_, option) => onChange(option)}
      defaultValue={OPREADINESSE_SEARCH_HELP[idx]}
      value={OPREADINESSE_SEARCH_HELP[idx]}
      renderInput={(params) => <TextField {...params} variant="standard" />}
    />
  );
};

export const treatmentEdit = ({ value, onValueChange }: CustomCellEditorProps) => {
  let idx = -1;
  for (let i = 0; i < TREATMENTS.length; i++) {
    const element = TREATMENTS[i];
    if (element.id === value) {
      idx = i;
      break;
    }
  }
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

  return (
    <Autocomplete
      sx={{ width: "100%" }}
      options={TREATMENTS}
      groupBy={(option) => option.group}
      getOptionLabel={(option) => option.title}
      onChange={(_, value) => onChange(value)}
      defaultValue={TREATMENTS[idx]}
      value={TREATMENTS[idx]}
      renderInput={(params) => <TextField {...params} variant="standard" />}
    />
  );
};

export const StaffEdit = (original: PRecord, searchHelp: SearchHelp[], fieldname: keyof PRecord | undefined, onValueChange: (value: any) => void) => {
  let id: string | undefined = "";
  switch (fieldname) {
    case DOCTOR:
      id = original.doctor;
      break;
    case SKINCARESPECIALIST1:
      id = original.skincareSpecialist1;
      break;
    case SKINCARESPECIALIST2:
      id = original.skincareSpecialist2;
      break;
    case NURSINGSTAFF1:
      id = original.nursingStaff1;
      break;
    case NURSINGSTAFF2:
      id = original.nursingStaff2;
      break;
    case COORDINATOR:
      id = original.coordinator;
      break;
    case CONSULTANT:
      id = original.consultant;
      break;
    default:
      break;
  }

  let idx = -1;
  for (let i = 0; i < searchHelp.length; i++) {
    const element = searchHelp[i];
    if (element.id === id) {
      idx = i;
      break;
    }
  }
  console.log(idx);

  const onChange = (
    value: {
      id: string;
      title: string;
    } | null
  ) => {
    if (value) {
      onValueChange(value.id);
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      <Autocomplete
        sx={{
          border: "none",
          width: "70%",
          "& .MuiOutlinedInput-root": {
            "&:before, &:after": {
              borderBottom: "none",
            },
          },
        }}
        options={searchHelp}
        getOptionLabel={(option) => option.title}
        onChange={(_, value) => onChange(value)}
        defaultValue={searchHelp[idx]}
        value={searchHelp[idx]}
        renderInput={(params) => <TextField {...params} variant="standard" />}
      />
    </div>
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
