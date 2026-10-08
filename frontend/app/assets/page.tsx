'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Package,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  Laptop,
  CreditCard,
  Building,
  Key,
} from 'lucide-react';
import { apiClient } from '@/lib/api';

interface Asset {
  id: string;
  assetName: string;
  assetType: string;
  serialNumber?: string;
  assetIdentifier?: string;
  status: 'REQUESTED' | 'IN_PREPARATION' | 'READY' | 'ASSIGNED' | 'BLOCKED';
  preparedAt?: string;
  assignedAt?: string;
  remarks?: string;
  employee?: { firstName: string; lastName: string; employeeId: string };
}

export default function AssetsWorkspacePage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modals
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [showPrepareModal, setShowPrepareModal] = useState(false);
  const [assetIdentifier, setAssetIdentifier] = useState('');
  const [prepareStatus, setPrepareStatus] = useState<'IN_PREPARATION' | 'READY'>('READY');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAssets();
  }, [selectedType, selectedStatus]);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (selectedType !== 'ALL') params.assetType = selectedType;
      if (selectedStatus !== 'ALL') params.status = selectedStatus;
      if (searchQuery) params.search = searchQuery;

      const res = await apiClient.get('/assets', { params });
      setAssets(res.data);
    } catch (err) {
      // Fallback sample data
      setAssets([
        {
          id: 'a1',
          assetName: 'MacBook Pro M3 Max 16"',
          assetType: 'Laptop (MacBook Pro)',
          serialNumber: 'MBP-2026-9921',
          assetIdentifier: 'LAP-2026-9921',
          status: 'ASSIGNED',
          assignedAt: '2026-09-15T10:00:00.000Z',
          employee: { firstName: 'Alex', lastName: 'Turner', employeeId: 'EMP-2026-0001' },
        },
        {
          id: 'a2',
          assetName: 'Proximity Keycard',
          assetType: 'Proximity ID Card',
          serialNumber: 'ID-2026-0044',
          assetIdentifier: 'ID-2026-0044',
          status: 'READY',
          preparedAt: '2026-09-16T08:00:00.000Z',
          employee: { firstName: 'Rahul', lastName: 'Sharma', employeeId: 'EMP-2026-0002' },
        },
        {
          id: 'a3',
          assetName: 'Developer Laptop Workstation',
          assetType: 'Laptop (MacBook Pro)',
          status: 'IN_PREPARATION',
          employee: { firstName: 'Marcus', lastName: 'Vance', employeeId: 'EMP-2026-0003' },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handlePrepareSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset) return;

    setSubmitting(true);
    try {
      await apiClient.post(`/assets/${selectedAsset.id}/prepare`, {
        status: prepareStatus,
        assetIdentifier,
        serialNumber: assetIdentifier,
      });
      setShowPrepareModal(false);
      setAssetIdentifier('');
      fetchAssets();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update asset preparation status.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignAsset = async (assetId: string) => {
    try {
      await apiClient.post(`/assets/${assetId}/assign`);
      fetchAssets();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to assign asset.');
    }
  };

  const getAssetIcon = (type: string) => {
    if (type.toLowerCase().includes('laptop')) return <Laptop className="w-4 h-4 text-blue-600" />;
    if (type.toLowerCase().includes('card') || type.toLowerCase().includes('badge')) return <CreditCard className="w-4 h-4 text-emerald-600" />;
    if (type.toLowerCase().includes('workstation')) return <Building className="w-4 h-4 text-purple-600" />;
    return <Key className="w-4 h-4 text-amber-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Asset Readiness Workspace</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage hardware, laptops, security badges, and access credentials provisioning.
          </p>
        </div>
      </div>

      {/* Table & Filter Controls */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Controls Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search asset by name, serial number, or employee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchAssets()}
              className="w-full bg-white border border-slate-300 rounded-md pl-9 pr-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-slate-600">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-white border border-slate-300 rounded-md px-2.5 py-1"
              >
                <option value="ALL">All Statuses</option>
                <option value="REQUESTED">Requested</option>
                <option value="IN_PREPARATION">In Preparation</option>
                <option value="READY">Ready</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="BLOCKED">Blocked</option>
              </select>
            </div>
          </div>
        </div>

        {/* Assets Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase">
              <tr>
                <th className="px-6 py-3.5">Asset Details</th>
                <th className="px-6 py-3.5">Employee</th>
                <th className="px-6 py-3.5">Asset Tag / Serial No</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {assets.map((asset) => (
                <tr key={asset.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    <div className="flex items-center gap-2">
                      {getAssetIcon(asset.assetType)}
                      <div>
                        <div>{asset.assetName}</div>
                        <div className="text-2xs text-slate-400 font-normal">{asset.assetType}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 font-medium text-slate-800">
                    {asset.employee ? `${asset.employee.firstName} ${asset.employee.lastName}` : 'Unassigned'}
                  </td>

                  <td className="px-6 py-4 font-mono text-slate-700">
                    {asset.assetIdentifier || asset.serialNumber || <span className="text-slate-400 font-sans text-2xs">Not generated</span>}
                  </td>

                  <td className="px-6 py-4">
                    {asset.status === 'ASSIGNED' && (
                      <span className="px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                        Assigned
                      </span>
                    )}
                    {asset.status === 'READY' && (
                      <span className="px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Ready
                      </span>
                    )}
                    {asset.status === 'IN_PREPARATION' && (
                      <span className="px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                        In Preparation
                      </span>
                    )}
                    {asset.status === 'REQUESTED' && (
                      <span className="px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                        Requested
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {asset.status !== 'ASSIGNED' && (
                        <button
                          onClick={() => {
                            setSelectedAsset(asset);
                            setAssetIdentifier(asset.assetIdentifier || '');
                            setShowPrepareModal(true);
                          }}
                          className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white font-medium text-2xs transition-colors border border-amber-200"
                        >
                          Prepare Asset
                        </button>
                      )}

                      {asset.status === 'READY' && (
                        <button
                          onClick={() => handleAssignAsset(asset.id)}
                          className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white font-medium text-2xs transition-colors border border-emerald-200"
                        >
                          Assign to Employee
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PREPARE ASSET MODAL */}
      {showPrepareModal && selectedAsset && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600" />
                <span>Prepare Asset: {selectedAsset.assetName}</span>
              </h3>
              <button onClick={() => setShowPrepareModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePrepareSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Set Preparation Status</label>
                <select
                  value={prepareStatus}
                  onChange={(e: any) => setPrepareStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs font-semibold"
                >
                  <option value="READY">READY (Hardware provisioned & tested)</option>
                  <option value="IN_PREPARATION">IN PREPARATION (Configuration in progress)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Asset Tag / Serial Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={assetIdentifier}
                  onChange={(e) => setAssetIdentifier(e.target.value)}
                  placeholder="e.g. LAP-2026-9921 or ID-2026-0044"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-xs font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPrepareModal(false)}
                  className="px-4 py-2 rounded-md border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !assetIdentifier}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md text-xs font-medium flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{submitting ? 'Saving...' : 'Save Asset Status'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
