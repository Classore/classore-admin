import { RiDeleteBinLine, RiLoaderLine } from "@remixicon/react"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

import { DeleteWaitlistUser } from "@/queries"
import { queryClient } from "@/providers"

interface Props {
	id: string
}

export const DeleteAction = ({ id }: Props) => {
	const { isPending, mutateAsync } = useMutation({
		mutationFn: (id: string) => DeleteWaitlistUser(id),
		mutationKey: ["delete-waitlist-user", id],
		onSuccess: () => {
			toast.success("User deleted successfully")
			queryClient.invalidateQueries({ queryKey: ["get-waitlist"] })
		},
		onError: (error) => {
			console.error(error)
			toast.error("Something went wrong")
		},
	})

	return (
		<div className="flex items-center justify-center">
			<button onClick={() => mutateAsync(id)} disabled={isPending}>
				{isPending ? (
					<RiLoaderLine className="size-5 animate-spin" />
				) : (
					<RiDeleteBinLine className="size-5 text-red-500" />
				)}
			</button>
		</div>
	)
}
