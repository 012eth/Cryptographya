import Graph from 'graphology';
import { Attributes } from 'graphology-types';
import { SetterOrUpdater } from 'recoil';
import { SigmaEdgeEventPayload, SigmaNodeEventPayload, SigmaStageEventPayload } from 'sigma/sigma';
import { Coordinates, EdgeDisplayData, NodeDisplayData } from 'sigma/types';
import { IApplyParams } from '../../hooks/useSigma';
import { EdgeId } from '../../utils/utils';
import { forceLabel, readdNode } from './utils';

export type MyGraph = Graph<Attributes, Attributes, Attributes>;
interface State {
    hoveredNode?: string;
    searchQuery: string;

    // State derived from query:
    foundNode?: string;
    suggestions: Set<string>;

    selectedNodesId: string[];

    // State derived from hovered node:
    hoveredNeighbors: Set<string>;
}
const state: State = { searchQuery: '', hoveredNeighbors: new Set(), suggestions: new Set(), selectedNodesId: [] };

interface IClickNodePassThrough {
    selectedNode: [Attributes | null, SetterOrUpdater<Attributes | null>];
}

interface IClickStagePassThrough extends IClickNodePassThrough {
    cb: (nodes: string[]) => void;
}

export function onNodeEnter({ graph, renderer }: IApplyParams) {
    return ({ node }: SigmaNodeEventPayload) => {
        state.hoveredNode = node;
        renderer.setSetting('labelDensity', Infinity);
        state.hoveredNeighbors = new Set(graph.neighbors(node));
        // state.hoveredNeighbors.forEach(n => readdNode(graph, n));
        renderer.refresh();
    };
}

export function onNodeLeave({ renderer }: IApplyParams) {
    return () => {
        delete state.hoveredNode;
        renderer.setSetting('labelDensity', 0.5);
        state.hoveredNeighbors.clear();
        renderer.refresh();
    };
}

export function clickStage({ graph, renderer, passthrough, modes }: IApplyParams<IClickStagePassThrough>) {
    return ({ event }: SigmaStageEventPayload) => {
        passthrough.selectedNode[1](null);
        onApplySearchQuery({ graph, renderer, passthrough, modes })('');

        forceLabel(graph, state.selectedNodesId, false);
        state.selectedNodesId = [];

        if (!modes['add']) {
            return;
        }

        // Sigma (ie. graph) and screen (viewport) coordinates are not the same.
        // So we need to translate the screen x & y coordinates to the graph one by calling the sigma helper `viewportToGraph`
        const coordForGraph = renderer.viewportToGraph({ x: event.x, y: event.y });

        // We create a new node
        const node = {
            ...coordForGraph,
            size: 15,
            color: 'red',
            label: (Math.random() + 1).toString(36).substring(7),
            type: 'border',
        };

        const maxId = graph.nodes().reduce((max, id) => Math.max(max, +id), 0) + 1;

        const closestNodes = graph
            .nodes()
            .map(nodeId => {
                const attrs = graph.getNodeAttributes(nodeId);
                const distance = Math.pow(node.x - attrs.x, 2) + Math.pow(node.y - attrs.y, 2);
                return { nodeId, distance };
            })
            .sort((a, b) => a.distance - b.distance)[0];

        graph.addNode(maxId, node);

        if (closestNodes) {
            // We create the edges
            graph.addEdge(maxId, closestNodes.nodeId, { size: '2' });
        }

        passthrough.cb(graph.nodes().map(node => graph.getNodeAttribute(node, 'label')));
    };
}

