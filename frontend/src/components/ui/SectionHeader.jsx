/**
 * Section heading used across the landing page.
 * Mirrors the legacy `.section-header` block (subtitle, title, divider).
 */
const SectionHeader = ({
  subtitle,
  title,
  highlight,
  icon = 'fa-code',
  tag,
  align = 'center',
  light = false,
}) => (
  <div className={`text-${align} ${light ? 'text-white' : ''}`}>
    {subtitle ? (
      <span className={`section-subtitle ${align === 'center' ? 'block' : 'inline-block'}`}>
        {subtitle}
      </span>
    ) : null}

    <h2 className="section-title mt-2">
      {title}{' '}
      {highlight ? <span className="gradient-text">{highlight}</span> : null}
    </h2>

    {tag ? (
      <p className={`mt-2 text-sm font-medium ${light ? 'text-primary-200' : 'text-ink-400'}`}>
        {tag}
      </p>
    ) : null}

    <div className="section-divider" style={align === 'center' ? undefined : { marginLeft: 0 }}>
      <span className="divider-line" />
      <i className={`fas ${icon} gradient-text`} />
      <span className="divider-line" />
    </div>
  </div>
);

export default SectionHeader;
