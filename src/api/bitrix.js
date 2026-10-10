const DEFAULT_BITRIX_BASE_URL = '/local/app/pahest/api-bitrix/index.php?method=';
const BASE_URL = import.meta.env.VITE_BITRIX_BASE_URL || DEFAULT_BITRIX_BASE_URL;

const ENTITY_TYPES = {
  warehouses: 1110,
  vehicles: 1096,
  pallets: 1084,
  businessCargos: 1126,
  cargos: 1068
};

const ACTIVE_WAREHOUSE_STATUS_ID = 504;

const WAREHOUSE_RELATION_FIELDS = {
  vehicles: ['ufVehicles', 'UF_VEHICLES', 'ufVehicle'],
  pallets: ['ufPallets', 'UF_PALLETS', 'ufPallet'],
  businessCargos: ['ufBusinessCargos', 'UF_BUSINESS_CARGOS', 'ufBusinessCargo', 'UF_BUSINESS_CARGO', 'ufAddedBusinessCargos', 'UF_ADDED_BUSINESS_CARGOS']
};

const DISPLAY_FALLBACKS = {
  vehicles: 'Vehicle',
  pallets: 'Pallet',
  businessCargos: 'Cargo'
};

const FIELD_SELECTS = {
  vehicles: ['id', 'stageId', 'ufVin', 'ufBrand', 'ufModel', 'ufBodyType', 'ufFuel', 'ufVehLen'],
  pallets: ['id', 'stageId', 'ufPalletN', 'ufPalletType', 'ufUsCargos'],
  businessCargos: ['id', 'stageId', 'title', 'ufGrossWeightString', 'ufVolume', 'ufPackDesc', 'ufDangGoods', 'ufStack', 'ufSpecial']
};

const ENUM_FIELD_NAMES = {
  vehicles: ['ufBrand', 'ufBodyType', 'ufFuel'],
  pallets: ['ufPalletType'],
  businessCargos: ['ufDangGoods', 'ufStack', 'ufSpecial']
};

function encodeBitrixParams(params) {
  const searchParams = new URLSearchParams();

  function appendValue(prefix, value) {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      value.forEach((item) => appendValue(`${prefix}[]`, item));
      return;
    }

    if (typeof value === 'object') {
      Object.entries(value).forEach(([key, nestedValue]) => {
        appendValue(`${prefix}[${key}]`, nestedValue);
      });
      return;
    }

    searchParams.append(prefix, String(value));
  }

  Object.entries(params).forEach(([key, value]) => appendValue(key, value));
  return searchParams.toString();
}

function extractBitrixItemId(value) {
  if (value === undefined || value === null || value === '') return null;

  if (typeof value === 'object') {
    return extractBitrixItemId(
      value.id ??
      value.ID ??
      value.itemId ??
      value.ITEM_ID ??
      value.value ??
      value.VALUE ??
      value.entityId ??
      value.ENTITY_ID
    );
  }

  const raw = String(value);
  const match = raw.match(/(\d+)(?!.*\d)/);
  return match ? match[1] : raw;
}

function uniqueIds(values = []) {
  return [...new Set(values.map(extractBitrixItemId).filter(Boolean))];
}

function normalizeRelationIds(value) {
  if (!value) return [];
  return uniqueIds(Array.isArray(value) ? value : [value]);
}

function getRelationIdsFromFields(item, fieldNames) {
  const names = Array.isArray(fieldNames) ? fieldNames : [fieldNames];
  return uniqueIds(
    names.flatMap((fieldName) => {
      const value = item[fieldName];
      if (!value) return [];
      return Array.isArray(value) ? value : [value];
    })
  );
}

function getBusinessCargoFieldNames(item) {
  return Object.keys(item).filter((key) => {
    const normalizedKey = key.toLowerCase();
    return normalizedKey.includes('business') && normalizedKey.includes('cargo');
  });
}

