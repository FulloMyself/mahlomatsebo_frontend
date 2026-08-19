import React, { useEffect, useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import api from '../api';

export default function StaffCalendar({ user }) {
  const calendarRef = useRef(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const resp = await api.get(`/schedules?staff=${user._id}`);
        const schedules = resp.data.schedules || [];
        const mapped = schedules.map((s) => ({
          id: s._id,
          title: s.title,
          start: s.start,
          end: s.end,
          extendedProps: {
            description: s.description,
            students: s.students || [],
            location: s.location,
            staff: s.staff,
            status: s.status,
          },
        }));
        setEvents(mapped);
      } catch (err) {
        console.error('Failed to load schedules', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  const handleDateSelect = async (selectInfo) => {
    const title = prompt('Title for class/event:');
    if (!title) return;

    const newEvent = {
      title,
      start: selectInfo.start.toISOString(),
      end: (selectInfo.end || selectInfo.start).toISOString(),
      staff: user._id,
    };

    try {
      const resp = await api.post('/schedules', newEvent);
      const created = resp.data.schedule;
      setEvents((prev) => [...prev, { id: created._id, title: created.title, start: created.start, end: created.end, extendedProps: { ...created } }]);
    } catch (err) {
      console.error('Create schedule failed', err);
      alert(err?.response?.data?.message || 'Could not create schedule');
    }
  };

  const handleEventChange = async (changeInfo) => {
    const ev = changeInfo.event;
    try {
      await api.put(`/schedules/${ev.id}`, { start: ev.start.toISOString(), end: ev.end ? ev.end.toISOString() : ev.start.toISOString() });
      // optimistic update already reflected by FullCalendar
    } catch (err) {
      console.error('Update schedule failed', err);
      alert(err?.response?.data?.message || 'Could not update schedule');
      changeInfo.revert();
    }
  };

  const handleEventClick = async (clickInfo) => {
    const confirmed = window.confirm('Delete this schedule?');
    if (!confirmed) return;

    try {
      await api.delete(`/schedules/${clickInfo.event.id}`);
      clickInfo.event.remove();
      setEvents((prev) => prev.filter((e) => e.id !== clickInfo.event.id));
    } catch (err) {
      console.error('Delete schedule failed', err);
      alert(err?.response?.data?.message || 'Could not delete schedule');
    }
  };

  if (loading) return <div>Loading calendar...</div>;

  return (
    <div className="staff-calendar">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
        selectable={true}
        editable={true}
        selectMirror={true}
        select={handleDateSelect}
        events={events}
        eventChange={handleEventChange}
        eventClick={handleEventClick}
        eventDisplay="block"
        height={600}
      />
    </div>
  );
}
