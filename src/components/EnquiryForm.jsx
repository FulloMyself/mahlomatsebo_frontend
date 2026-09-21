import React, { useState } from 'react';

const initialState = {
  name: '',
  organisation: '',
  email: '',
  phone: '',
  service: 'First Aid Training',
  message: '',
};

export default function EnquiryForm() {
  const [form, setForm] = useState(initialState);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const whatsappMessage = [
      'Hello Mahloma Tsebo Solutions, I would like to make an enquiry.',
      `Name: ${form.name}`,
      `Organisation: ${form.organisation || 'Not provided'}`,
      `Email: ${form.email}`,
      `Phone: ${form.phone || 'Not provided'}`,
      `Interested in: ${form.service}`,
      `Message: ${form.message || 'Not provided'}`,
    ].join('\n');

    window.open(
      `https://wa.me/27646495947?text=${encodeURIComponent(whatsappMessage)}`,
      '_blank',
      'noopener,noreferrer'
    );
    setSubmitted(true);
    setForm(initialState);
  };

  return (
    <form className="enquiry-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <label>
          Full name
          <input name="name" value={form.name} onChange={handleChange} placeholder="Your name" required />
        </label>
        <label>
          Organisation
          <input name="organisation" value={form.organisation} onChange={handleChange} placeholder="School / business / company" />
        </label>
        <label>
          Email address
          <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
        </label>
        <label>
          Phone number
          <input name="phone" value={form.phone} onChange={handleChange} placeholder="Your phone number" />
        </label>
      </div>

      <label>
        Interested in
        <select name="service" value={form.service} onChange={handleChange}>
          <option>Early Childhood Development</option>
          <option>First Aid Training</option>
          <option>Basic Fire Fighting</option>
          <option>Emergency Preparedness</option>
          <option>OHS Practitioner Training</option>
          <option>Fire Extinguisher Services</option>
        </select>
      </label>

      <label>
        Message
        <textarea name="message" value={form.message} onChange={handleChange} placeholder="Tell us how we can help" rows={5} />
      </label>

      <button type="submit" className="primary-btn">Send enquiry on WhatsApp</button>
      {submitted && <p className="form-success">WhatsApp opened with your enquiry ready to send.</p>}
    </form>
  );
}
