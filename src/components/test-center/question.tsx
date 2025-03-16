import { useMutation } from "@tanstack/react-query";
import Image from "next/image";
import { toast } from "sonner";
import React from "react";
import {
	RiAddLine,
	RiAlignLeft,
	RiArrowDownLine,
	RiArrowUpLine,
	RiCheckboxCircleFill,
	RiCheckboxMultipleLine,
	RiContrastLine,
	RiDeleteBin6Line,
	RiDraggable,
	RiFileCopyLine,
	RiHeadphoneLine,
	RiImageAddLine,
	RiLoaderLine,
	RiLoopLeftLine,
	RiMicLine,
	RiQuestionLine,
	RiSpace,
	RiSpeakLine,
} from "@remixicon/react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { CreateTestQuestion, type TestQuestionDto } from "@/queries/test-center";
import { useTestCenterStore } from "@/store/z-store";
import { AudioPlayer } from "../audio-player";
import { queryClient } from "@/providers";
import { Textarea } from "../ui/textarea";
import { useFileHandler } from "@/hooks";
import type { HttpError } from "@/types";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";

interface Props {
	question: TestQuestionDto;
	sectionId: string;
	sequence: number;
	setCurrent: React.Dispatch<React.SetStateAction<number>>;
}

type AudioState = "idle" | "recording" | "recorded";
type QuestionActions = "down" | "up" | "duplicate" | "delete";
type QuestionTypes = {
	label: string;
	value: TestQuestionDto["question_type"];
	icon: React.ElementType;
};

const QUESTION_TYPES: QuestionTypes[] = [
	{ label: "Multiple Choice", value: "MULTIPLE_CHOICE", icon: RiCheckboxMultipleLine },
	{ label: "Yes/No", value: "YES_OR_NO", icon: RiContrastLine },
	{ label: "Speaking", value: "SPEAKING", icon: RiSpeakLine },
	{ label: "Listening", value: "LISTENING", icon: RiHeadphoneLine },
	{ label: "Short Answer", value: "SHORT_ANSWER", icon: RiAlignLeft },
	{ label: "Fill in the gap", value: "FILL_IN_THE_GAP", icon: RiSpace },
];

const QUESTION_ACTIONS: { label: QuestionActions; icon: React.ElementType }[] = [
	{ label: "up", icon: RiArrowUpLine },
	{ label: "down", icon: RiArrowDownLine },
	{ label: "duplicate", icon: RiFileCopyLine },
	{ label: "delete", icon: RiDeleteBin6Line },
];

const CONFIG = {
	audio: {
		allowedTypes: ["audio/mp3", "audio/mpeg", "audio/wav", "audio/ogg"],
		maxFiles: Infinity,
		maxSize: 5 * 1024 * 1024, // 5MB
		minFiles: 1,
	},
	image: {
		allowedTypes: ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"],
		maxFiles: 5,
		maxSize: 2 * 1024 * 1024, // 1MB
		minFiles: 1,
	},
};

const MULTIPLE_CHOICE: Array<TestQuestionDto["question_type"]> = ["LISTENING", "MULTIPLE_CHOICE"];

const CORRECT_OPTION: Array<TestQuestionDto["question_type"]> = [
	"LISTENING",
	"MULTIPLE_CHOICE",
	"YES_OR_NO",
];

