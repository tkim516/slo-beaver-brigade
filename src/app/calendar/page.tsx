import React from 'react'
import Calendar from '@components/Calendar'
import Event, {IEvent} from '@database/eventSchema'
import style from "@styles/calendar/eventpage.module.css"
import connectDB from '@database/db'

//gets events from api endpoint
export async function getEvents() {
    await connectDB();
    try {
        // query for all events and sort by date
        console.log("Getting events");
        const events = await Event.find().orFail()
        // returns all events in json format or errors
        return events;
        } 
    catch (err) {
        console.log("Error getting events: ", err);
        return [];
    }
}

  //converts an event into a FullCalendar event
  export function Calendarify(event : IEvent) {
    //convert events into plain object before passing into client component
    const calEvent = JSON.parse(JSON.stringify(event));

    calEvent.title = event.eventName;
    delete calEvent.eventName;
    calEvent.start = event.startTime;
    calEvent.end = event.endTime;

    if(event.eventName == "Beaver Walk"){
      calEvent.backgroundColor = "#8A6240"
      calEvent.borderColor = "#4D2D18"
      calEvent.textColor = "#fff"
    }
    else{
      calEvent.backgroundColor = "#0077b6"
      calEvent.borderColor = "#03045e"
      calEvent.textColor = "#fff"
    }

    return calEvent
  }

export default async function Events() {
  const events = await getEvents();
  const calEvent = events.map(Calendarify)

  return (
    <div className={style.page}>
        <header className={style.header}>
            <h1>Event Calendar</h1>
        </header>
        <main>
            <div>
                <Calendar events={calEvent} admin={false}
                />
            </div>
        </main>
    </div>
  )
}