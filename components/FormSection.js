export default function FormSection({
  number,
  title,
  description,
  children,
  id,
}) {
  return (
    <section className="form-section scroll-mt-28" id={id}>
      <div className="form-section-title">
        <span className="form-section-number">{number}</span>
        <div>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}
