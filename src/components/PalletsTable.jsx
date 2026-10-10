import React from 'react';
import { ENTITY_TYPES } from '../api/bitrix';

const BITRIX_BASE_URL = 'https://crm.americanglobalgroup.com';

function getBitrixItemUrl(entityTypeId, itemId) {
  return `${BITRIX_BASE_URL}/crm/type/${entityTypeId}/details/${itemId}/`;
}

export default function PalletsTable({ pallets = [] }) {
  const handlePalletClick = (event, palletId) => {
    event.preventDefault();
    const relativeUrl = `/crm/type/${ENTITY_TYPES.pallets}/details/${palletId}/`;
    const absoluteUrl = getBitrixItemUrl(ENTITY_TYPES.pallets, palletId);

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

  const handleCargoClick = (event, cargoId) => {
    event.preventDefault();
    const relativeUrl = `/crm/type/${ENTITY_TYPES.cargos}/details/${cargoId}/`;
    const absoluteUrl = getBitrixItemUrl(ENTITY_TYPES.cargos, cargoId);

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
    <div className="w-full h-full flex flex-col bg-white p-4">
      <h3 className="text-base font-bold text-slate-800 mb-3 flex-none">
        Pallets in Warehouse ({pallets.length})
      </h3>

      <div className="flex-1 overflow-auto min-h-0">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #f0f0f0', color: '#888', fontSize: '13px' }}>
              <th style={{ padding: '10px 8px', fontWeight: '600' }}>Pallet #</th>
              <th style={{ padding: '10px 8px', fontWeight: '600' }}>Pallet Type</th>
              <th style={{ padding: '10px 8px', fontWeight: '600' }}>Added Cargo</th>
            </tr>
          </thead>
          <tbody>
            {pallets.length === 0 ? (
              <tr>
                <td colSpan="3" style={{ padding: '30px 8px', color: '#aaa', textAlign: 'center', fontSize: '14px' }}>
                  No pallets found
                </td>
              </tr>
            ) : (
              pallets.map((pallet) => (
                <tr key={pallet.id} style={{ borderBottom: '1px solid #f9f9f9', fontSize: '14px' }}>
                  <td style={{ padding: '10px 8px' }}>
                    <a
                      href={getBitrixItemUrl(ENTITY_TYPES.pallets, pallet.id)}
                      onClick={(event) => handlePalletClick(event, pallet.id)}
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
                      {pallet.ufPalletN || `Pallet #${pallet.id}`}
                    </a>
                  </td>
                  <td style={{ padding: '10px 8px', color: '#555' }}>{pallet.ufPalletType || '—'}</td>
                  <td style={{ padding: '10px 8px' }}>
                    {pallet.cargosList && pallet.cargosList.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {pallet.cargosList.map((cargo) => (
                          <a
                            key={cargo.id}
                            href={getBitrixItemUrl(ENTITY_TYPES.cargos, cargo.id)}
                            onClick={(event) => handleCargoClick(event, cargo.id)}
                            style={{
                              background: '#e3f2fd',
                              color: '#0d47a1',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '500',
                              textDecoration: 'none',
                              cursor: 'pointer',
                              display: 'inline-block',
                              transition: 'background 0.2s'
                            }}
                            onMouseEnter={(event) => {
                              event.target.style.background = '#bbdefb';
                              event.target.style.textDecoration = 'underline';
                            }}
                            onMouseLeave={(event) => {
                              event.target.style.background = '#e3f2fd';
                              event.target.style.textDecoration = 'none';
                            }}
                          >
                            {cargo.title || `Cargo #${cargo.id}`}
                          </a>
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: '#aaa' }}>—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
