"use client";

import { useState, useRef, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, ImagePlus, Loader2, CheckCircle2 } from "lucide-react";
import { siteConfig } from "@/lib/config";

const EMOJIS = siteConfig.allowedEmojis;

export function MessageForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [signature, setSignature] = useState("");
  const [emoji, setEmoji] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  function validateClient(): boolean {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Le nom est obligatoire";
    if (!message.trim()) newErrors.message = "Le message est obligatoire";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, photo: "Veuillez sélectionner une image" }));
      return;
    }

    if (file.size > siteConfig.maxPhotoSizeBytes) {
      setErrors((prev) => ({
        ...prev,
        photo: "La photo ne doit pas dépasser 1 Mo",
      }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result as string);
      setErrors((prev) => {
        const next = { ...prev };
        delete next.photo;
        return next;
      });
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError("");

    if (!validateClient()) return;

    setSubmitting(true);

    try {
      const res = await fetch("/api/messages/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          message: message.trim(),
          signature: signature.trim() || undefined,
          photo_url: photoPreview || undefined,
          emoji: emoji || undefined,
          honeypot,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error ?? "Une erreur est survenue");
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/"), 2500);
    } catch {
      setServerError("Impossible d'envoyer le message. Réessayez.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl bg-white/90 px-6 py-16 text-center shadow-lg">
        <CheckCircle2 className="h-16 w-16 text-emerald-500 animate-bounce" />
        <h2 className="mt-6 text-2xl font-bold text-stone-800">Merci pour votre message !</h2>
        <p className="mt-2 text-stone-600">
          Votre mot chaleureux a bien été enregistré. Redirection en cours…
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl bg-white/90 p-6 shadow-lg sm:p-8">
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="website">Site web</label>
        <input
          id="website"
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-stone-700">
          Votre nom <span className="text-rose-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={siteConfig.maxNameLength}
          className="w-full rounded-xl border border-stone-200 px-4 py-3 text-stone-800 transition focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
          placeholder="Marie Dupont"
        />
        {errors.name && <p className="mt-1 text-sm text-rose-500">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-stone-700">
          Votre message <span className="text-rose-500">*</span>
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={siteConfig.maxMessageLength}
          rows={5}
          className="w-full resize-y rounded-xl border border-stone-200 px-4 py-3 text-stone-800 transition focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
          placeholder="Merci pour tout ce que vous nous avez apporté…"
        />
        {errors.message && <p className="mt-1 text-sm text-rose-500">{errors.message}</p>}
        <p className="mt-1 text-right text-xs text-stone-400">
          {message.length}/{siteConfig.maxMessageLength}
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-stone-700">
          Ajouter une réaction (facultatif)
        </label>
        <div className="flex flex-wrap gap-2">
          {EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setEmoji(emoji === e ? "" : e)}
              className={`rounded-xl border px-3 py-2 text-xl transition ${
                emoji === e
                  ? "border-amber-400 bg-amber-50 ring-2 ring-amber-200"
                  : "border-stone-200 hover:border-amber-300 hover:bg-amber-50/50"
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="signature" className="mb-1.5 block text-sm font-medium text-stone-700">
          Signature ou fonction (facultatif)
        </label>
        <input
          id="signature"
          type="text"
          value={signature}
          onChange={(e) => setSignature(e.target.value)}
          maxLength={200}
          className="w-full rounded-xl border border-stone-200 px-4 py-3 text-stone-800 transition focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
          placeholder="Équipe Marketing"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-stone-700">
          Photo souvenir (facultatif, max 1 Mo)
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-amber-200 bg-amber-50/50 px-4 py-6 text-stone-600 transition hover:border-amber-300 hover:bg-amber-50"
        >
          <ImagePlus className="h-5 w-5 text-amber-500" />
          {photoPreview ? "Changer la photo" : "Ajouter une photo"}
        </button>
        {errors.photo && <p className="mt-1 text-sm text-rose-500">{errors.photo}</p>}
        {photoPreview && (
          <div className="mt-3 overflow-hidden rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoPreview} alt="Aperçu" className="max-h-48 w-full object-cover" />
          </div>
        )}
      </div>

      {serverError && (
        <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{serverError}</div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-stone-500 transition hover:text-stone-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à l&apos;accueil
        </Link>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-rose-400 px-8 py-3 font-semibold text-white shadow-lg transition hover:scale-[1.02] disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Envoi…
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              Envoyer mon message
            </>
          )}
        </button>
      </div>
    </form>
  );
}
