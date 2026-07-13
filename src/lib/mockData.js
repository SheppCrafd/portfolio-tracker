// Central mock data for the Phase 1 prototype. All data is in-memory only.

export const mockStakeholders = [
  { id: "st-1", name: "Ava Chen", department: "Design", avatarUrl: "https://broken-url.example/ava.png" },
  { id: "st-2", name: "Marcus Lee", department: "Engineering", avatarUrl: "https://broken-url.example/marcus.png" },
  { id: "st-3", name: "Priya Nair", department: "Engineering", avatarUrl: "https://broken-url.example/priya.png" },
  { id: "st-4", name: "Sofia Ruiz", department: "Product", avatarUrl: "https://broken-url.example/sofia.png" },
  { id: "st-5", name: "Ken Watanabe", department: "Design", avatarUrl: "https://broken-url.example/ken.png" },
  { id: "st-6", name: "Grace Kim", department: "Product", avatarUrl: "https://broken-url.example/grace.png" },
  { id: "st-7", name: "Omar Faruk", department: "Engineering", avatarUrl: "https://broken-url.example/omar.png" },
];

export const mockProjects = [
  {
    id: "proj-1",
    productId: "prod-1",
    title: "Redesign onboarding flow for new workspace members joining teams",
    quadrant: { q1: 4, q2: 2, q3: 7, q4: 1 },
    dueDate: "2026-07-10",
    notes: [
      { type: "risk", text: "Design handoff may slip a week" },
      { type: "question", text: "Do we support SSO in v1?" },
    ],
    taskIds: ["task-1", "task-2", "task-3"],
  },
  {
    id: "proj-2",
    productId: "prod-1",
    title: "Ship notification preferences center",
    quadrant: { q1: 1, q2: 5, q3: 3, q4: 2 },
    dueDate: "2026-07-14",
    notes: [{ type: "question", text: "Should digest emails be opt-out?" }],
    taskIds: ["task-4"],
  },
  {
    id: "proj-3",
    productId: "prod-2",
    title: "Billing dashboard v2 with usage graphs and export",
    quadrant: { q1: 6, q2: 0, q3: 2, q4: 4 },
    dueDate: "2026-08-01",
    notes: [{ type: "risk", text: "Data pipeline not finalized" }],
    taskIds: ["task-5"],
  },
];

export const mockProducts = [
  {
    id: "prod-1",
    areaId: "area-1",
    name: "Workspace Core",
    stakeholderIds: ["st-1", "st-2", "st-3", "st-4", "st-5", "st-6"],
    completionPct: 62,
    projectIds: ["proj-1", "proj-2"],
  },
  {
    id: "prod-2",
    areaId: "area-1",
    name: "Billing Platform",
    stakeholderIds: ["st-4", "st-7"],
    completionPct: 34,
    projectIds: ["proj-3"],
  },
  {
    id: "prod-3",
    areaId: "area-2",
    name: "Mobile Experience",
    stakeholderIds: ["st-1", "st-5"],
    completionPct: 80,
    projectIds: [],
  },
];

export const mockAreas = [
  { id: "area-1", name: "Growth & Platform", productIds: ["prod-1", "prod-2"] },
  { id: "area-2", name: "Mobile", productIds: ["prod-3"] },
];

export const mockTasks = [
  { id: "task-1", projectId: "proj-1", description: "Wireframe new welcome screens", status: "done" },
  { id: "task-2", projectId: "proj-1", description: "Build SSO provider selection UI", status: "in_progress" },
  { id: "task-3", projectId: "proj-1", description: "QA pass on invite flow", status: "todo" },
  { id: "task-4", projectId: "proj-2", description: "Wire up email digest toggle", status: "in_progress" },
  { id: "task-5", projectId: "proj-3", description: "Connect usage export to CSV", status: "todo" },
];

export const mockArchivedItems = [
  {
    id: "arch-1",
    type: "project",
    title: "Legacy search revamp",
    archivedDate: "2026-05-02",
    productId: "prod-1",
    quadrant: { q1: 0, q2: 0, q3: 0, q4: 8 },
    dueDate: "2026-04-01",
    notes: [],
    taskIds: [],
  },
  {
    id: "arch-2",
    type: "product",
    title: "Deprecated Widgets SDK",
    archivedDate: "2026-04-18",
    areaId: "area-2",
    stakeholderIds: ["st-2"],
    completionPct: 100,
    projectIds: [],
  },
];