/** @format */

import { ChipColor, GlobalSnackBark, OpReadiness, PRecord, SearchHelp, TableType, Treatment } from "../../type";
import { Autocomplete, Box, TextField } from "@mui/material";
import Chip from "@mui/material/Chip";
import { ROLE, Role } from "shared";
import { FIELDS_DOCTOR, FIELDS_NURSE, FIELDS_PAITENT, OP_READINESS_C, OP_READINESS_N, OP_READINESS_P, OP_READINESS_Y, TEST_TAG } from "~/constant";
import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimeField } from "@mui/x-date-pickers/DateTimeField";
import React, { ReactElement, ReactNode, useEffect, useRef, useState } from "react";
import { ChipPropsSizeOverrides } from "@mui/joy/Chip/ChipProps";
import { OverridableStringUnion } from "@mui/types";
import { CustomCellEditorProps, CustomCellRendererProps } from "ag-grid-react";
import { autoCompleteKeyDownCapture, editAndStopRecord, getValueWithId, statusTransition } from "~/utils/utils";
import Tooltip, { tooltipClasses, TooltipProps } from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";
import { GridApi } from "ag-grid-community";
import { SetterOrUpdater, useRecoilValue, useSetRecoilState } from "recoil";
import { doctorSearchHelpState, globalSnackbarState, treatmentSearchHelpState, userState } from "~/recoil_state";
import MenuList from "@mui/material/MenuList";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import ChecklistIcon from "@mui/icons-material/Checklist";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Paper from "@mui/material/Paper";
import ContentCut from "@mui/icons-material/ContentCut";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import { deleteTreatement } from "~/utils/request.client";

export const createdAtCell = (value: number) => {
  const date = dayjs(value).add(9, "hour");
  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
      <span>
        {date.format("YYYY/MM/DD")} {date.format("hh:mm A")}
      </span>
    </Box>
  );
};

