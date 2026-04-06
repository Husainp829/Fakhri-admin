import { useState, type FormEvent, type ReactElement } from "react";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { useNotify } from "react-admin";

export default function ForgotPassword(): ReactElement {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const notify = useNotify();
  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const auth = getAuth();
    setLoading(true);
    sendPasswordResetEmail(auth, email)
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
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h5">
          Forgot Password
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            variant="standard"
            autoComplete="email"
            autoFocus
            onChange={(e) => setEmail(e.target.value)}
          />

          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              mt: 5,
              mb: 1,
              mr: "auto",
              height: "40px",
              borderRadius: 3,
            }}
            fullWidth
          >
            Request Reset Link
            {loading && <CircularProgress color="inherit" size={20} sx={{ ml: 1 }} />}
          </Button>
        </Box>
        <Button
          type="submit"
          sx={{
            ml: 1,
            borderRadius: 3,
          }}
          href="#/login"
        >
          Back to login
        </Button>
      </Box>
    </Container>
  );
}
