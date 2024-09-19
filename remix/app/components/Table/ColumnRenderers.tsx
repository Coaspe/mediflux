/** @format */

import { ChipColor, CustomAgGridReactProps, GlobalSnackBark, SearchHelp, TableType, Treatment } from "../../types/type";
import { Autocomplete, TextField } from "@mui/material";
import Chip from "@mui/material/Chip";
import { INTERNAL_SERVER_ERROR, OpReadiness, PRecord, Role } from "shared";
import { DOCTOR, FIELDS_DOCTOR, FIELDS_NURSE, FIELDS_PAITENT, TEST_TAG, TREATMENT_END, TREATMENT_READY, TREATMENT_START } from "~/constant";
import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimeField } from "@mui/x-date-pickers/DateTimeField";
import React, { ReactElement, ReactNode, RefObject, useEffect, useRef, useState } from "react";
import { ChipPropsSizeOverrides } from "@mui/joy/Chip/ChipProps";
import { OverridableStringUnion } from "@mui/types";
import { CustomCellEditorProps, CustomCellRendererProps } from "ag-grid-react";
import { autoCompleteKeyDownCapture, editAndStopRecord, getValueWithId } from "~/utils/utils";
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
import UndoIcon from "@mui/icons-material/Undo";

export const createdAtCell = (value: string) => {
  const date = dayjs(value);

  return (
    <div className="flex justify-center items-center">
      <span>
        {date.format("YYYY/MM/DD")} {date.format("hh:mm A")}
      </span>
    </div>
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
    case OpReadiness.N:
      return "error";
    case OpReadiness.P:
      return "primary";
    case OpReadiness.Y:
      return "success";
    case OpReadiness.C:
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
const DoctorAssignmentTooltip: React.FC<TreatmentTooltipProps> = ({ record, gridRef, treatmentNumber, closeTooltip }) => {
  const user = useRecoilValue(userState);
  const setGlobalSnackBar = useSetRecoilState(globalSnackbarState);

  const handleConfirm = async (id: string) => {
    closeTooltip();

    try {
      if (!record || !treatmentNumber || !user) return;
      const time = dayjs().toISOString();
      const originRecord = JSON.parse(JSON.stringify(record));
      if (record.opReadiness === OpReadiness.Y) {
        record[`${TREATMENT_START}${treatmentNumber}`] = time;
        record[`${DOCTOR}${treatmentNumber}`] = id;
        record[DOCTOR] = id;
      }

      editAndStopRecord(gridRef, record, originRecord);
    } catch (error) {
      setGlobalSnackBar({ open: true, msg: "서버 에러.", severity: "error" });
    }
  };

  const searchHelp = useRecoilValue(doctorSearchHelpState);
  return (
    <Paper className="w-25 max-w-full max-h-125 overflow-y-auto">
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
  gridRef: RefObject<CustomAgGridReactProps<PRecord>>;
  treatmentNumber: string | undefined;
  closeTooltip: () => void;
};

export const TreatmentTooltip: React.FC<TreatmentTooltipProps> = ({ record, gridRef, treatmentNumber, closeTooltip }) => {
  const user = useRecoilValue(userState);
  const setGlobalSnackBar = useSetRecoilState(globalSnackbarState);
  const [confirmItemTitle, setConfirmItemTitle] = useState("");
  const [cancelItemTitle, setCancelItemTitle] = useState("");
  const [confirmIcon, setConfirmIcon] = useState<ReactElement | null>(null);

  useEffect(() => {
    setConfirmItemTitle(() => {
      const start = record[`${TREATMENT_START}${treatmentNumber}`];
      const ready = record[`${TREATMENT_READY}${treatmentNumber}`];
      const end = record[`${TREATMENT_END}${treatmentNumber}`];

      if (record.opReadiness === OpReadiness.N) {
        if (end) {
          setCancelItemTitle("시술 완료 취소");
        }
        if (!ready) {
          setConfirmIcon(<ChecklistIcon fontSize="small" />);
          return "준비 완료";
        }
        return "";
      } else if (record.opReadiness === OpReadiness.P) {
        if (start) {
          setConfirmIcon(<CheckCircleIcon fontSize="small" />);
          setCancelItemTitle("시술 시작 취소");
          return "시술 완료";
        }
        return "";
      } else if (record.opReadiness === OpReadiness.Y) {
        if (ready) {
          setConfirmIcon(<ContentCut fontSize="small" />);
          setCancelItemTitle("준비 취소");
          return "시술 시작";
        }
        return "";
      } else if (record.opReadiness === OpReadiness.C) {
        if (end) {
          setCancelItemTitle("시술 완료 취소");
        }
        return "";
      }
      return "";
    });
  }, []);

  const handleConfirm = async () => {
    closeTooltip();

    try {
      if (!record || !treatmentNumber || !user) return;
      const time = dayjs().toISOString();
      const originRecord = JSON.parse(JSON.stringify(record));

      if (record.opReadiness === OpReadiness.N) {
        record[`${TREATMENT_READY}${treatmentNumber}`] = time;
      } else if (record.opReadiness === OpReadiness.P) {
        record[`${TREATMENT_END}${treatmentNumber}`] = time;
        record[DOCTOR] = undefined;
      } else {
        return;
      }
      editAndStopRecord(gridRef, record, originRecord);
    } catch (error) {
      setGlobalSnackBar({ open: true, msg: "서버 에러.", severity: "error" });
    }
  };

  const handleCancel = async () => {
    closeTooltip();

    try {
      if (!record || !treatmentNumber || !user) return;
      const ready = record[`${TREATMENT_READY}${treatmentNumber}`];
      const start = record[`${TREATMENT_START}${treatmentNumber}`];
      const end = record[`${TREATMENT_END}${treatmentNumber}`];
      const originRecord = JSON.parse(JSON.stringify(record));

      const isInProgress = ready && start && !end;
      const isCompleted = ready && start && end;
      const isReady = ready && !start && !end;

      if (isReady) {
        record[`${TREATMENT_READY}${treatmentNumber}`] = undefined;
      } else if (isInProgress) {
        record[`${DOCTOR}${treatmentNumber}`] = undefined;
        record[`${TREATMENT_START}${treatmentNumber}`] = undefined;
        record[DOCTOR] = undefined;
      } else if (isCompleted) {
        record[DOCTOR] = record[`${DOCTOR}${treatmentNumber}`];
        record[`${TREATMENT_END}${treatmentNumber}`] = undefined;
      }

      editAndStopRecord(gridRef, record, originRecord);
    } catch (error) {
      setGlobalSnackBar({ open: true, msg: "서버 에러.", severity: "error" });
    }
  };

  return (
    <Paper className="w-auto max-w-full">
      <MenuList>
        {cancelItemTitle && (
          <MenuItem onClick={handleCancel}>
            <ListItemIcon>
              <UndoIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{cancelItemTitle}</ListItemText>
          </MenuItem>
        )}
        {confirmItemTitle && (
          <CustomToolTip
            disableHoverListener={record.opReadiness !== OpReadiness.Y || !confirmItemTitle}
            title={<DoctorAssignmentTooltip record={record} gridRef={gridRef} closeTooltip={closeTooltip} treatmentNumber={treatmentNumber} />}
            dir="left"
          >
            <MenuItem className={`${record.opReadiness === OpReadiness.Y ? "cursor-default" : "cursor-pointer"}`} onClick={handleConfirm}>
              <ListItemIcon>{confirmIcon}</ListItemIcon>
              <ListItemText>{confirmItemTitle}</ListItemText>
            </MenuItem>
          </CustomToolTip>
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

export const treatmentCell = ({ data, value, colDef }: CustomCellRendererProps, gridRef: RefObject<CustomAgGridReactProps<PRecord>>, tableType: TableType) => {
  const number = colDef?.field?.charAt(colDef.field.length - 1);
  const end = data[`${TREATMENT_END}${number}`];
  const ready = data[`${TREATMENT_READY}${number}`];
  const start = data[`${TREATMENT_START}${number}`];
  const searchHelp = useRecoilValue(treatmentSearchHelpState);

  const canBeAssigned = data.opReadiness === OpReadiness.Y && ready && !start && !end;
  const isInProgressTreatment = data.opReadiness === OpReadiness.P && ready && start && !end;
  const canBeReady = data.opReadiness === OpReadiness.N && !ready && !start && !end;
  const canBeCanceled = (data.opReadiness === OpReadiness.N || data.opReadiness === OpReadiness.C) && ready && start && end;
  const [open, setOpen] = useState(false);

  const disableHoverListener = (!canBeAssigned && !isInProgressTreatment && !canBeReady && !canBeCanceled) || !value;

  const onMouseEnter = () => {
    setOpen(!disableHoverListener);
  };
  const closeTooltip = () => {
    setOpen(false);
  };
  return (
    <div className="cursor-pointer" onMouseEnter={onMouseEnter} onMouseLeave={closeTooltip}>
      <CustomToolTip open={open} placement="top" title={<TreatmentTooltip treatmentNumber={number} gridRef={gridRef} record={data} closeTooltip={closeTooltip} />} arrow>
        <div>
          <span
            className={`${end && "line-through"} ${tableType === "Ready" && (canBeAssigned ? "font-black" : "text-gray-400")} ${
              tableType === "ExceptReady" && data.opReadiness === OpReadiness.P && (isInProgressTreatment ? "font-black" : "text-gray-400")
            }`}
          >
            {getValueWithId(searchHelp, value).title}
          </span>
        </div>
      </CustomToolTip>
    </div>
  );
};

export const autoCompleteEdit = ({ value, onValueChange, api, data, colDef }: CustomCellEditorProps, searchHelp: SearchHelp[]) => {
  const optionRef = useRef<SearchHelp | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isFirstKeyDown = useRef<boolean>(true);
  const [sortedSearchHelp, setSortedSearchHelp] = useState<SearchHelp[]>(searchHelp);
  const [option, setOption] = useState<SearchHelp | null>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputRef.current]);

  useEffect(() => {
    setOption(searchHelp.find((t) => t.id == value) || null);
    setSortedSearchHelp(
      [...searchHelp]
        .sort((a, b) => {
          const groupA = a.group || "";
          const groupB = b.group || "";

          if (groupA === "" && groupB === "") return 0;
          if (groupA === "") return 1;
          if (groupB === "") return -1;
          return groupA.localeCompare(groupB, "ko");
        })
        .filter((v) => v.title)
    );
  }, [searchHelp]);

  const onChange = (newValue: SearchHelp | null) => {
    if (newValue) {
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
      key={colDef.field}
      options={sortedSearchHelp}
      groupBy={(option: SearchHelp) => option.group}
      getOptionLabel={(option) => option.title}
      getOptionKey={(option) => option.id}
      onChange={(_, value) => onChange(value)}
      clearOnBlur={false}
      value={option}
      onKeyDownCapture={(event) => autoCompleteKeyDownCapture(event, onValueChange, optionRef)}
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
    case Role.DOCTOR:
      color = "primary";
      break;
    case Role.NURSE:
      color = "secondary";
    case Role.STAFF:
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
      const result = await deleteTreatement(data.id, TEST_TAG, window.ENV.FRONT_BASE_URL);

      if (result.statusCode === 200) {
        api.applyTransaction({
          remove: [data],
        });
      }
    } catch (error: any) {
      setGlobalSnackbar({ open: true, msg: INTERNAL_SERVER_ERROR, severity: "error" });
    }
  };
  return (
    <IconButton onClick={onClick}>
      <DeleteIcon />
    </IconButton>
  );
};
