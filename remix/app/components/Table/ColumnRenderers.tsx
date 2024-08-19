/** @format */

import { ChipColor, OpReadiness, PRecord, SearchHelp, TableType } from "../../type";
import { Autocomplete, Box, TextField } from "@mui/material";
import Chip from "@mui/material/Chip";
import { ROLE, Role, TREATMENTS } from "shared";
import { FIELDS_DOCTOR, FIELDS_NURSE, FIELDS_PAITENT, OPREADINESS_C, OPREADINESS_N, OPREADINESS_P, OPREADINESS_Y } from "~/constant";
import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimeField } from "@mui/x-date-pickers/DateTimeField";
import React, { ReactNode, useEffect, useRef, useState } from "react";
import { ChipPropsSizeOverrides } from "@mui/joy/Chip/ChipProps";
import { OverridableStringUnion } from "@mui/types";
import { CustomCellEditorProps, CustomCellRendererProps } from "ag-grid-react";
import { autoCompleteKeyDownCapture, checkForUnReadyTreatments, editAndStopRecord, getValueWithId, refreshTreatmentCells, statusTransition } from "~/utils/utils";
import Tooltip, { tooltipClasses, TooltipProps } from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";
import { GridApi } from "ag-grid-community";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { globalSnackbarState, userState } from "~/recoil_state";
import MenuList from "@mui/material/MenuList";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import ContentCut from "@mui/icons-material/ContentCut";

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

export const opReadinessCell = ({ value }: { value: OpReadiness }) => {
  let size: OverridableStringUnion<"small" | "medium", ChipPropsSizeOverrides> = "small";
  let label: ReactNode = value;
  let color: ChipColor = getStatusChipColor(label);
  return value && <Chip size={size} label={label} color={color} />;
};

type TreatmentTooltipProps = {
  record: PRecord;
  api: GridApi<any>;
  treatmentNumber: string | undefined;
  closeTooltip: () => void;
};

export const TreatmentTooltip: React.FC<TreatmentTooltipProps> = ({ record, api, treatmentNumber, closeTooltip }) => {
  const user = useRecoilValue(userState);
  const setGlobalSnackBar = useSetRecoilState(globalSnackbarState);
  const [confirmItemTitle, setConfirmItemTitle] = useState("");
  const [cancelItemTitle, setCancelItemTitle] = useState("");

  useEffect(() => {
    setConfirmItemTitle(() => {
      if (record.opReadiness === OPREADINESS_N) {
        return "준비 완료";
      } else if (record.opReadiness === OPREADINESS_P) {
        return "시술 완료";
      } else if (record.opReadiness === OPREADINESS_Y) {
        return "시술 시작";
      }
      return "";
    });
    setCancelItemTitle(() => {
      if (record.opReadiness === OPREADINESS_N) {
        return "준비 완료";
      } else if (record.opReadiness === OPREADINESS_P) {
        return "시술 완료";
      } else if (record.opReadiness === OPREADINESS_Y) {
        return "시술 시작";
      }
      return "";
    });
  }, []);

  const handleConfirm = async () => {
    closeTooltip();

    try {
      if (!record || !treatmentNumber || !user) return;
      const time = dayjs().unix();

      if (record.opReadiness === OPREADINESS_N) {
        record[`treatmentReady${treatmentNumber}`] = time;
      } else if (record.opReadiness === OPREADINESS_P) {
        record[`treatmentEnd${treatmentNumber}`] = time;
        record["doctor"] = undefined;
      } else if (record.opReadiness === OPREADINESS_Y) {
        record[`treatmentStart${treatmentNumber}`] = time;
        record.doctor = user.id;
      }

      record.opReadiness = statusTransition(record);
      editAndStopRecord(api, record);
    } catch (error) {
      setGlobalSnackBar({ open: true, msg: "서버 에러.", severity: "error" });
    }
  };
  const handleCancel = async () => {
    closeTooltip();

    try {
      if (!record || !treatmentNumber || !user) return;
      const ready = record[`treatmentReady${treatmentNumber}`];
      const start = record[`treatmentStart${treatmentNumber}`];
      const end = record[`treatmentEnd${treatmentNumber}`];

      if (ready) {
        if (!start && !end) {
          record[`treatmentReady${treatmentNumber}`] = undefined;
        }
        if (start && !end) {
          record[`treatmentStart${treatmentNumber}`] = undefined;
        }
        if (start && end) {
          record[`treatmentEnd${treatmentNumber}`] = undefined;
        }
      }

      record.opReadiness = statusTransition(record);
      editAndStopRecord(api, record);
    } catch (error) {
      setGlobalSnackBar({ open: true, msg: "서버 에러.", severity: "error" });
    }
  };
  return (
    <Paper sx={{ width: 200, maxWidth: "100%" }}>
      <MenuList>
        <MenuItem onClick={handleConfirm}>
          <ListItemIcon>
            <ContentCut fontSize="small" />
          </ListItemIcon>
          <ListItemText>{confirmItemTitle}</ListItemText>
        </MenuItem>
        {cancelItemTitle && (
          <MenuItem onClick={handleCancel}>
            <ListItemIcon>
              <ContentCut fontSize="small" />
            </ListItemIcon>
            <ListItemText>{cancelItemTitle}</ListItemText>
          </MenuItem>
        )}
      </MenuList>
    </Paper>
  );
};

