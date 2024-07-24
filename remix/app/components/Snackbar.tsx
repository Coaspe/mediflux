/** @format */
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { globalSnackbarState } from "~/recoil_state";

const GlobalSnackbar = () => {
  const { open, msg, severity } = useRecoilValue(globalSnackbarState);
  const setState = useSetRecoilState(globalSnackbarState);

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }

    setState({ open: false, msg: "", severity });
  };
  return (
    <Snackbar open={open} autoHideDuration={3000} onClose={handleClose}>
      <Alert onClose={handleClose} severity={severity} variant="filled" sx={{ width: "100%" }}>
        {msg}
      </Alert>
    </Snackbar>
  );
};

export default GlobalSnackbar;
