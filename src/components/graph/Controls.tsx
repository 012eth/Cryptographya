import styled from '@emotion/styled';
import { ForceAtlas2Settings } from 'graphology-layout-forceatlas2';
import { Attributes } from 'graphology-types';
import { useState } from 'react';
import { SetterOrUpdater } from 'recoil';
import { IModes } from '../../types/Sigma';

interface IProps {
    searchOptions: string[];
    applySearch: (query: string) => void;
    connectNodes: () => void;
    exportGraph: () => void;
    changeNodeAttribute: (attribute: string, label: string) => void;
    onModeChange: (mode: keyof IModes, state: boolean) => void;
    onFA2SettingsChange: (setting: string, value: number | boolean) => void;
    fa2Settings: ForceAtlas2Settings;
    selectedNode: [Attributes | null, SetterOrUpdater<Attributes | null>];
}

const Controls = styled.div`
    position: absolute;
    right: 1em;
    top: 1em;

    user-select: none;
    display: flex;
    flex-direction: column;
    width: 20rem;
`;

const SearchContainer = styled.div`
    & > input {
        width: 100%;
        height: 2rem;
    }
`;

const ConnectNodes = styled.button`
    width: 100%;
`;
const Input = styled.input`
    width: 100%;
    box-sizing: border-box;
    height: 2rem;
`;
const Checkbox = styled.input``;
const Label = styled.label`
    display: flex;
    justify-content: space-between;
`;

const GeneralControls = styled.details`
    & > summary {
        font-size: 1.4rem;
        text-decoration: underline;
        margin-block: 10px;
    }
`;

const FA2Settings = styled.details`
    & > summary {
        font-size: 1.4rem;
        text-decoration: underline;
        margin-block: 10px;
    }
`;

const DetailsContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

export default function ({
    searchOptions,
    applySearch,
    connectNodes,
    exportGraph,
    changeNodeAttribute: changeNodeLabel,
    onModeChange,
    selectedNode: [selectedNode, setSelectedNode],
    onFA2SettingsChange,
    fa2Settings,
}: IProps) {
    const [searchQuery, setSearchQuery] = useState<string>('');

    const onAttributeChange = (attr: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        changeNodeLabel(attr, e.currentTarget.value);
        setSelectedNode({
            ...selectedNode,
            [attr]: e.currentTarget.value,
        });
    };

    return (
        <Controls>
            <GeneralControls open>
                <summary>General</summary>
                <DetailsContainer>
                    <SearchContainer>
                        <input
                            type="search"
                            id="search-input"
                            list="suggestions"
                            placeholder="Try searching for a node..."
                            value={searchQuery}
                            onInput={e => {
                                setSearchQuery(e.currentTarget.value.toLowerCase());
                                applySearch(e.currentTarget.value.toLowerCase());
                            }}
                        />
                        <datalist id="suggestions">
                            {searchOptions.map(option => (
                                <option key={option} value={option} />
                            ))}
                        </datalist>
                    </SearchContainer>
                    <Input
                        placeholder="nodename"
                        onChange={onAttributeChange('label')}
                        onBlur={e => (e.currentTarget.value = '')}
                        value={selectedNode?.label}
                    />
                    <Input
                        type="number"
                        placeholder="size"
                        onChange={onAttributeChange('size')}
                        onBlur={e => (e.currentTarget.value = '')}
                        value={selectedNode?.size ?? ''}
                        step={0.5}
                        max={30}
                        min={1}
                    />
                    <Input type="color" value={selectedNode?.color} onChange={onAttributeChange('color')} />
                    <ConnectNodes onClick={() => connectNodes()}>Connect Nodes</ConnectNodes>
                    <ConnectNodes onClick={() => console.log(exportGraph())}>Export</ConnectNodes>

                    <Label>
                        Add nodes
                        <Checkbox type="checkbox" onChange={e => onModeChange('add', e.currentTarget.checked)} />
                    </Label>
                    <Label>
                        delete
                        <Checkbox type="checkbox" onChange={e => onModeChange('delete', e.currentTarget.checked)} />
                    </Label>
                    <Label>
                        read
                        <Checkbox type="checkbox" onChange={e => onModeChange('read', e.currentTarget.checked)} />
                    </Label>
                </DetailsContainer>
            </GeneralControls>
            <FA2Settings>
                <summary>ForceAtlas2 Settings</summary>
                <DetailsContainer>
                    <Label>
                        adjustSizes
                        <Checkbox
                            type="checkbox"
                            checked={fa2Settings.adjustSizes}
                            onChange={e => onFA2SettingsChange('adjustSizes', e.currentTarget.checked)}
                        />
                    </Label>
                    <Label>
                        barnesHutOptimize
                        <Checkbox
                            type="checkbox"
                            checked={fa2Settings.barnesHutOptimize}
                            onChange={e => onFA2SettingsChange('barnesHutOptimize', e.currentTarget.checked)}
                        />
                        <input
                            type="number"
                            step={0.1}
                            value={fa2Settings.barnesHutTheta}
                            onInput={e => onFA2SettingsChange('barnesHutTheta', +e.currentTarget.value)}
                        />
                    </Label>
                    <Label>
                        edgeWeightInfluence
                        <input
                            type="number"
                            step={0.1}
                            value={fa2Settings.edgeWeightInfluence}
                            onInput={e => onFA2SettingsChange('edgeWeightInfluence', +e.currentTarget.value)}
                        />
                    </Label>
                    <Label>
                        linLogMode
                        <Checkbox
                            type="checkbox"
                            checked={fa2Settings.linLogMode}
                            onChange={e => onFA2SettingsChange('linLogMode', e.currentTarget.checked)}
                        />
                    </Label>
                    <Label>
                        outboundAttractionDistribution
                        <Checkbox
                            type="checkbox"
                            checked={fa2Settings.outboundAttractionDistribution}
                            onChange={e => onFA2SettingsChange('outboundAttractionDistribution', e.currentTarget.checked)}
                        />
                    </Label>
                    <Label>
                        gravity
                        <input
                            type="number"
                            step={0.1}
                            value={fa2Settings.gravity}
                            onInput={e => onFA2SettingsChange('gravity', +e.currentTarget.value)}
                        />
                    </Label>
                    <Label>
                        scalingRatio
                        <input
                            type="number"
                            step={0.1}
                            value={fa2Settings.scalingRatio}
                            onInput={e => onFA2SettingsChange('scalingRatio', +e.currentTarget.value)}
                        />
                    </Label>
                    <Label>
                        strongGravityMode
                        <Checkbox
                            type="checkbox"
                            checked={fa2Settings.strongGravityMode}
                            onChange={e => onFA2SettingsChange('strongGravityMode', e.currentTarget.checked)}
                        />
                    </Label>
                    <Label>
                        slowDown
                        <input
                            type="number"
                            step={0.1}
                            value={fa2Settings.slowDown}
                            onInput={e => onFA2SettingsChange('slowDown', +e.currentTarget.value)}
                        />
                    </Label>
                </DetailsContainer>
            </FA2Settings>
        </Controls>
    );
}
