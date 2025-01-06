import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React from "react";

const staleTime = 1000 * 60; // 1 minute

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime,
			refetchOnWindowFocus: false,
			refetchOnMount: false,
		},
		mutations: {},
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
