export const requiredEnvs = [
	"API_URL",
	"GOOGLE_CLIENT_EMAIL",
	"GOOGLE_CLIENT_ID",
	"GOOGLE_PROJECT_ID",
	"GOOGLE_PRIVATE_KEY",
	"GOOGLE_PRIVATE_KEY_ID",
	"NEXT_PUBLIC_API_URL",
	"NODE_ENV",
	"TESTING",
] as const;

type RequiredEnvs = (typeof requiredEnvs)[number];

declare global {
	namespace NodeJS {
		interface ProcessEnv extends Record<RequiredEnvs, string> {
			readonly API_URL: string;
			readonly GOOGLE_CLIENT_EMAIL: string;
			readonly GOOGLE_CLIENT_ID: string;
			readonly GOOGLE_PROJECT_ID: string;
			readonly GOOGLE_PRIVATE_KEY: string;
			readonly GOOGLE_PRIVATE_KEY_ID: string;
			readonly NEXT_PUBLIC_API_URL: string;
			readonly NODE_ENV: "development" | "production" | "test";
			readonly TESTING: string;
		}
	}
}

export {};
