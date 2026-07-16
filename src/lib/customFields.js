// Custom-field data shapes (same shape for Project/Product/Area entities):
//   Area.custom_schema = { project_fields: [{key,label}], product_fields: [{key,label}] }
//     — field definitions registered as available to every Project/Product
//     in that area. Areas themselves have no broader parent to register
//     against, so an Area's own custom fields are always area-only.
//   <Entity>.custom_data = { [key]: { label, value } } — every field the
//     entity has actually set, whether area-scoped or entity-only. Storing
//     the label here too (not just on the Area) means a card can render its
//     custom fields without needing to look up the parent Area.
//   <Entity>.display_on_card_fields = string[] of custom_data keys to render
//     on the card.

export function slugifyFieldKey(label, existingKeys = []) {
  const base =
    label
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") || "field";

  let key = base;
  let i = 2;
  while (existingKeys.includes(key)) {
    key = `${base}_${i}`;
    i++;
  }
  return key;
}

export function getAreaCustomFields(area, entityType = "project") {
  return area?.custom_schema?.[`${entityType}_fields`] || [];
}

// Merges an Area's registered custom-field definitions with an entity's own
// custom_data, so e.g. a project shows every field available to its Area
// (even ones it hasn't filled in yet) plus any fields scoped to just itself.
export function getMergedCustomFields(entity, area, entityType = "project") {
  const areaFields = getAreaCustomFields(area, entityType);
  const entityData = entity.custom_data || {};

  const merged = {};
  areaFields.forEach((f) => {
    merged[f.key] = { key: f.key, label: f.label, value: entityData[f.key]?.value || "", scope: "area" };
  });
  Object.entries(entityData).forEach(([key, entry]) => {
    if (merged[key]) {
      merged[key].value = entry.value || merged[key].value;
    } else {
      merged[key] = { key, label: entry.label, value: entry.value || "", scope: entityType };
    }
  });

  return Object.values(merged);
}
