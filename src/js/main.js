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

	// track number of distributions generated
	self.n = 0;

	// mustache templates used for displaying generated statistics
	self.templates = {

		params: '{{#.}}<label>{{ title }}:<input type="number" min="{{ min }}" max="{{ max }}" step="{{ step }}" value="{{ value }}" id="{{ id }}"/></label>{{/.}}',

		moments: '<pre class="center"><span>&mu;: {{ mean }}</span><span>&sigma;<sup>2</sup>: {{ variance }}</span><span>&gamma;<sub>1</sub>: {{ skewness }}</span><span>&gamma;<sub>2</sub>: {{ kurtosis }}</span></pre>',

		distr: '<div id="{{ id }}"></div>',

		uniform: {
			title: '<h1>PMF<small>(a=<em>{{ a }}</em>, b=<em>{{ b }}</em>)</small></h1>'
		},

		binomial: {
			title: '<h1>PMF<small>(n=<em>{{ n }}</em>, p=<em>{{ p }}</em>)</small></h1>'
		},

		geometric: {
			title: '<h1>PMF<small>(n=<em>{{ n }}</em>, p=<em>{{ p }}</em>)</small></h1>'
		},

		logarithmic: {
			title: '<h1>PMF<small>(p=<em>{{ p }}</em>)</small></h1>'
		},

		exponential: {
			title: '<h1>PMF<small>(&lambda;=<em>{{ lambda }}</em>)</small></h1>'
		},

		poisson: {
			title: '<h1>PMF<small>(&lambda;=<em>{{ lambda }}</em>)</small></h1>'
		},

		gaussian: {
			title: '<h1>PMF<small>(&mu;=<em>{{ mean }}</em>, &sigma;=<em>{{ std }}</em>)</small></h1>'
		},

		beta: {
			title: '<h1>PMF<small>(&alpha;=<em>{{ a }}</em>, &beta;=<em>{{ b }}</em>)</small></h1>'
		},

		gamma: {
			title: '<h1>PMF<small>(k=<em>{{ k }}</em>, &theta;=<em>{{ theta }}</em>)</small></h1>'
		},

		rayleigh: {
			title: '<h1>PMF<small>(&sigma;=<em>{{ sigma }}</em>)</small></h1>'
		},

		gumbel: {
			title: '<h1>PMF<small>(&mu;=<em>{{ mu }}</em>, &beta;=<em>{{ beta }}</em>)</small></h1>'
		}

	};

	/**
	 * generate support parameters based on first element in dropdown list or default to binomial distribution if there are no options
	 * bind all necessary events
	 */
	self.init = function() {

		$('#params').html(self.renderParams($('select[name=distr-type] option').eq(0).val() || 'binomial'));

		self.bindEvents();

	};

	/**
	 * bind events needed for generating statistics corresponding to any distribution
	 */
	self.bindEvents = function() {

		// generate input elements based on selected distribution type
		$('select[name=distr-type]').on('change', function(e) {

			distrType = $(this).val();

			$('#params').html(self.renderParams(distrType));

		});

		// generate the actual statistics based on input parameters when form is submitted
		$('#calc').on('submit', function(e) {

			e.preventDefault();

			var i, inc, start, end,
				distr = [],
				distrType = $('select[name=distr-type]').val(),
				distrIval = Math.p.distribution[distrType].interval,
				params = self.getParams('#params'),
				m_0 = Math.p.distribution[distrType].mgf(params),
				moments;

				if (typeof m_0 === 'function') {

					moments = { mean: Math.p.moments.mean(m_0, 0), variance: Math.p.moments.variance(m_0, 0), skewness: Math.p.moments.skewness(m_0, 0), kurtosis: Math.p.moments.kurtosis(m_0, 0) };

				} else if (typeof m_0 === 'object') {

					moments = m_0;

				}

			distr = self.buildPDF(distrType, params, moments);

			var html = mustache.render(self.templates[distrType].title, params);
				html += mustache.render(self.templates.moments, moments);
				html += mustache.render(self.templates.distr, { values: Math.h.arr_dump(distr, 'y'), id: 'graph-' + self.n });

			var $el = $('<div/>').addClass('result').html(html);

			$('.container').append($el.hide().fadeIn(500));

			self.plot(distr, '#graph-' + self.n, [Math.min.apply(Math, distr.map(function(el) { return el.x; })), Math.max.apply(Math, distr.map(function(el) { return el.x; }))]);

			self.n += 1;

		});

		// reset number of distributions tracked
		// remove all generated results
		$('#calc').on('reset', function(e) {

			e.preventDefault();

			self.n = 0;

			$('.result').remove();

		});

	};

	/**
	 * build params object to send to other methods in the library
	 *
	 * @param {string} id - id of form element containing parameter inputs
	 * @return {object} statistical parameters object
	 */
	self.getParams = function(id) {

		var $el = $(id),
			params = {};

		$el.find('input').each(function() {

			params[this.id] = parseFloat(this.value, 10);

		});

		return params;

	};

	/**
	 * render input html for distribution parameters
	 *
	 * @param {string} distrType - distribution type as string
	 * @return {string} html
	 */
	self.renderParams = function(distrType) {

		if (typeof Math.p.distribution[distrType] !== 'undefined') {

			return mustache.render(self.templates.params, Math.p.distribution[distrType].params);

		}

	};

	/**
	 * call method to generate distribution plot based on parameters
	 *
	 * @param {string} distrType - distribution type as string
	 * @param {object} params - statistical parameters object
	 * @param {object} moments - moments object generated via moment-generating function
	 * @return {array} array of objects containing x-y value pairs
	 */
	self.buildPDF = function(distrType, params, moments) {

		var pdf = [],
			cdf = [],
			inc = (Math.p.distribution[distrType].discrete) ? 1 : Math.sqrt(moments.variance) / 100;

		if (isNaN(inc)) {
			inc = 0.01;
		}

		moments.mean = moments.mean || 0;
		moments.variance = moments.variance || 0;

		pdf = self.generateDF(distrType, params, moments, -inc).concat(self.generateDF(distrType, params, moments, inc));
		//cdf = self.generateDF(distrType, params, moments, -inc, 'cdf').concat(self.generateDF(distrType, params, moments, inc, 'cdf'));

		pdf.sort(function(a, b) {
			if (a.x < b.x) { return -1; }
			if (a.x > b.x) { return 1; }
			return 0;
		});

		/*cdf.sort(function(a, b) {
			if (a.x < b.x) { return -1; }
			if (a.x > b.x) { return 1; }
			return 0;
		});*/

		return pdf;

	};

	/**
	 * generate one side of distribution plot numerically until y value becomes negligible
	 * starts at the mean and moves outward in direction of the sign of increment
	 *
	 * @param {string} distrType - distribution type as string
	 * @param {object} params - statistical parameters object
	 * @param {object} moments - moments object generated via moment-generating function
	 * @param {number} inc - increment to loop over
	 * @param {string} [type] - cdf or pdf (defaults to pdf if not specified)
	 * @return {array} array of objects containing x-y value pairs
	 */
	self.generateDF = function(distrType, params, moments, inc, type) {

		var distr = [],
			i = 0,
			start = moments.mean,
			value;

		while (i <= 10 * moments.variance) {

			value = (typeof type !== 'undefined' && type === 'cdf') ? Math.p.distribution[distrType].cdf(params)(start - i) : Math.p.distribution[distrType].pdf(params)(start - i);

			if (!isNaN(value)) {
				distr.push({ x: start - i, y: value });
			}

			if (isNaN(value) || !self.inBounds(start - i, Math.p.distribution[distrType].bounds) || (!isNaN(value) && ((value !== 0 && value <= 0.00001) || value <= 0))) {
				break;
			}

			i += inc;

		}

		return distr;

	};

	/**
	 * determines if a value is within bounds of two-element array
	 *
	 * @param {number} value - any number to test
	 * @param {array} bounds - two-element array of lower/upper bounds
	 * @return {boolean}
	 */
	self.inBounds = function(value, bounds) {

		if (value >= bounds[0] && value <= bounds[1]) {
			return true;
		}

		return false;

	};

	/**
	 * plot array data using d3
	 *
	 * @param {array} data - array of x-y key/value objects
	 * @param {string} id - id of element to append plot to
	 * @param {array} xr - two-element array of min/max x values
	 */
	self.plot = function(data, id, xr) {

		var m = [80, 80, 80, 80],
			w = 640 - m[1] - m[3],
			h = 360 - m[0] - m[2],

			x = d3.scale.linear().domain([xr[0], xr[1]]).range([0, w]),
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

			var yAxis = d3.svg.axis().scale(y).ticks(4).orient('left');

			graph.append('svg:g')
						.attr('class', 'y axis')
						.attr('transform', 'translate(0, 0)')
						.call(yAxis);

			graph.append('svg:path').attr('d', line(data));

			graph.append('text')
				.attr('text-anchor', 'middle')
				.attr('transform', 'translate(' + (-3 * m[0] / 4) + ',' + (h / 2) + ')rotate(-90)')
				.text('p(x)');

			graph.append('text')
				.attr('text-anchor', 'middle')
				.attr('transform', 'translate(' + (w / 2) + ',' + (h + (m[1] / 2)) + ')')
				.text('x');

	};

	self.init();

});