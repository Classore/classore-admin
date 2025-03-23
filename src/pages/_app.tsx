import "@/styles/globals.css";
import type { AppProps } from "next/app";

import { QueryProvider, SSRProvider } from "@/providers";
import { Toaster } from "@/components/ui/sonner";

export default function App({ Component, pageProps }: AppProps) {
	return (
		<QueryProvider>
			<SSRProvider>
				<Component {...pageProps} />
				<Toaster position="top-right" closeButton />
			</SSRProvider>
		</QueryProvider>
	);
}
