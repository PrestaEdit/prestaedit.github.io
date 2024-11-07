(window.webpackJsonp=window.webpackJsonp||[]).push([[26],{399:function(e,t,a){"use strict";a.r(t);var s=a(4),r=Object(s.a)({},(function(){var e=this,t=e._self._c;return t("ContentSlotsDistributor",{attrs:{"slot-key":e.$parent.slotKey}},[t("Danger",{attrs:{title:"Cette version est une version destinée aux développements et tests. Il ne s'agit pas d'une version de production."}}),e._v(" "),t("h2",{attrs:{id:"preambule"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#preambule"}},[e._v("#")]),e._v(" Préambule")]),e._v(" "),t("p",[e._v("La version 8 de PrestaShop est sortie le 26 octobre 2022.")]),e._v(" "),t("p",[e._v("Une année et sept mois environ plus tard, le 6 juin 2024, l'alpha.1 de PrestaShop 9 est de sortie.")]),e._v(" "),t("h2",{attrs:{id:"changements-majeurs"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#changements-majeurs"}},[e._v("#")]),e._v(" Changements majeurs")]),e._v(" "),t("h3",{attrs:{id:"symfony"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#symfony"}},[e._v("#")]),e._v(" Symfony")]),e._v(" "),t("p",[e._v("Le framework Symfony a été mis à jour.\nDésormais, c'est la version "),t("strong",[e._v("6.4")]),e._v(" qui est embarquée.")]),e._v(" "),t("p",[e._v("La version 8.1 utilisait une version 4.4 de Symfony.")]),e._v(" "),t("h3",{attrs:{id:"versions-de-php"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#versions-de-php"}},[e._v("#")]),e._v(" Versions de PHP")]),e._v(" "),t("p",[e._v("La version minimale de PHP utilisable pour cette version est la "),t("strong",[e._v("8.1")]),e._v(".")]),e._v(" "),t("p",[e._v("Le support des versions "),t("strong",[e._v("8.2")]),e._v(" et "),t("strong",[e._v("8.3")]),e._v(" est également disponible.")]),e._v(" "),t("h3",{attrs:{id:"admin-api"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#admin-api"}},[e._v("#")]),e._v(" Admin API")]),e._v(" "),t("p",[e._v("Dans l'optique de remplacer l'obsolète système de webservice, une nouvelle API est embarquée dans cette version de PrestaShop.")]),e._v(" "),t("Info",{attrs:{title:"Un article à ce propos sera bientôt publié"}}),e._v(" "),t("h3",{attrs:{id:"symfony-2"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#symfony-2"}},[e._v("#")]),e._v(" Symfony")]),e._v(" "),t("h4",{attrs:{id:"layout"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#layout"}},[e._v("#")]),e._v(" Layout")]),e._v(" "),t("p",[e._v("Le Back Office est désormais entièrement géré par "),t("strong",[e._v("Symfony")]),e._v(" et des composants "),t("strong",[e._v("Twig")]),e._v(".")]),e._v(" "),t("p",[e._v("A noter également que la page de connexion au Back Office est maintenant également gérée par Symfony. Cette étape permettra notamment de pousser la sécurité autour de cette page et de l'étendre, dans le futur.")]),e._v(" "),t("h4",{attrs:{id:"front-office"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#front-office"}},[e._v("#")]),e._v(" Front Office")]),e._v(" "),t("p",[e._v("Le "),t("strong",[e._v("conteneur Symfony")]),e._v(" est désormais accessible en Front Office, permettant d'utiliser les composants Symfony.")]),e._v(" "),t("Info",{attrs:{title:"Cette fonctionnalité est disponible via un Feature Flag"}}),e._v(" "),t("h2",{attrs:{id:"installation"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#installation"}},[e._v("#")]),e._v(" Installation")]),e._v(" "),t("p",[e._v("A la suite d'un "),t("a",{attrs:{href:"https://build.prestashop-project.org/news/2024/new-zip-distribution-channel/",target:"_blank",rel:"noopener noreferrer"}},[e._v('"changement récent"'),t("OutboundLink")],1),e._v(", "),t("strong",[e._v("les archives ne seront plus disponibles via GitHub")]),e._v(".")]),e._v(" "),t("p",[e._v("Vous devrez donc tout d'abord réaliser une release via l'outil de création des releases.")]),e._v(" "),t("h3",{attrs:{id:"pre-requis"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#pre-requis"}},[e._v("#")]),e._v(" Pré-requis")]),e._v(" "),t("ul",[t("li",[e._v("PHP 8.1")]),e._v(" "),t("li",[e._v("Composer 2")]),e._v(" "),t("li",[e._v("Node.js 16")]),e._v(" "),t("li",[e._v("NPM 8")])]),e._v(" "),t("h3",{attrs:{id:"creation-de-la-release"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#creation-de-la-release"}},[e._v("#")]),e._v(" Création de la release")]),e._v(" "),t("p",[e._v("Tout d'abord, cloner le repository de PrestaShop sur la branche souhaitée.")]),e._v(" "),t("div",{staticClass:"language-bash extra-class"},[t("pre",{pre:!0,attrs:{class:"language-bash"}},[t("code",[t("span",{pre:!0,attrs:{class:"token function"}},[e._v("git")]),e._v(" clone git@github.com:PrestaShop/PrestaShop.git "),t("span",{pre:!0,attrs:{class:"token parameter variable"}},[e._v("--branch")]),e._v(' "9.0.0-alpha.1 '),t("span",{pre:!0,attrs:{class:"token builtin class-name"}},[e._v(".")]),e._v("\n")])])]),t("p",[e._v("Ensuite, lancer l'outil de création.")]),e._v(" "),t("div",{staticClass:"language-bash extra-class"},[t("pre",{pre:!0,attrs:{class:"language-bash"}},[t("code",[e._v("php tools/build/CreateRelease.php\n")])])]),t("p",[e._v("Vous pouvez utiliser ce raccourci, si vous le souhaitez.")]),e._v(" "),t("div",{staticClass:"language-bash extra-class"},[t("pre",{pre:!0,attrs:{class:"language-bash"}},[t("code",[t("span",{pre:!0,attrs:{class:"token function"}},[e._v("composer")]),e._v(" create-release\n")])])]),t("p",[e._v("A la suite des opérations - qui prennent un certain temps -, vous trouverez l'archive dans le dossier "),t("em",[e._v("tools/build/releases/")]),e._v(".")]),e._v(" "),t("h2",{attrs:{id:"documentation"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#documentation"}},[e._v("#")]),e._v(" Documentation")]),e._v(" "),t("p",[e._v("La documentation développeur est accessible "),t("a",{attrs:{href:"https://devdocs.prestashop-project.org/9/",target:"_blank",rel:"noopener noreferrer"}},[e._v("ici"),t("OutboundLink")],1),e._v(".")]),e._v(" "),t("h2",{attrs:{id:"version-de-production"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#version-de-production"}},[e._v("#")]),e._v(" Version de production")]),e._v(" "),t("p",[e._v("La question que beaucoup se pose, développeurs comme marchands, est de savoir à partir de quand cette version sera utilisable en production.")]),e._v(" "),t("p",[t("em",[e._v("Non, je ne connais pas la réponse.")])]),e._v(" "),t("p",[e._v("Toutefois, mes prédictions vont sur le mois de "),t("strong",[e._v("novembre 2024")]),e._v(".\nUne mise à jour de cet article pourrait survenir en cas de changement.")]),e._v(" "),t("Warning",{attrs:{title:"Edit du 22 octobre 2024 : une beta d'ici novembre pour une version de production en janvier 2025."}}),e._v(" "),t("h2",{attrs:{id:"liens"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#liens"}},[e._v("#")]),e._v(" Liens")]),e._v(" "),t("p",[e._v("Retrouvez l'annonce sur le Build "),t("a",{attrs:{href:"https://build.prestashop-project.org/news/2024/prestashop-9-alpha1-available/",target:"_blank",rel:"noopener noreferrer"}},[e._v('"PrestaShop 9 Alpha 1 Is Available!"'),t("OutboundLink")],1),e._v(".")])],1)}),[],!1,null,null,null);t.default=r.exports}}]);