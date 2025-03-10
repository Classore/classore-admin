import { Spinner } from "./spinner";

type UploadProgressProps = {
	progress: number;
	title: string;
	subtitle: string;
	rightComp?: React.ReactNode;
};

export const UploadProgress = ({ progress, title, subtitle, rightComp }: UploadProgressProps) => {
	return (
		<div className="rounded bg-white p-2">
			<div className="mb-1 flex justify-between">
				<div className="flex items-center gap-2">
					<p className="text-sm font-medium capitalize">{title ?? "Uploading chunk..."}</p>
					<Spinner variant="primary" />
				</div>
				<div>
					<span className="text-sm font-bold">{subtitle}</span>
					{rightComp}
				</div>
			</div>

			<div className="h-2.5 w-full rounded-full bg-gray-200">
				<div
					className="h-2.5 rounded-full bg-primary-300 transition-all duration-300 ease-in-out"
					style={{ width: `${progress}%` }}></div>
			</div>
		</div>
	);
};
