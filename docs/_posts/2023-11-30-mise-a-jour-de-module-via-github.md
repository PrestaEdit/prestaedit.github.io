---
title: Mise à jour de module via GitHub
date: 2023-11-30
tags:
  - Outils
  - Prestashop Dev Conference
author: PrestaEdit
featuredimg: 'https://prestaedit.github.io/head/2023-11-30-mise-a-jour-de-module-via-github.png'
summary: Voyons comment publier un module open-source sous PrestaShop 8 avec détection de mise à jour intégrée
---

<Info title="Cet article nécessite PrestaShop 8." />

## Préambule

**PrestaShop 8** dispose d'une particularité vis-à-vis des versions précedentes : cette version de PrestaShop n'est plus étroitement liée à la marketplace **PrestaShop Addons**.

Précédemment, les modules natifs - et donc gratuit - de PrestaShop étaient stockés sur cette plateforme afin de permettre notamment le téléchargement des modules à l'installation d'une boutique ou encore d'obtenir les informations de nouvelles versions disponibles.

Lors du déploiement d'une boutique PrestaShop, il est possible de choisir deux versions de PrestaShop :
  - **Basic** : la version open-source, packagée depuis GitHub ;
  - **Edition** : basée sur la version *Basic*, avec un style différent et un couplage à Addons intégré.

Quoi de plus attendu qu'une version packagée via GitHub pour être en lien avec des modules eux-même packagés et releasés sur cette même plateforme ?

C'est précisement la raison pour laquelle un nouveau module est apparu - *ps_distributionapi* - permettant ainsi de **distribuer les modules natifs au fil des publications de mise à jours et de versions de PrestaShop**.

Et bien que nous soyons en mesure d'accomplir pas mal de miracles dans nos développements en se basant sur un PrestaShop classique, il n'en est pas moins nécessaire de réaliser des adaptations en conséquences.

## De nouveaux hooks

Dès lors, de nombreux hooks ont été introduits pour faciliter la gestion des modules à présenter - *aussi bien ceux présents physiquements que ceux disponibles au téléchargement* - sur la page de gestion des modules.

On compte pas moins de **dix** nouveaux hooks :
- `actionListModules`
- `actionBeforeInstallModule`
- `actionBeforePostInstallModule`
- `actionBeforeUninstallModule`
- `actionBeforeUpgradeModule`
- `actionBeforeEnableModule`
- `actionBeforeDisableModule`
- `actionBeforeEnableMobileModule`
- `actionBeforeDisableMobileModule`
- `actionBeforeResetModule`

Ces nouveaux hooks sont bien entendus gérés par le module de PrestaShop de distribution des modules (*ps_distributionapi*) mais ils ne lui sont pas reservés.

