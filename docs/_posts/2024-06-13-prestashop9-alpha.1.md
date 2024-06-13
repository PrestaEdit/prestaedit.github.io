---
title: "PrestaShop 9 : alpha.1"
date: 2024-06-13
tags:
  - Annonce
  - PrestaShop 9
author: PrestaEdit
featuredimg: 'https://prestaedit.github.io/head/2024-06-13-9.0.0-alpha.1-release.png'
summary: "Sortie de PrestaShop 9.0.0-alpha.1"
---

<Danger title="Cette version est une version destinée aux développements et tests. Il ne s'agit pas d'une version de production." />

## Préambule

La version 8 de PrestaShop est sortie le 26 octobre 2022.

Une année et sept mois environ plus tard, le 6 juin 2024, l'alpha.1 de PrestaShop 9 est de sortie.

## Changements majeurs

### Symfony

Le framework Symfony a été mis à jour.
Désormais, c'est la version **6.4** qui est embarquée.

La version 8.1 utilisait une version 4.4 de Symfony.

### Versions de PHP

La version minimale de PHP utilisable pour cette version est la **8.1**.

Le support des versions **8.2** et **8.3** est également disponible.

### Admin API

Dans l'optique de remplacer l'obsolète système de webservice, une nouvelle API est embarquée dans cette version de PrestaShop.

<Info title="Un article à ce propos sera bientôt publié" />

### Symfony
#### Layout

Le Back Office est désormais entièrement géré par **Symfony** et des composants **Twig**.

A noter également que la page de connexion au Back Office est maintenant également gérée par Symfony. Cette étape permettra notamment de pousser la sécurité autour de cette page et de l'étendre, dans le futur.

#### Front Office

Le **conteneur Symfony** est désormais accessible en Front Office, permettant d'utiliser les composants Symfony.

<Info title="Cette fonctionnalité est disponible via un Feature Flag" />

## Installation

A la suite d'un ["changement récent"](https://build.prestashop-project.org/news/2024/new-zip-distribution-channel/), **les archives ne seront plus disponibles via GitHub**.

Vous devrez donc tout d'abord réaliser une release via l'outil de création des releases.

### Pré-requis

- PHP 8.1
- Composer 2
- Node.js 16
- NPM 8

### Création de la release

Tout d'abord, cloner le repository de PrestaShop sur la branche souhaitée.

``` bash
git clone git@github.com:PrestaShop/PrestaShop.git --branch "9.0.0-alpha.1 .
```

Ensuite, lancer l'outil de création.

``` bash
php tools/build/CreateRelease.php
```

Vous pouvez utiliser ce raccourci, si vous le souhaitez.

``` bash
composer create-release
```

A la suite des opérations - qui prennent un certain temps -, vous trouverez l'archive dans le dossier *tools/build/releases/*.

## Documentation

La documentation développeur est accessible [ici](https://devdocs.prestashop-project.org/9/).

## Version de production

La question que beaucoup se pose, développeurs comme marchands, est de savoir à partir de quand cette version sera utilisable en production.

*Non, je ne connais pas la réponse.*

Toutefois, mes prédictions vont sur le mois de **novembre 2024**.
Une mise à jour de cet article pourrait survenir en cas de changement.

## Liens

Retrouvez l'annonce sur le Build ["PrestaShop 9 Alpha 1 Is Available!"](https://build.prestashop-project.org/news/2024/prestashop-9-alpha1-available/).
