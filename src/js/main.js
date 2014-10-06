require.config({
	baseUrl: 'assets/js',
	paths: {
		d3: 'http://cdnjs.cloudflare.com/ajax/libs/d3/3.4.11/d3.min',
		jquery: 'http://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.1/jquery.min',
		mustache: 'http://cdnjs.cloudflare.com/ajax/libs/mustache.js/0.8.1/mustache.min'
	}
});

define(['jquery', 'mustache', 'd3', 'helpers.min', 'probability.min'], function($, mustache, d3) {

	var self = this;

	self.n = 0;

	self.templates = {

		params: '{{#.}}<label>{{ title }}:<input type="number" min="{{ min }}" max="{{ max }}" step="{{ step }}" value="{{ value }}" id="{{ id }}"/></label>{{/.}}',

		moments: '<pre class="center"><span>&mu;: {{ mean }}</span><span>&sigma;<sup>2</sup>: {{ variance }}</span><span>&gamma;<sub>1</sub>: {{ skewness }}</span><span>&gamma;<sub>2</sub>: {{ kurtosis }}</span></pre>',

		distr: '<div id="{{ id }}"></div>',

		binomial: {
			title: '<h1>PMF<small>(n=<em>{{ n }}</em>, p=<em>{{ p }}</em>)</small></h1>',
		},

		geometric: {
			title: '<h1>PMF<small>(n=<em>{{ n }}</em>, p=<em>{{ p }}</em>)</small></h1>',
		},

		exponential: {
			title: '<h1>PMF<small>(&lambda;=<em>{{ lambda }}</em>)</small></h1>',
		},

		poisson: {
			title: '<h1>PMF<small>(&lambda;=<em>{{ lambda }}</em>)</small></h1>',
		},

		gaussian: {
			title: '<h1>PMF<small>(&mu;=<em>{{ mean }}</em>, &sigma;=<em>{{ std }}</em>)</small></h1>',
		},

		gamma: {
			title: '<h1>PMF<small>(k=<em>{{ k }}</em>, &theta;=<em>{{ theta }}</em>)</small></h1>',
		}

	};

	self.init = function() {

		$('#params').html(self.renderParams($('select[name=distr-type] option').eq(0).val() || 'binomial'));

		self.bindEvents();

	};

	self.bindEvents = function() {

		$('select[name=distr-type]').on('change', function(e) {

			distrType = $(this).val();

			$('#params').html(self.renderParams(distrType));

		});

		$('#calc').on('submit', function(e) {

			e.preventDefault();

			var i, inc, start, end,
				distr = [],
				distrType = $('select[name=distr-type]').val(),
				distrIval = Math.p.distribution[distrType].interval,
				params = self.getParams('#params'),
				m_0 = Math.p.distribution[distrType].mgf(params),
				moments = { mean: Math.p.moments.mean(m_0, 0), variance: Math.p.moments.variance(m_0, 0), skewness: Math.p.moments.skewness(m_0, 0), kurtosis: Math.p.moments.kurtosis(m_0, 0) };

			distr = self.buildPDF(distrType, params, moments);

			var html = mustache.render(self.templates[distrType].title, params);
				html += mustache.render(self.templates.moments, moments);
				html += mustache.render(self.templates.distr, { values: Math.h.arr_dump(distr, 'y'), id: 'graph-' + self.n });

			var $el = $('<div/>').addClass('result').html(html);

			$('.container').append($el.hide().fadeIn(500));

			self.plot(distr, '#graph-' + self.n, [Math.min.apply(Math, distr.map(function(el) { return el.x; })), Math.max.apply(Math, distr.map(function(el) { return el.x; }))]);

			self.n += 1;

		});

		$('#calc').on('reset', function(e) {

			e.preventDefault();

			self.n = 0;

			$('.result').remove();

		});

	};

	self.getParams = function(id) {

		var $el = $(id),
			params = {};

		$el.find('input').each(function() {

			params[this.id] = parseFloat(this.value, 10);

		});

		return params;

	};

	self.renderParams = function(distrType) {

		if (typeof Math.p.distribution[distrType] !== 'undefined') {

			return mustache.render(self.templates.params, Math.p.distribution[distrType].params);

		}

	};

	self.buildPDF = function(distrType, params, moments) {

		var distr = [],
			inc = (Math.p.distribution[distrType].discrete) ? 1 : Math.sqrt(moments.variance) / 100;

		distr = self.generatePDF(distrType, params, moments, -inc).concat(self.generatePDF(distrType, params, moments, inc));

		distr.sort(function(a, b) {
			if (a.x < b.x) {
				return -1;
			}
			if (a.x > b.x) {
				return 1;
			}
			return 0;
		});

		return distr;

	};

	self.generatePDF = function(distrType, params, moments, inc) {

		var distr = [],
			i = 0,
			start = moments.mean,
			value;

		while (i < 10 * moments.variance) {

			if (!self.inBounds(start - i, Math.p.distribution[distrType].bounds) || (!isNaN(value) && (value <= 0.00001 ||  value > 1.0))) {
				break;
			}

			value = Math.p.distribution[distrType].pdf(params)(start - i);
			distr.push({ x: start - i, y: value });

			i += inc;

		}

		return distr;

	};

	self.inBounds = function(value, bounds) {

		if (value >= bounds[0] && value <= bounds[1]) {
			return true;
		}

		return false;

	};

	self.plot = function(data, id, xr) {

		var m = [80, 80, 80, 80],
			w = 640 - m[1] - m[3],
			h = 360 - m[0] - m[2],

			x = d3.scale.linear().domain([d3.min(xr), d3.max(xr)]).range([0, w]),
			y = d3.scale.linear().domain([0, Math.max.apply(Math, data.map(function(v) { return v.y; }))]).range([h, 0]);

		var line = d3.svg.line()
			.x(function(d) { return x(d.x); })
			.y(function(d) { return y(d.y); });

			var graph = d3.select(id).append('svg:svg')
						.attr('width', w + m[1] + m[3])
						.attr('height', h + m[0] + m[2])
					.append('svg:g')
						.attr('transform', 'translate(' + m[3] + ', ' + m[0] + ')');

			var xAxis = d3.svg.axis().scale(x).tickSize(-h).tickSubdivide(true);

			graph.append('svg:g')
						.attr('class', 'x axis')
						.attr('transform', 'translate(0, ' + h + ')')
						.call(xAxis);

			var yAxisLeft = d3.svg.axis().scale(y).ticks(4).orient('left');

			graph.append('svg:g')
						.attr('class', 'y axis')
						.attr('transform', 'translate(-25, 0)')
						.call(yAxisLeft);

			graph.append('svg:path').attr('d', line(data));

	};

	self.init();

});