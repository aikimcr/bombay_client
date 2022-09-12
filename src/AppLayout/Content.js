import { BrowserRouter } from 'react-router-dom';

import ContentRoutes from './ContentRoutes';

function Content(props) {
    return (
        <div className="content">
            <BrowserRouter baseName="/">
                <ContentRoutes />
            </BrowserRouter>
        </div>
    );
}

export default Content;