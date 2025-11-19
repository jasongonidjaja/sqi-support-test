// theme.js
import { createTheme } from "@mui/material/styles";

const mainBlue = "#0F2A4A";  // warna teks & border utama

const theme = createTheme({
  palette: {
    mode: "light",

    // 🌤 Background terang
    background: {
      default: "#F9FBFF",   // putih kebiruan halus
      paper: "#FFFFFF",
    },

    // 🎨 Primary (button utama)
    primary: {
      main: "#1E88E5",
      dark: "#1565C0",
      light: "#64B5F6",
    },

    // 🔴 Error (iOS red)
    error: {
      main: "#FF3B30",
    },

    // ✨ Text warna #0F2A4A
    text: {
      primary: mainBlue,
      secondary: "#3F5573",
    },
  },

  typography: {
    fontFamily: `"Inter", "Roboto", "Helvetica", "Arial", sans-serif`,
    h3: { fontWeight: 700, color: mainBlue },
    h5: { fontWeight: 700, color: mainBlue },
    button: { fontWeight: 600 },
  },

  components: {
    // ===================================================
    // BUTTON
    // ===================================================
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 30,
          textTransform: "none",
          padding: "12px 20px",
          color: "#FFFFFF",        // teks tombol tetap putih
        },
      },
    },

    // ===================================================
    // TEXTFIELD / OUTLINED INPUT
    // ===================================================
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 30,
          color: mainBlue,     // warna teks input
          backgroundColor: "#FFFFFF",
          "& fieldset": {
            borderColor: mainBlue,
          },
          "&:hover fieldset": {
            borderColor: "#1E88E5",
          },
          "&.Mui-focused fieldset": {
            borderColor: "#1565C0",
            borderWidth: 2,
          },
        },

        // AUTOFILL FIX (supaya tetap warna biru gelap)
        input: {
          "&:-webkit-autofill": {
            WebkitTextFillColor: mainBlue,
            WebkitBoxShadow: "0 0 0 1000px #FFFFFF inset",
            transition: "background-color 9999s ease-in-out 0s",
          },
        },
      },
    },

    // ===================================================
    // INPUT LABEL
    // ===================================================
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: mainBlue,
          "&.Mui-focused": {
            color: "#1565C0",
          },
        },
      },
    },

    // ===================================================
    // PAPER / CARD
    // ===================================================
    MuiPaper: {
      styleOverrides: {
        root: {
          background: "#FFFFFF",
          backdropFilter: "blur(12px)",
          borderRadius: 20,
          border: `1px solid ${mainBlue}33`,
          boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
        },
      },
    },

    // ===================================================
    // DRAWER / SIDEBAR
    // ===================================================
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: mainBlue,
          color: "#E3F2FD",
          borderRadius: 0,
          borderRight: "1px solid rgba(255,255,255,0.2)",
        },
      },
    },

    // ===================================================
    // LIST ITEM TEXT (menu sidebar)
    // ===================================================
    MuiListItemText: {
      styleOverrides: {
        primary: {
          color: "#E3F2FD",
          fontWeight: 500,
        },
      },
    },
  },
});

export default theme;
