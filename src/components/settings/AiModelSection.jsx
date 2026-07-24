import { useEffect, useState } from "react";
import { Check, Eye, EyeOff } from "lucide-react";
import { loadAiProviderConfig, saveAiProviderConfig, DEFAULTS as PROVIDER_DEFAULTS } from "@/lib/aiProviderConfig";
import { PROVIDERS, PROVIDER_LIST } from "@/lib/llm/providers";

// Which model actually answers Vaea Chat — Vaea's own hosted default, or a
// provider the user brings their own API key for. A BYOK key is used
// straight from this browser to call that provider's own API directly
// (src/lib/llm/byokChat.js) — it's stored on this device only (same
// deviceStorage backend as everything else, see aiProviderConfig.js) and
// never touches Vaea's own backend.
export default function AiModelSection() {
  const [config, setConfig] = useState(PROVIDER_DEFAULTS);
  const [showKey, setShowKey] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    loadAiProviderConfig().then(setConfig);
  }, []);

  const provider = PROVIDERS[config.provider] || PROVIDERS.base44;
  const isByok = provider.id !== "base44";

  const persist = async (next) => {
    setConfig(next);
    await saveAiProviderConfig(next);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1500);
  };

  const handleProviderChange = (providerId) => {
    const nextProvider = PROVIDERS[providerId];
    // Switching providers invalidates whatever model was picked for the
    // previous one — default to that provider's first model, not a
    // leftover id it doesn't recognize.
    persist({ ...config, provider: providerId, model: nextProvider.models?.[0]?.id || "", apiKey: "" });
  };

  const handleModelChange = (model) => persist({ ...config, model });
  const handleKeyChange = (apiKey) => persist({ ...config, apiKey });

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">AI Model</p>
        {justSaved && (
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> Saved
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Vaea Chat answers using its own built-in model by default. Bring your own API key instead to use Claude,
        ChatGPT, Gemini, or Grok directly — your key is sent from this browser straight to that provider, never
        through Vaea's own servers.
      </p>

      <div className="flex flex-col gap-3">
        <div>
          <p className="text-sm font-medium mb-1.5">Provider</p>
          <select
            value={provider.id}
            onChange={(e) => handleProviderChange(e.target.value)}
            className="w-full text-sm px-3 py-2 bg-background border border-input rounded-md outline-none focus:ring-1 focus:ring-primary/50 transition-all"
          >
            {PROVIDER_LIST.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}{p.description ? ` — ${p.description}` : ""}
              </option>
            ))}
          </select>
        </div>

        {isByok && (
          <>
            <div>
              <p className="text-sm font-medium mb-1.5">Model</p>
              <select
                value={config.model}
                onChange={(e) => handleModelChange(e.target.value)}
                className="w-full text-sm px-3 py-2 bg-background border border-input rounded-md outline-none focus:ring-1 focus:ring-primary/50 transition-all"
              >
                {provider.models.map((m) => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
            </div>

            <div>
              <p className="text-sm font-medium mb-1.5">{provider.label} API key</p>
              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  value={config.apiKey}
                  onChange={(e) => handleKeyChange(e.target.value)}
                  placeholder={provider.keyPlaceholder}
                  autoComplete="off"
                  className="w-full text-sm pl-3 pr-9 py-2 bg-background border border-input rounded-md outline-none focus:ring-1 focus:ring-primary/50 transition-all font-terminal"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((v) => !v)}
                  aria-label={showKey ? "Hide API key" : "Show API key"}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                Stored on this device only — used to call {provider.label} directly, one request at a time.{" "}
                <a href={provider.keyHelpUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground">
                  Get a key
                </a>
              </p>
            </div>

            <p className="text-xs text-muted-foreground">
              Web search, attachment reading, and the external notes vault only work with Vaea's built-in model —
              not yet available with a bring-your-own-key provider.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
