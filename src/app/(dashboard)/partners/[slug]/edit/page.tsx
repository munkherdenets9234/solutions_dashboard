import { notFound } from 'next/navigation'
import { getPartnerBySlug } from '@/lib/data/partners'
import { buildReviewOptions } from '@/lib/data/reviews'
import { updatePartnerAction, deletePartnerAction } from '../../actions'
import { PartnerForm } from '@/components/admin/PartnerForm'
import { secondaryButtonClass } from '@/components/admin/form'
import { LastEditedBy } from '@/components/admin/LastEditedBy'
import { ApiError } from '@/lib/api/client'

export default async function EditPartnerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  let partner
  try {
    partner = (await getPartnerBySlug(slug)).data
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound()
    throw err
  }

  const reviewOptions = await buildReviewOptions()
  const boundUpdate = updatePartnerAction.bind(null, partner.id)
  const boundDelete = deletePartnerAction.bind(null, partner.id)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-extrabold tracking-tight">Edit partner</h1>
          <p className="text-[13px] text-body mt-1">{partner.name}</p>
          <LastEditedBy lastEditedBy={partner.lastEditedBy} />
        </div>
        <form action={boundDelete}>
          <button type="submit" className={secondaryButtonClass}>
            Deactivate
          </button>
        </form>
      </div>
      <PartnerForm action={boundUpdate} defaultValues={partner} submitLabel="Save changes" isEdit reviewOptions={reviewOptions} />
    </div>
  )
}