export function clickNode({ renderer, graph, modes, passthrough }: IApplyParams<IClickNodePassThrough>) {
    return ({ node }: SigmaNodeEventPayload) => {
        forceLabel(graph, state.selectedNodesId, false);

        if (modes['read']) {
        } else if (modes['delete']) {
            graph.dropNode(node);
            state.selectedNodesId = [];
            onNodeLeave({ renderer } as IApplyParams)();
            renderer.refresh();
        } else {
            // readdNode(graph, node);
            if (state.selectedNodesId[0] === node) {
                state.selectedNodesId.shift();
            } else if (state.selectedNodesId[1] === node) {
                state.selectedNodesId.pop();
            } else {
                if (state.selectedNodesId.length === 0) {
                    state.selectedNodesId[0] = node;
                } else {
                    state.selectedNodesId[1] = node;
                }

                passthrough.selectedNode[1]({
                    ...passthrough.selectedNode[0],
                    ...graph.getNodeAttributes(node),
                    node,
                });

                forceLabel(graph, state.selectedNodesId, true);
            }
        }
    };
}

export function clickEdge({ graph, renderer, modes }: IApplyParams) {
    return ({ edge }: SigmaEdgeEventPayload) => {
        if (modes['delete']) {
            graph.dropEdge(edge);
            renderer.refresh();
        }
    };
}

export function onApplySearchQuery({ graph, renderer }: IApplyParams) {
    return (query: string) => {
        if (query) {
            const suggestions = graph
                .nodes()
                .map(id => ({
                    id,
                    label: graph.getNodeAttribute(id, 'label').toLowerCase(),
                }))
                .filter(({ label }) => label.includes(query));

            if (suggestions.length === 1 && suggestions[0].label === query) {
                state.foundNode = suggestions[0].id;
                state.suggestions.clear();
                const nodePosition = renderer.getNodeDisplayData(state.foundNode) as Coordinates;
                renderer.getCamera().animate(nodePosition, {
                    duration: 500,
                });
            } else {
                delete state.foundNode;
                state.suggestions = new Set(suggestions.map(({ id }) => id));
            }
        } else {
            delete state.foundNode;
            state.suggestions.clear();
        }

        renderer.refresh();
    };
}

export function nodeReducer(node: string, data: Attributes) {
    const res: Partial<NodeDisplayData> = { ...data };

    if (state.hoveredNeighbors.size > 0 && !state.hoveredNeighbors.has(node) && state.hoveredNode !== node) {
        res.label = '';
        res.color = '#f6f6f6';
    }

    if (state.foundNode === node) {
        res.highlighted = true;
    } else if (state.suggestions.size > 0 && !state.suggestions.has(node)) {
        res.label = '';
        res.color = '#f6f6f6';
    }

    if (state.selectedNodesId.includes(node)) {
        res.color = '#13bcefe';
    }

    return res;
}

export function edgeReducer(graph: Graph<Attributes, Attributes, Attributes>) {
    return (edge: string, data: Attributes) => {
        const res: Partial<EdgeDisplayData> = { ...data };

        if (state.hoveredNode && !graph.hasExtremity(edge, state.hoveredNode)) {
            res.hidden = true;
        }

        if (state.suggestions.size > 0 && (!state.suggestions.has(graph.source(edge)) || !state.suggestions.has(graph.target(edge)))) {
            res.hidden = true;
        }

        return res;
    };
}

export function onConnectNodes({ graph, renderer, modes }: IApplyParams) {
    return () => {
        if (modes['add'] && state.selectedNodesId.length > 1) {
            const [node1, node2] = state.selectedNodesId;

            if (!graph.hasEdge(node1, node2)) {
                graph.addEdge(node1, node2, { key: EdgeId(node1, node2) });
                state.selectedNodesId = [];
            }
        }

        renderer.refresh();
    };
}

export function onExportGraph({ graph }: IApplyParams) {
    return () => {
        console.log(JSON.stringify(graph.export()));
    };
}

export function onChangeNodeAttribute({ graph, renderer }: IApplyParams) {
    return (attr: string, value: string) => {
        if (state.selectedNodesId.length > 0) {
            graph.setNodeAttribute(state.selectedNodesId.at(-1), attr, value);
            renderer.refresh();
        }
    };
}
