import React from 'react';
import PropTypes from 'prop-types';
import { Button, Grid } from 'semantic-ui-react';
import Checkbox from './CohortCheckbox';
import { PaddedGrid } from '../Styles/TeamStyles';

const CohortCheckboxList = props => {
  const { cohorts, handleCheckboxChange } = props;
  const cohortsList = cohorts.map(cohort => (
    <Grid.Column width={6} key={cohort.name}>
      <Checkbox cohort={cohort} handleCheckboxChange={handleCheckboxChange} />
    </Grid.Column>
  ));

  return (
    <div>
      <PaddedGrid columns={4} padded="vertically">
        {cohortsList}
        <br />
      </PaddedGrid>
      <Button primary>SHOW ATTENDANCE</Button>
    </div>
  );
};

CohortCheckboxList.propTypes = {
  cohorts: PropTypes.arrayOf(Object).isRequired,
  handleCheckboxChange: PropTypes.func.isRequired
};

export default CohortCheckboxList;
