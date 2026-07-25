import { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as authApi from "../api/authApi";
import {
  clearAuth,
  getAccessToken,
  getCachedUser,
  getRefreshToken,
  setAccessToken,
  setCachedUser,
  setRefreshToken,
} from "../lib/tokenStorage";

const AuthContext = createContext(null);

function statusForUser(user) {
  if (!user) return "guest";
  return user.totp_enrolled ? "authenticated" : "must_enroll_totp";
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getCachedUser());
  const [status, setStatus] = useState(() =>
    getAccessToken() ? "initializing" : "guest"
  );

  useEffect(() => {
    if (!getAccessToken()) return;
    authApi
      .me()
      .then((freshUser) => {
        setUser(freshUser);
        setCachedUser(freshUser);
        setStatus(statusForUser(freshUser));
      })
      .catch(() => {
        // Covers both: refresh was attempted and failed (kormic:auth-expired already
        // fired), and no refresh token existed to attempt one with in the first place.
        clearAuth();
        setUser(null);
        setStatus("guest");
      });
  }, []);

  useEffect(() => {
    const onExpired = () => {
      setUser(null);
      setStatus("guest");
    };
    window.addEventListener("kormic:auth-expired", onExpired);
    return () => window.removeEventListener("kormic:auth-expired", onExpired);
  }, []);

  // Shared by register (§2.1) and login's "somehow still not enrolled" edge case
  // (§2.4) — both hand back the same {access, user, must_enroll_totp: true} shape.
  const storeMustEnroll = (res) => {
    setAccessToken(res.access);
    setCachedUser(res.user);
    setUser(res.user);
    setStatus("must_enroll_totp");
  };

  const registerAccount = useCallback(async (payload) => {
    const res = await authApi.register(payload);
    storeMustEnroll(res);
    return res.user;
  }, []);

  const loginWithPassword = useCallback(async (email, password) => {
    const res = await authApi.login(email, password);
    if (res.must_enroll_totp) {
      storeMustEnroll(res);
      return { mustEnrollTotp: true };
    }
    return { totpRequired: true, mfaToken: res.mfa_token };
  }, []);

  const completeTotpLogin = useCallback(async (mfaToken, code) => {
    const res = await authApi.verifyTotp(mfaToken, code);
    setAccessToken(res.access);
    setRefreshToken(res.refresh);
    setCachedUser(res.user);
    setUser(res.user);
    setStatus("authenticated");
    return res.user;
  }, []);

  const refreshUser = useCallback(async () => {
    const freshUser = await authApi.me();
    setCachedUser(freshUser);
    setUser(freshUser);
    setStatus(statusForUser(freshUser));
    return freshUser;
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch {
        // best-effort — still clear local state below
      }
    }
    clearAuth();
    setUser(null);
    setStatus("guest");
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, status, registerAccount, loginWithPassword, completeTotpLogin, refreshUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
