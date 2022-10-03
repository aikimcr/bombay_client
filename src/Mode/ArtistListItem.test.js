import { act, render } from '@testing-library/react';

import ArtistListItem from './ArtistListItem';

it ('should render a list item', async () => {
    const [ modelDef, model ] = makeAModel('/artist');

    const result = render(<ArtistListItem artist={model} />);

    const index = result.container;

    expect(index.childElementCount).toBe(1);
    expect(index.firstChild.tagName).toBe('LI');
    expect(index.firstChild.className).toBe('card');
    expect(index.firstChild.textContent).toBe(modelDef.name);
});

it('should open the editor modal', async () => {
    const [modelDef, model] = makeAModel('/artist');

    const result = render(<ArtistListItem artist={model} />);

    const index = result.container;

    await act(async () => {
        index.firstChild.click();
    });

    const modalRoot = document.getElementById('modal-root');
    expect(modalRoot.childElementCount).toBe(1);
});