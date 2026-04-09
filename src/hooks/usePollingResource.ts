"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DEFAULT_POLL_INTERVAL_MS } from "@/lib/constants";

interface UsePollingResourceOptions {
	intervalMs?: number;
	immediate?: boolean;
}

interface UsePollingResourceResult<T> {
	data: T | null;
	error: string | null;
	isLoading: boolean;
	lastUpdated: number | null;
	refresh: () => Promise<void>;
}

export function usePollingResource<T>(
	fetcher: () => Promise<T>,
	options: UsePollingResourceOptions = {}
): UsePollingResourceResult<T> {
	const { intervalMs = DEFAULT_POLL_INTERVAL_MS, immediate = true } = options;
	const [data, setData] = useState<T | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(immediate);
	const [lastUpdated, setLastUpdated] = useState<number | null>(null);
	const isMountedRef = useRef(true);

	const refresh = useCallback(async () => {
		setIsLoading(true);
		try {
			const nextData = await fetcher();
			if (!isMountedRef.current) return;
			setData(nextData);
			setError(null);
			setLastUpdated(Date.now());
		} catch (err) {
			if (!isMountedRef.current) return;
			const message = err instanceof Error ? err.message : "Failed to fetch resource.";
			setError(message);
		} finally {
			if (!isMountedRef.current) return;
			setIsLoading(false);
		}
	}, [fetcher]);

	useEffect(() => {
		isMountedRef.current = true;

		if (immediate) {
			void refresh();
		}

		const intervalId = window.setInterval(() => {
			void refresh();
		}, intervalMs);

		return () => {
			isMountedRef.current = false;
			window.clearInterval(intervalId);
		};
	}, [immediate, intervalMs, refresh]);

	return {
		data,
		error,
		isLoading,
		lastUpdated,
		refresh,
	};
}