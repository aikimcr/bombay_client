import { createContext } from 'react';

const BombayContext = createContext({
    title: 'Bombay Band Management System',
    loggedIn: false,
    mode: 'login',
});

export default BombayContext;