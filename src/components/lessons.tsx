import { skipToken, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import * as React from "react";
import { toast } from "sonner";
import {
	RiAddLine,
	RiDeleteBin5Line,
	RiEye2Line,
	RiFile2Line,
	RiFileUploadLine,
	RiUploadCloud2Line,
} from "@remixicon/react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { api, convertNumberToWord, embedUrl, formatFileSize } from "@/lib";
import type { ChapterModuleProps, HttpError, HttpResponse } from "@/types";
import { chapterActions, useChapterStore } from "@/store/z-store/chapter";
import { TiptapEditor } from "./ui/tiptap-editor";
import { Button } from "@/components/ui/button";
import { Spinner, VideoPlayer } from "./shared";
import { PublishModal } from "./publish-modal";
import { ScrollArea } from "./ui/scroll-area";
import { endpoints } from "@/config";
import {
	type CreateChapterModuleDto,
	GetChapterModules,
	GetStaffs,
	type GetStaffsResponse,
	GetSubject,
	PublishResource,
	UpdateChapterModule,
} from "@/queries";

type LessonsProps = {
	lessonTab: string;
	chapterId: string | undefined;
	setCurrentTab: (tab: string) => void;
};

const {
	addLessonTitle,
	addLessonContent,
	addLessonAttachments,
	removeLessonAttachment,
	setChapterLessons,
	addLessonTutor,
} = chapterActions;

interface UseMutationProps {
	chapter_id: string;
	module: CreateChapterModuleDto;
}

// this is the tutor role id. It should come from the api but
const admin_role = "2e3415e1-8e0f-4bf4-9503-9d114f6ae3ff";
export const Lessons = ({ lessonTab, chapterId, setCurrentTab }: LessonsProps) => {
	const [open, setOpen] = React.useState(false);
	const abortController = React.useRef<AbortController | null>(null);
	const queryClient = useQueryClient();

	const router = useRouter();
	const courseId = router.query.courseId as string;

	const lessons = useChapterStore((state) => state.lessons);
	const lesson = lessons.find((lesson) => lesson.id === lessonTab);

	const { data: course } = useQuery({
		queryKey: ["get-subject", courseId],
		queryFn: courseId ? () => GetSubject(courseId) : skipToken,
	});

	const { data: modules } = useQuery({
		queryKey: ["get-modules", { chapterId }],
		queryFn: chapterId ? () => GetChapterModules({ chapter_id: chapterId }) : skipToken,
		enabled: !!chapterId,
	});

	const { data: tutors } = useQuery({
		queryKey: ["get-staffs", admin_role],
		queryFn: () => GetStaffs({ admin_role, limit: 50 }),
		enabled: !!admin_role,
		select: (data) => (data as GetStaffsResponse).data.admins,
	});

	const chapter = course?.data.chapters.find((chapter) => chapter.id === chapterId);
	React.useEffect(() => {
		if (modules) {
			const chapterLessons = modules.data.data.map((lesson) => ({
				id: lesson.chapter_module_id,
				chapter_sequence: Number(chapter?.sequence),
				sequence: lesson.chapter_module_sequence,
				title: lesson.chapter_module_title,
				content: lesson.chapter_module_content,
				videos: lesson.chapter_module_video_array.map((video) => video.secure_url),
				images: lesson.chapter_module_images,
				attachments: lesson.chapter_module_attachments,
				image_urls: [],
				video_urls: [],
				attachment_urls: [],
				tutor: lesson.chapter_module_tutor,
				lesson_chapter: lesson.chapter_module_id,
				is_published: lesson.chapter_module_is_published,
			}));

			setChapterLessons(chapterLessons);
		}
	}, [chapter?.sequence, modules]);

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
				const res = await api.post<HttpResponse<ChapterModuleProps>>(
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
				const err = error as unknown as HttpError;
				const errorMessage = Array.isArray(err.response.data.error)
					? err?.response.data.error[0]
					: err?.response.data.error;
				const message = errorMessage || "Failed to create module";
				throw new Error(message);
			}
		},
		mutationKey: ["create-chapter-module"],
		onSuccess: () => {
			toast.success("Chapter module created successfully!");
			queryClient.invalidateQueries({ queryKey: ["get-modules"] });
			queryClient.invalidateQueries({ queryKey: ["get-subject"] });
		},
		onError: (error: HttpError) => {
			const errorMessage = Array.isArray(error?.response.data.message)
				? error?.response.data.message[0]
				: error?.response.data.message;
			const message = errorMessage || "Failed to create module";
			toast.error(message);
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

	const { isPending: updatePending, mutate: updateMutate } = useMutation({
		mutationFn: ({ chapter_id, module }: UseMutationProps) => UpdateChapterModule(chapter_id, module),
		mutationKey: ["update-chapter-module"],
		onSuccess: () => {
			toast.success("Chapter module update successfully!");
			queryClient.invalidateQueries({ queryKey: ["get-modules"] });
		},
		onError: (error: HttpError) => {
			const errorMessage = Array.isArray(error?.response.data.message)
				? error?.response.data.message[0]
				: error?.response.data.message;
			const message = errorMessage || "Failed to create module";
			toast.error(message);
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
			chapter_id: lessonTab ?? "",
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
		<ScrollArea className="col-span-4 h-full w-full overflow-y-auto rounded-md bg-neutral-100">
			<div
				className={`flex items-center justify-between gap-1 px-4 py-2 ${lesson.is_published === "YES" ? "bg-green-100 text-green-500" : "bg-red-100 text-red-500"}`}>
				<p className="w-fit rounded px-2 py-1 text-[10px] font-semibold uppercase">
					Lesson Status: {lesson.is_published === "YES" ? "Published" : "Unpublished"}
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
								publish: lesson.is_published === "YES" ? "NO" : "YES",
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
							onClick={() => setCurrentTab("video")}
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

				<input
					value={lesson.title}
					onChange={(e) => addLessonTitle(lesson.sequence, e.target.value, lesson.chapter_sequence)}
					type="text"
					placeholder="Enter lesson title"
					className="w-full rounded-md border border-neutral-200 bg-transparent bg-white text-base font-semibold text-neutral-600 outline-0 ring-0 placeholder:text-base placeholder:font-normal placeholder:text-neutral-300 focus:border-2 focus:border-b-primary-300 focus:ring-0"
				/>

				<p className="rounded bg-blue-100 px-4 py-2 text-center text-xs text-blue-600">
					<strong>Note:</strong> You can only upload video or add quiz for this lesson after saving. To
					save, click the <strong>Save</strong> button at the bottom.
				</p>

				{/* UPLOAD VIDEO */}
				{lesson.videos.length > 0 ? (
					<VideoPlayer src={embedUrl(lesson.videos[0])} className="h-full w-full rounded-lg" />
				) : null}

				<TiptapEditor
					value={lesson.content}
					onChange={(value) => addLessonContent(lesson.sequence, value, lesson.chapter_sequence)}
					editorClassName="min-h-64"
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
					<div className="flex flex-col gap-4 rounded-md bg-white px-4 py-3 text-sm">
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
		</ScrollArea>
	);
};
