export default function PasswordField({
  id,
  label,
  name,
  value,
  onChange,
  visible,
  onToggle,
  placeholder,
  autoComplete = "new-password",
  invalid = false,
  describedBy,
}) {
  return (
    <div>
      <label className="mb-2 block text-[13px] font-semibold text-slate-700" htmlFor={id}>{label}</label>
      <div className="relative">
        <input
          className="field-control pr-18"
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          minLength={8}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          required
        />
        <button
          className="absolute inset-y-1.5 right-1.5 min-w-14 rounded-lg px-2 text-xs font-bold text-slate-500 transition hover:bg-slate-100 hover:text-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
          type="button"
          aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`}
          aria-pressed={visible}
          onClick={onToggle}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}
