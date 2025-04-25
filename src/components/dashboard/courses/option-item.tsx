/* eslint-disable react/display-name */
import { Button } from "@/components/ui/button";
import { useQuizStore, type QuestionDto } from "@/store/z-store";
import { RiAddLine, RiCheckboxCircleFill, RiDeleteBin6Line, RiDraggable } from "@remixicon/react";
import * as React from "react";
import { toast } from "sonner";

export const OptionItem = React.memo(
	({
		chapterId,
		moduleId,
		question,
	}: {
		chapterId: string;
		moduleId: string;
		question: QuestionDto;
	}) => {
		const { addOptionContent, addOption, setCorrectOption, removeOption } = useQuizStore();

		return (
			<>
				<div className="w-full space-y-2">
					{question.options.map((option, index) => (
						<div
							key={index}
							className="flex h-10 w-full items-center gap-x-4 rounded-lg border border-neutral-400 px-3">
							<div className="flex flex-1 items-center gap-x-2">
								<button type="button" className={`grid size-6 place-items-center p-1`}>
									<RiDraggable className="size-full text-neutral-400" />
								</button>
								<input
									type="text"
									value={option.content}
									autoFocus
									onChange={(e) =>
										addOptionContent(
											chapterId,
											moduleId,
											question.sequence_number,
											e.target.value,
											option.sequence_number
										)
									}
									className="flex-1 border-0 bg-transparent px-0 py-1 text-sm outline-none ring-0 focus:border-0 focus:outline-none focus:ring-0"
								/>
								<div className="flex w-fit items-center gap-x-2">
									{option.is_correct && (
										<div className="ml-auto w-max rounded-md bg-primary-100 px-2 py-1 text-xs font-medium text-primary-400">
											Correct Answer
										</div>
									)}
									<button
										type="button"
										className="ml-auto"
										onClick={() =>
											setCorrectOption(chapterId, moduleId, question.sequence_number, option.sequence_number)
										}>
										<RiCheckboxCircleFill
											className={`size-5 ${option.is_correct ? "text-primary-400" : "text-neutral-400"}`}
										/>
									</button>
								</div>
							</div>

							{question.question_type !== "YES_OR_NO" && (
								<button
									onClick={() =>
										removeOption(chapterId, moduleId, question.sequence_number, option.sequence_number)
									}
									className="grid size-6 place-items-center rounded-md border">
									<RiDeleteBin6Line className="size-4 text-neutral-400" />
								</button>
							)}
						</div>
					))}
				</div>

				{question.question_type === "MULTICHOICE" ? (
					<Button
						type="button"
						onClick={() => {
							if (question.options.length >= 4) {
								toast.error("Maximum options limit for this question type reached");
								return;
							}

							if (question.question_type !== "MULTICHOICE") {
								toast.error("Options can only be added to multiple choice questions");
								return;
							}
							addOption(chapterId, moduleId, question.sequence_number);
						}}
						className="w-fit focus:border-primary-300"
						size="xs"
						variant="dotted">
						<RiAddLine className="size-4" /> Add Option
					</Button>
				) : null}
			</>
		);
	}
);
