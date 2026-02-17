import { useState } from "react";
import UserContext from "./UserContext";
import { AUTH } from "../services/api";
import axios from "axios";
import toast from "react-hot-toast";

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
    } catch (err) {
      if (err.response?.status !== 401) {
        console.error(err);
      }
      setAuthenticated(false);
    } finally {
      setCheckingAuth(false);
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
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
