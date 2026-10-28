import { useState } from 'react';
import api from '../../api/client.js';
import { usePortfolio } from '../../context/PortfolioContext.jsx';
import SectionHeader from '../ui/SectionHeader.jsx';
import Reveal from '../ui/Reveal.jsx';

const EMPTY = { name: '', email: '', subject: '', message: '' };

const Contact = () => {
  const { profile, socialLinks } = usePortfolio();
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [sending, setSending] = useState(false);

  const email = profile.owner_email || profile.footer_email || 'cedrickrwa@gmail.com';
  const phone = profile.owner_phone || profile.footer_phone || '+250791801839';
  const location = profile.owner_location || profile.footer_address || 'Kigali, Rwanda';

  const update = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setSending(true);
    setStatus({ type: 'idle', message: '' });

    try {
      await api.post('/contact', form);
      setForm(EMPTY);
      setStatus({ type: 'success', message: 'Thank you! Your message has been sent.' });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error?.message || 'Unable to send your message. Please try again.',
      });
    } finally {
      setSending(false);
    }
  };

  const contactItems = [
    { icon: 'fa-envelope', label: 'Email', value: email, href: `mailto:${email}` },
    { icon: 'fa-phone', label: 'Phone', value: phone, href: `tel:${phone.replace(/\s+/g, '')}` },
    { icon: 'fa-map-marker-alt', label: 'Location', value: location },
  ];

  return (
    <section className="section bg-primary-50" id="contact">
      <div className="container">
        <SectionHeader
          subtitle="GET IN TOUCH"
          title="Contact"
          highlight="Me"
          icon="fa-envelope"
        />

        <div className="mt-14 grid gap-8 lg:grid-cols-5">
          <Reveal className="lg:col-span-2">
            <div className="space-y-4">
              {contactItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-start gap-4 rounded-2xl border border-ink-100 bg-white p-5 shadow-soft"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-gradient text-white">
                    <i className={`fas ${item.icon}`} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-ink">{item.label}</h4>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="text-sm text-ink-500 transition-colors hover:text-primary-600"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-sm text-ink-500">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}

              {socialLinks.length > 0 ? (
                <div className="flex flex-wrap gap-3 pt-2">
                  {socialLinks.map((link) => (
                    <a
                      key={link._id ?? link.url}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="social-icon"
                      title={link.platform}
                    >
                      <i className={`fab ${link.icon}`} />
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          </Reveal>

          <Reveal delay={120} className="lg:col-span-3">
            <form onSubmit={submit} className="rounded-2xl border border-ink-100 bg-white p-6 shadow-soft sm:p-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={form.name}
                  onChange={update('name')}
                  required
                  className="field"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  value={form.email}
                  onChange={update('email')}
                  required
                  className="field"
                />
              </div>

              <input
                type="text"
                name="subject"
                placeholder="Subject"
                value={form.subject}
                onChange={update('subject')}
                required
                className="field mt-4"
              />

              <textarea
                name="message"
                rows={5}
                placeholder="Your Message"
                value={form.message}
                onChange={update('message')}
                required
                className="field mt-4 resize-y"
              />

              <button type="submit" disabled={sending} className="btn-primary mt-5 w-full sm:w-auto">
                {sending ? (
                  <>
                    <i className="fas fa-spinner fa-spin" /> Sending...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane" /> Send Message
                  </>
                )}
              </button>

              {status.message ? (
                <p
                  className={`mt-4 flex items-center gap-2 text-sm ${
                    status.type === 'success' ? 'text-primary-600' : 'text-red-500'
                  }`}
                >
                  <i
                    className={`fas ${
                      status.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'
                    }`}
                  />
                  {status.message}
                </p>
              ) : null}
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default Contact;
