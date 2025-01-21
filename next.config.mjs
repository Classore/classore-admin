/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	transpilePackages: ["rc-picker", "dayjs"],
	images: {
		remotePatterns: [
			{ protocol: "https", hostname: "i.imgur.com" },
			{ protocol: "https", hostname: "images.unsplash.com" },
			{ protocol: "https", hostname: "res.cloudinary.com" },
			{ protocol: "https", hostname: "lh3.googleusercontent.com" },
			{ protocol: "https", hostname: "avatars.githubusercontent.com" },
		],
	},
};

export default nextConfig;
