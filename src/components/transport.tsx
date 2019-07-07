import { useQuery } from "react-apollo-hooks";
import styled from "styled-components";
import gql from "graphql-tag";
import TransportItem from "./transportItem";
import { LineLoader } from "./loading";

const lat = 60.187187;
const lon = 24.818151;

const GET_DATA = gql`
 {
  nearest(
    lat: ${lat}
    lon: ${lon}
    maxDistance: 1000
    filterByPlaceTypes: [BICYCLE_RENT, DEPARTURE_ROW]
    maxResults: 17
    ) {
			edges {
        node {
          place {
            __typename
            ... on DepartureRow {
              stop {
                vehicleMode
                name
              }
              stoptimes {
                realtime
                serviceDay
                scheduledDeparture
                realtimeDeparture
                trip {
                  route {
                    shortName
                    longName
                  }
                }
                headsign
              }
            }
          ... on BikeRentalStation {
              name
              spacesAvailable
              bikesAvailable
            }
          }
          distance
        }
      }
    }
  }
`;

const Hr = styled.div`
  padding: 0.4em 10px;
  border-bottom: 1px solid #cbcbcb;
  overflow: hidden;
`;

export default () => {
  const { data, error, loading } = useQuery(GET_DATA);

  if (error) {
    return <span>Error: {error}</span>;
  }

  return !loading ? (
    <table>
      <tbody>
        {data.nearest.edges.map((e, i) => (
          <TransportItem key={i} data={e.node} />
        ))}
      </tbody>
    </table>
  ) : (
    Array(12)
      .fill(0)
      .map(_ => (
        <>
          <LineLoader />
          <Hr />
        </>
      ))
  );
};
