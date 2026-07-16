import { describe, it, expect } from "vitest";
import { slugifyFieldKey, getAreaCustomFields, getMergedCustomFields } from "./customFields";

describe("slugifyFieldKey", () => {
  it("slugifies a label into a lowercase, underscore-separated key", () => {
    expect(slugifyFieldKey("Launch Date")).toBe("launch_date");
  });

  it("strips leading/trailing separators from punctuation-heavy labels", () => {
    expect(slugifyFieldKey("!!!Cost ($)")).toBe("cost");
  });

  it("falls back to 'field' when the label has no alphanumeric characters", () => {
    expect(slugifyFieldKey("???")).toBe("field");
  });

  it("disambiguates against existing keys instead of colliding", () => {
    expect(slugifyFieldKey("Owner", ["owner"])).toBe("owner_2");
    expect(slugifyFieldKey("Owner", ["owner", "owner_2"])).toBe("owner_3");
  });
});

describe("getAreaCustomFields / getMergedCustomFields", () => {
  const area = {
    custom_schema: {
      project_fields: [{ key: "launch_date", label: "Launch Date" }],
    },
  };

  it("reads the right entityType's registered fields off the Area", () => {
    expect(getAreaCustomFields(area, "project")).toEqual([{ key: "launch_date", label: "Launch Date" }]);
    expect(getAreaCustomFields(area, "product")).toEqual([]);
  });

  it("returns an empty array when there's no area at all", () => {
    expect(getAreaCustomFields(undefined, "project")).toEqual([]);
  });

  it("merges an area-registered field (even if unfilled) with the entity's own custom_data", () => {
    const entity = { custom_data: { launch_date: { label: "Launch Date", value: "2026-08-01" } } };
    const merged = getMergedCustomFields(entity, area, "project");
    expect(merged).toEqual([{ key: "launch_date", label: "Launch Date", value: "2026-08-01", scope: "area" }]);
  });

  it("shows an area-registered field as empty when the entity hasn't filled it in yet", () => {
    const merged = getMergedCustomFields({}, area, "project");
    expect(merged).toEqual([{ key: "launch_date", label: "Launch Date", value: "", scope: "area" }]);
  });

  it("includes an entity-only field (not registered on the area) with entityType as its scope", () => {
    const entity = { custom_data: { risk_level: { label: "Risk Level", value: "High" } } };
    const merged = getMergedCustomFields(entity, area, "project");
    expect(merged).toContainEqual({ key: "risk_level", label: "Risk Level", value: "High", scope: "project" });
  });
});
