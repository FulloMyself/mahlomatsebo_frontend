import React from 'react';
import SectionHeading from '../components/SectionHeading';
import ServiceCard from '../components/ServiceCard';
import EnquiryForm from '../components/EnquiryForm';
import { accreditations, caseStudies, company, methodology, milestones, services, audience } from '../data/siteContent';

export default function Landing() {
  return (
    <>
      <section className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow">Accredited training & safety solutions</span>
          <h1>{company.tagline}</h1>
          <p>
            Mahloma Tsebo Solutions empowers individuals, businesses, schools and community groups through
            accredited, practical learning that strengthens safety, compliance and long-term opportunity.
          </p>

          <div className="hero-actions">
            <a href="#services" className="primary-btn">Explore services</a>
            <a href="#contact" className="secondary-btn">Enquire now</a>
          </div>

          <div className="mini-stats">
            <div>
              <strong>1,000+</strong>
              <span>individuals trained</span>
            </div>
            <div>
              <strong>50+</strong>
              <span>organisations served</span>
            </div>
            <div>
              <strong>2016</strong>
              <span>since establishment</span>
            </div>
          </div>
        </div>

        <div className="hero-panel">
          <div className="hero-visual">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80"
              alt="Mahloma Tsebo training session"
            />
            <div className="image-badge">Community impact • Workplace readiness</div>
          </div>
          <div className="panel-card spotlight-card">
            <span className="tiny-label">Core offerings</span>
            <h3>Workplace safety, accredited learning and community impact.</h3>
            <ul>
              {services.slice(0, 4).map((service) => (
                <li key={service.id}>{service.title}</li>
              ))}
            </ul>
          </div>
          <div className="panel-card info-card">
            <p><strong>Contact:</strong> {company.phone}</p>
            <p><strong>Email:</strong> {company.email}</p>
            <p><strong>Location:</strong> {company.region}</p>
          </div>
        </div>
      </section>

      <section className="trust-bar">
        <span>Trusted by schools, public institutions, businesses and community organisations</span>
      </section>

      <section id="services" className="content-section">
        <SectionHeading
          eyebrow="What we offer"
          title="Six service lines designed for safer, stronger communities"
          text="Our programmes are built to align with South African compliance frameworks and strengthen both personal growth and operational readiness."
        />

        <div className="service-grid">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </section>

      <section id="methodology" className="content-section alt-panel">
        <SectionHeading
          eyebrow="How we train"
          title="Practical, engaging and outcome-focused learning"
        />

        <div className="method-grid">
          {methodology.map((item) => (
            <div key={item.title} className="method-card">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="content-section gallery-section">
        <div className="gallery-grid">
          <img src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=900&q=80" alt="Training classroom" />
          <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=80" alt="Workshop and facilitation" />
          <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80" alt="Professional development session" />
        </div>
      </section>

      <section className="content-section split-section" id="impact">
        <div>
          <SectionHeading
            eyebrow="Who we serve"
            title="A service model designed for diverse learners and workplaces"
          />
          <ul className="audience-list">
            {audience.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="impact-box">
          <h3>Accreditations & compliance</h3>
          <div className="accreditation-row">
            {accreditations.map((item) => (
              <span key={item} className="accreditation-pill">{item}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="content-section">
        <SectionHeading
          eyebrow="Our journey"
          title="Milestones that reflect steady growth and impact"
        />

        <div className="timeline">
          {milestones.map((item) => (
            <div key={item.year} className="timeline-item">
              <span>{item.year}</span>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="content-section">
        <SectionHeading
          eyebrow="Success stories"
          title="Case studies and community outcomes"
        />

        <div className="case-grid">
          {caseStudies.map((study) => (
            <article key={study.title} className="case-card">
              <h3>{study.title}</h3>
              <p>{study.summary}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="contact" className="content-section contact-section">
        <div className="contact-copy">
          <SectionHeading
            eyebrow="Contact us"
            title="Let’s build safer, stronger learning environments together"
            text="Whether you need workforce training, compliance support, or a tailored learning programme, we are ready to help."
          />

          <div className="contact-list">
            <p><strong>Address:</strong> {company.address}</p>
            <p><strong>Voice:</strong> {company.phone}</p>
            <p><strong>WhatsApp:</strong> {company.whatsapp}</p>
            <p><strong>Email:</strong> {company.email}</p>
          </div>
        </div>

        <div className="contact-panel">
          <h3>Make an enquiry</h3>
          <EnquiryForm />
        </div>
      </section>
    </>
  );
}
