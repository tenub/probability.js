require.config({
	baseUrl: 'assets/js',
	paths: {
		jquery: 'http://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.1/jquery.min',
		mustache: 'http://cdnjs.cloudflare.com/ajax/libs/mustache.js/0.8.1/mustache.min'
	}
});

define(['jquery', 'mustache', 'helpers.min', 'probability.min'], function($, mustache) {

	var self = this;

	self.templates = {

		params: '{{#.}}<label>{{ title }}: </label><input type="number" min="{{ min }}" max="{{ max }}" step="{{ step }}" value="{{ value }}" id="{{ id }}"/>{{/.}}',

		binomial: {
			title: '<h1>PMF<small>(n=<em>{{ n }}</em>, p=<em>{{ p }}</em>)</small></h1>',
			params: '<pre class="center"><span>&mu;: {{ mean }}</span><span>&sigma;<sup>2</sup>: {{ variance }}</span><span>&gamma;<sub>1</sub>: {{ skewness }}</span><span>&gamma;<sub>2</sub>: {{ kurtosis }}</span></pre>',
			distr: '<br/><pre>{{ values }}</pre>'
		},

		geometric: {
			title: '<h1>PMF<small>(n=<em>{{ n }}</em>, p=<em>{{ p }}</em>)</small></h1>',
			params: '<pre class="center"><span>&mu;: {{ mean }}</span><span>&sigma;<sup>2</sup>: {{ variance }}</span><span>&gamma;<sub>1</sub>: {{ skewness }}</span><span>&gamma;<sub>2</sub>: {{ kurtosis }}</span></pre>',
			distr: '<br/><pre>{{ values }}</pre>'
		}

	};

	self.init = function() {

		$('#params').html(self.getParams($('select[name=distr-type] option').eq(0).val() || 'binomial'));

		self.bindEvents();

	};

	self.bindEvents = function() {

		var self = this;

		$('select[name=distr-type]').change(function(e) {

			distrType = $(this).val();

			$('#params').html(self.getParams(distrType));

		});

		$('#calc').submit(function(e) {

			e.preventDefault();

			var distr = [],
				distrType = $('select[name=distr-type]').val(),
				p = parseFloat($('#p').val(), 10),
				n = parseInt($('#n').val(), 10),
				k = parseInt($('#k').val(), 10),
				m_0 = Math.p.distribution[distrType].mgf(p, n);

			for (var i=0; i<n; i++) {

				distr.push({ k: i, p: Math.p.distribution[distrType].cdf(p, i, k) });

			}

			var html = mustache.render(self.templates[distrType].title, { n: n, p: p });
				html += mustache.render(self.templates[distrType].params, { mean: Math.p.moments.mean(m_0, 0), variance: Math.p.moments.variance(m_0, 0), skewness: Math.p.moments.skewness(m_0, 0), kurtosis: Math.p.moments.kurtosis(m_0, 0) });
				html += mustache.render(self.templates[distrType].distr, { values: Math.h.arr_dump(distr, 'p') });

			var $el = $('<div/>').addClass('result').html(html);

			$('.container').append($el.hide().fadeIn(500));

		});

	};

	self.getParams = function(distrType) {

		if (typeof Math.p.distribution[distrType] !== 'undefined') {

			return mustache.render(self.templates.params, Math.p.distribution[distrType].params);

		}

	};

	self.init();

});