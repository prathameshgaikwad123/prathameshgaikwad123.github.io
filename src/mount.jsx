import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';

export default function mount(element) {
    const container = document.getElementById('root');
    const tree = <StrictMode>{element}</StrictMode>;

    if (import.meta.env.PROD) hydrateRoot(container, tree);
    else createRoot(container).render(tree);
}
