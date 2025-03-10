import { DashboardLayout } from "@/components/layout";
import { Seo } from "@/components/shared";
import { TiptapEditor } from "@/components/ui/tiptap-editor";

const Page = () => {
	return (
		<>
			<Seo title="Settings" />
			<DashboardLayout>
				<div className="grid h-full w-full place-items-center">
					{/* <div className="flex flex-col items-center gap-y-2">
						<h3 className="text-4xl font-semibold text-primary-400">Still Cooking</h3>
						<p>We&apos;re working on this module. Please check back later.</p>
					</div> */}

					<TiptapEditor value="<p>Hello World!</p>" onChange={(val) => console.log(val)} />
				</div>
			</DashboardLayout>
		</>
	);
};

export default Page;
