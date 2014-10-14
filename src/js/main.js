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

	// track plot data
	self.data = [];

	// mustache templates used for displaying generated statistics
	self.templates = {

		params: '{{#.}}<label>{{ title }}:<input type="number" min="{{ min }}" max="{{ max }}" step="{{ step }}" value="{{ value }}" id="{{ id }}"/></label>{{/.}}',

		moments: '<pre class="center"><span>&mu;: {{ mean }}</span><span>&sigma;<sup>2</sup>: {{ variance }}</span><span>&gamma;<sub>1</sub>: {{ skewness }}</span><span>&gamma;<sub>2</sub>: {{ kurtosis }}</span></pre>',

		distr: '<div id="{{ id }}"></div>',

		uniform: {
			title: '<h1>DF<small>(a=<em>{{ a }}</em>, b=<em>{{ b }}</em>)</small></h1>'
		},

		binomial: {
			title: '<h1>DF<small>(n=<em>{{ n }}</em>, p=<em>{{ p }}</em>)</small></h1>'
		},

		geometric: {
			title: '<h1>DF<small>(n=<em>{{ n }}</em>, p=<em>{{ p }}</em>)</small></h1>'
		},

		logarithmic: {
			title: '<h1>DF<small>(p=<em>{{ p }}</em>)</small></h1>'
		},

		exponential: {
			title: '<h1>DF<small>(&lambda;=<em>{{ lambda }}</em>)</small></h1>'
		},

		pareto: {
			title: '<h1>DF<small>(x<sub>m</sub>=<em>{{ xm }}</em>, &alpha;=<em>{{ a }}</em>)</small></h1>'
		},

		poisson: {
			title: '<h1>DF<small>(&lambda;=<em>{{ lambda }}</em>)</small></h1>'
		},

		gaussian: {
			title: '<h1>DF<small>(&mu;=<em>{{ mean }}</em>, &sigma;=<em>{{ std }}</em>)</small></h1>'
		},

		beta: {
			title: '<h1>DF<small>(&alpha;=<em>{{ a }}</em>, &beta;=<em>{{ b }}</em>)</small></h1>'
		},

		gamma: {
			title: '<h1>DF<small>(k=<em>{{ k }}</em>, &theta;=<em>{{ theta }}</em>)</small></h1>'
		},

		rayleigh: {
			title: '<h1>DF<small>(&sigma;=<em>{{ sigma }}</em>)</small></h1>'
		},

		gumbel: {
			title: '<h1>DF<small>(&mu;=<em>{{ mu }}</em>, &beta;=<em>{{ beta }}</em>)</small></h1>'
		},

		chi: {
			title: '<h1>DF<small>(k=<em>{{ k }}</em>)</small></h1>'
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

			$('#graph').html('');

			var i, inc, start, end,
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

			self.data.push(self.buildDF(distrType, params, moments));

			var html = mustache.render(self.templates[distrType].title, params);
				html += mustache.render(self.templates.moments, moments);

			$('#result').hide().append(html).fadeIn(500);
			$('#graph').hide().fadeIn(500);

			self.plot('#graph');

			self.n += 1;

		});

		// reset number of distributions tracked
		// remove all generated results
		$('#calc').on('reset', function(e) {

			e.preventDefault();

			self.n = 0;
			self.data = [];

			$('#result, #graph').html('');

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
	 * call method to generate distribution plots based on parameters
	 *
	 * @param {string} distrType - distribution type as string
	 * @param {object} params - statistical parameters object
	 * @param {object} moments - moments object generated via moment-generating function
	 * @return {object} object of pdf and cdf arrays containing x-y value pairs for plotting
	 */
	self.buildDF = function(distrType, params, moments) {

		var distr = { pdf: [], cdf: [] },
			inc = (Math.p.distribution[distrType].discrete) ? 1 : Math.sqrt(moments.variance) / 100;

		if (isNaN(inc) || inc > 99999) {
			inc = 0.01;
		}

		moments.mean = moments.mean || 0;
		moments.variance = moments.variance || 0;

		distr.pdf = self.generatePDF(distrType, params, moments, -inc).concat(self.generatePDF(distrType, params, moments, inc));

		distr.pdf.sort(function(a, b) {
			if (a.x < b.x) { return -1; }
			if (a.x > b.x) { return 1; }
			return 0;
		});

		distr.cdf = self.generateCDF(distr.pdf, inc);

		return distr;

	};

	/**
	 * generate one side of PDF numerically until y value becomes negligible
	 * starts at the mean and moves outward in direction of the sign of increment
	 *
	 * @param {string} distrType - distribution type as string
	 * @param {object} params - statistical parameters object
	 * @param {object} moments - moments object generated via moment-generating function
	 * @param {number} inc - increment to loop over
	 * @return {array} array of objects containing x-y value pairs
	 */
	self.generatePDF = function(distrType, params, moments, inc) {

		var pdf = [],
			i = 0,
			sum = 0,
			start = (inc < 0) ? moments.mean - inc : moments.mean,
			value;

		while (i <= 10 * moments.variance) {

			value = Math.p.distribution[distrType].pdf(params)(start - i);

			if (isNaN(i / inc) || isNaN(value) || (!isNaN(value) && ((value !== 0 && value <= 0.00001) || value <= 0))) {
				break;
			}

			if (self.inBounds(start - i, Math.p.distribution[distrType].bounds(params)) && !isNaN(value)) {
				pdf.push({ x: start - i, y: value });
			}

			i += inc;

		}

		return pdf;

	};

	/**
	 * generate CDF based on summation of PDF values
	 *
	 * @param {array} pdf - distribution array
	 * @return {array} array of objects containing x-y value pairs
	 */
	self.generateCDF = function(pdf, inc) {

		var cdf = [],
			i = 0,
			sum = 0;

		for (i=0, l=pdf.length; i<l; i++) {

			sum += pdf[i].y;

			cdf.push({ x: pdf[i].x, y: sum * inc });

		}

		return cdf;

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
	 * @param {string} id - id of element to append plot to
	 */
	self.plot = function(id) {

		var i,
			x, y1, y2,
			x_l, x_u,
			xr = [],
			pdf_y_u, cdf_y_u,
			pdf_yr = [], cdf_yr = [],
			m = [80, 80, 80, 80],
			w = 640 - m[1] - m[3],
			h = 360 - m[0] - m[2];

		var line1 = d3.svg.line()
			.x(function(d) { return x(d.x); })
			.y(function(d) { return y1(d.y); });

		var line2 = d3.svg.line()
			.x(function(d) { return x(d.x); })
			.y(function(d) { return y2(d.y); });

		var graph = d3.select(id).append('svg:svg')
			.attr('width', w + m[1] + m[3])
			.attr('height', h + m[0] + m[2])
			.append('svg:g')
			.attr('transform', 'translate(' + m[3] + ', ' + m[0] + ')');

		graph.append('text')
			.attr('text-anchor', 'middle')
			.attr('transform', 'translate(' + (w / 2) + ',' + (h + (m[1] / 2)) + ')')
			.text('x');

		graph.append('text')
			.attr('text-anchor', 'middle')
			.attr('transform', 'translate(' + (-3 * m[0] / 4) + ',' + (h / 2) + ')rotate(-90)')
			.text('p(x)');

		graph.append('text')
			.attr('text-anchor', 'middle')
			.attr('transform', 'translate(' + (w + 3 * m[0] / 4) + ',' + (h / 2) + ')rotate(-90)')
			.text('P(x)');

		var xAxis = d3.svg.axis().tickSize(-h).tickSubdivide(true),
			yAxisLeft = d3.svg.axis().ticks(4).orient('left'),
			yAxisRight = d3.svg.axis().ticks(4).orient('right');

		graph.append('svg:g')
			.attr('class', 'x axis')
			.attr('transform', 'translate(0, ' + h + ')');

		graph.append('svg:g')
			.attr('class', 'y axis left')
			.attr('transform', 'translate(0, 0)');

		graph.append('svg:g')
			.attr('class', 'y axis right')
			.attr('transform', 'translate(' + w + ', 0)');

		var getX = function(el) { return el.x; },
			getY = function(el) { return el.y; },
			genColor = function(i) {
				var colors = ['blue', 'orange', 'purple', 'yellow', 'green', 'red'],
					l = colors.length;
				while (i > l) { i -= l; }
				return colors[i];
			};

		for (i=0, l=self.data.length; i<l; i++) {

			x_l = Math.min.apply(Math, self.data[i].cdf.map(getX));
			x_u = Math.max.apply(Math, self.data[i].cdf.map(getX));
			pdf_y_u = Math.max.apply(Math, self.data[i].pdf.map(getY));
			cdf_y_u = Math.max.apply(Math, self.data[i].cdf.map(getY));

			if (typeof xr[0] === 'undefined' || x_l < xr[0]) {
				xr[0] = x_l;
			}

			if (typeof xr[1] === 'undefined' || x_u > xr[1]) {
				xr[1] = x_u;
			}

			if (typeof pdf_yr[0] === 'undefined' || pdf_y_u > pdf_yr[0]) {
				pdf_yr[0] = pdf_y_u;
			}

			if (typeof cdf_yr[0] === 'undefined' || cdf_y_u > cdf_yr[0]) {
				cdf_yr[0] = cdf_y_u;
			}

			x = d3.scale.linear().domain([xr[0], xr[1]]).range([0, w]);
			y1 = d3.scale.linear().domain([0, pdf_yr[0]]).range([h, 0]);
			y2 = d3.scale.linear().domain([0, cdf_yr[0]]).range([h, 0]);

			xAxis.scale(x);

			graph.select('.x.axis')
				.call(xAxis);

			yAxisLeft.scale(y1);
			yAxisRight.scale(y2);

			graph.select('.y.axis.left')
				.call(yAxisLeft);

			graph.select('.y.axis.right')
				.call(yAxisRight);

		}

		for (i=0, l=self.data.length; i<l; i++) {

			var color = genColor(i);

			graph.append('svg:path')
				.attr('d', line1(self.data[i].pdf))
				.style('stroke', color);

			graph.append('svg:path')
				.attr('d', line2(self.data[i].cdf))
				.style('stroke', color)
				.style('stroke-dasharray', ('3, 3'));

		}

		return true;

	};

	self.init();

});