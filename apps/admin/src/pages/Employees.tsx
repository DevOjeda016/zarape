import { ChefHatIcon, CopyIcon, KeyIcon, ShieldCheckIcon, UsersIcon } from '@phosphor-icons/react';
import type { Role } from '@zarape/shared';
import { Alert, AlertDescription, AlertTitle } from '@zarape/ui/components/alert';
import { Badge } from '@zarape/ui/components/badge';
import { Button } from '@zarape/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@zarape/ui/components/dialog';
import { Field, FieldLabel } from '@zarape/ui/components/field';
import { ToggleGroup, ToggleGroupItem } from '@zarape/ui/components/toggle-group';
import { Tooltip, TooltipContent, TooltipTrigger } from '@zarape/ui/components/tooltip';
import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/auth/session';
import { CatalogPage } from '@/components/catalog/CatalogPage';
import { CatalogTable } from '@/components/catalog/CatalogTable';
import { SelectField, StatusFilter, TextField } from '@/components/catalog/fields';
import { FormDialog } from '@/components/catalog/FormDialog';
import { STATUS_OPTIONS } from '@/components/catalog/options';
import { RowActions } from '@/components/catalog/RowActions';
import { summarizeFilters } from '@/components/catalog/summary';
import { useCatalog, useOptions } from '@/components/catalog/useCatalog';
import { type FieldErrors, useForm } from '@/components/catalog/useForm';
import { StatusBadge } from '@/components/StatusBadge';
import { api, ApiError } from '@/lib/api';
import type { Branch, Employee, EmployeeWithPassword } from '@/lib/types';

interface Values {
  username: string;
  role: Role;
  branchId: string;
  status: string;
}

const ALL_BRANCHES = 'ALL';
const EMPTY: Values = { username: '', role: 'KITCHEN', branchId: ALL_BRANCHES, status: 'ACTIVE' };
const EMPTY_FILTERS = { username: '', status: '' };

const ROLES: Record<Role, { label: string; icon: typeof ShieldCheckIcon }> = {
  ADMIN: { label: 'Administrador', icon: ShieldCheckIcon },
  KITCHEN: { label: 'Cocina', icon: ChefHatIcon },
};

function validate(v: Values): FieldErrors<Values> {
  return {
    username: /^[\w.-]{3,40}$/.test(v.username.trim())
      ? undefined
      : 'Usa de 3 a 40 letras, números, punto, guion o guion bajo, sin espacios.',
  };
}

function toValues(e: Employee): Values {
  return {
    username: e.username,
    role: e.role,
    branchId: e.branchId ? String(e.branchId) : ALL_BRANCHES,
    status: e.status,
  };
}

