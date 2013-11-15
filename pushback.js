;(function(window, _, $, undefined) {

	window.pushback = window.pushback || (function() {

		var routes = (function() {

			var register = {},
				total = 0,
				param;

			var exposeRoute = function(hash) {
				return hash.replace('#','');
			};

			var resolveRoute = function(hash) {
				var found;

				_.forEach(register, function(route, key) {
					if(found) return;

					var match = (new RegExp('^' + key.replace(/\//ig,'\\/').replace(':param','(\\d|\\w+)') + '\\/?$', 'ig')).exec(hash);

					if(match) {
						register[found = key].param = match[1];
					}
				});

				return found;
			};

			var add = function(allRoutes) {
				total = allRoutes.length;

				_.forEach(allRoutes, function(route, key) {
					if(route.config.template && !views.templates.exists(route.config.template)) {
						views.templates.cache(route.config.template);
					}

					if(route.config.service) {
						services.add(route.route, route.config.service);
					}

					register[route.route] = route.config;
				});
			};

			var len = function() {
				return total;
			};

			var routeRequest = function(hash) {

				var routeKey = resolveRoute(hash),
					route = register[routeKey || '/'];

				views.show(route.template, controllers.get(route.controller), route.service, route.param);
			};

			$(window).on('hashchange', function() {
				routeRequest(exposeRoute(window.location.hash));
			});

			return {
				add: add,
				len: len
			};
		})();

		var services = (function() {

			var register = {};

			var add = function(route, service) {
				register[route] = service;
			};

			var get = function(route) {
				return register[route] || false;
			};

			var retrieve = function(service, param, cb) {
				$.getJSON(param ? service.replace(':param', param) : service)
					.done(function(json) {
						cb(json);
					})
					.fail(function(jqxhr, textStatus, error) {
						cb({});
					});
			};

			return {
				add: add,
				retrieve: retrieve
			};
		})();

		var controllers = (function() {

			var register = {};

			var add = function(controller, combine) {
				register[controller] = combine;
				return this;
			};

			var get = function(controller) {
				return register[controller] || function() {};
			};

			return {
				add: add,
				get: get
			};
		})();

		var views = (function() {

			var targetSelector = '[pb]';

			var templates = (function() {

				var register = {},
					loaded = 0,
					loadedEvent = 'templatesLoaded';

				var add = function(route, jst) {
					register[route] = jst;
				};

				var cache = function(template) {
					$.ajax({ 
						url: template 
					}).done(function(jst) {
						add(template, jst);

						checkLoaded();
					}).fail(function(jqXHR, textStatus) {
						add(template, {});

						checkLoaded();
					});
				};

				var checkLoaded = function() {
					if(++loaded >= routes.len()) $(document).trigger(loadedEvent);
				};

				var exists = function(route) {
					return !!register[route];
				};

				var get = function(route) {
					return register[route] || {};
				};

				return {
					exists: exists,
					get: get,
					cache: cache,
					loaded: loadedEvent
				};
			}) ();

			var show = function(view, controller, service, param) {
				var afterRetrieve = controller();

				if(typeof service === 'function') {
					service();
					if(afterRetrieve) afterRetrieve();
				} else {
					services.retrieve(service, param, function(data) {
						var template = templates.get(view);
						$(targetSelector).html(_.template(template, data))

						afterRetrieve(data);
					});
				}
			};

			return {
				show: show,
				templates: templates,
			};
		})();

		return {
			routes: routes,
			controllers: controllers,
			start: function() {
				$(document).on(views.templates.loaded, function() {
					$(window).trigger('hashchange');
				});
			}
		};
	}) ();

})(window, window._, window.jQuery);
