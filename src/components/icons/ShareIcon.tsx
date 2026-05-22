import React from "react";
import { IconProps } from "./SharedProps";

const ShareIcon: React.FC<IconProps> = ({
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
			<path d="M21 5.841a2.8 2.8 0 11-2.8-2.8 2.8 2.8 0 012.8 2.8zM18.2 15.4a2.8 2.8 0 102.8 2.8 2.8 2.8 0 00-2.8-2.8zM5.8 9.22a2.8 2.8 0 102.8 2.8 2.8 2.8 0 00-2.8-2.8zm9.6-2.2l-6.8 3.551m7 6.6l-7-3.8"></path>
		</svg>
	);
};

export default ShareIcon;