function chunkArray(items, size) {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

async function bitrixRequest(method, payload) {
  const requestUrl = BASE_URL.includes('?method=')
    ? `${BASE_URL}${encodeURIComponent(method)}`
    : `${BASE_URL.endsWith('/') ? BASE_URL : `${BASE_URL}/`}${method}.json`;

  const response = await fetch(requestUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body: encodeBitrixParams(payload)
  });

  const raw = await response.text();

  if (!response.ok) {
    throw new Error(`Bitrix ${method} failed (${response.status}): ${raw.slice(0, 300)}`);
  }

  let data;
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    throw new Error(`Bitrix ${method} returned invalid JSON: ${raw.slice(0, 300)}`);
  }

  if (data.error) {
    throw new Error(`Bitrix ${method} error: ${data.error_description || data.error}`);
  }

  return data;
}

async function fetchItemsByIds(entityTypeId, ids, select) {
  const normalizedIds = uniqueIds(ids);
  if (normalizedIds.length === 0) return [];

  const responses = await Promise.all(
    chunkArray(normalizedIds, 50).map((chunk) =>
      bitrixRequest('crm.item.list', {
        entityTypeId,
        filter: { '=id': chunk },
        select,
        navigation: { size: 50 }
      })
    )
  );

  return responses.flatMap((response) => response.result?.items || []);
}

async function fetchEnumMaps(entityTypeId, fieldNames) {
  if (!fieldNames?.length) return {};

  try {
    const response = await bitrixRequest('crm.item.fields', { entityTypeId });
    const fields = response.result?.fields || response.result || {};

    return fieldNames.reduce((acc, fieldName) => {
      const field = fields[fieldName];
      const options = field?.items || field?.values || [];
      const map = {};

      options.forEach((option) => {
        const id = String(option.ID ?? option.id ?? option.VALUE ?? option.value ?? '');
        const label = option.VALUE ?? option.value ?? option.NAME ?? option.name ?? '';

        if (id && label) {
          map[id] = label;
        }
      });

      acc[fieldName] = map;
      return acc;
    }, {});
  } catch (error) {
    console.warn(`Could not load field metadata for entity ${entityTypeId}:`, error);
    return {};
  }
}

function resolveEnumValue(value, dictionary = {}) {
  if (value === undefined || value === null || value === '') return '—';

  if (Array.isArray(value)) {
    const resolved = value
      .map((entry) => resolveEnumValue(entry, dictionary))
      .filter((entry) => entry && entry !== '—');
    return resolved.length ? resolved.join(', ') : '—';
  }

  const directKey = String(value);
  return dictionary[directKey] || value;
}

function mapVehicle(item, enumMaps) {
  return {
    id: item.id,
    ufVin: item.ufVin || '',
    ufBrand: resolveEnumValue(item.ufBrand, enumMaps.ufBrand),
    ufModel: item.ufModel || '',
    ufBodyType: resolveEnumValue(item.ufBodyType, enumMaps.ufBodyType),
    ufFuel: resolveEnumValue(item.ufFuel, enumMaps.ufFuel),
    ufVehLen: item.ufVehLen ?? ''
  };
}

async function enrichPalletCargos(pallets) {
  const cargoIds = uniqueIds(
    pallets.flatMap((pallet) => {
      if (!pallet.ufUsCargos) return [];
      return Array.isArray(pallet.ufUsCargos) ? pallet.ufUsCargos : [pallet.ufUsCargos];
    })
  );

  if (cargoIds.length === 0) {
    return pallets.map((pallet) => ({ ...pallet, cargosList: [] }));
  }

  try {
    const cargoItems = await fetchItemsByIds(ENTITY_TYPES.cargos, cargoIds, ['id', 'title']);
    const cargoMap = Object.fromEntries(
      cargoItems.map((cargo) => [String(cargo.id), cargo.title || `Cargo #${cargo.id}`])
    );

    return pallets.map((pallet) => {
      const relatedIds = normalizeRelationIds(pallet.ufUsCargos);

      return {
        ...pallet,
        cargosList: relatedIds.map((id) => ({
          id,
          title: cargoMap[id] || `Cargo #${id}`
        }))
      };
    });
  } catch (error) {
    console.error('Cargo load error:', error);
    return pallets.map((pallet) => ({ ...pallet, cargosList: [] }));
  }
}

