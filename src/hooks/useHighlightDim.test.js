import { describe, it, expect } from "vitest";
import { isDimmedByHighlight } from "./useHighlightDim";

describe("isDimmedByHighlight", () => {
  it("never dims anything when no highlight is active", () => {
    expect(isDimmedByHighlight([], "tasks", [])).toBe(false);
    expect(isDimmedByHighlight([], "tasks", ["alice"])).toBe(false);
  });

  it("dims when a highlight is active in the category but the entity doesn't match it", () => {
    const highlights = [{ stakeholderId: "alice", category: "tasks" }];
    expect(isDimmedByHighlight(highlights, "tasks", ["bob"])).toBe(true);
    expect(isDimmedByHighlight(highlights, "tasks", [])).toBe(true);
  });

  it("doesn't dim when the entity's stakeholder matches an active highlight", () => {
    const highlights = [{ stakeholderId: "alice", category: "tasks" }];
    expect(isDimmedByHighlight(highlights, "tasks", ["alice"])).toBe(false);
  });

  it("ignores highlights from a different category entirely — this is the root of the per-checkbox design", () => {
    // Alice's "projects" checkbox is checked, but this is a task-row check —
    // it must not be affected by a category it doesn't belong to.
    const highlights = [{ stakeholderId: "alice", category: "projects" }];
    expect(isDimmedByHighlight(highlights, "tasks", ["alice"])).toBe(false); // no active "tasks" highlight, so nothing dims
  });

  it("accepts multiple categories at once (Project/Product/Area cards react to both 'projects' and 'products')", () => {
    const highlights = [{ stakeholderId: "alice", category: "products" }];
    expect(isDimmedByHighlight(highlights, ["projects", "products"], ["alice"])).toBe(false);
    expect(isDimmedByHighlight(highlights, ["projects", "products"], ["bob"])).toBe(true);
  });

  it("un-dims if ANY active highlighted stakeholder (of multiple) matches", () => {
    const highlights = [
      { stakeholderId: "alice", category: "tasks" },
      { stakeholderId: "bob", category: "tasks" },
    ];
    expect(isDimmedByHighlight(highlights, "tasks", ["bob"])).toBe(false);
    expect(isDimmedByHighlight(highlights, "tasks", ["carol"])).toBe(true);
  });
});
