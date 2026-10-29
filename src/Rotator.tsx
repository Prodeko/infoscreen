import {
	Children,
	cloneElement,
	type ReactElement,
	type ReactNode,
	useEffect,
	useRef,
	useState,
} from 'react'
import StaleNote from './StaleNote'

interface RotatorChildProps {
	rotationInterval?: number
	rotation?: number
	// Freshness of the slide's data, for the stale-data note
	updatedAt?: Date | null
	isStale?: boolean
}

interface RotatorProps {
	// Children may be conditional; false and null are skipped
	children: ReactNode
	defaultRotationInterval?: number // in milliseconds
}

const Rotator = ({
	children,
	defaultRotationInterval = 10000,
}: RotatorProps) => {
	const [currentIndex, setCurrentIndex] = useState(0)
	const [round, setRound] = useState(0)
	const [isFading, setIsFading] = useState(false)

	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
	const prevIndexRef = useRef(currentIndex)

	const childrenArray = Children.toArray(
		children,
	) as ReactElement<RotatorChildProps>[]
	// The number of children can shrink, e.g. when a feed comes back empty
	const currentChild = childrenArray[currentIndex % childrenArray.length]
	const rotationInterval =
		currentChild.props.rotationInterval || defaultRotationInterval

	const [countdown, setCountdown] = useState(rotationInterval / 1000)
	const countdownRef = useRef(countdown)
	countdownRef.current = countdown

	// biome-ignore lint/correctness/useExhaustiveDependencies: restart the countdown whenever the slide changes
	useEffect(() => {
		setCountdown(rotationInterval / 1000)
	}, [currentIndex, rotationInterval])

	useEffect(() => {
		if (childrenArray.length <= 1) {
			prevIndexRef.current = currentIndex
			return
		}

		if (
			prevIndexRef.current === childrenArray.length - 1 &&
			currentIndex === 0
		) {
			setRound((r) => r + 1)
		}

		prevIndexRef.current = currentIndex
	}, [childrenArray.length, currentIndex])

	useEffect(() => {
		if (childrenArray.length < 2) {
			return
		}

		if (intervalRef.current) {
			clearInterval(intervalRef.current)
		}

		intervalRef.current = setInterval(() => {
			const newCountdown = countdownRef.current - 1
			if (newCountdown <= 0) {
				setIsFading(true)
				setTimeout(() => {
					setCurrentIndex((prevIndex) => {
						const nextIndex = (prevIndex + 1) % childrenArray.length
						return nextIndex
					})
					setIsFading(false)
				}, 500) // This should match the fade-out duration
			} else {
				setCountdown(newCountdown)
			}
		}, 1000)

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current)
			}
		}
	}, [childrenArray.length])

	return (
		<div className="relative h-full">
			{childrenArray.length > 1 && (
				<div className="absolute top-0 right-0 text-md text-gray-400">
					Next in {Math.ceil(countdown)}s...
				</div>
			)}
			<div
				className={`transition-opacity duration-500 h-full ${
					isFading ? 'opacity-0' : 'opacity-100'
				}`}
			>
				{cloneElement(currentChild, { rotation: round })}
				<StaleNote
					updatedAt={currentChild.props.updatedAt ?? null}
					isStale={currentChild.props.isStale ?? false}
					className="absolute bottom-0 left-0"
				/>
			</div>
		</div>
	)
}

export default Rotator
