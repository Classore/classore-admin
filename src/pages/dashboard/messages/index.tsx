import { type Socket, io } from "socket.io-client";
import { toast } from "sonner";
import React from "react";
import {
	RiFlagLine,
	RiForbid2Line,
	RiImageAddLine,
	RiMore2Line,
	RiSearchLine,
	RiSendPlaneLine,
	RiEmojiStickerLine,
	RiVolumeMuteLine,
} from "@remixicon/react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGetInfiniteMessages, useGetUserRooms } from "@/queries/message";
import { DashboardLayout } from "@/components/layout";
import { MessageItem, UserItem } from "@/components/shared";
import type { UserItemProps } from "@/types/message";
import { useUserStore } from "@/store/z-store";
import { Seo } from "@/components/shared";
import { useFileHandler } from "@/hooks";
import { cn, getInitials } from "@/lib";

type FormProps = {
	content: string;
	media: File[];
};

const isDev = process.env.NODE_ENV === "development";
const tabs = ["all messages", "unread"];

const initialValues: FormProps = {
	content: "",
	media: [],
};

const Page = () => {
	const [selected, setSelected] = React.useState<UserItemProps | null>(null);
	const [shouldAutoScroll, setShouldAutoScroll] = React.useState(false);
	const [, setIsLoadingOlder] = React.useState(false);
	const [formValues, setFormValues] = React.useState(initialValues);
	const [isTyping, setIsTyping] = React.useState(false);
	const socket = React.useRef<Socket | null>(null);
	const [roomId, setRoomId] = React.useState("");
	const ref = React.useRef<HTMLDivElement>(null);
	const [tab, setTab] = React.useState(tabs[0]);

	const { user } = useUserStore();

	const url = isDev
		? process.env.NEXT_PUBLIC_WSS_URL
		: "wss://classore-be-prod-1.up.railway.app/classore/v1";

	React.useEffect(() => {
		socket.current = io(url, {
			transports: ["websocket"],
		});
		socket.current.on("connect", () => {
			console.info("Socket connected");
		});
		socket.current.on("error", (error) => {
			console.error("Socket error", error);
		});
		socket.current.emit("join_user_rooms", { userId: String(user?.id) });
		socket.current.on("receive_chat_message", (data) => {
			console.log(data);
		});
		socket.current.on("is_typing", () => setIsTyping(true));
		socket.current.on("message_delivered", (data) => {
			console.log(data);
		});

		return () => {
			socket.current?.off("connect");
			socket.current?.off("error");
			socket.current?.off("receive_chat_message");
			socket.current?.off("is_typing");
			socket.current?.off("message_delivered");
			socket.current?.disconnect();
		};
	}, [url, user?.id]);

	const { data: rooms } = useGetUserRooms(String(user?.id));

	const {
		data: messagesData,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isFetchingPreviousPage,
		isLoading,
		refetch,
	} = useGetInfiniteMessages({ roomId, user_id: String(user?.id), limit: 50 });

	const messages = React.useMemo(() => {
		if (!messagesData?.pages) return [];
		return messagesData.pages.flatMap((page) => page.data).reverse();
	}, [messagesData]);

	const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setFormValues({ ...formValues, [e.target.name]: e.target.value });
	};

	const { handleClick, handleFileChange, inputRef } = useFileHandler({
		onValueChange: (files) => {
			setFormValues({ ...formValues, media: files });
		},
		onError: (error) => toast.error(error),
	});

	const options = [
		{ icon: RiVolumeMuteLine, label: "mute chat", destructive: false },
		{ icon: RiSearchLine, label: "search chat", destructive: false },
		{ icon: RiFlagLine, label: "report user", destructive: false },
		{ icon: RiForbid2Line, label: "block user", destructive: true },
	];

	const scrollToBottom = () => {
		if (ref.current) {
			ref.current.scrollTop = ref.current.scrollHeight;
		}
	};

	const checkIfShouldAutoScroll = () => {
		if (!ref.current) return;

		const { scrollTop, scrollHeight, clientHeight } = ref.current;
		const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
		setShouldAutoScroll(isNearBottom);
	};

	// Handle scroll to load older messages
	const handleScroll = React.useCallback(() => {
		if (!ref.current) return;
		const { scrollTop } = ref.current;

		if (scrollTop === 0 && hasNextPage && !isFetchingNextPage) {
			setIsLoadingOlder(true);
			const currentScrollHeight = ref.current.scrollHeight;

			fetchNextPage().then(() => {
				setTimeout(() => {
					if (ref.current) {
						const newScrollHeight = ref.current.scrollHeight;
						ref.current.scrollTop = newScrollHeight - currentScrollHeight;
					}
					setIsLoadingOlder(false);
				}, 100);
			});
		}

		checkIfShouldAutoScroll();
	}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!formValues.content) {
			toast.error("Please enter a message");
			return;
		}
		console.log({ formValues });

		await refetch();
		setFormValues(initialValues);
		setShouldAutoScroll(true);
	};

	React.useEffect(() => {
		if (shouldAutoScroll) {
			scrollToBottom();
		}
	}, [shouldAutoScroll, messages]);

	React.useEffect(() => {
		setShouldAutoScroll(true);
		setTimeout(scrollToBottom, 100);
	}, [selected]);

	React.useEffect(() => {
		const chatElement = ref.current;
		if (chatElement) {
			chatElement.addEventListener("scroll", handleScroll);
			return () => chatElement.removeEventListener("scroll", handleScroll);
		}
	}, [handleScroll]);

	return (
		<>
			<Seo title="Messages" />
			<DashboardLayout>
				<div className="flex h-full w-full items-start">
					<aside className="h-full w-[325px] border-r border-neutral-200">
						<div className="flex h-[76px] w-full items-center gap-x-2 border-b border-neutral-200 px-5">
							{tabs.map((t) => (
								<button
									key={t}
									onClick={() => setTab(t)}
									className={cn(
										"h-9 flex-1 rounded-md text-sm font-medium capitalize",
										tab === t ? "bg-neutral-300 text-primary-400" : "text-neutral-500"
									)}>
									{t}
								</button>
							))}
						</div>
						<div className="h-[calc(100%-76px)] w-full overflow-y-auto">
							{!rooms?.length ? (
								<div className="grid h-full w-full place-items-center">
									<p className="text-sm text-neutral-500">No chats</p>
								</div>
							) : (
								<>
									{rooms.map((room, index) => (
										<UserItem
											key={index}
											onSelect={setSelected}
											onSelectRoom={setRoomId}
											selected={selected}
											room={room}
										/>
									))}
								</>
							)}
						</div>
					</aside>
					<div className="h-full flex-1">
						<div className="h-[76px] w-full px-5">
							{selected && (
								<div className="flex h-full w-full items-center justify-between">
									<div className="flex items-center gap-x-2">
										<Avatar className="size-10 rounded-md border border-neutral-200 bg-primary-500">
											<AvatarImage src={selected?.profile_picture || ""} className="objec" />
											<AvatarFallback className="bg-primary-500 text-sm uppercase text-white">
												{getInitials(`${selected.first_name} ${selected.last_name}`)}
											</AvatarFallback>
										</Avatar>
										<div>
											<p className="text-sm font-medium capitalize">
												{selected?.first_name} {selected?.last_name}
											</p>
											<p className="text-xs text-neutral-500">{isTyping ? "typing..." : selected?.email}</p>
										</div>
									</div>
									<Popover>
										<PopoverTrigger asChild>
											<button className="grid size-8 place-items-center rounded-md bg-neutral-100 hover:bg-neutral-200">
												<RiMore2Line className="size-5 text-neutral-500" />
											</button>
										</PopoverTrigger>
										<PopoverContent className="mr-10 w-[180px] space-y-2 p-2">
											{options.map(({ destructive, icon: Icon, label }, index) => (
												<button
													key={index}
													className={cn(
														"flex h-8 w-full items-center gap-x-2 rounded-md px-3 text-sm capitalize transition-colors duration-300",
														destructive
															? "text-red-500 hover:bg-red-100"
															: "text-neutral-500 hover:bg-neutral-200"
													)}>
													<Icon className="size-4" /> {label}
												</button>
											))}
										</PopoverContent>
									</Popover>
								</div>
							)}
						</div>
						<div
							ref={ref}
							className="flex h-[calc(100%-184px)] w-full flex-col gap-y-5 overflow-y-auto bg-[#F6F8FA] px-5">
							{isFetchingNextPage && (
								<div className="flex justify-center py-2">
									<div className="text-sm text-neutral-500">Loading older messages...</div>
								</div>
							)}
							{isLoading ? (
								<div className="flex h-full items-center justify-center">
									<div className="text-sm text-neutral-500">Loading messages...</div>
								</div>
							) : messages.length > 0 ? (
								messages.map((message) => <MessageItem key={message.id} message={message} />)
							) : (
								<div className="flex h-full items-center justify-center">
									<div className="text-sm text-neutral-500">No messages yet. Start the conversation!</div>
								</div>
							)}
							{isFetchingPreviousPage && (
								<div className="flex justify-center py-2">
									<div className="text-sm text-neutral-500">Loading new messages...</div>
								</div>
							)}
						</div>
						<div className="h-[108px] w-full px-8 py-2">
							<form
								onSubmit={handleSubmit}
								className="flex h-full w-full items-center gap-x-4 rounded-lg bg-neutral-200 px-4 py-1">
								<div className="h-full flex-1">
									<textarea
										value={formValues.content}
										name="content"
										onChange={handleChange}
										className="h-full w-full resize-none rounded-lg border-0 bg-transparent text-sm outline-none"
										placeholder="Type your message..."
									/>
									<input
										type="file"
										ref={inputRef}
										onChange={handleFileChange}
										className="sr-only hidden appearance-none"
										multiple
										accept="image/*,video/*"
									/>
								</div>
								<div className="flex items-center gap-x-4">
									<button onClick={handleClick} className="size-6" type="button">
										<RiImageAddLine className="text-neutral-500" />
									</button>
									<button className="size-6" type="button">
										<RiEmojiStickerLine className="text-neutral-500" />
									</button>
									<button className="size-6" type="submit">
										<RiSendPlaneLine className="text-neutral-500" />
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			</DashboardLayout>
		</>
	);
};

export default Page;
