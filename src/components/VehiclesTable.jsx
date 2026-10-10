import React from 'react';
import { ENTITY_TYPES } from '../api/bitrix';

const BITRIX_BASE_URL = 'https://crm.americanglobalgroup.com';

function getBitrixItemUrl(entityTypeId, itemId) {
  return `${BITRIX_BASE_URL}/crm/type/${entityTypeId}/details/${itemId}/`;
}

export default function VehiclesTable({ vehicles = [] }) {
  const handleRowClick = (event, vehicleId) => {
    event.preventDefault();
    const relativeUrl = `/crm/type/${ENTITY_TYPES.vehicles}/details/${vehicleId}/`;
    const absoluteUrl = getBitrixItemUrl(ENTITY_TYPES.vehicles, vehicleId);

    try {
      if (window.top?.BX?.SidePanel) {
        window.top.BX.SidePanel.Instance.open(relativeUrl);
        return;
      }
    } catch {
      // Fallback to the absolute Bitrix URL outside the CRM iframe.
    }

    window.open(absoluteUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-full h-full min-w-0 flex flex-col bg-white p-4">
      <h3 className="text-base font-bold text-slate-800 mb-3 flex-none">
        Vehicles in Warehouse ({vehicles.length})
      </h3>
      <div className="flex-1 min-w-0 overflow-y-scroll overflow-x-auto min-h-0">
        <table style={{ width: '100%', minWidth: '760px', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #f0f0f0', color: '#888', fontSize: '14px' }}>
            <th style={{ padding: '12px 8px' }}>Vin Code</th>
            <th style={{ padding: '12px 8px' }}>Make</th>
            <th style={{ padding: '12px 8px' }}>Model</th>
            <th style={{ padding: '12px 8px' }}>Body Type</th>
            <th style={{ padding: '12px 8px' }}>Fuel</th>
            <th style={{ padding: '12px 8px' }}>Length (inch)</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ padding: '20px 8px', color: '#aaa', textAlign: 'center' }}>
                no cars in this warehouse
              </td>
            </tr>
          ) : (
            vehicles.map((vehicle) => (
              <tr key={vehicle.id} style={{ borderBottom: '1px solid #f9f9f9', fontSize: '15px' }}>
                <td style={{ padding: '12px 8px' }}>
                  <a
                    href={getBitrixItemUrl(ENTITY_TYPES.vehicles, vehicle.id)}
                    onClick={(event) => handleRowClick(event, vehicle.id)}
                    style={{
                      color: '#007bff',
                      fontWeight: 'bold',
                      textDecoration: 'none',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(event) => {
                      event.target.style.textDecoration = 'underline';
                    }}
                    onMouseLeave={(event) => {
                      event.target.style.textDecoration = 'none';
                    }}
                  >
                    {vehicle.ufVin || `Vehicle #${vehicle.id}`}
                  </a>
                </td>
                <td style={{ padding: '12px 8px', color: '#555' }}>{vehicle.ufBrand || '—'}</td>
                <td style={{ padding: '12px 8px', color: '#555' }}>{vehicle.ufModel || '—'}</td>
                <td style={{ padding: '12px 8px', color: '#555' }}>{vehicle.ufBodyType || '—'}</td>
                <td style={{ padding: '12px 8px', color: '#555' }}>{vehicle.ufFuel || '—'}</td>
                <td style={{ padding: '12px 8px', color: '#555' }}>{vehicle.ufVehLen || '—'}</td>
              </tr>
            ))
          )}
        </tbody>
        </table>
      </div>
    </div>
  );
}
