"use client";
import React, { useEffect, useState } from "react";
import style from "@styles/admin/events.module.css";
import EventPreviewComponent from "@components/EventCard";
import ExpandedTest from "@components/StandaloneExpandedViewComponent";
import { ObjectId } from "mongoose";
import { MagnifyingGlassIcon } from "@heroicons/react/16/solid";
import Link from "next/link";
import { getEvents } from "app/actions/eventsactions";
import { IEvent } from "@database/eventSchema";
import {
  Checkbox,
  CheckboxGroup,
  Stack,
} from "@chakra-ui/react";

// interface IEvent {
//   _id: string;
//   eventName: string;
//   location: string;
//   description: string;
//   wheelchairAccessible: boolean;
//   spanishSpeakingAccommodation: boolean;
//   startTime: Date;
//   endTime: Date;
//   volunteerEvent: boolean;
//   visitorCount?: number;
//   groupsAllowed: ObjectId[];
//   registeredIds: ObjectId[];
//   digitalWaiver: string | null;
// }

const EventPreview = () => {
  //states
  const [events, setEvents] = useState<IEvent[]>([]);
  const [groupNames, setGroupNames] = useState<{ [key: string]: string }>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("latest");
  const [spanishSpeakingOnly, setSpanishSpeakingOnly] = useState(false);
  const [wheelchairAccessible, setWheelchairAccessible] = useState(false);
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [showFutureEvents, setShowFutureEvents] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null);

  // get string for some group based on id
  const fetchGroupName = async (groupId: ObjectId): Promise<string> => {
    try {
      const res = await fetch(`/api/groups/${groupId}`);
      if (res.ok) {
        const data = await res.json();
        return data.group.group_name;
      } else {
        console.error("Error fetching group name:", res.statusText);
        return "SLO Beaver Brigade";
      }
    } catch (error) {
      console.error("Error fetching group name:", error);
      return "SLO Beaver Brigade";
    }
  };

  // grab all events from route
  useEffect(() => {
    const fetchEvents = async () => {
      try {

        const res = await getEvents(-1, -1)
        if (!res){
            console.log("Error getting events.")
            return;
        }
        const data = JSON.parse(res)
        console.log(data)
        setEvents(
          data.map((event: IEvent) => ({
            ...event,
            startTime: new Date(event.startTime),
            endTime: new Date(event.endTime),
            groupsAllowed: event.groupsAllowed || [],
          }))
        );

        const names: { [key: string]: string } = {};
        setLoading(true);
        await Promise.all(
          data.map(async (event: IEvent) => {
            if (event.groupsAllowed && event.groupsAllowed.length > 0) {
              const groupName = await fetchGroupName(event.groupsAllowed[0]);
              names[event._id] = groupName;
            } else {
              names[event._id] = "SLO Beaver Brigade";
            }
          })
        );
        setGroupNames(names);
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    };

    fetchEvents();
  }, []);

  // open standAloneComponent on click
  const handleEventClick = (event: IEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  // filtering events logic
  const filteredEvents = events
    .filter((event) =>
      spanishSpeakingOnly ? event.spanishSpeakingAccommodation : true
    )
    .filter((event) =>
      wheelchairAccessible ? event.wheelchairAccessible : true
    )
    .filter((event) => {
      const eventDate = new Date(event.startTime);
      const now = new Date();
      if (showFutureEvents && showPastEvents) {
        return true;
      } else if (showFutureEvents) {
        return eventDate >= now;
      } else if (showPastEvents) {
        return eventDate <= now;
      }
      return true;
    })
    .filter((event) =>
      event.eventName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) =>
      sortOrder === "earliest"
        ? new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        : new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
  return (
    <div className={style.mainContainer}>
      <aside className={style.sidebar}>
        <Link href={"/admin/events/create"}>
            <button className={style.yellowButton}>Create new event</button>
        </Link>
        <div className={style.searchWrapper}>
          <input
            type="text"
            placeholder="Search events"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={style.searchBar}
          />
          <MagnifyingGlassIcon
            style={{
              width: "15px",
              height: "15px",
              position: "absolute",
              margin: "auto",
              top: 0,
              bottom: 0,
              right: "20px",
            }}
          />
        </div>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className={style.sortSelect}
        >
          <option value="earliest">Earliest First</option>
          <option value="latest">Latest First</option>
        </select>
        <CheckboxGroup colorScheme="green" defaultValue={[]}>
            <Stack spacing={[1, 5]} direction={["column", "column"]} ml="3">
              <Checkbox value="watery_walk" colorScheme="teal"
              onChange={() => setShowFutureEvents(!showFutureEvents)}>
                Future Events
              </Checkbox>
              <Checkbox value="volunteer" colorScheme="yellow"
              onChange={() => setShowPastEvents(!showPastEvents)}>
                Past Events
              </Checkbox>
              <Checkbox value="special_events" colorScheme="green"
              onChange={() => setSpanishSpeakingOnly(!spanishSpeakingOnly)}>
                Spanish Speaking
              </Checkbox>
              <Checkbox value="wheelchair_accessible" colorScheme="blue"
              onChange={() => setWheelchairAccessible(!wheelchairAccessible)}>
                Wheelchair Accessible
              </Checkbox>
            </Stack>
          </CheckboxGroup>
        
      </aside>
      {loading ? (
        <div className={style.cardContainer}>Loading events...</div>
      ) : filteredEvents.length > 0 ? (
        <div className={style.cardContainer}>
          <ul className={style.eventsList}>
            {filteredEvents.map((event) => (
              <li key={event._id} className={style.eventItem}>
                <Link href={"/admin/events/edit/" + event._id}>
                <EventPreviewComponent
                  event={event}
                  groupName={groupNames[event._id]}
                  onClick={() => console.log()}
                /></Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className={style.cardContainer}>No events to show</div>
      )}
      {selectedEvent && (
        <ExpandedTest
          eventDetails={selectedEvent}
          showModal={isModalOpen}
          setShowModal={setIsModalOpen}
        />
      )}
    </div>
  );
};

export default EventPreview;
