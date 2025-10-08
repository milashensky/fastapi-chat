import { useEffect, useRef } from "react"

interface Props {
    onIntersect?: () => void
    onStopIntersecting?: () => void
}

const Intersection = (props: Props) => {
    const handleRef = useRef<HTMLDivElement>(null)
    const handleIntersect = () => {
        if (!props.onIntersect) {
            return
        }
        props.onIntersect()
    }
    const handleStopIntersecting = () => {
        if (!props.onStopIntersecting) {
            return
        }
        props.onStopIntersecting()
    }
    const intersectionCallback: IntersectionObserverCallback = (entries) => {
        const [entry] = entries
        if (entry.isIntersecting) {
            return handleIntersect()
        }
        return handleStopIntersecting()
    }
    const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1,
    }
    useEffect(() => {
        const element = handleRef.current
        if (!element) {
            return
        }
        const observer = new IntersectionObserver(intersectionCallback, options)
        observer.observe(element)
        return () => {
            observer.unobserve(element)
        }
    }, [handleRef])
    return (
        <div ref={handleRef} />
    )
}

export default Intersection
