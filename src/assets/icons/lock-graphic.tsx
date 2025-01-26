import type { SVGProps } from "react";

export const LockGraphic = (props: SVGProps<SVGSVGElement>) => (
	<svg xmlns="http://www.w3.org/2000/svg" width={76} height={76} fill="none" {...props}>
		<g filter="url(#a)">
			<g clipPath="url(#b)">
				<rect
					width={64}
					height={64}
					x={6}
					y={4}
					fill="url(#c)"
					rx={32}
					shapeRendering="crispEdges"
				/>
				<path
					stroke="url(#d)"
					strokeWidth={0.75}
					opacity={0.05}
					d="M6 8V7C6 3.68629 8.68629 1 12 1C15.3137 1 18 3.68629 18 7V8H20C20.5523 8 21 8.44772 21 9V21C21 21.5523 20.5523 22 20 22H4C3.44772 22 3 21.5523 3 21V9C3 8.44772 3.44772 8 4 8H6ZM19 10H5V20H19V10ZM11 15.7324C10.4022 15.3866 10 14.7403 10 14C10 12.8954 10.8954 12 12 12C13.1046 12 14 12.8954 14 14C14 14.7403 13.5978 15.3866 13 15.7324V18H11V15.7324ZM8 8H16V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V8Z"
				/>
				<g filter="url(#e)">
					<rect width={40} height={40} x={18} y={16} fill="#fff" rx={20} />
					<rect
						width={38}
						height={38}
						x={19}
						y={17}
						stroke="#6F42C1"
						strokeOpacity={0.2}
						strokeWidth={2}
						rx={19}
					/>
					<g clipPath="url(#f)" filter="url(#g)" opacity={0.8}>
						<path
							stroke="#6F42C1"
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1.5}
							d="M32 32h12v8H32v-8zm2-2v-2a4 4 0 014-4v0a4 4 0 014 4v2m-5 4v4"
						/>
					</g>
				</g>
			</g>
			<rect
				width={62}
				height={62}
				x={7}
				y={5}
				stroke="#fff"
				strokeWidth={2}
				rx={31}
				shapeRendering="crispEdges"
			/>
		</g>
		<defs>
			<filter
				id="a"
				width={75.6}
				height={75.6}
				x={0.2}
				y={0.2}
				colorInterpolationFilters="sRGB"
				filterUnits="userSpaceOnUse">
				<feFlood floodOpacity={0} result="BackgroundImageFix" />
				<feColorMatrix
					in="SourceAlpha"
					result="hardAlpha"
					values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
				/>
				<feOffset dy={2} />
				<feGaussianBlur stdDeviation={2.9} />
				<feComposite in2="hardAlpha" operator="out" />
				<feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
				<feBlend in2="BackgroundImageFix" result="effect1_dropShadow_340_67853" />
				<feBlend in="SourceGraphic" in2="effect1_dropShadow_340_67853" result="shape" />
			</filter>
			<filter
				id="e"
				width={44}
				height={44}
				x={16}
				y={16}
				colorInterpolationFilters="sRGB"
				filterUnits="userSpaceOnUse">
				<feFlood floodOpacity={0} result="BackgroundImageFix" />
				<feColorMatrix
					in="SourceAlpha"
					result="hardAlpha"
					values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
				/>
				<feOffset dy={2} />
				<feGaussianBlur stdDeviation={1} />
				<feComposite in2="hardAlpha" operator="out" />
				<feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
				<feBlend in2="BackgroundImageFix" result="effect1_dropShadow_340_67853" />
				<feBlend in="SourceGraphic" in2="effect1_dropShadow_340_67853" result="shape" />
			</filter>
			<filter
				id="g"
				width={16}
				height={17.333}
				x={30}
				y={28}
				colorInterpolationFilters="sRGB"
				filterUnits="userSpaceOnUse">
				<feFlood floodOpacity={0} result="BackgroundImageFix" />
				<feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
				<feColorMatrix
					in="SourceAlpha"
					result="hardAlpha"
					values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
				/>
				<feOffset dy={1.333} />
				<feGaussianBlur stdDeviation={3.233} />
				<feComposite in2="hardAlpha" k2={-1} k3={1} operator="arithmetic" />
				<feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
				<feBlend in2="shape" result="effect1_innerShadow_340_67853" />
			</filter>
			<clipPath id="b">
				<rect width={64} height={64} x={6} y={4} fill="#fff" rx={32} />
			</clipPath>
			<clipPath id="f">
				<path fill="#fff" d="M30 28h16v16H30z" />
			</clipPath>
			<radialGradient
				id="d"
				cx={0}
				cy={0}
				r={1}
				gradientTransform="matrix(0 133.266 -130.274 0 37.698 35.688)"
				gradientUnits="userSpaceOnUse">
				<stop stopColor="#6F42C1" />
				<stop offset={1} stopColor="#6F42C1" stopOpacity={0.1} />
			</radialGradient>
			<linearGradient id="c" x1={38} x2={38} y1={4} y2={68} gradientUnits="userSpaceOnUse">
				<stop stopColor="#44474E" stopOpacity={0.13} />
				<stop offset={1} stopColor="#C2D6FF" stopOpacity={0} />
			</linearGradient>
		</defs>
	</svg>
);
