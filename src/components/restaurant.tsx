import styled from "styled-components";
import moment from "moment";

const Restaurant = styled.div``;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 900;
`;

const OpenHours = styled.span`
  font-size: 12px;
  font-weight: 400;
`;

const Menus = styled.ul``;

const MenuItem = styled.li`
  color: ${({ theme }) => theme.textColor};
  margin: 5px 0;
`;

export default ({ data }) => {
  const dateIndex = moment().isoWeekday() - 1;

  return (
    <Restaurant>
      <Title>{data.name}</Title>
      <OpenHours>{data.openingHours[dateIndex]}</OpenHours>

      <Menus>
        {data.menus.length === 0 ? (
          <MenuItem>Ruokalistaa ei saatavilla</MenuItem>
        ) : (
          data.menus.map(m =>
            m.courses.length === 0 ? (
              <MenuItem key={0}>Ruokalistaa ei saatavilla</MenuItem>
            ) : (
              m.courses.map((c, i) => <MenuItem key={i}>{c.title}</MenuItem>)
            )
          )
        )}
      </Menus>
    </Restaurant>
  );
};
