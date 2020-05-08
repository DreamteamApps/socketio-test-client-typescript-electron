import React from 'react';
import Client from '../components/client/Client';

export default function HomePage() {
  return (
    <div>
      <Client url={"https://dta-simplechat-backend.herokuapp.com"} />
    </div>
  );
}
