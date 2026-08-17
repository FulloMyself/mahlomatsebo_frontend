import React from 'react';

export default function ServiceCard({ service }) {
  return (
    <article className="service-card">
      <div className="service-icon" aria-hidden="true">{service.title.charAt(0)}</div>
      <h3>{service.title}</h3>
      <p>{service.shortDescription}</p>
      <ul>
        {service.outcomes.slice(0, 3).map((outcome) => (
          <li key={outcome}>{outcome}</li>
        ))}
      </ul>
      <div className="service-tags">
        {service.alignment.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
    </article>
  );
}
