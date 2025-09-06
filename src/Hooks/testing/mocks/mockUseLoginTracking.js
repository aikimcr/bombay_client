import React, { useState } from 'react';

export const mockUseLoginTracking = () => {
  const [loginState, setLoginState] = useState(false);
  return [loginState, setLoginState];
};
