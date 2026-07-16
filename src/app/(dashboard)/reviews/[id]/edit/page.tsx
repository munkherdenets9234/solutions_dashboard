import { notFound } from 'next/navigation'
import { getReviewById, loadReviewRefOptions } from '@/lib/data/reviews'
import { updateReviewAction, deleteReviewAction } from '../../actions'
import { ReviewForm } from '@/components/admin/ReviewForm'
import { secondaryButtonClass } from '@/components/admin/form'
import { ApiError } from '@/lib/api/client'

export default async function EditReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let review
  try {
    review = (await getReviewById(id)).data
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound()
    throw err
  }
  const options = await loadReviewRefOptions()

  const boundUpdate = updateReviewAction.bind(null, review.id)
  const boundDelete = deleteReviewAction.bind(null, review.id)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-extrabold tracking-tight">Edit review</h1>
          <p className="text-[13px] text-body mt-1">
            {review.related_customer ?? 'Anonymous'} — {'★'.repeat(review.star)}
          </p>
        </div>
        <form action={boundDelete}>
          <button type="submit" className={secondaryButtonClass}>
            Delete
          </button>
        </form>
      </div>
      <ReviewForm
        action={boundUpdate}
        defaultValues={review}
        submitLabel="Save changes"
        customerOptions={options.customers}
        tourOptions={options.tours}
      />
    </div>
  )
}
