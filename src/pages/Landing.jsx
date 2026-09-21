import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SectionHeading from '../components/SectionHeading';
import ServiceCard from '../components/ServiceCard';
import EnquiryForm from '../components/EnquiryForm';
import { accreditations, caseStudies, company, methodology, milestones, services, audience } from '../data/siteContent';
import logo from '../../brand-logo.png';

export default function Landing() {
  const location = useLocation();

  useEffect(() => {
    // robustly parse hash for patterns like '#/contact' or '#contact' or '#/#contact'
    const rawHash = location.hash || window.location.hash || '';
    if (!rawHash) return;
    let cleaned = rawHash;
    // remove leading '#/' or '#/#' patterns
    if (cleaned.startsWith('#/')) cleaned = cleaned.slice(2);
    if (cleaned.startsWith('#')) cleaned = cleaned.slice(1);
    if (cleaned.startsWith('/')) cleaned = cleaned.slice(1);
    // after cleaning, cleaned should be the id (e.g., 'contact')
    if (!cleaned) return;

    // try immediate scroll; if element not yet present, retry shortly after render
    const tryScroll = () => {
      const el = document.getElementById(cleaned);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return true;
      }
      return false;
    };

    if (!tryScroll()) {
      const t = setTimeout(() => tryScroll(), 120);
      return () => clearTimeout(t);
    }
  }, [location]);

  return (
    <>
      <section className="hero-section">
        <div className="hero-copy">
          <img src={logo} alt={`${company.name} official logo`} className="hero-logo" />
          <span className="eyebrow">Skills centre • Safety solutions • Community impact</span>
          <h1>Skills for work. Safety for life.</h1>
          <p>
            {company.name} empowers artisans, caregivers and professionals through practical, accredited
            training that strengthens employability, workplace safety and lifelong opportunity.
          </p>

          <div className="hero-actions">
            <a href="#services" className="primary-btn">Explore services</a>
            <a href="#contact" className="secondary-btn">Enquire now</a>
          </div>

          <div className="mini-stats">
            <div><strong>2016</strong><span>established in Sedibeng</span></div>
            <div><strong>1,000+</strong><span>people trained</span></div>
            <div><strong>50+</strong><span>organisations served</span></div>
          </div>
        </div>

        <div className="hero-panel">
          <div className="hero-visual">
            <img
              src="/team-training.jpeg"
              alt="Mahloma Tsebo learners and instructors at the training centre"
            />
            <div className="image-badge">Community impact • Workplace readiness</div>
          </div>
          <div className="panel-card spotlight-card">
          <span className="tiny-label">Our promise</span>
          <h3>Practical skills that move people, workplaces and communities forward.</h3>
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
        <span>QCTO-aligned learning • Occupational safety • Accessible skills development</span>
      </section>

      <section className="content-section identity-section">
        <div className="identity-copy">
          <SectionHeading
            eyebrow="Who we are"
            title="A South African skills centre built around opportunity"
            text="From Duncanville in the Sedibeng region, we deliver accredited, accessible training and safety services that help people become job-ready and organisations become safer."
          />
          <div className="value-grid">
            <article><span>01</span><h3>Our mission</h3><p>To empower artisans, caregivers and professionals through accredited skills that enhance employability, workplace safety and career growth.</p></article>
            <article><span>02</span><h3>Our vision</h3><p>To be South Africa’s preferred skills development partner through innovative, industry-relevant training and lifelong learning.</p></article>
          </div>
        </div>
        <div className="identity-image">
          <img src="/training-centre.jpeg" alt="Practical training equipment at the Mahloma Tsebo training centre" />
          <div className="image-caption">Learning by doing, with safety at the centre.</div>
        </div>
      </section>

      <section id="services" className="content-section">
        <SectionHeading
          eyebrow="What we offer"
          title="Training and safety solutions for real-world work"
          text="Our offering brings together occupational qualifications, professional development, early childhood learning and workplace safety support."
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
              {item.image && <img src={item.image} alt={item.title} className="method-image" />}
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="content-section gallery-section">
        <div className="gallery-grid">
          <img src="/classroom.jpeg" alt="Mahloma Tsebo classroom" />
          <img src="/safety-equipment.jpeg" alt="Safety training equipment" />
          <img src="/team-training.jpeg" alt="Mahloma Tsebo training team" />
        </div>
      </section>

      <section className="content-section split-section" id="impact">
        <div>
          <SectionHeading
            eyebrow="Who we serve"
            title="Excellence, integrity, innovation and empowerment"
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
          <div style={{marginTop:12}}>
            <img src="/safety-equipment.jpeg" alt="Mahloma Tsebo occupational safety equipment" className="impact-image" />
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
          <div className="map-frame">
            <iframe
              title={`Google Maps location for ${company.name}`}
              src="https://www.google.com/maps?q=5A+Schonland+Street,+Duncanville,+Vereeniging,+South+Africa&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <EnquiryForm />
        </div>
      </section>
    </>
  );
}
