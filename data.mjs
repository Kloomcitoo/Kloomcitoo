// Contenido de los SVG. Edita aquí y vuelve a correr `node build.mjs`.

export const SECTIONS = [
  { id: 'about', n: '01', title: 'SYS.DIAGNOSTIC', sub: 'SOBRE MÍ · ABOUT ME' },
  { id: 'levels', n: '02', title: 'LEVEL SELECT', sub: 'PROYECTOS · PROJECTS' },
  { id: 'arsenal', n: '03', title: 'ARSENAL', sub: 'STACK TECNOLÓGICO · TECH STACK' },
  { id: 'style', n: '04', title: 'STYLE METER', sub: 'HABILIDADES · SKILLS' },
  { id: 'stats', n: '05', title: 'TELEMETRY', sub: 'ESTADÍSTICAS · GITHUB STATS' },
  { id: 'comms', n: '06', title: 'COMMS', sub: 'CONTACTO · CONTACT' },
];

// [tono, texto] — tono: info (ámbar) | error (rojo) | ok (cian)
export const DIAGNOSTIC = [
  ['info', 'RUNNING DIAGNOSTIC...'],
  ['info', 'FRONTEND MODULE ............ RESPONDING'],
  ['info', 'BACKEND MODULE ............. RESPONDING'],
  ['info', 'DATABASE LINK .............. STABLE'],
  ['info', 'WARNING: SIDE PROJECTS ABOVE SAFE LIMITS'],
  ['error', 'ERROR: SLEEP MODULE NOT RESPONDING'],
  ['error', 'INSUFFICIENT COFFEE.'],
  ['error', 'INSUFFICIENT COFFEE.'],
  ['info', 'REFUELING...'],
  ['ok', '-!- ALL SYSTEMS NOMINAL. READY TO SHIP -!-'],
];

export const PROJECTS = [
  {
    id: '1-1', level: '1-1', size: 'big', kind: 'FEATURED', status: 'LIVE',
    title: 'WOAP TOURNAMENT', url: 'woaptournament.com',
    tagline: 'PADEL TOURNAMENT MANAGEMENT PLATFORM',
    panel: 'BRACKET.VIEW', ill: 'bracket',
    stats: [['108', 'API ENDPOINTS'], ['15', 'DATA MODELS'], ['36', 'SCREENS'], ['5', 'TOURNAMENT STAGES']],
    chips: ['NestJS', 'Prisma', 'PostgreSQL', 'Supabase', 'Next.js 14', 'TypeScript', 'shadcn/ui', 'TanStack Query', 'Railway', 'Vercel'],
    alt: 'WOAP Tournament: plataforma de gestión de torneos de pádel. 108 endpoints, 15 modelos de datos, 36 pantallas. NestJS, Prisma, PostgreSQL, Next.js.',
  },
  {
    id: '1-2', level: '1-2', size: 'big', kind: 'FEATURED', status: 'LIVE',
    title: 'CONFECCIONES NAP', url: 'confeccionesnap.co',
    tagline: 'PAYROLL SYSTEM FOR A GARMENT WORKSHOP',
    panel: 'PAYROLL.VIEW', ill: 'payroll',
    stats: [['39', 'API ENDPOINTS'], ['9', 'SCREENS'], ['2', 'PAY PERIODS / MONTH'], ['PDF', 'PAYSLIP EXPORT']],
    chips: ['Express 5', 'Node.js', 'MySQL', 'JWT', 'React 19', 'Vite', 'Material UI', 'Tailwind CSS', 'jsPDF', 'Railway', 'Vercel'],
    alt: 'Confecciones NAP: sistema de nóminas por quincenas para un taller de confección. 39 endpoints, Express, MySQL, React.',
  },
  {
    id: '1-3', level: '1-3', size: 'small', kind: 'IN DEVELOPMENT', status: 'COMING SOON',
    title: 'PORTFOLIO 3D',
    tagline: 'PROCEDURAL SOLAR SYSTEM',
    panel: 'ORBIT.VIEW', ill: 'orbits',
    stats: [['33', 'GLSL SHADERS'], ['5', 'PLANETS'], ['3', 'QUALITY TIERS']],
    chips: ['Three.js', 'R3F', 'GLSL', 'GSAP', 'Zustand', 'Vite'],
    alt: 'Portafolio 3D: sistema solar procedural donde cada planeta es un proyecto. Three.js, React Three Fiber, shaders GLSL.',
  },
  {
    id: '1-4', level: '1-4', size: 'small', kind: 'PRIVATE LAB', status: 'PRIVATE',
    title: 'GESTOR DE GASTOS',
    tagline: 'NATIVE ANDROID BUDGET APP',
    panel: 'BUDGET.VIEW', ill: 'phone',
    stats: [['63', 'KOTLIN FILES'], ['6', 'SCREENS'], ['4', 'ROOM ENTITIES']],
    chips: ['Kotlin', 'Compose', 'Material 3', 'Room', 'Hilt', 'Coroutines'],
    alt: 'Gestor de gastos del hogar: app nativa Android en Kotlin con Jetpack Compose, Room y Hilt.',
  },
];

export const LANGUAGES = ['TYPESCRIPT', 'JAVASCRIPT', 'KOTLIN', 'SQL', 'GLSL'];

// El primer elemento de cada slot es el "arma principal"
export const ARSENAL = [
  { name: 'FRONTEND', items: ['React', 'Next.js', 'Vite', 'Tailwind CSS', 'shadcn/ui', 'Radix UI', 'Material UI', 'TanStack Query', 'React Hook Form', 'Zod'] },
  { name: 'BACKEND', items: ['NestJS', 'Node.js', 'Express', 'Passport + JWT', 'class-validator', 'Cron jobs', 'Rate limiting', 'Multer'] },
  { name: 'DATA', items: ['PostgreSQL', 'Prisma ORM', 'Supabase', 'MySQL', 'MariaDB', 'Room (SQLite)'] },
  { name: 'MOBILE', items: ['Kotlin', 'Jetpack Compose', 'Material 3', 'Hilt', 'Coroutines', 'DataStore', 'Navigation'] },
  { name: '3D / MOTION', items: ['Three.js', 'R3F', 'drei', 'GLSL', 'Postprocessing', 'GSAP', 'Zustand'] },
  { name: 'INFRA / QA', items: ['Railway', 'Vercel', 'Git / GitHub', 'Jest', 'Supertest', 'Playwright', 'ESLint', 'Prettier', 'jsPDF'] },
];

// [disciplina, rango (D C B A S SS SSS), nota]
export const SKILLS = [
  ['BACKEND / APIs', 'S', 'NestJS · Express · auth · REST'],
  ['FRONTEND / UI', 'S', 'React · Next.js · design systems'],
  ['DATABASES', 'A', 'PostgreSQL · MySQL · Prisma'],
  ['DEPLOY / CLOUD', 'B', 'Railway · Vercel · Supabase'],
  ['3D / WEBGL', 'B', 'Three.js · R3F · shaders'],
  ['MOBILE / ANDROID', 'C', 'Kotlin · Compose · Room'],
];
