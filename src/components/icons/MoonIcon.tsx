import { IconProps } from "./SharedProps";

function MoonIcon({ color = "#000", height = 24, width = 24 }: IconProps) {
	return (
		<svg
			width={width}
			height={height}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill={color} />
		</svg>
	);
}

export default MoonIcon;
