import { render, screen } from '@testing-library/react';
import HeaderBar from './HeaderBar';

import BombayLoginContext from '../Context/BombayLoginContext';

test('renders the HeaderBar with the title from context', () => {
    const result = render(
        <ContextChanger loginState={false} modeState="artist">
            <HeaderBar title="The Title" />
        </ContextChanger>
    );

    const headerTitleNode = screen.getByText('The Title');
    expect(headerTitleNode.tagName).toBe('DIV');
    expect(headerTitleNode.className).toBe('title');

    expect(headerTitleNode.parentElement.tagName).toBe('DIV');
    expect(headerTitleNode.parentElement.className).toBe('header-bar');

    expect(headerTitleNode.previousSibling).toBe(null);

    const loginStatusNode = headerTitleNode.nextSibling;
    expect(loginStatusNode.tagName).toBe('DIV');
    expect(loginStatusNode.className).toBe('login-status');

    expect(loginStatusNode.firstChild.tagName).toBe('DIV');
    expect(loginStatusNode.firstChild.className).toBe('label');
    expect(loginStatusNode.firstChild.nextSibling).toBe(null);

    expect(loginStatusNode.nextSibling).toBe(null);
})

test('changes the login status when the context changes', () => {
    const result = render(
        <ContextChanger loginState={false} modeState="artist">
            <HeaderBar title="The Title"/>
        </ContextChanger>
    );

    let headerTitleNode = screen.getByText('The Title');
    let loginStatusNode = headerTitleNode.nextSibling;

    expect(loginStatusNode.firstChild.tagName).toBe('DIV');
    expect(loginStatusNode.firstChild.className).toBe('label');
    expect(loginStatusNode.firstChild.nextSibling).toBe(null);

    toggleLogin();
    
    headerTitleNode = screen.getByText('The Title');
    loginStatusNode = headerTitleNode.nextSibling;

    expect(loginStatusNode.firstChild.tagName).toBe('BUTTON');
    expect(loginStatusNode.firstChild.className).toBe('logout btn');
    expect(loginStatusNode.firstChild.nextSibling).toBe(null);
})