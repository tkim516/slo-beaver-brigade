import React from "react";
import style from "@styles/admin/eventPreview.module.css";
import { IEvent } from "@database/eventSchema";
import Image from "next/image";
import beaver from "/docs/images/beaver-placeholder.jpg";

interface EventPreviewProps {
  event: IEvent;
}

const EventPreviewComponent: React.FC<EventPreviewProps> = ({ event }) => {
  // formats date wihtout leading zeros month/day
  const formatDate = (date: Date | string): string => {
    const options: Intl.DateTimeFormatOptions = {
      month: "numeric",
      day: "numeric",
    };
    return new Intl.DateTimeFormat("en-US", options).format(new Date(date));
  };

  // format time range
  const formatTimeRange = (
    startTime: Date | string,
    endTime: Date | string
  ): string => {
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    };
    const formattedStartTime = new Intl.DateTimeFormat(
      "en-US",
      timeOptions
    ).format(new Date(startTime));
    const formattedEndTime = new Intl.DateTimeFormat(
      "en-US",
      timeOptions
    ).format(new Date(endTime));

    return `${formattedStartTime} - ${formattedEndTime}`;
  };

  return (
    <div className={style.eventCard}>
      <div className={style.imageContainer}>
        <div className={style.imageWrapper}>
          <Image
            src={beaver}
            alt="Beaver Placeholder"
            layout="fill"
            objectFit="cover"
          />
        </div>
      </div>
      <div className={style.infoContainer}>
        <div>
          <h2>{event.eventName}</h2>
          <h3>
            {event.groupsAllowed?.length === 0
              ? "SLO Beaver Brigade"
              : getgroups()}
          </h3>
        </div>
        <div>
          <h2>{formatDate(event.startTime)}</h2>
          <h2>{formatTimeRange(event.startTime, event.endTime)}</h2>
        </div>
        <div>
          <h2>{event.attendeeIds.length}</h2>
          <h3 className={style.visitors}>Visitors</h3>
        </div>
      </div>
    </div>
  );
};

export default EventPreviewComponent;
