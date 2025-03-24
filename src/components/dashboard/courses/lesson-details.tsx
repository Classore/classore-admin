import { PublishModal } from "@/components/publish-modal";
import { Spinner, VideoPlayer } from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { TiptapEditor } from "@/components/ui/tiptap-editor";
import { endpoints } from "@/config";
import { axios, convertNumberToWord, embedUrl, formatFileSize } from "@/lib";
import {
	GetStaffs,
	PublishResource,
	UpdateChapterModule,
	type CreateChapterModuleDto,
	type GetStaffsResponse,
} from "@/queries";
import { chapterActions, useChapterStore } from "@/store/z-store/chapter";
import type { ChapterModuleProps, HttpResponse } from "@/types";
import {
	RiAddLine,
	RiDeleteBin5Line,
	RiEye2Line,
	RiFile2Line,
	RiFileUploadLine,
	RiUploadCloud2Line,
} from "@remixicon/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { toast } from "sonner";

type LessonProps = {
	activeLessonId: string;
	chapterId: string;
	setCurrentTab: React.Dispatch<React.SetStateAction<string>>;
};

interface UseMutationProps {
	chapter_id: string;
	module: CreateChapterModuleDto;
}

const {
	addLessonTitle,
	addLessonContent,
	addLessonTutor,
	addLessonAttachments,
	removeLessonAttachment,
} = chapterActions;

