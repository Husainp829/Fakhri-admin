import { useState, type FormEvent, type ReactElement } from "react";
import { Link as RouterLink } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useNotify } from "react-admin";

import { AuthBrandedShell } from "@/layout/AuthBrandedShell";
import { authObj } from "@/firebase-config";
import { buildPasswordResetContinueUrl } from "@/utils/firebase-email-action-params";

export default function ForgotPassword(): ReactElement {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const notify = useNotify();
  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setLoading(true);
    sendPasswordResetEmail(authObj, email, {
      url: buildPasswordResetContinueUrl(),
      handleCodeInApp: false,
    })
      .then(() => {
        setLoading(false);
        notify("Password Reset Link has been mailed to you on the above account.");
      })
      .catch((error: unknown) => {
        setLoading(false);
        notify(error instanceof Error ? error.message : String(error));
      });
  };

  return (
    <AuthBrandedShell>
      <Typography
        component="h1"
        variant="h5"
        sx={{ mb: 1, alignSelf: "stretch", textAlign: "center" }}
      >
        Forgot password
      </Typography>
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
          id="email"
          label="Email Address"
          name="email"
          variant="outlined"
          autoComplete="email"
          autoFocus
          onChange={(e) => setEmail(e.target.value)}
        />
        <Box sx={{ textAlign: "center", mt: 3 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              mb: 2,
              mx: "auto",
              width: "220px",
              height: "40px",
              borderRadius: 3,
            }}
          >
            Request Reset Link
            {loading && <CircularProgress color="inherit" size={20} sx={{ ml: 1 }} />}
          </Button>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Link component={RouterLink} to="/login" variant="body2">
            Back to login
          </Link>
        </Box>
      </Box>
    </AuthBrandedShell>
  );
}
