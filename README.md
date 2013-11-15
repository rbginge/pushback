pushback
========

Supervising controller pattern in Javascript. 

Designed for applications that are heavily service oriented and don't require any model capabilites on the client-side. A route manager will direct requests to controllers which will capture RESTful services and apply the data to views (templates). The library depends on jQuery and lo-dash (but should (maybe with a little tweaking) work as well with Zepto and underscore). I plan on removing the dependency in the near future.

### Usage

#### Add a target for resolved templates in your html

Simply add a pb attribute to an element in your html output.

```html
  <div pb></div>
```

#### Write some templates

Using the template engine packaged with lo-dash (and underscore) write your templates...

```html
  <!-- /assets/partials/articleList.jst -->
  <ul>
  <% _.forEach(posts, function(post) { %>
    <li><a href="#/news/<%- post.id %>"><%- post.title %></a></li>
  <% }); %>
  </ul>
```

```html
  <!-- /assets/partials/articleDetail.jst -->
  <h2><%- post.title %></h2>
  <div><%= post.content %></div>
```

#### Define some routes

```javascript
	pushback.routes.add([
		{
			route: '/', 
			config: {
				template: '/assets/partials/default.jst',
				controller: 'DefaultCtrl',
				service: myOwnLibrary.aFunction
			}
		},
		{
			route: '/news', 
			config: {
				template: '/assets/partials/articleList.jst',
				controller: 'ArticleListCtrl',
				service: '/?json=get_posts&cat=news'
			}
		},
		{
			route: '/news/:param', 
			config: {
				template: '/assets/partials/articleDetail.jst',
				controller: 'ArticleDetailCtrl',
				service: '/?json=get_post&post_id=:param' 
			}
		}
	]);
```

#### Add some controllers

```javascript
	pushback.controllers.
		add('DefaultCtrl', function(process, service, param) {
	    // No service here. Do something else...
		}).

		add('ArticleListCtrl', function(process, service, param) {
			pushback.services.retrieve(service, param, function(data) {
				process(data);

				// Run any code here that needs to come after the service has ended
			}, function() {
			  // Run some code before the request for the service
			});
		}).

		add('ArticleDetailCtrl', function(process, service, param) {
			pushback.services.retrieve(service, param, function(data) {
				process(data);

				// Run any code here that needs to come after the service has ended
			}, function() {
			  // Run some code before the request for the service
			});
		});
```

