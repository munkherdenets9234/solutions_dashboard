import { createPartnerAction } from '../actions'
import { buildReviewOptions } from '@/lib/data/reviews'
import { PartnerForm } from '@/components/admin/PartnerForm'

export default async function NewPartnerPage() {
  const reviewOptions = await buildReviewOptions()

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[26px] font-extrabold tracking-tight">New partner</h1>
        <p className="text-[13px] text-body mt-1">Partners appear on the public site as soon as they are created.</p>
      </div>
      <PartnerForm action={createPartnerAction} submitLabel="Create partner" reviewOptions={reviewOptions} />
    </div>
  )
}
