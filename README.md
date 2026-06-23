# Livre d'Or de Départ à la Retraite

Application web minimaliste permettant à plusieurs collègues de laisser des messages de félicitations via un lien partagé.

## Stack technique

- **Frontend** : Next.js 16 (App Router) + Tailwind CSS
- **Backend** : API Routes Next.js
- **Base de données** : MySQL via Cloudflare Hyperdrive
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

### 2. Configurer la base de données

Exécutez le script `sql/schema.mysql.sql` sur votre instance MySQL (PlanetScale, Railway, Aiven, hébergement mutualisé…).

Un schéma PostgreSQL pour Supabase est aussi disponible dans `sql/schema.supabase.sql`.

### 3. Variables d'environnement

```bash
cp .env.example .env.local
cp .dev.vars.example .dev.vars
```

Remplissez `DATABASE_URL` dans `.env.local` pour le développement local.

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
| `DATABASE_URL` | Local uniquement | URL MySQL pour `next dev` (`mysql://user:pass@host:3306/db`) |
| `ADMIN_PASSWORD` | Oui | Mot de passe du panneau d'administration |
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
- Wrangler CLI (inclus en devDependency)
- Une base MySQL accessible depuis Internet

### 1. Créer la configuration Hyperdrive

Hyperdrive permet à Cloudflare Workers de se connecter à MySQL de façon performante et sécurisée.

```bash
npx wrangler login
npx wrangler hyperdrive create wishcards-db \
  --connection-string="mysql://user:password@host:3306/wishcards"
```

Copiez l'`id` affiché et remplacez `<VOTRE_HYPERDRIVE_ID>` dans `wrangler.jsonc` :

```jsonc
"hyperdrive": [
  {
    "binding": "HYPERDRIVE",
    "id": "votre-id-hyperdrive"
  }
]
```

### 2. Configurer les secrets Cloudflare

```bash
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put ADMIN_SESSION_SECRET
npx wrangler secret put RATE_LIMIT_SECRET
```

Ajoutez aussi les variables publiques dans le tableau de bord Cloudflare (**Workers & Pages → votre Worker → Settings → Variables**) ou via `wrangler.jsonc` :

```
NEXT_PUBLIC_RETIREE_NAME=Marie Martin
NEXT_PUBLIC_RETIREE_PHOTO=https://...
NEXT_PUBLIC_INTRO_TEXT=Votre texte personnalisé
```

### 3. Déployer

**Via la ligne de commande :**

```bash
npm run deploy
```

**Via Git (recommandé pour la production) :**

1. Poussez le code sur GitHub ou GitLab
2. Dans Cloudflare : **Workers & Pages → Create → Connect to Git**
3. Sélectionnez le dépôt
4. Configuration du build :
   - **Build command** : `npm run build`
   - **Deploy command** : `npx opennextjs-cloudflare build && npx opennextjs-cloudflare deploy`
5. Ajoutez les variables d'environnement et secrets dans le dashboard
6. Chaque push sur `main` déclenche un déploiement automatique

### 4. Partager le lien

Votre application sera accessible sur `https://wishcards.<votre-compte>.workers.dev` ou sur votre domaine personnalisé.

L'accès admin : `/admin`

### 5. Domaine personnalisé (optionnel)

Dans **Workers & Pages → votre Worker → Settings → Domains & Routes**, ajoutez votre domaine (ex. `livre-or.votre-entreprise.fr`).

---

## Architecture Cloudflare

```
Utilisateur → Cloudflare CDN → Worker (OpenNext/Next.js)
                                    ↓
                              Hyperdrive → MySQL
```

- **OpenNext** (`@opennextjs/cloudflare`) : adapte le build Next.js pour Cloudflare Workers
- **Hyperdrive** : pool de connexions MySQL au edge, compatible `mysql2`
- **Wrangler** : CLI de déploiement et gestion des secrets

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
├── wrangler.jsonc            # Config Cloudflare Workers + Hyperdrive
├── open-next.config.ts       # Config OpenNext
├── sql/
│   ├── schema.mysql.sql
│   └── schema.supabase.sql
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
| Erreur de connexion MySQL en prod | Vérifiez l'ID Hyperdrive dans `wrangler.jsonc` et que la base accepte les connexions externes |
| Worker trop volumineux | Plan Workers Paid requis si > 3 Mo compressé (jspdf augmente la taille) |
| Variables non chargées | Vérifiez les secrets dans le dashboard Cloudflare |
| Build échoue | Assurez-vous que `nodejs_compat` est activé dans `wrangler.jsonc` |

---

## Licence

MIT — libre d'utilisation et de modification.
