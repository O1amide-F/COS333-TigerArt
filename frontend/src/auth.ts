import { PublicClientApplication } from "@azure/msal-browser";

const msalConfig = {
  auth: {
    clientId: "c0ea8c66-e7fb-4645-9b3d-7b0ec20ee496",
    authority: "https://login.microsoftonline.com/2ff60116-7431-425d-b5af-077d7791bda4",
    redirectUri: import.meta.env.VITE_REDIRECT_URI ?? "http://localhost:5173",
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ["openid", "profile", "email", "User.Read"],
  prompt: "login",
};

export const msalInstance = new PublicClientApplication(msalConfig);

export const msalInitPromise = msalInstance
  .initialize()
  .then(() => msalInstance.handleRedirectPromise());

async function getAccessToken(): Promise<string | null> {
  const accounts = msalInstance.getAllAccounts();
  if (accounts.length === 0) return null;

  const silentRequest = {
    ...loginRequest,
    account: accounts[0],
  };

  try {
    const response = await msalInstance.acquireTokenSilent(silentRequest);
    return response.accessToken;
  } catch {
    return null;
  }
}

export interface UserProfile {
  displayName: string;
  email: string;
}

export async function getUserProfile(): Promise<UserProfile | null> {
  const token = await getAccessToken();
  if (!token) return null;

  const headers = { Authorization: `Bearer ${token}` };

  const profileRes = await fetch("https://graph.microsoft.com/v1.0/me", { headers });
  if (!profileRes.ok) return null;
  const profile = await profileRes.json();

  return {
    displayName: profile.displayName ?? "",
    email: profile.mail ?? profile.userPrincipalName ?? "",
  };
}

export function getActiveAccount() {
  const accounts = msalInstance.getAllAccounts();
  return accounts.length > 0 ? accounts[0] : null;
}