/** RF03: empleados. La contraseña la genera el sistema (12 caracteres) y se ve una sola vez. */
export function Employees() {
  const { employee: me } = useAuth();
  const list = useCatalog<Employee>('/employees');
  const branches = useOptions<Branch>('/branches?status=ACTIVE');
  const [draft, setDraft] = useState(EMPTY_FILTERS);
  const [revealed, setRevealed] = useState<EmployeeWithPassword | null>(null);
  const form = useForm<Values>(EMPTY);
  const v = form.values;

  function save() {
    form.save(validate, async (values) => {
      const body = {
        username: values.username.trim(),
        role: values.role,
        branchId: values.branchId === ALL_BRANCHES ? null : Number(values.branchId),
      };
      if (form.isNew) {
        const created = await api<EmployeeWithPassword>('POST', '/employees', body);
        list.reload();
        setRevealed(created);
        return `Usuario ${created.username} agregado`;
      }
      await api('PATCH', `/employees/${form.editingId}`, { ...body, status: values.status });
      list.reload();
      return 'Cambios guardados';
    });
  }

  async function resetPassword(e: Employee) {
    try {
      setRevealed(await api<EmployeeWithPassword>('POST', `/employees/${e.id}/password`));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'No pudimos generar la contraseña.');
    }
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Contraseña copiada');
    } catch {
      toast.error('No pudimos copiarla; anótala a mano.');
    }
  }

  const isMe = (e: Employee) => e.id === me?.id;

  return (
    <CatalogPage
      title="Usuarios"
      description="Empleados con acceso a la gestión y a la cocina."
      icon={UsersIcon}
      addLabel="Agregar usuario"
      onAdd={() => form.openWith(null, EMPTY)}
      onSearch={() => list.search(draft)}
      onClear={() => {
        setDraft(EMPTY_FILTERS);
        list.search({});
      }}
      filterSummary={summarizeFilters(list.filters, { username: 'Usuario' })}
      total={list.rows.length}
      filters={
        <>
          <TextField
            label="Nombre de usuario"
            value={draft.username}
            onChange={(e) => setDraft({ ...draft, username: e.target.value })}
            placeholder="maria"
            className="w-64"
          />
          <StatusFilter value={draft.status} onChange={(status) => setDraft({ ...draft, status })} />
        </>
      }
    >
      <CatalogTable
        rows={list.rows}
        loading={list.loading}
        error={list.error}
        emptyMessage="No hay usuarios con ese nombre."
        columns={[
          {
            header: 'Usuario',
            cell: (e) => (
              <span className="font-semibold">
                {e.username}
                {isMe(e) && <span className="font-normal text-muted-foreground"> (tú)</span>}
              </span>
            ),
          },
          {
            header: 'Rol',
            cell: (e) => {
              const { label, icon: IconComponent } = ROLES[e.role];
              return (
                <Badge variant="outline">
                  <IconComponent data-icon="inline-start" />
                  {label}
                </Badge>
              );
            },
          },
          { header: 'Sucursal', cell: (e) => e.branch?.name ?? <span className="text-muted-foreground">Todas</span> },
          { header: 'Contraseña', cell: () => <span className="tracking-widest text-muted-foreground">••••••••••••</span> },
          { header: 'Estatus', cell: (e) => <StatusBadge status={e.status} /> },
        ]}
        actions={(e) => (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-lg"
                  onClick={() => resetPassword(e)}
                  aria-label={`Nueva contraseña para ${e.username}`}
                >
                  <KeyIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Nueva contraseña</TooltipContent>
            </Tooltip>
            {isMe(e) ? (
              <Button variant="ghost" size="icon-lg" onClick={() => form.openWith(e.id, toValues(e))} aria-label="Editar tu usuario">
                <ShieldCheckIcon />
              </Button>
            ) : (
              <RowActions
                label={`al usuario ${e.username}`}
                deletePath={`/employees/${e.id}`}
                inactive={e.status === 'INACTIVE'}
                onEdit={() => form.openWith(e.id, toValues(e))}
                onDeleted={list.reload}
              />
            )}
          </>
        )}
      />

      <FormDialog
        open={form.open}
        onClose={form.close}
        title={form.isNew ? 'Agregar usuario' : `Editar usuario #${form.editingId}`}
        description={
          form.isNew
            ? 'Al guardar, el sistema genera una contraseña aleatoria de 12 caracteres.'
            : 'Para cambiar la contraseña usa la llave en la lista.'
        }
        saving={form.saving}
        error={form.formError}
        onSave={save}
      >
        <TextField
          label="Nombre de usuario"
          value={v.username}
          error={form.errors.username}
          autoComplete="off"
          onChange={(e) => form.set('username', e.target.value)}
        />
        <Field>
          <FieldLabel>Rol</FieldLabel>
          <ToggleGroup
            type="single"
            variant="outline"
            value={v.role}
            onValueChange={(role) => role && form.set('role', role as Role)}
            disabled={form.editingId === me?.id}
            aria-label="Rol"
          >
            {(Object.keys(ROLES) as Role[]).map((role) => {
              const { label, icon: IconComponent } = ROLES[role];
              return (
                <ToggleGroupItem key={role} value={role} className="px-4">
                  <IconComponent weight={v.role === role ? 'fill' : 'regular'} />
                  {label}
                </ToggleGroupItem>
              );
            })}
          </ToggleGroup>
        </Field>
        <SelectField
          label="Sucursal"
          value={v.branchId}
          onChange={(b) => form.set('branchId', b)}
          options={[
            { value: ALL_BRANCHES, label: 'Todas (oficina central)' },
            ...branches.map((b) => ({ value: String(b.id), label: b.name })),
          ]}
        />
        {!form.isNew && form.editingId !== me?.id && (
          <SelectField label="Estatus" value={v.status} onChange={(s) => form.set('status', s)} options={STATUS_OPTIONS} />
        )}
      </FormDialog>

      <Dialog open={!!revealed} onOpenChange={(open) => !open && setRevealed(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">Contraseña de {revealed?.username}</DialogTitle>
            <DialogDescription>Entrégasela en persona. Por seguridad no la guardamos en claro.</DialogDescription>
          </DialogHeader>
          <p className="rounded-lg border-2 border-dashed bg-secondary p-4 text-center font-mono text-2xl font-bold tracking-wider select-all">
            {revealed?.password}
          </p>
          <Alert>
            <KeyIcon />
            <AlertTitle>Solo se muestra esta vez</AlertTitle>
            <AlertDescription>Si se pierde, genera otra con la llave de la lista.</AlertDescription>
          </Alert>
          <DialogFooter>
            <Button variant="outline" size="lg" onClick={() => revealed && copy(revealed.password)}>
              <CopyIcon data-icon="inline-start" />
              Copiar
            </Button>
            <Button size="lg" onClick={() => setRevealed(null)}>
              Listo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CatalogPage>
  );
}
