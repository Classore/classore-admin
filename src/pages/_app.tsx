import "@/styles/globals.css";
import type { AppProps } from "next/app";

import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryProvider, SSRProvider } from "@/providers";
import { Toaster } from "@/components/ui/toaster";

export default function App({ Component, pageProps }: AppProps) {
	return (
		<QueryProvider>
			<SSRProvider>
				<Component {...pageProps} />
				<Sonner position="top-right" />
				<Toaster />
			</SSRProvider>
		</QueryProvider>
	);
}
