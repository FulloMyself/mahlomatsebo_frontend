import React, { useEffect, useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import EventModal from './EventModal';
import api from '../apiClient';

export default function AdminCalendar({ recentActivity = [] }) {
  const calendarRef = useRef(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await api.get('/schedules');
        const schedules = resp.data.schedules || [];
        const mapped = schedules.map((s) => ({
          id: s._id,
          title: s.title,
          start: s.start,
          end: s.end,
          backgroundColor: 'var(--primary)',
          borderColor: 'var(--primary-deep)',
          extendedProps: { ...s },
        }));

        // Map recentActivity into all-day events
        const activityEvents = (recentActivity || []).map((a, idx) => ({
          id: `act-${idx}`,
          title: a.label || 'Activity',
          start: new Date(a.updatedAt).toISOString().split('T')[0],
          allDay: true,
          backgroundColor: 'var(--accent)',
          borderColor: 'var(--accent)',
          extendedProps: { activity: true, details: a },
        }));

        setEvents([...mapped, ...activityEvents]);
      } catch (err) {
        console.error('Failed to load admin schedules', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [recentActivity]);

  const handleEventClick = (clickInfo) => {
    const ev = clickInfo.event;
    setSelectedEvent({
      id: ev.id,
      title: ev.title,
      start: ev.start,
      end: ev.end,
      extendedProps: ev.extendedProps,
    });
  };

  if (loading) return <div>Loading admin calendar...</div>;

  return (
    <div className="admin-calendar">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
        selectable={false}
        editable={false}
        events={events}
        eventClick={handleEventClick}
        eventDisplay="block"
        height={480}
      />

      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onDelete={null}
        />
      )}
    </div>
  );
}
