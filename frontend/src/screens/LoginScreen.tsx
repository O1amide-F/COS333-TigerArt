import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../auth";
import { theme } from "../theme";

export function LoginScreen() {
  const { instance } = useMsal();

  const handleLogin = () => {
    instance.loginRedirect(loginRequest);
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: theme.colors.bg,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif",
      color: theme.colors.text,
      textAlign: "center",
      padding: "24px 20px",
    }}>
      <h1 style={{ fontFamily: "'Playfair Display', serif", marginBottom: 8 }}>
        Welcome to TigerArt
      </h1>
      <p style={{ color: theme.colors.text, marginBottom: 24 }}>
        Please log in to continue
      </p>
      <button
        onClick={handleLogin}
        style={{
          background: theme.components.button.primaryBackground,
          color: theme.components.button.primaryText,
          border: "none",
          borderRadius: 6,
          padding: "10px 24px",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14,
          fontWeight: 500,
          cursor: "pointer",
        }}
      >
        Login with Microsoft
      </button>
    </div>
  );
}