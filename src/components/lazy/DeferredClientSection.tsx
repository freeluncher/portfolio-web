"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

interface DeferredClientSectionProps {
	children: ReactNode;
	fallback: ReactNode;
	rootMargin?: string;
	threshold?: number;
}

export default function DeferredClientSection({
	children,
	fallback,
	rootMargin = "200px 0px",
	threshold = 0.01,
}: DeferredClientSectionProps) {
	const targetRef = useRef<HTMLDivElement | null>(null);
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		if (isVisible || !targetRef.current) {
			return;
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIsVisible(true);
					observer.disconnect();
				}
			},
			{ rootMargin, threshold },
		);

		observer.observe(targetRef.current);

		return () => {
			observer.disconnect();
		};
	}, [isVisible, rootMargin, threshold]);

	return <div ref={targetRef}>{isVisible ? children : fallback}</div>;
}