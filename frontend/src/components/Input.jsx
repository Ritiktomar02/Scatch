import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const Input = ({ icon: Icon, type, ...props }) => {
	const [showPassword, setShowPassword] = useState(false);
	const isPassword = type === "password";

	return (
		<div className='relative mb-6'>
			<div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
				<Icon className='size-5 text-green-500' />
			</div>
			<input
				{...props}
				type={isPassword && showPassword ? "text" : type}
				className={`w-full pl-10 ${isPassword ? 'pr-10' : 'pr-3'} py-2 bg-gray-800/50 rounded-lg border border-gray-700 focus:border-green-500 focus:ring-2 focus:ring-green-500 text-white placeholder-gray-400 transition duration-200`}
			/>
			{isPassword && (
				<button
					type="button"
					onClick={() => setShowPassword(!showPassword)}
					className='absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-green-500 transition duration-200'
				>
					{showPassword ? (
						<EyeOff className='size-5' />
					) : (
						<Eye className='size-5' />
					)}
				</button>
			)}
		</div>
	);
};
export default Input;
