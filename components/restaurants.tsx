import React from 'react'
import styled from 'styled-components'
import { useRestaurantData } from '../hooks'
import { DotLoader } from './loading'
import Restaurant from './restaurant'

const RestaurantList = styled.div``

const Restaurants: React.FC = () => {
  const restaurantData = useRestaurantData()

  if (!restaurantData) return <DotLoader />

  return (
    <RestaurantList>
      {restaurantData.length === 0 ? (
        <p>Ruokalistoja ei saatavilla</p>
      ) : (
        restaurantData.map((r, i) => <Restaurant key={i} data={r} />)
      )}
    </RestaurantList>
  )
}

export default Restaurants
