import React, { useEffect, useRef, useState } from 'react';
import { ENTITY_TYPES } from '../api/bitrix';
import { parsePackagingDescription } from '../utils/packaging';

const BITRIX_BASE_URL = 'https://crm.americanglobalgroup.com';
const EMPTY_VALUE = '\u2014';

function getBitrixItemUrl(entityTypeId, itemId) {
  return `${BITRIX_BASE_URL}/crm/type/${entityTypeId}/details/${itemId}/`;
}

function cellStyle(width) {
  return {
    padding: '10px 12px',
    color: '#555',
    verticalAlign: 'top',
    minWidth: width,
    maxWidth: width,
    wordBreak: 'break-word',
    whiteSpace: 'normal',
    lineHeight: '1.45'
  };
}

function PackagingDetailsPopup({ description, onClose }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  const packages = parsePackagingDescription(description);
  const columns = [...new Set(packages.flatMap((item) => Object.keys(item)))];

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="packaging-details-title"
      onCancel={onClose}
      onClose={(event) => {
        if (!event.currentTarget.open) onClose();
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right ||
            event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
      }}
      className="m-auto max-h-[80vh] w-[1100px] max-w-[calc(100vw-32px)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-0 text-slate-800 shadow-2xl backdrop:bg-slate-900/30"
    >
      <div className="sticky top-0 flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4">
        <h3 id="packaging-details-title" className="text-base font-bold">Packaging Description</h3>
        <button
          type="button"
          autoFocus
          onClick={onClose}
          aria-label="Close packaging details"
          className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-blue-600"
        >
          &times;
        </button>
      </div>
      <div className="overflow-x-auto p-5">
        <table className="text-left text-sm" aria-label="Packaging details">
          <thead>
            <tr>
              {columns.map((label) => (
                <th key={label} scope="col" className="min-w-[120px] bg-slate-50 px-3 py-3 align-top font-semibold text-slate-500">{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {packages.map((item, index) => (
              <tr key={index}>
                {columns.map((label) => (
                  <td key={label} className="whitespace-pre-wrap break-words px-3 py-4 align-top leading-6">{item[label] || EMPTY_VALUE}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {packages.length === 0 && <p className="text-sm text-slate-500">No packaging details found</p>}
      </div>
    </dialog>
  );
}

export default function BusinessCargosTable({ cargos = [] }) {
  const [selectedCargo, setSelectedCargo] = useState(null);

  const handleCargoClick = (event, cargoId) => {
    event.preventDefault();
    const relativeUrl = `/crm/type/${ENTITY_TYPES.businessCargos}/details/${cargoId}/`;
    const absoluteUrl = getBitrixItemUrl(ENTITY_TYPES.businessCargos, cargoId);

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
        Business Cargos ({cargos.length})
      </h3>

      <div className="flex-1 min-w-0 overflow-auto min-h-0">
        <table style={{ width: '100%', minWidth: '1120px', borderCollapse: 'collapse', textAlign: 'left', tableLayout: 'fixed' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #f0f0f0', color: '#888', fontSize: '13px' }}>
              <th style={{ ...cellStyle('110px'), fontWeight: '600', color: '#888' }}>Cargo Description</th>
              <th style={{ ...cellStyle('90px'), fontWeight: '600', color: '#888' }}>Gross Weight</th>
              <th style={{ ...cellStyle('80px'), fontWeight: '600', color: '#888' }}>Volume</th>
              <th style={{ ...cellStyle('280px'), fontWeight: '600', color: '#888' }}>Packaging Description</th>
              <th style={{ ...cellStyle('120px'), fontWeight: '600', color: '#888' }}>Dangerous goods/Hazmat</th>
              <th style={{ ...cellStyle('110px'), fontWeight: '600', color: '#888' }}>Stackability</th>
              <th style={{ ...cellStyle('140px'), fontWeight: '600', color: '#888' }}>Temperature-controlled</th>
            </tr>
          </thead>
          <tbody>
            {cargos.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: '30px 8px', color: '#aaa', textAlign: 'center', fontSize: '14px' }}>
                  No business cargos found
                </td>
              </tr>
            ) : (
              cargos.map((cargo) => {
                const packageDescription = cargo.ufPackDesc || EMPTY_VALUE;

                return (
                  <tr key={cargo.id} style={{ borderBottom: '1px solid #f1f3f5', fontSize: '14px' }}>
                    <td style={cellStyle('110px')}>
                      <a
                        href={getBitrixItemUrl(ENTITY_TYPES.businessCargos, cargo.id)}
                        onClick={(event) => handleCargoClick(event, cargo.id)}
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
                        {cargo.title || `Cargo #${cargo.id}`}
                      </a>
                    </td>
                    <td style={cellStyle('90px')}>{cargo.ufGrossWeightString || EMPTY_VALUE}</td>
                    <td style={cellStyle('80px')}>{cargo.ufVolume || EMPTY_VALUE}</td>
                    <td style={cellStyle('280px')}>
                      <div className="flex items-start gap-2">
                        <span
                          style={{
                            display: 'inline-block',
                            maxWidth: '190px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {packageDescription}
                        </span>

                        {cargo.ufPackDesc && (
                          <button
                            type="button"
                            onClick={() => setSelectedCargo(cargo)}
                            aria-haspopup="dialog"
                            className="shrink-0 cursor-pointer text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            See more
                          </button>
                        )}
                      </div>
                    </td>
                    <td style={cellStyle('120px')}>{cargo.ufDangGoods || EMPTY_VALUE}</td>
                    <td style={cellStyle('110px')}>{cargo.ufStack || EMPTY_VALUE}</td>
                    <td style={cellStyle('140px')}>{cargo.ufSpecial || EMPTY_VALUE}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {selectedCargo && <PackagingDetailsPopup description={selectedCargo.ufPackDesc} onClose={() => setSelectedCargo(null)} />}
    </div>
  );
}
