import React from "react";
import { IconProps } from "./SharedProps";

const DownloadIcon: React.FC<IconProps> = ({
	width = 24,
	height = 24,
	color = "currentColor",
}) => {
	return (
		<svg
			width={width}
			height={height}
			viewBox="0 0 24 24"
			fill="none"
			stroke={color}
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
		>
			<path d="M7.8 11.5l2.1 2.3 2.1 2.3V3m0 13.1l2.1-2.3 2.1-2.3m4.8 3.6V19a2 2 0 01-2 2H5a2.006 2.006 0 01-2-2v-3.9"></path>
		</svg>
	);
};

export default DownloadIcon;
