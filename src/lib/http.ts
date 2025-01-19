import type { HttpError } from "@/types";

// Define environment type for better type safety
type Environment = "development" | "production" | "test";

// Get current environment
const getEnvironment = (): Environment => {
	const env = process.env.NODE_ENV || "development";
	return env as Environment;
};

// Main error handler function
export const httpErrorhandler = (error: HttpError) => {
	const environment = getEnvironment();
	const errorData = error.response.data;

	// Only log in development/test environments
	if (environment !== "production") {
		console.error("=== Error Details ===");
		console.error("Status:", errorData.status);
		console.error("Error Code:", errorData.errorCode);
		console.error("Message:", errorData.message);
		console.error("Error:", errorData.error);
		console.error("==================");
	}

	// Format the error message
	const formattedMessage = Array.isArray(errorData.message)
		? errorData.message.join(". ")
		: errorData.message;

	// Return a standardized error response
	return {
		message: formattedMessage,
		code: errorData.errorCode,
		status: errorData.status,
		success: false,
	};
};

export const executeWithErrorHandling = async <T>(
	operation: () => Promise<T>
): Promise<T> => {
	try {
		return await operation();
	} catch (error) {
		if (IsHttpError(error)) {
			throw httpErrorhandler(error);
		}
		throw {
			message: "An unexpected error occurred",
			code: "UNKNOWN_ERROR",
			status: "500",
			success: false,
		};
	}
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const IsHttpError = (error: any): error is HttpError => {
	return error?.response?.data?.errorCode !== undefined;
};

export const createFormDataFromObject = <T extends Record<string, any>>(
	payload: T
): FormData => {
	const formData = new FormData();

	if (!payload) {
		return formData;
	}

	Object.entries(payload).forEach(([key, value]) => {
		if (value === null || value === undefined) {
			return;
		}

		if (Array.isArray(value)) {
			if (value.length === 0) {
				return;
			}
			value.forEach((item) => {
				if (item !== null && item !== undefined) {
					// Handle different types of array items
					if (item instanceof File) {
						formData.append(key, item);
					} else if (typeof item === "object") {
						formData.append(key, JSON.stringify(item));
					} else {
						formData.append(key, String(item));
					}
				}
			});
		} else if (value instanceof File) {
			formData.append(key, value);
		} else if (value instanceof Date) {
			formData.append(key, value.toISOString());
		} else if (typeof value === "object") {
			formData.append(key, JSON.stringify(value));
		} else {
			formData.append(key, String(value));
		}
	});

	return formData;
};
