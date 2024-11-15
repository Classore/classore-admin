// WIP: DO NOT USE (for now at least 😂)
import { ChevronDown } from "@untitled-ui/icons-react"
import * as React from "react"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command"

const frameworks = [
	{
		value: "next.js",
		label: "Next.js",
	},
	{
		value: "sveltekit",
		label: "SvelteKit",
	},
	{
		value: "nuxt.js",
		label: "Nuxt.js",
	},
	{
		value: "remix",
		label: "Remix",
	},
	{
		value: "astro",
		label: "Astro",
	},
]

export const Combobox = () => {
	const [open, setOpen] = React.useState(false)
	const [value, setValue] = React.useState("")

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button
					type="button"
					role="combobox"
					aria-expanded={open}
					aria-controls="framework-list"
					className="flex items-center justify-between rounded-md border border-neutral-200 bg-white px-4 py-3 transition-all focus:border-primary-300 focus:shadow-primary focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-neutral-300 [&>span]:line-clamp-1">
					{value
						? frameworks.find((framework) => framework.value === value)?.label
						: "Select framework..."}
					<ChevronDown className="opacity-50" />
				</button>
			</PopoverTrigger>

			<PopoverContent>
				<Command className="w-96">
					<CommandInput placeholder="Search here..." />

					<CommandList id="framework-list">
						<CommandEmpty>No framework found.</CommandEmpty>
						<CommandGroup>
							{frameworks.map((framework) => (
								<CommandItem
									key={framework.value}
									value={framework.value}
									onSelect={(currentValue) => {
										setValue(currentValue === value ? "" : currentValue)
										setOpen(false)
									}}>
									{framework.label}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	)
}
