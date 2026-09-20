export function getDraftCategoryId(categories, activeFilter) {
  return categories.some((category) => category.id === activeFilter) ? activeFilter : "";
}
