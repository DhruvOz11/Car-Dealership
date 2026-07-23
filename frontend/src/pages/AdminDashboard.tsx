import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/auth.context'
import { useVehicles } from '../hooks/useVehicles'
import { Navbar } from '../components/Navbar'
import type { Vehicle } from '../types'

interface VehicleFormData {
  make: string
  model: string
  category: string
  price: string
  quantity: string
}

const emptyForm: VehicleFormData = {
  make: '',
  model: '',
  category: '',
  price: '',
  quantity: '',
}

const inputCls =
  'focus-ring w-full rounded-md border border-asphalt-600 bg-asphalt-900 px-3 py-2.5 text-sm text-chrome-100 transition focus:border-ignition'

interface VehicleModalProps {
  open: boolean
  title: string
  form: VehicleFormData
  busy: boolean
  onClose: () => void
  onChange: (field: keyof VehicleFormData, val: string) => void
  onSubmit: () => void
  submitLabel: string
}

const VehicleModal = ({
  open,
  title,
  form,
  busy,
  onClose,
  onChange,
  onSubmit,
  submitLabel,
}: VehicleModalProps) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-lg border border-asphalt-700 bg-asphalt-800">
        <div className="flex items-center justify-between border-b border-asphalt-700 px-6 py-5">
          <h2 className="font-display text-xl font-bold uppercase tracking-wide text-chrome-100">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="focus-ring rounded-md p-2 text-chrome-500 hover:text-chrome-100"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-2">
          {(
            [
              {
                field: 'make',
                label: 'Make',
                placeholder: 'Toyota',
                type: 'text',
              },
              {
                field: 'model',
                label: 'Model',
                placeholder: 'Camry',
                type: 'text',
              },
              {
                field: 'category',
                label: 'Category',
                placeholder: 'Sedan',
                type: 'text',
              },
              {
                field: 'price',
                label: 'Price ($)',
                placeholder: '25000',
                type: 'number',
              },
            ] as const
          ).map(({ field, label, placeholder, type }) => (
            <div key={field}>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-chrome-500">
                {label}
              </label>
              <input
                type={type ?? 'text'}
                value={form[field]}
                onChange={(e) => onChange(field, e.target.value)}
                placeholder={placeholder}
                className={inputCls}
                disabled={busy}
              />
            </div>
          ))}
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-chrome-500">
              Quantity
            </label>
            <input
              type="number"
              min="0"
              value={form.quantity}
              onChange={(e) => onChange('quantity', e.target.value)}
              placeholder="10"
              className={inputCls}
              disabled={busy}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-asphalt-700 bg-asphalt-900 px-6 py-4">
          <button
            onClick={onClose}
            className="focus-ring rounded-md border border-asphalt-600 px-4 py-2.5 text-sm font-semibold text-chrome-300 hover:bg-asphalt-800"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={busy}
            className="focus-ring rounded-md bg-ignition px-5 py-2.5 text-sm font-bold uppercase text-asphalt-900 hover:bg-ignition-600 disabled:opacity-60"
          >
            {busy ? 'Saving…' : submitLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

const AdminDashboard = () => {
  const { user } = useAuth()
  const {
    vehicles,
    loading,
    actionLoading,
    error,
    setError,
    fetchVehicles,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    restockVehicle,
  } = useVehicles()

  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [restockOpen, setRestockOpen] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [form, setForm] = useState<VehicleFormData>(emptyForm)
  const [restockAmount, setRestockAmount] = useState('1')
  const [searchTable, setSearchTable] = useState('')

  useEffect(() => {
    void fetchVehicles()
  }, [fetchVehicles])

  const updateField = (field: keyof VehicleFormData, val: string) =>
    setForm((f) => ({ ...f, [field]: val }))

  const filteredTableVehicles = useMemo(() => {
    const q = searchTable.toLowerCase()
    return vehicles.filter(
      (v) =>
        v.make.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q),
    )
  }, [vehicles, searchTable])

  const stats = useMemo(
    () => ({
      total: vehicles.length,
      lowStock: vehicles.filter((v) => v.quantity <= 3).length,
      outOfStock: vehicles.filter((v) => v.quantity === 0).length,
      categories: new Set(vehicles.map((v) => v.category)).size,
    }),
    [vehicles],
  )

  const openCreate = () => {
    setForm(emptyForm)
    setCreateOpen(true)
  }

  const openEdit = (v: Vehicle) => {
    setSelectedVehicle(v)
    setForm({
      make: v.make,
      model: v.model,
      category: v.category,
      price: String(v.price),
      quantity: String(v.quantity),
    })
    setEditOpen(true)
  }

  const openRestock = (v: Vehicle) => {
    setSelectedVehicle(v)
    setRestockAmount('1')
    setRestockOpen(true)
  }

  const handleCreate = async () => {
    try {
      await createVehicle({
        make: form.make,
        model: form.model,
        category: form.category,
        price: Number(form.price),
        quantity: Number(form.quantity),
      })
      setCreateOpen(false)
    } catch {
      /* error shown in banner */
    }
  }

  const handleUpdate = async () => {
    if (!selectedVehicle) return
    try {
      await updateVehicle(selectedVehicle.id, {
        make: form.make,
        model: form.model,
        category: form.category,
        price: Number(form.price),
        quantity: Number(form.quantity),
      })
      setEditOpen(false)
      setSelectedVehicle(null)
    } catch {
      /* error shown in banner */
    }
  }

  const handleDelete = async (v: Vehicle) => {
    if (!window.confirm(`Delete ${v.make} ${v.model}? This cannot be undone.`))
      return
    try {
      await deleteVehicle(v.id)
    } catch {
      /* error shown in banner */
    }
  }

  const handleRestock = async () => {
    if (!selectedVehicle) return
    const amount = Number(restockAmount)
    if (amount < 1) return
    try {
      await restockVehicle(selectedVehicle.id, amount)
      setRestockOpen(false)
      setSelectedVehicle(null)
    } catch {
      /* error shown in banner */
    }
  }

  return (
    <div className="min-h-screen bg-asphalt-900">
      <Navbar />
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="font-mono text-xs font-semibold uppercase tracking-widest text-ignition">
              Admin Console
            </span>
            <h1 className="mt-1 font-display text-4xl font-bold uppercase tracking-wide text-chrome-100">
              Vehicle Management
            </h1>
            <p className="mt-1 text-chrome-500">
              Logged in as{' '}
              <strong className="text-chrome-300">{user?.email}</strong>
            </p>
          </div>
          <button
            onClick={openCreate}
            className="focus-ring flex items-center gap-2 rounded-md bg-ignition px-5 py-3 text-sm font-bold uppercase tracking-wide text-asphalt-900 hover:bg-ignition-600"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Vehicle
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            {
              label: 'Total Vehicles',
              value: stats.total,
              color: 'text-chrome-100',
            },
            {
              label: 'Out of Stock',
              value: stats.outOfStock,
              color: 'text-red-400',
            },
            {
              label: 'Low Stock (≤3)',
              value: stats.lowStock,
              color: 'text-ignition',
            },
            {
              label: 'Categories',
              value: stats.categories,
              color: 'text-emerald-400',
            },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="rounded-lg border border-asphalt-700 bg-asphalt-800 p-4"
            >
              <p className={`font-mono text-3xl font-bold ${color}`}>{value}</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-chrome-500">
                {label}
              </p>
            </div>
          ))}
        </div>

        {error && (
          <div className="flex items-center justify-between rounded-md border border-red-900/60 bg-red-950/40 px-4 py-3 text-sm text-red-300">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="font-semibold hover:text-red-100"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="overflow-hidden rounded-lg border border-asphalt-700 bg-asphalt-800">
          <div className="flex flex-col gap-3 border-b border-asphalt-700 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-display text-lg font-bold uppercase tracking-wide text-chrome-100">
              Inventory ({filteredTableVehicles.length})
            </h2>
            <input
              type="search"
              value={searchTable}
              onChange={(e) => setSearchTable(e.target.value)}
              placeholder="Search table…"
              className="focus-ring w-full rounded-md border border-asphalt-600 bg-asphalt-900 px-3 py-2 text-sm text-chrome-100 sm:w-64"
            />
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-20 text-sm text-chrome-500">
                Loading inventory…
              </div>
            ) : filteredTableVehicles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <p className="text-chrome-500">No vehicles found.</p>
                <button
                  onClick={openCreate}
                  className="focus-ring mt-3 rounded-md bg-ignition px-4 py-2 text-sm font-bold uppercase text-asphalt-900 hover:bg-ignition-600"
                >
                  Add your first vehicle
                </button>
              </div>
            ) : (
              <table className="w-full min-w-[700px] text-sm">
                <thead>
                  <tr className="border-b border-asphalt-700 bg-asphalt-900 text-left text-xs font-semibold uppercase tracking-wider text-chrome-500">
                    <th className="px-5 py-3">Vehicle</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Price</th>
                    <th className="px-5 py-3">Stock</th>
                    <th className="px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-asphalt-700">
                  {filteredTableVehicles.map((v) => (
                    <tr
                      key={v.id}
                      className="transition hover:bg-asphalt-900/60"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-chrome-100">
                          {v.make} {v.model}
                        </p>
                        <p className="font-mono text-xs text-chrome-500">
                          {v.id.slice(0, 8)}…
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="plate-dark">{v.category}</span>
                      </td>
                      <td className="px-5 py-4 font-mono font-semibold text-chrome-100">
                        $
                        {v.price.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-[4px] px-2 py-0.5 font-mono text-xs font-bold ${
                            v.quantity === 0
                              ? 'bg-red-950/60 text-red-300'
                              : v.quantity <= 3
                                ? 'bg-ignition/15 text-ignition'
                                : 'bg-emerald-950/60 text-emerald-300'
                          }`}
                        >
                          {v.quantity}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEdit(v)}
                            className="focus-ring rounded-md bg-asphalt-700 px-3 py-1.5 text-xs font-semibold text-chrome-100 hover:bg-asphalt-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => openRestock(v)}
                            className="focus-ring rounded-md bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600"
                          >
                            Restock
                          </button>
                          <button
                            onClick={() => void handleDelete(v)}
                            disabled={actionLoading}
                            className="focus-ring rounded-md bg-red-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      <VehicleModal
        open={createOpen}
        title="Add New Vehicle"
        form={form}
        busy={actionLoading}
        onClose={() => setCreateOpen(false)}
        onChange={updateField}
        onSubmit={() => void handleCreate()}
        submitLabel="Create Vehicle"
      />

      <VehicleModal
        open={editOpen}
        title={`Edit — ${selectedVehicle?.make ?? ''} ${selectedVehicle?.model ?? ''}`}
        form={form}
        busy={actionLoading}
        onClose={() => {
          setEditOpen(false)
          setSelectedVehicle(null)
        }}
        onChange={updateField}
        onSubmit={() => void handleUpdate()}
        submitLabel="Save Changes"
      />

      {restockOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-lg border border-asphalt-700 bg-asphalt-800">
            <div className="border-b border-asphalt-700 px-6 py-5">
              <h2 className="font-display text-xl font-bold uppercase tracking-wide text-chrome-100">
                Restock Vehicle
              </h2>
              <p className="mt-1 text-sm text-chrome-500">
                {selectedVehicle?.make} {selectedVehicle?.model} — currently{' '}
                <strong className="text-chrome-300">
                  {selectedVehicle?.quantity}
                </strong>{' '}
                in stock
              </p>
            </div>
            <div className="p-6">
              <label className="mb-1.5 block text-sm font-medium text-chrome-300">
                Amount to add
              </label>
              <input
                type="number"
                min="1"
                value={restockAmount}
                onChange={(e) => setRestockAmount(e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="flex justify-end gap-3 border-t border-asphalt-700 bg-asphalt-900 px-6 py-4">
              <button
                onClick={() => {
                  setRestockOpen(false)
                  setSelectedVehicle(null)
                }}
                className="focus-ring rounded-md border border-asphalt-600 px-4 py-2.5 text-sm font-semibold text-chrome-300 hover:bg-asphalt-800"
              >
                Cancel
              </button>
              <button
                onClick={() => void handleRestock()}
                disabled={actionLoading || Number(restockAmount) < 1}
                className="focus-ring rounded-md bg-emerald-700 px-5 py-2.5 text-sm font-bold uppercase text-white hover:bg-emerald-600 disabled:opacity-60"
              >
                {actionLoading ? 'Restocking…' : 'Add Stock'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
