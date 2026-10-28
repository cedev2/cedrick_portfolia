import { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext.jsx';
import { assetUrl, formatDate } from '../../utils/format.js';
import SectionHeader from '../ui/SectionHeader.jsx';
import Modal from '../ui/Modal.jsx';
import Reveal from '../ui/Reveal.jsx';
import SmartImage from '../ui/SmartImage.jsx';

const Certificates = () => {
  const { certificates } = usePortfolio();
  const [active, setActive] = useState(null);

  if (!certificates.length) return null;

  return (
    <section className="section bg-white" id="certificates">
      <div className="container">
        <SectionHeader
          subtitle="CERTIFICATIONS"
          title="My"
          highlight="Certificates"
          icon="fa-certificate"
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map((certificate, index) => (
            <Reveal key={certificate._id} delay={index * 70}>
              <button
                type="button"
                onClick={() => setActive(certificate)}
                className="card group h-full w-full text-left"
              >
                {certificate.preview_image ? (
                  <div className="mb-5 h-40 overflow-hidden rounded-xl bg-primary-50">
                    <SmartImage
                      src={assetUrl(certificate.preview_image)}
                      alt={certificate.title}
                      loading="lazy"
                      fallbackIcon="fa-certificate"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="mb-5 flex h-40 items-center justify-center rounded-xl bg-primary-50 text-4xl text-primary-400">
                    <i className="fas fa-certificate" />
                  </div>
                )}

                <h3 className="text-base font-semibold text-ink">{certificate.title}</h3>
                <p className="mt-1 text-sm text-ink-500">{certificate.organization}</p>
                <span className="mt-3 inline-block rounded-full bg-sand-100 px-3 py-1 text-xs font-medium text-sand-500">
                  {formatDate(certificate.issue_date)}
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      <Modal open={Boolean(active)} onClose={() => setActive(null)} title={active?.title}>
        {active ? (
          <div className="space-y-4">
            {active.preview_image ? (
              <div className="overflow-hidden rounded-xl bg-primary-50">
                <SmartImage
                  src={assetUrl(active.preview_image)}
                  alt={active.title}
                  fallbackIcon="fa-certificate"
                  className="max-h-[70vh] w-full object-contain"
                />
              </div>
            ) : null}

            <div className="flex flex-wrap gap-4 text-sm text-ink-500">
              <span>
                <i className="fas fa-building mr-2 text-primary-500" />
                {active.organization}
              </span>
              <span>
                <i className="fas fa-calendar mr-2 text-primary-500" />
                {formatDate(active.issue_date)}
              </span>
              {active.certificate_number ? (
                <span>
                  <i className="fas fa-hashtag mr-2 text-primary-500" />
                  {active.certificate_number}
                </span>
              ) : null}
            </div>

            {active.description ? (
              <p className="text-sm leading-relaxed text-ink-600">{active.description}</p>
            ) : null}

            {active.credential_url || active.certificate_url ? (
              <a
                href={active.credential_url || active.certificate_url}
                target="_blank"
                rel="noreferrer"
                className="btn-primary btn-sm"
              >
                <i className="fas fa-award" /> View Credential
              </a>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </section>
  );
};

export default Certificates;
