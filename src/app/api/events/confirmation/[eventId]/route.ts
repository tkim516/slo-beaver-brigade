import { formatDate, formatDateTimeRange } from "app/lib/dates";
import Event, { IEvent } from "database/eventSchema";
import { NextResponse, NextRequest } from "next/server";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASS,
    },
});

function formatDateToGoogleCalendar(date: Date) {
    return date.toISOString().replace(/-|:|\.\d\d\d/g, "");
}

async function send(emails: string[], event: IEvent) {
    const urlEncodedName = encodeURIComponent(event.eventName);
    const startTime = formatDateToGoogleCalendar(event.startTime);
    const endTime = formatDateToGoogleCalendar(event.endTime);
    const encodedDescription = encodeURIComponent(event.description);
    const encodedLocation = encodeURIComponent(event.location);

    try {
        const result = await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: emails,
            subject: `${event.eventName} Signup Confirmation`,
            html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Event Confirmation</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { width: 80%; margin: 0 auto; padding: 20px; }
        .button { padding: 10px 20px; color: white; background-color: #007BFF; text-decoration: none; border-radius: 5px; }
        .footer { margin-top: 20px; font-size: 0.8em; color: #777; }
    </style>
    </head>
    <body>
    <div class="container">
        <h1>${event.eventName} Signup Confirmation</h1>
        <p>Thank you for signing up for our event! We are excited to have you join us.</p>
        <p>Date: <strong>${formatDate(event.startTime)}</strong></p>
        <p>Time: <strong>${formatDateTimeRange(event.startTime, event.endTime)}</strong></p>
        <p>Please add this event to your calendar:</p>
        <a href="https://www.google.com/calendar/render?action=TEMPLATE&text=${urlEncodedName}&dates=${startTime}/${endTime}&details=${encodedDescription}&location=${encodedLocation}" class="button">Add to Google Calendar</a>
        
        <div class="footer">
            <p>If you have any questions, please do not hesitate to contact us at <a href="mailto:info@example.com">info@example.com</a>.</p>
        </div>
    </div>
    </body>
    </html>

        `,
        });
    } catch (err) {
        console.log("did not send email, ", err);
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: { eventId: string } }
) {
    // get event
    // get email to send to
    const { email } = await req.json();
    if (!email) {
        return NextResponse.json("No email provided.", { status: 200 });
    }
    try {
        const event = await Event.findById(params.eventId).orFail();
        send([email], event);
        console.log("sent email.");
        return NextResponse.json("Sent email.");
    } catch (err) {
        return NextResponse.json("Failed to get event.", { status: 500 });
    }
}
