import styled from "styled-components";
import { getRestaurantData } from "../hooks";
import Restaurant from "./restaurant";

const RestaurantList = styled.div``;

export default () => {
  const restaurantData = getRestaurantData();

  return (
    <RestaurantList>
      {restaurantData && restaurantData.length === 0 ? (
        <p>Ruokalistoja ei saatavilla</p>
      ) : (
        restaurantData.map((r, i) => <Restaurant key={i} data={r} />)
      )}
    </RestaurantList>
  );
};
