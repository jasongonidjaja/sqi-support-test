import { createTheme } from "@mui/material/styles";

const darkBlue = {
  main: "#0D47A1",      // biru gelap elegan
  light: "#5472D3",
  dark: "#002171",
};

const slate = {
  main: "#1A1F2B",      // abu gelap elegan (background)
  light: "#2A3142",
  dark: "#121620",
};

const accent = {
  main: "#64B5F6",      // biru muda lembut (accent)
};

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: darkBlue,
    secondary: accent,

    background: {
      default: slate.main,     // background halaman
      paper: slate.light,      // background card
    },

    text: {
      primary: "#E3E9F3",      // putih kebiruan elegan
      secondary: "#AEB6C4",
    },
  },

  shape: {
    borderRadius: 16,          // elegan, tidak terlalu bulat
  },

  typography: {
    fontFamily: `"Inter", "Roboto", "Helvetica", "Arial", sans-serif`,
    h5: { fontWeight: 700 },
    button: { fontWeight: 600 },
  },

  components: {
    // BUTTON
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          textTransform: "none",
          padding: "10px 20px",
          borderColor: "#54d36dff",
        },
      },
    },

    // TEXTFIELD OUTLINE
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          backgroundColor: "rgba(255,255,255,0.04)",  // gelap elegan
        },
        notchedOutline: {
          borderColor: "#5472D3",
        },
        input: {
          color: "#E3E9F3",
        },
      },
    },

    // LABEL INPUT
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "#AEB6C4",
        },
      },
    },

    // CARD / BOX
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: slate.light,
          borderRadius: 20,
          boxShadow: "0px 4px 30px rgba(0,0,0,0.4)",
        },
      },
    },
  },
});

export default theme;
