import React from 'react'
import styled, { css, FlattenSimpleInterpolation } from 'styled-components'
import BikeIcon from './icons/bike'
import BusIcon from './icons/bus'
import MetroIcon from './icons/metro'
import { Place, isBikePlace } from '../types'
import moment from 'moment'

moment.locale('fi', { invalidDate: '' })

interface InfoInterface {
  readonly leavesSoon: boolean
}

const Distance = styled.span`
  font-size: 12px;
`

const Destination = styled.span`
  font-size: 12px;
`

const Info = styled.span<InfoInterface>`
  font-size: 22px;
  white-space: nowrap;

  ${({ leavesSoon }): FlattenSimpleInterpolation =>
    leavesSoon &&
    css`
      color: #3f8600;
    `};
`

const Line = styled.span`
  font-size: 16px;
  min-width: 100px;
  white-space: nowrap;
`

const IconContainer = styled.span`
  height: 20px;
  width: 20px;
  display: inline-block;
  vertical-align: middle;
  margin-right: 0.4em;
`

const Td = styled.td`
  padding: 0.6em 10px;
  border-bottom: 1px solid #cbcbcb;
  overflow: hidden;
`

function getIcon(place: Place): JSX.Element {
  if (isBikePlace(place)) {
    return (
      <IconContainer>
        <BikeIcon />
      </IconContainer>
    )
  } else {
    return place.stop.vehicleMode === 'BUS' ? (
      <IconContainer>
        <BusIcon />
      </IconContainer>
    ) : (
      <IconContainer>
        <MetroIcon />
      </IconContainer>
    )
  }
}

function getInfo(place: Place): string {
  if (isBikePlace(place)) {
    const { bikesAvailable, spacesAvailable } = place
    const capacity = bikesAvailable + spacesAvailable
    return `${bikesAvailable} / ${capacity}`
  } else {
    const { serviceDay, realtimeDeparture } = place.stoptimes[0]

    const transportTime = serviceDay + realtimeDeparture
    return moment.unix(transportTime).format('HH:mm')
  }
}

function getLine(place: Place): string {
  return isBikePlace(place) ? '' : place.stoptimes[0].trip.route.shortName
}

function getDestination(place: Place): string {
  return isBikePlace(place) ? place.name : place.stoptimes[0].headsign
}

interface Props {
  data: {
    distance: number
    place: Place
  }
}

const TransportItem: React.FC<Props> = ({ data }): JSX.Element => {
  const { distance, place } = data
  let icon: JSX.Element, info: string, line: string, destination: string
  let leavesSoon = false

  if (!isBikePlace(place)) {
    if (!place.stoptimes[0]) return null

    const { serviceDay, realtimeDeparture } = place.stoptimes[0]
    const currentTime = moment()
    const transportTime = serviceDay + realtimeDeparture

    if (currentTime.unix() > transportTime) return null
    if (transportTime - currentTime.unix() > 10000) return null
    if (transportTime - currentTime.unix() < 600) leavesSoon = true
  }

  icon = getIcon(place)
  info = getInfo(place)
  line = getLine(place)
  destination = getDestination(place)

  return (
    <tr>
      <Td>
        <Distance>{distance}m</Distance>
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
  )
}

export default TransportItem
