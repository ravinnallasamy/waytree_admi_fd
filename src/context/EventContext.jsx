import React, { createContext, useState, useContext } from 'react';

const EventContext = createContext();

export const useEvents = () => useContext(EventContext);

export const EventProvider = ({ children }) => {
    const [events, setEvents] = useState([
        {
            id: 1,
            title: "Tech Conference 2024",
            date: "2024-03-15",
            location: "San Francisco, CA",
            status: "verified",
            description: "Annual tech gathering for developers and innovators."
        },
        {
            id: 2,
            title: "Summer Music Festival",
            date: "2024-06-20",
            location: "Austin, TX",
            status: "pending",
            description: "Live music from top artists across various genres."
        },
        {
            id: 3,
            title: "Modern Art Exhibition",
            date: "2024-04-10",
            location: "New York, NY",
            status: "pending",
            description: "Showcase of contemporary art pieces from local artists."
        },
        {
            id: 4,
            title: "Global Startup Summit",
            date: "2024-05-05",
            location: "London, UK",
            status: "verified",
            description: "Networking event for startups and investors."
        }
    ]);

    const addEvent = (newEvent) => {
        setEvents([...events, { ...newEvent, id: Date.now() }]);
    };

    const updateEventStatus = (id, status) => {
        setEvents(events.map(event =>
            event.id === id ? { ...event, status } : event
        ));
    };

    const deleteEvent = (id) => {
        setEvents(events.filter(event => event.id !== id));
    };

    return (
        <EventContext.Provider value={{ events, addEvent, updateEventStatus, deleteEvent }}>
            {children}
        </EventContext.Provider>
    );
};
