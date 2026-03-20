"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Trash2 } from "lucide-react";

import { Toast } from "@/components/ui/Toast";
import { api } from "@/lib/api";

type ToastState = { message: string; tone: "success" | "error" } | null;

type Integration = {
  service: string;
  configured: boolean;
  updated_at: string | null;
};

const SERVICE_LABELS: Record<string, { label: string; description: string; placeholder: string }> = {
  openai: {
    label: "OpenAI",
    description: "Used for chat.completions, embeddings, and images.generations.",
    placeholder: "sk-...",
  },
  anthropic: {
    label: "Anthropic",
    description: "Used for messages.",
    placeholder: "sk-ant-...",
  },
  github: {
    label: "GitHub",
    description: "Used for repos, issues, and pull request access.",
    placeholder: "github_pat_...",
  },
};

function IntegrationCard({
  integration,
  onSave,
  onRemove,
}: {
  integration: Integration;
  onSave: (service: string, key: string) => Promise<void>;
  onRemove: (service: string) => Promise<void>;
}) {
  const [key, setKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const meta = SERVICE_LABELS[integration.service];

  const handleSave = async () => {
    if (!key.trim()) return;
    setSaving(true);
    try {
      await onSave(integration.service, key.trim());
      setKey("");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await onRemove(integration.service);
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="rounded-lg border border-[#27272a] bg-[#111111] p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-medium text-white">{meta.label}</span>
          {integration.configured ? (
            <span className="flex items-center gap-1 rounded-full bg-[#052e16] px-2 py-0.5 text-[11px] text-[#22c55e]">
              <CheckCircle className="h-3 w-3" />
              Configured
            </span>
          ) : (
            <span className="rounded-full bg-[#18181b] px-2 py-0.5 text-[11px] text-[#71717a]">
              Not configured
            </span>
          )}
        </div>
        {integration.configured && (
          <button
            onClick={handleRemove}
            disabled={removing}
            className="text-[#71717a] transition-colors hover:text-red-400 disabled:opacity-50"
            aria-label={`Remove ${meta.label} key`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
      <p className="mb-4 text-[12px] text-[#71717a]">{meta.description}</p>
      <div className="flex gap-2">
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder={integration.configured ? "Enter new key to update" : meta.placeholder}
          className="flex-1 rounded-md border border-[#27272a] bg-[#18181b] px-3 py-2 text-[13px] text-white placeholder-[#52525b] focus:border-[#22c55e] focus:outline-none"
          onKeyDown={(e) => e.key === "Enter" && void handleSave()}
        />
        <button
          onClick={() => void handleSave()}
          disabled={saving || !key.trim()}
          className="rounded-md bg-[#22c55e] px-4 py-2 text-[13px] font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {saving ? "Saving…" : integration.configured ? "Update" : "Save"}
        </button>
      </div>
    </div>
  );
}

export function IntegrationsPageClient() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    let cancelled = false;
    void api.listIntegrations().then((res) => {
      if (!cancelled) {
        setIntegrations(res.items);
        setLoading(false);
      }
    }).catch(() => {
      if (!cancelled) {
        setToast({ message: "Failed to load integrations.", tone: "error" });
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(t);
  }, [toast]);

  const handleSave = async (service: string, apiKey: string) => {
    try {
      await api.upsertIntegration(service, apiKey);
      setIntegrations((prev) =>
        prev.map((i) => (i.service === service ? { ...i, configured: true } : i))
      );
      setToast({ message: `${SERVICE_LABELS[service]?.label ?? service} key saved`, tone: "success" });
    } catch {
      setToast({ message: "Failed to save key.", tone: "error" });
    }
  };

  const handleRemove = async (service: string) => {
    try {
      await api.deleteIntegration(service);
      setIntegrations((prev) =>
        prev.map((i) => (i.service === service ? { ...i, configured: false, updated_at: null } : i))
      );
      setToast({ message: `${SERVICE_LABELS[service]?.label ?? service} key removed`, tone: "success" });
    } catch {
      setToast({ message: "Failed to remove key.", tone: "error" });
    }
  };

  return (
    <section>
      <div className="mb-5">
        <h1 className="text-[20px] font-semibold text-white">Integrations</h1>
        <p className="mt-1 text-[13px] text-[#71717a]">
          Store your provider API keys here. Scopeform uses them to proxy requests on behalf of your agents.
        </p>
      </div>

      {loading ? (
        <div className="text-[13px] text-[#52525b]">Loading…</div>
      ) : (
        <div className="space-y-4">
          {integrations.map((integration) => (
            <IntegrationCard
              key={integration.service}
              integration={integration}
              onSave={handleSave}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}

      <div className="mt-8 rounded-lg border border-[#27272a] bg-[#0a0a0a] p-5">
        <h2 className="mb-2 text-[13px] font-medium text-white">Using the proxy in your agent</h2>
        <p className="mb-3 text-[12px] text-[#71717a]">
          Point your SDK&apos;s base URL at the Scopeform proxy instead of the provider directly.
        </p>
        <pre className="overflow-x-auto rounded-md bg-[#18181b] p-4 text-[12px] text-[#a1a1aa]">{`import openai

openai.api_key  = os.environ["SCOPEFORM_TOKEN"]
openai.base_url = "https://scopeform-production-f0b7.up.railway.app/api/v1/proxy/openai/v1"`}</pre>
      </div>

      {toast ? <Toast message={toast.message} tone={toast.tone} /> : null}
    </section>
  );
}
