'use client';

import '@xyflow/react/dist/style.css';
import './ArchitectureGraphInput.css';

import {
	Background,
	Controls,
	Handle,
	MarkerType,
	ReactFlow,
	addEdge,
	type Connection,
	ConnectionMode,
	type Edge,
	type EdgeChange,
	type Node,
	type NodeChange,
	type NodeMouseHandler,
	type NodeProps,
	type NodeTypes,
	Position,
	useEdgesState,
	useNodesState,
} from '@xyflow/react';
import { ComponentIcon, DocumentIcon, LinkIcon } from '@sanity/icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { set, type ObjectInputProps } from 'sanity';

type GraphNodeKind = 'architecture' | 'detail';

type GraphNodeValue = {
	_key?: string;
	id: string;
	kind: GraphNodeKind;
	label: string;
	subtitle?: string;
	details?: string;
	position?: { x: number; y: number };
	linkedNodeId?: string;
};

type GraphEdgeValue = {
	_key?: string;
	id: string;
	source: string;
	target: string;
	label?: string;
	animated?: boolean;
};

type ArchitectureGraphValue = {
	nodes?: GraphNodeValue[];
	edges?: GraphEdgeValue[];
};

type FlowNodeData = {
	label: string;
	subtitle?: string;
	details?: string;
	kind: GraphNodeKind;
	selected: boolean;
};

type ArchitectureFlowNodeType = Node<FlowNodeData, 'architectureNode'>;
type DetailFlowNodeType = Node<FlowNodeData, 'detailNode'>;
type FlowNodeType = ArchitectureFlowNodeType | DetailFlowNodeType;

function normalizeGraph(value?: ArchitectureGraphValue | null): Required<ArchitectureGraphValue> {
	return {
		nodes: Array.isArray(value?.nodes) ? value.nodes : [],
		edges: Array.isArray(value?.edges) ? value.edges : [],
	};
}

function clampPosition(position?: { x: number; y: number }) {
	return {
		x: Number.isFinite(position?.x) ? position?.x ?? 0 : 0,
		y: Number.isFinite(position?.y) ? position?.y ?? 0 : 0,
	};
}

function createId(prefix: string): string {
	const randomId = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID().slice(0, 8) : String(Date.now()).slice(-8);
	return `${prefix}-${randomId}`;
}

function ArchitectureNodeRenderer({ data, sourcePosition, targetPosition }: NodeProps<ArchitectureFlowNodeType>) {
	const typedData = data as FlowNodeData;

	return (
		<div className="architectureGraph__nodeShell">
			<Handle type="target" position={targetPosition ?? Position.Left} className="architectureGraph__handle architectureGraph__handle--target" />
			<div className={`architectureGraph__nodeCard ${typedData.selected ? 'architectureGraph__nodeCard--active' : 'architectureGraph__nodeCard--idle'}`}>
				<div className="architectureGraph__nodeHeader">
					<div>
						<p className="architectureGraph__nodeTitle">{typedData.label}</p>
						{typedData.subtitle && <p className="architectureGraph__nodeSubtitle">{typedData.subtitle}</p>}
					</div>
					<span className="architectureGraph__badge">{typedData.kind}</span>
				</div>
				{typedData.details && <p className="architectureGraph__nodeBody">{typedData.details}</p>}
			</div>
			<Handle type="source" position={sourcePosition ?? Position.Right} className="architectureGraph__handle architectureGraph__handle--source" />
		</div>
	);
}

function DetailNodeRenderer({ data, sourcePosition, targetPosition }: NodeProps<DetailFlowNodeType>) {
	const typedData = data as FlowNodeData;

	return (
		<div className="architectureGraph__nodeShell">
			<Handle type="target" position={targetPosition ?? Position.Left} className="architectureGraph__handle architectureGraph__handle--target" />
			<div className={`architectureGraph__nodeCard architectureGraph__nodeCard--detail ${typedData.selected ? 'architectureGraph__nodeCard--detailActive' : 'architectureGraph__nodeCard--idle'}`}>
				<p className="architectureGraph__detailEyebrow">Detail Node</p>
				<p className="architectureGraph__nodeTitle">{typedData.label}</p>
				{typedData.details && <p className="architectureGraph__nodeBody architectureGraph__nodeBody--detail">{typedData.details}</p>}
			</div>
			<Handle type="source" position={sourcePosition ?? Position.Right} className="architectureGraph__handle architectureGraph__handle--source" />
		</div>
	);
}

const nodeTypes: NodeTypes = {
	architectureNode: ArchitectureNodeRenderer,
	detailNode: DetailNodeRenderer,
};

function createFlowNodes(nodes: GraphNodeValue[], selectedNodeId?: string): FlowNodeType[] {
	return nodes.map((node, index) => {
		const position = clampPosition(node.position);
		const type = node.kind === 'detail' ? 'detailNode' : 'architectureNode';

		return {
			id: node.id,
			type,
			position: position.x || position.y ? position : { x: 44 + index * 220, y: node.kind === 'detail' ? 220 : 56 },
			targetPosition: Position.Left,
			sourcePosition: Position.Right,
			data: {
				label: node.label,
				subtitle: node.subtitle,
				details: node.details,
				kind: node.kind,
				selected: node.id === selectedNodeId,
			},
			draggable: true,
			selectable: true,
		};
	});
}

