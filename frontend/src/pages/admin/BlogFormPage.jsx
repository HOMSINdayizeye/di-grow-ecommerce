import { useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, Heading2, Pilcrow, Bold, List, Quote, Eye } from 'lucide-react';
import SEOHead from '@/seo/SEOHead';
import PageHeader from '@/components/admin/PageHeader';
import ImageUploader from '@/components/admin/ImageUploader';
import ErrorState from '@/components/admin/ErrorState';
import FormField, { Switch } from '@/components/common/FormField';
import Button from '@/components/common/Button';
import { Skeleton } from '@/components/common/Loader';
import { useFetch } from '@/hooks/useFetch';
import { blogService } from '@/services/blogService';
import { getErrorMessage } from '@/services/api';
import { blogPostSchema } from '@/validations/productSchema';

const CATEGORIES = ['Wellness', 'Farming', 'Pharmacy', 'Mother & Baby', 'Other'];
const DEFAULTS = { title: '', excerpt: '', category: 'Wellness', coverImage: '', content: '', isPublished: false };

const TOOLS = [
  { label: 'Heading', icon: Heading2, before: '<h2>', after: '</h2>', block: true },
  { label: 'Paragraph', icon: Pilcrow, before: '<p>', after: '</p>', block: true },
  { label: 'Bold', icon: Bold, before: '<strong>', after: '</strong>' },
  { label: 'List', icon: List, before: '<ul>\n  <li>', after: '</li>\n</ul>', block: true },
  { label: 'Quote', icon: Quote, before: '<blockquote>', after: '</blockquote>', block: true },
];

