import { RiCheckLine } from "@remixicon/react";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
	name: string;
	value: string;
}

const CustomRadio = ({ name, value, onChange, checked }: Props) => {
	return (
		<div className="relative">
			<div
				className={`grid h-4 w-4 cursor-pointer place-items-center rounded-full transition-colors ${checked ? "bg-primary-400" : "bg-neutral-300"}`}>
				<RiCheckLine className="h-3 w-3 text-white" />
			</div>
			<input
				type="radio"
				name={name}
				value={value}
				checked={checked}
				onChange={onChange}
				className="peer absolute inset-0 cursor-pointer opacity-0"
			/>
		</div>
	);
};

export default CustomRadio;
