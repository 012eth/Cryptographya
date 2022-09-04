import Graph from 'graphology';
import { Attributes } from 'graphology-types';

export function forceLabel(graph: Graph<Attributes, Attributes, Attributes>, nodes: string[], state: boolean) {
    nodes.forEach(node => graph.setNodeAttribute(node, 'forceLabel', state ? state : undefined));
}

export function readdNode(graph: Graph<Attributes, Attributes, Attributes>, node: string) {
    const attrs = graph.getNodeAttributes(node);
    const neightbors = [...new Set(graph.neighbors(node))];
    const edges = neightbors.map(n => [node, n, graph.getEdgeAttributes(node, n)] as [string, string, Attributes]);
    graph.dropNode(node);
    graph.addNode(node, { ...attrs });
    edges.forEach(edge => graph.addUndirectedEdge(...edge));
}
