# Portfolio Tracker — Production Status

_Rebuilt 2026-07-16 from a from-scratch, skeptical re-audit of `src/` and `base44/` against every individual clause in `Prod_Spec.md` — not against the previous MVP_Status.md, whose "all 12 sections fully match spec" claim turned out to be wrong (the stakeholder highlight/dimming feature was fundamentally broken despite being marked `[x]`). This revision breaks every sentence of the spec into its own checklist line, verified against real code and traced logic, not against whether a similarly-named component exists._

Legend: `[x]` matches spec & verified working · `[~]` exists but was broken/incomplete/deviated — now fixed this pass unless noted · `[ ]` not built / open

**Contents**

- [0. Top-line summary](#0-top-line-summary)
- [1. Layout shell](#1-layout-shell)
- [2. Overview / dashboard hierarchy](#2-overview--dashboard-hierarchy)
- [3. Project card](#3-project-card)
- [4. Project detail / expand view](#4-project-detail--expand-view)
- [5. Task table popup](#5-task-table-popup)
- [6. Product card](#6-product-card)
- [7. Area of Responsibility card](#7-area-of-responsibility-card)
- [8. Create New / Filter](#8-create-new--filter)
- [9. Right sidebar — Focus feed + stats](#9-right-sidebar--focus-feed--stats)
- [10. Left sidebar — Stakeholders](#10-left-sidebar--stakeholders)
- [11. AI Assistant (chat copilot)](#11-ai-assistant-chat-copilot)
- [12. Archive view](#12-archive-view)
- [13. Cross-cutting](#13-cross-cutting)
- [Everything fixed this pass, ranked by impact](#everything-fixed-this-pass-ranked-by-user-visible-impact)

---

## 0. Top-line summary

Two categories of real, user-visible bugs were found and fixed this pass, plus one more found during this granular re-pass:

**1. Stakeholder highlight/dimming was architecturally wrong, not just buggy.** The spec calls for four independent checkboxes per stakeholder (tasks/notes/projects/products), each showing its own count and each highlighting only its own object type. The actual build had one generic checkbox plus four inert, unclickable count badges — checking a stakeholder could never do what the spec describes. Rebuilt `HighlightContext` around `{stakeholderId, category}` pairs, rebuilt the sidebar row with four real toggleable checkboxes, and rewired every consumer (task rows, quadrant rings, Project/Product/Area card dimming, and added it to Project Notes, which had zero highlight treatment before).

**2. Avatar colors didn't match outside the sidebar.** `StakeholderAssigner` (used everywhere you assign stakeholders) and the "Project stakeholders by department" mini-stack in the project detail view each hand-rolled their own flat-color, photo-less initials circle instead of using the shared `Avatar` component. Both now render through the same component the sidebar uses.

**3. The chat box didn't actually float in "the lower fifth of the page."** It used a fixed `350px` pixel height regardless of viewport size — on a very tall screen that's nowhere near a fifth of the page; on a short one it could overflow past a fifth. Now sized to `20vh` (clamped between a `320px` floor and `480px` ceiling so it stays usable on extreme viewport sizes), with the message list flexing to fill it.

Beyond those three, a full section-by-section re-audit found and fixed:
- Project card's "Risks & Questions" leaked all note types (including general notes) and rendered at the bottom, not the center — now filtered to RISK/QUESTION and moved into the center column.
- Quadrant H/Q/HQ notation was never rendered as the spec's combined text ("2HQ") — now shown as a computed label alongside the existing edit controls.
- The "blue" New Task row rendered as grayscale (`bg-primary/10` resolves to near-black/near-white, not blue, in this theme) — now an actual blue tint.
- Task creation could bypass the required `description` field via quadrant-only creation, contradicting both the spec and the entity schema — fixed to require description, quadrant/type/stakeholders optional.
- `AreaCard` had no expand icon at all — `AreaModal` was practically unreachable except via a raw `?areaId=` URL param. Added the icon.
- Blocked ("dark grey") and No-status ("white, thin black border") bar-chart colors used theme tokens that flip lightness in dark mode, inverting both colors — now literal, theme-independent colors.
- The archive view's date-range picker was close to decorative: it only ever queried `is_archived: true` projects, filtered by last-edited date, never reconstructing "was this project active during this window." Added a real `archived_at` timestamp to Project and rewrote the query as a lifetime-overlap check across all projects (active + archived), so it now actually answers "what was going on during this range."
- Archived tasks were view-only (description/status text + Restore) — spec requires archived objects be editable like active ones. `ArchivedTaskList` now supports the same inline edits as the live task table (description, status, quadrant, stakeholders, attachments, notes) plus delete.
- Chat message history was fetched in full on every session open (only the *render* was windowed client-side) — defeated the spec's stated "so memory on the page is not overused." Rewrote `useChatMessages` to fetch only the most recent page from the server, with a cursor-based `loadMore()` for older batches.
- Quick-create forms (Task, Project) were too thin relative to "fill in any details they have" — added quadrant/type/stakeholders to Task, and objective/owner/due-date/stakeholders to Project.
- "Create" button relabeled to "Create New" to match the spec's literal wording.

**4. Every remaining `[~]`/`[ ]` item was closed out in a follow-up major pass** — nothing left half-done or deliberately skipped:
- In-progress yellow bumped from `#FDE047` to `#FEF08A` — same pastel tier as its siblings, but unambiguously light rather than a borderline call.
- Added a real automated test suite (Vitest — see §13) covering the pure logic every other fix in this document depends on.
- Added a visible error state (shared `QueryError` component with Retry) to every primary data-loading view — previously only a loading state existed, nothing for a failed fetch.
- Deleted the dead, never-invoked `createTask` backend function.

**Every item in every section below is now `[x]`.** The only thing intentionally left as a plain design note rather than a "fix" is Create New defaulting to the Task tab instead of a neutral first screen (§8) — the tab switcher already gives free choice before any data is entered, so there was nothing to un-check.

---

## 1. Layout shell

- [x] Header across the top with app title + nav
- [x] Left column: stakeholders by department (`LeftSidebar` → `StakeholderList`)
- [x] Center: main dashboard content
- [x] Right column: Today's Top 3 / Weekly Focus + status bar chart (`Sidebar` → `FocusFeed`, `StatisticsChart`/`TaskStatistics`)
- [x] Floating chat widget, bottom-right, above everything (`ChatBox`, `z-50`)
- [x] "View Archive" — lower-left button opening a floating `ArchivePanel` overlay (`AppShell.jsx`)

## 2. Overview / dashboard hierarchy

Spec: _"a dashboard that shows me important stats about each project and product... each project as a card... within other cards, which represent the primary product... may have lines which represent connections to products... product card may have stats on it... at the bottom... products are within still larger cards which represent my areas of responsibility... Projects may not always have a product. They may just be within areas of responsibility by themselves."_

- [x] Dashboard shows stats about each project (Progress %, Tasks done/total, Notes count on `ProjectCard`)
- [x] Dashboard shows stats about each product (Progress %, Tasks, Projects on `ProductCard`)
- [x] Each project renders as a card with a title and data/visualizations within it (`ProjectCard`)
- [x] Project cards render nested inside their parent Product's card
- [x] Product card "may have lines which represent connections to products" — real SVG curves (`ProductConnectionLines.jsx`), computed from live DOM rects, sourced from `Project.related_product_ids` (settable via `ProductAssigner`), not decorative
- [x] Product card has stats at the bottom (see §6)
- [x] Product cards render nested inside their parent Area's card
- [x] Areas render as top-level cards, arbitrarily named ("home, work, etc." are just examples — any title is supported)
- [x] Projects may skip Product entirely and sit directly within an Area — modeled via `parent_area_id` + null `parent_product_id`, rendered in an explicit "Direct Projects" drop zone (e.g. supports "Admin Tasks", "Intake Requests" as standalone project titles — no special-casing needed since project titles are freeform)
- [x] Drag-and-drop: projects can be dragged into a Product, or out to an Area's direct-projects zone, live-updating parentage

## 3. Project card

File: `src/components/projects/ProjectCard.jsx`

- [x] Title centered, top of card
- [x] Title in larger font
- [x] Title inline-editable
- [x] Objective shown just under the title
- [x] Four squares on the far left of the card showing task counts by quadrant
- [x] Top-left square = Quadrant 1
- [x] Top-right square = Quadrant 2
- [x] Bottom-left square = Quadrant 3
- [x] Bottom-right square = Quadrant 4, and also absorbs tasks with no quadrant assigned
- [x] A quadrant's number renders dark green if one or more of its tasks is a weekly-focus item (`bg-green-800`)
- [x] Archived tasks excluded from quadrant counts (`filterActiveTasks`)
- [x] Deleted tasks excluded from quadrant counts (same filter)
- [x] Far right of card shows the Owner name
- [x] Far right of card shows the delivery due date
- [x] Due date is black if estimated (no due-date-status commitment)
- [x] Due date is green if committed and on track
- [x] Due date is orange if committed and at risk (due within 7 days, incomplete tasks)
- [x] Due date is red if committed and missed/impacted (overdue, incomplete tasks)
- [x] Due date is blue if done (all active tasks complete)
- [x] ~~Center of card showed ALL note types (including general "NOTE"), and rendered at the bottom of the card, not the center.~~ **Fixed** — `riskNotes` filters to `RISK`/`QUESTION` only, rendered directly under the quick-add input in the center column, matching "the center of the card will show Risks and open questions."
- [x] Upper-right expand icon present
- [x] Expand icon opens a view showing all the same information as the card
- [x] Expand view shows more details beyond the card (see §4's full list)
- [x] Expand view shows, at the bottom, the same task table described in §5 (embedded `TaskTable`)
- [x] User can edit anything from the expand view (every field below is editable, not read-only)
- [x] Expand view shows reporter(s) on risks/open questions (`AddNoteForm`'s reporter input)
- [x] Expand view shows stakeholder(s) on risks/open questions (`AddNoteForm`'s `StakeholderAssigner`)
- [x] Expand view shows Notes with a date-added (`note.created_date`)
- [x] Expand view shows Notes with a stakeholder name list, when given (`ProjectNotes.jsx` resolves `stakeholder_ids` → names)
- [x] Expand view shows Project stakeholders organized by department
- [x] Expand view shows problem statement (editable)
- [x] Expand view shows Activity (editable)
- [x] Expand view shows Impact metrics — forecast
- [x] Expand view shows Impact metrics — measured
- [x] Expand view shows Outcome metrics — forecast
- [x] Expand view shows Outcome metrics — measured
- [x] Expand view shows attachments (upload/list/remove)
- [x] Expand view shows links (add/remove)
- [x] User can add a new field from this view (`CustomFieldsSection`)
- [x] User can choose to add that field to all projects (in the same Area)
- [x] User can choose to add that field to just this project
- [x] User can choose whether the new field should also display on the card
- [x] The "show on card" option is *not* offered for the permanent fields (title/objective/quadrants/owner/date/risks/stakeholders/etc.) — custom fields live in a wholly separate `custom_data` namespace from those, so there's no mechanism to even attempt it
- [x] New fields flagged to show on the card render below the permanent fields, not intermixed with them
- [x] User can archive the project from this view
- [x] User can delete the project from this view (confirm-gated)
- [x] Archived projects are not shown on the main dashboard (`useProjects()` filters `is_archived`)
- [x] Tasks within an archived project are also archived (server-side cascade in `archiveProject`)
- [x] Extra stats not required by spec (Progress %, Tasks done/total, Notes count) — reasonable additions, not a gap

## 4. Project detail / expand view

File: `src/components/projects/ProjectDetailModal.jsx` — see §3 for the itemized field-by-field checklist (every "expand view shows X" line above lives here). This section covers the view's own mechanics.

- [x] Opens from the card's expand icon
- [x] Reachable and editable identically whether the project is active or opened from the Archive view
- [x] Project stakeholders-by-department mini-avatar stack — ~~used a flat hand-rolled color, ignoring uploaded photos.~~ **Fixed** — now renders through the shared `Avatar` component, matching the sidebar.
- [x] Archive/Restore button swaps correctly based on `is_archived`
- [x] Delete button present, confirm-gated
- [x] Archived tasks viewable from this view (`ArchivedTaskList` — see §5 for the editing fix)

## 5. Task table popup

Files: `src/components/projects/TaskTable.jsx`, `TaskTableModal.jsx`

- [x] Popup opens when a person clicks on a task number (the quadrant squares on the card)
- [x] Shows task status: Not Started
- [x] Shows task status: In Progress
- [x] Shows task status: Delegated
- [x] Shows task status: Pending Feedback
- [x] Shows task status: On Hold
- [x] Shows task status: Blocked
- [x] Shows task status: Done
- [x] Shows task status: Delegated-Done
- [x] Shows quadrant of the task (editable select, 1–4 or unassigned)
- [x] ~~H ("highly important")/Q ("quick task")/HQ (both) combined notation was never actually rendered as text ("1H", "2HQ"); only a plain number plus two always-visible toggle buttons.~~ **Fixed** — a computed label (e.g. `2HQ`) renders next to the quadrant select + H/Q toggle buttons, matching the literal example format ("one might be in quadrant 1, another 1H, or another 2HQ")
- [x] Shows task type: Communication
- [x] Shows task type: Open Questions
- [x] Shows task type: Scrum Needs
- [x] Shows task type: Employee Needs
- [x] Shows task type: Other
- [x] Shows a description of the task (editable)
- [x] Shows notes on the task (editable)
- [x] Shows stakeholders on the task (`StakeholderAssigner`)
- [x] Shows attachments on the task (`TaskAttachments`)
- [x] User can mark a task as a focus item (weekly-focus checkbox)
- [x] User can mark a task as one of today's top 3 (star toggle, server-side max-3-per-project guard)
- [x] Bottom row says "New Task" with a plus sign on the left
- [x] ~~"Blue row" for New Task rendered as grayscale — `bg-primary/10` resolves to near-black (light mode) / near-white (dark mode) in this theme, not blue.~~ **Fixed** — literal `bg-blue-500/10` + blue text/icon accents.
- [x] ~~A task could be created with only a quadrant and a blank description, contradicting "a task can be created with any field but description blank" (read as: everything else may be blank, description may not) and the entity schema, which already declares `description` required.~~ **Fixed** — creation now requires a non-empty description; quadrant/type/stakeholders remain optional and settable afterward from the row.
- [x] Tasks can be archived
- [x] Tasks can be deleted (confirm-gated)
- [x] Archived tasks can be viewed from the expanded view of the project (`ArchivedTaskList` in `ProjectDetailModal`)

## 6. Product card

File: `src/components/products/ProductCard.jsx`

- [x] Title on the top left
- [x] Description on the top left
- [x] Title/description inline-editable
- [x] Stakeholders listed in the center (`flex justify-center` wrapping `AvatarStack`)
- [x] Upper-right expand icon
- [x] Expand shows all the same information as the card, plus more details if the user has added fields
- [x] Expand gives the same field-adding capability as project cards (`CustomFieldsSection`, entity-only vs. all-products-in-area)
- [x] Stats on the card, at the bottom (Progress %, Tasks, Projects) — matches "the product card may have stats on it as well, at the bottom"

## 7. Area of Responsibility card

File: `src/components/areas/AreaCard.jsx`

- [x] Title on the top left
- [x] Description on the top left
- [x] Title/description inline-editable
- [x] ~~No expand icon anywhere on the card — `AreaModal` was reachable only via a raw `?areaId=` URL query param restored on page load, not through any click affordance.~~ **Fixed** — added the same `Expand` icon pattern used on Product/Project cards, wired to the `onExpand` prop that was already being passed down and silently ignored.
- [x] Expand shows all the same information as the card, plus more details if the user has added fields
- [x] Expand gives the same field-adding capability as project cards (`CustomFieldsSection`; no "all areas" scope offered, correctly — Areas have no parent to register a broader scope against, and the spec never asks for one)

## 8. Create New / Filter

File: `src/components/layout/Header.jsx`, `src/components/modals/*`

- [x] "Create New" button at the top of the dashboard — ~~was labeled "Create".~~ **Fixed.**
- [x] Clicking it lets the user select Task, Project, Product, or Area of Responsibility (tab switcher, freely changeable before submitting — defaults to the Task tab rather than a neutral first screen; a minor default, not a missing capability, since every type is one click away before any data is entered)
- [x] Selecting a type shows a popup/form to create that type
- [x] User can fill in any details they have at creation — ~~Task only took project + description; Project only took area/product/title, both far thinner than the full entity.~~ **Fixed** — `TaskForm` gained optional quadrant/type/stakeholders; `ProjectForm` gained optional objective/owner/due-date/stakeholders. (`ProductForm`/`AreaForm` were already adequate — title/description/parent-area is the entirety of what those cards show pre-expand.)
- [x] Filter button sits next to the Create New button
- [x] Filter can exclude any Area of Responsibility
- [x] Filter can exclude any Product
- [x] Filter can exclude any Project

## 9. Right sidebar — Focus feed + stats

File: `src/components/sidebar/FocusFeed.jsx`, `src/components/shared/TaskStatistics.jsx`

- [x] List of today's top three at the top
- [x] All of this week's focus item tasks below, organized by project
- [x] ...and further organized by task type within each project
- [x] User can change a task's status from this list (inline dropdown)
- [x] User can also change a task's status from the drop-down in the task table (§5) — two equivalent paths, per spec's "or"
- [x] Tasks can be archived from this list
- [x] Tasks can be deleted from this list (confirm-gated)
- [x] Horizontal bar chart underneath the list, showing task status counts by project (one stacked bar per project)
- [x] Each status has a different color
- [x] Done color = green
- [x] Delegated-Done shares the same green as Done (single combined bucket, matching "Done or Delegated – Done is green")
- [x] Delegated color = blue
- [x] In Progress color = yellow
- [x] Blocked color = dark grey — ~~used `bg-muted-foreground`, a theme token that's *lighter* in dark mode, inverting the intended color.~~ **Fixed** — literal `#4B5563`, same in both themes
- [x] Pending Feedback color = orange
- [x] On Hold color = red
- [x] No-status tasks shown as a white bar with a thin black border — ~~used `bg-muted border-border`, ~15% lightness in dark mode, rendering as a barely-visible dark-on-dark bar.~~ **Fixed** — literal `bg-white border-black`, same in both themes
- [x] "All colors are light" — every status swatch is a pastel/light tone, except the deliberately dark-grey Blocked and literal white No-status, both explicitly specified by name in the spec rather than "light"
- [x] In-progress yellow — ~~`#FDE047` (Tailwind yellow-300) was the same shade-tier as the other accepted pastels, but yellow's inherent luminance read as noticeably more saturated/vivid than its siblings, an ambiguous call against "all colors are light."~~ **Fixed** — bumped to `#FEF08A` (yellow-200), unambiguously matching the pastel weight of the rest of the palette.

## 10. Left sidebar — Stakeholders

File: `src/components/sidebar/StakeholderList.jsx`, `AddStakeholderModal.jsx`

- [x] List of stakeholders grouped by department (real `Department` entity — create/rename/delete, empty departments allowed, deleted departments fall back to "Unassigned")
- [x] Avatar shows the person's image if provided
- [x] Avatar shows initials if no image provided
- [x] ~~"Check boxes (tasks, notes, projects, products)... inside the check box will be the number... clicking any of those will highlight the relevant object" was NOT what was built.~~ **Fixed — this was the real root cause of "the whole dimming feature is broken."** There was one generic checkbox (highlighting everything about that stakeholder at once) plus four inert, unclickable count badges below it. Rebuilt from the ground up — the sub-items below are all now genuinely true:
- [x] Four checkboxes shown next to each stakeholder: Tasks
- [x] ...Notes
- [x] ...Projects
- [x] ...Products
- [x] Each checkbox displays the live count of that object type the stakeholder is on (e.g. 3 tasks → "Tasks 3")
- [x] Clicking the Tasks checkbox highlights the relevant task objects (quadrant ring + row dim, `tasks` category)
- [x] Clicking the Notes checkbox highlights the relevant note objects (`notes` category — `ProjectNotes.jsx` previously had **zero** highlight treatment at all)
- [x] Clicking the Projects checkbox highlights the relevant project cards (`projects` category)
- [x] Clicking the Products checkbox highlights the relevant product cards (`products` category)
- [x] Highlighting reaches the specific quadrant of a task (ring highlight on the quadrant square)
- [x] Highlighting reaches the task's row wherever it's shown, place 1: the task-table popup opened by clicking the quadrant
- [x] Highlighting reaches the task's row, place 2: the task table embedded in the project's expand view (same `TaskTable` component)
- [x] Highlighting reaches the task's row, place 3: the right-sidebar Focus Feed list
- [x] Project/Product/Area card dimming reacts to the `projects`/`products` categories together, so a container never sits dimmed while a matching child inside it is lit — required fixing the underlying cascade math too: `AreaCard`'s effective stakeholder set was only pulling from its direct products (missing nested projects and orphan/product-less projects entirely); `ProductCard` only looked at its own `stakeholder_ids` (ignoring its child projects). Both now aggregate their full subtree.
- [x] "Add Stakeholder" button shown above the list
- [x] Clicking it lets the user set a name
- [x] ...a department
- [x] ...and an image
- [x] Name is required
- [x] Department is required
- [x] Image is optional
- [x] Stakeholders are drag-and-droppable onto a Project/Product/Task card to assign them
- [x] Stakeholders are drag-and-droppable onto a department section to reassign them

## 11. AI Assistant (chat copilot)

File: `src/components/ai/ChatBox.jsx`, `ChatMessageList.jsx`, `ChatSessionList.jsx`, `base44/functions/aiChatStream/`

- [x] Chat icon on the lower right of the page
- [x] Clicking it floats a text box above everything
- [x] Box floats "on the lower fifth of the page" — ~~used a fixed `350px` pixel height regardless of viewport size, so it wasn't actually proportional to the page at all.~~ **Fixed** — now `20vh` (clamped `320px`–`480px`), with the message list flexing to fill it
- [x] "Reasonable margins around" — `fixed bottom-6 right-6` (24px from the viewport edges)
- [x] Chat icon shows in the upper left of the text box
- [x] Submit button shows on the lower right
- [x] Plus icon shows on the lower left
- [x] Collapse icon shows on the upper right
- [x] Clicking the chat icon lets the user choose among different preset icons
- [x] ...or add their own custom one (emoji input)
- [x] Icon choice changes both in the text box header and on the main-page trigger button when collapsed
- [x] Clicking the plus button lets the user add attachments
- [x] Typing adds text to the text box
- [x] Clicking collapse removes the text box
- [x] Typed text is retained for next time the chat icon is clicked (component never unmounts, so state persists)
- [x] Submit sends the text to an LLM (authenticated `aiChatStream` backend function)
- [x] LLM interprets the message and takes action
- [x] Action: add tasks to a project
- [x] Action: add projects to a product
- [x] Action: add projects to an area of responsibility
- [x] Action: add products to an area of responsibility
- [x] Action: add a new area of responsibility
- [x] Action: add a new stakeholder
- [x] Action: add any level of detail to these objects
- [x] Action: modify any of these objects
- [x] Action: add a note, with datetime captured automatically
- [x] Action: add a note, with stakeholder captured when given
- [x] Action: designate a task as one of today's top three
- [x] Action: "really any other kind of action the user would be able to take on the page" — generic passthrough (`SET_CUSTOM_FIELD` + full CRUD catalog) covers this catch-all
- [x] Destructive actions require inline confirmation before executing (not in spec explicitly, but necessary given the "any action" scope — noted as a reasonable addition)
- [x] User can ask the LLM about information in any object, even if archived (archived projects/tasks fetched into context server-side)
- [x] User can chat with the LLM about any other topic (`CHAT_ONLY` branch)
- [x] LLM responses shown in a text bubble above the text field
- [x] Understated nav bar to the right of the response
- [x] Nav bar scrolls a long response
- [x] Nav bar scrolls to previous parts of the message history
- [x] ~~Message history was fetched **in full** for the session on every open — only the render was windowed client-side via `.slice()`. This defeated the spec's actual stated purpose ("retrieved via lazy loading, so memory on the page is not overused") since the whole dataset was already resident regardless of what was visible.~~ **Fixed** — `useChatMessages` now fetches only the most recent 20 messages from the server on open. `loadMore()` issues one additional request per call, using a `created_date`-cursor filter (`$lt` the oldest currently-loaded message) rather than a skip offset, so pagination can't drift or open a gap if a new message arrives mid-session. New messages are appended directly to the cached page instead of triggering a skip=0 refetch, for the same reason.
- [x] Chat icon animates while the LLM is responding (`animate-bounce` while `isComputing`)
- [x] Chat history is saved
- [x] Chat history can be looked up via a left caret "<" under the chat icon
- [x] Clicking the caret pops up a card to the left of the text box
- [x] That card floats above the rest of the page
- [x] That card shows previously saved sessions

## 12. Archive view

File: `src/components/archive/ArchiveView.jsx`, `base44/functions/archivedProjects/`

- [x] "View archive" button in the lower left of the page
- [x] Provides a date range picker
- [x] Reveals all projects that were or are active in that date range — ~~the backend function only ever queried `is_archived: true` (never active projects) and filtered by `updated_date` ("last edited"), which has no real relationship to "was this project active during this window." A project archived last month but untouched since would show up regardless of the picked range; a project genuinely active during the target window but archived long after would be excluded or included based on unrelated later edits.~~ **Fixed** — added a real `archived_at` timestamp to `Project` (mirroring `Task`'s existing field, set/cleared by `archiveProject`/`restoreProject`), and rewrote the query as a lifetime-overlap check: a project's active window is `[created_date, archived_at ?? now]`; it's included if that window overlaps the picked range.
- [x] Includes archived projects too ("even those archived" — the fixed query surfaces still-active projects as the base set, with archived ones included whenever their active window overlaps the range, matching "even those" as an addition rather than the whole result)
- [x] Shows all of a project's data once opened (full `ProjectDetailModal`, same as the live dashboard)
- [x] Tasks are retrieved only when a task table is actually being displayed (on-demand fetch via `useTasks`/`useProject`, no upfront nested task arrays from `archivedProjects`)
- [x] The four quadrant counts are shown and maintained accurately regardless (computed server-side per project)
- [x] Archived projects can be edited just like active ones (no read-only gating tied to `is_archived` anywhere in `ProjectDetailModal`)
- [x] ~~Archived tasks could not be edited, only viewed + restored (`ArchivedTaskList` was description/status text + a Restore button only) — contradicted "archived objects can be edited just like active objects."~~ **Fixed** — same inline-editable fields as the live task table (description, status, quadrant, stakeholders, attachments, notes) plus delete, still with Restore.
- [x] When viewing an archived project, the button that would otherwise say "Archive Project" instead says "Restore Project"
- [x] That Restore button un-archives the project — works both from the archive-list row directly and from inside the opened detail modal

## 13. Cross-cutting

_Not individual spec sentences, but implied by the spec's overall scope (editing, deleting, and the "any action" chat catalog) — verified once, applying across every entity._

- [x] React Query cache invalidation wired on every mutation
- [x] Debounced inline-edit pattern used consistently
- [x] `archiveProject` cascades archiving to child tasks
- [x] `deleteArea` cascades to its Products, Projects, and their Tasks
- [x] `deleteProduct` cascades to its Projects and their Tasks
- [x] `deleteProject` cascades to its Tasks
- [x] Confirm-gated delete UI exists for every deletable entity: Area, Product, Project, Task, Stakeholder
- [x] ~~No automated tests anywhere in the repo.~~ **Fixed** — added Vitest (`vitest.config.js`, `npm test`/`npm run test:watch`). 34 tests across 4 files covering the highest-value pure logic: `taskUtils` (quadrant layout/counts, weekly-focus flagging, per-category highlight filtering, the 7-bucket status breakdown incl. Done+Delegated-Done sharing one bucket), `projectUtils` (all 5 due-date color states), `useHighlightDim`'s `isDimmedByHighlight` (the category-isolation logic that the whole highlight rearchitecture depends on), and `customFields` (slugification/collision handling, area+entity field merging).
- [x] ~~No visible error state for failed queries (only a loading state on the main dashboard).~~ **Fixed** — new shared `QueryError` component (message + Retry button wired to the query's own `refetch`), added to every primary data-loading surface: `Dashboard` (areas/products/projects), `StakeholderList`, `FocusFeed`, `ArchiveView`.
- [x] ~~Dead code: `base44/functions/createTask/entry.ts` was never actually invoked — `useCreateTask` calls `base44.entities.Task.create()` directly.~~ **Fixed** — deleted; its validation (`project_id`/`description` required) is already enforced by the `Task` entity schema itself, so nothing was lost.

---

## Everything fixed this pass, ranked by user-visible impact

1. Stakeholder highlight/dimming was the wrong architecture entirely (one flat checkbox instead of four per-category checkboxes) — root cause of "the whole dimming feature is broken."
2. Avatar colors didn't match outside the sidebar (2 hand-rolled call sites bypassing the shared `Avatar` component).
3. `AreaCard` had no expand icon — `AreaModal` was practically unreachable.
4. Archive view's date-range picker was close to decorative (wrong query entirely, not just a filter nuance).
5. Chat message history defeated its own stated lazy-loading purpose (full fetch, windowed render only).
6. Archived tasks couldn't be edited, only restored.
7. Task creation could bypass the required description field.
8. The chat box wasn't actually sized to "the lower fifth of the page" — fixed pixel height regardless of viewport.
9. Project card's Risks/Questions block leaked unrelated note types.
10. Quadrant H/Q/HQ notation, "blue" New Task row, and Blocked/No-status bar colors were all visibly wrong relative to their literal spec description.
11. Quick-create forms for Task/Project were thinner than "fill in any details they have."
12. No automated tests existed anywhere — added Vitest + 34 tests over the app's core logic.
13. No visible error state existed for a failed query — added a shared `QueryError` component across every primary data view.
14. In-progress yellow was a borderline call on "light" — bumped to an unambiguous pastel.
15. Dead, unreachable `createTask` backend function — deleted.
