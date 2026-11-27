import { Suspense, lazy, useEffect, useState } from 'react';
import { motionOK, onMedia } from '../hooks/dom.js';

const Mark = lazy(() => import('./ReticleMark.jsx'));

export default function Reticle() {

    const [wanted, setWanted] = useState(false);

    useEffect(() => {
        const fine = window.matchMedia('(pointer: fine)');
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

        const decide = () => setWanted(fine.matches && motionOK());

        decide();
        const offFine = onMedia(fine, decide);
        const offReduce = onMedia(reduce, decide);

        return () => {
            offFine();
            offReduce();
        };
    }, []);

    if (!wanted) return null;

    return (
        <Suspense fallback={null}>
            <Mark />
        </Suspense>
    );
}
