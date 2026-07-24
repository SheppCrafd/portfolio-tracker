import { describe, it, expect, vi, afterEach } from "vitest";
import { runByokChat } from "./byokChat.js";

const baseContextArgs = {
  activeProjectId: null,
  userText: "archive the Q1 Newsletter project",
  conversationHistory: "",
  aiIdentity: {},
  areas: [], products: [], projects: [{ id: "p1", title: "Q1 Newsletter" }],
  archivedProjects: [], tasks: [], archivedTasks: [], stakeholders: [], departments: [], notes: [],
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("runByokChat: validation before ever making a request", () => {
  it("rejects an unknown provider", async () => {
    await expect(runByokChat({ providerConfig: { provider: "notreal" }, contextArgs: baseContextArgs })).rejects.toThrow('Unknown AI provider "notreal"');
  });

  it("rejects a configured provider with no API key", async () => {
    await expect(
      runByokChat({ providerConfig: { provider: "anthropic", model: "claude-sonnet-5", apiKey: "" }, contextArgs: baseContextArgs })
    ).rejects.toThrow("Add your Anthropic API key");
  });

  it("rejects a configured provider with no model chosen", async () => {
    await expect(
      runByokChat({ providerConfig: { provider: "openai", model: "", apiKey: "sk-test" }, contextArgs: baseContextArgs })
    ).rejects.toThrow("Pick a OpenAI model");
  });
});

describe("runByokChat: end-to-end against a mocked provider response", () => {
  it("stages a real ARCHIVE_PROJECT action from a tool call and returns {reply, actions}", async () => {
    vi.stubGlobal("fetch", vi.fn(async (url, init) => {
      const body = JSON.parse(init.body);
      if (!body.messages.some((m) => m.role === "user" && Array.isArray(m.content))) {
        return {
          ok: true,
          json: async () => ({
            content: [{ type: "tool_use", id: "toolu_1", name: "ARCHIVE_PROJECT", input: { project_id: "p1" } }],
          }),
        };
      }
      return { ok: true, json: async () => ({ content: [{ type: "text", text: "I'll archive Q1 Newsletter." }] }) };
    }));

    const result = await runByokChat({
      providerConfig: { provider: "anthropic", model: "claude-sonnet-5", apiKey: "sk-ant-test" },
      contextArgs: baseContextArgs,
    });

    expect(result.reply).toBe("I'll archive Q1 Newsletter.");
    expect(result.actions).toEqual([{ action: "ARCHIVE_PROJECT", args: { project_id: "p1" } }]);
  });
});
