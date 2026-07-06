import { notFound } from 'next/navigation'
import { getDestinationBySlug } from '@/lib/data/destinations'
import { updateDestinationAction, deleteDestinationAction } from '../../actions'
import { DestinationForm } from '@/components/admin/DestinationForm'
import { secondaryButtonClass } from '@/components/admin/form'
import { ApiError } from '@/lib/api/client'

export default async function EditTourPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  let destination
  try {
    destination = (await getDestinationBySlug(slug)).data
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound()
    throw err
  }

  const boundUpdate = updateDestinationAction.bind(null, destination.id)
  const boundDelete = deleteDestinationAction.bind(null, destination.id)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-extrabold tracking-tight">Edit tour</h1>
          <p className="text-[13px] text-body mt-1">{destination.name}</p>
        </div>
        <form action={boundDelete}>
          <button type="submit" className={secondaryButtonClass}>
            Delete
          </button>
        </form>
      </div>
      <DestinationForm action={boundUpdate} defaultValues={destination} submitLabel="Save changes" isEdit />
    </div>
  )
}
