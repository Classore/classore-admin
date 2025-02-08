import { Button } from "@/components/ui/button";
import { convertNumberToWord, embedUrl, formatFileSize } from "@/lib";
import {
	CreateChapterModule,
	type CreateChapterModuleDto,
	GetChapterModules,
	GetSubject,
} from "@/queries";
import { chapterActions, useChapterStore } from "@/store/z-store/chapter";
import {
	RiAddLine,
	RiDeleteBin5Line,
	RiFile2Line,
	RiFileUploadLine,
	RiUploadCloud2Line,
} from "@remixicon/react";
import { skipToken, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import * as React from "react";
import { toast } from "sonner";
import { Spinner, TabPanel } from "./shared";

type LessonsProps = {
	lessonTab: string;
	chapterId: string | undefined;
};

const {
	addLessonTitle,
	addLessonContent,
	addLessonVideo,
	addLessonAttachments,
	removeLessonVideo,
	removeLessonAttachment,
	setChapterLessons,
} = chapterActions;

interface UseMutationProps {
	chapter_id: string;
	module: CreateChapterModuleDto;
}

export const Lessons = ({ lessonTab, chapterId }: LessonsProps) => {
	const queryClient = useQueryClient();

	const router = useRouter();
	const courseId = router.query.courseId as string;

	const lessons = useChapterStore((state) => state.lessons);
	const lesson = lessons.find((lesson) => lesson.id === lessonTab);

	const { data: course } = useQuery({
		queryKey: ["get-subject", courseId],
		queryFn: courseId ? () => GetSubject(courseId) : skipToken,
	});
	const { data } = useQuery({
		queryKey: ["get-modules", { chapterId }],
		queryFn: chapterId ? () => GetChapterModules({ chapter_id: chapterId }) : skipToken,
	});

	const chapter = course?.data.chapters.find((chapter) => chapter.id === chapterId);
	React.useEffect(() => {
		if (data) {
			const chapterLessons = data.data.data.map((lesson) => ({
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
				lesson_chapter: lesson.chapter_module_chapter,
			}));

			setChapterLessons(chapterLessons);
		}
	}, [chapter?.sequence, data]);

	const { isPending, mutate } = useMutation({
		mutationFn: ({ chapter_id, module }: UseMutationProps) =>
			CreateChapterModule(chapter_id, module),
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

	const onSave = () => {
		if (!lesson?.title) {
			toast.error("Lesson title is required");
			return;
		}

		if (!lesson?.content) {
			toast.error("Add description for this lesson");
			return;
		}

		if (lesson.videos.length === 0) {
			toast.error("Upload a video for this lesson");
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
				// CHANGE: this later
				tutor: "6a3d2574-9f72-4931-9cf1-c3a4769ba27a",
				title: lesson.title,
				content: lesson.content,
				sequence: lesson.sequence,
			},
		});
	};

	// const { isPending, mutate } = useMutation({
	// 	mutationFn: ({ chapter_id, module }: UseMutationProps) =>
	// 		UpdateChapterModule(chapter_id, module),
	// 	mutationKey: ["create-chapter-module"],
	// 	onSuccess: () => {
	// 		toast.success("Chapter module created successfully!");
	// 		queryClient.invalidateQueries({ queryKey: ["get-modules"] });
	// 	},
	// 	onError: (error) => {
	// 		console.log(error);
	// 		toast.error("Failed to create module");
	// 	},
	// });
	// const onUpdate = () => {
	// 	mutate({
	// 		chapter_id: chapterId ?? "",
	// 		module: {
	// 			attachment_urls: [],
	// 			image_urls: [],
	// 			video_urls: [],
	// 			images: [],
	// 			videos: [],
	// 			attachments: lesson?.attachments ?? [],
	// 			// CHANGE: this later
	// 			tutor: "6a3d2574-9f72-4931-9cf1-c3a4769ba27a",
	// 			title: lesson?.title ?? "",
	// 			content: lesson?.content ?? "",
	// 			sequence: lesson?.sequence ?? 1,
	// 		},
	// 	});
	// }

	if (!lesson) return null;

	return (
		<TabPanel
			className="col-span-4 rounded-md bg-neutral-100 p-4"
			selected={lessonTab}
			value={lessonTab}>
			<div className="flex flex-col gap-4">
				<p className="text-xs uppercase tracking-widest">
					Lesson {convertNumberToWord(lesson.sequence)} - Chapter{" "}
					{convertNumberToWord(lesson.chapter_sequence)}
				</p>

				<label className="flex flex-col gap-2">
					<input
						value={lesson.title}
						onChange={(e) =>
							addLessonTitle(lesson.sequence, e.target.value, lesson.chapter_sequence)
						}
						type="text"
						placeholder="Enter lesson title"
						className="w-full border-0 bg-transparent bg-white text-lg font-semibold text-neutral-600 outline-0 ring-0 placeholder:font-normal placeholder:text-neutral-300 focus:border-b-2 focus:border-b-primary-300 focus:ring-0"
					/>
				</label>

				<label className="flex flex-col gap-2 text-sm">
					<p className="text-neutral-400">Lesson Description:</p>
					<textarea
						value={lesson.content}
						onChange={(e) =>
							addLessonContent(lesson.sequence, e.target.value, lesson.chapter_sequence)
						}
						className="flex h-44 w-full resize-none rounded-md border border-neutral-200 bg-white p-3 text-sm outline-none placeholder:text-neutral-500 focus:border-primary-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
					/>
				</label>

				<div className="flex items-center gap-2">
					<button
						type="button"
						className="flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-400">
						<RiAddLine className="size-4" />
						<span>Add Quiz</span>
					</button>
				</div>

				<div className="flex flex-col gap-2">
					{lesson.videos.length ? (
						lesson.videos.map((video, index) => {
							let url;
							if (video instanceof File) {
								url = URL.createObjectURL(video);
							} else {
								url = embedUrl(video);
							}
							return (
								<div key={index} className="relative">
									<video
										src={url}
										id="videoPlayer"
										className="rounded-md"
										width="640"
										height="360"
										controls>
										Your browser does not support the video tag.
									</video>

									<button
										onClick={() => {
											URL.revokeObjectURL(url);
											removeLessonVideo(lesson.sequence, lesson.chapter_sequence);
										}}
										type="button"
										className="absolute right-2 top-2 z-50 rounded-md bg-white p-1">
										<RiDeleteBin5Line className="size-4" />
									</button>
								</div>
							);
						})
					) : (
						<label
							htmlFor="video-upload"
							className="grid w-full place-items-center rounded-lg bg-white py-4">
							<input
								type="file"
								className="sr-only hidden"
								id="video-upload"
								accept="video/*"
								multiple={false}
								onChange={(e) => {
									const files = Array.from(e.target.files ?? []);
									addLessonVideo(lesson.sequence, files, lesson.chapter_sequence);
								}}
							/>
							<div className="flex flex-col items-center gap-y-6 p-5">
								<div className="grid size-10 place-items-center rounded-md bg-neutral-100">
									<RiUploadCloud2Line size={20} />
								</div>

								<div className="text-center text-sm">
									<p className="font-medium">
										<span className="text-secondary-300">Click to upload</span> or drag and drop
										video
									</p>
									<p className="text-center text-xs text-neutral-400">
										mp4, avi, mov, wmv, mkv, .flv (max. 800 x 400px)
									</p>
								</div>

								<div className="relative h-[1px] w-full bg-neutral-300 before:absolute before:left-1/2 before:top-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:bg-white before:px-1.5 before:py-0.5 before:text-xs before:font-medium before:text-neutral-300 before:content-['OR']"></div>
								<div className="flex items-center justify-center gap-x-4">
									<Button className="w-fit" size="sm" variant="invert-outline">
										<RiUploadCloud2Line size={14} /> Upload Video
									</Button>
									{/* <PasteLink
													module={module}
													open={open.paste}
													setOpen={(paste) => setOpen({ ...open, paste })}
													disabled={isPending}
												/> */}
								</div>
							</div>
						</label>
					)}

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
												<p className="w-96 truncate font-semibold text-neutral-500">
													{attachment.name}
												</p>
											)}
											<p className="text-xs text-neutral-400">
												{typeof attachment === "string" ? "-" : formatFileSize(attachment.size)}
											</p>
										</div>

										<button
											onClick={() =>
												removeLessonAttachment(lesson.sequence, idx, lesson.chapter_sequence)
											}
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
						<Button className="mt-4 w-40 text-sm font-medium">Update Lesson</Button>
					) : (
						<Button
							disabled={isPending}
							onClick={onSave}
							className="mt-4 w-40 text-sm font-medium">
							{isPending ? <Spinner /> : "Save Lesson"}
						</Button>
					)}
				</div>
			</div>
		</TabPanel>
	);
};
