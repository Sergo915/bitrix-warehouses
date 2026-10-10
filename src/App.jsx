import React, { useEffect, useState } from 'react';
import WarehouseTabs from './components/WarehouseTabs';
import PalletsTable from './components/PalletsTable';
import VehiclesTable from './components/VehiclesTable';
import BusinessCargosTable from './components/BusinessCargosTable';
import { fetchActiveWarehouses, fetchWarehouseDetails, fetchAllCounts } from './api/bitrix';

export default function App() {
  const [warehouses, setWarehouses] = useState([]);
  const [activeWarehouseId, setActiveWarehouseId] = useState(null);
  const [counts, setCounts] = useState({});
  const [tablesData, setTablesData] = useState({ pallets: [], vehicles: [], businessCargos: [] });
  const [expandedSection, setExpandedSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function initApp() {
      try {
        setLoading(true);
        setError('');
        const activeWH = await fetchActiveWarehouses();
        setWarehouses(activeWH);
        if (activeWH.length > 0) {
          setActiveWarehouseId(activeWH[0].id);
          const allCounts = await fetchAllCounts(activeWH);
          setCounts(allCounts);
        } else {
          setError('No active warehouses were returned from Bitrix.');
        }
      } catch (err) {
        console.error('App init failed:', err);
        setError('Could not load Bitrix data. Please check the webhook/proxy configuration.');
      } finally {
        setLoading(false);
      }
    }
    initApp();
  }, []);

  useEffect(() => {
    if (!activeWarehouseId) return;
    async function loadDetails() {
      try {
        const details = await fetchWarehouseDetails(activeWarehouseId);
        setTablesData(details);
        setExpandedSection(null);
      } catch (err) {
        console.error('Failed to load warehouse details:', err);
        setTablesData({ pallets: [], vehicles: [], businessCargos: [] });
        setExpandedSection(null);
      }
    }
    loadDetails();
  }, [activeWarehouseId]);

  const activeWarehouse = warehouses.find((warehouse) => warehouse.id === activeWarehouseId);
  const visibleSections = [
    {
      key: 'pallets',
      count: tablesData.pallets.length,
      badgeClass: 'bg-[#1e75e6] hover:bg-blue-700',
      icon: '📦',
      label: 'All Pallets',
      content: <PalletsTable pallets={tablesData.pallets} />
    },
    {
      key: 'vehicles',
      count: tablesData.vehicles.length,
      badgeClass: 'bg-[#3cd271] hover:bg-green-600',
      icon: '🚚',
      label: 'All Vehicles',
      content: <VehiclesTable vehicles={tablesData.vehicles} />
    },
    {
      key: 'businessCargos',
      count: tablesData.businessCargos.length,
      badgeClass: 'bg-[#f0ad4e] hover:bg-[#dc8a27]',
      icon: '📋',
      label: 'Business Cargos',
      content: <BusinessCargosTable cargos={tablesData.businessCargos} />
    }
  ].filter((section) => section.count > 0);

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Loading...</div>;

  return (
    <div className="h-screen w-full bg-[#f8fafc] p-4 md:p-6 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 gap-4 min-h-0">
        <div className="flex-none px-1">
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            Warehouses & Vehicles <span className="text-amber-400 text-base"></span>
          </h1>
          {error && (
            <p className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </div>

        <div className="flex-none">
          <WarehouseTabs
            warehouses={warehouses}
            activeId={activeWarehouseId}
            onSelect={setActiveWarehouseId}
            counts={counts}
          />
        </div>

        {activeWarehouse && (
          <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col flex-1 min-h-0">
            <div className="flex justify-between items-center pb-3 border-b border-slate-150 flex-none">
              <div className="flex gap-3 items-center">
                <div className="w-12 h-12 text-slate-500 shrink-0">
                  <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,3 L2,9 L4,9 L4,20 L20,20 L20,9 L22,9 Z" />
                    <rect x="6" y="10.5" width="3" height="1.5" rx="0.3" fill="white" fillOpacity="0.4" />
                    <rect x="10.5" y="10.5" width="3" height="1.5" rx="0.3" fill="white" fillOpacity="0.4" />
                    <rect x="15" y="10.5" width="3" height="1.5" rx="0.3" fill="white" fillOpacity="0.4" />
                    <rect x="6" y="14" width="12" height="6" fill="#f8fafc" />
                    <line x1="7" y1="15.5" x2="17" y2="15.5" stroke="black" strokeWidth="0.6" strokeOpacity="0.15" />
                    <line x1="7" y1="17" x2="17" y2="17" stroke="black" strokeWidth="0.6" strokeOpacity="0.15" />
                    <line x1="7" y1="18.5" x2="17" y2="18.5" stroke="black" strokeWidth="0.6" strokeOpacity="0.15" />
                  </svg>
                </div>

                <div>
                  <h2 className="text-base font-bold text-slate-800 leading-snug">
                    {activeWarehouse.title}
                  </h2>
                  <p className="text-slate-400 text-xs mt-0.5">
                    {tablesData.pallets.length} pallets • {tablesData.vehicles.length} vehicles • {tablesData.businessCargos.length} business cargos
                  </p>
                </div>
              </div>
            </div>

            {visibleSections.length > 0 ? (
              <div className="flex flex-col flex-1 min-h-0 mt-4 overflow-auto pr-1">
                <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 items-stretch">
                  {visibleSections.map((section) => (
                    <div
                      key={section.key}
                      className={`flex min-w-0 flex-col min-h-0 transition-all duration-300 ${
                        expandedSection === null
                          ? 'lg:flex-1'
                          : expandedSection === 'businessCargos'
                            ? section.key === 'businessCargos'
                              ? 'lg:flex-1 lg:basis-full'
                              : 'lg:hidden'
                          : expandedSection === section.key
                            ? 'lg:basis-[58%]'
                            : 'lg:basis-[21%]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3 flex-none">
                        <button
                          type="button"
                          onClick={() => setExpandedSection((current) => current === section.key ? null : section.key)}
                          className={`flex flex-col items-center justify-center text-white w-20 h-20 rounded-xl shadow-sm transition-colors ${section.badgeClass}`}
                        >
                          <span className="text-base">{section.icon}</span>
                          <span className="text-[10px] opacity-90 text-center px-1 leading-tight whitespace-nowrap">{section.label}</span>
                          <span className="text-xs font-bold mt-0.5">{section.count}</span>
                        </button>

                        {expandedSection === section.key && (
                          <button
                            type="button"
                            onClick={() => setExpandedSection(null)}
                            className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1"
                          >
                            Close
                          </button>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 min-h-[320px] overflow-auto border border-slate-100 rounded-xl bg-white shadow-sm">
                        {section.content}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                No matching records found in this warehouse.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
