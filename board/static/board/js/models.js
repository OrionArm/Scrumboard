(function ($, Backbone, _, app) {

app.models.Sprint = Backbone.Model.extend({});
app.models.Task = Backbone.Model.extend({});
app.models.User = Backbone.Model.extend({});
app.collections.ready = $.getJSON(app.apiRoot);
app.collections.ready.done(function (data) {
	app.collections.Sprints = Backbone.Collection.extend({
		model: app.models.Sprint,
		url: data.sprints
	});
	app.sprints = new app.collections.Sprints();

	app.collections.Tasks = Backbone.Collection.extend({
		model: app.models.Task,
		url: data.tasks
	});
	app.tasks = new app.collections.Tasks();
	app.collections.Users = Backbone.Collection.extend({
		model: app.models.User,
		url: data.users
	});
	app.users = new app.collections.Users();
});

// CSRF helper functions taken directly from Django docs
function csrfSafeMethod(method) {
	// these HTTP methods do not require CSRF protection
	return (/^(GET|HEAD|OPTIONS|TRACE)$/i.test(method));
}
function getCookie(name) {
	var cookieValue = null;
	if (document.cookie && document.cookie != '') {
		var cookies = document.cookie.split(';');
		for (var i = 0; i < cookies.length; i++) {
			var cookie = $.trim(cookies[i]);
			// Does this cookie string begin with the name we want?
			if (cookie.substring(0, name.length + 1) == (name + '=')) {
				cookieValue = decodeURIComponent(
				cookie.substring(name.length + 1));
				break;
			}
		}
	}
	return cookieValue;
}

// Setup jQuery ajax calls to handle CSRF
$.ajaxPrefilter(function (settings, originalOptions, xhr) {
	var csrftoken;
	if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
		// Send the token to same-origin, relative URLs only.
		// Send the token only if the method warrants CSRF protection
		// Using the CSRFToken value acquired earlier
		csrftoken = getCookie('csrftoken');
		xhr.setRequestHeader('X-CSRFToken', csrftoken);
	}
});

var Session = Backbone.Model.extend({
	defaults: {
		token: null
	},
	initialize: function (options) {
		this.options = options;
		$.ajaxPrefilter($.proxy(this._setupAuth, this));
		this.load();
	},
	load: function () {
		var token = localStorage.apiToken;
		if (token) {
			this.set('token', token);
		}
	},
	save: function (token) {
		this.set('token', token);
		if (token === null) {
			localStorage.removeItem('apiToken');
		} else {
			localStorage.apiToken = token;
		}
	},
	delete: function () {
		this.save(null);
	},
	authenticated: function () {
		return this.get('token') !== null;
	},
	_setupAuth: function (settings, originalOptions, xhr) {
		if (this.authenticated()) {
			xhr.setRequestHeader(
				'Authorization',
				'Token ' + this.get('token')
			);
		}
	}
});
app.session = new Session();




})(jQuery, Backbone, _, app);