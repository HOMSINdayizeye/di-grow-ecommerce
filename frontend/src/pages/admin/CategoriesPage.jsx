import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Tag, Tags, Package } from 'lucide-react';
import { getCategoryIcon, CATEGORY_ICON_NAMES } from '@/constants/categoryIcons';
import SEOHead from '@/seo/SEOHead';
import PageHeader from '@/components/admin/PageHeader';
import ErrorState from '@/components/admin/ErrorState';
import Modal, { ConfirmModal } from '@/components/common/Modal';
import FormField, { Switch } from '@/components/common/FormField';
import Button from '@/components/common/Button';
import EmptyState from '@/components/common/EmptyState';
import { Skeleton } from '@/components/common/Loader';
import { useFetch } from '@/hooks/useFetch';
import { categoryService } from '@/services/categoryService';
import { getErrorMessage } from '@/services/api';
import { categorySchema } from '@/validations/productSchema';

/** Resolve a category icon by name, falling back to Tag. */
const iconFor = (name) => getCategoryIcon(name) || Tag;

const DEFAULTS = { name: '', description: '', icon: '', isActive: true };

export default function CategoriesPage() {
  const { data: categories, loading, error, refetch } = useFetch(() => categoryService.adminList(), [], { initialData: [] });
  const [editing, setEditing] = useState(null); // null | {} (new) | category
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(categorySchema), defaultValues: DEFAULTS });

  useEffect(() => {
    if (editing) reset({ name: editing.name || '', description: editing.description || '', icon: editing.icon || '', isActive: editing.isActive ?? true });
  }, [editing, reset]);

  const PreviewIcon = iconFor(watch('icon'));
  const isEdit = !!editing?._id;

  const onSubmit = async (values) => {
    try {
      if (isEdit) {
        await categoryService.update(editing._id, values);
        toast.success('Category updated');
      } else {
        await categoryService.create(values);
        toast.success('Category created');
      }
      setEditing(null);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await categoryService.remove(toDelete._id);
      toast.success(`${toDelete.name} deleted`);
      setToDelete(null);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const list = categories || [];

  return (
    <div>
      <SEOHead title="Categories" noIndex />
      <PageHeader
        title="Product"
        highlight="categories"
        subtitle="Group products so customers can browse by need."
        actions={
          <Button size="sm" icon={Plus} onClick={() => setEditing({})}>
            New category
          </Button>
        }
      />

      {error ? (
        <div className="card">
          <ErrorState message={error.message} onRetry={refetch} />
        </div>
      ) : loading && !list.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Tags}
            title="No categories yet"
            description="Create your first category to start organising products."
            action={
              <Button size="sm" icon={Plus} onClick={() => setEditing({})}>
                New category
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((c) => {
            const Icon = iconFor(c.icon);
            return (
              <div key={c._id} className="card card-hover group flex flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-soft text-brand-500">
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className={`badge border ${c.isActive ? 'border-success/30 bg-success/15 text-success' : 'border-line bg-surface-2 text-muted'}`}>{c.isActive ? 'Active' : 'Hidden'}</span>
                </div>
                <h3 className="mt-4 font-display text-lg font-bold">{c.name}</h3>
                <p className="font-mono text-xs text-muted">/{c.slug}</p>
                {c.description && <p className="mt-2 line-clamp-2 text-sm text-muted">{c.description}</p>}
                <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted">
                    <Package className="h-3.5 w-3.5" /> {c.productCount ?? 0} product{c.productCount === 1 ? '' : 's'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => setEditing(c)} className="rounded-full p-2 text-muted transition hover:bg-surface-2 hover:text-brand-500" aria-label={`Edit ${c.name}`}>
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => setToDelete(c)} className="rounded-full p-2 text-muted transition hover:bg-danger/15 hover:text-danger" aria-label={`Delete ${c.name}`}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={!!editing}
        onClose={() => !isSubmitting && setEditing(null)}
        title={isEdit ? 'Edit category' : 'New category'}
        description={isEdit ? `Changes apply to ${editing.productCount ?? 0} product(s).` : 'Categories appear in the shop navigation.'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" form="category-form" loading={isSubmitting}>
              {isEdit ? 'Save changes' : 'Create category'}
            </Button>
          </>
        }
      >
        <form id="category-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormField label="Name" required placeholder="e.g. Farm Inputs" error={errors.name?.message} {...register('name')} />
          <FormField as="textarea" label="Description" rows={3} placeholder="Short line shown under the category title" error={errors.description?.message} {...register('description')} />
          <div className="flex items-end gap-3">
            <FormField as="select" className="flex-1" label="Icon" error={errors.icon?.message} {...register('icon')}>
              <option value="">Default (Tag)</option>
              {CATEGORY_ICON_NAMES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </FormField>
            <span className="mb-6 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-soft text-brand-500" title="Preview">
              <PreviewIcon className="h-6 w-6" />
            </span>
          </div>
          <Controller name="isActive" control={control} render={({ field }) => <Switch label="Active" description="Hidden categories are not shown in the shop" checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />} />
        </form>
      </Modal>

      <ConfirmModal
        open={!!toDelete}
        onClose={() => !deleting && setToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete category?"
        message={toDelete ? `"${toDelete.name}" will be removed. Categories with products cannot be deleted; move their products first.` : ''}
        confirmLabel="Delete"
        danger
        loading={deleting}
      />
    </div>
  );
}
