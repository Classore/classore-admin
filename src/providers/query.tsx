import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { toast } from "sonner";
import React from "react";

import { IsHttpError, httpErrorhandler } from "@/lib";

const staleTime = 1000 * 60; // 1 minute

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime,
			refetchOnWindowFocus: false,
			refetchOnMount: false,
		},
		mutations: {
			onError: (error) => {
				console.error(error);
				const isHttpError = IsHttpError(error);
				if (isHttpError) {
					const { message } = httpErrorhandler(error);
					toast.error(message);
					return;
				} else {
					toast.error(error.message ?? "Something went wrong");
				}
			},
		},
	},
});

export const QueryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	return (
		<QueryClientProvider client={queryClient}>
			{children}
			<ReactQueryDevtools />
		</QueryClientProvider>
	);
};
