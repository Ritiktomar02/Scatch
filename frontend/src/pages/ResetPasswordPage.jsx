import { useContext, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useParams } from "react-router-dom";
import Input from "../components/Input";
import { AlertCircle, ArrowLeft, CheckCircle, Lock } from "lucide-react";
import toast from "react-hot-toast";
import UserContext from "../context/UserContext";

const ResetPasswordPage = () => {
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const { resetPassword, error, loading, message } = useContext(UserContext)

	const { token } = useParams();
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (password !== confirmPassword) {
			toast.error("Passwords do not match");
			return;
		}

		const success = await resetPassword(token, password);
		if (success) {
			setTimeout(() => {
				navigate("/login");
			}, 2000);
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className='max-w-md w-full bg-gray-800/50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden'
		>
			<div className='p-8'>
				<h2 className='text-3xl font-bold mb-6 text-center bg-linear-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text'>
					Reset Password
				</h2>
				{error && (
					<div className='flex items-center gap-2 px-3 py-2 mb-4 rounded-lg bg-red-500/10 border border-red-500/20'>
						<AlertCircle className='size-4 text-red-400 shrink-0' />
						<p className='text-red-400 text-xs'>{error}</p>
					</div>
				)}
				{message && (
					<div className='flex items-center gap-2 px-3 py-2 mb-4 rounded-lg bg-green-500/10 border border-green-500/20'>
						<CheckCircle className='size-4 text-green-400 shrink-0' />
						<p className='text-green-400 text-xs'>{message}</p>
					</div>
				)}

				<form onSubmit={handleSubmit}>
					<Input
						icon={Lock}
						type='password'
						placeholder='New Password'
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
					/>

					<Input
						icon={Lock}
						type='password'
						placeholder='Confirm New Password'
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						required
					/>

					<motion.button
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
						className='w-full py-3 px-4 bg-linear-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200 disabled:opacity-50'
						type='submit'
						disabled={loading}
					>
						{loading ? "Resetting..." : "Set New Password"}
					</motion.button>
				</form>
			</div>

			<div className='px-8 py-4 bg-gray-900/50 flex justify-center'>
				<Link to='/login' className='text-sm text-green-400 hover:underline flex items-center'>
					<ArrowLeft className='h-4 w-4 mr-2' /> Back to Login
				</Link>
			</div>
		</motion.div>
	);
};
export default ResetPasswordPage;