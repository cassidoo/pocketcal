import { IconProps } from "./SharedProps";

function SunIcon({ color = "#000", height = 24, width = 24 }: IconProps) {
	return (
		<svg
			width={width}
			height={height}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<circle cx="12" cy="12" r="5" fill={color} />
			<line x1="12" y1="1" x2="12" y2="3" stroke={color} strokeWidth="2" />
			<line x1="12" y1="21" x2="12" y2="23" stroke={color} strokeWidth="2" />
			<line
				x1="4.22"
				y1="4.22"
				x2="5.64"
				y2="5.64"
				stroke={color}
				strokeWidth="2"
			/>
			<line
				x1="18.36"
				y1="18.36"
				x2="19.78"
				y2="19.78"
				stroke={color}
				strokeWidth="2"
			/>
			<line x1="1" y1="12" x2="3" y2="12" stroke={color} strokeWidth="2" />
			<line x1="21" y1="12" x2="23" y2="12" stroke={color} strokeWidth="2" />
			<line
				x1="4.22"
				y1="19.78"
				x2="5.64"
				y2="18.36"
				stroke={color}
				strokeWidth="2"
			/>
			<line
				x1="18.36"
				y1="5.64"
				x2="19.78"
				y2="4.22"
				stroke={color}
				strokeWidth="2"
			/>
		</svg>
	);
}

export default SunIcon;
