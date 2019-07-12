import styled, { css } from "styled-components";
import BikeIcon from "./icons/bike";
import BusIcon from "./icons/bus";
import MetroIcon from "./icons/metro";
import moment from "moment";

moment.locale("fi");

interface InfoInterface {
  readonly leavesSoon: boolean;
}

const Distance = styled.span`
  font-size: 12px;
`;

const Destination = styled.span`
  font-size: 12px;
`;

const Info = styled.span<InfoInterface>`
  font-size: 22px;
  white-space: nowrap;

  ${({ leavesSoon }) =>
    leavesSoon &&
    css`
      color: #3f8600;
    `};
`;

const Line = styled.span`
  font-size: 16px;
  min-width: 100px;
  white-space: nowrap;
`;

const IconContainer = styled.span`
  height: 20px;
  width: 20px;
  display: inline-block;
  vertical-align: middle;
  margin-right: 0.4em;
`;

const Td = styled.td`
  padding: 0.6em 10px;
  border-bottom: 1px solid #cbcbcb;
  overflow: hidden;
`;

export default ({ data }) => {
  const { place } = data;
  let icon, info, line, destination;
  let leavesSoon = false;

  if (place.__typename === "BikeRentalStation") {
    icon = (
      <IconContainer>
        <BikeIcon />
      </IconContainer>
    );

    line = "";
    destination = place.name;
    const { bikesAvailable, spacesAvailable } = place;
    const capacity = bikesAvailable + spacesAvailable;
    info = `${bikesAvailable} / ${capacity}`;
  } else {
    if (!place.stoptimes[0]) return null;

    const {
      serviceDay,
      realtimeDeparture,
      headsign,
      trip
    } = place.stoptimes[0];

    const currentTime = moment();
    const transportTime = serviceDay + realtimeDeparture;

    if (currentTime.unix() > transportTime) return null;
    if (transportTime - currentTime.unix() > 10000) return null;
    if (transportTime - currentTime.unix() < 600) leavesSoon = true;

    info = moment.unix(transportTime).format("HH:mm");
    //info = currentTime.to(info);

    icon =
      place.stop.vehicleMode === "BUS" ? (
        <IconContainer>
          <BusIcon />
        </IconContainer>
      ) : (
        <IconContainer>
          <MetroIcon />
        </IconContainer>
      );

    line = trip.route.shortName;
    destination = headsign;
  }

  return (
    <tr>
      <Td>
        <Distance>{data.distance}m</Distance>
      </Td>
      <Td>
        <Line>
          <IconContainer>{icon}</IconContainer>
          {line}
        </Line>
      </Td>
      <Td>
        <Destination>{destination} </Destination>
      </Td>
      <Td>
        <Info leavesSoon={leavesSoon}>{info}</Info>
      </Td>
    </tr>
  );
};
