import React from 'react';

export default function EventModal({ event, onClose, onDelete, onSave }) {
  if (!event) return null;

  const { title, extendedProps = {}, start, end } = event;
  const startDate = new Date(start).toLocaleString();
  const endDate = new Date(end).toLocaleString();

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <p><strong>When:</strong> {startDate} — {endDate}</p>
          {extendedProps.location && <p><strong>Location:</strong> {extendedProps.location}</p>}
          {extendedProps.description && <p><strong>Description:</strong> {extendedProps.description}</p>}
          {extendedProps.students && extendedProps.students.length > 0 && (
            <div>
              <strong>Students:</strong>
              <ul>
                {extendedProps.students.map((s) => (
                  <li key={s._id}>{s.name} <small className="muted">{s.email}</small></li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="secondary-btn" onClick={() => onDelete(event.id)}>Delete</button>
          <button className="primary-btn" onClick={() => { if (onSave) onSave(event.id); }}>Close</button>
        </div>
      </div>
    </div>
  );
}
