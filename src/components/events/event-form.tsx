"use client";

import { useActionState, useState } from "react";
import { createEventAction, updateEventAction } from "@/actions/event-actions";
import { CATEGORY_LABELS } from "@/lib/constants";
import { ImageUpload } from "@/components/events/image-upload";
import { TicketDesignPicker } from "@/components/events/ticket-design-picker";
import { normalizeTicketDesignTemplate, recommendedTicketDesign, type TicketDesignTemplate } from "@/lib/ticket-designs";
import type { Event } from "@/lib/types";

interface TierInput {
  key: string;
  id?: string;
  name: string;
  price: number;
  capacity: number;
  min_per_order: number;
  max_per_order: number;
}

function newTier(): TierInput {
  return {
    key: crypto.randomUUID(),
    name: "",
    price: 0,
    capacity: 100,
    min_per_order: 1,
    max_per_order: 10,
  };
}

interface EventFormProps {
  categories: string[];
  initialData?: Event;
}

export function EventForm({ categories, initialData }: EventFormProps) {
  const isEdit = !!initialData;
  const action = isEdit ? updateEventAction : createEventAction;
  const [state, formAction, pending] = useActionState(action, null);
  const [coverImageUrl, setCoverImageUrl] = useState(initialData?.cover_image_url || "");
  const [category, setCategory] = useState(initialData?.category || "concert");
  const [ticketDesignTemplate, setTicketDesignTemplate] = useState<TicketDesignTemplate>(
    normalizeTicketDesignTemplate(initialData?.ticket_design_template, initialData?.category || "concert")
  );

  const [tiers, setTiers] = useState<TierInput[]>(
    initialData?.tiers?.map((t) => ({
      key: t.id,
      id: t.id,
      name: t.name,
      price: t.price,
      capacity: t.capacity,
      min_per_order: t.min_per_order,
      max_per_order: t.max_per_order,
    })) || [newTier()]
  );

  function handleCategoryChange(nextCategory: string) {
    setCategory(nextCategory);
    if (!initialData && ticketDesignTemplate === recommendedTicketDesign(category)) {
      setTicketDesignTemplate(recommendedTicketDesign(nextCategory));
    }
  }

  function addTier() {
    setTiers([...tiers, newTier()]);
  }

  function removeTier(key: string) {
    if (tiers.length > 1) {
      setTiers(tiers.filter((t) => t.key !== key));
    }
  }

  function updateTier(key: string, field: keyof TierInput, value: string | number) {
    setTiers(tiers.map((t) => (t.key === key ? { ...t, [field]: value } : t)));
  }

  return (
    <form action={formAction} className="space-y-6 max-w-2xl">
      {isEdit && <input type="hidden" name="event_id" value={initialData.id} />}
      <input
        type="hidden"
        name="tiers"
        value={JSON.stringify(
          tiers.map(({ id, name, price, capacity, min_per_order, max_per_order }) => ({
            id,
            name,
            price,
            capacity,
            min_per_order,
            max_per_order,
          }))
        )}
      />
      <input type="hidden" name="ticket_design_template" value={ticketDesignTemplate} />

      {state?.error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{state.error}</div>
      )}

      <fieldset className="space-y-4 rounded-lg border p-4">
        <legend className="px-2 text-sm font-semibold">Informations générales</legend>

        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">Titre *</label>
          <input id="title" name="title" required defaultValue={initialData?.title} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">Description</label>
          <textarea id="description" name="description" rows={3} defaultValue={initialData?.description || ""} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </div>

        <div className="space-y-2">
          <label htmlFor="category" className="text-sm font-medium">Catégorie</label>
          <select
            id="category"
            name="category"
            value={category}
            onChange={(event) => handleCategoryChange(event.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{CATEGORY_LABELS[cat] || cat}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="cover_image_url" className="text-sm font-medium">URL de l&apos;image de couverture</label>
          <input
            id="cover_image_url"
            name="cover_image_url"
            type="url"
            value={coverImageUrl}
            onChange={(e) => setCoverImageUrl(e.target.value)}
            placeholder="https://..."
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <ImageUpload value={coverImageUrl || null} onChange={(url) => setCoverImageUrl(url || "")} />
        </div>

        <TicketDesignPicker
          category={category}
          coverImageUrl={coverImageUrl || null}
          value={ticketDesignTemplate}
          onChange={setTicketDesignTemplate}
        />
      </fieldset>

      <fieldset className="space-y-4 rounded-lg border p-4">
        <legend className="px-2 text-sm font-semibold">Lieu</legend>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="venue_name" className="text-sm font-medium">Nom du lieu *</label>
            <input id="venue_name" name="venue_name" required defaultValue={initialData?.venue_name} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <div className="space-y-2">
            <label htmlFor="venue_city" className="text-sm font-medium">Ville</label>
            <input id="venue_city" name="venue_city" defaultValue={initialData?.venue_city || "Dakar"} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="venue_address" className="text-sm font-medium">Adresse</label>
          <input id="venue_address" name="venue_address" defaultValue={initialData?.venue_address || ""} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </div>
      </fieldset>

      <fieldset className="space-y-4 rounded-lg border p-4">
        <legend className="px-2 text-sm font-semibold">Dates</legend>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="starts_at" className="text-sm font-medium">Début *</label>
            <input id="starts_at" name="starts_at" type="datetime-local" required defaultValue={initialData?.starts_at?.slice(0, 16)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <div className="space-y-2">
            <label htmlFor="ends_at" className="text-sm font-medium">Fin *</label>
            <input id="ends_at" name="ends_at" type="datetime-local" required defaultValue={initialData?.ends_at?.slice(0, 16)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="doors_open_at" className="text-sm font-medium">Ouverture des portes</label>
          <input id="doors_open_at" name="doors_open_at" type="datetime-local" defaultValue={initialData?.doors_open_at?.slice(0, 16) || ""} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </div>

        <div className="space-y-2">
          <label htmlFor="qr_release_mode" className="text-sm font-medium">Disponibilité du QR</label>
          <select
            id="qr_release_mode"
            name="qr_release_mode"
            defaultValue={initialData?.qr_release_mode || "12h_before_event"}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="12h_before_event">12h avant l&apos;événement</option>
            <option value="automatic">Dès l&apos;émission du billet</option>
          </select>
          <p className="text-xs text-muted-foreground">
            Choisissez si le QR doit être visible immédiatement ou seulement 12 heures avant le début.
          </p>
        </div>
      </fieldset>

      <fieldset className="space-y-4 rounded-lg border p-4">
        <legend className="px-2 text-sm font-semibold">Tarifs *</legend>

        {tiers.map((tier) => (
          <div key={tier.key} className="grid gap-3 sm:grid-cols-4 items-end rounded-md border p-3">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-medium">Nom</label>
              <input value={tier.name} onChange={(e) => updateTier(tier.key, "name", e.target.value)} placeholder="Ex: VIP, General" required className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Prix (XOF)</label>
              <input type="number" min={0} value={tier.price} onChange={(e) => updateTier(tier.key, "price", parseInt(e.target.value) || 0)} className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Capacité</label>
              <input type="number" min={1} value={tier.capacity} onChange={(e) => updateTier(tier.key, "capacity", parseInt(e.target.value) || 1)} className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm" />
            </div>
            {tiers.length > 1 && (
              <button type="button" onClick={() => removeTier(tier.key)} className="text-xs text-destructive hover:underline sm:col-span-4 text-right">
                Supprimer ce tarif
              </button>
            )}
          </div>
        ))}

        <button type="button" onClick={addTier} className="inline-flex h-9 items-center rounded-md border px-3 text-sm font-medium hover:bg-muted">
          + Ajouter un tarif
        </button>
      </fieldset>

      <fieldset className="space-y-4 rounded-lg border p-4">
        <legend className="px-2 text-sm font-semibold">Règles</legend>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="allow_transfers" defaultChecked={initialData?.allow_transfers ?? true} className="h-4 w-4 rounded border-input" />
          Autoriser les transferts de billets
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="allow_refunds" defaultChecked={initialData?.allow_refunds ?? false} className="h-4 w-4 rounded border-input" />
          Autoriser les remboursements
        </label>
      </fieldset>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {pending ? "..." : isEdit ? "Enregistrer les modifications" : "Créer l'événement"}
      </button>
    </form>
  );
}
