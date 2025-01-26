import type { SVGProps } from "react";

export const AuthGraphic = (props: SVGProps<SVGSVGElement>) => (
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
					d="M-60.111-97.578V162.97M-42.34-97.578V162.97m17.773-260.548V162.97M-6.793-97.578V162.97M10.98-97.578V162.97M28.752-97.578V162.97M46.525-97.578V162.97M64.298-97.578V162.97M82.07-97.578V162.97M99.843-97.578V162.97m17.773-260.548V162.97m17.773-260.548V162.97m-227.965 5.983h260.548M-92.576 151.24h260.548m-260.548-17.773h260.548m-260.548-17.773h260.548M-92.576 97.922h260.548M-92.576 80.149h260.548M-92.576 62.376h260.548M-92.576 44.604h260.548M-92.576 26.83h260.548M-92.576 9.058h260.548M-92.576-8.715h260.548M-92.576-26.487h260.548M-92.576-44.26h260.548M-92.576-62.033h260.548M-92.576-79.805h260.548M-92.576-97.578h260.548"
					opacity={0.05}
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
							d="M33 42.665v-3.333m0-6.667v-3.333m-1.666 1.667h3.333m-3.333 10h3.333m4-11-1.156 3.006c-.188.488-.282.733-.428.938-.13.183-.289.342-.471.471-.206.147-.45.24-.939.429l-3.006 1.156 3.006 1.156c.489.188.733.282.939.428.182.13.341.289.471.471.146.206.24.45.428.939l1.156 3.006 1.156-3.006c.188-.489.282-.733.429-.939.13-.182.288-.341.47-.471.206-.146.45-.24.94-.428l3.005-1.156-3.006-1.156c-.488-.188-.733-.282-.938-.429a2.002 2.002 0 0 1-.471-.47c-.147-.206-.24-.45-.429-.94L38.667 30Z"
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
