import { useState, useRef } from "react";
import { toast } from "sonner";
import {
	RiAddLine,
	RiAlignLeft,
	RiArrowDownLine,
	RiArrowUpLine,
	RiCheckboxCircleFill,
	RiCheckboxMultipleLine,
	RiContrastLine,
	RiDeleteBin6Line,
	RiDeleteBinLine,
	RiDraggable,
	RiFileCopyLine,
	RiImageAddLine,
	RiQuestionLine,
	RiMicLine,
	RiHeadphoneLine,
	RiEyeLine,
} from "@remixicon/react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import type { TestCenterQuestionProps } from "@/types";
import { useTestCenterStore } from "@/store/z-store";
import { Textarea } from "../ui/textarea";
import { useFileHandler } from "@/hooks";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";

interface Props {
	onDelete: (sequence: number) => void;
	onDuplicate: (sequence: number) => void;
	onReorder: (sequence: number, direction: "up" | "down") => void;
	question: TestCenterQuestionProps;
	sectionId: string;
	sequence: number;
	// onUpdateQuestions: (question: QuestionDto) => void;
}

// Extended question types to include speaking, listening, and visual
const question_types = [
	{ label: "Multiple Choice", value: "MULTICHOICE", icon: RiCheckboxMultipleLine },
	{ label: "Short Answer", value: "FILL_IN_THE_GAP", icon: RiAlignLeft },
	{ label: "Yes/No", value: "YES_OR_NO", icon: RiContrastLine },
	{ label: "Speaking", value: "SPEAKING", icon: RiMicLine },
	{ label: "Listening", value: "LISTENING", icon: RiHeadphoneLine },
	{ label: "Visual", value: "VISUAL", icon: RiEyeLine },
];

const question_actions = [
	{ label: "up", icon: RiArrowUpLine },
	{ label: "down", icon: RiArrowDownLine },
	{ label: "duplicate", icon: RiFileCopyLine },
	{ label: "delete", icon: RiDeleteBin6Line },
];

