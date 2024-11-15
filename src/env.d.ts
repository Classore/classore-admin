export const requiredEnvs = ["API_URL", "NEXT_PUBLIC_API_URL", "NODE_ENV"] as const

type RequiredEnvs = (typeof requiredEnvs)[number]

declare global {
	namespace NodeJS {
		interface ProcessEnv extends Record<RequiredEnvs, string> {
			readonly API_URL: string
			readonly NEXT_PUBLIC_API_URL: string
			readonly NODE_ENV: "development" | "production" | "test"
		}
	}
}

export {}
