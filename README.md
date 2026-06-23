# Livre d'Or de Départ à la Retraite

Application web minimaliste permettant à plusieurs collègues de laisser des messages de félicitations via un lien partagé.

## Stack technique

- **Frontend** : Next.js 16 (App Router) + Tailwind CSS
- **Backend** : API Routes Next.js
- **Base de données** : Supabase (PostgreSQL)
- **Déploiement** : Cloudflare Workers (OpenNext)

## Fonctionnalités

- Page d'accueil avec photo, introduction et compteur de messages
- Formulaire de message (nom, texte, photo, signature, emoji)
- Mur de messages trié du plus récent au plus ancien
- Administration protégée par mot de passe (consultation, suppression, exports CSV/PDF)
- Livre souvenir PDF imprimable (bonus)
- Protection anti-spam (honeypot + limitation par IP)

---

## Installation locale

### 1. Cloner et installer

```bash
git clone <votre-repo>
cd wishcards
npm install
```

### 2. Configurer Supabase

1. Créez un projet sur [supabase.com](https://supabase.com)
2. **SQL Editor** → exécutez `sql/schema.supabase.sql`
3. **Project Settings → API** → copiez l'URL et la clé secrète (`service_role` ou `secret`)

### 3. Variables d'environnement

```bash
cp .env.example .env.local
```

Remplissez dans `.env.local` :

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SECRET_KEY=sb_secret_...
```

### 4. Lancer en développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000).

Pour tester dans le runtime Cloudflare Workers en local :

```bash
npm run preview
```

---

## Variables d'environnement

| Variable | Obligatoire | Description |
|----------|-------------|-------------|
| `SUPABASE_URL` | Oui | URL du projet Supabase |
| `SUPABASE_SECRET_KEY` | Oui | Clé secrète serveur (Settings → API) |
| `ADMIN_PASSWORD` | Oui | Mot de passe du panneau `/admin` |
| `ADMIN_SESSION_SECRET` | Oui | Clé secrète (min. 16 caractères) pour signer les sessions admin |
| `RATE_LIMIT_SECRET` | Oui | Clé secrète pour hasher les IP (anti-spam) |
| `NEXT_PUBLIC_SITE_TITLE` | Non | Titre du site |
| `NEXT_PUBLIC_RETIREE_NAME` | Non | Prénom/nom de la collègue |
| `NEXT_PUBLIC_RETIREE_PHOTO` | Non | URL de la photo de la collègue |
| `NEXT_PUBLIC_INTRO_TEXT` | Non | Texte d'introduction personnalisé |

Générer des secrets :

```bash
openssl rand -hex 32
```

---

## Déploiement sur Cloudflare

### Prérequis

- Un compte [Cloudflare](https://dash.cloudflare.com)
- Un projet [Supabase](https://supabase.com) avec les tables créées
- Wrangler CLI (inclus en devDependency)

### 1. Configurer les secrets Cloudflare

```bash
npx wrangler login
npx wrangler secret put SUPABASE_SECRET_KEY
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put ADMIN_SESSION_SECRET
npx wrangler secret put RATE_LIMIT_SECRET
```

Mettez à jour `SUPABASE_URL` dans `wrangler.jsonc` → section `vars`.

### 2. Déployer

**Via la ligne de commande :**

```bash
npm run deploy
```

**Via Git + GitHub Actions (CI/CD Cloudflare) :**

1. Ajoutez ces secrets dans GitHub (**Settings → Secrets → Actions**) :
   - `CLOUDFLARE_API_TOKEN` — token API Cloudflare (permission Workers Edit)
   - `CLOUDFLARE_ACCOUNT_ID` — ID de votre compte Cloudflare
2. Chaque push sur `main` déclenche `.github/workflows/cloudflare-deploy.yml`

**Via Git + Dashboard Cloudflare :**

1. Poussez le code sur GitHub ou GitLab
2. Cloudflare → **Workers & Pages → Create → Connect to Git**
3. Configuration du build :
   - **Build command** : `npm run build`
   - **Deploy command** : `npm run deploy`
4. Ajoutez les secrets via `wrangler secret put` ou le dashboard

### 3. Partager le lien

Votre application sera accessible sur `https://wishcards.<votre-compte>.workers.dev` ou sur votre domaine personnalisé.

L'accès admin : `/admin`

### 4. Domaine personnalisé (optionnel)

Dans **Workers & Pages → votre Worker → Settings → Domains & Routes**, ajoutez votre domaine (ex. `livre-or.votre-entreprise.fr`).

---

## Architecture Cloudflare

```
Utilisateur → Cloudflare CDN → Worker (OpenNext/Next.js)
                                    ↓
                              Supabase (PostgreSQL)
```

- **OpenNext** : adapte Next.js pour Cloudflare Workers
- **Supabase** : base de données + interface Table Editor pour voir les messages
- **Wrangler** : déploiement et secrets

---

## Personnalisation

| Élément | Fichier / variable |
|---------|-------------------|
| Couleurs et animations | `src/app/globals.css`, composants Tailwind |
| Textes d'accueil | Variables `NEXT_PUBLIC_*` |
| Emojis autorisés | `src/lib/config.ts` → `allowedEmojis` |
| Limite anti-spam | `src/lib/config.ts` → `rateLimitMax`, `rateLimitWindowMinutes` |
| Taille max photo | `src/lib/config.ts` → `maxPhotoSizeBytes` |
| Nom du Worker | `wrangler.jsonc` → `name` |

---

## Structure du projet

```
wishcards/
├── wrangler.jsonc                  # Config Cloudflare (Worker, vars, Hyperdrive)
├── open-next.config.ts             # Adaptateur OpenNext
├── .github/workflows/
│   └── cloudflare-deploy.yml       # CI/CD GitHub → Cloudflare
├── .dev.vars.example               # Variables locales Workers (preview)
├── sql/
│   └── schema.supabase.sql   # Schéma PostgreSQL Supabase
├── public/_headers           # Cache des assets statiques
├── src/
│   ├── app/                  # Pages + API
│   ├── components/
│   └── lib/                  # DB, auth, validation, exports
├── .env.example
├── .dev.vars.example
└── README.md
```

---

## Sécurité

- Validation Zod côté client et serveur
- Champ honeypot anti-bot
- Limitation : 3 messages par IP par heure (configurable)
- Session admin signée HMAC (cookie httpOnly)
- Comparaison timing-safe des mots de passe
- Secrets stockés via `wrangler secret` (jamais en clair dans le code)

---

## Dépannage

| Problème | Solution |
|----------|----------|
| Erreur de connexion Supabase | Vérifiez `SUPABASE_URL` et `SUPABASE_SECRET_KEY`, et que les tables existent |
| Worker trop volumineux | Plan Workers Paid requis si > 3 Mo compressé (jspdf augmente la taille) |
| Variables non chargées | Vérifiez les secrets dans le dashboard Cloudflare |
| Build échoue | Assurez-vous que `nodejs_compat` est activé dans `wrangler.jsonc` |

---

## Licence

MIT — libre d'utilisation et de modification.
