import { useMemo, useState, type FormEvent, type ReactElement } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { confirmPasswordReset } from "firebase/auth";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import { useNotify } from "react-admin";

import { AuthBrandedShell } from "@/layout/AuthBrandedShell";
import { authObj } from "@/firebase-config";
import { getFirebaseEmailActionParams } from "@/utils/firebase-email-action-params";

const MIN_LENGTH = 6;

export default function ResetPassword(): ReactElement {
  const navigate = useNavigate();
  const notify = useNotify();
  const { mode, oobCode } = useMemo(() => getFirebaseEmailActionParams(), []);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const linkInvalid = !oobCode || mode !== "resetPassword";

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (linkInvalid || !oobCode) {
      return;
    }
    const trimmedPassword = password.trim();
    const trimmedConfirm = confirmPassword.trim();
    if (trimmedPassword.length < MIN_LENGTH) {
      notify(`Password must be at least ${MIN_LENGTH} characters`);
      return;
    }
    if (trimmedPassword !== trimmedConfirm) {
      notify("Passwords do not match");
      return;
    }

    setLoading(true);
    confirmPasswordReset(authObj, oobCode, trimmedPassword)
      .then(() => {
        setLoading(false);
        notify("Your password has been updated. You can sign in now.", { type: "success" });
        navigate("/login");
      })
      .catch((error: unknown) => {
        setLoading(false);
        notify(error instanceof Error ? error.message : String(error), { type: "warning" });
      });
  };

  return (
    <AuthBrandedShell>
      <Typography
        component="h1"
        variant="h5"
        sx={{ mb: 1, alignSelf: "stretch", textAlign: "center" }}
      >
        Set new password
      </Typography>

      {linkInvalid ? (
        <Alert severity="error" sx={{ mt: 1, mb: 2, width: "100%" }}>
          This reset link is invalid or has expired. Request a new link from the forgot password
          page.
        </Alert>
      ) : null}

      <Box
        component="form"
        noValidate
        onSubmit={handleSubmit}
        sx={{ mt: 0, width: "100%", maxWidth: 360 }}
      >
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="New password"
          type="password"
          id="password"
          variant="outlined"
          autoComplete="new-password"
          autoFocus={!linkInvalid}
          disabled={linkInvalid}
          onChange={(e) => setPassword(e.target.value)}
          helperText={`At least ${MIN_LENGTH} characters`}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="confirmPassword"
          label="Confirm new password"
          type="password"
          id="confirmPassword"
          variant="outlined"
          autoComplete="new-password"
          disabled={linkInvalid}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <Box sx={{ textAlign: "center", mt: 3 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || linkInvalid}
            sx={{
              mb: 2,
              mx: "auto",
              width: "200px",
              height: "40px",
              borderRadius: 3,
            }}
          >
            Update password
            {loading && <CircularProgress color="inherit" size={20} sx={{ ml: 1 }} />}
          </Button>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
          <Link component={RouterLink} to="/login" variant="body2">
            Back to login
          </Link>
          <Link component={RouterLink} to="/forgot-password" variant="body2">
            Forgot password
          </Link>
        </Box>
      </Box>
    </AuthBrandedShell>
  );
}
