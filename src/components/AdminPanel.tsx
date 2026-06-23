"use client";

import { useState, FormEvent } from "react";
import {
  Lock,
  LogOut,
  Trash2,
  Download,
  FileText,
  BookOpen,
  Loader2,
  Shield,
} from "lucide-react";
import type { Message } from "@/lib/types";

interface AdminPanelProps {
  initialMessages: Message[];
  isAuthenticated: boolean;
}

export function AdminPanel({ initialMessages, isAuthenticated }: AdminPanelProps) {
  const [authenticated, setAuthenticated] = useState(isAuthenticated);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);
  const [exportError, setExportError] = useState("");

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setLoginError(data.error ?? "Erreur de connexion");
        return;
      }

      setAuthenticated(true);
      const msgRes = await fetch("/api/messages");
      const msgData = await msgRes.json();
      setMessages(msgData.messages ?? []);
    } catch {
      setLoginError("Impossible de se connecter");
    } finally {
      setLoggingIn(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    setAuthenticated(false);
    setPassword("");
  }

  async function handleDelete(id: number) {
    if (!confirm("Supprimer ce message définitivement ?")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/messages/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== id));
      }
    } finally {
      setDeletingId(null);
    }
  }

  async function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async function downloadExport(path: string, filename: string) {
    setExportError("");
    setExporting(path);
    try {
      const res = await fetch(path, { credentials: "include" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setExportError(data.error ?? "Erreur lors de l'export");
        return;
      }
      const blob = await res.blob();
      await downloadBlob(blob, filename);
    } catch {
      setExportError("Impossible de télécharger le fichier");
    } finally {
      setExporting(null);
    }
  }

  async function downloadSouvenirBook() {
    if (messages.length === 0) {
      setExportError("Aucun message à exporter. Ajoutez des messages avant de générer le livre.");
      return;
    }

    setExportError("");
    setExporting("souvenir");
    try {
      const [{ generateSouvenirBookPdf }, { loadCoverImageClient }] = await Promise.all([
        import("@/lib/pdf/souvenir-book"),
        import("@/lib/pdf/load-cover-image-client"),
      ]);

      const coverImage = await loadCoverImageClient();
      const pdfBuffer = await generateSouvenirBookPdf(messages, coverImage);
      const blob = new Blob([pdfBuffer], { type: "application/pdf" });
      const filename = `livre-souvenir-retraite-${new Date().toISOString().slice(0, 10)}.pdf`;
      await downloadBlob(blob, filename);
    } catch (error) {
      console.error("downloadSouvenirBook:", error);
      setExportError(
        "Impossible de générer le livre souvenir. Vérifiez que la couverture est bien présente."
      );
    } finally {
      setExporting(null);
    }
  }

  if (!authenticated) {
    return (
      <div className="mx-auto max-w-md rounded-2xl bg-white/90 p-8 shadow-lg">
        <div className="mb-6 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
            <Shield className="h-7 w-7 text-amber-600" />
          </div>
        </div>
        <h2 className="text-center text-xl font-bold text-stone-800">Administration</h2>
        <p className="mt-2 text-center text-sm text-stone-500">
          Entrez le mot de passe pour accéder au panneau d&apos;administration.
        </p>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-stone-700">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-stone-200 py-3 pl-10 pr-4 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {loginError && (
            <p className="text-sm text-rose-500">{loginError}</p>
          )}

          <button
            type="submit"
            disabled={loggingIn}
            className="w-full rounded-full bg-gradient-to-r from-amber-500 to-rose-400 py-3 font-semibold text-white shadow transition hover:opacity-90 disabled:opacity-60"
          >
            {loggingIn ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Connexion…
              </span>
            ) : (
              "Se connecter"
            )}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl bg-white/90 p-6 shadow-lg sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-stone-800">Panneau d&apos;administration</h2>
          <p className="text-sm text-stone-500">
            {messages.length} message(s) au total
            {messages.length === 0 && " — le livre souvenir nécessite au moins un message"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => downloadExport("/api/admin/export/csv", "messages.csv")}
            disabled={exporting !== null}
            className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50 disabled:opacity-60"
          >
            {exporting === "/api/admin/export/csv" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Export CSV
          </button>
          <button
            onClick={() => downloadExport("/api/admin/export/pdf", "messages.pdf")}
            disabled={exporting !== null}
            className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50 disabled:opacity-60"
          >
            {exporting === "/api/admin/export/pdf" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            Export PDF
          </button>
          <button
            type="button"
            onClick={downloadSouvenirBook}
            disabled={exporting !== null}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-100 px-4 py-2 text-sm font-medium text-amber-800 transition hover:bg-amber-200 disabled:opacity-60"
          >
            {exporting === "souvenir" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <BookOpen className="h-4 w-4" />
            )}
            Livre souvenir PDF
          </button>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-4 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </div>
      </div>

      {exportError && (
        <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{exportError}</div>
      )}

      <div className="overflow-hidden rounded-2xl bg-white/90 shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-stone-100 bg-stone-50/80">
              <tr>
                <th className="px-4 py-3 font-medium text-stone-600">Date</th>
                <th className="px-4 py-3 font-medium text-stone-600">Nom</th>
                <th className="px-4 py-3 font-medium text-stone-600">Message</th>
                <th className="px-4 py-3 font-medium text-stone-600">Signature</th>
                <th className="px-4 py-3 font-medium text-stone-600">Emoji</th>
                <th className="px-4 py-3 font-medium text-stone-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {messages.map((msg) => (
                <tr key={msg.id} className="hover:bg-amber-50/30">
                  <td className="whitespace-nowrap px-4 py-3 text-stone-500">
                    {new Date(msg.created_at).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-4 py-3 font-medium text-stone-800">{msg.name}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-stone-600">{msg.message}</td>
                  <td className="px-4 py-3 text-stone-500">{msg.signature ?? "—"}</td>
                  <td className="px-4 py-3 text-lg">{msg.emoji ?? "—"}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(msg.id)}
                      disabled={deletingId === msg.id}
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                      title="Supprimer"
                    >
                      {deletingId === msg.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
