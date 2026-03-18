# Trackealo API v1

Base URL: `/api/v1`

Todos los endpoints requieren autenticación via API key en el header:

```
Authorization: Bearer <API_KEY>
```

---

## Transacciones

### `GET /api/v1/transactions`

Lista las transacciones del usuario autenticado.

**Query params (todos opcionales):**

| Parámetro    | Tipo     | Descripción                          |
|--------------|----------|--------------------------------------|
| `accountId`  | `number` | Filtrar por cuenta                   |
| `categoryId` | `number` | Filtrar por categoría                |
| `type`       | `string` | `income` \| `expense` \| `transfer` |
| `fromDate`   | `string` | Fecha desde (ISO 8601)               |
| `toDate`     | `string` | Fecha hasta (ISO 8601)               |
| `search`     | `string` | Búsqueda por texto                   |

**Respuesta:** `200` array de transacciones.

---

### `POST /api/v1/transactions`

Crea una nueva transacción.

**Body:**

| Campo           | Tipo     | Requerido | Descripción                                            |
|-----------------|----------|-----------|--------------------------------------------------------|
| `account_id`    | `number` | Sí        | ID de la cuenta origen                                 |
| `amount`        | `number` | Sí        | Monto (positivo)                                       |
| `type`          | `string` | Sí        | `income` \| `expense` \| `transfer`                  |
| `description`   | `string` | Sí        | Mínimo 2 caracteres                                    |
| `date`          | `string` | Sí        | Fecha (ISO 8601)                                       |
| `category_id`   | `number` | No        | ID de categoría                                        |
| `notes`         | `string` | No        | Notas adicionales                                      |
| `to_account_id` | `number` | No        | ID de cuenta destino (solo en `transfer`)              |
| `to_amount`     | `number` | No        | Monto que entra en la cuenta destino (cross-currency) |

> En transferencias entre cuentas de distinta moneda se crean 2 registros: uno de egreso y uno de ingreso.

**Respuesta:** `201` transacción creada.

---

### `GET /api/v1/transactions/:id`

Obtiene una transacción por ID.

**Respuesta:** `200` transacción | `404` no encontrada.

---

## Cuentas

### `GET /api/v1/accounts`

Lista las cuentas del usuario autenticado.

**Respuesta:** `200` array de cuentas.

---

### `POST /api/v1/accounts`

Crea una nueva cuenta.

**Body:**

| Campo      | Tipo     | Requerido | Descripción                                     |
|------------|----------|-----------|-------------------------------------------------|
| `name`     | `string` | Sí        | Mínimo 2 caracteres                             |
| `type`     | `string` | Sí        | `checking` \| `savings` \| `credit` \| `cash` |
| `balance`  | `number` | No        | Saldo inicial (default `0`)                     |
| `currency` | `string` | No        | Moneda (default `ARS`)                          |
| `color`    | `string` | No        | Color en hex                                    |

**Respuesta:** `201` cuenta creada.

---

### `GET /api/v1/accounts/:id`

Obtiene una cuenta por ID.

**Respuesta:** `200` cuenta | `404` no encontrada.

---

## Categorías

### `GET /api/v1/categories`

Lista las categorías del usuario autenticado.

**Respuesta:** `200` array de categorías.

---

### `POST /api/v1/categories`

Crea una nueva categoría.

**Body:**

| Campo   | Tipo     | Requerido | Descripción         |
|---------|----------|-----------|---------------------|
| `name`  | `string` | Sí        | Mínimo 2 caracteres |
| `icon`  | `string` | No        | Nombre del ícono    |
| `color` | `string` | No        | Color en hex        |

**Respuesta:** `201` categoría creada.

---

### `GET /api/v1/categories/:id`

Obtiene una categoría por ID.

**Respuesta:** `200` categoría | `404` no encontrada.

---

## Errores comunes

| Código | Descripción                  |
|--------|------------------------------|
| `400`  | Datos o parámetros inválidos |
| `401`  | API key inválida o ausente   |
| `404`  | Recurso no encontrado        |
