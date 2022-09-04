import styled from '@emotion/styled';
import ReactDOM from 'react-dom';
import { useRecoilValue } from 'recoil';
import { selectedNodeAtom } from '@/components/graph/Graph';

const Divv = styled.pre`
    position: absolute;
    top: 0;
    left: 0;
`;

export default function () {
    const ddd = useRecoilValue(selectedNodeAtom);
    return ReactDOM.createPortal(<Divv>{JSON.stringify(ddd, null, 4)}</Divv>, document.getElementById('root')!);
}
