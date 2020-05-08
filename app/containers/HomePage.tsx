import React from 'react';
import Client from '../components/client/Client';

import { Grid } from '@material-ui/core';

export default function HomePage() {
  return (
    <div>
      <Grid container spacing={1}>
        <Grid item xs={6}>
          <Client id={1} url={"https://dta-simplechat-backend.herokuapp.com"} />

        </Grid>
        <Grid item xs={6}>
          <Client id={2} url={"https://dta-simplechat-backend.herokuapp.com"} />

        </Grid>
      </Grid>
    </div>
  );
}
