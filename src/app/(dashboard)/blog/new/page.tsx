import { createBlogAction } from '../actions'
import { BlogForm } from '@/components/admin/BlogForm'

export default function NewBlogPage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[26px] font-extrabold tracking-tight">New post</h1>
        <p className="text-[13px] text-body mt-1">Posts are created as drafts — publish from the edit page once ready.</p>
      </div>
      <BlogForm action={createBlogAction} submitLabel="Create draft" />
    </div>
  )
}
