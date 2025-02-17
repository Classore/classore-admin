import "@/styles/globals.css";
import type { AppProps } from "next/app";

import { Toaster } from "@/components/ui/sonner";
import { QueryProvider, SSRProvider } from "@/providers";

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
