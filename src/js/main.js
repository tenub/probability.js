require.config({
	baseUrl: 'assets/js',
	paths: {
		d3: 'https://cdnjs.cloudflare.com/ajax/libs/d3/3.4.13/d3.min',
		jquery: 'https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.1/jquery.min',
		mustache: 'https://cdnjs.cloudflare.com/ajax/libs/mustache.js/0.8.1/mustache.min'
	}
});

define(['jquery', 'mustache', 'd3', 'helpers', 'probability'], function($, mustache, d3) {

	var self = this;

	// track plot data
	self.data = {};

	self.svg = { width: 0, height: 0 };

	// mustache templates used for displaying generated statistics
	self.templates = {

		desc: '<h1>Description</h1>{{#description}}<p>{{{.}}}</p>{{/description}}',

		formulas: '<h1>Formulae</h1><ul>{{#formulas}}<li>$${{{.}}}$$</li>{{/formulas}}</ul>',

		params: '{{#.}}<label>{{title}} (<var>{{{symbol}}}</var>):<input type="number" min="{{min}}" max="{{max}}" step="{{step}}" value="{{value}}" id="{{id}}" data-symbol="{{{symbol}}}"/></label>{{/.}}',

		moments: '<pre class="center"><span>&mu;: {{mean}}</span><span>&sigma;<sup>2</sup>: {{variance}}</span><span>&gamma;<sub>1</sub>: {{skewness}}</span><span>&gamma;<sub>2</sub>: {{kurtosis}}</span></pre>',

		distr: '<h1>DF<sub>({{#.}}<var class="param">{{{symbol}}}=<em>{{value}}</em></var>{{/.}})</sub></h1>',

	};

	/**
	 * Generate support parameters based on first element in dropdown list or default to binomial distribution if there are no options. Bind all necessary events.
	 */
	self.init = function() {

		var distrType = $('select[name=distr-type] option').eq(0).val();

		self.bindEvents();
		$('select[name=distr-type]').trigger('change');

	};

	/**
	 * Bind events needed for generating statistics corresponding to a distribution.
	 */
	self.bindEvents = function() {

		// generate input elements based on selected distribution type
		$('select[name=distr-type]').on('change', function() {

			var distrType = $(this).val();

			$('#params').html(self.renderParams(distrType));
			$('#desc').html(mustache.render(self.templates.desc, Math.p.distribution[distrType]));
			$('#formulas').html(mustache.render(self.templates.formulas, Math.p.distribution[distrType]));
			MathJax.Hub.Queue(['Typeset', MathJax.Hub]);

		});

		// generate the actual statistics based on input parameters when form is submitted
		$('#calc').on('submit', function(e) {

			e.preventDefault();

			$('#stats, #plot').html('');

			var i, inc, start, end, moments,
				distrType = $('select[name=distr-type]').val(),
				distrIval = Math.p.distribution[distrType].interval,
				params = self.getParams('#params'),
				p_vals = self.getParamVals('#params'),
				m_0 = Math.p.distribution[distrType].mgf(p_vals);

			if (typeof m_0 === 'function') { moments = { mean: Math.p.moments.mean(m_0), variance: Math.p.moments.variance(m_0), skewness: Math.p.moments.skewness(m_0), kurtosis: Math.p.moments.kurtosis(m_0) }; }
			else if (typeof m_0 === 'object') { moments = m_0; }

			self.data = Math.p.buildDF(distrType, p_vals, moments);

			var html = mustache.render(self.templates.distr, params);
				html += mustache.render(self.templates.moments, moments);

			$('#stats').html(html);
			$('#results').fadeIn(500);

			self.redrawPlot();

		});

		// parse user input as an array of x-y coordinate pairs
		$('#user-data').on('submit', function(e) {

			e.preventDefault();

			//var data = [];

			//for (var i = 0; i < 100; i++) { data.push({ x: i, y: Math.h.random() }); }

			var data = self.parseCSV($('#data-csv').val());

			console.log(Math.p.mean(data), Math.p.variance(data));

		});

		// redraw svg on window resize if the plot container changes size due to responsive css widths
		$(window).on('resize', function() {

			if (self.svg.width && self.svg.width !== $('#plot').width()) {

				$('#stats, #plot').html('');

				self.redrawPlot();

			}

		});

		// reset number of distributions tracked
		// remove all generated statistics
		$('#calc').on('reset', function(e) {

			e.preventDefault();

			self.data = {};

			$('#results').fadeOut(500, function() { $('#stats, #plot').html(''); });

		});

	};

	/**
	 * Build params array to send to other methods in the library.
	 *
	 * @param {string} id - id of form element containing parameter inputs
	 * @return {object} parameters object
	 */
	self.getParams = function(id) {

		var $el = $(id),
			params = [];

		$el.find('input').each(function() {
			params.push({
				id: this.id,
				symbol: $(this).data('symbol'),
				value: parseFloat(this.value, 10)
			});
		});

		return params;

	};

	/**
	 * Build params object to send to other methods in the library.
	 *
	 * @param {string} id - id of form element containing parameter inputs
	 * @return {object} parameters object
	 */
	self.getParamVals = function(id) {

		var $el = $(id),
			params = {};

		$el.find('input').each(function() { params[this.id] = parseFloat(this.value, 10); });

		return params;

	};

	/**
	 * Render input html for distribution parameters.
	 *
	 * @param {string} distrType - distribution type as string
	 * @return {string} html
	 */
	self.renderParams = function(distrType) {

		if (typeof Math.p.distribution[distrType] !== 'undefined') { return mustache.render(self.templates.params, Math.p.distribution[distrType].params); }
		else { return false; }

	};

	/**
	 * Parse a string as CSV format and outputs as array.
	 *
	 * @param {string} string
	 * @return {array} data
	 */
	self.parseCSV = function(string) {

		var m,
			re_valid_1 = /^(?:(?:\d+(?:\.\d+)?), *(?:\d+(?:\.\d+)?)(?:\n|$))+/,
			re_valid_2 = /^(?:(?:\d+(?:\.\d+)?)(?:\n|$))+/,
			re_v_1 = /(\d+(?:\.\d+)?), *(\d+(?:\.\d+)?)/g,
			re_v_2 = /(\d+(?:\.\d+)?)/g,
			data = [];

		string = $.trim(string);

		if (re_valid_1.test(string)) {

			while ((m = re_v_1.exec(string)) !== null) {

				data.push({ x: parseFloat(m[1], 10), y: parseFloat(m[2], 10) });

			}

			return data;

		}

		if (re_valid_2.test(string)) {

			var i = 0;

			while ((m = re_v_2.exec(string)) !== null) {

				data.push({ x: i, y: parseFloat(m[1], 10) });

				i += 1;

			}

			return data;

		}

		return false;

	};

	/**
	 * Plot array data using d3 graph library.
	 *
	 * @param {string} id - id of element to append plot to
	 */
	self.plot = function(id) {

		var x, y1, y2,
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

	/**
	 * Plot graph and set svg dimensions based on new data.
	 */
	self.redrawPlot = function() {

		self.plot('#plot');

		self.svg.width = $('#plot').width();
		self.svg.height = $('#plot').height();

		return true;

	};

	self.init();

});