export default function BlogFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const textareaRef = useRef(null);

  const { data: post, loading, error, refetch } = useFetch(() => blogService.adminGet(id), [id], { enabled: isEdit });

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(blogPostSchema), defaultValues: DEFAULTS });

  useEffect(() => {
    if (post) {
      reset({
        title: post.title || '',
        excerpt: post.excerpt || '',
        category: CATEGORIES.includes(post.category) ? post.category : 'Other',
        coverImage: post.coverImage || '',
        content: post.content || '',
        isPublished: !!post.isPublished,
      });
    }
  }, [post, reset]);

  const excerpt = watch('excerpt') || '';
  const content = watch('content') || '';
  const title = watch('title');
  const { ref: contentRef, ...contentField } = register('content');

  const wrap = ({ before, after, block }) => {
    const el = textareaRef.current;
    const value = getValues('content') || '';
    const start = el ? el.selectionStart : value.length;
    const end = el ? el.selectionEnd : value.length;
    const selected = value.slice(start, end) || (block ? 'Text' : '');
    const prefix = block && start > 0 && value[start - 1] !== '\n' ? '\n' : '';
    const suffix = block && end < value.length && value[end] !== '\n' ? '\n' : '';
    const insert = `${prefix}${before}${selected}${after}${suffix}`;
    const next = value.slice(0, start) + insert + value.slice(end);
    setValue('content', next, { shouldDirty: true, shouldValidate: true });
    requestAnimationFrame(() => {
      if (!el) return;
      el.focus();
      const selStart = start + prefix.length + before.length;
      el.setSelectionRange(selStart, selStart + selected.length);
    });
  };

  const onSubmit = async (values) => {
    try {
      if (isEdit) {
        await blogService.update(id, values);
        toast.success('Post updated');
      } else {
        await blogService.create(values);
        toast.success(values.isPublished ? 'Post published' : 'Draft saved');
      }
      navigate('/admin/blog');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (isEdit && error) {
    return (
      <div className="card">
        <ErrorState message={error.message} onRetry={refetch} />
      </div>
    );
  }
  if (isEdit && (loading || !post)) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-[36rem]" />
        <Skeleton className="h-[36rem]" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <SEOHead title={isEdit ? 'Edit post' : 'New post'} noIndex />
      <Link to="/admin/blog" className="mb-4 inline-flex items-center gap-1 text-sm text-muted transition hover:text-brand-500">
        <ArrowLeft className="h-4 w-4" /> Back to posts
      </Link>
      <PageHeader
        title={isEdit ? 'Edit' : 'New'}
        highlight="post"
        subtitle={isEdit ? post.title : 'Write in simple HTML. Use the toolbar to format selected text.'}
        actions={
          <>
            <Button variant="secondary" size="sm" to="/admin/blog" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" size="sm" icon={Save} loading={isSubmitting}>
              {isEdit ? 'Save changes' : 'Save post'}
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Editor */}
        <div className="space-y-6">
          <div className="card space-y-4 p-5">
            <FormField label="Title" required placeholder="e.g. 5 Daily Habits That Strengthen Your Immune System" error={errors.title?.message} {...register('title')} />
            <FormField as="textarea" label="Excerpt" required rows={3} maxLength={300} placeholder="Summary shown on the blog list and in search results" help={`${excerpt.length}/300 characters`} error={errors.excerpt?.message} {...register('excerpt')} />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField as="select" label="Category" required error={errors.category?.message} {...register('category')}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </FormField>
              <div className="flex items-end pb-1">
                <Controller name="isPublished" control={control} render={({ field }) => <Switch className="w-full" label="Published" description="Visible on the public blog" checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />} />
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-ui text-sm font-semibold">Cover image</h3>
            <p className="mb-3 text-xs text-muted">Landscape works best (1200×700).</p>
            <Controller name="coverImage" control={control} render={({ field }) => <ImageUploader value={field.value ? [field.value] : []} onChange={(urls) => field.onChange(urls[0] || '')} max={1} />} />
            {errors.coverImage && <p className="error-text">{errors.coverImage.message}</p>}
          </div>

          <div className="card p-5">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="content" className="label mb-0">
                Content <span className="text-accent-500">*</span>
              </label>
              <div className="flex items-center gap-1 rounded-pill bg-surface-2 p-1" role="toolbar" aria-label="Formatting">
                {TOOLS.map((t) => (
                  <button key={t.label} type="button" onClick={() => wrap(t)} className="rounded-full p-2 text-muted transition hover:bg-surface hover:text-ink" title={t.label} aria-label={t.label}>
                    <t.icon className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>
            <textarea
              id="content"
              rows={18}
              className={`input min-h-[360px] resize-y font-mono text-xs leading-relaxed ${errors.content ? 'input-error' : ''}`}
              placeholder="<p>Start writing…</p>"
              {...contentField}
              ref={(el) => {
                contentRef(el);
                textareaRef.current = el;
              }}
            />
            {errors.content ? <p className="error-text">{errors.content.message}</p> : <p className="help-text">Allowed: h2, h3, p, strong, ul/li, blockquote, a.</p>}
          </div>
        </div>

        {/* Preview */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <div className="card overflow-hidden">
            <div className="flex items-center gap-2 border-b border-line px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted">
              <Eye className="h-3.5 w-3.5" /> Live preview
            </div>
            <div className="max-h-[80vh] overflow-y-auto p-5 scrollbar-thin">
              {watch('coverImage') && <img src={watch('coverImage')} alt="" className="mb-5 aspect-[12/7] w-full rounded-xl object-cover" />}
              <span className="eyebrow mb-3">{watch('category')}</span>
              <h1 className="font-display text-2xl font-bold leading-tight md:text-3xl">{title || 'Untitled post'}</h1>
              {excerpt && <p className="mt-3 text-muted">{excerpt}</p>}
              <div className="divider-gradient my-5" />
              {content ? <div className="prose-dg" dangerouslySetInnerHTML={{ __html: content }} /> : <p className="text-sm italic text-muted">Your article will appear here as you type.</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2 lg:hidden">
        <Button variant="secondary" to="/admin/blog" disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" icon={Save} loading={isSubmitting}>
          {isEdit ? 'Save changes' : 'Save post'}
        </Button>
      </div>
    </form>
  );
}
