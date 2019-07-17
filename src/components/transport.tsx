import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import styled from 'styled-components';
import gql from 'graphql-tag';
import TransportItem from './transportItem';
import { LineLoader } from './loading';

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

interface Data {
  nearest: {
    edges: { any }[];
  };
}

const Hr = styled.div`
  padding: 0.4em 10px;
  border-bottom: 1px solid #cbcbcb;
  overflow: hidden;
`;

function compare(a, b) {
  const placeA = a.node.place;
  const placeB = b.node.place;

  if (
    placeA.__typename === 'BikeRentalStation' &&
    placeB.__typename !== 'BikeRentalStation'
  )
    return 1;
  if (
    placeA.__typename !== 'BikeRentalStation' &&
    placeB.__typename === 'BikeRentalStation'
  )
    return -1;
  if (
    placeA.__typename === 'BikeRentalStation' &&
    placeB.__typename === 'BikeRentalStation'
  )
    return 0;

  const { serviceDay: dayA, realtimeDeparture: depA } = placeA.stoptimes[0];
  const { serviceDay: dayB, realtimeDeparture: depB } = placeB.stoptimes[0];

  const timeA = dayA + depA;
  const timeB = dayB + depB;

  if (timeA > timeB) return 1;
  if (timeA < timeB) return -1;

  return 0;
}

function sortData(unordered: any) {
  const filtered = unordered.filter(
    d =>
      d.node.place.__typename === 'BikeRentalStation' ||
      d.node.place.stoptimes[0],
  );
  return filtered.sort((a, b) => compare(a, b));
}

const Transport = () => {
  const { data, error, loading } = useQuery<Data>(GET_DATA, {
    fetchPolicy: 'network-only',
  });

  if (error) {
    return <span>Error: {error}</span>;
  }

  if (loading) {
    return (
      <>
        {Array(12)
          .fill(0)
          .map((_, i) => (
            <div key={i}>
              <LineLoader />
              <Hr />
            </div>
          ))}
      </>
    );
  }

  const sorted = sortData(data.nearest.edges);

  return (
    <table>
      <tbody>
        {sorted.map((e: { node: any }, i: string) => (
          <TransportItem key={i} data={e.node} />
        ))}
      </tbody>
    </table>
  );
};

export default Transport;
