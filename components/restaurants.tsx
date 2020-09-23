import React from 'react'
import styled from 'styled-components'
import { getRestaurantData } from '../hooks'
import Restaurant from './restaurant'

const RestaurantList = styled.div``

const Restaurants: React.FC = (): JSX.Element => {
  const restaurantData = getRestaurantData()

  return (
    <RestaurantList>
      {restaurantData && restaurantData.length === 0 ? (
        <p>Ruokalistoja ei saatavilla</p>
      ) : (
        restaurantData.map((r, i) => <Restaurant key={i} data={r} />)
      )}
    </RestaurantList>
  )
}

export default Restaurants
