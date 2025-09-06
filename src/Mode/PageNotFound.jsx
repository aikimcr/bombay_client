import React from 'react';

import './PageNotFound.scss';

export const PageNotFound = () => {
  // Use disapointed face emoji &#x1f61e;

  return (
    <div className="error-404">
      <div className="emoji">&#x1f61e;</div>
      <div>
        That page doesn't seem to exist. I'm really sorry. Maybe check your URL
        and try again.
      </div>
      <div>
        <a href="/">Back To Home</a>
      </div>
    </div>
  );
};
