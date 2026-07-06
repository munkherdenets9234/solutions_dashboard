import { notFound } from 'next/navigation'
import { getBlogBySlug } from '@/lib/data/blogs'
import { updateBlogAction, publishBlogAction } from '../../actions'
import { BlogForm } from '@/components/admin/BlogForm'
import { buttonClass } from '@/components/admin/form'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { ApiError } from '@/lib/api/client'

export default async function EditBlogPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ id?: string; justCreated?: string }>
}) {
  const { slug } = await params
  const { id: idParam, justCreated } = await searchParams

  let blog
  try {
    blog = (await getBlogBySlug(slug)).data
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      // Draft posts may not be reachable by slug until published — if we
      // still have the id from the create redirect, offer a publish-only view.
      if (idParam) {
        return (
          <div className="flex flex-col gap-4 max-w-2xl">
            <h1 className="text-[26px] font-extrabold tracking-tight">Draft created</h1>
            <p className="text-[13px] text-body">
              This post was just created as a draft and isn&apos;t fetchable by slug until it&apos;s published.
              Publish it now, then it will show up in the Blog list for further edits.
            </p>
            <form action={publishBlogAction.bind(null, idParam)}>
              <button type="submit" className={buttonClass}>
                Publish now
              </button>
            </form>
          </div>
        )
      }
      notFound()
    }
    throw err
  }

  const boundUpdate = updateBlogAction.bind(null, blog.id)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-extrabold tracking-tight">Edit post</h1>
          <p className="text-[13px] text-body mt-1">{blog.title}</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={blog.status} />
          {blog.status !== 'published' ? (
            <form action={publishBlogAction.bind(null, blog.id)}>
              <button type="submit" className={buttonClass}>
                Publish
              </button>
            </form>
          ) : null}
        </div>
      </div>
      {justCreated ? (
        <p className="text-xs text-muted">This post is a draft. It won&apos;t appear in the Blog list until published.</p>
      ) : null}
      <BlogForm action={boundUpdate} defaultValues={blog} submitLabel="Save changes" isEdit />
    </div>
  )
}
