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

		binomial: {
			title: '<h1>PMF<small>(n=<em>{{ n }}</em>, p=<em>{{ p }}</em>)</small></h1>',
			params: '<pre class="center"><span>&mu;: {{ mean }}</span><span>&sigma;<sup>2</sup>: {{ variance }}</span><span>&gamma;<sub>1</sub>: {{ skewness }}</span><span>&gamma;<sub>2</sub>: {{ kurtosis }}</span></pre>',
			distr: '<div id="{{ id }}"></div>'
		},

		geometric: {
			title: '<h1>PMF<small>(n=<em>{{ n }}</em>, p=<em>{{ p }}</em>)</small></h1>',
			params: '<pre class="center"><span>&mu;: {{ mean }}</span><span>&sigma;<sup>2</sup>: {{ variance }}</span><span>&gamma;<sub>1</sub>: {{ skewness }}</span><span>&gamma;<sub>2</sub>: {{ kurtosis }}</span></pre>',
			distr: '<div id="{{ id }}"></div>'
		},

		exponential: {
			title: '<h1>PMF<small>(&lambda;=<em>{{ lambda }}</em>)</small></h1>',
			params: '<pre class="center"><span>&mu;: {{ mean }}</span><span>&sigma;<sup>2</sup>: {{ variance }}</span><span>&gamma;<sub>1</sub>: {{ skewness }}</span><span>&gamma;<sub>2</sub>: {{ kurtosis }}</span></pre>',
			distr: '<div id="{{ id }}"></div>'
		},

		poisson: {
			title: '<h1>PMF<small>(&lambda;=<em>{{ lambda }}</em>)</small></h1>',
			params: '<pre class="center"><span>&mu;: {{ mean }}</span><span>&sigma;<sup>2</sup>: {{ variance }}</span><span>&gamma;<sub>1</sub>: {{ skewness }}</span><span>&gamma;<sub>2</sub>: {{ kurtosis }}</span></pre>',
			distr: '<div id="{{ id }}"></div>'
		},

		gaussian: {
			title: '<h1>PMF<small>(&mu;=<em>{{ mean }}</em>, &sigma;=<em>{{ std }}</em>)</small></h1>',
			params: '<pre class="center"><span>&mu;: {{ mean }}</span><span>&sigma;<sup>2</sup>: {{ variance }}</span><span>&gamma;<sub>1</sub>: {{ skewness }}</span><span>&gamma;<sub>2</sub>: {{ kurtosis }}</span></pre>',
			distr: '<div id="{{ id }}"></div>'
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
				m_0 = Math.p.distribution[distrType].mgf(params);

			if (distrIval === 'bounded') {

				inc = 1;
				start = 0;
				end = params.n || 1;

			}

			distr = self.genPDF(distrType, params, inc, start, end);

			var html = mustache.render(self.templates[distrType].title, params);
				html += mustache.render(self.templates[distrType].params, { mean: Math.p.moments.mean(m_0, 0), variance: Math.p.moments.variance(m_0, 0), skewness: Math.p.moments.skewness(m_0, 0), kurtosis: Math.p.moments.kurtosis(m_0, 0) });
				html += mustache.render(self.templates[distrType].distr, { values: Math.h.arr_dump(distr, 'y'), id: 'graph-' + self.n });

			var $el = $('<div/>').addClass('result').html(html);

			$('.container').append($el.hide().fadeIn(500));

			self.plot(distr, '#graph-' + self.n, [distr[0].x, distr[distr.length - 1].x]);

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

	self.findStart = function(distrType, params) {

		var prev, next, i=0;

		while (typeof prev === 'undefined' || i < 9999) {

			prev = Math.p.distribution[distrType].pdf(params)(i);
			console.log(prev);

			i += 0.01;

			next = Math.p.distribution[distrType].pdf(params)(i);

			if (next > 0.001) {
				break;
			}

		}

		return prev;

	};

	self.genPDF = function(distrType, params, inc, start, end) {

		var distr = [], i, j=0, preVal, curVal;

		if (typeof start !== 'undefined') {

			for (i=start; i<end; i+=inc) {

				distr.push({ x: i, y: Math.p.distribution[distrType].pdf(params)(i) });

			}

		} else {

			i = self.findStart(distrType, params);

			while (typeof curVal === 'undefined' || preVal - curVal > 0.0001) {

				preVal = Math.p.distribution[distrType].pdf(params)(i);

				distr.push({ x: i, y: preVal });

				i += 0.01;

				curVal = Math.p.distribution[distrType].pdf(params)(i);

			}

		}

		return distr;

	};

	self.plot = function(data, id, xr) {

		// define dimensions of graph
		var m = [80, 80, 80, 80]; // margins
		var w = 640 - m[1] - m[3]; // width
		var h = 360 - m[0] - m[2]; // height

		// X scale will fit all values from data[] within pixels 0-w
		var x = d3.scale.linear().domain([d3.min(xr), d3.max(xr)]).range([0, w]);
		// Y scale will fit values from 0-maxval within pixels h-0 (Note the inverted domain for the y-scale: bigger is up!)
		var y = d3.scale.linear().domain([0, Math.max.apply(Math, data.map(function(v) { return v.y; }))]).range([h, 0]);

		// create a line function that can convert data[] into x and y points
		var line = d3.svg.line()
			// assign the X function to plot our line as we wish
			.x(function(d, i) {
				// verbose logging to show what's actually being done
				//console.log('Plotting X value for data point: ' + d + ' using index: ' + i + ' to be at: ' + x(i) + ' using our xScale.');
				// return the X coordinate where we want to plot this datapoint
				return x(d.x);
			})
			.y(function(d) {
				// verbose logging to show what's actually being done
				//console.log('Plotting Y value for data point: ' + d + ' to be at: ' + y(d) + ' using our yScale.');
				// return the Y coordinate where we want to plot this datapoint
				return y(d.y);
			});

			// Add an SVG element with the desired dimensions and margin.
			var graph = d3.select(id).append('svg:svg')
						.attr('width', w + m[1] + m[3])
						.attr('height', h + m[0] + m[2])
					.append('svg:g')
						.attr('transform', 'translate(' + m[3] + ', ' + m[0] + ')');

			// create yAxis
			var xAxis = d3.svg.axis().scale(x).tickSize(-h).tickSubdivide(true);
			// Add the x-axis.
			graph.append('svg:g')
						.attr('class', 'x axis')
						.attr('transform', 'translate(0, ' + h + ')')
						.call(xAxis);

			// create left yAxis
			var yAxisLeft = d3.svg.axis().scale(y).ticks(4).orient('left');
			// Add the y-axis to the left
			graph.append('svg:g')
						.attr('class', 'y axis')
						.attr('transform', 'translate(-25, 0)')
						.call(yAxisLeft);

			// Add the line by appending an svg:path element with the data line we created above
			// do this AFTER the axes above so that the line is above the tick-lines
			graph.append('svg:path').attr('d', line(data));

	};

	self.init();

});