import { describe, it, expect } from "vitest";
import { makeToolRunner, MAX_ACTIONS_PER_REQUEST } from "./toolRunner.js";

describe("toolRunner: staged tools queue instead of executing", () => {
  it("pushes {action, args} onto plan and returns a queued ack", () => {
    const plan = [];
    const runTool = makeToolRunner({ plan, dataset: {} });
    const result = runTool("CREATE_AREA", { title: "Marketing", description: "" });
    expect(result.queued).toBe(true);
    expect(plan).toEqual([{ action: "CREATE_AREA", args: { title: "Marketing", description: "" } }]);
  });

  it("strips temp_id out of args but keeps it as its own plan field, and hints the model how to reference it", () => {
    const plan = [];
    const runTool = makeToolRunner({ plan, dataset: {} });
    const result = runTool("CREATE_AREA", { title: "Marketing", temp_id: "area1" });
    expect(plan[0]).toEqual({ action: "CREATE_AREA", args: { title: "Marketing" }, temp_id: "area1" });
    expect(result.temp_id_registered).toBe("area1");
    expect(result.hint).toContain("$area1");
  });

  it("refuses to queue past MAX_ACTIONS_PER_REQUEST", () => {
    const plan = Array.from({ length: MAX_ACTIONS_PER_REQUEST }, () => ({ action: "CREATE_AREA", args: {} }));
    const runTool = makeToolRunner({ plan, dataset: {} });
    const result = runTool("CREATE_AREA", { title: "One too many" });
    expect(result.queued).toBe(false);
    expect(plan).toHaveLength(MAX_ACTIONS_PER_REQUEST);
  });
});

describe("toolRunner: local (non-staged) tools run for real against the dataset", () => {
  it("search_workspace finds a real match instead of being queued", () => {
    const plan = [];
    const dataset = {
      areas: [{ id: "a1", title: "Growth", description: "" }],
      products: [], projects: [], archivedProjects: [], tasks: [], archivedTasks: [], stakeholders: [], notes: [],
    };
    const runTool = makeToolRunner({ plan, dataset });
    const result = runTool("search_workspace", { query: "growth" });
    expect(plan).toHaveLength(0);
    expect(result.count).toBe(1);
    expect(result.matches[0]).toMatchObject({ type: "area", id: "a1" });
  });
});
