import Graph from 'graphology';
import { Attributes } from 'graphology-types';
import { useCallback, useLayoutEffect, useState } from 'react';
import Sigma from 'sigma';
import { IModes } from '../types/Sigma';
import circle from 'sigma/rendering/webgl/programs/node.fast';
import getNodeProgramImage from 'sigma/rendering/webgl/programs/node.image';
import NodeProgramBorder from '../programs/node.border';

export interface IApplyParams<T = Record<string, any>> {
    graph: Graph<Attributes, Attributes, Attributes>;
    renderer: Sigma;
    passthrough: T;
    modes: IModes;
}

type ArgedFunc = (...args: any[]) => void;
type AppliedFunc<T> = (args: IApplyParams<T>) => ArgedFunc;

export interface IExtras {
    container: HTMLElement;
    apply: <T = Record<string, any>>(func: AppliedFunc<T>, passthrough?: T) => ArgedFunc;
    setMode: (mode: keyof IModes, state: boolean) => void;
}

const modes: IModes = {
    add: false,
    delete: false,
    read: false,
};

export default function (handleGraph: (graph: Graph<Attributes, Attributes, Attributes>, renderer: Sigma, extras: IExtras) => void) {
    const [container, setContainer] = useState<HTMLElement | null>(null);

    useLayoutEffect(() => {
        if (container) {
            const graph = new Graph({
                type: 'undirected',
            });

            const renderer = new Sigma(graph, container, {
                labelDensity: 0.5,
                maxCameraRatio: 4,
                minCameraRatio: 0.1,
                enableEdgeClickEvents: true,
                nodeProgramClasses: {
                    circle,
                    image: getNodeProgramImage(),
                    border: NodeProgramBorder,
                },
            });

            handleGraph(graph, renderer, {
                setMode: (mode: keyof IModes, state: boolean) => {
                    modes[mode] = state;
                },
                container,
                apply: (func, passthrough) => func({ graph, renderer, modes, passthrough: passthrough! }),
            });

            return () => {
                graph.clear();
                renderer.clear();
            };
        }
    }, [container]);

    return useCallback(setContainer, []);
}
