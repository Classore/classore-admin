import type { HttpError } from "@/types";
import { Logger } from "./logger";

type Environment = "development" | "production" | "test";

const getEnvironment = (): Environment => {
	const env = process.env.NODE_ENV || "development";
	return env as Environment;
};

export const httpErrorhandler = (error: HttpError) => {
	const environment = getEnvironment();
	const errorData = error.response.data;

	if (environment !== "production") {
		Logger.error("Http Error", error);
	}

	const formattedMessage = Array.isArray(errorData.message)
		? errorData.message.join(". ")
		: errorData.message;

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createFormDataFromObject = <T extends Record<string, any>>(
	payload: T
): FormData => {
	const formData = new FormData();

	if (!payload) {
		return formData;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const isEmptyValue = (value: any): boolean => {
		if (value === null || value === undefined) return true;
		if (typeof value === "string" && value.trim() === "") return true;
		if (Array.isArray(value) && value.length === 0) return true;
		if (typeof value === "object" && Object.keys(value).length === 0) return true;

		return false;
	};

	Object.entries(payload).forEach(([key, value]) => {
		if (isEmptyValue(value)) {
			return;
		}

		if (Array.isArray(value)) {
			const filteredArray = value.filter((item) => !isEmptyValue(item));

			filteredArray.forEach((item) => {
				if (item instanceof File) {
					formData.append(key, item);
				} else if (typeof item === "object") {
					formData.append(key, JSON.stringify(item));
				} else {
					formData.append(key, String(item));
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

export const validateUrl = (url: string) => {
	const urlPattern = new RegExp(
		"^(https?:\\/\\/)?" + // validate protocol
			"((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // validate domain name
			"((\\d{1,3}\\.){3}\\d{1,3}))" + // validate OR ip (v4) address
			"(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // validate port and path
			"(\\?[;&a-z\\d%_.~+=-]*)?" + // validate query string
			"(\\#[-a-z\\d_]*)?$",
		"i"
	); // validate fragment locator
	return !!urlPattern.test(url);
};
