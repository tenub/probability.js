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

	// track plot data
	self.data = {};

	self.svg = { width: 0, height: 0 };

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

		skellam: {
			title: '<h1>DF<small>(&mu;<sub>1</sub>=<em>{{ mean1 }}</em>, &mu;<sub>2</sub>=<em>{{ mean2 }}</em>)</small></h1>'
		},

		gaussian: {
			title: '<h1>DF<small>(&mu;=<em>{{ mean }}</em>, &sigma;=<em>{{ std }}</em>)</small></h1>'
		},

		inv_gaussian: {
			title: '<h1>DF<small>(&lambda;=<em>{{ shape }}</em>, &mu;=<em>{{ mean }}</em>)</small></h1>'
		},

		zeta: {
			title: '<h1>DF<small>(s=<em>{{ s }}</em>)</small></h1>'
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
		},

		weibull: {
			title: '<h1>DF<small>(&lambda;=<em>{{ lambda }}</em>, k=<em>{{ k }}</em>)</small></h1>'
		},

		cauchy: {
			title: '<h1>DF<small>(x<sub>0</sub>=<em>{{ x0 }}</em>, &gamma;=<em>{{ gamma }}</em>)</small></h1>'
		},

		fisher_snedecor: {
			title: '<h1>DF<small>(d<sub>1</sub>=<em>{{ d1 }}</em>, d<sub>2</sub>=<em>{{ d2 }}</em>)</small></h1>'
		},

		irwin_hall: {
			title: '<h1>DF<small>(n=<em>{{ n }}</em>)</small></h1>'
		},

		wigner: {
			title: '<h1>DF<small>(R=<em>{{ r }}</em>)</small></h1>'
		},

		gompertz: {
			title: '<h1>DF<small>(n=<em>{{ n }}</em>, b=<em>{{ b }}</em>)</small></h1>'
		},

		laplace: {
			title: '<h1>DF<small>(&mu;=<em>{{ mean }}</em>, b=<em>{{ scale }}</em>)</small></h1>'
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

			$('#stats, #plot').html('');

			var i, inc, start, end,
				distrType = $('select[name=distr-type]').val(),
				distrIval = Math.p.distribution[distrType].interval,
				params = self.getParams('#params'),
				m_0 = Math.p.distribution[distrType].mgf(params),
				moments;

			if (typeof m_0 === 'function') { moments = { mean: Math.p.moments.mean(m_0), variance: Math.p.moments.variance(m_0), skewness: Math.p.moments.skewness(m_0), kurtosis: Math.p.moments.kurtosis(m_0) }; }
			else if (typeof m_0 === 'object') { moments = m_0; }

			self.data = Math.p.buildDF(distrType, params, moments);

			var html = mustache.render(self.templates[distrType].title, params);
				html += mustache.render(self.templates.moments, moments);

			$('#stats').html(html);
			$('#results').fadeIn(500);

			self.redrawPlot();
			self.n += 1;

		});

		$(window).on('resize', function(e) {

			if (self.svg.width && self.svg.width !== $('#plot').width()) {

				$('#stats, #plot').html('');

				self.redrawPlot();

			}

		});

		// reset number of distributions tracked
		// remove all generated statss
		$('#calc').on('reset', function(e) {

			e.preventDefault();

			self.n = 0;
			self.data = {};

			$('#results').fadeOut(500, function() {
				$('#stats, #plot').html('');
			});

		});

	};

	/**
	 * build params object to send to other methods in the library
	 *
	 * @param {string} id - id of form element containing parameter inputs
	 * @return {object} parameters object
	 */
	self.getParams = function(id) {

		var $el = $(id),
			params = {};

		$el.find('input').each(function() { params[this.id] = parseFloat(this.value, 10); });

		return params;

	};

	/**
	 * render input html for distribution parameters
	 *
	 * @param {string} distrType - distribution type as string
	 * @return {string} html
	 */
	self.renderParams = function(distrType) {

		if (typeof Math.p.distribution[distrType] !== 'undefined') { return mustache.render(self.templates.params, Math.p.distribution[distrType].params); }
		else { return false; }

	};

	/**
	 * plot array data using d3
	 *
	 * @param {string} id - id of element to append plot to
	 */
	self.plot = function(id) {

		var i = self.n,
			x, y1, y2,
			x_l, x_u,
			xr = [],
			pdf_y_u, cdf_y_u,
			pdf_yr = [], cdf_yr = [],
			width = $(id).width(),
			height = width * 0.75,
			m = 0.125 * width,
			w = width - 2 * m,
			h = height - 2 * m;

		var line1 = d3.svg.line()
			.x(function(d) { return x(d.x); })
			.y(function(d) { return y1(d.y); });

		var line2 = d3.svg.line()
			.x(function(d) { return x(d.x); })
			.y(function(d) { return y2(d.y); });

		var graph = d3.select(id)
			.append('svg:svg')
				.attr('xmlns', 'http://www.w3.org/2000/svg')
				.attr('version', '1.1')
				.attr('viewBox', '0 0 ' + width + ' ' + height)
				.attr('preserveAspectRatio', 'xMinYMin meet')
				.append('svg:g')
					.attr('transform', 'translate(' + m + ', ' + m + ')');

		graph.append('text')
			.attr('text-anchor', 'middle')
			.attr('transform', 'translate(' + (w / 2) + ',' + (h + (m / 2)) + ')')
			.text('x');

		graph.append('text')
			.attr('text-anchor', 'middle')
			.attr('transform', 'translate(' + (-3 * m / 4) + ',' + (h / 2) + ')rotate(-90)')
			.text('p(x)');

		graph.append('text')
			.attr('text-anchor', 'middle')
			.attr('transform', 'translate(' + (w + 3 * m / 4) + ',' + (h / 2) + ')rotate(-90)')
			.text('P(x)');

		var xAxis = d3.svg.axis().tickSize(-h).tickSubdivide(true),
			yAxisL = d3.svg.axis().ticks(4).orient('left'),
			yAxisR = d3.svg.axis().ticks(4).orient('right');

		graph.append('svg:g')
			.attr('class', 'x axis')
			.attr('transform', 'translate(0, ' + h + ')');

		graph.append('svg:g')
			.attr('class', 'y axis left')
			.attr('transform', 'translate(0, 0)');

		graph.append('svg:g')
			.attr('class', 'y axis right')
			.attr('transform', 'translate(' + w + ', 0)');

		var getX = function(o) { return o.x; },
			getY = function(o) { return o.y; };

		x_l = Math.min.apply(Math, self.data.cdf.map(getX));
		x_u = Math.max.apply(Math, self.data.cdf.map(getX));

		pdf_y_u = Math.max.apply(Math, self.data.pdf.map(getY));
		cdf_y_u = Math.max.apply(Math, self.data.cdf.map(getY));

		if (typeof xr[0] === 'undefined' || x_l < xr[0]) { xr[0] = x_l; }
		if (typeof xr[1] === 'undefined' || x_u > xr[1]) { xr[1] = x_u; }

		if (typeof pdf_yr[0] === 'undefined' || pdf_y_u > pdf_yr[0]) { pdf_yr[0] = pdf_y_u; }
		if (typeof cdf_yr[0] === 'undefined' || cdf_y_u > cdf_yr[0]) { cdf_yr[0] = cdf_y_u; }

		x = d3.scale.linear().domain([xr[0], xr[1]]).range([0, w]);

		y1 = d3.scale.linear().domain([0, pdf_yr[0]]).range([h, 0]);
		y2 = d3.scale.linear().domain([0, cdf_yr[0]]).range([h, 0]);

		xAxis.scale(x);

		graph.select('.x.axis')
			.call(xAxis);

		yAxisL.scale(y1);
		yAxisR.scale(y2);

		graph.select('.y.axis.left')
			.call(yAxisL);

		graph.select('.y.axis.right')
			.call(yAxisR);

		graph.append('svg:path')
			.attr('d', line1(self.data.pdf));

		graph.append('svg:path')
			.attr('d', line2(self.data.cdf))
			.style('stroke-dasharray', ('3, 3'));

		return false;

	};

	self.redrawPlot = function() {

		self.plot('#plot');

		self.svg.width = $('#plot').width();
		self.svg.height = $('#plot').height();

		return true;

	};

	self.init();

});