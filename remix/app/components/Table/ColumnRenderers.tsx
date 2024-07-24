/** @format */

import { type MRT_Row, type MRT_Column, type MRT_Cell } from "material-react-table";
import { ChipColor, OpReadiness, PRecord, SearchHelp } from "../../type";
import { Autocomplete, Box, TextField } from "@mui/material";
import Chip from "@mui/material/Chip";
import { ROLE, Role, TREATMENTS } from "shared";
import { CONSULTANT, COORDINATOR, DOCTOR, FIELDS_DOCTOR, FIELDS_NURSE, FIELDS_PAITENT, NURSINGSTAFF1, NURSINGSTAFF2, SKINCARESPECIALIST1, SKINCARESPECIALIST2 } from "~/constant";
import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimeField } from "@mui/x-date-pickers/DateTimeField";
import { MutableRefObject, ReactNode, useEffect, useRef, useState } from "react";
import { ChipPropsColorOverrides, ChipPropsSizeOverrides } from "@mui/joy/Chip/ChipProps";
import { OverridableStringUnion } from "@mui/types";

export const checkInTimeCell = ({ cell }: { cell: MRT_Cell<PRecord, unknown> }) => {
  const date = dayjs(cell.getValue<number>() * 1000);
  return (
    <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
      <span>{date.format("YYYY/MM/DD")}</span>
      <span>{date.format("hh:mm A")}</span>
    </Box>
  );
};

export const checkInTimeEdit = (row: MRT_Row<PRecord>, originalPRecord: MutableRefObject<PRecord | undefined>) => {
  const onChange = (value: Dayjs | null) => {
    originalPRecord.current = JSON.parse(JSON.stringify(row.original));

    if (!value) {
      value = dayjs();
    }

    originalPRecord.current!.checkInTime = value?.unix();
  };
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DateTimeField format="YYYY/MM/DD hh:mm A" slotProps={{ textField: { variant: "standard" } }} defaultValue={dayjs(originalPRecord.current!.checkInTime! * 1000)} onChange={onChange} />
    </LocalizationProvider>
  );
};
export const treatmentCell = ({ cell }: { cell: MRT_Cell<PRecord, unknown> }) => {
  let idx = -1;
  for (let i = 0; i < TREATMENTS.length; i++) {
    const element = TREATMENTS[i];
    if (element.id === cell.getValue()) {
      idx = i;
      break;
    }
  }

  return;
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
    <div>
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

export const opReadinessCell = ({ cell }: { cell: MRT_Cell<PRecord, unknown> }) => {
  let size: OverridableStringUnion<"small" | "medium", ChipPropsSizeOverrides> = "small";
  let label: ReactNode = cell.getValue<OpReadiness>();
  let color: ChipColor = getStatusChipColor(label);
  return <OpReadinessChip label={label} size={size} color={color} />;
};
export const treatmentEdit = (row: MRT_Row<PRecord>, originalPRecord: MutableRefObject<PRecord | undefined>) => {
  let idx = -1;
  for (let i = 0; i < TREATMENTS.length; i++) {
    const element = TREATMENTS[i];
    if (element.id === row.original.treatment1) {
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
    originalPRecord.current = JSON.parse(JSON.stringify(row.original));
    originalPRecord.current!.treatment1 = value?.id;
  };

  return (
    <Autocomplete
      sx={{ width: "100%" }}
      options={TREATMENTS}
      groupBy={(option) => option.group}
      getOptionLabel={(option) => option.title}
      onChange={(_, value) => onChange(value)}
      defaultValue={TREATMENTS[idx]}
      renderInput={(params) => <TextField {...params} label="시술" variant="standard" />}
    />
  );
};

export const StaffEdit = (row: MRT_Row<PRecord>, originalPRecord: MutableRefObject<PRecord | undefined>, searchHelp: SearchHelp[], fieldname: keyof PRecord, label: string) => {
  let id: string | undefined = "";
  switch (fieldname) {
    case DOCTOR:
      id = row.original.doctor;
      break;
    case SKINCARESPECIALIST1:
      id = row.original.skincareSpecialist1;
      break;
    case SKINCARESPECIALIST2:
      id = row.original.skincareSpecialist2;
      break;
    case NURSINGSTAFF1:
      id = row.original.nursingStaff1;
      break;
    case NURSINGSTAFF2:
      id = row.original.nursingStaff2;
      break;
    case COORDINATOR:
      id = row.original.coordinator;
      break;
    case CONSULTANT:
      id = row.original.consultant;
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

  const onChange = (
    value: {
      id: string;
      title: string;
    } | null
  ) => {
    if (originalPRecord.current == undefined) {
      originalPRecord.current = JSON.parse(JSON.stringify(row.original));
    }
    switch (fieldname) {
      case DOCTOR:
        originalPRecord.current!.doctor = value?.id;
        break;
      case SKINCARESPECIALIST1:
        originalPRecord.current!.skincareSpecialist1 = value?.id;
        break;
      case SKINCARESPECIALIST2:
        originalPRecord.current!.skincareSpecialist2 = value?.id;
        break;
      case NURSINGSTAFF1:
        originalPRecord.current!.nursingStaff1 = value?.id;
        break;
      case NURSINGSTAFF2:
        originalPRecord.current!.nursingStaff2 = value?.id;
        break;
      case COORDINATOR:
        originalPRecord.current!.coordinator = value?.id;
        break;
      case CONSULTANT:
        originalPRecord.current!.consultant = value?.id;
        break;
      default:
        break;
    }
  };

  return (
    <Autocomplete
      sx={{ width: "100%" }}
      options={searchHelp}
      getOptionLabel={(option) => option.title}
      onChange={(_, value) => onChange(value)}
      defaultValue={searchHelp[idx]}
      renderInput={(params) => <TextField {...params} label={label} variant="standard" />}
    />
  );
};
export const nameChipRendererByFieldname = (fieldname: string, searchHelp: SearchHelp[], id?: string) => {
  let color: ChipColor = "warning";
  if (FIELDS_DOCTOR.includes(fieldname)) {
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
  return title ? <Chip size="small" color={color} label={title} /> : <></>;
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

export const nameChipCell = (cell: MRT_Cell<PRecord, unknown>, column: MRT_Column<PRecord, unknown>, searchHelp: SearchHelp[]) => {
  return nameChipRendererByFieldname(column.columnDef.header, searchHelp, cell.getValue()?.toString());
};
