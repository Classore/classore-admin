import { Check, ChevronDown } from "@untitled-ui/icons-react"
import { PopoverClose } from "@radix-ui/react-popover"
import * as React from "react"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "./button"
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command"

type Option = {
	label: string
	value: string
}

type Options = Option[]

type MultiSelectProps = {
	placeholder?: string
	label?: string
	options: Options
}

export const MultiSelect = ({ label, placeholder, options }: MultiSelectProps) => {
	const inputRef = React.useRef<HTMLInputElement>(null)
	const [openCombobox, setOpenCombobox] = React.useState(false)
	const [selectedValues, setSelectedValues] = React.useState<Options>([])

	const toggleOption = (option: Option) => {
		setSelectedValues((currentOptions) =>
			!currentOptions.includes(option)
				? [...currentOptions, option]
				: currentOptions.filter((l) => l.value !== option.value)
		)
		inputRef?.current?.focus()
	}

	const onComboboxOpenChange = (value: boolean) => {
		inputRef.current?.blur() // HACK: otherwise, would scroll automatically to the bottom of page
		setOpenCombobox(value)
	}

	return (
		<label className="flex flex-col gap-1.5 font-body">
			{label ? <p className="text-sm text-neutral-400 dark:text-neutral-50">{label}</p> : null}

			<Popover open={openCombobox} onOpenChange={onComboboxOpenChange}>
				<PopoverTrigger asChild>
					<button
						type="button"
						aria-expanded={openCombobox}
						data-placeholder={selectedValues.length === 0}
						className="flex w-full items-center justify-between rounded-md border border-neutral-200 bg-white px-4 py-3 text-neutral-900 transition-all focus:border-primary-300 focus:shadow-primary focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder='true']:text-neutral-300 [&>span]:line-clamp-1">
						<span className="truncate">
							{selectedValues.length
								? selectedValues.map(({ label }) => label).join(", ")
								: (placeholder ?? "Select values...")}
						</span>

						<ChevronDown className="text-neutral-400" />
					</button>
				</PopoverTrigger>

				<PopoverContent className="w-full p-0">
					<Command loop className="min-w-[var(--radix-popover-trigger-width)]">
						<CommandInput ref={inputRef} placeholder="Search framework..." />

						<CommandList>
							<CommandEmpty>No value(s) found...</CommandEmpty>
							<CommandGroup>
								{options.map((option) => {
									const isActive = selectedValues.includes(option)

									return (
										<CommandItem
											key={option.value}
											value={option.value}
											onSelect={() => toggleOption(option)}>
											<span className="flex-1">{option.label}</span>

											<div
												className={`absolute right-4 ml-auto flex size-4 items-center justify-center rounded border-2 transition-all group-data-[selected='true']:border-primary-300 ${isActive ? "border-primary-300" : "border-neutral-200"}`}>
												<Check
													width={5}
													height={5}
													className={`text-xs transition-opacity ${isActive ? "text-primary-300" : "text-transparent"}`}
												/>
											</div>
										</CommandItem>
									)
								})}
							</CommandGroup>

							<PopoverClose asChild>
								<div className="sticky bg-white px-4 py-3">
									<Button
										className="bg-primary-50 text-sm text-primary-300 hover:bg-primary-100"
										type="button"
										variant="ghost">
										Done
									</Button>
								</div>
							</PopoverClose>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
		</label>
	)
}
