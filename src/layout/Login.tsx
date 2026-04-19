import { useState, type ReactElement } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useLogin, useNotify } from "react-admin";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";

import { AuthBrandedShell } from "@/layout/AuthBrandedShell";

export default function Login(): ReactElement {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const login = useLogin();
  const notify = useNotify();

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();
    setLoading(true);
    login({ username: trimmedUsername, password: trimmedPassword })
      .then(() => {
        setLoading(false);
      })
      .catch(() => {
        notify("Invalid email or password");
        setLoading(false);
      });
  };

  return (
    <AuthBrandedShell logoMarginBottom="100px">
      <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 0 }}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          variant="outlined"
          autoFocus
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          variant="outlined"
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        <Box style={{ textAlign: "right" }}>
          <Link component={RouterLink} to="/forgot-password" variant="body2">
            Forgot password?
          </Link>
        </Box>
        <Box style={{ textAlign: "center" }}>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              mt: 5,
              mb: 2,
              mx: "auto",
              width: "160px",
              height: "40px",
              borderRadius: 3,
            }}
          >
            Sign In {loading && <CircularProgress color="inherit" size={20} sx={{ ml: 1 }} />}
          </Button>
        </Box>
      </Box>
    </AuthBrandedShell>
  );
}
