import { useState } from "react";
import UserContext from "./UserContext";
import { AUTH } from "../services/api";
import axios from "axios";
import toast from "react-hot-toast";
import { googleLogout } from "@react-oauth/google";

axios.defaults.withCredentials = true;

// --- Axios Interceptor ---
// This runs BEFORE any 401 error reaches your components.
// If an API call fails with 401 (access token expired), it:
//   1. Calls /refresh to get new tokens
//   2. Retries the original request automatically
//   3. If refresh also fails → the 401 reaches the component normally
//
// The _retry flag prevents infinite loops (refresh fails → 401 → refresh → 401...)

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only intercept 401s, and not on auth endpoints (login/register/refresh)
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/refresh") &&
      !originalRequest.url.includes("/login") &&
      !originalRequest.url.includes("/register")
    ) {
      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => axios(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post(AUTH.REFRESH);
        processQueue(null);
        // Retry the original request with the new access token cookie
        return axios(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [message, setMessage] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const signUp = async (username, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(AUTH.REGISTER, {
        username,
        email,
        password,
      });
      setUser(response.data.user);
      setAuthenticated(true);
      toast.success("User registered successfully");
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || "Signup failed";
      setError(msg);
      toast.error(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(AUTH.LOGIN, {
        email,
        password,
      });
      setUser(response.data.user);
      setAuthenticated(true);
      toast.success("Login successful");
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      setError(msg);
      toast.error(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      await axios.post(AUTH.LOGOUT);
      googleLogout();
      setUser(null);
      setAuthenticated(false);
    } catch (err) {
      const msg = err.response?.data?.message || "Logout failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (code) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(AUTH.VERIFY_EMAIL, { code });
      setUser(response.data.user);
      setAuthenticated(true);
      toast.success("Email verified successfully");
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || "Email verification failed";
      setError(msg);
      toast.error(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const checkAuth = async () => {
    setCheckingAuth(true);
    try {
      const response = await axios.get(AUTH.CHECK_AUTH);
      setUser(response.data.user);
      setAuthenticated(true);
      setCheckingAuth(false);
    } catch {
      setAuthenticated(false);
      setCheckingAuth(false);
    }
  };

  const forgotPassword = async (email) => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const response = await axios.post(AUTH.FORGOT_PASSWORD, { email });
      setMessage(response.data.message);
      toast.success(response.data.message);
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || "Error sending reset email";
      setError(msg);
      toast.error(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token, password) => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const response = await axios.post(`${AUTH.RESET_PASSWORD}/${token}`, {
        password,
      });
      setMessage(response.data.message);
      toast.success("Password reset successfully");
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || "Reset failed";
      setError(msg);
      toast.error(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (code) => {
    setError(null);
    try {
      const response = await axios.post(AUTH.GOOGLE_LOGIN, { code });
      setUser(response.data.user);
      setAuthenticated(true);
      toast.success("Google login successful");
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || "Google login failed";
      setError(msg);
      toast.error(msg);
      return false;
    }
  };
  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        error,
        authenticated,
        message,
        checkingAuth,
        signUp,
        verifyEmail,
        checkAuth,
        login,
        logout,
        forgotPassword,
        resetPassword,
        googleLogin
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
