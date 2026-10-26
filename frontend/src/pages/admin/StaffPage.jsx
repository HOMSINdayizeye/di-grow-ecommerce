import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { UserPlus, Pencil, Trash2, Users, ShieldCheck, UserCheck, UserX } from 'lucide-react';
import SEOHead from '@/seo/SEOHead';
import PageHeader from '@/components/admin/PageHeader';
import ErrorState from '@/components/admin/ErrorState';
import Modal, { ConfirmModal } from '@/components/common/Modal';
import FormField, { Switch } from '@/components/common/FormField';
import Button from '@/components/common/Button';
import EmptyState from '@/components/common/EmptyState';
import { Skeleton } from '@/components/common/Loader';
import { useFetch } from '@/hooks/useFetch';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { adminAuthService } from '@/services/adminAuthService';
import { getErrorMessage } from '@/services/api';
import { staffSchema } from '@/validations/adminSchemas';
import { ROLES, ROLE_LABELS, ROLE_OPTIONS } from '@/constants/roles';
import { timeAgo, formatDateTime } from '@/utils/formatDate';

const DEFAULTS = { name: '', email: '', role: ROLES.STAFF, password: '', isActive: true };

function RoleBadge({ role }) {
  const admin = role === ROLES.ADMIN;
  return (
    <span className={clsx('badge border', admin ? 'border-accent-500/30 bg-accent-500/15 text-accent-500' : 'border-brand-500/30 bg-brand-500/15 text-brand-500')}>
      {admin && <ShieldCheck className="h-3 w-3" />}
      {ROLE_LABELS[role] || role}
    </span>
  );
}

function ActiveBadge({ active }) {
  return <span className={clsx('badge border', active ? 'border-success/30 bg-success/15 text-success' : 'border-line bg-surface-2 text-muted')}>{active ? 'Active' : 'Deactivated'}</span>;
}

export default function StaffPage() {
  const { user: me } = useAdminAuth();
  const { data: users, loading, error, refetch, setData } = useFetch(() => adminAuthService.listStaff(), [], { initialData: [] });
  const [editing, setEditing] = useState(null); // null | {} | user
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(staffSchema), defaultValues: DEFAULTS });

  const isEdit = !!editing?._id;

  useEffect(() => {
    if (editing) reset({ name: editing.name || '', email: editing.email || '', role: editing.role || ROLES.STAFF, password: '', isActive: editing.isActive ?? true });
  }, [editing, reset]);

  const onSubmit = async (values) => {
    if (!isEdit && !values.password) {
      setError('password', { message: 'Set a temporary password' });
      return;
    }
    const payload = { ...values };
    if (!payload.password) delete payload.password;
    try {
      if (isEdit) {
        await adminAuthService.updateStaff(editing._id, payload);
        toast.success('Staff member updated');
      } else {
        await adminAuthService.createStaff(payload);
        toast.success(`${values.name} invited`);
      }
      setEditing(null);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const toggleActive = async (u) => {
    if (u._id === me?._id) return toast.error('You cannot deactivate your own account');
    setToggling(u._id);
    try {
      const res = await adminAuthService.updateStaff(u._id, { isActive: !u.isActive });
      setData((list) => (list || []).map((x) => (x._id === u._id ? { ...x, ...res.data } : x)));
      toast.success(`${u.name} ${u.isActive ? 'deactivated' : 'activated'}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setToggling(null);
    }
    return null;
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await adminAuthService.removeStaff(toDelete._id);
      toast.success(`${toDelete.name} removed`);
      setToDelete(null);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const list = users || [];

  return (
    <div>
      <SEOHead title="Staff" noIndex />
      <PageHeader
        title="Team"
        highlight="members"
        subtitle="Admins manage everything; staff handle orders, products and blog posts."
        actions={
          <Button size="sm" icon={UserPlus} onClick={() => setEditing({})}>
            Invite staff
          </Button>
        }
      />

      {error ? (
        <div className="card">
          <ErrorState message={error.message} onRetry={refetch} />
        </div>
      ) : loading && !list.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="card">
          <EmptyState icon={Users} title="No team members" description="Invite a colleague to help manage orders." />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((u) => {
            const isMe = u._id === me?._id;
            return (
              <div key={u._id} className={clsx('card flex flex-col p-5', !u.isActive && 'opacity-75')}>
                <div className="flex items-start gap-3">
                  <span className={clsx('flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full font-display text-lg font-bold text-white', u.isActive ? 'bg-gradient-brand' : 'bg-muted/50')}>{u.name?.charAt(0)?.toUpperCase() || '?'}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink">
                      {u.name} {isMe && <span className="text-xs font-normal text-muted">(you)</span>}
                    </p>
                    <p className="truncate text-sm text-muted">{u.email}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <RoleBadge role={u.role} />
                      <ActiveBadge active={u.isActive} />
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-xs text-muted" title={u.lastLoginAt ? formatDateTime(u.lastLoginAt) : ''}>
                  {u.lastLoginAt ? `Last login ${timeAgo(u.lastLoginAt)}` : 'Never signed in'}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                  <Button variant="ghost" size="sm" icon={u.isActive ? UserX : UserCheck} loading={toggling === u._id} disabled={isMe} onClick={() => toggleActive(u)}>
                    {u.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => setEditing(u)} className="rounded-full p-2 text-muted transition hover:bg-surface-2 hover:text-brand-500" aria-label={`Edit ${u.name}`}>
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setToDelete(u)}
                      disabled={isMe}
                      className="rounded-full p-2 text-muted transition hover:bg-danger/15 hover:text-danger disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label={`Delete ${u.name}`}
                      title={isMe ? 'You cannot delete your own account' : 'Delete'}
                    >
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
        title={isEdit ? 'Edit staff member' : 'Invite staff'}
        description={isEdit ? 'Leave the password blank to keep the current one.' : 'Share the temporary password with them directly; they can change it after signing in.'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" form="staff-form" loading={isSubmitting}>
              {isEdit ? 'Save changes' : 'Send invite'}
            </Button>
          </>
        }
      >
        <form id="staff-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormField label="Full name" required placeholder="e.g. Grace Ingabire" error={errors.name?.message} {...register('name')} />
          <FormField label="Email" required type="email" placeholder="name@digrow.rw" error={errors.email?.message} {...register('email')} />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField as="select" label="Role" required error={errors.role?.message} disabled={isEdit && editing._id === me?._id} {...register('role')}>
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </FormField>
            <FormField label={isEdit ? 'New password' : 'Temporary password'} required={!isEdit} type="password" autoComplete="new-password" placeholder={isEdit ? 'Leave blank to keep' : 'At least 8 characters'} error={errors.password?.message} {...register('password')} />
          </div>
          <Controller name="isActive" control={control} render={({ field }) => <Switch label="Active" description="Inactive members cannot sign in" checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} disabled={isEdit && editing._id === me?._id} />} />
        </form>
      </Modal>

      <ConfirmModal
        open={!!toDelete}
        onClose={() => !deleting && setToDelete(null)}
        onConfirm={confirmDelete}
        title="Remove team member?"
        message={toDelete ? `${toDelete.name} (${toDelete.email}) will lose access immediately. Consider deactivating instead if they may return.` : ''}
        confirmLabel="Remove"
        danger
        loading={deleting}
      />
    </div>
  );
}
