import React, { useEffect, useState, useRef } from 'react';
import styles from './Client.css';

import axios from 'axios';
import socketIO from 'socket.io-client';

import { makeStyles } from '@material-ui/core/styles';
import { Paper, Grid, Table, TableBody, TableCell, TableHead, TableRow, Button, IconButton } from '@material-ui/core';

import EditIcon from '@material-ui/icons/Edit';
import PlayCircleFilled from '@material-ui/icons/PlayCircleFilled';
import AddCircleOutline from '@material-ui/icons/AddCircleOutline';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
}));

type Props = {
  url: string;
  id: number;
};

enum EventTypes {
  emit,
  listen
}

class Listener {
  public event: string;
  public color?: string;
  public customFormater?: Function;

  constructor(event: string, color?: string, customFormater?: Function) {
    this.event = event;
    this.color = color;
    this.customFormater = customFormater;
  }
};

class Emiter {
  public event: string;
  public payload?: any;
  public color?: string;

  constructor(event: string, payload?: any, color?: string) {
    this.event = event;
    this.payload = payload;
    this.color = color;
  }
};

class Event {
  public type: EventTypes;
  public event: string;
  public message: string;
  public color?: string;
  public payload?: any;

  constructor(type: EventTypes, event: string, message?: any, payload?: any, color?: string) {
    this.type = type;
    this.event = event;
    this.message = message;
    this.color = color;
    this.payload = payload;
  }
};



export default function Client(props: Props) {
  const classes = useStyles();

  const { url } = props;

  const [emiters, setEmiters] = useState(new Array<Emiter>());
  const [listeners, setListeners] = useState(new Array<Listener>());
  const [events, setEvents] = useState(new Array<Event>());

  const socketClient = useRef();

  useEffect(() => {
    const client = socketIO(url);

    socketClient.current = client;

    setTimeout(() => {
      addEmiter('client-connect');
      addEmiter('join-room', { userId: props.id });
      addEmiter('writing-message');
      addEmiter('send-message', {
        "message": "e ai",
        "type": "text"
      });

      addListener('total-online');
      addListener('user-joined');
      addListener('user-leaved');
      addListener('user-writing-message');
      addListener('user-send-message');
    }, 1000)

    return () => {
      socketClient.current.disconnect();
    }
  }, []);

  const addEmiter = (event: string, payload?: any, color?: string) => {
    if (emiters.find(emiter => emiter.event == event)) {
      throw "Emiter already defined";
    }

    const emiter = new Emiter(event, payload, color);

    setEmiters(emiters => [...emiters, emiter]);
  }

  const addListener = (event: string, customFormater?: Function, color?: string) => {
    if (listeners.find(listener => listener.event == event)) {
      throw "Listener already defined";
    }

    const listener = new Listener(event, color, customFormater);

    socketClient.current.on(event, (data: any) => handleListenerIncoming(listener, data));

    setListeners(listeners => [...listeners, listener])
  }

  const handleListenerIncoming = (listener: Listener, data: any) => {
    const { color, customFormater } = listener;

    const message = customFormater ? customFormater(data) : `Received ${listener.event} ${JSON.stringify(data, null, 2)}`;

    addEvent(EventTypes.listen, listener.event, data, message, color);
  }

  const runEmiter = (emiter: Emiter) => {
    socketClient.current.emit(emiter.event, emiter.payload);

    addEvent(EventTypes.emit, emiter.event, emiter.payload, `Emited ${emiter.event}`, emiter.color);
  }

  const addEvent = (type: EventTypes, event: string, payload?: any, message?: string, color?: string) => {
    const newEvent = new Event(type, event, message, payload, color);

    setEvents(events => [newEvent, ...events]);
  }

  return (
    <div className={classes.root}>
      <h4>{url}</h4>
      <Grid container spacing={1}>
        <Grid item xs={6}>
          <Paper className={classes.paper} style={{ minWidth: 400 }}>
            <Table style={{ height: 300 }}>
              <TableHead>
                <TableRow>
                  <TableCell align={'left'}>
                    <span style={{ fontSize: 20 }}>Emiters</span>
                  </TableCell>
                  <TableCell align={'left'}>
                  </TableCell>
                  <TableCell align={'right'}>
                    <IconButton style={{ padding: 5 }} color="primary">
                      <AddCircleOutline />
                    </IconButton>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {emiters.map((emiter, i) => {
                  return (
                    <TableRow hover role="checkbox" tabIndex={-1} key={i}>
                      <TableCell align={'left'} style={{ width: 30 }}>
                        {emiter.event}
                      </TableCell>
                      <TableCell align={'center'} style={{ width: 150 }}>
                        {emiter.payload && JSON.stringify(emiter.payload, null, 2)}
                        {!emiter.payload && 'none'}
                      </TableCell>
                      <TableCell align={'right'} style={{ width: 20 }}>
                        <IconButton style={{ padding: 5 }} color="primary">
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => runEmiter(emiter)} style={{ padding: 5, color: 'green' }}>
                          <PlayCircleFilled />
                        </IconButton>

                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper className={classes.paper} style={{ minWidth: 400 }}>
            <Table style={{ height: 300 }}>
              <TableHead>
                <TableRow>
                  <TableCell align={'left'}>
                    <span style={{ fontSize: 20 }}>Listeners</span>
                  </TableCell>
                  <TableCell align={'left'}>
                  </TableCell>
                  <TableCell align={'right'}>
                    <IconButton style={{ padding: 5 }} color="primary">
                      <AddCircleOutline />
                    </IconButton>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {listeners.map((listener, i) => {
                  return (
                    <TableRow hover role="checkbox" tabIndex={-1} key={i}>
                      <TableCell colSpan={3} align={'left'} style={{ width: 30 }}>
                        <div>
                          {listener.event}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Table style={{ height: 300 }}>
              <TableHead>
                <TableRow>
                  <TableCell align={'left'}>
                    <span style={{ fontSize: 20 }}>Events</span>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {events.map((event, i) => {
                  return (
                    <TableRow hover role="checkbox" tabIndex={-1} key={i}>
                      {event.type === EventTypes.emit &&
                        <TableCell align={'left'} style={{ width: 30 }}>
                          <h4>{event.message}</h4>
                        </TableCell>
                      }

                      {event.type === EventTypes.listen &&
                        <TableCell align={'right'} style={{ width: 30 }}>
                          <h4>{event.message}</h4>
                        </TableCell>
                      }
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>
    </div >
  );
}
