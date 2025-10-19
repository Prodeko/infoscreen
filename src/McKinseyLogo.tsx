const McKinseyLogo = ({
	className,
}: {
	className?: string
	rotationInterval?: number
}) => {
	return (
		<div className={`flex items-center justify-center h-full ${className}`}>
			<img
				src="/McKinsey_logo.svg"
				alt="McKinsey & Company"
				className="w-1/2"
			/>
		</div>
	)
}

export default McKinseyLogo;
