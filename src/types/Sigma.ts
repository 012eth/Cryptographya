export type NodeEvents = 'clickNode' | 'rightClickNode' | 'downNode' | 'enterNode' | 'leaveNode' | 'doubleClickNode' | 'wheelNode';
export type EdgeEvents = 'clickEdge' | 'rightClickEdge' | 'downEdge' | 'enterEdge' | 'leaveEdge' | 'doubleClickEdge' | 'wheelEdge';
export type StageEvents = 'clickStage' | 'rightClickStage' | 'downStage' | 'doubleClickStage' | 'wheelStage' | 'kill';

export type NodeAttributes = {
    x: number;
    y: number;
    image: string;
    label: string | null;
    size: number;
    color: string;
    hidden: boolean;
    forceLabel: boolean;
    zIndex: number;
    type: string;
};

export interface IModes {
    add: boolean;
    delete: boolean;
    read: boolean;
}