const CustomToolTip = styled(({ className, ...props }: TooltipProps) => <Tooltip {...props} classes={{ popper: className }} />)(({ theme }) => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: "white",
    "&::before": {
      backgroundColor: "white",
      border: "1px solid #999",
    },
  },
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.white,
    color: "rgba(0, 0, 0, 0.87)",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.3)",
    fontSize: 11,
    padding: 0,
  },
}));

export const treatmentCell = ({ data, value, colDef, api }: CustomCellRendererProps, tableType: TableType) => {
  const number = colDef?.field?.charAt(colDef.field.length - 1);
  const endTime: keyof PRecord = `treatmentEnd${number}`;
  const canBeAssigned = data.opReadiness === "Y" && data[`treatmentReady${number}`] && !data[`treatmentEnd${number}`];
  const isInProgressTreatment = data[`treatmentStart${number}`] && !data[`treatmentEnd${number}`];
  const canBeReady = !data[`treatmentReady${number}`] && data[`treatment${number}`];
  const [open, setOpen] = useState(false);

  const disableHoverListener = (!canBeAssigned && !isInProgressTreatment && !canBeReady) || !value;
  const onMouseEnter = () => {
    setOpen(!disableHoverListener);
  };
  const closeTooltip = () => {
    setOpen(false);
  };
  return (
    <div onMouseEnter={onMouseEnter} onMouseLeave={closeTooltip}>
      <CustomToolTip open={open} placement="top" title={<TreatmentTooltip treatmentNumber={number} api={api} record={data} closeTooltip={closeTooltip} />} arrow>
        <div>
          <span
            className={`${data[endTime] && "line-through"} ${tableType === "Ready" && (canBeAssigned ? "font-black" : "text-gray-400")} ${
              tableType === "ExceptReady" && data.opReadiness === "P" && (isInProgressTreatment ? "font-black" : "text-gray-400")
            }`}>
            {getValueWithId(TREATMENTS, value).title}
          </span>
        </div>
      </CustomToolTip>
    </div>
  );
};

export const autoCompleteEdit = ({ value, onValueChange, api, data, colDef }: CustomCellEditorProps, searchHelp: SearchHelp[], setModalOpen?: () => void) => {
  const optionRef = useRef<SearchHelp | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isFirstKeyDown = useRef<boolean>(true);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputRef.current]);

  let idx = searchHelp.findIndex((t) => t.id === value);

  const onChange = (
    newValue: {
      id: string;
      group: string;
      title: string;
    } | null
  ) => {
    if (newValue) {
      onValueChange(newValue.id);

      if (colDef.field && /^treatment\d+$/.test(colDef.field)) {
        const row = api.getRowNode(data.id);
        if (row?.data.opReadiness === OPREADINESS_C) {
          row.data.opReadiness = OPREADINESS_N;
        }
      }
    }
  };

  const handleKeyDown = () => {
    if (inputRef.current && isFirstKeyDown.current) {
      inputRef.current.value = "";
      isFirstKeyDown.current = false;
    }
  };

  return (
    <Autocomplete
      sx={{ width: "100%" }}
      onHighlightChange={(_, option) => {
        optionRef.current = option;
      }}
      options={searchHelp}
      groupBy={(option) => option.group}
      getOptionLabel={(option) => option.title}
      onChange={(_, value) => onChange(value)}
      value={searchHelp[idx]}
      onKeyDownCapture={(event) => autoCompleteKeyDownCapture(event, onValueChange, optionRef, setModalOpen)}
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
