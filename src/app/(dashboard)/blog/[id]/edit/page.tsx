import { notFound } from 'next/navigation'
import { getBlogById } from '@/lib/data/blogs'
import { updateBlogAction, publishBlogAction } from '../../actions'
import { BlogForm } from '@/components/admin/BlogForm'
import { buttonClass } from '@/components/admin/form'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { ApiError } from '@/lib/api/client'
import { localeText } from '@/lib/types'

export default async function EditBlogPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ justCreated?: string }>
}) {
  const { id } = await params
  const { justCreated } = await searchParams

  let blog
  try {
    blog = (await getBlogById(id)).data
  } catch (err) {
    console.error("$:/err ", err)
    if (err instanceof ApiError && (err.status === 404)) {
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
          <p className="text-[13px] text-body mt-1">{localeText(blog.title)}</p>
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
