import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Restaurants from './restaurants';
import Transport from './transport';

const { SIDEBAR_SWITCH_INTERVAL } = require('../../config');

const Sidebar = styled.div`
  height: 100%;
  width: ${({ theme }) => theme.sidebarWidth};
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: ${({ theme }) => theme.contentPadding};
  background-color: ${({ theme }) => theme.contentBackgroundColor};
  box-shadow: ${({ theme }) => theme.contentBoxShadow};
  z-index: 10;
  overflow: hidden;
`;

export default () => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    let timeout = setInterval(() => {
      setShow(t => !t);
    }, SIDEBAR_SWITCH_INTERVAL);
    return () => {
      clearInterval(timeout);
    };
  }, []);

  return <Sidebar>{show ? <Restaurants /> : <Transport />}</Sidebar>;
};
