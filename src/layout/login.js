/* eslint-disable no-shadow */
/* eslint-disable no-console */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from "react";
import { useLogin, useNotify } from "react-admin";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Grid from "@mui/material/GridLegacy";
import Typography from "@mui/material/Typography";

import Logo from "../assets/logo.png";
import background from "../assets/LoginPage.png";

function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      Copyright ©
      <Link color="inherit" href="/">
        Fakhri Jamaat
      </Link>{" "}
      {new Date().getFullYear()}.
    </Typography>
  );
}

export default function SignInSide() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const login = useLogin();
  const notify = useNotify();

  const handleSubmit = (e) => {
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
    <Grid container component="main" sx={{ height: "100vh" }}>
      <CssBaseline />
      <Grid
        item
        xs={false}
        sm={4}
        md={8}
        sx={{
          backgroundImage: `url(${background})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: 0,
            textAlign: "center",
            padding: "35px",
          }}
        >
          {/* <Typography color="primary" variant="body1">
            Powered By
          </Typography>
          <img src={Logo} alt="logo" style={{ maxWidth: "90px" }} /> */}
        </div>
      </Grid>
      <Grid item xs={12} sm={8} md={4} component={Paper} elevation={6}>
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
            <img src={Logo} alt="logo" style={{ maxWidth: "100px", marginBottom: "100px" }} />
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
              variant="standard"
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
              variant="standard"
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
