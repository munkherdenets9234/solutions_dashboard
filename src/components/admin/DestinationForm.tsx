'use client'

import { useActionState, useState } from 'react'
import { LOCALES, type Destination, type LocaleMap, type LocaleListMap } from '@/lib/types'
import type { FormState } from '@/app/(dashboard)/tours/actions'
import { slugify } from '@/lib/slug'
import { inputClass, labelClass, buttonClass, errorClass } from './form'
import { ImageUploadField } from './ImageUploadField'
import { GalleryUploadField, type GalleryImageInput } from './GalleryUploadField'
import { DeparturesEditor, type DepartureInput } from './DeparturesEditor'
import { ItineraryEditor, type ItineraryDayInput } from './ItineraryEditor'
import { PricesEditor, type PriceInput } from './PricesEditor'
import { MultiLangField } from './MultiLangField'
import { MultiLangRichTextEditor } from './MultiLangRichTextEditor'

// Joins each locale's string[] (e.g. Highlights) into one newline- or
// comma-delimited block per locale, for display in a MultiLangField —
// actions.ts splits it back into a list per locale at submit time.
function joinLocaleList(m: LocaleListMap | undefined, sep: string): LocaleMap {
  const out: LocaleMap = {}
  if (!m) return out
  for (const locale of LOCALES) {
    const v = m[locale]
    if (v && v.length) out[locale] = v.join(sep)
  }
  return out
}

export function DestinationForm({
  action,
  defaultValues,
  submitLabel,
  isEdit,
}: {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>
  defaultValues?: Partial<Destination>
  submitLabel: string
  isEdit?: boolean
}) {
  const [state, formAction, pending] = useActionState(action, {})
  const [name, setName] = useState(defaultValues?.name ?? '')

  const departureDefaults: DepartureInput[] = (defaultValues?.departures ?? []).map((d) => ({
    start_date: d.start_date ? d.start_date.slice(0, 10) : '',
    end_date: d.end_date ? d.end_date.slice(0, 10) : '',
    available: d.available,
  }))

  const itineraryDefaults: ItineraryDayInput[] = (defaultValues?.itinerary ?? []).map((d) => ({
    day: d.day,
    title: d.title ?? {},
    description: d.description ?? {},
    activities: joinLocaleList(d.activities, ', '),
    overnight: d.overnight ?? {},
    meals: joinLocaleList(d.meals, ', '),
  }))

  const priceDefaults: PriceInput[] = (defaultValues?.prices ?? []).map((p) => ({
    min_people: String(p.min_people),
    max_people: String(p.max_people),
    price_usd: String(p.price_usd),
  }))

  const galleryDefaults: GalleryImageInput[] = (defaultValues?.images ?? []).map((img) => ({
    url: img.url,
    caption: img.caption ?? '',
  }))

  return (
    <form action={formAction} className="flex flex-col gap-4 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="name">
            Name
          </label>
          <input
            id="name"
            name="name"
            required
            defaultValue={defaultValues?.name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </div>
        {!isEdit ? (
          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="slug-preview">
              Slug (auto-generated)
            </label>
            <input id="slug-preview" disabled value={slugify(name)} className={`${inputClass} opacity-60`} />
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="region">
              Region
            </label>
            <input id="region" name="region" defaultValue={defaultValues?.region} className={inputClass} />
          </div>
        )}
      </div>

      {!isEdit ? (
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="region">
            Region
          </label>
          <input id="region" name="region" defaultValue={defaultValues?.region} className={inputClass} />
        </div>
      ) : null}

      <MultiLangRichTextEditor name="overview" label="Overview" defaultValue={defaultValues?.overview} />

      <div className="flex flex-col gap-1.5 max-w-[200px]">
        <label className={labelClass} htmlFor="duration_days">
          Duration (days)
        </label>
        <input
          id="duration_days"
          name="duration_days"
          type="number"
          min={1}
          defaultValue={defaultValues?.duration_days}
          className={inputClass}
        />
      </div>

      <PricesEditor name="prices_json" defaultValue={priceDefaults} />

      <ImageUploadField name="cover_image_url" label="Cover image" defaultValue={defaultValues?.cover_image?.url} />

      <GalleryUploadField name="images_json" label="Gallery images" defaultValue={galleryDefaults} />

      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="categories">
            Categories (comma-separated)
          </label>
          <input
            id="categories"
            name="categories"
            defaultValue={defaultValues?.categories?.join(', ')}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="tags">
            Tags (comma-separated)
          </label>
          <input id="tags" name="tags" defaultValue={defaultValues?.tags?.join(', ')} className={inputClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="best_seasons">
            Best seasons (comma-separated)
          </label>
          <input
            id="best_seasons"
            name="best_seasons"
            defaultValue={defaultValues?.best_seasons?.join(', ')}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <MultiLangField
          name="accommodation"
          label="Accommodation"
          placeholder="4-star hotel + ger camps"
          defaultValue={defaultValues?.accommodation}
        />
        <MultiLangField
          name="meal_plan"
          label="Meal plan"
          placeholder="All meals included"
          defaultValue={defaultValues?.meal_plan}
        />
        <MultiLangField
          name="difficulty"
          label="Difficulty"
          placeholder="easy / moderate / challenging"
          defaultValue={defaultValues?.difficulty}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <MultiLangField
          name="highlights"
          label="Highlights (one per line)"
          multiline
          rows={4}
          defaultValue={joinLocaleList(defaultValues?.highlights, '\n')}
        />
        <MultiLangField
          name="activities"
          label="Activities (one per line)"
          multiline
          rows={4}
          defaultValue={joinLocaleList(defaultValues?.activities, '\n')}
        />
        <MultiLangField
          name="inclusions"
          label="Inclusions (one per line)"
          multiline
          rows={4}
          defaultValue={joinLocaleList(defaultValues?.inclusions, '\n')}
        />
        <MultiLangField
          name="exclusions"
          label="Exclusions (one per line)"
          multiline
          rows={4}
          defaultValue={joinLocaleList(defaultValues?.exclusions, '\n')}
        />
      </div>

      <DeparturesEditor name="departures_json" defaultValue={departureDefaults} />

      <ItineraryEditor name="itinerary_json" defaultValue={itineraryDefaults} />

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm font-medium text-body">
          <input type="checkbox" name="featured" defaultChecked={defaultValues?.featured} />
          Featured
        </label>
        {isEdit ? (
          <label className="flex items-center gap-2 text-sm font-medium text-body">
            <input type="checkbox" name="is_active" defaultChecked={defaultValues?.is_active ?? true} />
            Active
          </label>
        ) : null}
      </div>

      {state.error ? <p className={errorClass}>{state.error}</p> : null}

      <div>
        <button type="submit" disabled={pending} className={buttonClass}>
          {pending ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  )
}
