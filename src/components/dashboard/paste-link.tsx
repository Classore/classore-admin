import { validateUrl } from "@/lib";
import { queryClient } from "@/providers";
import { UpdateChapterModule, type UpdateChapterModuleDto } from "@/queries";
import { RiInformationLine, RiLink, RiLoaderLine } from "@remixicon/react";
import { useMutation } from "@tanstack/react-query";
import * as React from "react";
import { toast } from "sonner";
import { IconLabel } from "../shared";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "../ui/dialog";

interface UseMutationProps {
	module_id: string;
	module: UpdateChapterModuleDto;
}

export const PasteLink = ({
	open,
	sequence,
	setOpen,
	disabled,
}: {
	open: boolean;
	sequence: number;
	setOpen: (open: boolean) => void;
	disabled?: boolean;
}) => {
	const [link, setLink] = React.useState("");

	const { isPending, mutate } = useMutation({
		mutationFn: ({ module_id, module }: UseMutationProps) => UpdateChapterModule(module_id, module),
		mutationKey: ["update-chapter-module"],
		onSuccess: (data) => {
			toast.success(data.message);
			queryClient.invalidateQueries({ queryKey: ["get-modules"] }).then(() => {
				setOpen(false);
			});
		},
		onError: (error) => {
			console.log(error);
			toast.error("Failed to update module");
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!link) {
			toast.error("Please enter a link");
			return;
		}
		let url = "";
		if (!module?.id) {
			toast.error("Please select a valid module");
			return;
		}
		if (link.startsWith("https://")) {
			url = link;
		} else {
			url = `https://${link}`;
		}
		const isValidUrl = validateUrl(url);
		if (!isValidUrl) {
			toast.error("Please enter a valid url");
			return;
		}
		mutate({
			module_id: String(module?.id),
			module: {
				sequence,
				video_urls: [
					{
						derived_url: "",
						duration: 0,
						secure_url: "",
					},
				],
			},
		});
	};

	React.useEffect(() => {
		if (open) {
			setLink("");
			queryClient.removeQueries({ queryKey: ["update-chapter-module"] });
		}
	}, [open]);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild disabled={disabled}>
				<Button className="w-fit" size="sm" variant="invert-outline">
					<RiLink /> Paste URL
				</Button>
			</DialogTrigger>
			<DialogContent className="w-[400px] p-1">
				<form
					onSubmit={handleSubmit}
					className="w-full space-y-4 rounded-lg border px-4 pb-4 pt-[59px]">
					<IconLabel icon={RiLink} />
					<div className="my-4 flex flex-col gap-y-4">
						<DialogTitle>Paste Video Link</DialogTitle>
						<div className="space-y-2">
							<div className="flex h-10 w-full items-center rounded-lg border border-neutral-300">
								<div className="flex h-full w-fit items-center rounded-l-lg border-r border-neutral-300 bg-neutral-100 px-3">
									<span className="text-sm font-medium text-neutral-500">https://</span>
								</div>
								<input
									type="text"
									value={link}
									onChange={(e) => setLink(e.target.value)}
									className="h-full flex-1 rounded-r-lg border-none bg-transparent px-3 text-sm outline-none transition-all duration-500 placeholder:text-neutral-400 focus:ring-primary-400"
									placeholder="drive.google.com/file/d/1abcdef12345GHIJKL67890/view?usp=sharing"
								/>
							</div>
							<div className="flex items-start gap-x-2 text-neutral-400">
								<RiInformationLine size={22} />
								<DialogDescription>
									Videos will be automatically be imported from the pasted link source
								</DialogDescription>
							</div>
						</div>
					</div>
					<hr />
					<div className="flex w-full items-center justify-end gap-x-4">
						<Button
							type="button"
							disabled={isPending}
							onClick={() => setOpen(false)}
							className="w-fit"
							size="sm"
							variant="outline">
							Cancel
						</Button>
						<Button type="submit" disabled={isPending} className="w-fit" size="sm">
							{isPending ? <RiLoaderLine className="animate-spin" /> : "Import Video Link"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
};
