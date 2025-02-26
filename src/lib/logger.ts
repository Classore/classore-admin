/* eslint-disable @typescript-eslint/no-explicit-any */

export class Logger {
	public static LogLevel = {
		DEBUG: "DEBUG",
		INFO: "INFO",
		ERROR: "ERROR",
		SUCCESS: "SUCCESS",
	} as const;

	private static LogStyles = {
		DEBUG: "color: #f6f5f4",
		INFO: "color: #50a3e3",
		ERROR: "color: #f44336",
		SUCCESS: "color: #71e375",
	};

	private static LogColor(level: keyof typeof Logger.LogLevel, message: string): [string, string] {
		const style = this.LogStyles[level] || "";
		return [`%c${message}`, style];
	}

	private static formatLog(
		level: keyof typeof Logger.LogLevel,
		message: string,
		args: any[]
	): { formatted: string; style: string } {
		const timestamp = new Date().toISOString();
		const logObject = {
			timestamp,
			level,
			message,
			...(args.length > 0 && { details: args.length === 1 ? args[0] : args }),
		};

		const formatted = JSON.stringify(logObject, null, 2);
		const [coloredMessage, style] = this.LogColor(level, formatted);

		return {
			formatted: coloredMessage,
			style,
		};
	}

	public static log(message: string, ...args: any[]): void {
		const { formatted, style } = this.formatLog(this.LogLevel.DEBUG, message, args);
		console.log(formatted, style);
	}

	public static info(message: string, ...args: any[]): void {
		const { formatted, style } = this.formatLog(this.LogLevel.INFO, message, args);
		console.info(formatted, style);
	}

	public static error(message: string, ...args: any[]): void {
		const { formatted, style } = this.formatLog(this.LogLevel.ERROR, message, args);
		console.error(formatted, style);
	}

	public static success(message: string, ...args: any[]): void {
		const { formatted, style } = this.formatLog(this.LogLevel.SUCCESS, message, args);
		console.info(formatted, style);
	}
}
