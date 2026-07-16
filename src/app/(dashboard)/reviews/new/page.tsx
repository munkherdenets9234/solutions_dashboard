import { createReviewAction } from '../actions'
import { loadReviewRefOptions } from '@/lib/data/reviews'
import { ReviewForm } from '@/components/admin/ReviewForm'

export default async function NewReviewPage() {
  const options = await loadReviewRefOptions()

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[26px] font-extrabold tracking-tight">New review</h1>
        <p className="text-[13px] text-body mt-1">Reviews appear on the public site as soon as they are created.</p>
      </div>
      <ReviewForm
        action={createReviewAction}
        submitLabel="Create review"
        customerOptions={options.customers}
        tourOptions={options.tours}
      />
    </div>
  )
}
