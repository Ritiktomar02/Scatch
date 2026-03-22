import { useContext, useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Loader, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import Input from "../components/Input";
import UserContext from "../context/UserContext";
import { useGoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login, loading, error, googleLogin } = useContext(UserContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    login(email, password);
  };

  const googleAuth = useGoogleLogin({
  flow: "auth-code",

  onSuccess: async (codeResponse) => {
    await googleLogin(codeResponse.code);
  },

  onError: () => {
    toast.error("Google login failed");
  },
});

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md w-full bg-gray-800/50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden"
    >
      <div className="p-8">
        <h2 className="text-3xl font-bold mb-6 text-center bg-linear-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
          Welcome Back
        </h2>

        <form onSubmit={handleLogin}>
          <Input
            icon={Mail}
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            icon={Lock}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex items-center mb-6">
            <Link
              to="/forgot-password"
              className="text-sm text-green-400 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          {error && (
            <div className="flex items-center gap-2 px-3 py-2 mb-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <AlertCircle className="size-4 text-red-400 shrink-0" />
              <p className="text-red-400 text-xs">{error}</p>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 px-4 bg-linear-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <Loader className="w-6 h-6 animate-spin  mx-auto" />
            ) : (
              "Login"
            )}
          </motion.button>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-600"></div>
          <span className="px-4 text-sm text-gray-400">or</span>
          <div className="flex-1 border-t border-gray-600"></div>
        </div>

        <button
          className="w-full flex items-center justify-center gap-3 py-3 rounded-lg border border-gray-600 bg-gray-700/50 text-white hover:bg-gray-600 transition duration-200"
          onClick={() => googleAuth()}
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="google"
            className="w-5 h-5"
          />
          <span className="text-sm font-medium">Sign in with Google</span>
        </button>
      </div>

      <div className="px-8 py-4 bg-gray-900/50 flex justify-center">
        <p className="text-sm text-gray-400">
          Don't have an account?{" "}
          <Link to="/signup" className="text-green-400 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </motion.div>
  );
};
export default LoginPage;
