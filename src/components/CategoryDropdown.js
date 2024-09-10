import React from 'react';

const CategoryDropdown = ({ value, onChange, categories, includeAddNew = true }) => {
  const sortedCategories = [...categories]
    .filter(cat => cat.active)
    .sort((a, b) => a.name.localeCompare(b.name, 'ro', { sensitivity: 'base' }));

  return (
    <select
      value={value || ""}
      onChange={onChange}
      className="w-full mb-2 p-2 border rounded"
    >
      <option value="" disabled>Alege categoria</option>
      {sortedCategories.map((cat, index) => (
        <option key={index} value={cat.name}>{cat.name}</option>
      ))}
      {includeAddNew && <option value="add_new">+ Adaugă categorie nouă</option>}
    </select>
  );
};

export default CategoryDropdown;