Je vous invite notamment à visualiser la [Pull Request](https://github.com/PrestaShop/PrestaShop/pull/27632) concernée par cette nouveauté ainsi que la [démonstration](https://www.youtube.com/live/jNSKKaTySyQ?si=YnrrSfMApFuVjXKE&t=242) ayant eue lieue le 06 avril 2012.

## Implémentation technique

Dans le contexte de notre besoin, à savoir de pousser une mise à jour de module packagé sous GitHub, nous sommes confrontés à un élément de taille : **comment déceler qu'une nouvelle version est disponible** et, surtout, **comment permettre au marchand d'installer celle-ci en un clic** ?

### Première approche : standalone

Vous développez peu de modules open-source disponible gratuitement via GitHub ou vous n'avez pas envie de forcer l'utilisation d'un module tiers en supplément de votre module ; vous allez donc proposer une **approche intégrée**.

Dans cette approche, nous partirons d'un postulat : le marchand dispose d'ores et déjà d'une version installée de votre module et seules les mises à jours doivent être traitées. La découverte et l'installation de modules non présents sur le disque sera donc exclue.

#### Etape préalable

Dans l'approche souhaitée, nous utilisons la gestion des `releases` fournies par GitHub.

Nous souhaitons par la même occasion utiliser les différents assets disponibles sur une release donnée, afin de fournir une archive ZIP en bonne et due forme, attendue par PrestaShop pour la mise à jour d'un module.

Nous nous baserons donc sur une action GitHub utilisée par PrestaShop sur les modules open-source : le `build release`.

Dans votre dépot GitHub, vous aurez dès lors le fichier suivant : `.github/workflows/build-release.yml`.

```yml
name: Build
on: [push, pull_request]

jobs:
  build-and-release-draft:
    name: Build & Release draft
    uses: PrestaShop/.github/.github/workflows/build-release.yml@master
```

Une série d'actions sera réalisée par ce [workflow](https://github.com/PrestaShop/.github/blob/3efc27189527a7a9b9b0c0305501bf5146029289/.github/workflows/build-release.yml) afin notamment de nettoyer l'archive de fichiers et dossiers de tests ou encore d'ajouter automatiquement les `index.php` manquants.

<Warning title="Ce workflow nécessite l'ajout d'un secret sur votre repository : GITHUB_TOKEN." />

De plus, vous aurez également le fichier suivant : `.github/release-drafter.yml`.

```yml
branches:
  - master
  - main
name-template: v$NEXT_PATCH_VERSION
tag-template: v$NEXT_PATCH_VERSION
categories:
  - title: 🚀 Features
    label: features 🚀
  - title: ✨ Improvements
    label: enhancement ✨
  - title: 🐞 Bug Fixes
    label: bug 🐞
change-template: '- #$NUMBER: $TITLE by @$AUTHOR'
template: |
  # Changes
  $CHANGES
```

Il servira de modèle de template pour la release ; libre à vous de le modifier comme vous l'entendez.

<Info title="Désormais, chaque pull request associée à la branche main/master permettra d'actualiser une release draft." />

#### Implémentation du trait

<Warning title="Dans la suite de l'article, nous allons rencontrer plusieurs issues. Cette implémentation va donc varier au fil de l'article." />

Dans ce trait, nous allons donc récupérer la dernière release d'un repository donné - ce y compris son changelog - et le retourner en informations à la page de gestion des modules.

On placera le code de ce dernier dans le fichier `src/PrestaShop/Module/UpgradeManager.php`.

```php
<?php

namespace PrestaShop\Module;

use Exception;
use Tools;

trait UpgradeManager
{
    public function install()
    {
        return $this->registerHook([
            'actionListModules',
            ]
        );
    }

    /**
     * @return string
     */
    protected function getRepository() : string
    {
        if (!isset(self::$githubRepository)) {
            return '';
        }

        return self::$githubRepository;
    }

    /**
     * @return string
     */
    protected function getUpgradeURL() : string
    {
        return sprintf('https://api.github.com/repos/%s/releases/latest', $this->getRepository());
    }

    function getGithubHeaders() {
      return [
        'http' => [
          'method'=> "GET",
          'header'=> [
            "Accept: application/vnd.github+json",
            "X-GitHub-Api-Version: 2022-11-28",
          ],
        ],
      ];
    }

    protected function getLatestRelease()
    {
      $upgradeModuleURL = $this->getUpgradeURL();

      if ($upgradeModuleURL == '') {
          return [];
      }

      $latestRelease = self::file_get_contents_curl($upgradeModuleURL, false, $this->getGithubHeaders());
      try {
        $latestRelease = json_decode($latestRelease, true, 512, JSON_THROW_ON_ERROR);

        if (!is_array($latestRelease) || !isset($latestRelease['tag_name'])) {
          return [];
        }

        $latestRelease['version_available'] = str_replace('v', '', $latestRelease['tag_name']);
        $latestRelease['download_url'] = $this->getDownloadUrl($latestRelease);
        $latestRelease['changeLog'] = $this->getChangelog($latestRelease);
      } catch (Exception $e) {
        dump($e->getMessage());
        return [];
      }

      return $latestRelease;
    }

    protected function getModuleData()
    {
      $latestRelease = $this->getLatestRelease();

      $module = [
        'name' => $this->name,
        'version_available' => isset($latestRelease['version_available']) ? $latestRelease['version_available'] : $this->version,
        'download_url' => isset($latestRelease['download_url']) ? $latestRelease['download_url'] : '',
        'additional_description' => isset($latestRelease['additional_description']) ? $latestRelease['additional_description'] : '',
        'url_active' => 'upgrade',
        'changeLog' => isset($latestRelease['changeLog']) ? $latestRelease['changeLog'] : null,
        'urls' => [
            'upgrade' => isset($latestRelease['download_url']) ? $latestRelease['download_url'] : '',
        ],
        'productType' => 'module', // module, service
      ];

      return $module;
    }

    public function getDownloadUrl($latestRelease = [])
    {
      if (empty($latestRelease['assets']) || !is_array($latestRelease['assets'])) {
        return null;
      }

      foreach ($latestRelease['assets'] as $asset) {
        $assetName = str_replace('.zip', '', $asset['name']);
        if ('application/zip' == $asset['content_type'] && $this->name == $assetName) {
          return $asset['browser_download_url'];
        }
      }

      return '';
    }

    public function getChangelog($latestRelease = [])
    {
      if (empty($latestRelease['body'])) {
        return null;
      }

      $lines = preg_split("/\r\n|\n|\r/", $latestRelease['body']);

      if (!is_array($lines)) {
        return null;
      }

      $changelog = [
        $latestRelease['version_available'] => [
          0 => '',
        ],
      ];
      foreach ($lines as $line) {
        if (substr($line, 0, 1) === "-") {
          $line = str_replace('-', '', $line);
          $changelog[$latestRelease['version_available']][] = $line;
        }
      }

      return $changelog;
    }

    /**
     * @return array<array<string, string>>
     */
    public function hookActionListModules($params): array
    {
      if ($this->getRepository() == '') {
        return [];
      }

      $modules = [];

      $module = $this->getModuleData();
      if (!empty($module)) {
        $modules[] = $module;
      }

      return $modules;
    }

    /**
     * @param string $url
     * @param int $curl_timeout
     * @param array $opts
     *
     * @return bool|string
     *
     * @throws Exception
     */
    private static function file_get_contents_curl(
      $url,
      $curl_timeout,
      $opts,
      $user_agent = 'PrestaShop-ModuleAutoUpgrade'
    ) {
        $content = false;

        if (function_exists('curl_init')) {
          Tools::refreshCACertFile();
          $curl = curl_init();

          curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
          curl_setopt($curl, CURLOPT_URL, $url);
          curl_setopt($curl, CURLOPT_CONNECTTIMEOUT, 5);
          curl_setopt($curl, CURLOPT_TIMEOUT, $curl_timeout);
          curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, true);
          curl_setopt($curl, CURLOPT_CAINFO, _PS_CACHE_CA_CERT_FILE_);
          curl_setopt($curl, CURLOPT_FOLLOWLOCATION, true);
          curl_setopt($curl, CURLOPT_MAXREDIRS, 5);
          curl_setopt($curl, CURLOPT_USERAGENT, $user_agent);

          if (isset($opts['http']['header'])) {
            curl_setopt($curl, CURLOPT_HTTPHEADER, $opts['http']['header']);
          }

          $content = curl_exec($curl);

          if (false === $content && _PS_MODE_DEV_) {
            $errorMessage = sprintf('file_get_contents_curl failed to download %s : (error code %d) %s',
              $url,
              curl_errno($curl),
              curl_error($curl)
            );

            throw new \Exception($errorMessage);
          }

          curl_close($curl);
        }

      return $content;
    }
}
```

On utilise dès lors uniquement un seul des nouveaux hooks disponibles : `actionListModules`.

#### Utilisation

On va désormais pouvoir importer ce **trait** via l'autoload `Composer` et l'utiliser dans la classe principale du module.

```json
{
  "name": "prestaedit/test",
  "description": "Your module with AutoUpgrade management",
  "autoload": {
    "psr-4": {
      "PrestaShop\\Module\\": "src/PrestaShop/Module/"
    }
  },
  "type": "prestashop-module"
}
```

Bien entendu, ceci est un extrait de votre potentiel fichier `composer.json` et je vous invite vivement à modifier le namespace utilisé pour le rendre unique, par exemple en le préfixant du nom de votre module.

Partir sur un *trait* permet d'éviter de devoir modifier la classe que l'on souhaite étendre et de faire appel au parent lors de l'installation.

Notre méthode d'installation ayant toutefois le même nom, on l'importera sous un **alias**.
Cet alias sera ensuite appellé dans notre méthode d'installation.

```php
<?php

declare(strict_types=1);

if (!defined('_PS_VERSION_')) {
    exit;
}

if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    require_once __DIR__ . '/vendor/autoload.php';
}

use PrestaShop\Module\UpgradeManager;

class Test extends Module
{
    use UpgradeManager {
        install as protected upgradeManagerInstall;
    }

    protected static $githubRepository = 'PrestaEdit/test';

    public function __construct()
    {
        $this->name = 'test';
        $this->displayName = $this->trans('Test', [], 'Modules.Test.Admin');
        $this->description = $this->trans('Description.', [], 'Modules.Test.Admin');
        $this->author = 'PrestaEdit';
        $this->version = '0.0.1';
        $this->ps_versions_compliancy = ['min' => '8.0.0', 'max' => _PS_VERSION_];
        parent::__construct();
    }

    public function install(): bool
    {
        return parent::install()
            && $this->upgradeManagerInstall()
            ;
    }
}
```

Veuillez noter que nous avons également ajouter la déclaration de la variable `githubRepository` permettant de renseigner le repository concerné par le module.

#### Problème n°1 : le rate limit

Un utilisateur **non authentifié** ; c'est-à-dire qu'il ne renseigne pas de token associé à son compte, sera **limité à 60 requêtes** par heure sur l'API Rest de GitHub.

Si vous disposez d'un ensemble de modules se servant de cette mécanique et que vous ouvrez la page des modules qui aura pour effet de déclencher les hooks concernés - et dès lors un appel à l'API - plusieurs fois d'affilés, vous risquez fort d'atteindre rapidement cette limite.

Pour cela, nous intégrons un cache à la requête effectué.

```php
    /**
     * @return int
     */
    protected function getCachedHours() : int
    {
        if (!isset(self::$cachedHours)) {
            return 72;
        }

        return (int) self::$cachedHours;
    }
```

Par défaut, une valeur de 72 heures (3 jours) est renseignée.
Vous pouvez modifier cette valeur sur votre module grâce à la propriété correspondante.

```php
  protected static $cachedHours = 24;
```

```php
  protected function getLatestRelease()
  {
    // Clé unique, restriction de caractères
    $configurationId = 'ModuleAutoUpgrade_' . Tools::hashIV(str_replace('/', '_', $this->getRepository()));
    if (!Configuration::hasKey($configurationId)) {
      $upgradeModuleURL = $this->getUpgradeURL();

      if ($upgradeModuleURL == '') {
          return [];
      }

      // [...]

      Configuration::updateValue($configurationId, json_encode($latestRelease), true);

      return $latestRelease;
    } else {
      // Delete cache, after n hours
      $collection = new PrestaShopCollection('Configuration');
      $collection->where('name', '=', $configurationId);
      $configuration = $collection->getLast();
      $start_date = new DateTime($configuration->date_add);
      $end_date = new DateTime();
      $interval = $start_date->diff($end_date);
      if ($interval->format('%R%h') == '+' . (int)$this->getCachedHours()) {
        Configuration::deleteByName($configurationId);
        return $this->getLatestRelease();
      }
    }

    return json_decode(Configuration::get($configurationId), true);
  }
```

Sans oublier de rajouter les nouveaux `use` correspondant :

```php
use Configuration;
use DateTime;
use PrestaShopCollection;
```

Bien entendu, une autre solution sera de renseigner un token, permettant de lever cette limite à **5000 requêtes par heure**.

#### Problème n°2 : le type mime

Lorsque l'on récupère un asset via l'API de GitHub ou par le biais de son URL direct (fournie en tant que `broswer_url` dans les informations de l'asset), nous sommes confrontés au même soucis : **le type mime** renvoyé est `application/octet-stream`.

Or, les deux `SourceHandler` fournit par PrestaShop travaillent soit avec une archive locale soit une archive distante dont le type mime renvoyé est **obligatoirement** `application/zip`.

Nous ne pouvons donc malheureusement pas nous appuyer sur le `RemoteZipSourceHandler` et sommes obligés de basculer sur le `ZipSourceHandler` qui traitera un fichier **local**.

Il est possible de n'utiliser aucun de ces deux handlers et de laisser un module se charger de cette mise à jour selon son propre fonctionnement.

Pour cela, lorsque l'on transmets le tableau d'informations au hook `actionListModules`, on peut omettre l'entrée `download_url`.
Ceci aura pour effet de retirer le paramètre `source` de l'URL de mise à jour et dès lors aucun handlers ne pourra se charger de la source, puisque inexistante.

Pour une raison que nous expliquerons plus tard, nous n'utiliserons pas cette technique.

Modifions dès lors le trait pour télécharger l'archive en amont sur le disque et ainsi utiliser un handler local.

```php
public function getDownloadUrl($latestRelease = [])
{
  if (empty($latestRelease['assets']) || !is_array($latestRelease['assets'])) {
    return null;
  }

  foreach ($latestRelease['assets'] as $asset) {
    $assetName = str_replace('.zip', '', $asset['name']);
    if ('application/zip' == $asset['content_type'] && $this->name == $assetName) {
      if (!is_dir(\_PS_CACHE_DIR_ . 'downloads/')) {
        mkdir(\_PS_CACHE_DIR_ . 'downloads/');
      }
      $archive = self::file_get_contents_curl($asset['url'], false, $this->getGithubHeaders(true));

      file_put_contents(\_PS_CACHE_DIR_ . 'downloads/' . $asset['name'], $archive);

      return \_PS_CACHE_DIR_ . 'downloads/' . $asset['name'];
    }
  }

  return '';
}
```

On pourra remarquer que nous passons désormais un paramètre à la méthode `getGithubHeaders()` que nous modifions comme suit :

```php
public function getGithubHeaders($downloadMode = false)
{
  $headers = [
    'http' => [
      'method'=> "GET",
      'header'=> [
        "X-GitHub-Api-Version: 2022-11-28",
      ],
    ],
  ];

  if (!$downloadMode) {
    $headers['http']['header'][] = 'Accept: application/vnd.github+json';
  } else {
    $headers['http']['header'][] = 'Accept: application/octet-stream';
  }

  return $headers;
}
```

#### Problème n°3 : la désactivation des hooks

Précédemment, nous avons vu qu'il était possible de n'indiquer **aucune source** et de laisser un module se charger d'**opérer lui-même** le téléchargement du fichier distant et de l'extraire.

Tout est à portée de main au sein de PrestaShop pour réaliser cette opération.

*Sauf que...*

Il nous faudrait nous baser sur le seul hook disponible et appellé lors d'une mise à jour souhaitée : `actionBeforeUpgradeModule`.
Jusque là, rien de bien contraignant.

*Oui, mais...*

Comme vous vous en douterez surement - *au vu du titre de cette section* - il s'avère que cette opération n'est en réalité pas possible au sein du même module du fait que **l'ensemble des hooks associés au module mis à jour sont désactivés**.

#### Problème n°4 : les repos privés

<Warning title="Avant de débuter cette section, rappellons avant tout qu'un token GitHub est une information privée et sensible. Toutes les alternatives mentionées et les décisions de les utiliser doivent êtres considérées avec le plus grand soin." />

Notre approche, jusque là, peut convenir pour l'ensemble des modules open-source publiés sous GitHub et qui sont sous des **repos publiques**.

Dès lors que l'on souhaite embarquer la découverte des mises à jours dans un module qui sera exclusivement privé, nous sommes confrontés à un problème de taille : évidemment, nul ne peut accéder aux informations de dernières releases et aux assets associés à celles-ci.

Notre appel à l'API de GitHub nécessite dès lors le **passage d'un token**.

<Warning title="Malgré le caractère privé du module, un token étant strictement confidentiel, il est vivement déconseillé voir interdit d'embarquer ce dernier en dur." />

Modifions notre trait pour utiliser un fichier **.env** afin de placer notre token dans un fichier séparé qui pourra être inclus dans le fichier **.gitignore**.

```php
use Symfony\Component\Dotenv\Dotenv;

trait UpgradeManager
{
    protected function getGithubToken()
    {
        $envVars = (new Dotenv())->parse(\file_get_contents($this->getLocalPath() . '.env'));

        if (isset($envVars['GITHUB_TOKEN'])) {
            return $envVars['GITHUB_TOKEN'];
        }

        return '';
    }
}
```

Modifions également notre tableau d'options pour modifier l'en-être envoyée à GitHub :

```php
public function getGithubHeaders($downloadMode = false)
{
  $headers = [
    'http' => [
      'method'=> "GET",
      'header'=> [
        "Authorization: Bearer " . $this->getGithubToken(),
        "X-GitHub-Api-Version: 2022-11-28",
      ],
    ],
  ];

  if (!$downloadMode) {
    $headers['http']['header'][] = 'Accept: application/vnd.github+json';
  } else {
    $headers['http']['header'][] = 'Accept: application/octet-stream';
  }

  return $headers;
}
```

Et, pour finir, notre fichier `.env` comme suit :

```
# .env
GITHUB_TOKEN="ghp_xxxx"
```

<Info title="Il est également possible d'envisager de regarder après un fichier .env plus générique que celui fourni dans le module directement." />

### Deuxième approche : module de distribution

Notre première approche nous aura permis de déceler plusieurs problématiques :
* l'impossibilité d'utiliser une source distante (**issue de GitHub**) ;
* la nécessite d'**embarquer un trait** et d'en **changer le namespace** ;
* la **gestion du token** GitHub pour chaque module.

Dans cette seconde approche, nous allons donc réaliser un dérivé du module de distribution de PrestaShop, à la nuance près que nous nous passerons d'une source de syndication externe.

<Warning title="Comme pour notre première approche, nous omettrons la partie découverte et installation de modules non présent sur le disque." />

#### Configuration du service

Puisque nous allons développer un module annexe, nous sommes plus libre sur la structure et la configuration de ce dernier.

Nous allons donc pouvoir utiliser un service en lieu et place d'un trait.

En voici son fichier de configuration :

```yml
parameters:
  ps_cache_dir: !php/const _PS_CACHE_DIR_

services:
  ghupgrademanager.upgrade_manager:
    class: PrestaShop\Module\GitHubUpgradeManager\UpgradeManager
    arguments:
      - '@ghupgrademanager.circuit_breaker'
      - '@prestashop.module.factory.sourcehandler'
      - '%ps_cache_dir%'
    public: true
```

<Warning title="L'illustration du fichier de configuration est incomplète." />

Vous pouvez consulter la source complète sur le [repo correspondant](https://github.com/PrestaEdit/ghupgrademanager).

<Info title="prestashop/circuit-breaker" />

L'utilisation du package [prestashop/circuit-breaker](https://github.com/PrestaShop/circuit-breaker) est vivement recommandée afin de **ne pas bloquer le back office en cas d'indisponibilité** de l'API de GitHub.

Nous n'avons pas besoin de l'ajouter comme dépendance de notre module, celui-ci est inclus par défaut dans PrestaShop depuis la version 1.7.7.0.

*Son implémentation fera l'objet d'un article à part entière.*

#### Implémentation du service

Le service étant significativement similaire à notre trait de la première approche, à l'exception de l'ajout du `CircuitBreaker` et de quelques menues adaptations, je vous invite à consulter [son code](https://github.com/PrestaEdit/ghupgrademanager/blob/main/src/UpgradeManager.php) directement sur GitHub.

#### Ajout du token GitHub

<Warning title="Avant de débuter cette section, rappellons avant tout qu'un token GitHub est une information privée et sensible. Toutes les alternatives mentionées et les décisions de les utiliser doivent êtres considérées avec le plus grand soin." />

Puisqu'il s'agit d'un secret, je vous invite à utiliser les **variables chiffrées** prévues à cet effet :

```bash
php bin/console secrets:set GITHUB_TOKEN
```

Sinon, il est possible d'utiliser un fichier `.env` à la racine du PrestaShop ou encore directement dans le dossier du module pour y ajouter la variable `GITHUB_TOKEN`.

Dans la configuration de nos services, nous trouverons dès lors :

```yml
parameters:
  env(GITHUB_TOKEN): ''

services:
  ghupgrademanager.upgrade_manager:
    class: PrestaShop\Module\GitHubUpgradeManager\UpgradeManager
    arguments:
      - '@ghupgrademanager.circuit_breaker'
      - '@prestashop.module.factory.sourcehandler'
      - '%ps_cache_dir%'
      - '%env(GITHUB_TOKEN)%'
    public: true
```

Et dans notre service :

```php
class UpgradeManager
{
  /** @var string */
  private $githubToken;

  public function __construct(
    CircuitBreakerInterface $circruitBreaker,
    SourceHandlerFactory $sourceHandlerFactory,
    string $cacheDirectory,
    string $githubToken
  ) {
    $this->circruitBreaker = $circruitBreaker;
    $this->sourceHandlerFactory = $sourceHandlerFactory;
    $this->cacheDirectory = rtrim($cacheDirectory, '/');
    $this->githubToken = $githubToken;
  }

  protected function getGithubToken()
  {
    if (!empty($this->githubToken)) {
      return $this->githubToken;
    }

    if (is_file(_PS_ROOT_DIR_ . '/.env')) {
      $envVars = (new Dotenv())->parse(\file_get_contents(_PS_ROOT_DIR_ . '/.env'));

      if (isset($envVars['GITHUB_TOKEN'])) {
        return $envVars['GITHUB_TOKEN'];
      }
    } else if (is_file(_PS_MODULE_DIR_ . 'ghupgrademanager/.env')) {
      $envVars = (new Dotenv())->parse(\file_get_contents(_PS_MODULE_DIR_ . 'ghupgrademanager/.env'));

      if (isset($envVars['GITHUB_TOKEN'])) {
        return $envVars['GITHUB_TOKEN'];
      }
    }

    return '';
  }
}
```

#### Problème n°1 : la découverte des modules

Puisque nous ne passons pas par une API externe pour fournir une liste des repos GitHub concernés par l'ensemble des modules dont nous souhaiterions découvir les mises à jour, il nous faut trouver un moyen de les **transmettre au module de distribution**.

On pourrait bien entendu imaginer **un tableau ancré dans le module** que nous ferions varier au besoin.

Certes, cela nécessiterait une mise à jour du module de distribution en premier lieu.

Sans oublier que nous ne pourrions pas utiliser ce module pour gérer sa propre mise à jour, suite à la désactivation des hooks précédemment vue.

Partons sur un principe commun au développement de modules PrestaShop : **l'utilisation de hooks**.

<Info title="L'utilisation d'une API externe est bien entendu recommandée dans ce cas-ci. Dans l'optique de fournir un module fonctionnement de lui-même, nous travaillerons différement son implémentation." />

Modifions dès lors le service comme suit :

```php
/**
 * @return array<array<string, string>>
 */
public function getModulesList($cache = false): array
{
  $modules = [];

  $cachedFile = $this->cacheDirectory . '/github-upgrade-manager/' . Tools::hashIV(str_replace('/', '_', \Context::getContext()->shop->name));

  if ($cache) {
    if (file_exists($cachedFile)) {
      $modules = file_get_contents($cachedFile);
      $modules = json_decode($modules, true);
    }

    return $modules;
  }

  $repositories = Hook::exec(
    'actionRegisterGitHubAutoUpgrade',
    [],
    null,
    true,
    true,
    false,
    null,
    true
  );
  foreach ($repositories as $moduleName => $repository) {
    $latestRelease = $this->getLatestRelease($moduleName, $repository);
    if (is_array($latestRelease)) {
      $attributes = [
        'name' => $moduleName,
        'version_available' => $latestRelease['version_available'],
        'archive_url' => $latestRelease['download_url'],
        'asset_url' => $latestRelease['asset_url'],
        'changeLog' => $latestRelease['changeLog'],
      ];
      $modules[] = $attributes;
    }
  }

  file_put_contents($cachedFile, json_encode($modules));

  return $modules;
}

public function downloadModule(string $moduleName): void
{
  $modules = $this->getModulesList(true);
  foreach ($modules as $module) {
    if ($module['name'] === $moduleName) {
      $this->doDownload($module);
      break;
    }
  }
}
```

Au sein de notre module concerné :

```php
public function hookActionRegisterGitHubAutoUpgrade($params)
{
    return [$this->name => 'PrestaEdit/passwordgenerator'];
}
```

N'oublions pas d'ajouter l'enregistrement du hook au moment de l'installation et éventuellement dans un fichier d'upgrade.

<Info title="Nous avons ajouté un système de cache permettant d'obtenir la liste des modules au moment de la gestion de la demande de mise à jour.
Sans quoi le hook actionRegisterGitHubAutoUpgrade du module cible serait désactivé et donc non listé." />

#### Problème n°2 : la compatibilité des modules

N'utilisant pas une source de syndication externe pour obtenir la liste des modules et ainsi agrégé les données obtenues, nous ne pouvons garantir que la dernière release d'un module soit compatible avec la version de PrestaShop utilisée.

Une vérification de cette plage de compatibilité devrait être exercée en supplément.

## Pour aller plus loin

Ceci est avant tout un POC permettant une utilisation directe. Nous pourrions modifier plus en profondeur le module afin notamment de gérer plusieurs tokens GitHub ou encore d'autres sources de données (Gitlab, BitBucket, ...).

L'idée de cet article est avant tout de pointer les possibilités et problématiques rencontrées lors du développement.

<Info title="A vos idées !" />

### Marketplace

Sur cette même base, nous pourrions évoquer l'idée d'un module de marketplace ou, comme je préfère l'appeller, de syndication externe.

Couplé à une API permettant à un éditeur tiers de renseigner une nouvelle version d'un module - imaginons un module gratuit en libre téléchargement sur le site de l'éditeur -, il serait possible également de faciliter la gestion de la découverte de modules.

<Info title="Lors de développement, il est habituel d'avoir un ensemble d'idées nouvelles. Le plus important restant à concrétiser les concepts." />

<blockquote class="twitter-tweet"><p lang="fr" dir="ltr">Suis-je le seul à dire à voix haute et affirmer avec une certitude quasi inébranlable que 2023, maximum début 2024, verra naître une nouvelle marketplace de modules <a href="https://twitter.com/hashtag/PrestaShop?src=hash&amp;ref_src=twsrc%5Etfw">#PrestaShop</a> et, aussi, que des projets du type de PrestaTrust pourrait faire un retour fracassant (et utile !)? 🤔</p>&mdash; Jonathan Danse (@PrestaEdit) <a href="https://twitter.com/PrestaEdit/status/1511816489225048078?ref_src=twsrc%5Etfw">April 6, 2022</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

<blockquote class="twitter-tweet" data-theme="light"><p lang="fr" dir="ltr">Il y a finalement plus d&#39;un an, j&#39;évoquais l&#39;idée d&#39;une nouvelle marketplace pour <a href="https://twitter.com/hashtag/PrestaShop?src=hash&amp;ref_src=twsrc%5Etfw">#PrestaShop</a> (8.x).<br><br>Cette semaine, l&#39;idée a germée différemment : permettre de centraliser les différentes sources de modules en un point central.<br><br>Ce soir, les prémices de ceci sont apparues. <a href="https://t.co/elgAuRd0pb">pic.twitter.com/elgAuRd0pb</a></p>&mdash; Jonathan Danse (@PrestaEdit) <a href="https://twitter.com/PrestaEdit/status/1648793881499115521?ref_src=twsrc%5Etfw">April 19, 2023</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

### Liens

Sur le même thème, je vous invite à consulter l'article ["Prestashop : Mettez en avant vos modules dans le listing des modules dans l’administration"](https://www.h-hennes.fr/blog/2023/06/21/prestashop-mettez-en-avant-vos-modules-dans-le-listing-des-modules-dans-ladministration/).
