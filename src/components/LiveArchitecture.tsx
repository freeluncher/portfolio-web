"use client";

import {
	Background,
	Controls,
	Handle,
	MarkerType,
	ReactFlow,
	type Edge,
	type Node,
	type NodeMouseHandler,
	type NodeProps,
	type NodeTypes,
	type ReactFlowInstance,
	Position,
	useNodesState,
} from "@xyflow/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ArchitectureGraph } from "@/sanity/lib/types";

type ArchitectureNode = {
	id: string;
	label: string;
	subtitle: string;
	details: string;
};

type ArchitectureNodeData = {
	label: string;
	subtitle?: string;
	active: boolean;
};

type DetailNodeData = {
	title: string;
	subtitle?: string;
	details: string;
	active: boolean;
};

type ArchitectureFlowNodeType = Node<ArchitectureNodeData, "architectureNode">;
type DetailFlowNodeType = Node<DetailNodeData, "detailNode">;
type FlowNodeType = ArchitectureFlowNodeType | DetailFlowNodeType;

interface LiveArchitectureProps {
	projectTitle: string;
	techStack: string[];
	architectureNotes: string[];
	architectureGraph?: ArchitectureGraph | null;
}

function pickFirstMatch(notes: string[], keywords: string[], fallback: string): string {
	const match = notes.find((note) => keywords.some((keyword) => note.toLowerCase().includes(keyword)));
	return match || fallback;
}

function hasAny(techStack: string[], keywords: string[]): boolean {
	const normalized = techStack.map((item) => item.toLowerCase());
	return keywords.some((keyword) => normalized.some((value) => value.includes(keyword)));
}

function clampPosition(position?: { x: number; y: number }) {
	return {
		x: Number.isFinite(position?.x) ? position?.x ?? 0 : 0,
		y: Number.isFinite(position?.y) ? position?.y ?? 0 : 0,
	};
}

function getMobileLayoutMetrics(nodeCount: number) {
	const canvasHeight = 528; // Matches h-132 on the mobile canvas container.
	const topPadding = 28;
	const bottomPadding = 28;
	const availableHeight = Math.max(220, canvasHeight - topPadding - bottomPadding);
	const gapY = Math.max(88, Math.floor(availableHeight / Math.max(1, nodeCount)));

	return {
		startY: topPadding,
		gapY,
		architectureX: 84, // center for ~180px node width on mobile viewport
		detailX: 24, // center for ~300px detail node width on mobile viewport
	};
}

function ArchitectureFlowNode({ data, sourcePosition, targetPosition }: NodeProps<ArchitectureFlowNodeType>) {
	const typedData = data as ArchitectureNodeData;

	return (
		<div className="relative touch-none">
			<Handle
				type="target"
				position={targetPosition ?? Position.Left}
				className="h-2! w-2! border-0! bg-transparent! opacity-0!"
				isConnectable={false}
			/>
			<div
				role="button"
				tabIndex={0}
				className={`nopan w-45 rounded-xl border px-3 py-2 text-left shadow-sm transition-all ${
					typedData.active
						? "border-blue-500 bg-blue-50 dark:bg-blue-950/40 dark:border-blue-700"
						: "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 hover:border-zinc-300 dark:hover:border-zinc-600"
				}`}
			>
				<p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{typedData.label}</p>
				<p className="text-xs text-zinc-500 dark:text-zinc-400">{typedData.subtitle}</p>
			</div>
			<Handle
				type="source"
				position={sourcePosition ?? Position.Right}
				className="h-2! w-2! border-0! bg-transparent! opacity-0!"
				isConnectable={false}
			/>
		</div>
	);
}

