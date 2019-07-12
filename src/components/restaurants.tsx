import styled from "styled-components";
import { useFetch } from "../hooks";
import Restaurant from "./restaurant";

const RestaurantList = styled.div``;

const restaurants = [
  { id: 2, name: "T-talo" },
  { id: 3, name: "Täffä" },
  { id: 7, name: "TUAS" },
  { id: 52, name: "A Bloc" }
];

export default () => {
  const date = new Date().toISOString().split("T")[0];

  const restaurantData = restaurants.map(r => {
    return useFetch(`/restaurants/${r.id}/menu?day=${date}`, 0);
  });

  return (
    <>
      <RestaurantList>
        {restaurantData.map((r, i) => (
          <Restaurant key={i} data={r} />
        ))}
      </RestaurantList>
    </>
  );
};
