import React from "react"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
	return (
		<div>
			<aside></aside>
			<div>
				<div></div>
				{children}
			</div>
		</div>
	)
}