export const QuestionCard = ({ sectionId, sequence, question }: Props) => {
	const {
		handleTypeChange,
		addQuestionContent,
		removeQuestion,
		addImagesToQuestion,
		removeImagesFromQuestion,
		addAudioToQuestion,
		removeAudioFromQuestion,
	} = useTestCenterStore();

	const [recordingState, setRecordingState] = useState<"idle" | "recording" | "recorded">("idle");
	const [audioPreview, setAudioPreview] = useState<string | null>(null);
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const audioChunksRef = useRef<Blob[]>([]);

	const { handleFileChange, handleRemoveFile, inputRef } = useFileHandler({
		onValueChange: (files) => {
			addImagesToQuestion(sectionId, sequence, files);
		},
		fileType: "image",
		onError: (error) => {
			toast.error(error);
		},
		validationRules: {
			allowedTypes: ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"],
			maxFiles: 5,
			maxSize: 1 * 1024 * 1024, // 1MB
			minFiles: 1,
		},
	});

	const {
		handleFileChange: handleAudioFileChange,
		handleRemoveFile: handleRemoveAudioFile,
		inputRef: audioInputRef,
	} = useFileHandler({
		onValueChange: (files) => {
			const file = files[0];
			addAudioToQuestion(sectionId, sequence, file);
		},
		fileType: "audio",
		onError: (error) => {
			toast.error(error);
		},
		validationRules: {
			allowedTypes: ["audio/mp3", "audio/mpeg", "audio/wav", "audio/ogg"],
			maxFiles: 1,
			maxSize: 5 * 1024 * 1024, // 5MB
			minFiles: 1,
		},
	});

	const startRecording = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			const mediaRecorder = new MediaRecorder(stream);
			mediaRecorderRef.current = mediaRecorder;
			audioChunksRef.current = [];

			mediaRecorder.ondataavailable = (event) => {
				if (event.data.size > 0) {
					audioChunksRef.current.push(event.data);
				}
			};

			mediaRecorder.onstop = () => {
				const audioBlob = new Blob(audioChunksRef.current, { type: "audio/mpeg" });
				const audioUrl = URL.createObjectURL(audioBlob);
				setAudioPreview(audioUrl);
				const audioFile = new File([audioBlob], "sample-audio.mp3", { type: "audio/mpeg" });
				addAudioToQuestion(sectionId, sequence, audioFile);
			};

			mediaRecorder.start();
			setRecordingState("recording");
		} catch (error) {
			toast.error("Error accessing microphone. Please check permissions.");
			console.error("Error accessing microphone:", error);
		}
	};

	const stopRecording = () => {
		if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
			mediaRecorderRef.current.stop();
			setRecordingState("recorded");

			// Stop all tracks on the stream
			mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
		}
	};

	return (
		<div className="space-y-3 rounded-lg border border-neutral-200 bg-white p-4">
			<div className="flex h-7 w-full items-center justify-between">
				<div className="flex items-center gap-x-1.5">
					<RiQuestionLine className="size-5 text-neutral-400" />
					<p className="text-xs text-neutral-400">QUESTION {question?.sequence_number}</p>
				</div>
				<div className="flex items-center gap-x-2">
					<Select
						value={question?.question_type}
						onValueChange={(value) => handleTypeChange(sectionId, sequence, value)}>
						<SelectTrigger className="h-7 w-40 text-xs">
							<SelectValue placeholder="Select a type" />
						</SelectTrigger>
						<SelectContent>
							{question_types.map(({ label, value, icon: Icon }, index) => (
								<SelectItem key={index} value={value}>
									<div className="flex items-center gap-x-1">
										<Icon className="size-4 text-neutral-400" />
										<p className="text-xs">{label}</p>
									</div>
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<div className="flex items-center">
						{question_actions.map(({ icon: Icon, label }, index) => (
							<button
								type="button"
								key={index}
								onClick={() => {
									if (label === "delete") {
										removeQuestion(sectionId, sequence);
									}
								}}
								className="group grid size-7 place-items-center border transition-all duration-500 first:rounded-l-md last:rounded-r-md hover:bg-primary-100">
								<Icon className="size-3.5 text-neutral-400 group-hover:size-4 group-hover:text-primary-400" />
							</button>
						))}
					</div>
				</div>
			</div>

			<div className="relative flex flex-col gap-2">
				<Textarea
					value={question?.content}
					onChange={(e) => addQuestionContent(sectionId, sequence, e.target.value)}
					className="h-44 w-full md:text-sm"
				/>

				{/* Different upload buttons based on question type */}
				{question?.question_type === "LISTENING" || question?.question_type === "SPEAKING" ? (
					<div className="absolute bottom-2 right-2 flex gap-x-2">
						<label className="ml-auto">
							<input
								ref={audioInputRef}
								onChange={handleAudioFileChange}
								type="file"
								accept="audio/*"
								className="peer sr-only"
							/>
							<div className="flex w-fit cursor-pointer items-center gap-x-2 rounded-md border border-neutral-200 bg-neutral-100 px-2 py-1 text-xs text-neutral-400 transition-all peer-focus:border-2 peer-focus:border-primary-300">
								<RiHeadphoneLine className="size-4" />
								<span>Upload Audio</span>
							</div>
						</label>

						{question?.question_type === "SPEAKING" && (
							<button
								type="button"
								onClick={recordingState === "recording" ? stopRecording : startRecording}
								className={`flex w-fit cursor-pointer items-center gap-x-2 rounded-md border ${
									recordingState === "recording"
										? "border-red-400 bg-red-100 text-red-400"
										: "border-neutral-200 bg-neutral-100 text-neutral-400"
								} px-2 py-1 text-xs transition-all`}>
								<RiMicLine className={`size-4 ${recordingState === "recording" ? "animate-pulse" : ""}`} />
								<span>{recordingState === "recording" ? "Stop Recording" : "Record Answer"}</span>
							</button>
						)}
					</div>
				) : (
					<label className="absolute bottom-2 right-2 ml-auto">
						<input
							ref={inputRef}
							onChange={handleFileChange}
							type="file"
							accept="image/*"
							multiple
							maxLength={4}
							className="peer sr-only"
						/>
						<div className="flex w-fit cursor-pointer items-center gap-x-2 rounded-md border border-neutral-200 bg-neutral-100 px-2 py-1 text-xs text-neutral-400 transition-all peer-focus:border-2 peer-focus:border-primary-300">
							<RiImageAddLine className="size-4" />
							<span>Upload Image</span>
						</div>
					</label>
				)}
			</div>

			{/* Audio preview for listening and speaking questions */}
			{(question?.question_type === "LISTENING" || question?.question_type === "SPEAKING") &&
				question?.audio && (
					<div className="flex flex-col gap-2">
						<p className="text-sm text-neutral-400">Audio Preview</p>
						<div className="flex items-center gap-x-4 rounded-md border p-2">
							<audio controls src={String(audioPreview)} className="max-w-full" />
							<button
								type="button"
								onClick={() => {
									removeAudioFromQuestion(sectionId, sequence);
									if (question?.audio) {
										handleRemoveAudioFile(question?.audio as File);
									}
									setAudioPreview(null);
									setRecordingState("idle");
								}}
								className="rounded bg-red-50 p-1 text-red-400 transition-colors hover:text-red-500">
								<RiDeleteBinLine className="size-4" />
							</button>
						</div>
					</div>
				)}

			{/* Image previews */}
			{question?.images?.length && question?.images?.length > 0 && (
				<ul className="grid grid-cols-4 gap-x-2">
					{question?.images.map((image, index) => {
						const source = URL.createObjectURL(image as File);
						return (
							<li key={index} className="relative">
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img alt="" className="size-32 rounded-md border" src={source} />
								<button
									type="button"
									onClick={() => {
										removeImagesFromQuestion(sectionId, sequence);
										handleRemoveFile(image as File);
									}}
									className="absolute right-2 top-2 rounded bg-red-50 p-1 text-red-400 transition-colors hover:text-red-500">
									<RiDeleteBinLine className="size-4" />
								</button>
							</li>
						);
					})}
				</ul>
			)}

			{/* Settings for different question types */}
			{(question?.question_type === "MULTICHOICE" || question?.question_type === "VISUAL") && (
				<div className="flex w-full items-center justify-center gap-x-4">
					<div className="flex h-8 flex-1 items-center rounded-md border border-neutral-300 px-2"></div>
					<div className="flex h-8 w-fit items-center gap-x-2 rounded-md border border-neutral-300 px-2">
						<p className="text-xs text-neutral-400">Randomize options</p>
						<Switch
							checked={question?.shuffled_options || false}
							onCheckedChange={() => {}}
							className="data-[state=checked]:bg-green-500"
						/>
					</div>
					<div className="flex h-8 w-fit items-center gap-x-2 rounded-md border border-neutral-300 px-2">
						<p className="text-xs text-neutral-400">Mark as required</p>
						<Switch
							checked={question?.is_required || false}
							onCheckedChange={() => {}}
							className="data-[state=checked]:bg-green-500"
						/>
					</div>
				</div>
			)}

			{/* Speaking specific settings */}
			{question?.question_type === "SPEAKING" && (
				<div className="flex w-full items-center justify-center gap-x-4">
					<div className="flex h-8 flex-1 items-center rounded-md border border-neutral-300 px-2">
						<p className="text-xs text-neutral-400">Max recording duration (seconds)</p>
						<input
							type="number"
							min="5"
							max="300"
							defaultValue="60"
							className="ml-2 w-16 border-0 bg-transparent text-xs outline-none"
						/>
					</div>
					<div className="flex h-8 w-fit items-center gap-x-2 rounded-md border border-neutral-300 px-2">
						<p className="text-xs text-neutral-400">Mark as required</p>
						<Switch
							checked={question?.is_required || false}
							onCheckedChange={() => {}}
							className="data-[state=checked]:bg-green-500"
						/>
					</div>
				</div>
			)}

			{/* Listening specific settings */}
			{question?.question_type === "LISTENING" && (
				<div className="flex w-full items-center justify-center gap-x-4">
					<div className="flex h-8 flex-1 items-center rounded-md border border-neutral-300 px-2">
						<p className="text-xs text-neutral-400">Maximum plays allowed</p>
						<input
							type="number"
							min="1"
							max="10"
							defaultValue="3"
							className="ml-2 w-16 border-0 bg-transparent text-xs outline-none"
						/>
					</div>
					<div className="flex h-8 w-fit items-center gap-x-2 rounded-md border border-neutral-300 px-2">
						<p className="text-xs text-neutral-400">Mark as required</p>
						<Switch
							checked={question?.is_required || false}
							onCheckedChange={() => {}}
							className="data-[state=checked]:bg-green-500"
						/>
					</div>
				</div>
			)}

			{/* Options for multiple choice, yes/no, fill in the gap, and visual */}
			{(question?.question_type === "MULTICHOICE" ||
				question?.question_type === "YES_OR_NO" ||
				question?.question_type === "FILL_IN_THE_GAP" ||
				question?.question_type === "VISUAL" ||
				question?.question_type === "LISTENING") && (
				<div className="space-y-3">
					<p className="text-sm text-neutral-400">Options</p>
					<OptionItem sectionId={sectionId} sequence={sequence} question={question} />
				</div>
			)}
		</div>
	);
};

const OptionItem = ({
	sectionId,
	sequence,
	question,
}: {
	sectionId: string;
	sequence: number;
	question: TestCenterQuestionProps;
}) => {
	const { addOptionContent, addQuestionOption, setCorrectOption, removeQuestionOption } =
		useTestCenterStore();

	return (
		<>
			<div className="w-full space-y-2">
				{question?.options.map((option, index) => (
					<div
						key={index}
						className="flex h-auto min-h-10 w-full flex-col rounded-lg border border-neutral-400 px-3 py-2">
						<div className="flex w-full items-center gap-x-4">
							<div className="flex flex-1 items-center gap-x-2">
								<button type="button" className={`grid size-6 place-items-center p-1`}>
									<RiDraggable className="size-full text-neutral-400" />
								</button>
								<input
									type="text"
									value={option.content}
									autoFocus
									onChange={(e) =>
										addOptionContent(sectionId, sequence, question?.sequence_number, e.target.value)
									}
									className="flex-1 border-0 bg-transparent px-0 py-1 text-sm outline-none ring-0 focus:border-0 focus:outline-none focus:ring-0"
								/>
								<div className="flex w-fit items-center gap-x-2">
									{option.is_correct === "YES" && (
										<div className="rounded-md bg-primary-100 px-2 py-1 text-xs font-medium text-primary-400">
											Correct Answer
										</div>
									)}
									<button
										type="button"
										onClick={() => setCorrectOption(sectionId, sequence, question?.sequence_number)}>
										<RiCheckboxCircleFill
											className={`size-5 ${option.is_correct === "YES" ? "text-primary-400" : "text-neutral-400"}`}
										/>
									</button>
								</div>
							</div>

							{question?.question_type !== "YES_OR_NO" && (
								<button
									onClick={() => removeQuestionOption(sectionId, sequence, index)}
									className="grid size-6 place-items-center rounded-md border">
									<RiDeleteBin6Line className="size-4 text-neutral-400" />
								</button>
							)}
						</div>

						{/* Visual question type option images */}
						{question?.question_type === "VISUAL" && <div className="mt-2 flex flex-col"></div>}
					</div>
				))}
			</div>

			{question?.question_type === "MULTICHOICE" ||
			question?.question_type === "VISUAL" ||
			question?.question_type === "LISTENING" ? (
				<Button
					type="button"
					onClick={() => {
						const maxOptions = {
							MULTICHOICE: 4,
							VISUAL: 4,
							LISTENING: 4,
						};

						const questionType = question?.question_type as keyof typeof maxOptions;

						if (question?.options.length >= (maxOptions[questionType] || 4)) {
							toast.error(`Maximum options limit for this question type reached`);
							return;
						}

						if (!["MULTICHOICE", "VISUAL", "LISTENING"].includes(question?.question_type)) {
							toast.error("Options can only be added to multiple choice, visual, or listening questions");
							return;
						}

						addQuestionOption(sectionId, sequence);
					}}
					className="w-fit focus:border-primary-300"
					size="xs"
					variant="dotted">
					<RiAddLine className="size-4" /> Add Option
				</Button>
			) : null}
		</>
	);
};
