# Módulo de Contabilidad - Especificación

## 1. Descripción
Sistema de registro de ingresos y egresos del Conjunto Palermo Manaza con saldo en tiempo real, visualización por mes y control de acceso por roles.

## 2. Modelos de Base de Datos (Prisma)

### Transaction (Transacción)
| Campo | Tipo | Descripción |
|-------|------|--------------|
| id | String | ID único (cuid) |
| type | TransactionType | INCOME / EXPENSE |
| category | TransactionCategory | Categoría de transacción |
| amount | Float | Monto |
| description | String | Descripción |
| reference | String? | Referencia (comprobante) |
| date | DateTime | Fecha de transacción |
| createdBy | String | Usuario que registró |
| createdAt | DateTime | Fecha de creación |
| updatedAt | DateTime | Fecha de actualización |

### TransactionCategory (Enum)
- INCOME: EXPENSE_HOUSE, EXPENSE_MAINTENANCE, EXPENSE_SERVICES, EXPENSE_SUPPLIES, EXPENSE_LAWYER, EXPENSE_OTHER
- EXPENSE: CONTRIBUTION, FINE, FEE, EVENT, OTHER

## 3. Roles y Permisos

| Rol | Ver Balance | Registrar Transacción | Editar | Eliminar |
|-----|-----------|-------------------|-------|---------|
| RESIDENT | ✅ Propia casa | ❌ | ❌ | ❌ |
| TREASURER | ✅ Global | ✅ | ✅ | ✅ |
| PRESIDENT | ✅ Global | ✅ | ✅ | ✅ |
| ADMIN | ✅ Global | ✅ | ✅ | ✅ |

**Nota:** Tesorero y Presidente también pueden ser residentes (tienen rol dual).

## 4. Funcionalidades UI

### Panel de Contabilidad
- **Saldo Actual:** Visual prominently displayed
- **Registro de Transacciones:** Tabla con filtros
- **Gráfico Mensual:** Ingresos vs Egresos por mes
- **Exportar:** Excel/PDF

### Filtros
- Por mes/año
- Por tipo (Ingreso/Egreso)
- Por categoría

## 5. API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api/accounting | Listar transacciones (con filtros) |
| POST | /api/accounting | Crear transacción |
| PUT | /api/accounting/[id] | Actualizar transacción |
| DELETE | /api/accounting/[id] | Eliminar transacción |
| GET | /api/accounting/balance | Obtener saldo actual |
| GET | /api/accounting/summary | Resumen mensual |

## 6. Notas
- Los residentes pueden ver el balance global del conjunto
- Solo tesorero/presidente/admin pueden crear/editar/eliminar transacciones
- Cada transacción debe tener categoría y descripción clara
- El saldo se calcula en tiempo real: total ingresos - total egresos