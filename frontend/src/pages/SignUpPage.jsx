import { motion } from "framer-motion";
import Input from "../components/Input";
import { Loader, Lock, Mail, User, AlertCircle } from "lucide-react";
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";
import UserContext from "../context/UserContext";
import toast from "react-hot-toast";
import { useGoogleLogin } from "@react-oauth/google";

const SignUpPage = () => {
  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const { signUp, error, loading, googleLogin } = useContext(UserContext);

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!username || !email || !password) {
      return;
    }

    const success = await signUp(username, email, password);
    if (success) {
      navigate("/verify-email");
    }
  };

  const googleAuth = useGoogleLogin({
    flow: "auth-code",

    onSuccess: async (codeResponse) => {
      await googleLogin(codeResponse.code);
    },

    onError: () => {
      toast.error("Google signup failed");
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md w-full bg-gray-800/50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl 
			overflow-hidden"
    >
      <div className="p-8">
        <h2 className="text-3xl font-bold mb-6 text-center bg-linear-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
          Create Account
        </h2>

        <form onSubmit={handleSignUp}>
          <Input
            icon={User}
            type="text"
            placeholder="Full Name"
            value={username}
            onChange={(e) => setUserName(e.target.value)}
          />
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
          {error && (
            <div className="flex items-center gap-2 px-3 py-2 mt-2 rounded-lg bg-red-500/10 border border-red-500/20">
              <AlertCircle className="size-4 text-red-400 shrink-0" />
              <p className="text-red-400 text-xs">{error}</p>
            </div>
          )}
          <PasswordStrengthMeter password={password} />

          <motion.button
            className="mt-5 w-full py-3 px-4 bg-linear-to-r from-green-500 to-emerald-600 text-white 
						font-bold rounded-lg shadow-lg hover:from-green-600
						hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
						 focus:ring-offset-gray-900 transition duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <Loader className=" animate-spin mx-auto" size={24} />
            ) : (
              "Sign Up"
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
          <span className="text-sm font-medium">Sign up with Google</span>
        </button>
      </div>

      <div className="px-8 py-4 bg-gray-900/50 flex justify-center">
        <p className="text-sm text-gray-400">
          Already have an account?{" "}
          <Link to={"/login"} className="text-green-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </motion.div>
  );
};
export default SignUpPage;
