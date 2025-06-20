import Image from "next/image";
import React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import type { MessageProps } from "@/types/message";
import { useUserStore } from "@/store/z-store";
import { cn, getInitials } from "@/lib";
import { format } from "date-fns";

interface Props {
	message: MessageProps;
}

export const MessageItem = ({ message }: Props) => {
	const { user } = useUserStore();

	const isSender = user?.id === message.sender.id;
	const initials = getInitials(`${message.sender.first_name} ${message.sender.last_name}`);

	return (
		<div
			className={cn(
				"flex w-1/2 items-start gap-x-2",
				isSender ? "flex-row-reverse self-end" : "self-start"
			)}>
			<Avatar className="size-10 rounded-lg">
				<AvatarImage src={message.sender.profile_image} />
				<AvatarFallback>{initials}</AvatarFallback>
			</Avatar>
			<div
				className={cn(
					"w-fit space-y-2 rounded-lg p-3",
					isSender ? "rounded-tr-none bg-primary-100 text-right" : "rounded-tl-none bg-secondary-100"
				)}>
				<p className="text-sm">{message.content}</p>
				{message.media.length > 0 && (
					<div className="flex w-full items-center gap-x-2">
						{message.media.map((image, index) => (
							<Image src={image} alt={`image-${index}`} key={index} width={40} height={40} />
						))}
					</div>
				)}
				<p className="text-[10px] text-neutral-500">{format(message.updatedOn, "HH:mm a")}</p>
			</div>
		</div>
	);
};
