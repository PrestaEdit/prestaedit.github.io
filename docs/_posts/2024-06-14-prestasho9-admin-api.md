---
title: "PrestaShop 9 : Api d'administration (Admin API)"
date: 2024-06-14
tags:
  - PrestaShop 9
  - Tutoriel
author: PrestaEdit
featuredimg: 'https://prestaedit.github.io/head/2024-06-13-admin-api.png'
summary: "Tour d'horizon et tutoriel relatif à la nouvelle API de PrestaShop"
---

<Info title='Cet article est une version traduite et modifiée du billet de blog "Meet The New API Platform-Based API In PrestaShop 9"' />

Vous pourrez trouver l'article original sur [ce lien](https://build.prestashop-project.org/news/2024/meet-prestashop9-api/)

## Préambule

A la suite de la [sortie de la version 9 (Alpha.1)](https://prestaedit.github.io/2024/06/13/prestashop9-alpha-1/) de PrestaShop, de nouvelles fonctionnalités font leur apparition.

La **nouvelle API** - *nommée Api d'administration (Admin API)* - est l'une d'elle.

Cette version majeure voit sa dépendance principale obtenir une mise à jour de taille : Symfony passe de la version 4.4 à la version **6.4**.

Dans la foulée, la version de API Platform utilisée passe de la version 2.7.6 à la version **3.2.13**.

Cette a été annoncée pour la première fois, durant un [Live Update](https://youtu.be/jzKBQM3fprY?t=1341), le **21 juin 2023** et une [présentation plus fonctionnelle](https://youtu.be/7CQ2Sg-v4XQ?t=1216) a été réalisée **fin décembre 2023**.

<Info title="Cette nouvelle API utilise le protocole d'autorisation OAuth et les commandes CQRS pour la gestion des endpoints. Offrant ainsi une gestion plus fine des évènements métiers." />

<Info title="Le Webservice connu et existant dans PrestaShop peut tourner en parralèle de l'utilisation de cette API." />

## Lexique

Afin de faciliter la lecture de ce tutoriel, voici un lexique concernant les principaux concepts du protocole OAuth.

- **Utilisateur (*Resource Owner*)** : Entité qui a la possibilité de définir les accès à une ressource protégée. Ici, le marchand ayant accès au Back Office.
- **Client** : Application effectuant la requête d'accès des ressources.
- **Jeton (*Access Token*)** : Token d'accès.
- **Serveur d'autorisation (*Authorization Server*)** : Chargé d'authentifier le client et de délivrer le jeton.
- **Scope** : Type et périmètre des ressources demandées.
- **JWT Token (*Json Web Token*)** : Permet l'échange sécurisé de jetons entre plusieurs parties.

## Création d'un client API

Afin d'ajouter un client API, rendez-vous sur la page **API d'administration** située dans le menu **Paramètres avancés**.

Vous trouverez le bouton **Ajouter un nouveau client API** en haut de cette page.

Vous pouvez procéder à l'enregistrement de plusieurs clients.

Afin de procéder à l'ajout d'un nouveau client, il est nécessaire de renseigner un ensemble d'information à son propos.

<img :src="$withBase('/posts/2024-06-14-prestasho9-admin-api/01.png')" alt="Capture">

- **Nom du client** : texte libre. Pour référence interne.
- **ID client** : identifiant unique. Ne doit pas contenir d'espace ou de caractère spécial.
- **Description** : description plus complète du client. Pour référence interne.
- **Durée de vie** : durée de vie du jeton d'accès. En secondes. Par défaut : 3600.
- **Activé** : état du client.
- **Périmètres d'application** : ensemble des périmètres d'applications que le client peut utiliser.

Lors de l'enregistrement du formulaire, un secret pour le client sera généré et enregistré en base de données.

Celui-ci vous est indiquer dans le message de confirmation.

<img :src="$withBase('/posts/2024-06-14-prestasho9-admin-api/02.png')" alt="Capture">

<Warning title="Cette valeur secrète ne sera affichée qu'une seule fois. N'oubliez pas d'en faire une copie dans un endroit sûr." />

## Octroi des informations d'identification du client

Désormais, vous pouvez réaliser une connection à l'API.

Afin de pouvoir utiliser les périmètres d'applications de notre API via les endpoints prévus à cet effet, nous devons tout d'abord obtenir le **jeton d'accès**.

Une requête **POST** sur l'endpoint `/admin-api/access_token` sera réalisée à cet effet.

Elle contiendra les paramètres suivants :
- **client_id** : l'identifiant unique de votre client.
- **client_secret** : le secret généré lors de l'ajout du client.
- **grant_type** : le type d'octroi que vous souhaitez réaliser. Ici, ce sera `client_credentials`.
- **scope** : les périmètres d'application pour lesquels vous demandez un accès. Vous pouvez en définir plusieurs.

<img :src="$withBase('/posts/2024-06-14-prestasho9-admin-api/03.png')" alt="Capture">

En guise de réponse, vous obtiendrez un JSON mentionnant le jeton d'accès.

```json
{
	"token_type": "Bearer",
	"expires_in": 3600,
	"access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiJQcmVzdGFFZGl0IiwianRpIjoiZmI2NGUyMjNlNDMyNjc4MjRkOThhNTIyZmQ2NmEyZWEyMjQzYTU3MmViYzQxNDNlMGFjNDdlMDNiZjAwYTA3YWVmOGY5MjBhYmY0OGExNTYiLCJpYXQiOjE3MTgzODQ3MjIuMTY4NzQ0LCJuYmYiOjE3MTgzODQ3MjIuMTY4NzQ2LCJleHAiOjE3MTgzODgzMjIuMTU5ODYzLCJzdWIiOiIiLCJzY29wZXMiOlsiaXNfYXV0aGVudGljYXRlZCIsImN1c3RvbWVyX2dyb3VwX3JlYWQiXX0.sY5zERP_P6VSaUej7lk2uutLjiVX0vW6_fopiKHw_XSpVCbcg_tnV8XaYPgoDj2dXiVLRNPq6C4B1XtcYGTRnAh_ek80fGp-zWWsGS__WsB0gnOd9JDZIkh8DZ9o4Luv1rMriRCk0rODyjyFGEwGUwAeEqeKQT0994ndU-w93cBF5yPOGULFVOvgNIhPOeoGVEwJVOj9YKa58HWoNVgxRSQ8zqRGrLRXAeoXyDlsspu3shVJKX-9uDT3H7QGqWTICdkRu2U-jpBLSUcvGkuMM7ehgqHRT7JDAYAKkFxDps2IK6HDzrPckqmNQDX31pDgh2e8oPOVheBkN8aCWAIJdw"
}
```

<Warning title="Lorsque vous travaillez en local, dans un environnement non sécurisé, vous otbiendrez l'erreur suivante : Use HTTPS response." />

Vous pouvez forcer la désactivation de cette sécurité en désactivation l'option **Forcer la sécurité en mode débogage**. Cette option est visible lorsque le mode debug est activé.

### Bearer Token

Le jeton qui se cache derrière la propriété `access_token` est un jeton d'authentification **Bearer**.

Vous pourrez dès lors l'utiliser dans vos requêtes destinées à l'API d'administration en authentifiant votre demande.

Pour cela, vous devrez fournir l'en-tête `Authorization` comme suit : `Bearer <TOKEN>`.

Ce jeton est **limité dans le temps** (durée de vie définie lors de la création du client) et une fois celui-ci expiré, il sera nécessaire de relancer l'étape d'accès à l'application.

Le jeton est de type **Json Web Token** (JWT) signé avec une clé secrète. Vous pouvez voir le contenu du token en le décodant sur [ce site (jwt.io)](https://jwt.io).

## Serveur d'autorisation

Le serveur d'autorisation est reponsable de l'adresse des jetons d'accès ainsi que de la validation des clients et des périmètres d'application qui leurs sont attribués.

Dans l'approche PrestaShop, le serveur d'autorisation est **construit dans l'API elle-même**.

Vous avez toutefois la possibilité de **remplacer** le serveur d'autorisation pré-embarqué par un serveur implémentation l'authentification OAuth2.

En exemple, vous pouvez utiliser [Keycloak](https://www.keycloak.org/) qui est une solution open-source.

PrestaShop fournit également un [module d'exemple](https://github.com/PrestaShop/keycloak_connector_demo) permettant l'intégration de *Keycloak* à *PrestaShop*.

## Informations à propos du client API

Afin de tester notre jeton d'accès, nous allons effectuer une requête nous permettant de connaitre les informations de notre client.

Pour cela, une requête de type **GET** sera effectuée sur l'endpoint `/admin-api/api-client/info`.

Aucun paramètre n'est requis. Seul l'en-tête mentionnant le token Bearer est nécessaire.

<img :src="$withBase('/posts/2024-06-14-prestasho9-admin-api/04.png')" alt="Capture">

La réponse obtenue ressemblera à ceci :

```json
{
	"apiClientId": 1,
	"clientId": "PrestaEdit",
	"clientName": "Blog de PrestaEdit",
	"description": "Une application exemple pour le blog de PrestaEdit",
	"enabled": true,
	"lifetime": 3600,
	"scopes": [
		"api_client_read",
		"api_client_write",
		"cart_rule_write",
		"customer_group_read",
		"customer_group_write",
		"hook_read",
		"hook_write",
		"module_read",
		"module_write",
		"product_read",
		"product_write"
	]
}
```

<Warning title="Les périmères d'application visible dans le retour JSON sont ceux définis pour le client. Ils peuvent varier de ceux attribués au jeton d'accès, si ils ont été modifiés par après." />

## Récupération d'une ressource

De la même manière, la récupération d'une ressource se fera en réalisant une requête de type **GET** sur un endpoint donné.

L'**identifiant** de la ressource étant communiqué directement dans l'URL.

Ainsi, pour récupérer les informations sur le groupe de clients ayant pour identifiant 2, l'URL suivante sera utilisée : `/admin-api/customers/group/2`.

<img :src="$withBase('/posts/2024-06-14-prestasho9-admin-api/05.png')" alt="Capture">

Le retour JSON :

```json
{
	"customerGroupId": 2,
	"localizedNames": {
		"1": "Invité",
		"2": "Guest",
		"3": "Guest"
	},
	"reductionPercent": 0.0,
	"displayPriceTaxExcluded": false,
	"showPrice": true,
	"shopIds": [
		1
	]
}
```

### Liste des ressources disponibles

Sur la page d'administration de l'API, vous pourrez visualiser deux liens indiqués dans un message d'information.

Le lien au format HTML vous permettra de visualiser les différentes ressources de la boutique.

<img :src="$withBase('/posts/2024-06-14-prestasho9-admin-api/06.png')" alt="Capture">

Vous pourrez facilement visualiser les **méthodes** et **paramètres** associés à ces ressources.

Vous aurez par ailleurs l'occasion de tester les endpoints en renseignant votre jeton d'accès sous la forme `Bearer <Token>` dans la module disponible via le bouton **Authorize**.

## Edition d'une ressource

L'édition d'une ressource se réalise sur le même endpoint que la récupération d'une ressource définie, mais en utilisant une méthode **PUT** en lieu et place de la méthode **GET**.

Dans le **corps** (body) de la requête, vous passez le JSON des données à modifier.

Il n'est **pas nécessaire** de renvoyer le JSON **complet**, tel que reçu durant la récupération.

<img :src="$withBase('/posts/2024-06-14-prestasho9-admin-api/07.png')" alt="Capture">

Le retour JSON, si l'opération s'est bien déroulée, sera la même que lors de la récupération de la ressource.

En Back Office, on peut voir la ressource modifiée.

<img :src="$withBase('/posts/2024-06-14-prestasho9-admin-api/08.png')" alt="Capture">

## Ajout d'une ressource

Pour effectuer un ajout, une requête **POST** sera réalisée sur l'endpoint de la ressource souhaitée.

L'URL utilisée ne comportera pas d'identifiant particulier.

Dans le corps de la requête, vous transmettez le JSON définissant la ressource à ajoutée.

```json
{
  "localizedNames": {
      "1": "Blog",
      "2": "Blog",
      "3": "Blog"
    },
    "reductionPercent": 0.0,
    "displayPriceTaxExcluded": false,
    "showPrice": true,
    "shopIds": [
      1
    ]
}
```

Une fois la requête effectuée, vous obtenez le JSON définissant la ressource avec l'identifiant qui lui est associé.

```json
{
	"customerGroupId": 4,
	"localizedNames": {
		"1": "Blog",
		"2": "Blog",
		"3": "Blog"
	},
	"reductionPercent": 0.0,
	"displayPriceTaxExcluded": false,
	"showPrice": true,
	"shopIds": [
		1
	]
}
```

Et vous pouvez visualiser la ressource ajoutée en Back Office.

<img :src="$withBase('/posts/2024-06-14-prestasho9-admin-api/09.png')" alt="Capture">

## Suppression d'une ressource

La supression d'une ressource s'effectue via une requête **DELETE** sur l'endpoint souhaité.

Par exemple, afin de supprimer notre groupe de client nouvellement ajouté, l'URL utilisée sera : `/admin-api/customers/group/4`.

## Collection OpenAPI

Au niveau de la section "Liste des ressources disponibles", nous avons vu qu'il existait deux formats de documentation disponible.

Tandis que nous utilisons le format **HTML** pour visualiser aisément les différents types de ressources, nous pourrons utiliser le format **JSON** pour réaliser un i**mport de la collection** de ressources dans l'application utilisée pour effectuer les requêtes (*Postman*, *Insomnia*, ...).

Le format de la colletion est au format **OpenAPI**.

<img :src="$withBase('/posts/2024-06-14-prestasho9-admin-api/10.png')" alt="Capture">

<img :src="$withBase('/posts/2024-06-14-prestasho9-admin-api/11.png')" alt="Capture">

<img :src="$withBase('/posts/2024-06-14-prestasho9-admin-api/12.png')" alt="Capture">

## Etendre l'API

<Info title="Un des principes fondamentaux de l'API est son extensabilité. Vous pouvez ajouter de nouveaux paramètres d'applications à l'API par le biais d'un module." />

Vous pourrez trouver le module exemple sur [ce lien](https://github.com/PrestaShop/example-modules/tree/master/api_module) ainsi que le module de ressources sur [ce lien](https://github.com/PrestaShop/ps_apiresources).

<Danger title="14 juin, 20:15 : au moment d'écrire cet article, il ne m'a pas été possible de vérifier ce point. Lorsqu'il m'aura été permis d'activer une nouvelle ressource, je ferais une mise à jour de l'article."/>

## Notes

Lorsque vous réaliserez vos tests sur l'API d'administration offerte dans les versions 9 de PrestaShop, vous pourriez être déstabilisé par le nombre de ressources disponibles.

Afin de vous rassurez, sachez qu'il ne sera **pas nécessaire de réaliser une mise à jour** de PrestaShop - *et donc d'attendre une mise à jour de version* - pour **bénéficier de nouveaux endpoints**.

Ceux-ci sont définis par l'application du module `ps_apiresources`.
