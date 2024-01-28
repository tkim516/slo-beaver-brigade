'use client'
import React from 'react'
import Calendar from '@components/Calendar'
import style from "@styles/calendar/eventpage.module.css"




export default function Events() {
    return (
        <body className={style.page}>
            <header className={style.header}>
                <h1>Calendar</h1>
            </header>
            <main>
                <div>
                    <Calendar 
                    />
                </div>
            </main>
            
            
        </body>
    )
}