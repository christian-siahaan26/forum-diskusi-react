import PropTypes from 'prop-types';

/**
 * @param {{
 *   id: string,
 *   label: string,
 *   type?: string,
 *   value: string,
 *   onChange: function,
 *   placeholder?: string,
 *   error?: string,
 *   disabled?: boolean,
 *   autoComplete?: string,
 * }} props
 */
const InputField = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  error = '',
  disabled = false,
  autoComplete = 'off',
}) => (
  <div className="flex flex-col gap-1">
    <label
      htmlFor={id}
      className="text-sm font-medium text-gray-700"
    >
      {label}
    </label>

    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      autoComplete={autoComplete}
      className={`
        rounded-lg border px-3 py-2 text-sm outline-none
        transition-colors duration-150
        placeholder:text-gray-400
        focus:border-blue-500 focus:ring-2 focus:ring-blue-100
        disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400
        ${error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'}
      `}
    />

    {/* Inline error */}
    {error && (
      <p className="text-xs text-red-500" role="alert">
        {error}
      </p>
    )}
  </div>
);

InputField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  type: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  disabled: PropTypes.bool,
  autoComplete: PropTypes.string,
};

export default InputField;
