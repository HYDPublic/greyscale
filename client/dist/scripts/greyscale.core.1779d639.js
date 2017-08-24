"use strict";angular.module("greyscale.core",[]).config(function(){}),angular.module("greyscale.core").constant("greyscaleEnv",{name:"docker",supportedLocales:["en","ru","es","fr"],apiProtocol:window.location.protocol.substring(0,window.location.protocol.length-1),apiHostname:window.location.host,apiPort:80,apiVersion:"v0.2",adminSchema:"public",tokenTTLsec:300,enableDebugLog:!0}),angular.module("greyscale.core").provider("greyscaleGlobals",function(){function a(a){if(a&&a.length){var b,d,e=a.length;for(b=0;b<e;b++){d=a[b];for(var f in c.userRoles)c.userRoles.hasOwnProperty(f)&&c.userRoles[f].key===d.name&&(c.userRoles[f].id=d.id)}}}function b(){var a,b,d=c.formBuilder.excluded.length;for(a=0;a<d;a++)b=c.formBuilder.fieldTypes.indexOf(c.formBuilder.excluded[a]),b!==-1&&c.formBuilder.excludedIndexes.push(b)}var c={events:{common:{login:"LOGIN",logout:"LOGOUT",orgUpdate:"ORGANIZATION_UPDATE"},survey:{answerDirty:"ANSWER_DIRTY",builderFormSaved:"form-changes-saved"}},projectStates:[{id:0,name:"INACTIVE"},{id:1,name:"ACTIVE"}],productStates:[{id:0,name:"PLANNING"},{id:1,name:"STARTED"},{id:2,name:"SUSPENDED"},{id:3,name:"COMPLETED"},{id:4,name:"CANCELLED"}],uoaVisibility:[{id:1,name:"PUBLIC"},{id:2,name:"PRIVATE"}],uoaStatus:[{id:1,name:"ACTIVE"},{id:2,name:"INACTIVE"},{id:3,name:"DELETED"}],userRoles:{superAdmin:{key:"admin",mask:32768},admin:{key:"client",mask:16384},user:{key:"user",mask:8192,homeState:"tasks"},projectManager:{key:"project manager",mask:4096},contributor:{key:"contributor",mask:2048},reviewer:{key:"reviewer",mask:1024},editor:{key:"editor",mask:512},translator:{key:"translator",mask:256},researcher:{key:"researcher",mask:128},researchDirector:{key:"research director",mask:64},decider:{key:"decider",mask:32},nobody:{id:null,mask:1},any:{id:null,mask:65534},all:{id:null,mask:65535}},formBuilder:{fieldTypes:["text","paragraph","checkboxes","radio","dropdown","number","email","price","section_start","section_end","section_break","bullet_points","date"],excluded:["section_start","section_end","section_break","scale"],excludedIndexes:[]},formBuilderSections:["section_start","section_end","section_break"],writeToAnswersList:[{value:!1,name:"READ"},{value:!0,name:"READ_WRITE"}],productTaskStatuses:[{value:"waiting",name:"WAITING"},{value:"current",name:"CURRENT"},{value:"completed",name:"COMPLETED"}],notifyLevels:[{value:0,name:"OFF"},{value:1,name:"INTERNAL"},{value:2,name:"INTERNAL_AND_EMAILS"}],adminSchema:"public",tokenTTLsec:300,autosaveSec:15,setRolesId:a,widgetTableDefaults:{pageLength:0}};return{initRoles:a,$get:function(){return b(),c}}}).run(["greyscaleGlobals","i18n",function(a,b){function c(a){var b,c="GLOBALS.";return angular.forEach(a,function(g,h){b=c+h.toUpperCase()+".",angular.isString(g)?0===g.indexOf(f)&&(a[h]=d(b,g.substring(f.length))):(angular.isArray(g)||angular.isObject(g))&&e(b,g)}),a}function d(a,c){return b.translate(a+c)}function e(a,c){angular.forEach(c,function(c){void 0!==c.name&&(c.name=b.translate(a+c.name))})}var f="i18n:";c(a)}]),function(){function a(){return j.supportedLocales||["en"]}function b(b){var c={locale:b,translations:window.L10N,languages:k,locales:a()};delete window.L10N,f(c)}function c(){var a=e();d("l10n/"+a+".js",function(){if(!window.L10N)throw"Expected global L10N object!";b(a)}),"en"!==a&&d("l10n/angular-locale/angular-locale_"+a+".js",g)}function d(a,b){var c=document.createElement("script");c.src=a,document.head.appendChild(c),c.onreadystatechange=c.onload=b}function e(){var b=a(),c=h("locale");return c&&b.indexOf(c)>=0?c:b[0]}function f(a){angular.module("greyscale.core").constant("i18nData",a),angular.element(document).ready(function(){angular.bootstrap(document.body,["greyscaleApp"])})}function g(){window.i18nNgLocaleLoaded=!0}function h(a){return(document.cookie.match("(^|; )"+a+"=([^;]*)")||0)[2]}function i(a,b){var c,d,e=a._invokeQueue;if(e&&e.length)for(c in e)if(e.hasOwnProperty(c))for(d in e[c])if(e[c].hasOwnProperty(d)&&e[c][d][0]===b)return e[c][d][1]}var j=i(angular.module("greyscale.core"),"greyscaleEnv")||{},k=[{locale:"en",label:"English",flagUrl:"images/flags/en.png"},{locale:"ru",label:"Русский",flagUrl:"images/flags/ru.png"}];window.L10N?b("en"):c()}(),angular.module("greyscale.core").provider("i18n",["$windowProvider","i18nData",function(a,b){function c(a){i=b.locale,j=b.locales,k=b.languages,a.translations(i,b.translations),a.preferredLanguage(i),a.useSanitizeValueStrategy(null),b=void 0}function d(a){a!==i&&h(a)&&(l.put("locale",a),window.location.reload())}function e(){return i}function f(){return j}function g(){return k}function h(a){return j.indexOf(a)>=0}var i,j,k,l,m={getLocale:e,getLocales:f,getLanguages:g,isSupported:h,changeLocale:d};return{init:c,$get:["$cookies","$translate","$rootScope",function(a,b,c){return b.use(i),l=a,m.translate=b.instant,c.currentLocale=i,c.translate=b.instant,m}]}}]).run(["uibDatepickerPopupConfig","$locale","i18n",function(a,b,c){function d(a,b){return c.translate("DATEPICKER."+a,b)}function e(){if("en"!==c.getLocale()){if(window.i18nNgLocaleLoaded)return void delete window.i18nNgLocaleLoaded;var a=setInterval(function(){window.i18nNgLocaleLoaded&&(delete window.i18nNgLocaleLoaded,clearInterval(a),f())},15)}}function f(){var a=angular.injector(["ngLocale"]),c=a.get("$locale");angular.extend(b,c)}e();var g={clearText:d("RESET"),closeText:d("DONE"),currentText:d("TODAY"),datepickerPopup:d("DATE_FORMAT")};angular.extend(a,g)}]),angular.module("greyscale.core").provider("greyscaleSideMenu",function(){var a={title:"greyscale",groups:[{title:"NAV.SUPERADMIN_SECTION",states:["organizations","superusers"]},{title:"NAV.ADMIN_SECTION",states:["projects.setup.products","access","uoas","users"]},{title:"NAV.CONTENT_SECTION",states:["profile","tasks","graph","table"]}]};return{$get:function(){return a}}}),angular.module("greyscale.core").filter("languages",["_",function(a){return function(b,c,d){for(var e=[],f=0;f<b.length;f++){var g=a.findIndex(c,{langId:b[f].id});(g<0||g===d)&&e.push(b[f])}return e}}]),angular.module("greyscale.core").filter("highlight",["$sce",function(a){var b="bg-warning",c="b",d=b?' class="'+b+'"':"",e="<"+c+d+">",f="</"+c+">";return function(b,c){return c&&(b=b.replace(new RegExp("("+c+")","gi"),e+"$1"+f)),a.trustAsHtml(b)}}]),angular.module("greyscale.core").filter("parseDate",function(){return function(a){return new Date(a)}}),angular.module("greyscale.core").service("greyscaleBase64Srv",function(){var a="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",b=function(a){a=a.replace(/\r\n/g,"\n");for(var b="",c=0;c<a.length;c++){var d=a.charCodeAt(c);d<128?b+=String.fromCharCode(d):d>127&&d<2048?(b+=String.fromCharCode(d>>6|192),b+=String.fromCharCode(63&d|128)):(b+=String.fromCharCode(d>>12|224),b+=String.fromCharCode(d>>6&63|128),b+=String.fromCharCode(63&d|128))}return b},c=function(a){var b,c,d,e,f="",g=0;for(b=c=d=0;g<a.length;)b=a.charCodeAt(g),b<128?(f+=String.fromCharCode(b),g++):b>191&&b<224?(d=a.charCodeAt(g+1),f+=String.fromCharCode((31&b)<<6|63&d),g+=2):(d=a.charCodeAt(g+1),e=a.charCodeAt(g+2),f+=String.fromCharCode((15&b)<<12|(63&d)<<6|63&e),g+=3);return f};return this.encode=function(c){var d,e,f,g,h,i,j,k="",l=0;for(c=b(c);l<c.length;)d=c.charCodeAt(l++),e=c.charCodeAt(l++),f=c.charCodeAt(l++),g=d>>2,h=(3&d)<<4|e>>4,i=(15&e)<<2|f>>6,j=63&f,isNaN(e)?i=j=64:isNaN(f)&&(j=64),k=k+a.charAt(g)+a.charAt(h)+a.charAt(i)+a.charAt(j);return k},this.decode=function(b){var d,e,f,g,h,i,j,k="",l=0;for(b=b.replace(/[^A-Za-z0-9\+\/\=]/g,"");l<b.length;)g=a.indexOf(b.charAt(l++)),h=a.indexOf(b.charAt(l++)),i=a.indexOf(b.charAt(l++)),j=a.indexOf(b.charAt(l++)),d=g<<2|h>>4,e=(15&h)<<4|i>>2,f=(3&i)<<6|j,k+=String.fromCharCode(d),64!==i&&(k+=String.fromCharCode(e)),64!==j&&(k+=String.fromCharCode(f));return k=c(k)},this}),angular.module("greyscale.core").factory("greyscaleTokenSrv",["$cookies",function(a){var b=null;return function(c){return"undefined"!=typeof c?(b=c,c?a.put("token",c):a.remove("token")):b||(b=a.get("token")),b}}]),angular.module("greyscale.core").service("greyscaleProfileSrv",["$q","greyscaleTokenSrv","greyscaleUserApi","greyscaleRolesSrv","greyscaleUtilsSrv","greyscaleGlobals","$log","$rootScope","greyscaleRealmSrv","$interval","greyscaleEnv",function(a,b,c,d,e,f,g,h,i,j,k){function l(){q(),b(null),i.init(null),s=null,t=null,u=e.getRoleMask(-1,!0)}function m(){return(u&f.userRoles.superAdmin.mask)===f.userRoles.superAdmin.mask}function n(){return(u&f.userRoles.admin.mask)===f.userRoles.admin.mask}function o(){if(s){var a=Array.prototype.slice.call(arguments),b=!1;return angular.forEach(a,function(a){if(!b&&"nobody"!==a){if("all"===a)return void(b=!0);var c=f.userRoles[a];if(!c)throw'Unknown role "'+a+'"!';c.id===s.roleID&&(b=!0)}}),b}}function p(){c.isAuthenticated(i.origin()).then(function(a){a||(e.errorMsg("ERROR.BAD_TOKEN"),h.$broadcast(f.events.common.logout))})}function q(){r&&j.cancel(r)}var r,s=null,t=null,u=e.getRoleMask(-1,!0),v=1e3*(k.tokenTTLsec||f.tokenTTLsec);this.isSuperAdmin=m,this.isAdmin=n,this.getProfile=function(d){var e=a.reject("not logged in"),f=this,g=b();return g?s&&!d?e=f._setAccessLevel():(t&&!d||(t=c.get(i.origin()).then(function(a){return q(),r=j(p,v),s=a.plain()}).then(f._setAccessLevel)["finally"](function(){t=null})),e=t):(s=null,t=null),e},this._setAccessLevel=function(b){var c=a.reject("no user data loaded");return"undefined"==typeof b&&(b=s),b&&(c=d(i.origin()).then(function(a){return f.setRolesId(a),u=e.getRoleMask(b.roleID,!0),h.checkAccessRole=o,b})),c},this.getAccessLevelMask=function(){return u},this.getAccessLevel=function(){return this.getProfile().then(this.getAccessLevelMask)["catch"](function(a){return l(),g.debug("getAccessLevel says:",a),u})},this.login=function(){return this.getProfile(!0)},this.logout=function(){return c.logout()["finally"](l)}}]),angular.module("greyscale.core").factory("greyscaleUtilsSrv",["greyscaleEnv","_","greyscaleGlobals","$log","inform","i18n","greyscaleRealmSrv","$translate",function(a,b,c,d,e,f,g,h){function i(a,c,d,e){var f={};f[c]=d;var g=b.get(b.find(a,f),e);return g||(g=d),g}function j(a,b){for(var c={},d=0;d<a.length;d++)b.hasOwnProperty(a[d].field)&&!a[d].internal&&(c[a[d].field]=b[a[d].field]);return c}function k(a,b){for(var c=0;c<a.length;c++)for(var d=a[c],e=0;e<b.length;e++)"date"===b[e].dataFormat&&d[b[e].field]&&(d[b[e].field]=new Date(d[b[e].field]))}function l(a,b,c){var g=b?f.translate(b)+": ":"",h="";a&&(a.data?h=a.data.message?a.data.message:a.data:"string"==typeof a?h=m(a):a.message?h=a.message:a.statusText&&(h=a.statusText),g+=f.translate(h),d.debug("("+c+") "+g),e.add(g,{type:c}))}function m(a){return a.match(/^(<!doctype|<html)/i)?h.instant("COMMON.SERVICE_UNAVAILABLE"):a}function n(a,b){l(a,b,"danger")}function o(a,b){l(a,b,"success")}function p(a,d){d=!!d;var e=b.get(b.find(c.userRoles,{id:a}),"mask");return d&&(e=e||c.userRoles.nobody.mask),e}function q(a){var b=document.createElement("a");b.href=a;var c={protocol:b.protocol,hostname:b.hostname,port:b.port,path:b.pathname,search:decodeURIComponent(b.search),hash:b.hash,params:{}};if(c.search)for(var d=c.search.substring(1).split("&"),e=0;e<d.length;e++){var f=d[e].split("=");if(f[0]){var g=c.params[f[0]];"undefined"==typeof g?g=f[1]:angular.isArray(g)?g.push(f[1]):g=[g,f[1]],c.params[f[0]]=g}}return c}function r(){var b=g.current(),c=[a.apiHostname,a.apiPort].join(":"),d=[b,a.apiVersion].join("/");return(a.apiProtocol||"http")+"://"+c+"/"+d}function s(a){return a.charAt(0).toUpperCase()+a.substr(1).toLowerCase()}function t(a){return a?a.split(/\s+/).length:0}return{decode:i,removeInternal:j,prepareFields:k,errorMsg:n,successMsg:o,getRoleMask:p,parseURL:q,getApiBase:r,capitalize:s,countWords:t}}]),angular.module("greyscale.core").service("greyscaleRolesSrv",["$q","greyscaleRoleApi","greyscaleRealmSrv",function(a,b,c){function d(d,g){var h=a.resolve([]);return"undefined"==typeof d&&(d=c.current()),e[d]&&!g?h=a.resolve(e[d]):(f[d]&&!g||(f[d]=b.list({},d).then(function(a){return e[d]=a,e[d]})["finally"](function(){f[d]=null})),h=f[d]),h}var e={},f={};return d}]),angular.module("greyscale.core").service("greyscaleRestSrv",["Restangular","greyscaleTokenSrv","$rootScope","greyscaleEnv","greyscaleRealmSrv",function(a,b,c,d,e){return function(f,g){f=f||{};var h={"Content-Type":"application/json","Accept-Language":c.currentLocale};return angular.extend(h,f),a.withConfig(function(a){var c=b(),f=g||e.current();c&&angular.extend(h,{token:c}),f&&a.setBaseUrl((d.apiProtocol||"http")+"://"+d.apiHostname+(void 0!==d.apiPort?":"+d.apiPort:"")+"/"+f+"/"+d.apiVersion),a.setDefaultHeaders(h)})}}]),angular.module("greyscale.core").service("greyscaleWebSocketSrv",["greyscaleProfileSrv","greyscaleEnv","$rootScope",function(a,b,c){function d(){a.getProfile().then(function(a){f.emit("setUser",{userId:a.id})})}function e(){var a=window.location.hostname.split(".");"www"===a[0]&&a.splice(0,1);var c=(b.apiProtocol||"http")+"://"+b.apiHostname+(void 0!==b.apiPort?":"+b.apiPort:"")+"/",d={transports:["websocket"]};return window.io(c,d)}var f;this.init=function(){f=e(),f.on("connect",function(){d()}),f.on("reconnect",function(){d()})},this.on=function(a,b){f&&f.on(a,b)}}]).run(["greyscaleWebSocketSrv",function(a){a.init()}]),angular.module("greyscale.core").factory("greyscaleRealmSrv",["$cookies","greyscaleEnv","greyscaleGlobals",function(a,b,c){function d(a){f||(f={}),e("origin",a),e("current",a)}function e(b,c){var d=b+"_realm";return"undefined"!=typeof c&&c!==g?(c?a.put(d,c):a.remove(d),f[b]=c||g):f[b]||(f[b]=a.get(d)||g),f[b]}var f,g=b.adminSchema||c.adminSchema;return d(),{current:function(a){return e("current",a)},origin:function(a){return e("origin",a)},init:d}}]);