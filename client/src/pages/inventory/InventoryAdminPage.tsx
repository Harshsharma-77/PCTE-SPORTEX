import React, { useEffect, useState, useCallback } from 'react';
import {
  Package,
  Plus,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Search,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Tabs } from '../../components/ui/Tabs';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { useToast } from '../../context/ToastContext';
import { inventoryApi } from '../../services/inventoryApi';
import { EquipmentItem, EquipmentIssueItem } from '../../types/inventory';

export const InventoryAdminPage: React.FC = () => {
  const toast = useToast();

  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [issues, setIssues] = useState<EquipmentIssueItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('catalog');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [addModalOpen, setAddModalOpen] = useState<boolean>(false);
  const [issueModalOpen, setIssueModalOpen] = useState<boolean>(false);
  const [returnModalOpen, setReturnModalOpen] = useState<boolean>(false);
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentItem | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<EquipmentIssueItem | null>(null);

  // Forms
  const [addForm, setAddForm] = useState({
    name: '',
    sku: '',
    sportId: '',
    totalQuantity: 10,
    condition: 'GOOD',
    storageLocation: 'Main Sports Store',
  });

  const [issueForm, setIssueForm] = useState({
    issuedToUserId: '',
    quantity: 1,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    remarks: '',
  });

  const [returnForm, setReturnForm] = useState({
    returnCondition: 'GOOD',
    fineAmount: 0,
    remarks: '',
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchInventoryData = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setError(null);
    try {
      const [eqData, issData] = await Promise.all([
        inventoryApi.getAllEquipment(),
        inventoryApi.getEquipmentIssues(),
      ]);
      setEquipment(eqData);
      setIssues(issData);
    } catch (err: any) {
      console.error('Failed to load inventory:', err);
      setError(err.response?.data?.message || err.message || 'Could not load inventory catalog.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchInventoryData();
  }, [fetchInventoryData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchInventoryData(false);
    toast.info('Refreshing equipment stock counts...');
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await inventoryApi.createEquipment(addForm);
      toast.success(`Equipment ${addForm.name} added to catalog.`);
      setAddModalOpen(false);
      fetchInventoryData(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add equipment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquipment) return;
    setIsSubmitting(true);
    try {
      await inventoryApi.issueEquipment({
        equipmentId: selectedEquipment.id,
        issuedToUserId: issueForm.issuedToUserId,
        quantity: Number(issueForm.quantity),
        dueDate: issueForm.dueDate,
        remarks: issueForm.remarks,
      });
      toast.success(`Issued ${issueForm.quantity}x ${selectedEquipment.name}`);
      setIssueModalOpen(false);
      fetchInventoryData(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to issue equipment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIssue) return;
    setIsSubmitting(true);
    try {
      await inventoryApi.returnEquipment(selectedIssue.id, {
        returnCondition: returnForm.returnCondition,
        fineAmount: Number(returnForm.fineAmount),
        remarks: returnForm.remarks,
      });
      toast.success('Equipment returned and inventory restored.');
      setReturnModalOpen(false);
      fetchInventoryData(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to process return');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredEquipment = equipment.filter(
    (e) =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowStockCount = equipment.filter((e) => e.isLowStock).length;
  const activeLoansCount = issues.filter((i) => i.status === 'ISSUED').length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Sports Equipment & Inventory Desk" subtitle="Equipment catalog, checkout/loan desk, and stock tracking." />
        <Skeleton variant="card" height={120} />
        <Skeleton variant="card" height={360} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Sports Equipment & Inventory Desk" subtitle="Equipment catalog, checkout/loan desk, and stock tracking." />
        <ErrorState title="Inventory Error" message={error} onRetry={() => fetchInventoryData(true)} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. Header Banner */}
      <PageHeader
        title="Sports Equipment & Inventory Desk"
        subtitle="Catalog tracking, loan checkout desk, return condition logs, and low-stock alerts."
        badge={
          <Badge variant="info" size="sm">
            <Package className="w-3.5 h-3.5 mr-1" />
            Stock Ledger Active
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              isLoading={isRefreshing}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />}
            >
              Sync Stock
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setAddModalOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Equipment
            </Button>
          </div>
        }
      />

      {/* 2. Metric Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card variant="glass" className="p-4 flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-sportex-500/10 border border-sportex-500/30 text-sportex-400">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Equipment SKUs</p>
            <h3 className="text-2xl font-black text-white font-mono">{equipment.length}</h3>
          </div>
        </Card>

        <Card variant="glass" className="p-4 flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Units In Stock</p>
            <h3 className="text-2xl font-black text-emerald-400 font-mono">
              {equipment.reduce((acc, curr) => acc + curr.availableQuantity, 0)}
            </h3>
          </div>
        </Card>

        <Card variant="glass" className="p-4 flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Low-Stock Warnings</p>
            <h3 className="text-2xl font-black text-amber-400 font-mono">{lowStockCount}</h3>
          </div>
        </Card>

        <Card variant="glass" className="p-4 flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Active Issued Loans</p>
            <h3 className="text-2xl font-black text-purple-400 font-mono">{activeLoansCount}</h3>
          </div>
        </Card>
      </div>

      {/* 3. Navigation Tabs */}
      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        variant="pills"
        tabs={[
          { id: 'catalog', label: 'Equipment Catalog', badge: equipment.length, icon: <Package className="w-3.5 h-3.5" /> },
          { id: 'loans', label: 'Active Checkout Loans', badge: activeLoansCount, icon: <Clock className="w-3.5 h-3.5" /> },
        ]}
      />

      {/* 4. Tab Panels */}
      <div>
        {/* TAB 1: EQUIPMENT CATALOG */}
        {activeTab === 'catalog' && (
          <Card variant="glass" className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pb-3 border-b border-slate-800">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Search equipment by name or SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 text-xs"
                />
              </div>
            </div>

            {filteredEquipment.length === 0 ? (
              <EmptyState
                title="No Equipment Items"
                description="Add sports equipment to the institutional inventory catalog."
                actionLabel="Add Equipment"
                onAction={() => setAddModalOpen(true)}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                      <th className="pb-3">SKU</th>
                      <th className="pb-3">Equipment Name</th>
                      <th className="pb-3">Sport Discipline</th>
                      <th className="pb-3 text-center">Available / Total</th>
                      <th className="pb-3 text-center">Condition</th>
                      <th className="pb-3">Storage Location</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {filteredEquipment.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 font-mono text-sportex-400 font-bold">{item.sku}</td>
                        <td className="py-3.5 font-bold text-white">
                          {item.name}
                          {item.isLowStock && (
                            <span className="ml-2 px-1.5 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800 text-[9px] font-mono font-bold">
                              LOW STOCK
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 text-slate-300">{item.sport?.name || 'Varsity'}</td>
                        <td className="py-3.5 text-center font-mono font-bold">
                          <span className={item.availableQuantity <= 2 ? 'text-rose-400' : 'text-emerald-400'}>
                            {item.availableQuantity}
                          </span>{' '}
                          / <span className="text-slate-400">{item.totalQuantity}</span>
                        </td>
                        <td className="py-3.5 text-center">
                          <Badge
                            variant={
                              item.condition === 'NEW'
                                ? 'success'
                                : item.condition === 'GOOD'
                                ? 'info'
                                : item.condition === 'FAIR'
                                ? 'warning'
                                : 'danger'
                            }
                            size="sm"
                          >
                            {item.condition}
                          </Badge>
                        </td>
                        <td className="py-3.5 text-slate-400">{item.storageLocation || 'Main Store'}</td>
                        <td className="py-3.5 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={item.availableQuantity <= 0}
                            onClick={() => {
                              setSelectedEquipment(item);
                              setIssueModalOpen(true);
                            }}
                          >
                            Issue Loan
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {/* TAB 2: ACTIVE LOANS */}
        {activeTab === 'loans' && (
          <Card variant="glass" className="p-6 space-y-4">
            <h3 className="text-base font-bold text-white pb-3 border-b border-slate-800">
              Active Checkout Loans & Issues
            </h3>

            {issues.length === 0 ? (
              <EmptyState title="No Active Loans" description="Equipment checkout loans will appear here." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                      <th className="pb-3">Equipment</th>
                      <th className="pb-3">Issued To</th>
                      <th className="pb-3 text-center">Qty</th>
                      <th className="pb-3">Issue Date</th>
                      <th className="pb-3">Due Date</th>
                      <th className="pb-3 text-center">Status</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {issues.map((iss) => (
                      <tr key={iss.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5">
                          <p className="font-bold text-white">{iss.equipment?.name || 'Equipment'}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{iss.equipment?.sku}</p>
                        </td>
                        <td className="py-3.5">
                          <p className="font-bold text-white">{iss.issuedTo?.name || 'User'}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{iss.issuedTo?.email}</p>
                        </td>
                        <td className="py-3.5 text-center font-mono font-bold text-white">{iss.quantity}</td>
                        <td className="py-3.5 text-slate-400 font-mono text-[10px]">
                          {new Date(iss.issueDate).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 text-slate-400 font-mono text-[10px]">
                          {new Date(iss.dueDate).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 text-center">
                          <Badge variant={iss.status === 'RETURNED' ? 'success' : 'purple'} size="sm">
                            {iss.status}
                          </Badge>
                        </td>
                        <td className="py-3.5 text-right">
                          {iss.status === 'ISSUED' && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => {
                                setSelectedIssue(iss);
                                setReturnModalOpen(true);
                              }}
                              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                            >
                              Process Return
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. ADD EQUIPMENT MODAL                                                     */}
      {/* ========================================================================= */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add Sports Equipment Item"
        description="Register a new equipment SKU in the institutional sports inventory."
        maxWidth="md"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <Input
            label="Equipment Name"
            placeholder="e.g. FIFA Pro Match Soccer Ball"
            required
            value={addForm.name}
            onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="SKU Code"
              placeholder="e.g. EQ-FB-001"
              required
              value={addForm.sku}
              onChange={(e) => setAddForm({ ...addForm, sku: e.target.value })}
            />

            <Input
              label="Sport ID"
              placeholder="e.g. Sport UUID"
              required
              value={addForm.sportId}
              onChange={(e) => setAddForm({ ...addForm, sportId: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Total Quantity"
              type="number"
              min={1}
              required
              value={addForm.totalQuantity}
              onChange={(e) => setAddForm({ ...addForm, totalQuantity: Number(e.target.value) })}
            />

            <Select
              label="Initial Condition"
              value={addForm.condition}
              onChange={(e) => setAddForm({ ...addForm, condition: e.target.value })}
              options={[
                { value: 'NEW', label: 'Brand New' },
                { value: 'GOOD', label: 'Good' },
                { value: 'FAIR', label: 'Fair' },
              ]}
            />
          </div>

          <Input
            label="Storage Location"
            value={addForm.storageLocation}
            onChange={(e) => setAddForm({ ...addForm, storageLocation: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Save to Catalog
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* 6. ISSUE LOAN MODAL                                                       */}
      {/* ========================================================================= */}
      <Modal
        isOpen={issueModalOpen}
        onClose={() => setIssueModalOpen(false)}
        title={`Issue ${selectedEquipment?.name || 'Equipment'}`}
        description={`Available Stock: ${selectedEquipment?.availableQuantity || 0} units`}
        maxWidth="md"
      >
        <form onSubmit={handleIssueSubmit} className="space-y-4">
          <Input
            label="Recipient User ID (Student / Coach)"
            placeholder="Enter User UUID"
            required
            value={issueForm.issuedToUserId}
            onChange={(e) => setIssueForm({ ...issueForm, issuedToUserId: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Quantity to Issue"
              type="number"
              min={1}
              max={selectedEquipment?.availableQuantity || 1}
              required
              value={issueForm.quantity}
              onChange={(e) => setIssueForm({ ...issueForm, quantity: Number(e.target.value) })}
            />

            <Input
              label="Due Return Date"
              type="date"
              required
              value={issueForm.dueDate}
              onChange={(e) => setIssueForm({ ...issueForm, dueDate: e.target.value })}
            />
          </div>

          <Input
            label="Checkout Remarks / Notes"
            placeholder="e.g. For varsity training match"
            value={issueForm.remarks}
            onChange={(e) => setIssueForm({ ...issueForm, remarks: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setIssueModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Confirm Issue Loan
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* 7. RETURN LOAN MODAL                                                      */}
      {/* ========================================================================= */}
      <Modal
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        title="Process Equipment Return"
        description={`Item: ${selectedIssue?.equipment?.name} (Qty: ${selectedIssue?.quantity})`}
        maxWidth="md"
      >
        <form onSubmit={handleReturnSubmit} className="space-y-4">
          <Select
            label="Return Condition"
            value={returnForm.returnCondition}
            onChange={(e) => setReturnForm({ ...returnForm, returnCondition: e.target.value })}
            options={[
              { value: 'GOOD', label: 'Good' },
              { value: 'FAIR', label: 'Fair' },
              { value: 'POOR', label: 'Poor / Worn' },
              { value: 'DAMAGED', label: 'Damaged' },
            ]}
          />

          <Input
            label="Fine / Damage Charge (₹)"
            type="number"
            min={0}
            value={returnForm.fineAmount}
            onChange={(e) => setReturnForm({ ...returnForm, fineAmount: Number(e.target.value) })}
          />

          <Input
            label="Return Inspection Notes"
            placeholder="e.g. Returned on time in good condition"
            value={returnForm.remarks}
            onChange={(e) => setReturnForm({ ...returnForm, remarks: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setReturnModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Accept Return & Restore Stock
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