export const createdAtEdit = (value: string, onValueChange: (value: string) => void) => {
  const onChange = (val: Dayjs | null) => {
    onValueChange(dayjs(val).toISOString());
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DateTimeField format="YYYY/MM/DD hh:mm A" slotProps={{ textField: { variant: "standard" } }} defaultValue={dayjs(value)} onChange={onChange} />
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
  const size: OverridableStringUnion<"small" | "medium", ChipPropsSizeOverrides> = "small";
  const label: ReactNode = value;
  const color: ChipColor = getStatusChipColor(label);
  return value && <Chip size={size} label={label} color={color} />;
};

const DoctorAssignmentTooltip: React.FC<TreatmentTooltipProps> = ({ record, api, treatmentNumber, closeTooltip }) => {
  const user = useRecoilValue(userState);
  const setGlobalSnackBar = useSetRecoilState(globalSnackbarState);

  const handleConfirm = async (id: string) => {
    closeTooltip();

    try {
      if (!record || !treatmentNumber || !user) return;
      const time = dayjs().toISOString();
      if (record.opReadiness === OP_READINESS_Y) {
        record[`treatmentStart${treatmentNumber}`] = time;
        record[`doctor${treatmentNumber}`] = id;
        record[`doctor`] = id;
      }

      record.opReadiness = statusTransition(record);
      editAndStopRecord(api, record);
    } catch (error) {
      setGlobalSnackBar({ open: true, msg: "서버 에러.", severity: "error" });
    }
  };
  const searchHelp = useRecoilValue(doctorSearchHelpState);
  return (
    <Paper sx={{ width: 100, maxWidth: "100%", maxHeight: "500px", overflowY: "auto" }}>
      <MenuList>
        {searchHelp.map((option) => (
          <MenuItem key={option.id} onClick={() => handleConfirm(option.id)} className="cursor-pointer justify-center">
            <span className="font-bold font-noto">{option.title}</span>
          </MenuItem>
        ))}
      </MenuList>
    </Paper>
  );
};

type TreatmentTooltipProps = {
  record: PRecord;
  api: GridApi<PRecord>;
  treatmentNumber: string | undefined;
  closeTooltip: () => void;
};

export const TreatmentTooltip: React.FC<TreatmentTooltipProps> = ({ record, api, treatmentNumber, closeTooltip }) => {
  const user = useRecoilValue(userState);
  const setGlobalSnackBar = useSetRecoilState(globalSnackbarState);
  const [confirmItemTitle, setConfirmItemTitle] = useState("");
  const [cancelItemTitle, setCancelItemTitle] = useState("");
  const [confirmIcon, setConfirmIcon] = useState<ReactElement | null>(null);

  useEffect(() => {
    setConfirmItemTitle(() => {
      if (record.opReadiness === OP_READINESS_N) {
        setConfirmIcon(<ChecklistIcon fontSize="small" />);
        if (record[`treatmentEnd${treatmentNumber}`]) {
          setCancelItemTitle("시술 완료 취소");
        }
        return "준비 완료";
      } else if (record.opReadiness === OP_READINESS_P) {
        setConfirmIcon(<CheckCircleIcon fontSize="small" />);
        setCancelItemTitle("시술 시작 취소");
        return "시술 완료";
      } else if (record.opReadiness === OP_READINESS_Y) {
        setConfirmIcon(<ContentCut fontSize="small" />);
        setCancelItemTitle("준비 취소");
        return "시술 시작";
      } else if (record.opReadiness === OP_READINESS_C) {
        setCancelItemTitle("시술 완료 취소");
      }
      return "";
    });
  }, []);

  const handleConfirm = async () => {
    closeTooltip();

    try {
      if (!record || !treatmentNumber || !user) return;
      const time = dayjs().toISOString();

      if (record.opReadiness === OP_READINESS_N) {
        record[`treatmentReady${treatmentNumber}`] = time;
      } else if (record.opReadiness === OP_READINESS_P) {
        record[`treatmentEnd${treatmentNumber}`] = time;
        record[`doctor`] = undefined;
      } else {
        return;
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

      const isInProgress = ready && start && !end;
      const isCompleted = ready && start && end;
      const isReady = ready && !start && !end;

      if (isReady) {
        record[`treatmentReady${treatmentNumber}`] = undefined;
      } else if (isInProgress) {
        record[`doctor${treatmentNumber}`] = undefined;
        record[`treatmentStart${treatmentNumber}`] = undefined;
        record["doctor"] = undefined;
      } else if (isCompleted) {
        record[`doctor`] = record[`doctor${treatmentNumber}`];
        record[`treatmentEnd${treatmentNumber}`] = undefined;
      }

      record.opReadiness = statusTransition(record);
      editAndStopRecord(api, record);
    } catch (error) {
      setGlobalSnackBar({ open: true, msg: "서버 에러.", severity: "error" });
    }
  };

  return (
    <Paper sx={{ width: "auto", maxWidth: "100%" }}>
      <MenuList>
        {cancelItemTitle && (
          <MenuItem onClick={handleCancel}>
            <ListItemIcon>
              <ContentCut fontSize="small" />
            </ListItemIcon>
            <ListItemText>{cancelItemTitle}</ListItemText>
          </MenuItem>
        )}
        <CustomToolTip
          disableHoverListener={record.opReadiness !== OP_READINESS_Y || !confirmItemTitle}
          title={<DoctorAssignmentTooltip record={record} api={api} closeTooltip={closeTooltip} treatmentNumber={treatmentNumber} />}
          dir="left"
        >
          <MenuItem className={`${record.opReadiness === OP_READINESS_Y ? "cursor-default" : "cursor-pointer"}`} onClick={handleConfirm}>
            <ListItemIcon>{confirmIcon}</ListItemIcon>
            <ListItemText>{confirmItemTitle}</ListItemText>
          </MenuItem>
        </CustomToolTip>
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
  const end = data[`treatmentEnd${number}`];
  const ready = data[`treatmentReady${number}`];
  const start = data[`treatmentStart${number}`];
  const searchHelp = useRecoilValue(treatmentSearchHelpState);
  const canBeAssigned = data.opReadiness === OP_READINESS_Y && ready && !start && !end;
  const isInProgressTreatment = data.opReadiness === OP_READINESS_P && ready && start && !end;
  const canBeReady = data.opReadiness === OP_READINESS_N && !ready && !start && !end;
  const isCompleted = data.opReadiness === OP_READINESS_C;

  const [open, setOpen] = useState(false);

  const disableHoverListener = (!canBeAssigned && !isInProgressTreatment && !canBeReady && !isCompleted) || !value;

  const onMouseEnter = () => {
    setOpen(!disableHoverListener);
  };
  const closeTooltip = () => {
    setOpen(false);
  };
  return (
    <div className="cursor-pointer" onMouseEnter={onMouseEnter} onMouseLeave={closeTooltip}>
      <CustomToolTip open={open} placement="top" title={<TreatmentTooltip treatmentNumber={number} api={api} record={data} closeTooltip={closeTooltip} />} arrow>
        <div>
          <span
            className={`${end && "line-through"} ${tableType === "Ready" && (canBeAssigned ? "font-black" : "text-gray-400")} ${
              tableType === "ExceptReady" && data.opReadiness === "P" && (isInProgressTreatment ? "font-black" : "text-gray-400")
            }`}
          >
            {getValueWithId(searchHelp, value).title}
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
  const [option, setOption] = useState<SearchHelp | null>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputRef.current]);

  useEffect(() => {
    setOption(searchHelp.find((t) => t.id == value) || null);
  }, [searchHelp]);

  const onChange = (newValue: SearchHelp | null) => {
    if (newValue) {
      if (colDef.field && /^treatment\d+$/.test(colDef.field)) {
        const row = api.getRowNode(data.id);
        if (row?.data.opReadiness === OP_READINESS_C) {
          row.data.opReadiness = OP_READINESS_N;
        }
      }
      onValueChange(newValue.id.toString());
      setOption(newValue);
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
      value={option}
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
  let title = getValueWithId(searchHelp, id).title;

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
export const deleteCell = (data: Treatment, setGlobalSnackbar: SetterOrUpdater<GlobalSnackBark>, api: GridApi<Treatment>) => {
  const onClick = async () => {
    try {
      const result = await deleteTreatement(data.id, TEST_TAG);

      if (result.status && result.status === 200) {
        api.applyTransaction({
          remove: [data],
        });
      }
    } catch (error: any) {
      setGlobalSnackbar({ open: true, msg: "Internal server error", severity: "error" });
    }
  };
  return (
    <IconButton onClick={onClick}>
      <DeleteIcon />
    </IconButton>
  );
};
