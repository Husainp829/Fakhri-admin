import { useState, type ReactElement } from "react";
import { useLogin, useNotify } from "react-admin";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import type { TypographyProps } from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { alpha } from "@mui/material/styles";

import background from "../assets/JameaAlAnwar.jpg";

function Copyright(props: TypographyProps): ReactElement {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      Copyright ©
      <Link color="inherit" href="/">
        Anjuman-e-Fakhri Poona
      </Link>{" "}
      {new Date().getFullYear()}.
    </Typography>
  );
}

export default function Login(): ReactElement {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const login = useLogin();
  const notify = useNotify();

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    setLoading(true);
    login({ username, password })
      .then(() => {
        setLoading(false);
      })
      .catch(() => {
        notify("Invalid email or password");
        setLoading(false);
      });
  };

  return (
    <Grid
      container
      component="main"
      sx={{
        height: "100vh",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundImage: { xs: `url(${background})`, md: "none" },
      }}
    >
      <CssBaseline />
      <Grid
        sx={{
          backgroundImage: `url(${background})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        size={{ xs: false, sm: false, md: 8 }}
      />
      <Grid
        component={Paper}
        elevation={6}
        sx={(theme) => ({
          bgcolor: {
            xs: alpha(theme.palette.background.paper, 0.88),
            md: theme.palette.background.paper,
          },
        })}
        size={{ xs: 12, sm: 12, md: 4 }}
      >
        <Box
          sx={{
            my: 8,
            mx: 4,
            height: "65vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Box>
            <img src="/logo.png" alt="logo" style={{ maxWidth: "100px", marginBottom: "100px" }} />
          </Box>
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
              <Link href="#/forgot-password" variant="body2">
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
        </Box>
        <Box
          sx={{
            my: 8,
            mx: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Copyright sx={{ mt: 5 }} />
        </Box>
      </Grid>
    </Grid>
  );
}
