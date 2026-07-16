import { describe, it, expect } from "vitest";
import {
  isTaskArchived,
  isTaskDeleted,
  isTaskDone,
  filterActiveTasks,
  getQuadrantCounts,
  getStatusCounts,
} from "./taskUtils";

describe("isTaskArchived / isTaskDeleted / isTaskDone", () => {
  it("treats a task as archived only when archived_at is set", () => {
    expect(isTaskArchived({ archived_at: "2026-01-01T00:00:00Z" })).toBe(true);
    expect(isTaskArchived({ archived_at: null })).toBe(false);
    expect(isTaskArchived({})).toBe(false);
  });

  it("treats a task as deleted only when deleted_at is set", () => {
    expect(isTaskDeleted({ deleted_at: "2026-01-01T00:00:00Z" })).toBe(true);
    expect(isTaskDeleted({})).toBe(false);
  });

  it("treats DONE and DELEGATED_DONE as done, nothing else", () => {
    expect(isTaskDone({ status: "DONE" })).toBe(true);
    expect(isTaskDone({ status: "DELEGATED_DONE" })).toBe(true);
    expect(isTaskDone({ status: "IN_PROGRESS" })).toBe(false);
    expect(isTaskDone({ status: "DELEGATED" })).toBe(false);
  });
});

describe("filterActiveTasks", () => {
  it("excludes archived and deleted tasks, keeps everything else", () => {
    const tasks = [
      { id: "1" },
      { id: "2", archived_at: "2026-01-01T00:00:00Z" },
      { id: "3", deleted_at: "2026-01-01T00:00:00Z" },
      { id: "4", archived_at: "2026-01-01T00:00:00Z", deleted_at: "2026-01-02T00:00:00Z" },
    ];
    expect(filterActiveTasks(tasks).map((t) => t.id)).toEqual(["1"]);
  });

  it("defaults to an empty array", () => {
    expect(filterActiveTasks()).toEqual([]);
  });
});

describe("getQuadrantCounts", () => {
  const tasks = [
    { id: "1", quadrant: 1 },
    { id: "2", quadrant: 1, is_weekly_focus: true },
    { id: "3", quadrant: 2 },
    { id: "4", quadrant: 4 },
    { id: "5", quadrant: null }, // absorbed into quadrant 4, per spec
    { id: "6", quadrant: 3, archived_at: "2026-01-01T00:00:00Z" }, // excluded
  ];

  it("lays out counts in spec order: 1 (top-left), 2 (top-right), 3 (bottom-left), 4 (bottom-right/unassigned)", () => {
    const counts = getQuadrantCounts(tasks, []);
    expect(counts.map((c) => c.quadrant)).toEqual([1, 2, 3, 4]);
    expect(counts[0].count).toBe(2); // quadrant 1
    expect(counts[1].count).toBe(1); // quadrant 2
    expect(counts[2].count).toBe(0); // quadrant 3 (its only task is archived)
    expect(counts[3].count).toBe(2); // quadrant 4 + unassigned (tasks 4 and 5)
  });

  it("flags hasFocus only on a quadrant containing a weekly-focus task", () => {
    const counts = getQuadrantCounts(tasks, []);
    expect(counts[0].hasFocus).toBe(true); // quadrant 1 has task 2
    expect(counts[1].hasFocus).toBe(false);
  });

  it("only reacts to the 'tasks' highlight category, not 'projects'/'products'", () => {
    const withStakeholder = [{ id: "1", quadrant: 1, stakeholder_ids: ["alice"] }];

    const noHighlight = getQuadrantCounts(withStakeholder, []);
    expect(noHighlight[0].hasHighlightedStakeholder).toBe(false);

    const wrongCategory = getQuadrantCounts(withStakeholder, [{ stakeholderId: "alice", category: "projects" }]);
    expect(wrongCategory[0].hasHighlightedStakeholder).toBe(false);

    const rightCategory = getQuadrantCounts(withStakeholder, [{ stakeholderId: "alice", category: "tasks" }]);
    expect(rightCategory[0].hasHighlightedStakeholder).toBe(true);
  });
});

describe("getStatusCounts", () => {
  it("buckets DONE and DELEGATED_DONE together, matching 'Done or Delegated-Done is green'", () => {
    const tasks = [{ status: "DONE" }, { status: "DELEGATED_DONE" }, { status: "IN_PROGRESS" }];
    const counts = getStatusCounts(tasks);
    expect(counts.find((c) => c.key === "DONE").count).toBe(2);
    expect(counts.find((c) => c.key === "IN_PROGRESS").count).toBe(1);
  });

  it("treats a missing/blank status as NOT_STARTED", () => {
    const counts = getStatusCounts([{ status: undefined }, { status: "" }, {}]);
    expect(counts.find((c) => c.key === "NOT_STARTED").count).toBe(3);
  });

  it("covers all 8 spec status values across exactly 7 buckets (Done + Delegated-Done share one)", () => {
    const allStatuses = [
      "NOT_STARTED",
      "IN_PROGRESS",
      "DELEGATED",
      "PENDING_FEEDBACK",
      "ON_HOLD",
      "BLOCKED",
      "DONE",
      "DELEGATED_DONE",
    ];
    const counts = getStatusCounts(allStatuses.map((status) => ({ status })));
    expect(counts).toHaveLength(7);
    expect(counts.reduce((sum, c) => sum + c.count, 0)).toBe(8);
  });
});
