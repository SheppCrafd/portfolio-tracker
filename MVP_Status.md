# Portfolio Tracker — MVP Status

_Audited 2026-07-16 against the actual product spec (manager's dashboard for tracking Areas of Responsibility → Products → Projects → Tasks, with stakeholders, an AI copilot, and an archive). Checked every claim against `src/` and `base44/` source, not assumptions._

Legend: `[x]` matches spec & verified working · `[~]` exists but is broken/incomplete/deviates from spec · `[ ]` not built

---

## 0. Top-line summary

The data model and CRUD plumbing are in good shape. But **several spec-critical visual behaviors on the primary Project card are silently broken** because the card reads field names that don't exist on the entity (camelCase vs. the real snake_case schema) — due-date color coding, the Owner name, and the inline Risks field all fail this way. There's also no custom-field system at all (a whole spec section), no attachments/links anywhere, the chat assistant matches almost none of the detailed chat spec (icon customization, attachments, session history, streaming animation, lazy-loaded history), and the Archive view can't actually open/edit an archived project — it only restores. Given how much of the spec centers on the Project card and the chat assistant, neither is at MVP yet.

---

## 1. Layout shell

- [x] Header across the top with app title + nav
- [x] Left column: stakeholders by department (`LeftSidebar` → `StakeholderList`)
- [x] Center: main dashboard content
- [x] Right column: Today's Top 3 / Weekly Focus + status bar chart (`Sidebar` → `FocusFeed`, `StatisticsChart`)
- [x] Floating chat widget, bottom-right, above everything (`ChatBox`)
- [~] "View Archive" is a header nav link (`/archive` page), not the spec's **lower-left button** that reveals a date-range picker in place. Functionally reachable, just not where/how the spec describes it, and it's a full page navigation rather than an overlay.

## 2. Dashboard hierarchy (Area → Product → Project)

- [x] Areas render as top-level cards (`AreaCard`)
- [x] Products render as nested cards inside their Area (`ProductCard`)
- [x] Projects render as nested cards inside their Product (`ProjectCard`)
- [x] Projects may skip Product and sit directly in an Area ("Admin Tasks"-style) — modeled via `parent_area_id` + null `parent_product_id`, rendered in an explicit "Direct Projects" drop zone
- [x] Drag-and-drop: projects can be dragged into a Product, or out to an Area's direct-projects zone, live-updating `parent_product_id`/`parent_area_id` (`Dashboard.jsx` `handleDragEnd`)
- [~] **"Lines which represent connections to products"** — a `ConnectionLines.jsx` component exists and is rendered inside `ProductCard`, but it's a static decorative SVG with no props driven by actual project/product relationship data. It doesn't visually connect specific project cards to specific other products the way the spec implies (a project connected to *its serving product* plus visual lines to *other* related products). Worth checking against design intent — as built, it doesn't encode any real relationship.

## 3. Project card (spec: title centered top in larger font, objective just under, quadrant squares far left, owner+date far right, risks/questions center, expand icon top-right)

File: `src/components/projects/ProjectCard.jsx`

- [x] Title centered, larger font, top of card, inline-editable
- [x] Objective shown just under title
- [x] Four quadrant-count squares on the far left (Q1 top-left, Q2 top-right, Q3 bottom-left, Q4 bottom-right/unassigned) — layout matches spec exactly
- [~] **"Number is dark green if a task in that quadrant is a focus item for the week" is broken.** The check is `t.isWeeklyFocus`, but the Task entity's real field is `is_weekly_focus`. Since `isWeeklyFocus` is always `undefined`, this highlight can never fire — every quadrant square renders in the default gray, no matter what's marked as weekly focus.
- [~] **"Archived tasks excluded from the count" is broken.** The filter is `t.isArchived`, but archived tasks are marked with `task.archived_at` (a timestamp), and this field doesn't exist as `isArchived`. In practice this is partially masked because `useTasks()` already filters out `archived_at` tasks server-side before the card sees them — so the *visible* bug is muted today, but the card's own defensive filter is dead code checking a field that will never be true, so if that upstream filter is ever loosened, archived tasks will start leaking into the count with nothing to stop them.
- [~] **Owner name is broken.** Card reads `project.owner`; the schema field is `owner_name`. Every card shows "Unassigned" regardless of what's actually set.
- [~] **Due date is broken.** Card reads `project.dueDate`; schema field is `due_date`. Every card shows "No due date" regardless of what's set.
- [~] **Due-date color coding is broken** (this is a named, detailed spec requirement — black/estimated, green/committed-on-track, orange/committed-at-risk, red/committed-missed, blue/done). Card reads `project.dueDateStatus`, comparing against string values `"Committed - On Track"`, `"Committed - At Risk"`, `"Committed - Missed"`, `"Done"` — but the actual schema enum for `due_date_status` is only `"ESTIMATED"` / `"COMMITTED"`, and there's no field anywhere that tracks on-track/at-risk/missed/done as a due-date status. **This is a real modeling gap, not just a naming bug**: the schema has no way to represent "committed and at risk" vs. "committed and on track" vs. "committed and missed" today. The only dynamic color that can ever fire is blue-for-done, computed separately from whether all tasks are complete.
- [~] **Risks & Questions center-of-card field is not the spec's Risks/Questions.** The card shows an inline-editable text block bound to `project.risks` — a flat string field that **does not exist in the Project schema at all** (schema has no `risks` property). This save will either silently fail or write an untyped extra key depending on backend strictness. Meanwhile the actual Risk/Question data model (`ProjectNote`, typed RISK/QUESTION, with reporter + stakeholders) is a *separate*, correctly-wired list rendered just below it (`ProjectNotes`). So the card currently has two disconnected "risks" mechanisms sitting next to each other — one fake, one real — which will confuse anyone editing risks from the card view.
- [x] Expand icon top-right opens the detail modal
- [x] Card also shows extra stats not in the spec (Progress %, Tasks done/total, Notes count) — reasonable additions, not a gap
- [ ] `DueDateBadge.jsx` is a separate component that implements the (also-broken, same field-name issues) due-date logic but **is never imported or rendered anywhere** — `ProjectCard` reimplements the same logic inline instead. Dead code; delete or consolidate.

## 4. Project detail / expand view

File: `src/components/projects/ProjectDetailModal.jsx`

- [x] Shows everything from the card plus more, editable
- [x] Owner, Due date, Due-date-status editable inline — **and here the field names are correct for due_date/due_date_status** (`project.due_date`, `project.due_date_status`), but **Owner is wrong here too** (`project.owner` instead of `owner_name`) — so even the "good" version of this component still can't save/show an owner.
- [x] Objective (editable)
- [x] Problem Statement (editable)
- [x] Risks & Open Questions — correctly sourced from `ProjectNote`s here (read-only list in this view; add/edit of notes happens via `ProjectNotes`, but I found no add-note button inside the detail modal itself — notes appear to only be creatable via the AI chat path, not a form in this UI)
- [x] Stakeholders organized by department, with an assigner to add/remove
- [x] Task table embedded at the bottom (`TaskTable`)
- [x] Archive / Restore / Delete actions in the footer, restore-button swap when `is_archived` — matches spec exactly
- [ ] **Reporter(s) and stakeholder(s) on individual risks/open questions** — the `ProjectNote` schema has `reporter` and `stakeholder_ids`, and `ProjectNotes.jsx` does render them when present, but there's no UI to actually *set* reporter/stakeholders when creating a note (no note-creation form exists in the app at all — see below)
- [ ] **Notes with date-added + stakeholder list** — same issue: `ProjectNote` has no `created_at`-driving field wired from a real create form (the render code checks `note.created_at`, but nothing sets it), and no dedicated "Notes" section separate from Risks/Questions exists (spec lists Notes as distinct from Risks/Open Questions)
- [ ] **Activity, Impact, and Outcome metrics (forecast and measured)** — schema has a generic `activity` string field and a generic `metrics` object, but no UI renders or edits either of them anywhere in the app
- [ ] **Attachments** — no field on any entity, no upload UI, anywhere in the app (stakeholder avatar upload is the only file upload that exists)
- [ ] **Links** — not modeled, not rendered
- [ ] **Custom fields ("add a new field, choose all-projects vs. just-this-project, choose whether it displays on the card")** — this is a whole spec feature and it's entirely missing. The schema has the right shape to support it (`Project.custom_data`, `Area.custom_schema`, `Project.display_on_card_fields`), but **no component reads or writes any of these three fields** — there is no "add field" UI anywhere in the app. This is the single largest unbuilt spec feature.
- [ ] **Archived tasks viewable from the expanded project view** — `TaskTable` (embedded here) uses `useTasks()`, which filters out anything with `archived_at` set. There's no toggle or separate section to see a project's archived tasks from this view.

## 5. Task table popup

Files: `src/components/projects/TaskTable.jsx`, `TaskTableModal.jsx`

- [x] Opens from clicking the quadrant squares on the card
- [x] Status column — all 8 values match spec exactly (dropdown, portal-rendered so it isn't clipped)
- [x] Quadrant column (1–4, editable)
- [~] **Quadrant "H"/"Q"/"HQ" suffix notation is not implemented.** The spec calls for combined labels like `1H`, `2HQ` reflecting `is_highly_important` and `is_quick_task`. Both fields exist on the schema, but **neither is read, written, or displayed anywhere in the UI** — no checkbox/toggle for either flag exists on the task row, task form, or task table.
- [x] Type column — 5 values match spec exactly
- [x] Description (editable)
- [x] Notes (editable)
- [x] Stakeholders (multi-assign via `StakeholderAssigner`)
- [x] Weekly-focus checkbox
- [x] Top-3 star toggle — **but see §7, this action is currently broken (wrong function name)**
- [x] Archive action per task
- [x] Delete action per task, with confirm
- [~] **"Blue row that says 'New Task' with a plus sign"** — a new-task row exists at the bottom with a `+` button and a text input, functionally equivalent, but it is not styled as a distinct blue row and doesn't say "New Task." Minor visual deviation from spec, not a functional gap.
- [x] New task can be created with description and/or quadrant only, other fields blank — roughly matches "created with any field but description blank"
- [ ] Attachments column — not modeled or rendered (see §4)
- [ ] No visible way to view/restore an individual archived task from anywhere (it disappears from the table with no "show archived" toggle)

## 6. Product card

File: `src/components/products/ProductCard.jsx`

- [x] Title + description top-left, both inline-editable
- [x] Stakeholders shown centered (`AvatarStack`)
- [x] Stats at the bottom (Progress %, Tasks, Projects) — matches "stats on it as well, at the bottom"
- [x] Expand icon → `ProductDetailModal`
- [ ] **Custom-field capability** — spec explicitly repeats the "add new field" ask for Products; not implemented (same gap as §4)
- [~] `ProductDetailModal` itself is quite bare relative to the card + spec ask ("same info as card, plus more details if fields were added") — it currently shows only title/description/stakeholders, dropping the stats and project list that are visible on the card itself. It's a step backward in information density from the collapsed card, not a superset.

## 7. Area of Responsibility card

File: `src/components/areas/AreaCard.jsx`

- [x] Title + description top-left, inline-editable
- [x] Expand icon → `AreaModal`
- [ ] **Custom-field capability** — same repeated spec ask, not implemented
- [~] `AreaModal` (the expanded view) shows only the nested Product/Project cards; it doesn't surface the Area's own description as editable there, nor any additional-fields section (there are none to show yet, but the container for them doesn't exist either)

## 8. Create New / Filter

File: `src/components/layout/Header.jsx`, `src/components/modals/*`

- [x] "Create New" button opens a modal with Task / Project / Product / Area type picker (`CreateModal`)
- [x] Each type has its own form (`TaskForm`, `ProjectForm`, `ProductForm`, `AreaForm`)
- [x] Filter button opens a modal to exclude any Area / Product / Project from view (`FilterModal`, `FilterContext`)
- [~] `TaskForm` (standalone, opened from the global Create button) — didn't find it wired to let the user pick a Project for the new task the way `ProjectForm` lets you pick an Area/Product; worth double-checking it actually requires/accepts `project_id` sensibly outside the per-project task table context.

## 9. Right sidebar — Focus feed + stats

File: `src/components/sidebar/FocusFeed.jsx`, `StatisticsChart.jsx`

- [x] Today's Top 3 list, sourced from `is_today_top_three`
- [x] Weekly Focus list, grouped by project (spec also says "and type" — currently only grouped by project, not further sub-grouped by task type)
- [x] Status can be changed inline from this list (dropdown)
- [x] Horizontal bar chart of task-status counts, correct color mapping per spec: Done/Delegated-Done green, Delegated blue, In Progress yellow, Blocked dark grey, Pending Feedback orange, On Hold red, no-status white-with-border — **matches spec exactly**, nice.
- [~] Bar chart is described in the spec as "by project" (i.e., one bar per project); the implementation is a single global breakdown by status across *all* tasks, not broken out per project.
- [ ] No archive/delete action available on tasks from this feed (spec: "Tasks can also be archived or deleted from here")

## 10. Left sidebar — Stakeholders

File: `src/components/sidebar/StakeholderList.jsx`, `AddStakeholderModal.jsx`

- [x] Grouped by department
- [x] Avatar shows uploaded image or initials fallback (`CanvasAvatar`)
- [x] Four count "checkboxes" per stakeholder (Tasks/Notes/Projects/Products), each showing a live count and acting as a highlight toggle — matches spec well
- [x] Clicking a count highlights/dims matching objects across the app — verified wired into `ProjectCard`, `ProductCard`, `AreaCard`, and `TaskTable` (and `FocusFeed` reads it too) via a shared `HighlightContext`
- [x] "Add Stakeholder" button above the list; requires Name + Department, image optional with real upload (`base44.integrations.Core.UploadFile`) — matches spec exactly
- [~] Spec says clicking should highlight "the quadrant of the task" specifically when a stakeholder is on a task — current implementation dims/highlights at the whole-card level (Project card) and at the table-row level, not at the individual-quadrant-square level. Close, but not literally what's described.

## 11. AI Assistant (chat copilot)

File: `src/components/ai/ChatBox.jsx`, `base44/functions/aiChatStream/`

This is the least spec-compliant part of the app. What exists:

- [x] Floating icon bottom-right, opens a chat box
- [x] Text input + submit button
- [x] Sends to an LLM, parses a structured action, executes it against the real hooks (create/update/delete across every entity, move/archive/restore project, toggle top-3, undo)
- [x] Response rendered as a markdown bubble

What the spec asks for that's missing or wrong:

- [ ] **Chat icon customization** ("choose among different icons or add their own, changes in both places") — fixed `MessageCircle` icon, not customizable
- [ ] **Attachments via a plus icon** — no plus icon, no attachment support in chat at all
- [ ] **Collapse button that hides the box but retains typed text** — there's no explicit collapse button separate from the close (`X`) button; closing just unmounts nothing (component stays mounted so text technically would persist if the box were built to hide-not-unmount), but the specific collapse-icon UI described isn't present
- [ ] **"Cool animation" on the chat icon while the LLM is responding** — only a small spinner inside the message list; the icon itself doesn't animate
- [ ] **Scroll nav bar next to a long response, with scroll-to-previous-message navigation** — not present; it's a plain scrolling div
- [ ] **Lazy-loaded message history** — messages are just local React state, nothing is persisted or paginated; refreshing the page loses all chat history
- [ ] **Saved chat sessions + "<" caret to browse previous sessions** — not implemented at all; there's exactly one in-memory conversation, gone on reload
- [ ] **The LLM should be able to answer questions about archived objects** — the live client-side prompt only sends `areas`, `products`, `projects` (already filtered to non-archived via `useProjects()`), `allTasks` (non-archived via `useAllTasks()`), and stakeholders. Archived projects/tasks and their notes are never included in context, so the assistant structurally cannot answer questions about archived work.
- [~] **Two divergent implementations exist, and the wrong one is live.** `base44/functions/aiChatStream` is a proper backend function — auth-checked server-side, a scoped prompt, structured tool-call output — but supports only 2 actions (create task, add note) and **the frontend never calls it**. What's actually shipping is `ChatBox.jsx` calling `base44.integrations.Core.InvokeLLM` directly from the browser with an unrestricted "YOU HAVE FULL SYSTEM ACCESS" prompt supporting ~25 create/update/delete actions across every entity, with **no confirmation step before destructive actions** — the prompt's own placeholder text is literally "Kill everything / Delete all". Given the spec explicitly wants the assistant to be able to do essentially anything on the page, some version of the broad-permissions approach is arguably intentional — but it should run through an authenticated backend function (like `aiChatStream` was clearly meant to), not an unrestricted client-side call, and destructive actions should confirm.
- [~] **Chat-driven field mismatches** — because the live prompt's action schema doesn't match real entity fields, several spec-required actions ("adding any level of detail to or modifying any of these objects") will silently no-op or write to nonexistent keys: task `stakeholder_id` (should be array `stakeholder_ids`), project `owner`/`dueDate`/`dueDateStatus`/`risks` (should be `owner_name`/`due_date`/`due_date_status`; `risks` doesn't exist as a project field — same schema gap as §3).
- [x] "Chat with the LLM about any other topic" — the `CHAT_ONLY` branch handles general conversation, this part works.

## 12. Archive view

File: `src/components/archive/ArchiveView.jsx`

- [x] Date-range picker (start/end date inputs)
- [x] Shows projects active/archived within that range (server-side filter in `archivedProjects` function)
- [x] Quadrant counts shown and computed server-side without shipping full task arrays — matches the spec's memory-conscious design intent well
- [~] **Tasks are never loaded on-demand from this view, because there's no task table here at all.** Spec: "tasks are retrieved only when one of the task tables is being displayed." As built, `ArchiveView` only renders a summary row with a Restore button — clicking an archived project does **not** open `ProjectDetailModal` or any task table, so there is currently no way to view or edit an archived project's full detail, notes, or tasks from the Archive page. This closes off "archived objects can be edited just like active objects" for anything reached via this page.
- [x] Restore button present and functional, matches spec's "changes to Restore Project when viewing an archived project" — though today that swap only actually happens inside `ProjectDetailModal` (which Archive view doesn't open), not here.

## 13. Cross-cutting

- [x] React Query cache invalidation wired on every mutation
- [x] Debounced inline-edit pattern used consistently (`EditableText`, `useDebouncedCallback`)
- [ ] No automated tests anywhere in the repo
- [ ] No visible error state for failed queries (only a loading state on the main dashboard)
- [ ] No confirmation dialog on most destructive actions except Area delete, task delete, and stakeholder delete (`window.confirm`) — Product delete and the AI chat's delete actions have none

---

## Bugs ranked by user-visible impact

1. **Project card due-date color, owner name, and due date are all effectively non-functional** — wrong field names (`dueDate`/`dueDateStatus`/`owner` vs. real `due_date`/`due_date_status`/`owner_name`), plus the schema itself has no field capable of representing "on track / at risk / missed" at all. This is core to the spec's front-and-center card design and needs both a schema fix (add the missing status states, or a dedicated enum) and a field-name fix.
2. **The card's "Risks & Questions" inline field writes to a Project field (`risks`) that doesn't exist**, duplicating and conflicting with the real, correctly-wired `ProjectNote`-based risks/questions list rendered right below it.
3. **"Top 3" toggle is broken end-to-end** — `useToggleTopThree` invokes function name `toggleTaskTopThree`; the deployed function is `toggleTopThree`. `src/hooks/useTasks.js:101`.
4. **Weekly-focus quadrant highlighting and archived-task exclusion on the card are dead code** — checks `t.isWeeklyFocus`/`t.isArchived`, which don't exist on Task (`is_weekly_focus`/`archived_at` are the real fields).
5. **No custom-field system** — a repeated, explicit spec feature (per-object custom fields, global-vs-single-object scope, opt-in card display) with schema support already in place (`custom_data`, `custom_schema`, `display_on_card_fields`) but zero UI.
6. **AI chat is architecturally risky and doesn't match the spec** — unrestricted client-side "full system access" prompt with no destructive-action confirmation, a real auth-checked backend function sitting unused, and no icon customization/attachments/session history/lazy loading/streaming animation from the spec.
7. **Archive view can't open/edit an archived project** — no task table, no detail view reachable from that page; only a bare restore button.
8. **No attachments, links, Activity/Impact/Outcome metrics UI, or per-note reporter/stakeholder/date capture form** anywhere, despite schema support for most of it.
9. **Quadrant H/Q/HQ labeling is entirely unbuilt** even though `is_highly_important`/`is_quick_task` exist on the schema.
10. **Product delete doesn't cascade** to child projects/tasks the way Area/Project delete do.
11. **`DueDateBadge.jsx`** is dead, unused code duplicating (and not fixing) the same bug as the card.

## Suggested order of attack

1. Fix Project card field names (`owner_name`, `due_date`, `due_date_status`) and decide how to model on-track/at-risk/missed/done — this alone fixes the most visibly broken part of the spec's centerpiece UI.
2. Point the card's Risks/Questions block at `ProjectNote` create/list instead of the nonexistent `project.risks`, and add a way to set reporter/stakeholders/date on a new note.
3. Fix the Top 3 invoke-name bug (one line).
4. Fix the dead camelCase checks on the card (`isWeeklyFocus`, `isArchived`).
5. Build the custom-field system (schema's already there) — this is the largest missing feature by spec weight.
6. Consolidate the AI assistant onto the backend function, add destructive-action confirmation, and fix its field-name mapping; then layer in the chat-UX spec items (icon customization, attachments, session history, animation) roughly in that order of user value.
7. Wire archived-project detail/task viewing into the Archive page.
8. Add H/Q quadrant labeling, attachments/links, and Activity/Impact/Outcome metrics UI.
9. Make Product delete cascade consistently with Area/Project.