async function fetchWarehouseRelations(warehouseId) {
  const response = await bitrixRequest('crm.item.get', {
    entityTypeId: ENTITY_TYPES.warehouses,
    id: Number(warehouseId)
  });

  const item = response.result?.item || {};
  return {
    item,
    relatedIds: {
      vehicles: getRelationIdsFromFields(item, WAREHOUSE_RELATION_FIELDS.vehicles),
      pallets: getRelationIdsFromFields(item, WAREHOUSE_RELATION_FIELDS.pallets),
      businessCargos: getRelationIdsFromFields(item, [
        ...WAREHOUSE_RELATION_FIELDS.businessCargos,
        ...getBusinessCargoFieldNames(item)
      ])
    }
  };
}

async function fetchVehicles(vehicleIds) {
  const [items, enumMaps] = await Promise.all([
    fetchItemsByIds(ENTITY_TYPES.vehicles, vehicleIds, FIELD_SELECTS.vehicles),
    fetchEnumMaps(ENTITY_TYPES.vehicles, ENUM_FIELD_NAMES.vehicles)
  ]);

  return items.map((item) => mapVehicle(item, enumMaps));
}

async function fetchPallets(palletIds) {
  const [items, enumMaps] = await Promise.all([
    fetchItemsByIds(ENTITY_TYPES.pallets, palletIds, FIELD_SELECTS.pallets),
    fetchEnumMaps(ENTITY_TYPES.pallets, ENUM_FIELD_NAMES.pallets)
  ]);

  const mapped = items.map((item) => ({
      id: item.id,
      ufPalletN: item.ufPalletN || '',
      ufPalletType: resolveEnumValue(item.ufPalletType, enumMaps.ufPalletType),
      ufUsCargos: item.ufUsCargos
    }));

  return enrichPalletCargos(mapped);
}

async function fetchBusinessCargos(cargoIds) {
  const [items, enumMaps] = await Promise.all([
    fetchItemsByIds(ENTITY_TYPES.businessCargos, cargoIds, FIELD_SELECTS.businessCargos),
    fetchEnumMaps(ENTITY_TYPES.businessCargos, ENUM_FIELD_NAMES.businessCargos)
  ]);

  return items.map((item) => ({
      id: item.id,
      title: item.title || '',
      ufGrossWeightString: item.ufGrossWeightString || '',
      ufVolume: item.ufVolume || '',
      ufPackDesc: item.ufPackDesc || '',
      ufDangGoods: resolveEnumValue(item.ufDangGoods, enumMaps.ufDangGoods),
      ufStack: resolveEnumValue(item.ufStack, enumMaps.ufStack),
      ufSpecial: resolveEnumValue(item.ufSpecial, enumMaps.ufSpecial)
    }));
}

export async function fetchActiveWarehouses() {
  const data = await bitrixRequest('crm.item.list', {
    entityTypeId: ENTITY_TYPES.warehouses,
    filter: { '=ufStatus': ACTIVE_WAREHOUSE_STATUS_ID },
    select: ['id', 'title'],
    order: { id: 'asc' }
  });

  return (data.result?.items || []).map((item) => ({
    id: item.id,
    title: item.title || `Warehouse #${item.id}`
  }));
}

export async function fetchWarehouseDetails(warehouseId) {
  const { relatedIds } = await fetchWarehouseRelations(warehouseId);

  const [vehicles, pallets, businessCargos] = await Promise.all([
    fetchVehicles(relatedIds.vehicles),
    fetchPallets(relatedIds.pallets),
    fetchBusinessCargos(relatedIds.businessCargos)
  ]);

  return { vehicles, pallets, businessCargos };
}

export async function fetchAllCounts(warehouses) {
  const counts = {};

  await Promise.allSettled(
    warehouses.map(async (warehouse) => {
      try {
        const details = await fetchWarehouseDetails(warehouse.id);
        counts[warehouse.id] = {
          vehicles: details.vehicles.length,
          pallets: details.pallets.length,
          businessCargos: details.businessCargos.length
        };
      } catch (error) {
        console.error(`Count load failed for warehouse ${warehouse.id}:`, error);
        counts[warehouse.id] = { vehicles: 0, pallets: 0, businessCargos: 0 };
      }
    })
  );

  return counts;
}

export { DISPLAY_FALLBACKS, ENTITY_TYPES };
