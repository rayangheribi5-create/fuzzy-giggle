# Publier AutiColor sur le Play Store et l'App Store

## 1. En bref (à lire d'abord)

AutiColor est une **PWA** : une application web installable. Elle s'installe déjà sur Android,
iPhone, tablette et ordinateur depuis le navigateur, sans store. Mais **un magasin d'applications
n'accepte pas un site web tel quel** : il exige un paquet natif signé (AAB pour Android, IPA pour
iOS), construit avec les SDK officiels, puis validé par une revue humaine.

Je ne peux pas faire cette étape depuis cet environnement, pour trois raisons concrètes :

| Ce qui manque | Pourquoi je ne peux pas le faire ici |
| --- | --- |
| **Compte Google Play** (25 $ une fois) et **Apple Developer Program** (99 €/an) | Ce sont des comptes personnels, payants, avec vérification d'identité et acceptation de contrats |
| **Compilation native** (Android SDK/JDK + Xcode sur macOS) | La compilation Android/iOS n'est pas prise en charge ici, et un IPA ne peut être produit que sur macOS |
| **Signature et envoi** (keystore, certificats, TestFlight, revue) | Ces opérations engagent légalement l'éditeur et se font depuis ta machine et tes consoles |

En revanche, **tout le reste est fait** : l'application est en ligne, installable, et les éléments
obligatoires des fiches store sont prêts (voir §7).

## 2. Ce qui est déjà prêt dans ce dépôt

- ✅ Application en ligne et fonctionnelle : <https://jwmacvr2g5.dev.ap-jt.com>
- ✅ PWA installable : manifeste complet, icônes 192/512/maskable, service worker, mode plein écran
- ✅ **Politique de confidentialité publique** : `/confidentialite.html`
- ✅ **Textes de fiche** prêts à copier : `docs/fiche-store.md`
- ✅ **Icône 1024×1024** (App Store) : `docs/store-assets/icon-1024.png`
- ✅ **Feature graphic 1024×500** (Play Store) : `docs/store-assets/feature-graphic-1024x500.png`
- ✅ Aucune collecte de données, aucun compte obligatoire, aucune publicité → les formulaires
  « Sécurité des données » et « Confidentialité de l'app » sont simples à remplir

## 3. Étape 0 — les comptes (obligatoire, non contournable)

1. **Google Play Console** : <https://play.google.com/console> — 25 $ une seule fois, vérification
   d'identité par pièce officielle (compte personnel) ou par documents d'entreprise.
2. **Apple Developer Program** : <https://developer.apple.com/programs/> — 99 €/an. Pour publier sur
   l'App Store, un **Mac avec Xcode** est indispensable (location d'un Mac cloud possible).
3. Prépare une **adresse e-mail de contact** publique : elle apparaît sur les deux fiches, et doit
   être ajoutée aussi dans `public/confidentialite.html` (section « Contact »).

## 4. Google Play — deux chemins possibles

### Option A (recommandée) : TWA avec Bubblewrap

Une *Trusted Web Activity* affiche l'application web en plein écran dans une app Android native.
C'est le chemin officiel de Google pour une PWA. Prérequis sur **ta** machine : JDK 17 et
Android SDK.

```bash
# 1. Outil officiel
npm install -g @bubblewrap/cli

# 2. Générer le projet Android à partir du manifeste en ligne
bubblewrap init --manifest https://jwmacvr2g5.dev.ap-jt.com/manifest.webmanifest

# 3. Construire le paquet signé (.aab) — Bubblewrap crée le keystore et l'enregistre
bubblewrap build
```

Bubblewrap affiche alors une **empreinte SHA-256** de ta clé de signature. Elle sert à prouver que
l'app Android et le site appartiennent au même éditeur. Le fichier doit être servi à l'adresse :

