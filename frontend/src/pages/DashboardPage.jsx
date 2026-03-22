import { motion } from "framer-motion";
import { formatDate } from "../utils/date";
import { useContext } from "react";
import UserContext from "../context/UserContext";

const DashboardPage = () => {
	const { user, logout } = useContext(UserContext);

	const handleLogout = () => {
		logout();
	};
	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.9 }}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0, scale: 0.9 }}
			transition={{ duration: 0.5 }}
			className='max-w-md w-full mx-auto mt-10 p-8 bg-gray-900/80 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl border border-gray-800'
		>
			<h2 className='text-3xl font-bold mb-6 text-center bg-linear-to-r from-green-400 to-emerald-600 text-transparent bg-clip-text'>
				Dashboard
			</h2>

			<div className='space-y-6'>
				<motion.div
					className='p-4 bg-gray-800/50 rounded-lg border border-gray-700'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
				>
					<h3 className='text-xl font-semibold text-green-400 mb-3'>Profile Information</h3>
					<div className='flex items-center gap-4 mb-3'>
						<div className='w-12 h-12 rounded-full bg-linear-to-r from-green-500 to-emerald-600 flex items-center justify-center text-white text-xl font-bold shrink-0'>
							{user.username?.charAt(0).toUpperCase()}
						</div>
						<div>
							<p className='text-white font-medium'>{user.username}</p>
							<p className='text-gray-400 text-sm'>{user.email}</p>
						</div>
					</div>
				</motion.div>
				<motion.div
					className='p-4 bg-gray-800/50 rounded-lg border border-gray-700'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
				>
					<h3 className='text-xl font-semibold text-green-400 mb-3'>Account Activity</h3>
					<p className='text-gray-300'>
						<span className='font-bold'>Joined: </span>
						{new Date(user.createdAt).toLocaleDateString("en-US", {
							year: "numeric",
							month: "long",
							day: "numeric",
						})}
					</p>
					<p className='text-gray-300'>
						<span className='font-bold'>Last Login: </span>

						{formatDate(user.lastLogin)}
					</p>
				</motion.div>
			</div>

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.6 }}
				className='mt-4'
			>
				<motion.button
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					onClick={handleLogout}
					className='w-full py-3 px-4 rounded-lg border border-gray-600 text-gray-300 font-medium
				hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400
				 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200'
				>
					Logout
				</motion.button>
			</motion.div>
		</motion.div>
	);
};
export default DashboardPage;