export const QuestionCard = ({ sectionId, sequence, setCurrent }: Props) => {
	const [recordingState, setRecordingState] = React.useState<AudioState>("idle");
	const [mediaType, setMediaType] = React.useState<"audio" | "image">("audio");
	const [, setAudioPreview] = React.useState<string | null>(null);
	const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
	const audioChunksRef = React.useRef<Blob[]>([]);
	const {
		addAudioToQuestion,
		addImagesToQuestion,
		addQuestionOption,
		addQuestionContent,
		addOptionContent,
		handleTypeChange,
		removeAudioFromQuestion,
		removeImagesFromQuestion,
		removeQuestion,
		setCorrectOption,
		removeQuestionOption,
		questions,
	} = useTestCenterStore();

	const { handleClick, handleFileChange, handleRemoveFile, inputRef } = useFileHandler({
		onValueChange: (files) => {
			addImagesToQuestion(sequence, files);
		},
		fileType: mediaType,
		onError: (error) => {
			toast.error(error);
		},
		validationRules: CONFIG[mediaType],
	});

	const {
		handleClick: handleAudioClick,
		handleFileChange: handleAudioFileChange,
		handleRemoveFile: handleRemoveAudioFile,
		inputRef: audioInputRef,
	} = useFileHandler({
		onValueChange: (files) => {
			const file = files[0];
			addAudioToQuestion(sequence, file);
		},
		fileType: "audio",
		onError: (error) => {
			toast.error(error);
		},
		validationRules: CONFIG.audio,
	});

	const { isPending, mutateAsync } = useMutation({
		mutationFn: (payload: TestQuestionDto[]) => CreateTestQuestion(sectionId, payload),
		onSuccess: (data) => {
			toast.success(data.message);
			queryClient.invalidateQueries({ queryKey: ["get-section-questions", sectionId] });
		},
		onError: (error: HttpError) => {
			const message = error.response?.data?.message || "Something went wrong";
			toast.error(message);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["get-section-questions", sectionId] });
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
				addAudioToQuestion(sequence, audioFile);
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
			mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
		}
	};

	const handleActions = async (action: QuestionActions, sequence: number) => {
		switch (action) {
			case "delete":
				await removeQuestion(sequence);
				setCurrent((prev) => prev - 1);
				break;
			case "duplicate":
				const questionToDuplicate = questions.find((q) => q.sequence === sequence);
				if (questionToDuplicate) {
					const newQuestion = { ...questionToDuplicate, sequence: questions.length + 1 };
					useTestCenterStore.getState().addQuestion(newQuestion);
				}
				break;
			case "down":
				if (sequence < questions.length) {
					console.log("Move question down", sequence);
				}
				break;
			case "up":
				if (sequence > 1) {
					console.log("Move question up", sequence);
				}
				break;
		}
	};

	const handleImagesSelect = () => {
		setMediaType("image");
		handleClick();
	};

	const handleAudioSelect = () => {
		setMediaType("audio");
		handleAudioClick();
	};

	const handleImageDelete = (file: File) => {
		removeImagesFromQuestion(sequence, file);
		handleRemoveFile(file);
	};

	const getNewQuestions = (questions: TestQuestionDto[]) => {
		return questions.filter((question) => !question.id);
	};

	const handleSubmit = () => {
		const sanitized = getNewQuestions(questions);
		if (!sanitized.length) {
			toast.error("Please add at least one question");
			return;
		}
		if (sanitized.some((question) => question.content === "")) {
			toast.error("Please fill in all question contents");
			return;
		}
		if (sanitized.some((question) => question.question_type === "LISTENING" && !question.media)) {
			toast.error("Listening questions must have an audio file");
			return;
		}
		if (sanitized.some((question) => question.question_type === "")) {
			toast.error("Please select a question type for all questions");
			return;
		}
		if (
			sanitized.some(
				(question) => CORRECT_OPTION.includes(question.question_type) && question.options.length === 0
			)
		) {
			toast.error(
				"Please add at least one option for multiple choice, listening and yes/no questions"
			);
			return;
		}
		if (
			sanitized.some(
				(question) => MULTIPLE_CHOICE.includes(question.question_type) && question.options.length !== 4
			)
		) {
			toast.error("Multiple choice and listening questions must have 4 options");
			return;
		}
		if (sanitized.some((question) => question.question_type === "LISTENING" && !question.media)) {
			toast.error("Listening questions must have an audio file");
			return;
		}
		if (sanitized.some((question) => question.options.some((option) => option.content === ""))) {
			toast.error("Please fill in all option contents");
			return;
		}
		if (
			sanitized.some(
				(question) =>
					CORRECT_OPTION.includes(question.question_type) &&
					question.options.every((option) => option.is_correct !== "YES")
			)
		) {
			toast.error("Multiple choice, listening and yes/no questions must have a correct answer");
			return;
		}
		mutateAsync(sanitized);
	};

	const currentQuestion = questions[sequence];

	return (
		<div className="space-y-3 rounded-lg border border-neutral-200 bg-white p-4">
			<div className="flex h-7 w-full items-center justify-between">
				<div className="flex items-center gap-x-1.5">
					<RiQuestionLine className="size-5 text-neutral-400" />
					<p className="text-xs text-neutral-400">QUESTION {sequence + 1}</p>
				</div>
				<div className="flex items-center gap-x-2">
					<Select
						value={currentQuestion?.question_type}
						onValueChange={(value: TestQuestionDto["question_type"]) =>
							handleTypeChange(sequence, value)
						}>
						<SelectTrigger className="h-7 w-40 text-xs">
							<SelectValue placeholder="Select a type" />
						</SelectTrigger>
						<SelectContent>
							{QUESTION_TYPES.map(({ label, value, icon: Icon }, index) => (
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
						{QUESTION_ACTIONS.map(({ icon: Icon, label }, index) => (
							<button
								type="button"
								key={index}
								onClick={() => handleActions(label, sequence)}
								className="group grid size-7 place-items-center border transition-all duration-500 first:rounded-l-md last:rounded-r-md hover:bg-primary-100">
								<Icon className="size-3.5 text-neutral-400 group-hover:size-4 group-hover:text-primary-400" />
							</button>
						))}
					</div>
				</div>
			</div>
			<div className="relative flex flex-col gap-2">
				<Textarea
					value={currentQuestion?.content}
					onChange={(e) => addQuestionContent(sequence, e.target.value)}
					className="h-44 w-full md:text-sm"
				/>

				{currentQuestion?.question_type === "LISTENING" ? (
					<div className="absolute bottom-2 right-2 flex gap-x-2">
						<label className="ml-auto">
							<input
								ref={audioInputRef}
								onChange={handleAudioFileChange}
								type="file"
								accept="audio/*"
								className="peer sr-only"
							/>
							<button
								onClick={handleAudioSelect}
								className="flex w-fit cursor-pointer items-center gap-x-2 rounded-md border border-neutral-200 bg-neutral-100 px-2 py-1 text-xs text-neutral-400 transition-all peer-focus:border-2 peer-focus:border-primary-300">
								<RiHeadphoneLine className="size-4" />
								<span>Upload Audio</span>
							</button>
						</label>

						{currentQuestion?.question_type === "SPEAKING" && (
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
						<button
							onClick={handleImagesSelect}
							className="flex w-fit cursor-pointer items-center gap-x-2 rounded-md border border-neutral-200 bg-neutral-100 px-2 py-1 text-xs text-neutral-400 transition-all peer-focus:border-2 peer-focus:border-primary-300">
							<RiImageAddLine className="size-4" />
							<span>Upload Image</span>
						</button>
					</label>
				)}
			</div>

			{/* QUESTION IMAGES */}
			{!!currentQuestion?.images?.length && (
				<div className="grid w-full grid-cols-4 gap-x-2">
					{currentQuestion.images.map((image, index) => (
						<div key={index} className="relative aspect-square w-full">
							<Image
								src={typeof image === "string" ? image : URL.createObjectURL(image)}
								alt={`image-${index}`}
								fill
								sizes="100%"
								className="size-full rounded-lg object-cover"
							/>
							{typeof image === "string" ? (
								<label htmlFor="image-upload">
									<input
										ref={inputRef}
										type="file"
										id="image-upload"
										className="sr-only hidden"
										accept="image/*"
										onChange={handleFileChange}
									/>
									<button onClick={handleClick} className="absolute right-2 top-2 rounded-md bg-white p-1">
										<RiLoopLeftLine className="size-4 text-red-500" />
									</button>
								</label>
							) : (
								<button
									onClick={() => handleImageDelete(image)}
									className="absolute right-2 top-2 rounded-md bg-white p-1">
									<RiDeleteBin6Line className="size-4 text-red-500" />
								</button>
							)}
						</div>
					))}
				</div>
			)}

			{/* QUESTION AUDIO */}
			{!!currentQuestion?.media && (
				<div className="flex h-8 w-full items-center justify-between gap-x-4">
					<AudioPlayer source={currentQuestion.media} />
					{currentQuestion.media instanceof File && (
						<button
							onClick={() => {
								removeAudioFromQuestion(sequence);
								handleRemoveAudioFile(currentQuestion.media as File);
							}}
							className="grid size-8 place-items-center rounded-md border border-neutral-300 bg-white text-red-600">
							<RiDeleteBin6Line className="size-4" />
						</button>
					)}
				</div>
			)}

			{/* QUESTION SETTINGS */}
			<div className="grid h-8 w-full grid-cols-3 gap-x-3">
				<div className="col-span-2 h-full rounded-md border border-neutral-300"></div>
				<div className="flex h-full w-full items-center justify-between rounded-md border border-neutral-300 px-2">
					<p className="text-xs text-neutral-400">Randomized options</p>
					<Switch />
				</div>
			</div>

			{/* QUESTION OPTIONS */}
			<div className="w-full space-y-4">
				<p className="text-sm text-neutral-400">Options</p>
				<div className="w-full space-y-2">
					{currentQuestion?.options.map((option, index) => (
						<div
							key={index}
							className="flex h-auto min-h-10 w-full flex-col rounded-lg border border-neutral-300 px-3 py-2">
							<div className="flex w-full items-center gap-x-4">
								<div className="flex flex-1 items-center gap-x-2">
									<button type="button" className={`grid size-6 place-items-center p-1`}>
										<RiDraggable className="size-full text-neutral-400" />
									</button>
									<input
										type="text"
										value={option.content}
										autoFocus={!option.content}
										onChange={(e) => addOptionContent(sequence, option.sequence_number, e.target.value)}
										className="flex-1 border-0 bg-transparent px-0 py-1 text-sm outline-none ring-0 focus:border-0 focus:outline-none focus:ring-0"
										placeholder="Enter option content"
									/>
									<div className="flex w-fit items-center gap-x-2">
										{option.is_correct === "YES" && (
											<div className="rounded-md bg-primary-100 px-2 py-1 text-xs font-medium text-primary-400">
												Correct Answer
											</div>
										)}
										<button type="button" onClick={() => setCorrectOption(sequence, option.sequence_number)}>
											<RiCheckboxCircleFill
												className={`size-5 ${option.is_correct === "YES" ? "text-primary-400" : "text-neutral-400"}`}
											/>
										</button>
									</div>
								</div>

								{currentQuestion?.question_type !== "YES_OR_NO" && (
									<button
										onClick={() => removeQuestionOption(sequence, option.sequence_number)}
										className="grid size-6 place-items-center rounded-md border">
										<RiDeleteBin6Line className="size-4 text-neutral-400" />
									</button>
								)}
							</div>
						</div>
					))}
				</div>
				<Button
					type="button"
					onClick={() => addQuestionOption(sequence)}
					className="w-fit focus:border-primary-300"
					size="xs"
					variant="dotted">
					<RiAddLine className="size-4" /> Add Option
				</Button>
			</div>
			<Button onClick={handleSubmit} className="max-w-[180px]" size="sm">
				{isPending ? <RiLoaderLine className="animate-spin" /> : "Save Question"}
			</Button>
		</div>
	);
};
