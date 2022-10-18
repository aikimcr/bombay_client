import { useContext } from 'react';
import { BrowserRouter } from 'react-router-dom';

import ConfigurationContext from '../Context/ConfiguratonContext';

import ContentRoutes from './ContentRoutes';

function Content(props) {
    const { routerBase } = useContext(ConfigurationContext);

    console.log(`Router Base path: ${routerBase}`);
    
    return (
        <div className="content">
            <BrowserRouter basename={routerBase}>
                <ContentRoutes />
            </BrowserRouter>
        </div>
    );
}

export default Content;