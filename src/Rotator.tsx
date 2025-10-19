import { useState, useEffect, Children, ReactElement, useRef } from 'react'

interface RotatorChildProps {
	rotationInterval?: number
}

interface RotatorProps {
	children: ReactElement<RotatorChildProps>[]
	defaultRotationInterval?: number // in milliseconds
}

const Rotator = ({
	children,
	defaultRotationInterval = 10000,
}: RotatorProps) => {
	const [currentIndex, setCurrentIndex] = useState(0)
	const [isFading, setIsFading] = useState(false)

	const childrenArray = Children.toArray(
		children,
	) as ReactElement<RotatorChildProps>[]
	const currentChild = childrenArray[currentIndex]
	const rotationInterval =
		currentChild.props.rotationInterval || defaultRotationInterval

	const [countdown, setCountdown] = useState(rotationInterval / 1000)
	const countdownRef = useRef(countdown)
	countdownRef.current = countdown

	useEffect(() => {
		setCountdown(rotationInterval / 1000)
	}, [currentIndex, rotationInterval])

	useEffect(() => {
		if (childrenArray.length < 2) {
			return
		}

		const timer = setInterval(() => {
			const newCountdown = countdownRef.current - 1
			if (newCountdown <= 0) {
				setIsFading(true)
				setTimeout(() => {
					setCurrentIndex(
						(prevIndex) => (prevIndex + 1) % childrenArray.length,
					)
					setIsFading(false)
				}, 500) // This should match the fade-out duration
			} else {
				setCountdown(newCountdown)
			}
		}, 1000)

		return () => clearInterval(timer)
	}, [childrenArray.length])

	return (
		<div className="relative h-full">
			{childrenArray.length > 1 && (
				<div className="absolute top-0 right-0 text-xs text-gray-400">
					Next in {Math.ceil(countdown)}s...
				</div>
			)}
			<div
				className={`transition-opacity duration-500 h-full ${
					isFading ? 'opacity-0' : 'opacity-100'
				}`}
			>
				{currentChild}
			</div>
		</div>
	)
}

export default Rotator