function createFlowEdges(edges: GraphEdgeValue[]): Edge[] {
	return edges.map((edge) => ({
		id: edge.id,
		source: edge.source,
		target: edge.target,
		type: 'smoothstep',
		animated: edge.animated ?? true,
		label: edge.label,
		markerEnd: {
			type: MarkerType.ArrowClosed,
			color: '#3b82f6',
		},
		style: {
			strokeWidth: 2,
			stroke: '#3b82f6',
		},
	}));
}

function toGraphValue(nodes: FlowNodeType[], edges: Edge[]): ArchitectureGraphValue {
	return {
		nodes: nodes.map((node) => ({
			id: node.id,
			kind: node.data.kind,
			label: node.data.label,
			subtitle: node.data.subtitle,
			details: node.data.details,
			position: clampPosition(node.position),
		})),
		edges: edges.map((edge) => ({
			id: edge.id,
			source: edge.source,
			target: edge.target,
			label: typeof edge.label === 'string' ? edge.label : undefined,
			animated: edge.animated ?? true,
		})),
	};
}

export default function ArchitectureGraphInput(props: ObjectInputProps<ArchitectureGraphValue>) {
	const { value, onChange } = props;
	const normalizedValue = useMemo(() => normalizeGraph(value), [value]);
	const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>(normalizedValue.nodes[0]?.id);
	const [nodes, setNodes, onNodesChange] = useNodesState<FlowNodeType>(createFlowNodes(normalizedValue.nodes, normalizedValue.nodes[0]?.id));
	const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(createFlowEdges(normalizedValue.edges));
	const lastPersistedRef = useRef<string>('');

	const effectiveSelectedNodeId = selectedNodeId && nodes.some((node) => node.id === selectedNodeId) ? selectedNodeId : nodes[0]?.id;
	const selectedNode = useMemo(() => nodes.find((node) => node.id === effectiveSelectedNodeId) ?? null, [effectiveSelectedNodeId, nodes]);

	const renderedNodes = useMemo(
		() =>
			nodes.map((node) => ({
				...node,
				data: {
					...node.data,
					selected: node.id === effectiveSelectedNodeId,
				},
			})),
		[nodes, effectiveSelectedNodeId]
	);

	useEffect(() => {
		const nextGraph = normalizeGraph(value);
		const nextKey = JSON.stringify(nextGraph);
		if (nextKey === lastPersistedRef.current) {
			return;
		}

		lastPersistedRef.current = nextKey;
		setNodes(createFlowNodes(nextGraph.nodes, nextGraph.nodes[0]?.id));
		setEdges(createFlowEdges(nextGraph.edges));
	}, [setEdges, setNodes, value]);

	useEffect(() => {
		const nextGraph = toGraphValue(nodes, edges);
		const nextKey = JSON.stringify(nextGraph);
		if (nextKey === lastPersistedRef.current) {
			return;
		}

		lastPersistedRef.current = nextKey;
		onChange(set(nextGraph));
	}, [edges, nodes, onChange]);

	const handleNodeClick: NodeMouseHandler<FlowNodeType> = useCallback((_event, node) => {
		setSelectedNodeId(node.id);
	}, []);

	const handleConnect = useCallback(
		(connection: Connection) => {
			setEdges((currentEdges) => addEdge({ ...connection, type: 'smoothstep', animated: true }, currentEdges));
		},
		[setEdges]
	);

	const handleAddArchitectureNode = () => {
		const id = createId('node');
		setNodes((currentNodes) => [
			...currentNodes,
			{
				id,
				type: 'architectureNode',
				position: { x: 60 + currentNodes.length * 40, y: 80 + currentNodes.length * 16 },
				sourcePosition: Position.Right,
				targetPosition: Position.Left,
				data: {
					label: 'New Node',
					subtitle: 'Presentation',
					details: 'Describe this architecture node in Studio.',
					kind: 'architecture',
					selected: true,
				},
				draggable: true,
				selectable: true,
			},
		]);
		setSelectedNodeId(id);
	};

	const handleAddDetailNode = () => {
		const id = createId('detail');
		setNodes((currentNodes) => [
			...currentNodes,
			{
				id,
				type: 'detailNode',
				position: { x: 320, y: 220 + currentNodes.length * 16 },
				sourcePosition: Position.Right,
				targetPosition: Position.Left,
				data: {
					label: 'Detail Node',
					details: 'Describe implementation details here.',
					kind: 'detail',
					selected: true,
				},
				draggable: true,
				selectable: true,
			},
		]);
		setSelectedNodeId(id);
	};

	const handleDeleteSelected = () => {
		if (!effectiveSelectedNodeId) {
			return;
		}

		setNodes((currentNodes) => currentNodes.filter((node) => node.id !== effectiveSelectedNodeId));
		setEdges((currentEdges) => currentEdges.filter((edge) => edge.source !== effectiveSelectedNodeId && edge.target !== effectiveSelectedNodeId));
		setSelectedNodeId(undefined);
	};

	const updateSelectedNode = (patch: Partial<GraphNodeValue>) => {
		if (!effectiveSelectedNodeId) {
			return;
		}

		setNodes((currentNodes) =>
			currentNodes.map((node) => {
				if (node.id !== effectiveSelectedNodeId) {
					return node;
				}

				return {
					...node,
					data: {
						...node.data,
						...patch,
						selected: true,
					},
				};
			})
		);
	};

	return (
		<div className="architectureGraph">
			<div className="architectureGraph__surface">
				<div className="architectureGraph__toolbar">
					<span className="architectureGraph__pill">
						<ComponentIcon className="architectureGraph__pillIcon" />
						Architecture Graph
					</span>
					<button type="button" onClick={handleAddArchitectureNode} className="architectureGraph__button architectureGraph__button--neutral">
						Add Node
					</button>
					<button type="button" onClick={handleAddDetailNode} className="architectureGraph__button architectureGraph__button--neutral">
						Add Detail Node
					</button>
					<button type="button" onClick={handleDeleteSelected} className="architectureGraph__button architectureGraph__button--danger">
						Delete Selected
					</button>
				</div>

				<div className="architectureGraph__content">
					<div className="architectureGraph__canvas">
						<ReactFlow<FlowNodeType, Edge>
							nodes={renderedNodes}
							edges={edges}
							nodeTypes={nodeTypes}
							onNodeClick={handleNodeClick}
							onNodesChange={onNodesChange as unknown as (changes: NodeChange[]) => void}
							onEdgesChange={onEdgesChange as unknown as (changes: EdgeChange[]) => void}
							onConnect={handleConnect}
							fitView
							fitViewOptions={{ padding: 0.18, minZoom: 0.5, maxZoom: 1 }}
							nodesConnectable
							connectionMode={ConnectionMode.Loose}
							nodesDraggable
							elementsSelectable
							selectionOnDrag={false}
							panOnDrag
							panOnScroll
							panOnScrollSpeed={0.7}
							zoomOnDoubleClick={false}
							proOptions={{ hideAttribution: true }}
						>
							<Background color="#d4d4d8" gap={22} size={0.6} />
							<Controls showInteractive={false} className="architectureGraph__controls" />
						</ReactFlow>
					</div>

					<div className="architectureGraph__sidebar">
						<p className="architectureGraph__sidebarTitle">Selected Node</p>
						{selectedNode ? (
							<div className="architectureGraph__editorFields">
								<label className="architectureGraph__field">
									<span className="architectureGraph__fieldLabel">ID</span>
									<input value={selectedNode.id} readOnly className="architectureGraph__input" />
								</label>
								<label className="architectureGraph__field">
									<span className="architectureGraph__fieldLabel">Kind</span>
									<select value={selectedNode.data.kind} onChange={(event) => updateSelectedNode({ kind: event.target.value as GraphNodeKind })} className="architectureGraph__input">
										<option value="architecture">architecture</option>
										<option value="detail">detail</option>
									</select>
								</label>
								<label className="architectureGraph__field">
									<span className="architectureGraph__fieldLabel">Label</span>
									<input value={selectedNode.data.label} onChange={(event) => updateSelectedNode({ label: event.target.value })} className="architectureGraph__input" />
								</label>
								<label className="architectureGraph__field">
									<span className="architectureGraph__fieldLabel">Subtitle</span>
									<input value={selectedNode.data.subtitle || ''} onChange={(event) => updateSelectedNode({ subtitle: event.target.value })} className="architectureGraph__input" />
								</label>
								<label className="architectureGraph__field">
									<span className="architectureGraph__fieldLabel">Details</span>
									<textarea value={selectedNode.data.details || ''} onChange={(event) => updateSelectedNode({ details: event.target.value })} rows={5} className="architectureGraph__textarea" />
								</label>
								{selectedNode.position && (
									<div className="architectureGraph__positionGrid">
										<div className="architectureGraph__positionChip">x: {Math.round(selectedNode.position.x ?? 0)}</div>
										<div className="architectureGraph__positionChip">y: {Math.round(selectedNode.position.y ?? 0)}</div>
									</div>
								)}
							</div>
						) : (
							<p className="architectureGraph__emptyState">Select a node to edit it.</p>
						)}

						<div className="architectureGraph__helpText">
							<p><LinkIcon className="architectureGraph__helpIcon" />Drag from handles to connect nodes.</p>
							<p><DocumentIcon className="architectureGraph__helpIcon" />Use Add Node or Add Detail Node to grow the graph.</p>
							<p>Drag nodes on the canvas to position them. Pan by dragging empty space.</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}