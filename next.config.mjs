/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	transpilePackages: [
		"rc-picker",
		"dayjs",
		"rc-util",
		"rc-picker",
		"@babel/runtime",
		"antd",
		"@ant-design",
		"rc-pagination",
		"rc-calendar",
		"rc-select",
		"rc-time-picker",
	],
	images: {
		remotePatterns: [
			{ protocol: "https", hostname: "i.imgur.com" },
			{ protocol: "https", hostname: "images.unsplash.com" },
			{ protocol: "https", hostname: "res.cloudinary.com" },
			{ protocol: "https", hostname: "lh3.googleusercontent.com" },
			{ protocol: "https", hostname: "avatars.githubusercontent.com" },
		],
	},
	webpack: (config, { isServer }) => {
		// Handle ES Modules
		config.module.rules.push({
			test: /\.m?js$/,
			type: "javascript/auto",
			resolve: {
				fullySpecified: false,
			},
		});

		// Handle node_modules that use ES modules
		config.resolve.extensionAlias = {
			".js": [".js", ".ts", ".tsx"],
			".mjs": [".mjs", ".mts", ".mtsx"],
		};

		if (!isServer) {
			config.resolve.fallback = {
				...config.resolve.fallback,
				module: false,
			};
		}

		return config;
	},
};

export default nextConfig;