function DetailFlowNode({ data, targetPosition }: NodeProps<DetailFlowNodeType>) {
	const typedData = data as DetailNodeData;

	return (
		<div className="relative nopan touch-none w-75 md:w-85 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/95 dark:bg-zinc-900/90 p-4 shadow-sm backdrop-blur-sm">
			<Handle
				type="target"
				position={targetPosition ?? Position.Top}
				className="h-2! w-2! border-0! bg-transparent! opacity-0!"
				isConnectable={false}
			/>
			<p className="text-xs uppercase tracking-wide text-zinc-500 mb-2">Active Layer</p>
			<h3 className={`text-base font-semibold mb-1 ${typedData.active ? "text-emerald-700 dark:text-emerald-300" : "text-zinc-900 dark:text-zinc-100"}`}>{typedData.title}</h3>
			{typedData.subtitle && <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">{typedData.subtitle}</p>}
			<p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{typedData.details}</p>
		</div>
	);
}

const nodeTypes: NodeTypes = {
	architectureNode: ArchitectureFlowNode,
	detailNode: DetailFlowNode,
};

function buildInitialNodes(architectureNodes: ArchitectureNode[], activeNodeId: string, isMobile: boolean): FlowNodeType[] {
	const mobileLayout = getMobileLayoutMetrics(architectureNodes.length + 1);
	const startX = isMobile ? mobileLayout.architectureX : 44;
	const startY = isMobile ? mobileLayout.startY : 56;
	const gapX = 220;
	const gapY = isMobile ? mobileLayout.gapY : 128;
	const activeIndex = Math.max(0, architectureNodes.findIndex((node) => node.id === activeNodeId));
	const activeNode = architectureNodes[activeIndex] || architectureNodes[0];

	const systemNodes: ArchitectureFlowNodeType[] = architectureNodes.map((node, index) => ({
		id: node.id,
		type: "architectureNode",
		position: isMobile
			? { x: startX, y: startY + index * gapY }
			: { x: startX + index * gapX, y: startY },
		targetPosition: isMobile ? Position.Top : Position.Left,
		sourcePosition: isMobile ? Position.Bottom : Position.Right,
		data: {
			label: node.label,
			subtitle: node.subtitle,
			active: node.id === activeNodeId,
		},
		className: "transition-transform duration-300",
		draggable: true,
		selectable: true,
	}));

	const detailPosition = isMobile
		? { x: mobileLayout.detailX, y: startY + architectureNodes.length * gapY + 8 }
		: { x: Math.max(20, startX + activeIndex * gapX - 62), y: startY + 152 };

	const detailNode: DetailFlowNodeType = {
		id: "detail",
		type: "detailNode",
		position: detailPosition,
		targetPosition: Position.Top,
		data: {
			title: activeNode.label,
			subtitle: activeNode.subtitle,
			details: activeNode.details,
			active: true,
		},
		className: "transition-transform duration-300",
		draggable: true,
		selectable: true,
	};

	return [...systemNodes, detailNode];
}

function orderStudioNodesByHierarchy(graph: ArchitectureGraph): ArchitectureGraph["nodes"] {
	const indexById = new Map<string, number>();
	const nodeById = new Map<string, ArchitectureGraph["nodes"][number]>();

	graph.nodes.forEach((node, index) => {
		indexById.set(node.id, index);
		nodeById.set(node.id, node);
	});

	const indegree = new Map<string, number>();
	const adjacency = new Map<string, string[]>();

	for (const node of graph.nodes) {
		indegree.set(node.id, 0);
		adjacency.set(node.id, []);
	}

	for (const edge of graph.edges) {
		if (!nodeById.has(edge.source) || !nodeById.has(edge.target)) {
			continue;
		}

		adjacency.get(edge.source)?.push(edge.target);
		indegree.set(edge.target, (indegree.get(edge.target) || 0) + 1);
	}

	const queue = graph.nodes
		.filter((node) => (indegree.get(node.id) || 0) === 0)
		.sort((a, b) => (indexById.get(a.id) || 0) - (indexById.get(b.id) || 0))
		.map((node) => node.id);

	const topoOrder: string[] = [];
	const depthById = new Map<string, number>();

	for (const node of graph.nodes) {
		depthById.set(node.id, 0);
	}

	while (queue.length > 0) {
		const currentId = queue.shift();
		if (!currentId) {
			continue;
		}

		topoOrder.push(currentId);
		const currentDepth = depthById.get(currentId) || 0;

		for (const nextId of adjacency.get(currentId) || []) {
			depthById.set(nextId, Math.max(depthById.get(nextId) || 0, currentDepth + 1));
			const nextInDegree = (indegree.get(nextId) || 0) - 1;
			indegree.set(nextId, nextInDegree);
			if (nextInDegree === 0) {
				queue.push(nextId);
			}
		}
	}

	if (topoOrder.length < graph.nodes.length) {
		const remaining = graph.nodes
			.filter((node) => !topoOrder.includes(node.id))
			.sort((a, b) => (indexById.get(a.id) || 0) - (indexById.get(b.id) || 0))
			.map((node) => node.id);

		topoOrder.push(...remaining);
	}

	const topoRank = new Map<string, number>();
	topoOrder.forEach((id, index) => {
		topoRank.set(id, index);
	});

	return [...graph.nodes].sort((a, b) => {
		const depthA = depthById.get(a.id) || 0;
		const depthB = depthById.get(b.id) || 0;
		if (depthA !== depthB) {
			return depthA - depthB;
		}

		return (topoRank.get(a.id) || 0) - (topoRank.get(b.id) || 0);
	});
}

function buildStudioNodes(graph: ArchitectureGraph, activeNodeId: string, isMobile: boolean): FlowNodeType[] {
	const mobileLayout = getMobileLayoutMetrics(graph.nodes.length || 1);
	const sourceNodes = isMobile ? orderStudioNodesByHierarchy(graph) : graph.nodes;

	return sourceNodes.map((node, index) => {
		const isDetail = node.kind === "detail";
		const mobilePosition = {
			x: isDetail ? mobileLayout.detailX : mobileLayout.architectureX,
			y: mobileLayout.startY + index * mobileLayout.gapY,
		};
		const defaultDesktopPosition = isDetail ? { x: 44 + index * 220, y: 220 } : { x: 44 + index * 220, y: 56 };
		const nextPosition = isMobile ? mobilePosition : node.position ? clampPosition(node.position) : defaultDesktopPosition;
		const nextTargetPosition = isMobile ? Position.Top : Position.Left;
		const nextSourcePosition = isMobile ? Position.Bottom : Position.Right;

		if (isDetail) {
			return {
				id: node.id,
				type: "detailNode",
				position: nextPosition,
				targetPosition: nextTargetPosition,
				sourcePosition: nextSourcePosition,
				data: {
					title: node.label,
					subtitle: node.subtitle,
					details: node.details || "",
					active: node.id === activeNodeId,
				},
				draggable: true,
				selectable: true,
			} satisfies DetailFlowNodeType;
		}

		return {
			id: node.id,
			type: "architectureNode",
			position: nextPosition,
			targetPosition: nextTargetPosition,
			sourcePosition: nextSourcePosition,
			data: {
				label: node.label,
				subtitle: node.subtitle,
				active: node.id === activeNodeId,
			},
			draggable: true,
			selectable: true,
		} satisfies ArchitectureFlowNodeType;
	});
}

function buildStudioEdges(graph: ArchitectureGraph, activeNodeId: string): Edge[] {
	return graph.edges.map((edge) => {
		const isActivePath = edge.source === activeNodeId || edge.target === activeNodeId;
		return {
			id: edge.id,
			source: edge.source,
			target: edge.target,
			type: "smoothstep",
			animated: edge.animated ?? isActivePath,
			label: edge.label,
			markerEnd: {
				type: MarkerType.ArrowClosed,
				color: isActivePath ? "#3b82f6" : "#a1a1aa",
			},
			style: {
				strokeWidth: 2,
				stroke: isActivePath ? "#3b82f6" : "#a1a1aa",
			},
		};
	});
}

function getConnectedDetailNodeIds(parentNodeId: string, graph?: ArchitectureGraph | null): string[] {
	if (!graph?.nodes?.length) {
		return ["detail"];
	}

	const detailNodeIds = new Set(graph.nodes.filter((node) => node.kind === "detail").map((node) => node.id));
	const connectedDetailIds = new Set<string>();

	for (const edge of graph.edges) {
		if (edge.source === parentNodeId && detailNodeIds.has(edge.target)) {
			connectedDetailIds.add(edge.target);
		}

		if (edge.target === parentNodeId && detailNodeIds.has(edge.source)) {
			connectedDetailIds.add(edge.source);
		}
	}

	return [...connectedDetailIds];
}

export default function LiveArchitecture({ projectTitle, techStack, architectureNotes, architectureGraph }: LiveArchitectureProps) {
	const studioGraphMode = Boolean(architectureGraph?.nodes?.length);
	const architectureNodes = useMemo<ArchitectureNode[]>(() => {
		const hasNext = hasAny(techStack, ["next.js", "next", "react"]);
		const hasGo = hasAny(techStack, ["go", "golang"]);
		const hasNode = hasAny(techStack, ["node", "express", "nestjs"]);
		const hasSanity = hasAny(techStack, ["sanity"]);
		const hasDb = hasAny(techStack, ["postgres", "mysql", "mongodb", "database", "sql"]);

		const frontendLabel = hasNext ? "Next.js App" : "Web Frontend";
		const backendLabel = hasGo ? "Go API" : hasNode ? "Node API" : "Backend API";
		const dataLabel = hasSanity && hasDb ? "Sanity + Database" : hasSanity ? "Sanity CMS" : hasDb ? "Primary Database" : "Data Layer";

		return [
			{
				id: "visitor",
				label: "Visitor",
				subtitle: "Entry",
				details: `Pengguna membuka ${projectTitle} dari browser dan memicu request awal.`,
			},
			{
				id: "frontend",
				label: frontendLabel,
				subtitle: "Presentation",
				details: pickFirstMatch(
					architectureNotes,
					["frontend", "render", "router", "ui", "client"],
					"Layer frontend merender UI, menangani interaksi, dan mengirim request ke API sesuai kebutuhan halaman."
				),
			},
			{
				id: "backend",
				label: backendLabel,
				subtitle: "Application",
				details: pickFirstMatch(
					architectureNotes,
					["api", "backend", "service", "route", "handler"],
					"Layer backend memproses validasi, aturan bisnis, dan orkestrasi alur data untuk fitur inti."
				),
			},
			{
				id: "data",
				label: dataLabel,
				subtitle: "Storage",
				details: pickFirstMatch(
					architectureNotes,
					["sanity", "database", "postgres", "storage", "query", "repository"],
					"Layer data menyimpan konten/record dan menyediakan sumber data konsisten untuk frontend dan backend."
				),
			},
		];
	}, [architectureNotes, projectTitle, techStack]);

	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const media = window.matchMedia("(max-width: 767px)");
		const updateMobile = () => setIsMobile(media.matches);
		updateMobile();
		media.addEventListener("change", updateMobile);

		return () => media.removeEventListener("change", updateMobile);
	}, []);

	const [activeNodeId, setActiveNodeId] = useState<string>(architectureNodes[1]?.id || architectureNodes[0]?.id || "visitor");
	const [visibleDetailNodeIds, setVisibleDetailNodeIds] = useState<string[]>([]);
	const activeIndex = Math.max(0, architectureNodes.findIndex((node) => node.id === activeNodeId));
	const [nodes, setNodes, onNodesChange] = useNodesState<FlowNodeType>([]);
	const prevIsMobileRef = useRef<boolean | null>(null);
	const flowInstanceRef = useRef<ReactFlowInstance<FlowNodeType, Edge> | null>(null);
	const didInitialMobileFitRef = useRef(false);
	const studioGraphKey = useMemo(() => JSON.stringify(architectureGraph ?? null), [architectureGraph]);
	const lastStudioGraphKeyRef = useRef<string>("");
	const studioEdges = useMemo(() => (studioGraphMode && architectureGraph ? buildStudioEdges(architectureGraph, activeNodeId) : []), [activeNodeId, architectureGraph, studioGraphMode]);

	useEffect(() => {
		const modeChanged = prevIsMobileRef.current !== null && prevIsMobileRef.current !== isMobile;
		if (nodes.length === 0 || modeChanged) {
			setNodes(studioGraphMode && architectureGraph ? buildStudioNodes(architectureGraph, activeNodeId, isMobile) : buildInitialNodes(architectureNodes, activeNodeId, isMobile));
		}
		prevIsMobileRef.current = isMobile;
	}, [activeNodeId, architectureGraph, architectureNodes, isMobile, nodes.length, setNodes, studioGraphMode]);

	useEffect(() => {
		if (!studioGraphMode || !architectureGraph) {
			lastStudioGraphKeyRef.current = "";
			return;
		}

		if (studioGraphKey === lastStudioGraphKeyRef.current) {
			return;
		}

		lastStudioGraphKeyRef.current = studioGraphKey;
		setNodes(buildStudioNodes(architectureGraph, activeNodeId, isMobile));
	}, [activeNodeId, architectureGraph, isMobile, setNodes, studioGraphKey, studioGraphMode]);

	useEffect(() => {
		setNodes((currentNodes) => {
			if (currentNodes.length === 0) {
				return currentNodes;
			}

			if (studioGraphMode && architectureGraph) {
				return currentNodes.map((node) => {
					const sourceNode = architectureGraph.nodes.find((item) => item.id === node.id);
					if (!sourceNode) {
						return node;
					}

					if (node.type === "architectureNode") {
						const nodeData = node.data as ArchitectureNodeData;
						return {
							...node,
							data: {
								...nodeData,
								active: node.id === activeNodeId,
							},
						};
					}

					const detailData = node.data as DetailNodeData;
					return {
						...node,
						data: {
							...detailData,
							title: sourceNode.label,
							subtitle: sourceNode.subtitle,
							details: sourceNode.details || "",
							active: node.id === activeNodeId,
						},
					};
				});
			}

			const activeMeta = architectureNodes.find((node) => node.id === activeNodeId) || architectureNodes[0];
			const activeCanvasNode = currentNodes.find((node) => node.id === activeNodeId && node.type === "architectureNode") as ArchitectureFlowNodeType | undefined;
			const architectureCanvasNodes = currentNodes.filter((node) => node.type === "architectureNode") as ArchitectureFlowNodeType[];

			return currentNodes.map((node) => {
				if (node.type === "architectureNode") {
					const nodeData = node.data as ArchitectureNodeData;
					return {
						...node,
						data: {
							...nodeData,
							active: node.id === activeNodeId,
						},
					};
				}

				if (node.id === "detail") {
					const detailData = node.data as DetailNodeData;
					const maxArchitectureY = architectureCanvasNodes.reduce((maxY, item) => Math.max(maxY, item.position.y), 0);
					const mobileLayout = getMobileLayoutMetrics(architectureCanvasNodes.length + 1);
					const nextPosition = activeCanvasNode
						? isMobile
							? { x: mobileLayout.detailX, y: maxArchitectureY + Math.max(96, Math.floor(mobileLayout.gapY * 0.9)) }
							: { x: Math.max(20, activeCanvasNode.position.x - 62), y: activeCanvasNode.position.y + 152 }
						: node.position;

					return {
						...node,
						position: nextPosition,
						data: {
							...detailData,
							title: activeMeta.label,
							details: activeMeta.details,
						},
					};
				}

				return node;
			});
		});
	}, [activeNodeId, architectureGraph, architectureNodes, isMobile, setNodes, studioGraphMode]);

	const flowEdges = useMemo<Edge[]>(() => {
		if (studioGraphMode && architectureGraph) {
			return studioEdges;
		}

		const systemEdges = architectureNodes.slice(0, -1).map((node, edgeIndex) => {
			const isConnectedToActive = edgeIndex === activeIndex || edgeIndex === activeIndex - 1;
			const isInActivePath = edgeIndex <= activeIndex - 1;
			const activeStroke = isInActivePath ? "#3b82f6" : "#a1a1aa";

			return {
				id: `${node.id}-${architectureNodes[edgeIndex + 1].id}`,
				source: node.id,
				target: architectureNodes[edgeIndex + 1].id,
				type: "smoothstep",
				animated: isConnectedToActive,
				markerEnd: {
					type: MarkerType.ArrowClosed,
					color: activeStroke,
				},
				style: {
					strokeWidth: 2,
					stroke: activeStroke,
				},
			};
		});

		const detailEdge: Edge = {
			id: `detail-link-${activeNodeId}`,
			source: activeNodeId,
			target: "detail",
			type: "smoothstep",
			animated: true,
			markerEnd: {
				type: MarkerType.ArrowClosed,
				color: "#3b82f6",
			},
			style: {
				strokeWidth: 2,
				stroke: "#3b82f6",
				strokeDasharray: "6 4",
			},
		};

		return [...systemEdges, detailEdge];
	}, [activeIndex, activeNodeId, architectureGraph, architectureNodes, studioEdges, studioGraphMode]);

	const renderedNodes = useMemo(() => {
		const visibleDetails = new Set(visibleDetailNodeIds);
		return nodes.filter((node) => node.type !== "detailNode" || visibleDetails.has(node.id));
	}, [nodes, visibleDetailNodeIds]);

	const renderedEdges = useMemo(() => {
		const visibleNodeIds = new Set(renderedNodes.map((node) => node.id));
		return flowEdges.filter((edge) => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target));
	}, [flowEdges, renderedNodes]);

	const fitViewOptions = useMemo(
		() =>
			isMobile
				? {
						padding: 0.24,
						minZoom: 0.74,
						maxZoom: 1,
					}
				: {
						padding: 0.16,
						minZoom: 0.68,
						maxZoom: 1,
					},
		[isMobile]
	);

	useEffect(() => {
		didInitialMobileFitRef.current = false;
	}, [isMobile, studioGraphKey]);

	useEffect(() => {
		if (!isMobile || nodes.length === 0 || didInitialMobileFitRef.current) {
			return;
		}

		const rafId = window.requestAnimationFrame(() => {
			window.requestAnimationFrame(() => {
				flowInstanceRef.current?.fitView({
					...fitViewOptions,
					duration: 280,
				});
				didInitialMobileFitRef.current = true;
			});
		});

		return () => window.cancelAnimationFrame(rafId);
	}, [fitViewOptions, isMobile, nodes.length]);

	const handleNodeClick = useCallback<NodeMouseHandler<FlowNodeType>>(
		(_event, node) => {
			if (node.type !== "architectureNode") {
				return;
			}

			const connectedDetailNodeIds = getConnectedDetailNodeIds(node.id, studioGraphMode ? architectureGraph : null);

			if (node.id !== activeNodeId) {
				setActiveNodeId(node.id);
			}

			if (connectedDetailNodeIds.length === 0) {
				return;
			}

			setVisibleDetailNodeIds((current) => {
				const allVisible = connectedDetailNodeIds.every((detailId) => current.includes(detailId));
				if (allVisible) {
					return current.filter((detailId) => !connectedDetailNodeIds.includes(detailId));
				}

				return [...new Set([...current, ...connectedDetailNodeIds])];
			});
		},
		[activeNodeId, architectureGraph, studioGraphMode]
	);

	return (
		<div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-6">
			<h2 className="text-xl font-semibold mb-2">Live Architecture</h2>
			<p className="text-sm text-zinc-600 dark:text-zinc-400 mb-5">{studioGraphMode ? "Graph ini mengikuti node dan edge yang tersimpan di Sanity Studio." : "Klik tiap node untuk melihat peran layer pada alur sistem project ini."}</p>

			<div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/20 overflow-hidden">
				{isMobile && (
					<div className="border-b border-zinc-200/80 dark:border-zinc-700/80 bg-white/70 dark:bg-zinc-900/70 px-4 py-2 text-[11px] text-zinc-600 dark:text-zinc-400">
						Tap parent node yang terhubung untuk toggle detail. Geser area kosong untuk pan, atau drag node untuk mengatur posisi.
					</div>
				)}
				<div className="h-132 sm:h-150 md:h-90 w-full touch-none">
					<ReactFlow<FlowNodeType, Edge>
						key={isMobile ? "mobile" : "desktop"}
						nodes={renderedNodes}
						edges={renderedEdges}
						nodeTypes={nodeTypes}
						onInit={(instance) => {
							flowInstanceRef.current = instance;
						}}
						onNodeClick={handleNodeClick}
						onNodesChange={onNodesChange}
						onlyRenderVisibleElements
						fitView
						fitViewOptions={fitViewOptions}
						nodesConnectable={false}
						nodesDraggable
						elementsSelectable
						zoomOnDoubleClick={false}
						selectionOnDrag={false}
						panOnDrag
						panOnScroll={!isMobile}
						panOnScrollSpeed={0.7}
						preventScrolling={false}
						proOptions={{ hideAttribution: true }}
					>
						<Background color="#d4d4d8" gap={22} size={0.5} />
						<Controls showInteractive={false} className="shadow-none! [&>button]:bg-white! dark:[&>button]:bg-zinc-900!" />
					</ReactFlow>
				</div>
			</div>
		</div>
	);
}
