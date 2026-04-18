import { theme } from "../theme";

export function LoginScreen({ onGuestLogin }: { onGuestLogin?: () => void }) {

  const handleLogin = () => {
    window.location.href = '/login';
  };

  return (
    <div
      style={{
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
      }}
    >
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

      {onGuestLogin && (
        <div
          style={{
            marginTop: 14,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
          }}
        >
          <button onClick={onGuestLogin} style={{ opacity: 0.7 }}>
            Continue as guest
          </button>
          <p style={{ fontSize: 12, color: "gray", margin: 0 }}>
            Guest mode: favorites and history won't be saved
          </p>
        </div>
      )}
    </div>
  );
}
