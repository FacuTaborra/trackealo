# Configuración de Supabase para ExpenseTracker

## 1. Crear cuenta y proyecto en Supabase

1. Andá a [supabase.com](https://supabase.com) y creá una cuenta (gratis)
2. Hacé clic en **New Project**
3. Elegí un nombre (ej: `expense-tracker`)
4. Elegí una contraseña para la base de datos (anotala)
5. Elegí la región más cercana: **South America (São Paulo)**
6. Clic en **Create new project** y esperá ~2 minutos

## 2. Obtener las claves

Una vez creado el proyecto:
1. Andá a **Settings → API** (en el menú lateral)
2. Copiá estos dos valores:
   - **Project URL** → se ve como `https://xxxxx.supabase.co`
   - **anon public key** → es un JWT largo (empieza con `eyJ...`)

## 3. Crear el archivo .env.local

En la raíz del proyecto, creá un archivo `.env.local` con:

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJtu-clave-aqui...
```

## 4. Crear las tablas en Supabase

Andá a **SQL Editor** en Supabase y ejecutá el SQL que está en `supabase/schema.sql`.

## 5. Deploy a Vercel

1. Subí el proyecto a GitHub
2. Andá a [vercel.com](https://vercel.com) y conectá tu repo
3. En **Environment Variables**, agregá:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy automático!
