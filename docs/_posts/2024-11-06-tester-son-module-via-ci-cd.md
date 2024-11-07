---
title: "Tester et analyser ses modules automatiquement"
date: 2024-11-06
tags:
  - GitHub
  - Outils
  - PrestaShop Dev Conference
author: PrestaEdit
featuredimg: 'https://prestaedit.github.io/head/2024-11-06-tester-son-module-via-ci-cd.png'
summary: "Workflows GitHub"
---

<Info title="Vous trouverez les sources du module réalisé dans cet article sur le dépôt GitHub suivant : PrestaEdit/modulenine" />

## Préambule

Lors du développement d'un module, on se retrouve fort souvent à réaliser celui-ci sur une seule et même instance et principalement sur une version plus récente de PrestaShop.

Cependant, **les utilisateurs de ces modules ne sont pas systématiquement sur le même socle**.

Au fil des versions, mineures comme majeures, PrestaShop introduit des changements de codes qui peuvent avoir des répercussions sur le bon fonctionnement du module.

Malgré tout, réaliser un test sur chaque version de PrestaShop manuellement et lors de chaque lot d'utilisation de nouvelles méthodes est fastidieux.

Réaliser ces tests en fin de développement peut également s'avérer plus compliqué que prévu, pour peu que tout un pan de code ne soit pas rétro-compatible.

Voyons dès lors comment tester - **automatiquement** - le code de son module pour une compatibilité sur toutes versions.

## PhpStan

### Introduction

