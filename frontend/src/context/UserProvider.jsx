import { useState } from "react";
import UserContext from "./UserContext";
import { AUTH } from "../services/api";
import axios from "axios";
import toast from "react-hot-toast";

axios.defaults.withCredentials=true

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
      setLoading(false);
      toast.success("User Register Successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
      setLoading(false);
      toast.error("User not Register");
      throw err;
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
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      setLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await axios.post(AUTH.LOGOUT);
      setUser(null);
      setAuthenticated(false);
      setLoading(false);
    } catch (err) {
      setError("Logout failed");
      setLoading(false);
    }
  };

  const verifyEmail = async (code) => {
    setLoading(true);
    try {
      const response = await axios.post(AUTH.VERIFY_EMAIL, { code });
      setUser(response.data.user);
      setAuthenticated(true);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Email verification failed");
      setLoading(false);
      throw err;
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
    try {
      const response = await axios.post(AUTH.FORGOT_PASSWORD, { email });
      setMessage(response.data.message);
      setLoading(false);
    } catch (err) {
      setError(
        err.response?.data?.message || "Error sending reset email"
      );
      setLoading(false);
      throw err;
    }
  };

  const resetPassword = async (token, password) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${AUTH.RESET_PASSWORD}/${token}`,
        { password }
      );

      setMessage(response.data.message);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed");
      setLoading(false);
      throw err;
    }
  };


  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        loading,
        setLoading,
        error,
        setError,
        authenticated,
        setAuthenticated,
        message,
        setMessage,
        checkingAuth,
        setCheckingAuth,
        signUp,
        verifyEmail,
        checkAuth,
        login,
        logout,
        forgotPassword,
        resetPassword
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
