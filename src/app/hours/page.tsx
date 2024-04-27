'use client';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Th,
  Tr,
  Td,
  useBreakpointValue,
  Text,
  Input,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import style from '@styles/admin/users.module.css';
import Link from 'next/link';
import { useUser } from '@clerk/clerk-react';
import { IEvent } from '../../database/eventSchema';
import { formatDate, formatDuration, getDuration } from '../lib/dates';
import { calcHours, calcHoursForAll, filterUserSignedUpEvents } from '../lib/hours';

const AttendedEvents = () => {
  //states
  const { isSignedIn, user, isLoaded } = useUser();
  const [userEvents, setUserEvents] = useState<IEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [totalTime, setTotalTime] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDateTime, setStartDateTime] = useState(new Date((new Date).setMonth((new Date).getMonth() - 1)).toString());
  const [endDateTime, setEndDateTime] = useState((new Date).toString());

  // table format
  const tableSize = useBreakpointValue({ base: 'sm', md: 'md' });

  async function fetchData(start, end): Promise<void> {
    if (isSignedIn) {
      const userId = user.unsafeMetadata['dbId']; // Assuming this is the correct ID to match against event attendees

      // Fetch all events
      const eventsResponse = await fetch('/api/events');
      if (!eventsResponse.ok) {
        throw new Error(
          `Failed to fetch events: ${eventsResponse.statusText}`
        );
      }
      const allEvents = await eventsResponse.json();

      setStartDateTime(start);
      setEndDateTime(end);

      // Filter events where the current user is an attendee
      const userSignedUpEvents = filterUserSignedUpEvents(allEvents, userId, start, end);

      const hours = calcHours(userSignedUpEvents);
      setTotalTime(hours);

      // Update state with events the user has signed up for
      setUserEvents(userSignedUpEvents);
    }
  }

  useEffect(() => {
    console.log('Fetching user events...');
    const fetchUserDataAndEvents = async () => {
      if (!isLoaded) return; //ensure that user data is loaded
      setEventsLoading(true);

      try {
        await fetchData(startDateTime, endDateTime);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setEventsLoading(false); // Stop loading irrespective of outcome
      }
    };

    // Call the function to fetch user data and events
    fetchUserDataAndEvents();
  }, [isSignedIn, user, isLoaded]);

  //return a loading message while waiting to fetch events
  if (!isLoaded || eventsLoading) {
    return (
      <Text fontSize="lg" textAlign="center">
        Loading events...
      </Text>
    );
  }

  return (
    <div className={style.mainContainer}>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
        margin="20px"
      >
        <Text fontWeight="500" fontSize="32px" textAlign="center" margin="20px">
          Congrats, You’ve done great this month! 🎉
        </Text>
        <Box
          borderRadius="10.21px"
          m="4"
          p="20.42px"
          paddingTop="54.46px"
          paddingBottom="54.46px"
          gap="9.36px"
          bg="#337774"
          color="#FBF9F9"
        >
          <Text
            fontFamily="500"
            fontSize="18.61px"
            display="flex"
            justifyContent="center"
            textAlign="center"
          >
            Total Volunteer Hours Accumulated
          </Text>
          <Text
            fontWeight="600"
            fontSize="50.07px"
            display="flex"
            justifyContent="center"
            textAlign="center"
          >
            {Math.floor(totalTime / 60)} h {totalTime % 60} min
          </Text>
        </Box>
        <Box>
          <Text display="inline">From:</Text>
          <Input
            placeholder="From:"
            size="md"
            type="datetime-local"
            width="250px"
            margin="10px"
            onChange={async (e) => {
              fetchData(e.target.value, endDateTime);
            }}
          />
          <Text display="inline">To:</Text>
          <Input
            placeholder="To:"
            size="md"
            type="datetime-local"
            width="250px"
            margin="10px"
            onChange={(e) => {
              fetchData(startDateTime, e.target.value);
            }}
          />
          <Input
            placeholder="Event Search"
            size="md"
            width="250px"
            margin="10px"
          />
        </Box>
      </Box>
      <div className={style.tableContainer}>
        <Box>
          <Table variant="striped" size={tableSize}>
            <Thead>
              <Tr>
                <Th>Event Name</Th>
                <Th>Duration</Th>
                <Th>Date</Th>
              </Tr>
            </Thead>
            <Tbody>
              {userEvents.map((event) => (
                <Tr key={event._id}>
                  <Td>{event.eventName}</Td>
                  <Td>{formatDuration(event.startTime, event.endTime)}</Td>
                  <Td>{formatDate(event.startTime)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </div>
    </div>
  );
};

export default AttendedEvents;
