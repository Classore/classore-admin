import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import React from "react";

import { solutionIllustration, testingIllustration } from "@/assets/illustrations";

type Screen = "signin" | "forgot-password";

const illustration: Record<Screen, StaticImageData> = {
	"forgot-password": solutionIllustration,
	signin: testingIllustration,
};

export default function AuthLayout({
	children,
	screen,
}: {
	children: React.ReactNode;
	screen: Screen;
}) {
	return (
		<main className="grid h-screen w-screen grid-cols-5">
			<aside className="sticky top-0 col-span-2 hidden h-dvh flex-col gap-12 self-start bg-primary-100 p-10 pl-20 lg:flex">
				<Link href="/" className="relative h-[30px] w-[135px]">
					<Image src="/assets/images/classore.png" alt="classore" fill sizes="100%" />
				</Link>
				<h1 className="font-body text-4xl font-bold text-neutral-500">
					Learning without limits, right where you are with{" "}
					<span className="text-secondary-300">Classore</span>
				</h1>
				<Image
					src={illustration[screen]}
					alt="online learning illustration"
					className="absolute -right-11 bottom-0 max-w-md"
				/>
			</aside>
			<div className="col-span-3 mx-auto min-h-dvh bg-white px-6 py-10 lg:mx-0 lg:px-32 lg:py-6">
				{children}
			</div>
		</main>
	);
}