```
https://jwmacvr2g5.dev.ap-jt.com/.well-known/assetlinks.json
```

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.auticolor.app",
      "sha256_cert_fingerprints": ["COLLE_ICI_L_EMPREINTE_SHA256"]
    }
  }
]
```

> ⚠️ Ne mets **pas** de valeur inventée : une empreinte fausse casse la vérification et la barre
> d'URL réapparaît. Envoie-moi l'empreinte et le nom de package exacts et j'ajoute le fichier
> correctement (puis redéploiement).

Ensuite, dans Play Console : créer l'application → remplir la fiche (`docs/fiche-store.md`) →
téléverser l'`.aab` → remplir « Sécurité des données » et « Classification du contenu » → tester en
interne → publier.

**Important** : conserve le fichier `android.keystore` et ses mots de passe. Sans lui, tu ne pourras
plus jamais mettre à jour l'application.

### Option B : Capacitor (aussi valable pour iOS)

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init AutiColor com.auticolor.app --web-dir=dist
npm run build
npx cap add android
npx cap sync android
npx cap open android     # ouvre Android Studio → Build > Generate Signed Bundle
```

Capacitor embarque le build web dans une coque native. Avantage : le même projet sert aussi pour
iOS (§5). Inconvénient : il faut relancer `npm run build && npx cap sync` après chaque modification.

## 5. App Store — le point délicat

Sur iPhone, Apple n'accepte pas les applications qui ne sont qu'un site web enrobé
(**règle 4.2 « Minimum Functionality »**). Une PWA peut être installée via Safari
(Partager → « Sur l'écran d'accueil »), mais **ne peut pas être soumise à l'App Store telle quelle**.

Pour une vraie présence sur l'App Store, il faut :

1. `npx cap add ios` puis `npx cap open ios` (sur un Mac avec Xcode 16+).
2. Signer avec ton compte Apple Developer, configurer les identifiants et les icônes
   (`docs/store-assets/icon-1024.png`).
3. Ajouter **au moins une fonctionnalité réellement native** pour satisfaire la règle 4.2 :
   notifications locales pour les routines, mode hors-ligne complet, widgets, haptique, etc.
   (Je peux écrire ce code, mais la compilation et la soumission restent à faire sur macOS.)
4. Passer par **TestFlight** avant la soumission, puis la revue App Store.

Sans Mac ni compte Apple, la solution réaliste pour iPhone aujourd'hui est l'installation PWA :
l'expérience est très proche d'une application (plein écran, icône, hors-ligne), sans passer par le
store.

## 6. Éléments visuels à fournir pour les fiches

| Élément | Play Store | App Store | État |
| --- | --- | --- | --- |
| Icône | 512×512 PNG | 1024×1024 PNG | ✅ fournie (les deux tailles) |
| Feature graphic | 1024×500 | — | ✅ fournie |
| Captures téléphone | 2 à 8 (min. 1080 px de haut) | 6,9" : 1290×2796 | ❌ à capturer |
| Captures tablette | 7" et 10" | 13" : 2064×2752 | ❌ à capturer |
| Vidéo (facultatif) | lien YouTube | lien ou fichier | ❌ |

Les captures doivent montrer l'application **réelle** (pas de maquette). Je peux les générer depuis
l'application en ligne sur demande — dis-moi simplement quelles pages tu veux mettre en avant
(accueil, programme, communication, espace calme).

## 7. Checklist avant d'appuyer sur « Publier »

- [ ] Compte Play Console créé et vérifié
- [ ] Adresse e-mail de contact ajoutée dans la politique de confidentialité
- [ ] Nom de package choisi (ex. `com.auticolor.app`) et identique partout
- [ ] Keystore généré et sauvegardé en lieu sûr
- [ ] `/.well-known/assetlinks.json` en ligne avec la bonne empreinte (option TWA)
- [ ] Fiche remplie depuis `docs/fiche-store.md`
- [ ] « Sécurité des données » : aucune collecte (sauf mention Google si activé)
- [ ] Classification du contenu : tous publics / 4+
- [ ] Captures d'écran ajoutées
- [ ] Test interne effectué sur un vrai téléphone Android
- [ ] Politique de confidentialité accessible : `/confidentialite.html`

## 8. Ce que je peux faire tout de suite, sur demande

- Générer les captures d'écran store (téléphone + tablette) depuis l'application en ligne
- Ajouter `/.well-known/assetlinks.json` dès que tu as l'empreinte SHA-256
- Écrire le code des notifications locales pour les routines (utile pour l'App Store)
- Ajouter des pages de partage/impression du programme pour l'école ou la famille
- Corriger tout ce que la revue des stores signalerait
