// Underscore.js 1.1.6
// (c) 2011 Jeremy Ashkenas, DocumentCloud Inc.
// Underscore is freely distributable under the MIT license.
// Portions of Underscore are inspired or borrowed from Prototype,
// Oliver Steele's Functional, and John Resig's Micro-Templating.
// For all details and documentation:
// http://documentcloud.github.com/underscore
(function(){var p=this,C=p._,m={},i=Array.prototype,n=Object.prototype,f=i.slice,D=i.unshift,E=n.toString,l=n.hasOwnProperty,s=i.forEach,t=i.map,u=i.reduce,v=i.reduceRight,w=i.filter,x=i.every,y=i.some,o=i.indexOf,z=i.lastIndexOf;n=Array.isArray;var F=Object.keys,q=Function.prototype.bind,b=function(a){return new j(a)};typeof module!=="undefined"&&module.exports?(module.exports=b,b._=b):p._=b;b.VERSION="1.1.6";var h=b.each=b.forEach=function(a,c,d){if(a!=null)if(s&&a.forEach===s)a.forEach(c,d);else if(b.isNumber(a.length))for(var e=
0,k=a.length;e<k;e++){if(c.call(d,a[e],e,a)===m)break}else for(e in a)if(l.call(a,e)&&c.call(d,a[e],e,a)===m)break};b.map=function(a,c,b){var e=[];if(a==null)return e;if(t&&a.map===t)return a.map(c,b);h(a,function(a,g,G){e[e.length]=c.call(b,a,g,G)});return e};b.reduce=b.foldl=b.inject=function(a,c,d,e){var k=d!==void 0;a==null&&(a=[]);if(u&&a.reduce===u)return e&&(c=b.bind(c,e)),k?a.reduce(c,d):a.reduce(c);h(a,function(a,b,f){!k&&b===0?(d=a,k=!0):d=c.call(e,d,a,b,f)});if(!k)throw new TypeError("Reduce of empty array with no initial value");
return d};b.reduceRight=b.foldr=function(a,c,d,e){a==null&&(a=[]);if(v&&a.reduceRight===v)return e&&(c=b.bind(c,e)),d!==void 0?a.reduceRight(c,d):a.reduceRight(c);a=(b.isArray(a)?a.slice():b.toArray(a)).reverse();return b.reduce(a,c,d,e)};b.find=b.detect=function(a,c,b){var e;A(a,function(a,g,f){if(c.call(b,a,g,f))return e=a,!0});return e};b.filter=b.select=function(a,c,b){var e=[];if(a==null)return e;if(w&&a.filter===w)return a.filter(c,b);h(a,function(a,g,f){c.call(b,a,g,f)&&(e[e.length]=a)});return e};
b.reject=function(a,c,b){var e=[];if(a==null)return e;h(a,function(a,g,f){c.call(b,a,g,f)||(e[e.length]=a)});return e};b.every=b.all=function(a,c,b){var e=!0;if(a==null)return e;if(x&&a.every===x)return a.every(c,b);h(a,function(a,g,f){if(!(e=e&&c.call(b,a,g,f)))return m});return e};var A=b.some=b.any=function(a,c,d){c||(c=b.identity);var e=!1;if(a==null)return e;if(y&&a.some===y)return a.some(c,d);h(a,function(a,b,f){if(e=c.call(d,a,b,f))return m});return e};b.include=b.contains=function(a,c){var b=
!1;if(a==null)return b;if(o&&a.indexOf===o)return a.indexOf(c)!=-1;A(a,function(a){if(b=a===c)return!0});return b};b.invoke=function(a,c){var d=f.call(arguments,2);return b.map(a,function(a){return(c.call?c||a:a[c]).apply(a,d)})};b.pluck=function(a,c){return b.map(a,function(a){return a[c]})};b.max=function(a,c,d){if(!c&&b.isArray(a))return Math.max.apply(Math,a);var e={computed:-Infinity};h(a,function(a,b,f){b=c?c.call(d,a,b,f):a;b>=e.computed&&(e={value:a,computed:b})});return e.value};b.min=function(a,
c,d){if(!c&&b.isArray(a))return Math.min.apply(Math,a);var e={computed:Infinity};h(a,function(a,b,f){b=c?c.call(d,a,b,f):a;b<e.computed&&(e={value:a,computed:b})});return e.value};b.sortBy=function(a,c,d){return b.pluck(b.map(a,function(a,b,f){return{value:a,criteria:c.call(d,a,b,f)}}).sort(function(a,b){var c=a.criteria,d=b.criteria;return c<d?-1:c>d?1:0}),"value")};b.sortedIndex=function(a,c,d){d||(d=b.identity);for(var e=0,f=a.length;e<f;){var g=e+f>>1;d(a[g])<d(c)?e=g+1:f=g}return e};b.toArray=
function(a){if(!a)return[];if(a.toArray)return a.toArray();if(b.isArray(a))return a;if(b.isArguments(a))return f.call(a);return b.values(a)};b.size=function(a){return b.toArray(a).length};b.first=b.head=function(a,b,d){return b!=null&&!d?f.call(a,0,b):a[0]};b.rest=b.tail=function(a,b,d){return f.call(a,b==null||d?1:b)};b.last=function(a){return a[a.length-1]};b.compact=function(a){return b.filter(a,function(a){return!!a})};b.flatten=function(a){return b.reduce(a,function(a,d){if(b.isArray(d))return a.concat(b.flatten(d));
a[a.length]=d;return a},[])};b.without=function(a){var c=f.call(arguments,1);return b.filter(a,function(a){return!b.include(c,a)})};b.uniq=b.unique=function(a,c){return b.reduce(a,function(a,e,f){if(0==f||(c===!0?b.last(a)!=e:!b.include(a,e)))a[a.length]=e;return a},[])};b.intersect=function(a){var c=f.call(arguments,1);return b.filter(b.uniq(a),function(a){return b.every(c,function(c){return b.indexOf(c,a)>=0})})};b.zip=function(){for(var a=f.call(arguments),c=b.max(b.pluck(a,"length")),d=Array(c),
e=0;e<c;e++)d[e]=b.pluck(a,""+e);return d};b.indexOf=function(a,c,d){if(a==null)return-1;var e;if(d)return d=b.sortedIndex(a,c),a[d]===c?d:-1;if(o&&a.indexOf===o)return a.indexOf(c);d=0;for(e=a.length;d<e;d++)if(a[d]===c)return d;return-1};b.lastIndexOf=function(a,b){if(a==null)return-1;if(z&&a.lastIndexOf===z)return a.lastIndexOf(b);for(var d=a.length;d--;)if(a[d]===b)return d;return-1};b.range=function(a,b,d){arguments.length<=1&&(b=a||0,a=0);d=arguments[2]||1;for(var e=Math.max(Math.ceil((b-a)/
d),0),f=0,g=Array(e);f<e;)g[f++]=a,a+=d;return g};b.bind=function(a,b){if(a.bind===q&&q)return q.apply(a,f.call(arguments,1));var d=f.call(arguments,2);return function(){return a.apply(b,d.concat(f.call(arguments)))}};b.bindAll=function(a){var c=f.call(arguments,1);c.length==0&&(c=b.functions(a));h(c,function(c){a[c]=b.bind(a[c],a)});return a};b.memoize=function(a,c){var d={};c||(c=b.identity);return function(){var b=c.apply(this,arguments);return l.call(d,b)?d[b]:d[b]=a.apply(this,arguments)}};b.delay=
function(a,b){var d=f.call(arguments,2);return setTimeout(function(){return a.apply(a,d)},b)};b.defer=function(a){return b.delay.apply(b,[a,1].concat(f.call(arguments,1)))};var B=function(a,b,d){var e;return function(){var f=this,g=arguments,h=function(){e=null;a.apply(f,g)};d&&clearTimeout(e);if(d||!e)e=setTimeout(h,b)}};b.throttle=function(a,b){return B(a,b,!1)};b.debounce=function(a,b){return B(a,b,!0)};b.once=function(a){var b=!1,d;return function(){if(b)return d;b=!0;return d=a.apply(this,arguments)}};
b.wrap=function(a,b){return function(){var d=[a].concat(f.call(arguments));return b.apply(this,d)}};b.compose=function(){var a=f.call(arguments);return function(){for(var b=f.call(arguments),d=a.length-1;d>=0;d--)b=[a[d].apply(this,b)];return b[0]}};b.after=function(a,b){return function(){if(--a<1)return b.apply(this,arguments)}};b.keys=F||function(a){if(a!==Object(a))throw new TypeError("Invalid object");var b=[],d;for(d in a)l.call(a,d)&&(b[b.length]=d);return b};b.values=function(a){return b.map(a,
b.identity)};b.functions=b.methods=function(a){return b.filter(b.keys(a),function(c){return b.isFunction(a[c])}).sort()};b.extend=function(a){h(f.call(arguments,1),function(b){for(var d in b)b[d]!==void 0&&(a[d]=b[d])});return a};b.defaults=function(a){h(f.call(arguments,1),function(b){for(var d in b)a[d]==null&&(a[d]=b[d])});return a};b.clone=function(a){return b.isArray(a)?a.slice():b.extend({},a)};b.tap=function(a,b){b(a);return a};b.isEqual=function(a,c){if(a===c)return!0;var d=typeof a;if(d!=
typeof c)return!1;if(a==c)return!0;if(!a&&c||a&&!c)return!1;if(a._chain)a=a._wrapped;if(c._chain)c=c._wrapped;if(a.isEqual)return a.isEqual(c);if(b.isDate(a)&&b.isDate(c))return a.getTime()===c.getTime();if(b.isNaN(a)&&b.isNaN(c))return!1;if(b.isRegExp(a)&&b.isRegExp(c))return a.source===c.source&&a.global===c.global&&a.ignoreCase===c.ignoreCase&&a.multiline===c.multiline;if(d!=="object")return!1;if(a.length&&a.length!==c.length)return!1;d=b.keys(a);var e=b.keys(c);if(d.length!=e.length)return!1;
for(var f in a)if(!(f in c)||!b.isEqual(a[f],c[f]))return!1;return!0};b.isEmpty=function(a){if(b.isArray(a)||b.isString(a))return a.length===0;for(var c in a)if(l.call(a,c))return!1;return!0};b.isElement=function(a){return!!(a&&a.nodeType==1)};b.isArray=n||function(a){return E.call(a)==="[object Array]"};b.isArguments=function(a){return!(!a||!l.call(a,"callee"))};b.isFunction=function(a){return!(!a||!a.constructor||!a.call||!a.apply)};b.isString=function(a){return!!(a===""||a&&a.charCodeAt&&a.substr)};
b.isNumber=function(a){return!!(a===0||a&&a.toExponential&&a.toFixed)};b.isNaN=function(a){return a!==a};b.isBoolean=function(a){return a===!0||a===!1};b.isDate=function(a){return!(!a||!a.getTimezoneOffset||!a.setUTCFullYear)};b.isRegExp=function(a){return!(!a||!a.test||!a.exec||!(a.ignoreCase||a.ignoreCase===!1))};b.isNull=function(a){return a===null};b.isUndefined=function(a){return a===void 0};b.noConflict=function(){p._=C;return this};b.identity=function(a){return a};b.times=function(a,b,d){for(var e=
0;e<a;e++)b.call(d,e)};b.mixin=function(a){h(b.functions(a),function(c){H(c,b[c]=a[c])})};var I=0;b.uniqueId=function(a){var b=I++;return a?a+b:b};b.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g};b.template=function(a,c){var d=b.templateSettings;d="var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('"+a.replace(/\\/g,"\\\\").replace(/'/g,"\\'").replace(d.interpolate,function(a,b){return"',"+b.replace(/\\'/g,"'")+",'"}).replace(d.evaluate||
null,function(a,b){return"');"+b.replace(/\\'/g,"'").replace(/[\r\n\t]/g," ")+"__p.push('"}).replace(/\r/g,"\\r").replace(/\n/g,"\\n").replace(/\t/g,"\\t")+"');}return __p.join('');";d=new Function("obj",d);return c?d(c):d};var j=function(a){this._wrapped=a};b.prototype=j.prototype;var r=function(a,c){return c?b(a).chain():a},H=function(a,c){j.prototype[a]=function(){var a=f.call(arguments);D.call(a,this._wrapped);return r(c.apply(b,a),this._chain)}};b.mixin(b);h(["pop","push","reverse","shift","sort",
"splice","unshift"],function(a){var b=i[a];j.prototype[a]=function(){b.apply(this._wrapped,arguments);return r(this._wrapped,this._chain)}});h(["concat","join","slice"],function(a){var b=i[a];j.prototype[a]=function(){return r(b.apply(this._wrapped,arguments),this._chain)}});j.prototype.chain=function(){this._chain=!0;return this};j.prototype.value=function(){return this._wrapped}})();
// Backbone.js 0.3.3
// (c) 2010 Jeremy Ashkenas, DocumentCloud Inc.
// Backbone may be freely distributed under the MIT license.
// For all details and documentation:
// http://documentcloud.github.com/backbone
(function(){var e;e=typeof exports!=="undefined"?exports:this.Backbone={};e.VERSION="0.3.3";var f=this._;if(!f&&typeof require!=="undefined")f=require("underscore")._;var h=this.jQuery||this.Zepto;e.emulateHTTP=false;e.emulateJSON=false;e.Events={bind:function(a,b){this._callbacks||(this._callbacks={});(this._callbacks[a]||(this._callbacks[a]=[])).push(b);return this},unbind:function(a,b){var c;if(a){if(c=this._callbacks)if(b){c=c[a];if(!c)return this;for(var d=0,g=c.length;d<g;d++)if(b===c[d]){c.splice(d,
1);break}}else c[a]=[]}else this._callbacks={};return this},trigger:function(a){var b,c,d,g;if(!(c=this._callbacks))return this;if(b=c[a]){d=0;for(g=b.length;d<g;d++)b[d].apply(this,Array.prototype.slice.call(arguments,1))}if(b=c.all){d=0;for(g=b.length;d<g;d++)b[d].apply(this,arguments)}return this}};e.Model=function(a,b){a||(a={});if(this.defaults)a=f.extend({},this.defaults,a);this.attributes={};this._escapedAttributes={};this.cid=f.uniqueId("c");this.set(a,{silent:true});this._previousAttributes=
f.clone(this.attributes);if(b&&b.collection)this.collection=b.collection;this.initialize(a,b)};f.extend(e.Model.prototype,e.Events,{_previousAttributes:null,_changed:false,initialize:function(){},toJSON:function(){return f.clone(this.attributes)},get:function(a){return this.attributes[a]},escape:function(a){var b;if(b=this._escapedAttributes[a])return b;b=this.attributes[a];return this._escapedAttributes[a]=(b==null?"":b).replace(/&(?!\w+;)/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,
"&quot;")},set:function(a,b){b||(b={});if(!a)return this;if(a.attributes)a=a.attributes;var c=this.attributes,d=this._escapedAttributes;if(!b.silent&&this.validate&&!this._performValidation(a,b))return false;if("id"in a)this.id=a.id;for(var g in a){var i=a[g];if(!f.isEqual(c[g],i)){c[g]=i;delete d[g];if(!b.silent){this._changed=true;this.trigger("change:"+g,this,i,b)}}}!b.silent&&this._changed&&this.change(b);return this},unset:function(a,b){b||(b={});var c={};c[a]=void 0;if(!b.silent&&this.validate&&
!this._performValidation(c,b))return false;delete this.attributes[a];delete this._escapedAttributes[a];if(!b.silent){this._changed=true;this.trigger("change:"+a,this,void 0,b);this.change(b)}return this},clear:function(a){a||(a={});var b=this.attributes,c={};for(attr in b)c[attr]=void 0;if(!a.silent&&this.validate&&!this._performValidation(c,a))return false;this.attributes={};this._escapedAttributes={};if(!a.silent){this._changed=true;for(attr in b)this.trigger("change:"+attr,this,void 0,a);this.change(a)}return this},
fetch:function(a){a||(a={});var b=this,c=j(a.error,b,a);(this.sync||e.sync)("read",this,function(d){if(!b.set(b.parse(d),a))return false;a.success&&a.success(b,d)},c);return this},save:function(a,b){b||(b={});if(a&&!this.set(a,b))return false;var c=this,d=j(b.error,c,b),g=this.isNew()?"create":"update";(this.sync||e.sync)(g,this,function(i){if(!c.set(c.parse(i),b))return false;b.success&&b.success(c,i)},d);return this},destroy:function(a){a||(a={});var b=this,c=j(a.error,b,a);(this.sync||e.sync)("delete",
this,function(d){b.collection&&b.collection.remove(b);a.success&&a.success(b,d)},c);return this},url:function(){var a=k(this.collection);if(this.isNew())return a;return a+(a.charAt(a.length-1)=="/"?"":"/")+this.id},parse:function(a){return a},clone:function(){return new this.constructor(this)},isNew:function(){return!this.id},change:function(a){this.trigger("change",this,a);this._previousAttributes=f.clone(this.attributes);this._changed=false},hasChanged:function(a){if(a)return this._previousAttributes[a]!=
this.attributes[a];return this._changed},changedAttributes:function(a){a||(a=this.attributes);var b=this._previousAttributes,c=false,d;for(d in a)if(!f.isEqual(b[d],a[d])){c=c||{};c[d]=a[d]}return c},previous:function(a){if(!a||!this._previousAttributes)return null;return this._previousAttributes[a]},previousAttributes:function(){return f.clone(this._previousAttributes)},_performValidation:function(a,b){var c=this.validate(a);if(c){b.error?b.error(this,c):this.trigger("error",this,c,b);return false}return true}});
e.Collection=function(a,b){b||(b={});if(b.comparator){this.comparator=b.comparator;delete b.comparator}this._boundOnModelEvent=f.bind(this._onModelEvent,this);this._reset();a&&this.refresh(a,{silent:true});this.initialize(a,b)};f.extend(e.Collection.prototype,e.Events,{model:e.Model,initialize:function(){},toJSON:function(){return this.map(function(a){return a.toJSON()})},add:function(a,b){if(f.isArray(a))for(var c=0,d=a.length;c<d;c++)this._add(a[c],b);else this._add(a,b);return this},remove:function(a,
b){if(f.isArray(a))for(var c=0,d=a.length;c<d;c++)this._remove(a[c],b);else this._remove(a,b);return this},get:function(a){if(a==null)return null;return this._byId[a.id!=null?a.id:a]},getByCid:function(a){return a&&this._byCid[a.cid||a]},at:function(a){return this.models[a]},sort:function(a){a||(a={});if(!this.comparator)throw Error("Cannot sort a set without a comparator");this.models=this.sortBy(this.comparator);a.silent||this.trigger("refresh",this,a);return this},pluck:function(a){return f.map(this.models,
function(b){return b.get(a)})},refresh:function(a,b){a||(a=[]);b||(b={});this._reset();this.add(a,{silent:true});b.silent||this.trigger("refresh",this,b);return this},fetch:function(a){a||(a={});var b=this,c=j(a.error,b,a);(this.sync||e.sync)("read",this,function(d){b.refresh(b.parse(d));a.success&&a.success(b,d)},c);return this},create:function(a,b){var c=this;b||(b={});if(a instanceof e.Model)a.collection=c;else a=new this.model(a,{collection:c});return a.save(null,{success:function(d,g){c.add(d);
b.success&&b.success(d,g)},error:b.error})},parse:function(a){return a},chain:function(){return f(this.models).chain()},_reset:function(){this.length=0;this.models=[];this._byId={};this._byCid={}},_add:function(a,b){b||(b={});a instanceof e.Model||(a=new this.model(a,{collection:this}));var c=this.getByCid(a);if(c)throw Error(["Can't add the same model to a set twice",c.id]);this._byId[a.id]=a;this._byCid[a.cid]=a;a.collection=this;this.models.splice(this.comparator?this.sortedIndex(a,this.comparator):
this.length,0,a);a.bind("all",this._boundOnModelEvent);this.length++;b.silent||a.trigger("add",a,this,b);return a},_remove:function(a,b){b||(b={});a=this.getByCid(a)||this.get(a);if(!a)return null;delete this._byId[a.id];delete this._byCid[a.cid];delete a.collection;this.models.splice(this.indexOf(a),1);this.length--;b.silent||a.trigger("remove",a,this,b);a.unbind("all",this._boundOnModelEvent);return a},_onModelEvent:function(a,b){if(a==="change:id"){delete this._byId[b.previous("id")];this._byId[b.id]=
b}this.trigger.apply(this,arguments)}});f.each(["forEach","each","map","reduce","reduceRight","find","detect","filter","select","reject","every","all","some","any","include","invoke","max","min","sortBy","sortedIndex","toArray","size","first","rest","last","without","indexOf","lastIndexOf","isEmpty"],function(a){e.Collection.prototype[a]=function(){return f[a].apply(f,[this.models].concat(f.toArray(arguments)))}});e.Controller=function(a){a||(a={});if(a.routes)this.routes=a.routes;this._bindRoutes();
this.initialize(a)};var o=/:([\w\d]+)/g,p=/\*([\w\d]+)/g;f.extend(e.Controller.prototype,e.Events,{initialize:function(){},route:function(a,b,c){e.history||(e.history=new e.History);f.isRegExp(a)||(a=this._routeToRegExp(a));e.history.route(a,f.bind(function(d){d=this._extractParameters(a,d);c.apply(this,d);this.trigger.apply(this,["route:"+b].concat(d))},this))},saveLocation:function(a){e.history.saveLocation(a)},_bindRoutes:function(){if(this.routes)for(var a in this.routes){var b=this.routes[a];
this.route(a,b,this[b])}},_routeToRegExp:function(a){a=a.replace(o,"([^/]*)").replace(p,"(.*?)");return RegExp("^"+a+"$")},_extractParameters:function(a,b){return a.exec(b).slice(1)}});e.History=function(){this.handlers=[];this.fragment=this.getFragment();f.bindAll(this,"checkUrl")};var l=/^#*/;f.extend(e.History.prototype,{interval:50,getFragment:function(a){return(a||window.location).hash.replace(l,"")},start:function(){var a=document.documentMode;if(a=h.browser.msie&&(!a||a<=7))this.iframe=h('<iframe src="javascript:0" tabindex="-1" />').hide().appendTo("body")[0].contentWindow;
"onhashchange"in window&&!a?h(window).bind("hashchange",this.checkUrl):setInterval(this.checkUrl,this.interval);return this.loadUrl()},route:function(a,b){this.handlers.push({route:a,callback:b})},checkUrl:function(){var a=this.getFragment();if(a==this.fragment&&this.iframe)a=this.getFragment(this.iframe.location);if(a==this.fragment||a==decodeURIComponent(this.fragment))return false;if(this.iframe)window.location.hash=this.iframe.location.hash=a;this.loadUrl()},loadUrl:function(){var a=this.fragment=
this.getFragment();return f.any(this.handlers,function(b){if(b.route.test(a)){b.callback(a);return true}})},saveLocation:function(a){a=(a||"").replace(l,"");if(this.fragment!=a){window.location.hash=this.fragment=a;if(this.iframe&&a!=this.getFragment(this.iframe.location)){this.iframe.document.open().close();this.iframe.location.hash=a}}}});e.View=function(a){this._configure(a||{});this._ensureElement();this.delegateEvents();this.initialize(a)};var q=/^(\w+)\s*(.*)$/;f.extend(e.View.prototype,e.Events,
{tagName:"div",$:function(a){return h(a,this.el)},initialize:function(){},render:function(){return this},remove:function(){h(this.el).remove();return this},make:function(a,b,c){a=document.createElement(a);b&&h(a).attr(b);c&&h(a).html(c);return a},delegateEvents:function(a){if(a||(a=this.events)){h(this.el).unbind();for(var b in a){var c=a[b],d=b.match(q),g=d[1];d=d[2];c=f.bind(this[c],this);d===""?h(this.el).bind(g,c):h(this.el).delegate(d,g,c)}}},_configure:function(a){if(this.options)a=f.extend({},
this.options,a);if(a.model)this.model=a.model;if(a.collection)this.collection=a.collection;if(a.el)this.el=a.el;if(a.id)this.id=a.id;if(a.className)this.className=a.className;if(a.tagName)this.tagName=a.tagName;this.options=a},_ensureElement:function(){if(!this.el){var a={};if(this.id)a.id=this.id;if(this.className)a["class"]=this.className;this.el=this.make(this.tagName,a)}}});var m=function(a,b){var c=r(this,a,b);c.extend=m;return c};e.Model.extend=e.Collection.extend=e.Controller.extend=e.View.extend=
m;var s={create:"POST",update:"PUT","delete":"DELETE",read:"GET"};e.sync=function(a,b,c,d){var g=s[a];a=a==="create"||a==="update"?JSON.stringify(b.toJSON()):null;b={url:k(b),type:g,contentType:"application/json",data:a,dataType:"json",processData:false,success:c,error:d};if(e.emulateJSON){b.contentType="application/x-www-form-urlencoded";b.processData=true;b.data=a?{model:a}:{}}if(e.emulateHTTP)if(g==="PUT"||g==="DELETE"){if(e.emulateJSON)b.data._method=g;b.type="POST";b.beforeSend=function(i){i.setRequestHeader("X-HTTP-Method-Override",
g)}}h.ajax(b)};var n=function(){},r=function(a,b,c){var d;d=b&&b.hasOwnProperty("constructor")?b.constructor:function(){return a.apply(this,arguments)};n.prototype=a.prototype;d.prototype=new n;b&&f.extend(d.prototype,b);c&&f.extend(d,c);d.prototype.constructor=d;d.__super__=a.prototype;return d},k=function(a){if(!(a&&a.url))throw Error("A 'url' property or function must be specified");return f.isFunction(a.url)?a.url():a.url},j=function(a,b,c){return function(d){a?a(b,d):b.trigger("error",b,d,c)}}})();
/*
 The MIT License: Copyright (c) 2010 LiosK.
*/
function UUID(){}UUID.generate=function(){var a=UUID._getRandomInt,b=UUID._hexAligner;return b(a(32),8)+"-"+b(a(16),4)+"-"+b(16384|a(12),4)+"-"+b(32768|a(14),4)+"-"+b(a(48),12)};UUID._getRandomInt=function(a){if(a<0)return NaN;if(a<=30)return 0|Math.random()*(1<<a);if(a<=53)return(0|Math.random()*1073741824)+(0|Math.random()*(1<<a-30))*1073741824;return NaN};UUID._getIntAligner=function(a){return function(b,f){for(var c=b.toString(a),d=f-c.length,e="0";d>0;d>>>=1,e+=e)if(d&1)c=e+c;return c}};
UUID._hexAligner=UUID._getIntAligner(16);
// (c) 2011 Enginimation Studio (http://enginimation.com).
// porridge.js may be freely distributed under the MIT license.
"use strict";var global=this,indexedDB=global.indexedDB||global.webkitIndexedDB,IDBTransaction=global.IDBTransaction||global.webkitIDBTransaction,IDBKeyRange=global.IDBKeyRange||global.webkitIDBKeyRange,Porridge={version:"0.3",db:null,log:function(a){console.log(a)},info:function(a){console.info(a)},init:function(a,b,c){var d=indexedDB.open(a.dbName,a.dbDescription),e=a.dbVersion;d.onsuccess=function(d){var f=d.target.result;Porridge.db=f;if(e!=f.version){var g=f.setVersion(e);g.onfailure=c||Porridge.log,g.onsuccess=function(c){for(var d=0;d<a.stores.length;d++){var e=a.stores[d],g=f.createObjectStore(e.name,e.key,!0);if(e.indexes)for(var h=0;h<e.indexes.length;h++){var i=e.indexes[h];g.createIndex(i.name,i.field||i.name)}}Porridge.log("initialized db"),b()}}else b()},d.onfailure=c||this.log},all:function(a,b,c,d){var e=this.db.transaction([a],IDBTransaction.READ_WRITE,0),f=e.objectStore(a),g=f.openCursor();g.onsuccess=function(a){var d=a.result||a.target.result;if(!d)c&&c();else{var e=d.value;b(e),d.continue()}},g.onerror=d||this.log},save:function(a,b,c,d){var e=this.db.transaction([a],IDBTransaction.READ_WRITE,0),f=e.objectStore(a),g=f.put(b,c);g.onsuccess=Porridge.info,g.onerror=d||this.log},remove:function(a,b,c,d){var e=this.db.transaction([a],IDBTransaction.READ_WRITE,0),f=e.objectStore(a),g=f.delete(b);g.onsuccess=c,g.onerror=d||this.log},allByKey:function(a,b,c,d,e,f){var g=this.db.transaction([a],IDBTransaction.READ_WRITE,0),h=g.objectStore(a),i=h.index(b),j=new IDBKeyRange.only(c),k=i.openCursor(j);k.onsuccess=function(a){var b=a.result||a.target.result;if(!b)e&&e();else{var c=b.value;d(c),b.continue()}},k.onerror=f||this.log}}
// (c) 2011 Enginimation Studio (http://enginimation.com).
// backbone-indexdb.js may be freely distributed under the MIT license.
"use strict",Porridge.Model=Backbone.Model.extend({initialize:function(){this.get("id")||(this.id=UUID.generate(),this.set({id:this.id}))},save:function(){var a=this.constructor.definition.name;Porridge.save(a,this.toJSON(),this.id)},destroy:function(){var a=this.constructor.definition.name,b=this.constructor.definition.key||"id",c=this,d=function(){c.trigger("destroy",c,c.collection)};Porridge.remove(a,this.get(b),d)}},{definition:{}}),Porridge.Collection=Backbone.Collection.extend({fetch:function(a){a||(a={});var b=this,c=this.model.definition.name,d=function(a){b.add(new b.model({attributes:a}))};Porridge.all(c,d,function(){b.trigger("retrieved")},a.error)},fetchByKey:function(a,b){var c=this,d=this.model.definition.name,e=function(a){c.add(new c.model({attributes:a}))};Porridge.allByKey(d,a,b,e,function(){c.trigger("retrieved")})}})
// (c) 2011 Enginimation Studio (http://enginimation.com).
// fs.js may be freely distributed under the MIT license.
"use strict";var global=this,requestFileSystem=global.requestFileSystem||global.webkitRequestFileSystem,BlobBuilder=global.BlobBuilder||global.WebKitBlobBuilder,resolveLocalFileSystemURL=global.resolveLocalFileSystemURL||global.webkitResolveLocalFileSystemURL,fsURL=global.URL||global.webkitURL,fs=Object.create({},{version:{value:"0.8.7"},log:{value:!1,writable:!0},maxSize:{value:5347737600,writable:!0},FILE_EXPECTED:{value:6},BROWSER_NOT_SUPPORTED:{value:7},getNativeFS:{value:function(a,b){if(requestFileSystem){var c=global.PERSISTENT;b&&b.tmp&&(c=global.TEMPORARY),requestFileSystem(c,this.maxSize,function(b){a(undefined,b)},function(b){a(b)})}else a(fs.BROWSER_NOT_SUPPORTED)}},createBlob:{value:function(a,b){var c=new BlobBuilder;c.append(a);return c.getBlob(b)}},base64StringToBlob:{value:function(a,b){var c=atob(a),d=c.length,e=new Int8Array(d);for(var f=0;f<d;f++)e[f]=c.charCodeAt(f);return this.createBlob(e.buffer,b)}}});"use strict",Object.defineProperty(File.prototype,"shortName",{value:function(){var a=this.name.lastIndexOf(".");return this.name.substring(0,a)}}),Object.defineProperty(File.prototype,"extension",{value:function(){var a=this.name.lastIndexOf(".");return this.name.substring(a)}}),Object.defineProperty(File.prototype,"sizeInKB",{value:function(){var a=this.size;return(a/1014).toFixed(1)}}),Object.defineProperty(File.prototype,"sizeInMB",{value:function(){var a=this.size;return(a/1038336).toFixed(1)}}),Object.defineProperty(File.prototype,"sizeInGB",{value:function(){var a=this.size;return(a/1063256064).toFixed(1)}}),Object.defineProperty(FileError.prototype,"message",{value:function(){var a="";switch(this.code){case FileError.QUOTA_EXCEEDED_ERR:a="QUOTA_EXCEEDED_ERR";break;case FileError.NOT_FOUND_ERR:a="NOT_FOUND_ERR";break;case FileError.SECURITY_ERR:a="SECURITY_ERR";break;case FileError.INVALID_MODIFICATION_ERR:a="INVALID_MODIFICATION_ERR";break;case FileError.INVALID_STATE_ERR:a="INVALID_STATE_ERR";break;case fs.FILE_EXPECTED:a="FILE_EXPECTED";break;case fs.BROWSER_NOT_SUPPORTED:a="BROWSER_NOT_SUPPORTED";break;default:a="Unknown Error"}return a}}),"use strict",fs.io=Object.create({},{createFile:{value:function(a,b){fs.util.getFileFromRoot(a,b,{})}},createTmpFile:{value:function(a,b){fs.util.getFileFromRoot(a,b,{tmp:!0})}},createDirectory:{value:function(a,b){fs.util.getDirectoryFromRoot(a,b,{})}},createTmpDirectory:{value:function(a,b){fs.util.getDirectoryFromRoot(a,b,{tmp:!0})}},readDirectory:{value:function(a,b){fs.util.getDirectory(a,function(a,c){a?b(a):fs.util.readEntriesFromDirectory(c,b)},{})}},readRootDirectory:{value:function(a){fs.getNativeFS(function(b,c){b?a(b):fs.util.readEntriesFromDirectory(c.root,a)},{})}}}),"use strict";var global=this;fs.util=Object.create({},{getReader:{value:function(a,b,c){var d=new FileReader,e=a;d.onloadend=function(a){b(undefined,this.result,e)},d[c](e)}},getFile:{value:function(a,b,c){a.getFile(b,{create:!0},function(a){c(undefined,a)},function(a){c(a)})}},getDirectory:{value:function(a,b,c){c(undefined,a.getDirectory(b,{create:!0}))}},getDirectoryFromRoot:{value:function(a,b,c){fs.getNativeFS(function(c,d){c?b(c):fs.util.getDirectory(d.root,a,b)},c)}},readEntriesFromDirectory:{value:function(a,b){var c=a.createReader();c.readEntries(function(a){b(undefined,a)},function(a){b(a)})}},readAsArrayBuffer:{value:function(a,b,c){this.getReaderUsingFileName(a,b,"readAsArrayBuffer",c)}},readFileAsArrayBuffer:{value:function(a,b){this.getReader(a,b,"readAsArrayBuffer")}},readAsBinaryString:{value:function(a,b,c){this.getReaderUsingFileName(a,b,"readAsBinaryString",c)}},readFileAsBinaryString:{value:function(a,b){this.getReader(a,b,"readAsBinaryString")}},readAsDataUrl:{value:function(a,b,c){this.getReaderUsingFileName(a,b,"readAsDataURL",c)}},readAsText:{value:function(a,b,c){this.getReaderUsingFileName(a,b,"readAsText",c)}},writeBase64StrToFile:{value:function(a,b,c,d,e){var f=fs.base64StringToBlob(b,c);this.writeBlobToFile(a,f,d,e)}},writeBlobToFile:{value:function(a,b,c,d){this.getFileFromRoot(a,function(a,d){a?c(a):d.createWriter(function(a){a.onwriteend=function(a){c(undefined)},a.onerror=function(a){c(a)},a.write(b)},function(a){c(a)})},d)}},writeTextToFile:{value:function(a,b,c,d){var e=fs.createBlob(b,"text/plain");fs.util.writeBlobToFile(a,e,c,d)}},writeArrayBufferToFile:{value:function(a,b,c,d,e){var f=fs.createBlob(c,b);fs.util.writeBlobToFile(a,f,d,e)}},writeFileToFile:{value:function(a,b,c){this.readFileAsArrayBuffer(a,function(d,e,f){if(d)b(d);else{var g=c.filename||f.name;fs.util.writeArrayBufferToFile(g,a.type,e,b,c)}})}},getReaderUsingFileName:{value:function(a,b,c,d){fs.getNativeFS(function(d,e){d?b(d):e.root.getFile(a,{},function(a){a.isFile===!0?a.file(function(a){fs.util.getReader(a,b,c)},function(a){b(a)}):b(fs.FILE_EXPECTED)},function(a){b(a)})},d)}},getFileFromRoot:{value:function(a,b,c){fs.getNativeFS(function(c,d){c?b(c):fs.util.getFile(d.root,a,b)},c)}},createFileURL:{value:function(a,b){fs.util.getFileFromRoot(a,function(a,c){c.file(function(a){var c=fsURL.createObjectURL(a);b(c)})})}},destroyFileURL:{value:function(a){fsURL.revokeObjectURL(a)}},remove:{value:function(a,b){this.getFileFromRoot(a,function(a,c){c.remove(function(){b(undefined)},function(a){b(a)})})}}}),"use strict",fs.read=Object.create({},{asDataUrl:{value:function(a,b){fs.util.readAsDataUrl(a,b,{})}},tmpFileAsDataUrl:{value:function(a,b){fs.util.readAsDataUrl(a,b,{tmp:!0})}},asText:{value:function(a,b){fs.util.readAsText(a,b,{})}},tmpFileAsText:{value:function(a,b){fs.util.readAsText(a,b,{tmp:!0})}},asBinaryString:{value:function(a,b){fs.util.readAsBinaryString(a,b,{})}},tmpFileAsBinaryString:{value:function(a,b){fs.util.readAsBinaryString(a,b,{tmp:!0})}},asArrayBuffer:{value:function(a,b){fs.util.readAsArrayBuffer(a,b,{})}},tmpFileAsArrayBuffer:{value:function(a,b){fs.util.readAsArrayBuffer(a,b,{tmp:!0})}},fileAsText:{value:function(a,b){fs.util.getReader(a,b,"readAsText")}},fileAsDataURL:{value:function(a,b){fs.util.getReader(a,b,"readAsDataURL")}},fileAsArrayBuffer:{value:function(a,b){fs.util.readFileAsArrayBuffer(a,b)}},fileAsBinaryString:{value:function(a,b){fs.util.readFileAsBinaryString(a,b)}}}),"use strict",fs.write=Object.create({},{file:{value:function(a,b,c){fs.util.writeFileToFile(a,b,{filename:c})}},fileToTmpFile:{value:function(a,b,c){fs.util.writeFileToFile(a,b,{tmp:!0})}},blob:{value:function(a,b,c){fs.util.writeBlobToFile(a,b,c,{})}},blobToTmpFile:{value:function(a,b,c){fs.util.writeBlobToFile(a,b,c,{tmp:!0})}},text:{value:function(a,b,c){fs.util.writeTextToFile(a,b,c,{})}},textToTmpFile:{value:function(a,b,c){fs.util.writeTextToFile(a,b,c,{tmp:!0})}},base64Str:{value:function(a,b,c,d){fs.util.writeBase64StrToFile(a,b,c,d,{})}},base64StrToTmpFile:{value:function(a,b,c,d){fs.util.writeBase64StrToFile(a,b,c,d,{tmp:!0})}}})
//id3
ID3v2 =
{
	parseStream: function(stream, onComplete)
    {

	var TAGS =
    {
    "AENC": "Audio encryption",
    "APIC": "Attached picture",
    "COMM": "Comments",
    "COMR": "Commercial frame",
    "ENCR": "Encryption method registration",
    "EQUA": "Equalization",
    "ETCO": "Event timing codes",
    "GEOB": "General encapsulated object",
    "GRID": "Group identification registration",
    "IPLS": "Involved people list",
    "LINK": "Linked information",
    "MCDI": "Music CD identifier",
    "MLLT": "MPEG location lookup table",
    "OWNE": "Ownership frame",
    "PRIV": "Private frame",
    "PCNT": "Play counter",
    "POPM": "Popularimeter",
    "POSS": "Position synchronisation frame",
    "RBUF": "Recommended buffer size",
    "RVAD": "Relative volume adjustment",
    "RVRB": "Reverb",
    "SYLT": "Synchronized lyric/text",
    "SYTC": "Synchronized tempo codes",
    "TALB": "album",
    "TBPM": "BPM",
    "TCOM": "Composer",
    "TCON": "genre",
    "TCOP": "Copyright message",
    "TDAT": "date",
    "TDLY": "Playlist delay",
    "TENC": "Encoded by",
    "TEXT": "Lyricist",
    "TFLT": "File type",
    "TIME": "time",
    "TIT1": "Content group description",
    "TIT2": "title",
    "TIT3": "Subtitle",
    "TKEY": "Initial key",
    "TLAN": "Language(s)",
    "TLEN": "length",
    "TMED": "Media type",
    "TOAL": "Original album",
    "TOFN": "Original filename",
    "TOLY": "Original lyricist",
    "TOPE": "Original artist",
    "TORY": "Original release year",
    "TOWN": "File owner",
    "TPE1": "artist",
    "TPE2": "Band",
    "TPE3": "Conductor",
    "TPE4": "Interpreted, remixed, or otherwise modified by",
    "TPOS": "Part of a set",
    "TPUB": "Publisher",
    "TRCK": "track",
    "TRDA": "Recording dates",
    "TRSN": "Internet radio station name",
    "TRSO": "Internet radio station owner",
    "TSIZ": "size",
    "TSRC": "ISRC (international standard recording code)",
    "TSSE": "Software/Hardware and settings used for encoding",
    "TYER": "year",
    "TXXX": "User defined text information frame",
    "UFID": "Unique file identifier",
    "USER": "Terms of use",
    "USLT": "Unsychronized lyric/text transcription",
    "WCOM": "Commercial information",
    "WCOP": "Copyright/Legal information",
    "WOAF": "Official audio file webpage",
    "WOAR": "Official artist/performer webpage",
    "WOAS": "Official audio source webpage",
    "WORS": "Official internet radio station homepage",
    "WPAY": "Payment",
    "WPUB": "Publishers official webpage",
    "WXXX": "User defined URL link frame"
  };

	var TAG_MAPPING_2_2_to_2_3 = {
    "BUF": "RBUF",
    "COM": "COMM",
    "CRA": "AENC",
    "EQU": "EQUA",
    "ETC": "ETCO",
    "GEO": "GEOB",
    "MCI": "MCDI",
    "MLL": "MLLT",
    "PIC": "APIC",
    "POP": "POPM",
    "REV": "RVRB",
    "RVA": "RVAD",
    "SLT": "SYLT",
    "STC": "SYTC",
    "TAL": "TALB",
    "TBP": "TBPM",
    "TCM": "TCOM",
    "TCO": "TCON",
    "TCR": "TCOP",
    "TDA": "TDAT",
    "TDY": "TDLY",
    "TEN": "TENC",
    "TFT": "TFLT",
    "TIM": "TIME",
    "TKE": "TKEY",
    "TLA": "TLAN",
    "TLE": "TLEN",
    "TMT": "TMED",
    "TOA": "TOPE",
    "TOF": "TOFN",
    "TOL": "TOLY",
    "TOR": "TORY",
    "TOT": "TOAL",
    "TP1": "TPE1",
    "TP2": "TPE2",
    "TP3": "TPE3",
    "TP4": "TPE4",
    "TPA": "TPOS",
    "TPB": "TPUB",
    "TRC": "TSRC",
    "TRD": "TRDA",
    "TRK": "TRCK",
    "TSI": "TSIZ",
    "TSS": "TSSE",
    "TT1": "TIT1",
    "TT2": "TIT2",
    "TT3": "TIT3",
    "TXT": "TEXT",
    "TXX": "TXXX",
    "TYE": "TYER",
    "UFI": "UFID",
    "ULT": "USLT",
    "WAF": "WOAF",
    "WAR": "WOAR",
    "WAS": "WOAS",
    "WCM": "WCOM",
    "WCP": "WCOP",
    "WPB": "WPB",
    "WXX": "WXXX"
  };

  //pulled from http://www.id3.org/id3v2-00 and changed with a simple replace
  //probably should be an array instead, but thats harder to convert -_-
  var ID3_2_GENRES = {
		"0": "Blues",
		"1": "Classic Rock",
		"2": "Country",
		"3": "Dance",
		"4": "Disco",
		"5": "Funk",
		"6": "Grunge",
		"7": "Hip-Hop",
		"8": "Jazz",
		"9": "Metal",
		"10": "New Age",
		"11": "Oldies",
		"12": "Other",
		"13": "Pop",
		"14": "R&B",
		"15": "Rap",
		"16": "Reggae",
		"17": "Rock",
		"18": "Techno",
		"19": "Industrial",
		"20": "Alternative",
		"21": "Ska",
		"22": "Death Metal",
		"23": "Pranks",
		"24": "Soundtrack",
		"25": "Euro-Techno",
		"26": "Ambient",
		"27": "Trip-Hop",
		"28": "Vocal",
		"29": "Jazz+Funk",
		"30": "Fusion",
		"31": "Trance",
		"32": "Classical",
		"33": "Instrumental",
		"34": "Acid",
		"35": "House",
		"36": "Game",
		"37": "Sound Clip",
		"38": "Gospel",
		"39": "Noise",
		"40": "AlternRock",
		"41": "Bass",
		"42": "Soul",
		"43": "Punk",
		"44": "Space",
		"45": "Meditative",
		"46": "Instrumental Pop",
		"47": "Instrumental Rock",
		"48": "Ethnic",
		"49": "Gothic",
		"50": "Darkwave",
		"51": "Techno-Industrial",
		"52": "Electronic",
		"53": "Pop-Folk",
		"54": "Eurodance",
		"55": "Dream",
		"56": "Southern Rock",
		"57": "Comedy",
		"58": "Cult",
		"59": "Gangsta",
		"60": "Top 40",
		"61": "Christian Rap",
		"62": "Pop/Funk",
		"63": "Jungle",
		"64": "Native American",
		"65": "Cabaret",
		"66": "New Wave",
		"67": "Psychadelic",
		"68": "Rave",
		"69": "Showtunes",
		"70": "Trailer",
		"71": "Lo-Fi",
		"72": "Tribal",
		"73": "Acid Punk",
		"74": "Acid Jazz",
		"75": "Polka",
		"76": "Retro",
		"77": "Musical",
		"78": "Rock & Roll",
		"79": "Hard Rock",
		"80": "Folk",
		"81": "Folk-Rock",
		"82": "National Folk",
		"83": "Swing",
		"84": "Fast Fusion",
		"85": "Bebob",
		"86": "Latin",
		"87": "Revival",
		"88": "Celtic",
		"89": "Bluegrass",
		"90": "Avantgarde",
		"91": "Gothic Rock",
		"92": "Progressive Rock",
		"93": "Psychedelic Rock",
		"94": "Symphonic Rock",
		"95": "Slow Rock",
		"96": "Big Band",
		"97": "Chorus",
		"98": "Easy Listening",
		"99": "Acoustic",
		"100": "Humour",
		"101": "Speech",
		"102": "Chanson",
		"103": "Opera",
		"104": "Chamber Music",
		"105": "Sonata",
		"106": "Symphony",
		"107": "Booty Bass",
		"108": "Primus",
		"109": "Porn Groove",
		"110": "Satire",
		"111": "Slow Jam",
		"112": "Club",
		"113": "Tango",
		"114": "Samba",
		"115": "Folklore",
		"116": "Ballad",
		"117": "Power Ballad",
		"118": "Rhythmic Soul",
		"119": "Freestyle",
		"120": "Duet",
		"121": "Punk Rock",
		"122": "Drum Solo",
		"123": "A capella",
		"124": "Euro-House",
		"125": "Dance Hall"
		};

	var tag = {};


	var max_size = Infinity;

	function read(bytes, callback){
		stream(bytes, callback, max_size);
	}


	function parseDuration(ms){
		var msec = parseInt(cleanText(ms)) //leading nulls screw up parseInt
		var secs = Math.floor(msec/1000);
		var mins = Math.floor(secs/60);
		var hours = Math.floor(mins/60);
		var days = Math.floor(hours/24);

		return {
			milliseconds: msec%1000,
			seconds: secs%60,
			minutes: mins%60,
			hours: hours%24,
			days: days
		};
	}


	function pad(num){
		var arr = num.toString(2);
		return (new Array(8-arr.length+1)).join('0') + arr;
	}

	function arr2int(data){
		if(data.length == 4){
			if(tag.revision > 3){
				var size = data[0] << 0x15;
				size += data[1] << 14;
				size += data[2] << 7;
				size += data[3];
			}else{
				var size = data[0] << 24;
				size += data[1] << 16;
				size += data[2] << 8;
				size += data[3];
			}
		}else{
			var size = data[0] << 16;
			size += data[1] << 8;
			size += data[2];
		}
		return size;
	}


	var TAG_HANDLERS = {
		"TLEN": function(size, s, a){
			tag.Length = parseDuration(s);
		},
		"TCON": function(size, s, a){
			s = cleanText(s);
			if(/\([0-9]+\)/.test(s)){
				var genre = ID3_2_GENRES[parseInt(s.replace(/[\(\)]/g,''))]
			}else{
				var genre = s;
			}
			tag.genre = genre;
		}
	};

	function read_frame(){
		if(tag.revision < 3){
			read(3, function(frame_id){
				console.log(frame_id)
				if(/[A-Z0-9]{3}/.test(frame_id)){
					var new_frame_id = TAG_MAPPING_2_2_to_2_3[frame_id.substr(0,3)];
					read_frame2(frame_id, new_frame_id);
				}else{
					onComplete(tag);
					return;
				}
			})
		}else{
			read(4, function(frame_id){
				console.log(frame_id)
				if(/[A-Z0-9]{4}/.test(frame_id)){
					read_frame3(frame_id);
				}else{
					onComplete(tag);
					return;
				}
			})
		}
	}


	function cleanText(str){
		if(str.indexOf('http://') != 0){
			var TextEncoding = str.charCodeAt(0);
			str = str.substr(1);
		}
		//screw it i have no clue
		return str.replace(/[^A-Za-z0-9\(\)\{\}\[\]\!\@\#\$\%\^\&\* \/\"\'\;\>\<\?\,\~\`\.\n\t]/g,'');
	}


	function read_frame3(frame_id){
		read(4, function(s, size){
			var intsize = arr2int(size);
			read(2, function(s, flags){
				flags = pad(flags[0]).concat(pad(flags[1]));
				read(intsize, function(s, a){
					if(typeof TAG_HANDLERS[frame_id] == 'function'){
						TAG_HANDLERS[frame_id](intsize, s, a);
					}else if(TAGS[frame_id]){
						tag[TAGS[frame_id]] = (tag[TAGS[frame_id]]||'') + cleanText(s)
					}else{
						tag[frame_id] = cleanText(s)
					}
					read_frame();
				})
			})
		})
	}

	function read_frame2(v2ID, frame_id){
		read(3, function(s, size){
			var intsize = arr2int(size);
			read(intsize, function(s, a){
				if(typeof TAG_HANDLERS[v2ID] == 'function'){
					TAG_HANDLERS[v2ID](intsize, s, a);
				}else if(typeof TAG_HANDLERS[frame_id] == 'function'){
					TAG_HANDLERS[frame_id](intsize, s, a);
				}else if(TAGS[frame_id]){
					tag[TAGS[frame_id]] = (tag[TAGS[frame_id]]||'') + cleanText(s)
				}else{
						tag[frame_id] = cleanText(s)
					}
									console.log(tag)
				read_frame();
			})
		})
	}


	read(3, function(header){
		if(header == "ID3"){
			read(2, function(s, version){
				tag.version = "ID3v2."+version[0]+'.'+version[1];
				tag.revision = version[0];
				console.log('version',tag.version);
				read(1, function(s, flags){
					//todo: parse flags
					flags = pad(flags[0]);
					read(4, function(s, size){
						max_size = arr2int(size);
						read(0, function(){}); //signal max
						read_frame()
					})
				})
			})
		}else{
			onComplete(tag);
			return false; //no header found
		}
	})
	return tag;
},

parseFile: function(binData, onComplete)
{
	var pos = 0,
			bits_required = 0,
			handle = function(){},
			maxdata = Infinity;

	function read(bytes, callback, newmax)
    {
		bits_required = bytes;
		handle = callback;
		maxdata = newmax;
		if(bytes == 0) callback('',[]);
	}
	var responseText = '';
	(function(){
		if(binData){
			responseText = binData;
		}

		if(responseText.length > pos + bits_required && bits_required){
			var data = responseText.substr(pos, bits_required);
			var arrdata = data.split('').map(function(e){return e.charCodeAt(0) & 0xff});
			pos += bits_required;
			bits_required = 0;
			if(handle(data, arrdata) === false){
				return;
			}
		}
		setTimeout(arguments.callee, 0);
	})()
	return [ID3v2.parseStream(read, onComplete)];
}
}