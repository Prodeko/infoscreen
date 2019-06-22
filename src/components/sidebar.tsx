import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Restaurants from "./restaurants";
import Transport from "./transport";
import moment from "moment";

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
  const [showRestaurants, setShowRestaurants] = useState(true);

  useEffect(() => {
    const dateIndex = moment().isoWeekday() - 1;
    if ([5, 6].includes(dateIndex)) {
      // Don't show restaurants on the weekends
      setShowRestaurants(false);
    }

    const hour = moment().hour();
    if (hour < 10 || hour > 14) {
      // Show restaurants between 10AM and 2PM
      setShowRestaurants(false);
    }
  }, []);

  return <Sidebar>{showRestaurants ? <Restaurants /> : <Transport />}</Sidebar>;
};
