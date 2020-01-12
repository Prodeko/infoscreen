import React from 'react'
import styled from 'styled-components'
import moment from 'moment'
import { RestaurantData, Menu, Course } from '../types'

const RestaurantContainer = styled.div``

const Title = styled.h2`
  font-size: 20px;
  font-weight: 900;
`

const OpenHours = styled.span`
  font-size: 12px;
  font-weight: 400;
`

const Menus = styled.ul``

const MenuItem = styled.li`
  color: ${({ theme }) => theme.textColor};
  margin: 5px 0;
`

interface Props {
  data: RestaurantData
}

const Restaurant: React.FC<Props> = ({ data }): JSX.Element => {
  const dateIndex = moment().isoWeekday() - 1

  return (
    <RestaurantContainer>
      <Title>{data.name}</Title>
      <OpenHours>{data.openingHours[dateIndex]}</OpenHours>

      <Menus>
        {data.menus.length === 0 ? (
          <MenuItem>Ruokalistaa ei saatavilla</MenuItem>
        ) : (
          data.menus.map((m: Menu) =>
            m.courses.length === 0 ? (
              <MenuItem key={0}>Ruokalistaa ei saatavilla</MenuItem>
            ) : (
              m.courses.map(
                (c: Course, i: number): JSX.Element => (
                  <MenuItem key={i}>{c.title}</MenuItem>
                ),
              )
            ),
          )
        )}
      </Menus>
    </RestaurantContainer>
  )
}

export default Restaurant
