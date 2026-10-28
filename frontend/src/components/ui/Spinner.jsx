const Spinner = ({ label = 'Loading...', className = '' }) => (
  <div className={`flex flex-col items-center justify-center gap-3 py-16 ${className}`}>
    <span className="h-10 w-10 animate-spin rounded-full border-[3px] border-primary-100 border-t-primary-500" />
    {label ? <p className="text-sm text-ink-400">{label}</p> : null}
  </div>
);

export default Spinner;
