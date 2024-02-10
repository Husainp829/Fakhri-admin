/* eslint-disable no-console */
import React, { createContext, useState } from "react";
import { getEventId } from "../utils";
export const EventContext = createContext();

export default ({ children }) => {
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [openDialog, setDialog] = useState(false);
  const currentEventId = getEventId();
  const currentEvent = events.find((event) => event.id === currentEventId) || {};

  return (
    <EventContext.Provider
      value={{
        events,
        setEvents,
        currentEvent,
        currentEventId,
        setDialog,
        openDialog,
        eventsLoading,
        setEventsLoading,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};
