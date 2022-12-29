---
title: psssst, analyseur de modules
date: 2022-12-29
tags:
  - outils
author: PrestaEdit
featuredimg: 'https://prestaedit.github.io/head/2022-12-29-psssst-analyseur-de-modules.png'
summary: Découverte d'un outil léger, en CLI, permettant l'analyse de modules.
---

<Info title="Nécessite au minimum une version de PHP 7.1.3" />

## Préambule

La toute première version de cet outil est née en avril 2018. On l'a doit à [@mickaelandrieu](https://github.com/mickaelandrieu).

Fin octobre 2021, PrestaShop devient propriétaire du repository et la compatibilité avec PHP 8 est réalisée.
<br/>
De nouvelles informations sont également disponibles : la description, le nom d'affichage ainsi que la plage de compatibilité du module.

La dernière version, actuelle, étant la v1.2.1 et date de début avril 2022.
<br/>
Celle-ci permet d'extraire l'auteur ainsi que l'onglet (`tab`) du module. La plage de compatibilité étant désormais affichée ([#7](https://github.com/PrestaShop/psssst/pull/7)).

## Installation

Par soucis de facilité et afin de retrouver celui-ci facilement dans votre installation, je vous suggère de placer cet outil dans le dossier `tools` de votre instance PrestaShop.

```
cd tools
git clone https://github.com/PrestaShop/psssst.git
```

<Info title="Comme de coutumes, n'oubliez pas d'installer les dépendances Composer" />

```
composer install
```

## Utilisation

<Warning title="Il vous sera sans nuls doutes nécessaires d'octroyer les droits d'éxécution sur l'invite de commande, représentée par le fichier pssst, au préalable." />

```
cd psssst
./psssst ../../modules/ps_searchbar
```

<img :src="$withBase('/posts/2022-12-29-psssst-analyseur-de-modules/resultat-1.png')" alt="Résultat #1">

<Info title="Vous pouvez également lancer l'analyse sur un ensemble de dossiers." />

```
./psssst ../../modules/
```

<img :src="$withBase('/posts/2022-12-29-psssst-analyseur-de-modules/resultat-2.png')" alt="Résultat #2">

Une option `--export` est disponible et vous transmets les informations en JSON.

```
./psssst ../../modules/ps_searchbar --export
```

<img :src="$withBase('/posts/2022-12-29-psssst-analyseur-de-modules/resultat-3.png')" class="medium-zoom-image" alt="Résultat #3">

## Notes

<Warning title="Les hooks dynamiques - et ce y compris les widgets - ne sont pas détectés." />