[PHPStan](https://phpstan.org/) est un outil d'analyse statique de code spécifique à PHP.

Il analyse votre code à la recherche d'erreurs et de problèmes potentiels, vous aidant ainsi à améliorer la qualité de votre code et à éviter les erreurs courantes.

Au niveau de PrestaShop, vous pouvez d'ores et déjà utiliser PhpStan en dehors de ce projet. Pour cela, voyez la [documentation officielle](https://devdocs.prestashop-project.org/1.7/modules/testing/advanced-checks/#static-analysis).

### Configuration

Avant de rentrer dans le vif du sujet, explorons tout d'abord la configuration nécessaire.

Nous allons créer deux fichiers de script shell.

<Warning title="Dans notre illustration, nous utilisons le nom du module directement dans le fichier, sans passer par une variable." />

*A ce propos, vous pourriez passer le nom du module directement dans le workflow GitHub en utilisant le nom du dépôt. Ceci ne sera pas couvert dans le présent article.*

**/tests/phpstan.sh**

```sh
#!/bin/bash
PS_VERSION=$1

set -e

# Docker images prestashop/prestashop may be used, even if the shop remains uninstalled
echo "Pull PrestaShop files (Tag ${PS_VERSION})"

docker rm -f temp-ps || true
docker volume rm -f ps-volume || true

docker run -tid --rm -v ps-volume:/var/www/html --name temp-ps prestashop/prestashop:$PS_VERSION

# Run a container for PHPStan, having access to the module content and PrestaShop sources.
# This tool is outside the composer.json because of the compatibility with PHP 5.6
echo "Run PHPStan using phpstan-${PS_VERSION}.neon file"

docker run --rm --volumes-from temp-ps \
       -v $PWD:/var/www/html/modules/modulenine \
       -e _PS_ROOT_DIR_=/var/www/html \
       --workdir=/var/www/html/modules/modulenine phpstan/phpstan:0.12.54 \
       analyse \
       --configuration=/var/www/html/modules/modulenine/tests/phpstan/phpstan-$PS_VERSION.neon
```

**/tests/phpstan-v9.sh**

<Info title="Celui-ci est nécessaire pour permettre l'utilisation du registre prestaedit/prestashop en lieu et place de prestashop/prestashop. L'image Docker de PrestaShop 9 n'étant disponible que lors de sa release officielle." />

Par ailleurs, la version de PhpStan utilisée est différente. Celle-ci étant compatible avec PHP8.1, notamment.

```sh
#!/bin/bash
PS_VERSION=$1

set -e

# Docker images prestashop/prestashop may be used, even if the shop remains uninstalled
echo "Pull PrestaShop files (Tag ${PS_VERSION})"

docker rm -f ps9-php8 || true
docker volume rm -f ps9-php8 || true

docker run -tid --rm -v ps9-php8:/var/www/html --name ps9-php8 prestaedit/prestashop:$PS_VERSION

docker exec -i ps9-php8 php -v

# Run a container for PHPStan, having access to the module content and PrestaShop sources.
# This tool is outside the composer.json because of the compatibility with PHP 5.6
echo "Run PHPStan using phpstan-${PS_VERSION}.neon file"

docker run --rm --volumes-from ps9-php8 \
       -v $PWD:/var/www/html/modules/modulenine \
       -e _PS_ROOT_DIR_=/var/www/html \
       --workdir=/var/www/html/modules/modulenine ghcr.io/phpstan/phpstan:nightly-php8.1 \
       analyse \
       --configuration=/var/www/html/modules/modulenine/tests/phpstan/phpstan-$PS_VERSION.neon
```

Ensuite, nous allons ajouter l'ensemble des fichiers correspondant à une version de PrestaShop testée. Ceux-ci porteront l'extension *.neon*.

Son contenu de base sera le suivant :
```yml
includes:
	- %currentWorkingDirectory%/vendor/prestashop/php-dev-tools/phpstan/ps-module-extension.neon

parameters:
  paths:
    # From PHPStan 0.12, paths to check are relative to the neon file
    - ../../modulenine.php
    - ../../classes/
    - ../../controllers/
  reportUnmatchedIgnoredErrors: false
  level: 5
  ignoreErrors:
```

#### A propos de ps-module-extension.neon

Ce premier fichier de configuration va se charger de définir des constantes utiles et relatives à une instance PrestaShop. Il se chargera également de définir des *stubs* concernant la classe Module et Tab.


Par la suite, nous mettrons en place un workflow testant le module à la fois sous PrestaShop 1.6.1.23, 1.7.8, 8.1.7 et 9.0.0-alpha.1.

Nous aurons donc ces quatre fichiers :
- tests/phpstan/phpstan-1.6.1.23.neon
- tests/phpstan/phpstan-1.7.8.neon
- tests/phpstan/phpstan-8.1.7.neon
- tests/phpstan/phpstan-9.0.0-alpha.1.neon

Tout comme moi, vous auriez l'envie de modifier l'appel des fichiers de configuration de PhpStan que nous écrirons plus tard pour utiliser un seul et unique fichier, puisque le contenu est équivalent.

**Mais, non, vous ne le ferez pas.**

Ce découpage en fichier nous sera nécessaire par la suite.

## Module

Pour le bien de notre article et pour la suite de la lecture, nous allons concevoir un module qui a pour but d'illustrer le retour des erreurs.

```php
<?php

class ModuleNine extends Module
{
    public function __construct()
    {
        $this->name = 'modulenine';

        parent::__construct();
    }

    protected function prestashop16()
    {
        // Methods are more times deprecated, but not removed.
        // So, use a newer one
        $temp = new EmployeeSession();
    }

    protected function prestashop17()
    {
        // Methods are more times deprecated, but not removed, again.
        // So, use a newer one
        $temp = new CustomerSession();
    }

    protected function prestashop8()
    {
        $temp = Carrier::getCarrierNameFromShopName();
    }

    protected function prestashop9()
    {
        $temp = new Order(1);
        $temp->getDiscounts();
    }
}
```

En tant que développeur aguerri, vous pourriez omettre une objection assez rapidement et pour laquelle vous auriez raison de le faire : les appels aux méthodes inexistantes pour telle ou telle version de PrestaShop le sont dans des méthodes isolées et jamais appelée par notre module.
Dès lors, l'utilisation de ce module sur une version incriminée de PrestaShop ne poserait pas de problèmes, dans l'immédiat.

L'analyse de code étant **réalisée de manière statique** et sans votre oeil de développeur, une erreur vous sera malgré tout annoncée.

Prenez la au sérieux et veillez à la traiter avec des conditions dès que possible. D'autant qu'il s'agit de code non utilisé mais qui se doit d'être corrigé (ou d'être supprimé, le cas échéant !).

Voici un rendu de la console GitHub lors de l'exécution de nos jobs. *Durant ce test, nous n'avions pas encore mis d'erreurs dans les fonctions pour PrestaShop 1.6 et 1.7.*

<img :src="$withBase('/posts/2024-11-06-tester-son-module-via-ci-cd/02.png')" alt="Capture">

En visualisant le détail d'un job en erreur, vous pourrez obtenir l'information souhaitée :

<img :src="$withBase('/posts/2024-11-06-tester-son-module-via-ci-cd/03.png')" alt="Capture">

En modifiant le module comme suit, afin d'ajouter une condition sur l'exécution du code, vous pouvez relancer votre job et l'erreur aura disparue.

```php
    protected function prestashop8()
    {
        if (version_compare(_PS_VERSION_, '8.0.0', '<')) {
            $temp = Carrier::getCarrierNameFromShopName();
        }
    }
```

Vous venez de relancer le job et l'erreur n'a pas disparue ?!

*Oups, je vous ai menti.*

En réalité, PhpStan - *bien qu'il connaisse la valeur de la constante _PS_VERSION_* - **n'est pas en mesure d'interpréter la conditionnelle** au même titre qu'il ne sait pas que vos méthodes ne sont jamais appelées.

De ce fait, l'analyse de code statique retournera toujours l'erreur rencontrée.

Une fois celle-ci traitée, vous allez pouvoir modifier votre fichier neon sur la version concernée (d'où la séparation précédente) pour lui dire d'ignorer l'erreur.

```yml
parameters:
  ignoreErrors:
    - '~^Call to an undefined static method Carrier::getCarrierNameFromShopName\(\)\.$~'
```

## Workflow GitHub

Pour le bien de cet article, nous avons souhaités commencer par l'introduction et le résultat attendu quant à l'utilisation de PhpStan.

Dans l'idée de rentre cela plus **automatique**, nous allons désormais écrire la configuration du workflow GitHub.

**.github/workflows/php.yml**
```yml
name: PHP tests
on: [workflow_dispatch, pull_request]
jobs:
  php-linter:
    name: PHP Syntax check 7.1 => 8.3
    runs-on: ubuntu-22.04
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: PHP syntax checker 7.1
        uses: prestashop/github-action-php-lint/7.1@master

      - name: PHP syntax checker 7.2
        uses: prestashop/github-action-php-lint/7.2@master

      - name: PHP syntax checker 7.3
        uses: prestashop/github-action-php-lint/7.3@master

      - name: PHP syntax checker 7.4
        uses: prestashop/github-action-php-lint/7.4@master

      - name: PHP syntax checker 8.0
        uses: prestashop/github-action-php-lint/8.0@master

      - name: PHP syntax checker 8.1
        uses: prestashop/github-action-php-lint/8.1@master

      - name: PHP syntax checker 8.2
        uses: prestashop/github-action-php-lint/8.2@master

      - name: PHP syntax checker 8.3
        uses: prestashop/github-action-php-lint/8.3@master

  php-cs-fixer:
    name: PHP-CS-Fixer
    runs-on: ubuntu-22.04
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Run PHP-CS-Fixer
        uses: prestashopcorp/github-action-php-cs-fixer@master
        with:
          other-cmds: "--config=.php-cs-fixer.dist.php"

  # Run PHPStan against the module and a PrestaShop release
  phpstan-v16:
    name: PHPStan
    runs-on: ubuntu-latest
    continue-on-error: true
    strategy:
      matrix:
        presta-versions: ["1.6.1.23"]
    steps:
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: "7.1"

      - name: Checkout
        uses: actions/checkout@v3.1.0

      # Add vendor folder in cache to make next builds faster
      - name: Cache vendor folder
        uses: actions/cache@v3
        with:
          path: vendor
          key: php-${{ hashFiles('composer.lock') }}

      # Add composer local folder in cache to make next builds faster
      - name: Cache composer folder
        uses: actions/cache@v3
        with:
          path: ~/.composer/cache
          key: php-composer-cache

      - run: composer install

      # Docker images prestashop/prestashop may be used, even if the shop remains uninstalled
      - name: Execute PHPStan on PrestaShop (Tag ${{ matrix.presta-versions }})
        run: chmod +x ./tests/phpstan.sh && ./tests/phpstan.sh ${{ matrix.presta-versions }}

  phpstan:
    name: PHPStan
    runs-on: ubuntu-latest
    continue-on-error: true
    strategy:
      matrix:
        presta-versions: ["1.7.8", "8.1.7"]
    steps:
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: "7.4"

      - name: Checkout
        uses: actions/checkout@v3.1.0

      # Add vendor folder in cache to make next builds faster
      - name: Cache vendor folder
        uses: actions/cache@v3
        with:
          path: vendor
          key: php-${{ hashFiles('composer.lock') }}

      # Add composer local folder in cache to make next builds faster
      - name: Cache composer folder
        uses: actions/cache@v3
        with:
          path: ~/.composer/cache
          key: php-composer-cache

      - run: composer install

      # Docker images prestashop/prestashop may be used, even if the shop remains uninstalled
      - name: Execute PHPStan on PrestaShop (Tag ${{ matrix.presta-versions }})
        run: chmod +x ./tests/phpstan.sh && ./tests/phpstan.sh ${{ matrix.presta-versions }}

  phpstan-v9:
    name: PHPStan
    runs-on: ubuntu-latest
    strategy:
      matrix:
        presta-versions: ["9.0.0-alpha.1"]
    steps:
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: "8.1"

      - name: Checkout
        uses: actions/checkout@v4

      # Add vendor folder in cache to make next builds faster
      - name: Cache vendor folder
        uses: actions/cache@v3
        with:
          path: vendor
          key: php-${{ hashFiles('composer.lock') }}

      # Add composer local folder in cache to make next builds faster
      - name: Cache composer folder
        uses: actions/cache@v3
        with:
          path: ~/.composer/cache
          key: php-composer-cache

      - run: composer install

      # Docker images prestashop/prestashop may be used, even if the shop remains uninstalled
      - name: Execute PHPStan on PrestaShop (Tag ${{ matrix.presta-versions }})
        run: chmod +x ./tests/phpstan-v9.sh && ./tests/phpstan-v9.sh ${{ matrix.presta-versions }}
```

Lors de chaque pull request effectuée sur le dépôt ou via un lancement automatique - grâce à l'évènement *workflow_dispatch* -, vous pourrez lancer l'ensemble des jobs définit précédemment.

<Info title="En allant plus loin, vous pourrez remarquer que nous utilisons également une vérification syntaxique pour un ensemble de versions de PHP mais également de PHP CS Fixer.Ces étapes ne faisant pas partie de notre article, nous ne les évoquerons pas plus en détails." />

## Alternative locale : act

Lors du développement d'un module comme lors de tout développement, vous n'allez pas forcément pousser les modifications sur git à chaque fonction.

Dès lors, le workflow GitHub n'étant activé que lors d'une poussée de code et sur le code disponible dans le dépôt au moment de son exécution, vous ne pourriez pas visualiser les problématiques **en cours de développement**.

Pour ce faire, vous pouvez utiliser [nektos/act, "Run your GitHub Actions locally"](https://nektosact.com/) pour utiliser un runner localement.

<Warning title="Les workflows utilisant des images Docker, vous aurez besoin de lancer Docker (Desktop, par exemple)." />

L'avantage de cette solution, en plus d'être locale, est la possibilité d'utiliser **le même workflow que celui définit dans GitHub** sans devoir le transposer sur une solution ayant sa propre nomenclature.

Concernant son installation, je vous laisse le soin de choisir la méthode la plus adéquate pour votre environnement. Travaillant sous MacOs, l'installation via Homebrew a été préférée.

En ligne de commande, à la racine de votre dépôt, vous pourrez désormais écrire cet appel pour lancer l'ensemble de vos jobs :

```bash
act workflow_dispatch
```

<Info title="On précise l'event GitHub pour que act sache quels jobs lancer" />

Vous pouvez également **préciser un fichier de workflow** en particulier :

```bash
act workflow_dispatch -W '.github/workflows/php.yml'
```

Ou encore, vous pouvez obtenir **la liste des jobs disponibles** dans votre workflow et y faire un appel direct :

```bash
act --list
```

Et dès lors réaliser **un appel direct** de ce type (en omettant l'évènement GitHub) :

```bash
act -j 'php-linter'
act -j 'phpstan-v9'
```

Vous devriez obtenir un résultat similaire à la sortie de console de GitHub.

<img :src="$withBase('/posts/2024-11-06-tester-son-module-via-ci-cd/01.png')" alt="Capture">

### Problème de parallélisme

Par facilité et afin de lancer le même job sur une série de versions de PrestaShop, nous utilisons une matrice dans le workflow GitHub.

Or, via Act, cela peut poser soucis d'exécution concurrente.

Vous pouvez dès lors optez pour modifier votre workflow afin de ne pas utiliser de matrices ou alors vous pouvez altérer la matrice sans modifier votre configuration.

```bash
act -j 'phpstan' --matrix presta-versions:8.1.7
```
