# 🔒 TRACKEALO — Guía de Seguridad para Desarrollo

> **Esta guía debe consultarse antes de cada cambio.** Todas las modificaciones futuras deben cumplir estas reglas.

---

## Arquitectura de Seguridad

```
┌─────────┐    anon key    ┌───────────┐
│ Browser  │ ─────────────→ │ Supabase  │
│ (React)  │    + JWT       │ (RLS)     │
└─────────┘                └───────────┘
     ↑                          ↑
     │                          │
  Frontend                  Backend
  (público)              (protegido por RLS)
```

- **anon key** = pública, visible en el browser. Seguridad via RLS.
- **service_role key** = privada. NUNCA en el frontend. Solo en funciones server-side.

---

## Reglas Obligatorias

### 1. 🔑 Secrets & API Keys

| ✅ Correcto | ❌ Prohibido |
|-------------|-------------|
| `import.meta.env.VITE_*` | Hardcodear keys en código |
| `.env.local` (gitignored) | Commitear `.env` a git |
| Solo `anon` key en frontend | `service_role` key en frontend |

**Antes de commitear:** `git diff --staged` → verificar que no haya tokens/keys.

### 2. 🛡️ Base de Datos (Supabase)

- **RLS siempre activo** en todas las tablas. Nunca desactivar.
- **Toda query debe filtrar por `user_id`** (defense-in-depth):
  ```js
  // ✅ CORRECTO
  supabase.from('transactions').delete()
    .eq('id', txId)
    .eq('user_id', userId);  // ← siempre incluir

  // ❌ PROHIBIDO
  supabase.from('transactions').delete()
    .eq('id', txId);  // ← falta user_id
  ```
- **Nueva tabla** → siempre agregar:
  1. `enable row level security`
  2. Policies para SELECT, INSERT, UPDATE, DELETE con `auth.uid() = user_id`
  3. CHECK constraints para validar datos

### 3. 🧱 Frontend (React/JSX)

- **Nunca usar:**
  - `dangerouslySetInnerHTML`
  - `innerHTML`
  - `eval()`
  - `document.write()`
  - `new Function()` con input de usuario
- **React auto-escapa JSX** → no inyectar HTML raw
- **Validar inputs** client-side Y server-side (CHECK constraints)

### 4. 📦 Dependencias

- **Antes de agregar un paquete:** `npm audit` para verificar 0 vulnerabilidades
- **Ejecutar `npm audit`** periódicamente
- **No usar paquetes desconocidos** o con pocos downloads
- **Mantener dependencias actualizadas:** `npm outdated` → `npm update`

### 5. 🔐 Autenticación

- **Passwords:** mínimo 6 caracteres (Supabase default), tipo `password` en inputs
- **Sesiones:** manejadas 100% por Supabase Auth (JWT automático)
- **No guardar passwords** en localStorage ni en variables
- **autoComplete** correcto en inputs de password

### 6. 🌐 URLs y Navegación

- **No usar `window.location` con input de usuario** (open redirect)
- **No construir URLs con datos del usuario** sin sanitizar
- **Links de descarga:** solo desde `URL.createObjectURL()` con datos propios

### 7. 📁 Archivos y Storage

- **Supabase Storage:** usar políticas de bucket privadas
- **Validar tipo y tamaño** de archivos antes de subir
- **Nunca servir archivos ejecutables** (.exe, .sh, .bat)

### 8. 🗓️ Fechas y Timezones

- **Siempre usar `toLocalDateString()`** para YYYY-MM-DD (no `toISOString()`)
- **Siempre usar `parseLocalDate()`** para parsear date strings
- **Nunca `new Date('2026-03-04')`** directo (se interpreta como UTC)

---

## Checklist Pre-Deploy

- [ ] `npm audit` → 0 vulnerabilities
- [ ] `npx eslint src/` → 0 errors
- [ ] `.env.local` en `.gitignore`
- [ ] Verificar que no haya secrets en `git log`
- [ ] RLS activo en todas las tablas (verificar en Supabase Dashboard)
- [ ] Correr todas las migraciones pendientes
- [ ] Email confirmation habilitado en Supabase Auth Settings
- [ ] Rate limiting configurado en Supabase Auth Settings

---

## Checklist por Feature Nueva

1. **¿Necesita nueva tabla?** → Agregar RLS + policies + constraints
2. **¿Tiene delete/update?** → Incluir `user_id` en el query
3. **¿Recibe input del usuario?** → Validar y sanitizar
4. **¿Usa fecha?** → Usar `toLocalDateString()` / `parseLocalDate()`
5. **¿Necesita nuevo paquete?** → `npm audit` después de instalar
6. **¿Muestra datos dinámicos?** → Verificar que React los escapa (no usar innerHTML)
7. **¿Maneja archivos?** → Validar tipo, tamaño, y permisos de storage
