import { PublicClientApplication, type AccountInfo } from "@azure/msal-browser";

const msalConfig = {
  auth: {
    clientId: "c0ea8c66-e7fb-4645-9b3d-7b0ec20ee496",
    authority:
      "https://login.microsoftonline.com/2ff60116-7431-425d-b5af-077d7791bda4",
    redirectUri: import.meta.env.VITE_REDIRECT_URI ?? "http://localhost:5173",
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ["openid", "profile"],
  prompt: "login",
};

export const msalInstance = new PublicClientApplication(msalConfig);

export const msalInitPromise = msalInstance
  .initialize()
  .then(() => msalInstance.handleRedirectPromise());

export interface UserProfile {
  userid: string;
  displayName: string;
}

// One-way: reads identity directly from the cached account — no token fetch, no Graph call
export async function getUserProfile(): Promise<UserProfile | null> {
  const accounts = msalInstance.getAllAccounts();
  if (accounts.length === 0) return null;

  const account: AccountInfo = accounts[0];

  return {
    userid: account.localAccountId, // unique Azure AD object ID
    displayName: account.name ?? account.username ?? "",
  };
}

export function getActiveAccount() {
  const accounts = msalInstance.getAllAccounts();
  return accounts.length > 0 ? accounts[0] : null;
}
