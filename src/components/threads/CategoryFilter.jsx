import PropTypes from 'prop-types';

/**
 * @param {{
 *   categories: string[],
 *   activeCategory: string,
 *   onSelect: (category: string) => void,
 * }} props
 */
const CategoryFilter = ({ categories, activeCategory, onSelect }) => {
  if (categories.length <= 1) return null;

  return (
    <div
      className="flex flex-wrap gap-2"
      role="group"
      aria-label="Filter kategori thread"
    >
      {categories.map((category) => {
        const isActive = category === activeCategory;
        const label = category === 'all' ? 'Semua' : `#${category}`;

        return (
          <button
            key={category}
            type="button"
            onClick={() => onSelect(category)}
            aria-pressed={isActive}
            className={`
              rounded-full px-4 py-1.5 text-sm font-medium
              border transition-all duration-150
              ${
                isActive
                  ? 'border-blue-500 bg-blue-600 text-white'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};

CategoryFilter.propTypes = {
  categories: PropTypes.arrayOf(PropTypes.string).isRequired,
  activeCategory: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default CategoryFilter;
