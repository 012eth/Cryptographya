import FA2Layout from 'graphology-layout-forceatlas2/worker';
import forceAtlas2, { ForceAtlas2Settings } from 'graphology-layout-forceatlas2';
import styled from '@emotion/styled';
import ForceSupervisor from 'graphology-layout-force/worker';
import { useRef, useState } from 'react';
import Sigma from 'sigma';

import data from '../../data/data';
import useSigma, { IExtras } from '../../hooks/useSigma';
import { IModes } from '../../types/Sigma';
import Controls from './Controls';
import {
    onApplySearchQuery,
    clickNode,
    clickStage,
    onConnectNodes,
    edgeReducer,
    onExportGraph,
    MyGraph,
    nodeReducer,
    onNodeEnter,
    onNodeLeave,
    onChangeNodeAttribute,
    clickEdge,
} from './events';
import { Attributes } from 'graphology-types';
import { atom, useRecoilState } from 'recoil';

const SigmaContainer = styled.div`
    background-color: hsla(0, 0%, 100%, 1);
    background-image: radial-gradient(at 71% 100%, hsl(18deg 50% 49% / 18%) 0px, transparent 50%),
        radial-gradient(at 29% 29%, hsl(67deg 100% 50% / 8%) 0px, transparent 50%);

    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;
`;

let applySearch = (query: string) => {};
let connectNodes = () => {};
let exportGraph = () => {};
let changeNodeAttribute = (name: string) => {};
let setGraphMode = (mode: keyof IModes, state: boolean) => {};
let onFA2SettingsChange = (setting: string, value: number | boolean) => {};

let _fa2Settings: ForceAtlas2Settings = {
    adjustSizes: false,
    barnesHutOptimize: false,
    barnesHutTheta: 0.5,
    edgeWeightInfluence: 1,
    linLogMode: false,
    outboundAttractionDistribution: true,
    gravity: 0.1,
    scalingRatio: 1,
    slowDown: 5.356708826689592,
    strongGravityMode: true,
};

export const selectedNodeAtom = atom<Attributes | null>({
    key: 'selectedNode',
    default: null,
});

export default function () {
    const [options, setOptions] = useState<string[]>([]);
    const [fa2Settings, setFa2Settings] = useState(_fa2Settings);
    const selectedNode = useRecoilState(selectedNodeAtom);

    const handleGraph = (graph: MyGraph, renderer: Sigma, { apply, setMode }: IExtras) => {
        setGraphMode = setMode;
        graph.import(data as any);
        setOptions(graph.nodes().map(node => graph.getNodeAttribute(node, 'label')));

        setFa2Settings({ ...forceAtlas2.inferSettings(graph), ...fa2Settings });

        let fa2Layout = new FA2Layout(graph, {
            settings: fa2Settings,
            getEdgeWeight: 'weight',
        });

        fa2Layout.start();

        // setTimeout(() => fa2Layout.stop(), 1000);

        // const layout = new ForceSupervisor(graph);
        // layout.start();

        applySearch = apply(onApplySearchQuery);
        connectNodes = apply(onConnectNodes);
        exportGraph = apply(onExportGraph);
        changeNodeAttribute = apply(onChangeNodeAttribute);
        onFA2SettingsChange = (setting: string, value: number | boolean) => {
            _fa2Settings = { ..._fa2Settings, [setting]: value };
            setFa2Settings(_fa2Settings);
            fa2Layout.kill();
            fa2Layout = new FA2Layout(graph, {
                settings: _fa2Settings,
            });

            fa2Layout.start();
        };

        renderer.on('enterNode', apply(onNodeEnter));
        renderer.on('leaveNode', apply(onNodeLeave));
        renderer.on('clickStage', apply(clickStage, { selectedNode, cb: setOptions }));
        renderer.on('clickNode', apply(clickNode, { selectedNode }));
        renderer.on('clickEdge', apply(clickEdge));

        renderer.setSetting('nodeReducer', nodeReducer);
        renderer.setSetting('edgeReducer', edgeReducer(graph));
    };

    return (
        <>
            <SigmaContainer ref={useSigma(handleGraph)} />
            <Controls
                applySearch={applySearch}
                connectNodes={connectNodes}
                exportGraph={exportGraph}
                searchOptions={options}
                changeNodeAttribute={changeNodeAttribute}
                onModeChange={setGraphMode}
                selectedNode={selectedNode}
                onFA2SettingsChange={onFA2SettingsChange}
                fa2Settings={_fa2Settings}
            />
        </>
    );
}
