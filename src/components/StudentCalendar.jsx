// src/components/StudentCalendar.jsx
import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { FaMapMarkerAlt, FaClock, FaBook, FaClipboardCheck, FaTools } from 'react-icons/fa';

const StudentCalendar = ({ events }) => {
  const [selectedEvent, setSelectedEvent] = useState(null);

  const handleEventClick = (info) => {
    const event = info.event;
    const props = event.extendedProps;
    
    setSelectedEvent({
      title: event.title,
      start: event.start,
      end: event.end,
      type: props.type,
      location: props.location,
      program: props.program,
      duration: props.duration,
      status: props.status,
      purpose: props.purpose,
      testType: props.testType
    });
  };

  const getEventIcon = (type) => {
    switch(type) {
      case 'class':
        return <FaBook className="event-icon class-icon" />;
      case 'test':
        return <FaClipboardCheck className="event-icon test-icon" />;
      case 'booking':
        return <FaTools className="event-icon booking-icon" />;
      default:
        return <FaClock className="event-icon" />;
    }
  };

  return (
    <div className="student-calendar-container">
      <div className="calendar-wrapper">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={events}
          eventClick={handleEventClick}
          height="auto"
          editable={false}
          selectable={true}
          eventDisplay="block"
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            meridiem: 'short'
          }}
          eventDidMount={(info) => {
            // Add tooltip
            info.el.title = `${info.event.title}\n${info.event.extendedProps.location || ''}`;
          }}
        />
      </div>

      {selectedEvent && (
        <div className="event-details-panel">
          <h3>Event Details</h3>
          <div className="event-detail-item">
            <span className="event-detail-icon">{getEventIcon(selectedEvent.type)}</span>
            <div>
              <h4>{selectedEvent.title}</h4>
              <p className="event-type">{selectedEvent.type.toUpperCase()}</p>
            </div>
          </div>
          
          <div className="event-detail-item">
            <FaClock />
            <p>
              {selectedEvent.start.toLocaleString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>

          {selectedEvent.location && (
            <div className="event-detail-item">
              <FaMapMarkerAlt />
              <p>{selectedEvent.location}</p>
            </div>
          )}

          {selectedEvent.program && (
            <div className="event-detail-item">
              <FaBook />
              <p>{selectedEvent.program}</p>
            </div>
          )}

          {selectedEvent.duration && (
            <div className="event-detail-item">
              <FaClock />
              <p>Duration: {selectedEvent.duration}</p>
            </div>
          )}

          {selectedEvent.purpose && (
            <div className="event-detail-item">
              <FaTools />
              <p>Purpose: {selectedEvent.purpose}</p>
            </div>
          )}

          {selectedEvent.status && (
            <div className="event-detail-item">
              <span className={`booking-status ${selectedEvent.status}`}>
                {selectedEvent.status.toUpperCase()}
              </span>
            </div>
          )}

          <button className="ghost-btn" onClick={() => setSelectedEvent(null)}>
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentCalendar;