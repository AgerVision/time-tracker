import React, { forwardRef } from 'react';

const CategoryDropdown = forwardRef(({ value, onChange, categories, includeAddNew = true, onAddNew }, ref) => {
  const sortedCategories = [...categories]
    .filter(cat => cat.active)
    .sort((a, b) => a.name.localeCompare(b.name, 'ro', { sensitivity: 'base' }));

  const handleChange = (e) => {
    if (e.target.value === 'add_new') {
      onAddNew((newCategory) => {
        if (newCategory) {
          onChange({ target: { value: newCategory.id } });
        }
      });
    } else {
      onChange(e);
    }
  };

  return (
    <div className="relative">
      <select
        ref={ref}
        value={value || ""}
        onChange={handleChange}
        className="w-full mb-2 p-2 border rounded appearance-none"
        aria-label="Alege categoria"
      >
        <option value="" disabled>Alege categoria</option>
        {sortedCategories.map((cat) => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
        {includeAddNew && <option value="add_new">+ Adaugă categorie nouă</option>}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
        </svg>
      </div>
    </div>
  );
});

export default CategoryDropdown;