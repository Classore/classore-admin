import { useVideoUploader } from "@/hooks";
import { embedUrl, generateUuid } from "@/lib";
import type { SubjectResponse } from "@/queries";
import { RiDeleteBin5Line, RiRefreshLine, RiUploadCloud2Line } from "@remixicon/react";
import * as React from "react";
import { VideoPlayer } from "../shared";
import { UploadProgress } from "../shared/upload-progress";
import { Button } from "../ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";

type PreviewVideoModalProps = {
	course: SubjectResponse;
	courseId: string;
};

const UPLOAD_STATUS = {
	chunk: "Uploading...",
	uploading: "Processing...",
	transcoding_in_progress: "Transcoding...",
	completed: "Completed",
};

export const PreviewVideoModal = ({ course, courseId }: PreviewVideoModalProps) => {
	const upload_id = React.useMemo(() => generateUuid(), []);
	const hasVideo = Boolean(course.videos.length > 0);

	const {
		handleFileChange,
		handleFileRemove,
		handleCancelUpload,
		previewUrl,
		isUploading,
		isLoading,
		isRunningRef,
		uploadStatus,
		fileInputRef,
	} = useVideoUploader({ upload_id, id: courseId, model_type: "SUBJECT" });

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button size="sm" className="w-fit">
					Add Preview Video
				</Button>
			</DialogTrigger>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>Preview Video</DialogTitle>
					<DialogDescription className="text-xs">
						Upload a short introductory video for this course
					</DialogDescription>
				</DialogHeader>

				<p className="rounded bg-blue-100 px-4 py-2 text-xs text-blue-600">
					<strong>Note:</strong> Uploaded videos may take a while before being visible. It will go
					through three stages: <strong>uploading</strong>, <strong>processing</strong>, and{" "}
					<strong>transcoding</strong>. We will show you the progress of each stage.{" "}
					<span className="text-center text-xs font-bold text-red-600">
						DO NOT CLOSE THIS MODAL WHILE VIDEO IS UPLOADING
					</span>
				</p>

				{isLoading ? (
					<UploadProgress
						progress={uploadStatus.progress}
						title={UPLOAD_STATUS[uploadStatus.status as keyof typeof UPLOAD_STATUS]}
						subtitle={
							uploadStatus.chunk
								? `${uploadStatus.chunk} - ${uploadStatus.progress}%`
								: `${uploadStatus.progress}%`
						}
						rightComp={
							isRunningRef.current && isUploading ? (
								<button className="ml-2 text-xs" type="button" onClick={handleCancelUpload}>
									Cancel
								</button>
							) : null
						}
					/>
				) : null}

				<div className="ml-auto">
					<input
						type="file"
						className="sr-only hidden"
						id="video-upload"
						accept="video/*"
						disabled={isUploading || isLoading}
						multiple={false}
						ref={fileInputRef}
						onChange={handleFileChange}
					/>
					<button
						onClick={() => fileInputRef.current?.click()}
						disabled={isUploading || isLoading || !hasVideo}
						type="button"
						className="flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-400 disabled:cursor-not-allowed">
						<RiRefreshLine className="size-4" />
						<span>Change video</span>
					</button>
				</div>

				{previewUrl ? (
					<div className="relative aspect-video w-full rounded-lg border border-neutral-200">
						<VideoPlayer
							src={previewUrl}
							className="fixed left-0 right-0 h-80 w-full rounded-none object-cover"
						/>
						{uploadStatus.status !== "completed" ? (
							<button
								onClick={() => {
									handleFileRemove();
									if (isUploading) {
										handleCancelUpload();
									}
								}}
								type="button"
								className="absolute right-2 top-2 z-50 rounded bg-white p-1 transition-colors hover:bg-red-600 hover:text-red-50">
								<RiDeleteBin5Line className="size-4" />
							</button>
						) : null}
					</div>
				) : hasVideo ? (
					<div className="aspect-video">
						<VideoPlayer
							src={embedUrl(course.videos[0].secure_url)}
							className="fixed left-0 right-0 h-80 w-full rounded-none object-cover"
						/>
					</div>
				) : (
					<label
						htmlFor="video-upload"
						draggable
						className="has-disabled:cursor-not-allowed grid aspect-video w-full place-items-center border border-neutral-200 bg-white py-4">
						<input
							type="file"
							className="sr-only hidden"
							id="video-upload"
							accept="video/*"
							disabled={isUploading || isLoading}
							multiple={false}
							ref={fileInputRef}
							onChange={handleFileChange}
						/>

						<div className="flex flex-col items-center gap-y-6 p-5">
							<div className="grid size-10 place-items-center rounded-md bg-neutral-100">
								<RiUploadCloud2Line size={20} />
							</div>
							<div className="text-center text-sm">
								<p className="font-medium">
									<span className="text-secondary-300">Click to upload</span> video
								</p>
								<p className="text-center text-xs text-neutral-400">mp4, webm, ogg, mkv (max. 200MB)</p>
							</div>
						</div>
					</label>
				)}

				<div className={previewUrl || hasVideo ? "mt-16" : ""} />
			</DialogContent>
		</Dialog>
	);
};
