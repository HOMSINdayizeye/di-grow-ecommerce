import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { ArrowLeft, Save } from 'lucide-react';
import SEOHead from '@/seo/SEOHead';
import PageHeader from '@/components/admin/PageHeader';
import ImageUploader from '@/components/admin/ImageUploader';
import ErrorState from '@/components/admin/ErrorState';
import FormField, { Switch } from '@/components/common/FormField';
import Button from '@/components/common/Button';
import { Skeleton } from '@/components/common/Loader';
import { useFetch } from '@/hooks/useFetch';
import { productService } from '@/services/productService';
import { categoryService } from '@/services/categoryService';
import { getErrorMessage } from '@/services/api';
import { productSchema } from '@/validations/productSchema';

const DEFAULTS = {
  name: '',
  sku: '',
  brand: '',
  categoryId: '',
  price: '',
  compareAtPrice: '',
  stockQty: 0,
  shortDescription: '',
  description: '',
  requiresPrescription: false,
  isFeatured: false,
  images: [],
  tags: '',
};

const toForm = (p) => ({
  name: p.name || '',
  sku: p.sku || '',
  brand: p.brand || '',
  categoryId: p.category?._id || p.categoryId || '',
  price: p.price ?? '',
  compareAtPrice: p.compareAtPrice ?? '',
  stockQty: p.stockQty ?? 0,
  shortDescription: p.shortDescription || '',
  description: p.description || '',
  requiresPrescription: !!p.requiresPrescription,
  isFeatured: !!p.isFeatured,
  images: p.images || [],
  tags: (p.tags || []).join(', '),
});

export default function ProductFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const { data: categories } = useFetch(() => categoryService.adminList(), [], { initialData: [] });
  const { data: product, loading, error, refetch } = useFetch(() => productService.adminGet(id), [id], { enabled: isEdit });

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(productSchema), defaultValues: DEFAULTS });

  useEffect(() => {
    if (product) reset(toForm(product));
  }, [product, reset]);

  const shortDesc = watch('shortDescription') || '';

  const onSubmit = async (values) => {
    const payload = {
      ...values,
      tags: String(values.tags || '')
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
    };
    try {
      if (isEdit) {
        await productService.update(id, payload);
        toast.success('Product updated');
      } else {
        await productService.create(payload);
        toast.success('Product created');
      }
      navigate('/admin/products');
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

  if (isEdit && (loading || !product)) {
    return (
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-[32rem] lg:col-span-2" />
        <Skeleton className="h-[32rem]" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <SEOHead title={isEdit ? 'Edit product' : 'New product'} noIndex />
      <Link to="/admin/products" className="mb-4 inline-flex items-center gap-1 text-sm text-muted transition hover:text-brand-500">
        <ArrowLeft className="h-4 w-4" /> Back to products
      </Link>
      <PageHeader
        title={isEdit ? 'Edit' : 'New'}
        highlight="product"
        subtitle={isEdit ? product.name : 'Fill in the details customers will see in the shop.'}
        actions={
          <>
            <Button variant="secondary" size="sm" to="/admin/products" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" size="sm" icon={Save} loading={isSubmitting}>
              {isEdit ? 'Save changes' : 'Create product'}
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main fields */}
        <div className="space-y-6 lg:col-span-2">
          <div className="card space-y-4 p-5">
            <h3 className="font-ui text-sm font-semibold">Basics</h3>
            <FormField label="Product name" required placeholder="e.g. Organic Foliar Fertilizer 1L" error={errors.name?.message} {...register('name')} />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="SKU" required placeholder="DG-FERT-001" error={errors.sku?.message} inputClassName="font-mono" {...register('sku')} />
              <FormField label="Brand" placeholder="Optional" error={errors.brand?.message} {...register('brand')} />
            </div>
            <FormField
              as="textarea"
              label="Short description"
              required
              rows={2}
              placeholder="One or two lines shown on product cards"
              error={errors.shortDescription?.message}
              help={`${shortDesc.length}/160 characters`}
              maxLength={160}
              {...register('shortDescription')}
            />
            <FormField as="textarea" label="Full description" required rows={8} placeholder="Benefits, usage, dosage or application rate, storage…" error={errors.description?.message} {...register('description')} />
            <FormField label="Tags" placeholder="immunity, vitamins, daily" help="Comma separated. Used by search." error={errors.tags?.message} {...register('tags')} />
          </div>

          <div className="card space-y-4 p-5">
            <h3 className="font-ui text-sm font-semibold">Pricing & stock</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField label="Price (RWF)" required type="number" min="0" step="1" inputMode="numeric" error={errors.price?.message} {...register('price')} />
              <FormField label="Compare-at price" type="number" min="0" step="1" inputMode="numeric" help="Shown struck through" error={errors.compareAtPrice?.message} {...register('compareAtPrice')} />
              <FormField label="Stock quantity" required type="number" min="0" step="1" inputMode="numeric" error={errors.stockQty?.message} {...register('stockQty')} />
            </div>
          </div>
        </div>

        {/* Publishing sidebar */}
        <div className="space-y-6">
          <div className="card space-y-5 p-5">
            <h3 className="font-ui text-sm font-semibold">Publishing</h3>
            <FormField as="select" label="Category" required error={errors.categoryId?.message} {...register('categoryId')}>
              <option value="">Choose a category</option>
              {(categories || []).map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </FormField>
            <Controller
              name="requiresPrescription"
              control={control}
              render={({ field }) => <Switch label="Requires prescription" description="Pharmacist verifies before dispatch" checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />}
            />
            <Controller name="isFeatured" control={control} render={({ field }) => <Switch label="Featured" description="Show on the home page" checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />} />
          </div>

          <div className="card p-5">
            <h3 className="font-ui text-sm font-semibold">Images</h3>
            <p className="mb-3 text-xs text-muted">Optional. The first image is the cover, up to 6. Without images a placeholder is shown.</p>
            <Controller name="images" control={control} render={({ field }) => <ImageUploader value={field.value || []} onChange={field.onChange} max={6} />} />
            {errors.images && <p className="error-text">{errors.images.message}</p>}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2 lg:hidden">
        <Button variant="secondary" to="/admin/products" disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" icon={Save} loading={isSubmitting}>
          {isEdit ? 'Save changes' : 'Create product'}
        </Button>
      </div>
    </form>
  );
}
