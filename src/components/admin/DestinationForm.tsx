'use client'

import { useActionState } from 'react'
import type { Destination } from '@/lib/types'
import type { FormState } from '@/app/(dashboard)/tours/actions'
import { inputClass, textareaClass, labelClass, buttonClass, errorClass } from './form'
import { ImageUploadField } from './ImageUploadField'
import { GalleryUploadField, type GalleryImageInput } from './GalleryUploadField'
import { DeparturesEditor, type DepartureInput } from './DeparturesEditor'
import { ItineraryEditor, type ItineraryDayInput } from './ItineraryEditor'
import { PricesEditor, type PriceInput } from './PricesEditor'
import { RichTextEditor } from './RichTextEditor'

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

  const departureDefaults: DepartureInput[] = (defaultValues?.departures ?? []).map((d) => ({
    start_date: d.start_date ? d.start_date.slice(0, 10) : '',
    end_date: d.end_date ? d.end_date.slice(0, 10) : '',
    available: d.available,
  }))

  const itineraryDefaults: ItineraryDayInput[] = (defaultValues?.itinerary ?? []).map((d) => ({
    day: d.day,
    title: d.title,
    description: d.description ?? '',
    activities: (d.activities ?? []).join(', '),
    overnight: d.overnight ?? '',
    meals: (d.meals ?? []).join(', '),
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
          <input id="name" name="name" required defaultValue={defaultValues?.name} className={inputClass} />
        </div>
        {!isEdit ? (
          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="slug">
              Slug
            </label>
            <input id="slug" name="slug" required defaultValue={defaultValues?.slug} className={inputClass} />
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

      <RichTextEditor name="overview" label="Overview" defaultValue={defaultValues?.overview} />

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
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="accommodation">
            Accommodation
          </label>
          <input
            id="accommodation"
            name="accommodation"
            placeholder="4-star hotel + ger camps"
            defaultValue={defaultValues?.accommodation}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="meal_plan">
            Meal plan
          </label>
          <input
            id="meal_plan"
            name="meal_plan"
            placeholder="All meals included"
            defaultValue={defaultValues?.meal_plan}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="difficulty">
            Difficulty
          </label>
          <select
            id="difficulty"
            name="difficulty"
            defaultValue={defaultValues?.difficulty ?? ''}
            className={inputClass}
          >
            <option value="">—</option>
            <option value="easy">Easy</option>
            <option value="moderate">Moderate</option>
            <option value="challenging">Challenging</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="highlights">
            Highlights (one per line)
          </label>
          <textarea
            id="highlights"
            name="highlights"
            rows={4}
            defaultValue={defaultValues?.highlights?.join('\n')}
            className={textareaClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="activities">
            Activities (one per line)
          </label>
          <textarea
            id="activities"
            name="activities"
            rows={4}
            defaultValue={defaultValues?.activities?.join('\n')}
            className={textareaClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="inclusions">
            Inclusions (one per line)
          </label>
          <textarea
            id="inclusions"
            name="inclusions"
            rows={4}
            defaultValue={defaultValues?.inclusions?.join('\n')}
            className={textareaClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="exclusions">
            Exclusions (one per line)
          </label>
          <textarea
            id="exclusions"
            name="exclusions"
            rows={4}
            defaultValue={defaultValues?.exclusions?.join('\n')}
            className={textareaClass}
          />
        </div>
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
