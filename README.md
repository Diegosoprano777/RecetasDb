# 🌴 RecetasDB — Dashboard Caribeño de Recetas

> Aplicación Angular 22 que conecta con **TheMealDB API** para explorar, buscar y guardar recetas tradicionales con interfaz en español y estética caribeña premium.

[![Angular](https://img.shields.io/badge/Angular-22-dd1b16?logo=angular)](https://angular.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178c6?logo=typescript)](https://typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-22.22.3-339933?logo=nodedotjs)](https://nodejs.org)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-black?logo=vercel)](https://vercel.com)

---

## 🚀 Demo en vivo

🔗 **[Ver aplicación en Vercel](https://recetas-db.vercel.app)**  
📦 **[Repositorio GitHub](https://github.com/Diegosoprano777/RecetasDb)**

---

## ✨ Características

| Feature | Descripción |
|---|---|
| 🌴 **Tema Caribeño** | Paleta Arena · Papaya · Turquesa · Cacao con Glassmorphism |
| 🔍 **Búsqueda en tiempo real** | Angular Signals + debounce 350ms, filtrado instantáneo |
| 🌐 **Todo en español** | Diccionario local de +200 términos culinarios + MyMemory API fallback |
| ❤️ **Favoritos persistentes** | `FavoritesService` con Angular Signals + `localStorage` automático |
| 📄 **Pasos numerados** | Instrucciones divididas en pasos con UI premium |
| 💀 **Skeleton loaders** | Estados de carga elegantes mientras llega la data |
| 🌙 **Dark Mode** | Automático via `prefers-color-scheme` |
| 📺 **Video tutoriales** | Link directo a YouTube para cada receta |
| 📱 **Responsive** | Grid adaptable desde móvil a 4K |

---

## 🗂️ Estructura del Proyecto

```
src/
└── app/
    ├── components/
    │   ├── header/          → Navbar con badge de favoritos en tiempo real
    │   ├── footer/          → Footer caribeño con info del proyecto
    │   └── home/            → Receta del día + Recomendaciones del Chef
    ├── pages/
    │   ├── search/          → Búsqueda con chips por categoría y Signals
    │   ├── favorites/       → Lista de favoritos guardados
    │   ├── details/         → Vista completa: ingredientes + pasos + video
    │   └── not-found/       → Página 404 caribeña animada
    └── core/
        ├── services/
        │   ├── recipe.service.ts       → API TheMealDB (búsqueda, detalle, categoría)
        │   ├── translation.service.ts  → Diccionario local + MyMemory API
        │   └── favorites.service.ts    → Signals + LocalStorage automático
        └── interceptors/
            └── api.interceptor.ts      → Prefijo de URL y manejo de errores HTTP
```

---

## 🛣️ Rutas

| Ruta | Componente | Descripción |
|---|---|---|
| `/` | → redirect | Redirige a `/home` |
| `/home` | `Home` | Receta del día + 3 recomendaciones aleatorias |
| `/search` | `Search` | Búsqueda en tiempo real por nombre o categoría |
| `/favorites` | `Favorites` | Recetas guardadas en localStorage |
| `/details/:id` | `Details` | Detalle completo: pasos, ingredientes, video |
| `**` | `NotFound` | Página 404 caribeña con bote animado |

---

## 🏗️ Tecnologías

- **[Angular 22](https://angular.dev)** — Framework principal con Control Flow moderno (`@for`, `@if`)
- **[Angular Signals](https://angular.dev/guide/signals)** — Estado reactivo sin RxJS en componentes
- **[RxJS](https://rxjs.dev)** — `forkJoin`, `switchMap`, `effect()` para operaciones asíncronas
- **[TheMealDB API](https://themealdb.com/api.php)** — Base de datos gratuita de recetas
- **[MyMemory API](https://mymemory.translated.net)** — Traducción automática inglés → español
- **TypeScript 6.0** — Tipado estricto, interfaces `Recipe`, `Meal`, `MealResponse`
- **CSS Vanilla** — Variables CSS, Grid, Flexbox, animaciones `@keyframes`

---

## ⚙️ Instalación local

```bash
# 1. Clonar el repositorio
git clone https://github.com/Diegosoprano777/RecetasDb.git
cd RecetasDb

# 2. Instalar dependencias
npm install

# 3. Ejecutar en modo desarrollo
npm start
# → http://localhost:4200
```

> **Requisito:** Node.js `v22.22.3+` (Angular 22 lo requiere)

---

## 🌐 Variables de entorno

```typescript
// src/environments/environment.ts (producción)
export const environment = {
  production: true,
  apiUrl: 'https://www.themealdb.com/api/json/v1/1'
};

// src/environments/environment.development.ts
export const environment = {
  production: false,
  apiUrl: 'https://www.themealdb.com/api/json/v1/1'
};
```

---

## 📦 Build de producción

```bash
npm run build
# → dist/recetas-DB/
```

---

## 🗓️ Historial de desarrollo (8 días)

| Día | Módulo | Logros |
|---|---|---|
| 1 | Setup + CI/CD | GitHub + Vercel configurados, deploy automático |
| 2 | Conexión Core | Environments, interceptor HTTP, RecipeService |
| 3 | Enrutamiento | 6 rutas, Navbar con RouterLink, página 404 |
| 4 | Home + Tarjetas | `@for`/`@if`, Grid responsivo, tarjetas con imagen |
| 5 | Buscador + Signals | Búsqueda en tiempo real, debounce, estado vacío |
| 6 | Detalles `/details/:id` | Pasos numerados, ingredientes en grid, YouTube |
| 7 | Favoritos + localStorage | `FavoritesService` con Angular Signals, persistencia |
| 8 | Pulido + Dark Mode | Skeletons, animaciones, Dark Mode, README |

---

## 👨‍💻 Autor

**Diego Soprano** · [GitHub @Diegosoprano777](https://github.com/Diegosoprano777)

---

*Desarrollado con 🌴 y mucho sabor caribeño usando Angular 22*
