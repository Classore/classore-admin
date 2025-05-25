export const requiredEnvs = [
	"API_URL",
	"WSS_URL",
	"CLOUDINARY_URL",
	"GOOGLE_CLIENT_EMAIL",
	"GOOGLE_CLIENT_ID",
	"GOOGLE_PROJECT_ID",
	"GOOGLE_PRIVATE_KEY",
	"GOOGLE_PRIVATE_KEY_ID",
	"NEXT_PUBLIC_API_URL",
	"NEXT_PUBLIC_CLOUDINARY_API_KEY",
	"NEXT_PUBLIC_CLOUDINARY_API_SECRET",
	"NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME",
	"NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET",
	"NEXT_PUBLIC_CLOUDINARY_URL",
	"NEXT_PUBLIC_NODE_ENV",
	"NEXT_PUBLIC_WSS_URL",
	"NODE_ENV",
	"TESTING",
] as const;

type RequiredEnvs = (typeof requiredEnvs)[number];

declare global {
	namespace NodeJS {
		interface ProcessEnv extends Record<RequiredEnvs, string> {
			readonly API_URL: string;
			readonly CLOUDINARY_URL: string;
			readonly GOOGLE_CLIENT_EMAIL: string;
			readonly GOOGLE_CLIENT_ID: string;
			readonly GOOGLE_PROJECT_ID: string;
			readonly GOOGLE_PRIVATE_KEY: string;
			readonly GOOGLE_PRIVATE_KEY_ID: string;
			readonly NEXT_PUBLIC_API_URL: string;
			readonly NEXT_PUBLIC_CLOUDINARY_API_KEY: string;
			readonly NEXT_PUBLIC_CLOUDINARY_API_SECRET: string;
			readonly NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: string;
			readonly NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: string;
			readonly NEXT_PUBLIC_CLOUDINARY_URL: string;
			readonly NEXT_PUBLIC_NODE_ENV: "development" | "production";
			readonly NODE_ENV: "development" | "production" | "test";
			readonly TESTING: string;
		}
	}
}

export {};
