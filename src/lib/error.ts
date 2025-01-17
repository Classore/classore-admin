type FormErrors<T> = {
	[P in keyof T]?: string | string[] | FormErrors<T[P]>;
};

type TouchedFields<T> = {
	[P in keyof T]?: boolean | TouchedFields<T[P]>;
};

/**
 * @description Handles form errors and touched fields for a Formik form.
 *
 * @param errors - The form errors object.
 * @param touched - The touched fields object.
 * @param options - Optional configuration options.
 * @param options.returnFirst - Whether to return the first error or all errors.
 * @param options.delimiter - The delimiter to use when returning multiple errors.
 * @returns A string or array of error messages, or `undefined` if there are no errors.
 */
export const formikErrorHandler = <T extends object>(
	errors: FormErrors<T>,
	touched: TouchedFields<T>,
	options: {
		returnFirst?: boolean;
		delimiter?: string;
	} = { returnFirst: true, delimiter: "\n" }
): string | string[] | undefined => {
	const allErrors: string[] = [];

	const processErrors = (
		currentErrors: FormErrors<any>,
		currentTouched: TouchedFields<any>,
		parentKey?: string
	): void => {
		for (const [key, value] of Object.entries(currentErrors)) {
			const fullKey = parentKey ? `${parentKey}.${key}` : key;
			const isTouched = currentTouched[key];

			if (!isTouched) continue;

			if (typeof value === "string") {
				if (options.returnFirst) {
					allErrors.push(value);
					return;
				}
				allErrors.push(value);
			} else if (Array.isArray(value)) {
				allErrors.push(...value.filter(Boolean));
			} else if (value && typeof value === "object") {
				processErrors(value, currentTouched[key] as TouchedFields<any>, fullKey);
			}
		}
	};

	processErrors(errors, touched);

	if (allErrors.length === 0) {
		return undefined;
	}

	return options.returnFirst
		? allErrors.reverse()[0]
		: options.delimiter
			? allErrors.join(options.delimiter)
			: allErrors;
};