const admin_role = "2e3415e1-8e0f-4bf4-9503-9d114f6ae3ff";
export const LessonDetails = ({ activeLessonId, chapterId, setCurrentTab }: LessonProps) => {
	const lessons = useChapterStore((state) => state.lessons);
	const lesson = lessons.find((lesson) => lesson.id === activeLessonId);

	const queryClient = useQueryClient();
	const abortController = React.useRef<AbortController | null>(null);

	const [open, setOpen] = React.useState(false);

	const { data: tutors } = useQuery({
		queryKey: ["get-staffs", admin_role],
		queryFn: () => GetStaffs({ admin_role, limit: 50 }),
		enabled: !!admin_role,
		select: (data) => (data as GetStaffsResponse).data.admins,
	});

	// SAVE LESSON
	const { isPending, mutate } = useMutation({
		mutationFn: async ({ chapter_id, module }: UseMutationProps) => {
			const formData = new FormData();
			module.attachments.forEach((attachment) => {
				formData.append("attachments", attachment);
			});
			formData.append("sequence", module.sequence.toString());
			formData.append("tutor", module.tutor);
			formData.append("title", module.title);
			formData.append("content", module.content);
			abortController.current = new AbortController();
			try {
				const res = await axios.post<HttpResponse<ChapterModuleProps>>(
					endpoints(chapter_id).school.create_chapter_module,
					formData,
					{
						signal: abortController.current.signal,
						timeout: 1000 * 60 * 2,
						headers: {
							"Content-Type": "multipart/form-data",
						},
						maxBodyLength: Infinity,
						maxContentLength: Infinity,
					}
				);
				return res.data;
			} catch (error) {
				console.log(error);
			}
		},
		mutationKey: ["create-chapter-module"],
		onSuccess: () => {
			toast.success("Chapter module created successfully!");
			queryClient.invalidateQueries({ queryKey: ["get-modules"] });
			queryClient.invalidateQueries({ queryKey: ["get-subject"] });
		},
		onError: (error) => {
			console.log(error);
			toast.error("Failed to create module");
		},
	});
	const onSaveLesson = () => {
		if (!lesson?.title) {
			toast.error("Lesson title is required");
			return;
		}

		if (!lesson?.content) {
			toast.error("Add description for this lesson");
			return;
		}

		if (!lesson.tutor) {
			toast.error("Please select a tutor for this lesson");
			return;
		}

		mutate({
			chapter_id: chapterId ?? "",
			module: {
				attachment_urls: [],
				image_urls: [],
				video_urls: [],
				images: [],
				videos: lesson.videos,
				attachments: lesson.attachments,
				tutor: lesson.tutor,
				title: lesson.title,
				content: lesson.content,
				sequence: lesson.sequence,
			},
		});
	};

	// UPDATE LESSON
	const { isPending: updatePending, mutate: updateMutate } = useMutation({
		mutationFn: ({ chapter_id, module }: UseMutationProps) => UpdateChapterModule(chapter_id, module),
		mutationKey: ["update-chapter-module"],
		onSuccess: () => {
			toast.success("Chapter module update successfully!");
			queryClient.invalidateQueries({ queryKey: ["get-modules"] });
		},
		onError: (error) => {
			console.log(error);
			toast.error("Failed to update module");
		},
	});
	const onUpdateLesson = () => {
		if (!lesson?.title) {
			toast.error("Lesson title is required");
			return;
		}

		if (!lesson?.content) {
			toast.error("Add description for this lesson");
			return;
		}

		// if (lesson.videos.length === 0) {
		// 	toast.error("Upload a video for this lesson");
		// 	return;
		// }

		updateMutate({
			chapter_id: chapterId ?? "",
			module: {
				attachment_urls: [],
				image_urls: [],
				video_urls: [],
				images: [],
				videos: lesson.videos,
				attachments: lesson.attachments,
				tutor: lesson.tutor,
				title: lesson.title,
				content: lesson.content,
				sequence: lesson.sequence,
			},
		});
	};

	// PUBLISH LESSON MUTATION
	const { mutate: publishMutate, isPending: publishPending } = useMutation({
		mutationFn: PublishResource,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["get-modules"],
			});
			setOpen(false);
			toast.success("Lesson published successfully!");
		},
	});

	if (!lesson) return null;

	return (
		<>
			<div
				className={`flex items-center justify-between gap-1 border-t p-1.5 ${lesson.is_published === "YES" ? "border-t-green-600 bg-green-100 text-green-600" : "border-t-red-600 bg-red-100 text-red-600"}`}>
				<p className="w-fit rounded px-2 py-1 text-[11px] font-semibold uppercase">
					Lesson status: {lesson.is_published === "YES" ? "Published" : "Unpublished"}
				</p>

				{lesson.is_published === "NO" ? (
					<PublishModal
						published={lesson.is_published !== "NO"}
						isPending={publishPending}
						type="lesson"
						open={open}
						setOpen={setOpen}
						onConfirm={() =>
							publishMutate({
								id: lesson.id,
								model_type: "CHAPTER_MODULE",
							})
						}
						trigger={
							<button
								type="button"
								className="flex items-center gap-1 rounded-md bg-white px-2 py-1 text-xs text-neutral-400 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed">
								<RiEye2Line className="size-3.5" />
								<span>Publish Lesson</span>
							</button>
						}
					/>
				) : null}
			</div>

			<div className="flex flex-col gap-4 p-4">
				<header className="flex items-center justify-between gap-1">
					<p className="text-xs uppercase tracking-widest">
						Lesson {convertNumberToWord(lesson.sequence)} - Chapter{" "}
						{convertNumberToWord(lesson.chapter_sequence)}
					</p>

					<div className="flex items-center gap-2">
						<button
							type="button"
							disabled={!lesson.lesson_chapter}
							onClick={() => setCurrentTab("video-upload")}
							className="flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-400 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed">
							<RiUploadCloud2Line className="size-4" />
							<span>Upload Video</span>
						</button>

						<button
							type="button"
							disabled={!lesson.lesson_chapter}
							onClick={() => setCurrentTab("quiz")}
							className="flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-400 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed">
							<RiAddLine className="size-4" />
							<span>Add Quiz</span>
						</button>
					</div>
				</header>

				<p className="rounded bg-blue-100 px-4 py-2 text-center text-xs text-blue-600">
					<strong>Note:</strong> You can only upload video or add quiz for this lesson after saving. To
					save, click the <strong>Save</strong> button at the bottom.
				</p>

				<input
					value={lesson.title}
					onChange={(e) => addLessonTitle(lesson.sequence, e.target.value, lesson.chapter_sequence)}
					type="text"
					placeholder="Enter lesson title"
					className="w-full rounded-md border border-neutral-200 bg-transparent bg-white text-base font-semibold text-neutral-600 outline-0 ring-0 placeholder:text-base placeholder:font-normal placeholder:text-neutral-300 focus:border-2 focus:border-b-primary-300 focus:ring-0"
				/>

				{/* UPLOAD VIDEO */}
				{lesson.videos.length > 0 ? (
					<VideoPlayer src={embedUrl(lesson.videos[0])} className="h-80 w-full rounded-lg" />
				) : null}

				<TiptapEditor
					value={lesson.content}
					initialValue={lesson.content ?? ""}
					onChange={(value) => addLessonContent(lesson.sequence, value, lesson.chapter_sequence)}
					editorClassName="min-h-60"
				/>

				<div className="flex flex-col gap-4">
					{/* ADD TUTOR */}
					<label className="flex-1 space-y-1">
						<p className="text-sm text-neutral-400">Select Teacher:</p>

						<Select
							value={lesson.tutor}
							onValueChange={(value) => addLessonTutor(lesson.sequence, value, lesson.chapter_sequence)}
							disabled={isPending}>
							<SelectTrigger className="w-full py-5 text-sm capitalize">
								<SelectValue placeholder="Select Teacher" />
							</SelectTrigger>
							<SelectContent className="text-sm capitalize">
								{tutors?.data.map((user) => (
									<SelectItem key={user.id} value={user.id}>
										{user.first_name} {user.last_name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</label>

					{/* ADD FILE ATTACHMENTS */}
					<div className="flex flex-col gap-4 rounded-md bg-neutral-100 px-4 py-3 text-sm">
						<div className="flex items-center justify-between gap-2">
							<p className="font-semibold text-neutral-500">File Attachments</p>

							<label className="flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-400">
								<input
									type="file"
									id="fileInput"
									accept=".pdf, .doc, .docx, .txt"
									multiple
									className="hidden"
									onChange={(e) => {
										const files = Array.from(e.target.files ?? []);
										addLessonAttachments(lesson.sequence, files, lesson.chapter_sequence);
									}}
								/>

								<RiFile2Line className="size-4" />
								<span>Upload Attachments</span>
							</label>
						</div>

						{lesson.attachments?.length ? (
							<ul>
								{Array.from(lesson.attachments).map((attachment, idx) => (
									<li
										key={typeof attachment === "string" ? attachment : attachment.name}
										className="flex items-center gap-4 border-t border-t-neutral-200 py-4">
										<RiFileUploadLine className="size-5 text-neutral-400" />

										<div className="gap-1 text-sm">
											{typeof attachment === "string" ? (
												<a
													href={attachment}
													target="_blank"
													download
													className="w-96 truncate font-semibold text-neutral-500">
													Attachment
												</a>
											) : (
												<p className="w-96 truncate font-semibold text-neutral-500">{attachment.name}</p>
											)}
											<p className="text-xs text-neutral-400">
												{typeof attachment === "string" ? "-" : formatFileSize(attachment.size)}
											</p>
										</div>

										<button
											onClick={() => removeLessonAttachment(lesson.sequence, idx, lesson.chapter_sequence)}
											type="button"
											className="ml-auto text-neutral-400 transition-colors hover:text-red-600">
											<RiDeleteBin5Line className="size-4" />
										</button>
									</li>
								))}
							</ul>
						) : null}
					</div>

					{lesson.lesson_chapter ? (
						<Button
							disabled={updatePending}
							onClick={onUpdateLesson}
							className="w-40 text-sm font-medium">
							{updatePending ? <Spinner /> : "Update Lesson"}
						</Button>
					) : (
						<Button disabled={isPending} onClick={onSaveLesson} className="mt-4 w-40 text-sm font-medium">
							{isPending ? <Spinner /> : "Save Lesson"}
						</Button>
					)}
				</div>
			</div>
		</>
	);
};
