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

		desc: '<h1>Description</h1>{{#description}}<p>{{.}}</p>{{/description}}',

		params: '{{#.}}<label>{{ title }}:<input type="number" min="{{ min }}" max="{{ max }}" step="{{ step }}" value="{{ value }}" id="{{ id }}"/></label>{{/.}}',

		moments: '<pre class="center"><span>&mu;: {{ mean }}</span><span>&sigma;<sup>2</sup>: {{ variance }}</span><span>&gamma;<sub>1</sub>: {{ skewness }}</span><span>&gamma;<sub>2</sub>: {{ kurtosis }}</span></pre>',

		distr: '<div id="{{ id }}"></div>',

		uniform: {
			title: '<h1>DF<small>(a=<em>{{ a }}</em>, b=<em>{{ b }}</em>)</small></h1>',
			description: [
				'The continuous uniform distribution or rectangular distribution is a family of symmetric probability distributions such that for each member of the family, all intervals of the same length on the distribution\'s support are equally probable. The support is defined by the two parameters, a and b, which are its minimum and maximum values. The distribution is often abbreviated U(a,b). It is the maximum entropy probability distribution for a random variate X under no constraint other than that it is contained in the distribution\'s support.'
			]
		},

		binomial: {
			title: '<h1>DF<small>(n=<em>{{ n }}</em>, p=<em>{{ p }}</em>)</small></h1>',
			description: [
				'The binomial distribution with parameters n and p is the discrete probability distribution of the number of successes in a sequence of n independent yes/no experiments, each of which yields success with probability p. A success/failure experiment is also called a Bernoulli experiment or Bernoulli trial; when n = 1, the binomial distribution is a Bernoulli distribution. The binomial distribution is the basis for the popular binomial test of statistical significance.',
				'The binomial distribution is frequently used to model the number of successes in a sample of size n drawn with replacement from a population of size N. If the sampling is carried out without replacement, the draws are not independent and so the resulting distribution is a hypergeometric distribution, not a binomial one. However, for N much larger than n, the binomial distribution is a good approximation, and widely used.'
			]
		},

		geometric: {
			title: '<h1>DF<small>(n=<em>{{ n }}</em>, p=<em>{{ p }}</em>)</small></h1>',
			description: [
				'The geometric distribution is either of two discrete probability distributions. The definition used here is: the probability distribution of the number Y = X − 1 of failures before the first success, supported on the set { 0, 1, 2, 3, ... }.'
			]
		},

		logarithmic: {
			title: '<h1>DF<small>(p=<em>{{ p }}</em>)</small></h1>',
			description: [
				'The logarithmic distribution (also known as the logarithmic series distribution or the log-series distribution) is a discrete probability distribution derived from the Maclaurin series expansion.'
			]
		},

		exponential: {
			title: '<h1>DF<small>(&lambda;=<em>{{ lambda }}</em>)</small></h1>',
			description: [
				'The exponential distribution (a.k.a. negative exponential distribution) is the probability distribution that describes the time between events in a Poisson process, i.e. a process in which events occur continuously and independently at a constant average rate. It is the continuous analogue of the geometric distribution, and it has the key property of being memoryless. In addition to being used for the analysis of Poisson processes, it is found in various other contexts.',
				'Note that the exponential distribution is not the same as the class of exponential families of distributions, which is a large class of probability distributions that includes the exponential distribution as one of its members, but also includes the normal distribution, binomial distribution, gamma distribution, Poisson, and many others.'
			]
		},

		pareto: {
			title: '<h1>DF<small>(x<sub>m</sub>=<em>{{ xm }}</em>, &alpha;=<em>{{ a }}</em>)</small></h1>',
			description: [
				'The Pareto distribution, named after the Italian civil engineer, economist, and sociologist Vilfredo Pareto, is a power law probability distribution that is used in description of social, scientific, geophysical, actuarial, and many other types of observable phenomena.'
			]
		},

		poisson: {
			title: '<h1>DF<small>(&lambda;=<em>{{ lambda }}</em>)</small></h1>',
			description: [
				'The Poisson distribution, named after French mathematician Siméon Denis Poisson, is a discrete probability distribution that expresses the probability of a given number of events occurring in a fixed interval of time and/or space if these events occur with a known average rate and independently of the time since the last event. The Poisson distribution can also be used for the number of events in other specified intervals such as distance, area or volume.',
				'For instance, an individual keeping track of the amount of mail they receive each day may notice that they receive an average number of 4 letters per day. As it is reasonable to assume that receiving one piece of mail will not affect the arrival times of future pieces of mail—that pieces of mail from a wide range of sources arrive independently of one another—the number of pieces of mail received per day would obey a Poisson distribution. Other examples might include: the number of phone calls received by a call center per hour, the number of decay events per second from a radioactive source, or the number of taxis passing a particular street corner per hour.'
			]
		},

		skellam: {
			title: '<h1>DF<small>(&mu;<sub>1</sub>=<em>{{ mean1 }}</em>, &mu;<sub>2</sub>=<em>{{ mean2 }}</em>)</small></h1>',
			description: [
				'The Skellam distribution is the discrete probability distribution of the difference n_1-n_2 of two statistically independent random variables N_1 and N_2 each having Poisson distributions with different expected values mu_1 and mu_2. It is useful in describing the statistics of the difference of two images with simple photon noise, as well as describing the point spread distribution in sports where all scored points are equal, such as baseball, hockey and soccer.',
				'The distribution is also applicable to a special case of the difference of dependent Poisson random variables, but just the obvious case where the two variables have a common additive random contribution which is cancelled by the differencing.'
			]
		},

		gaussian: {
			title: '<h1>DF<small>(&mu;=<em>{{ mean }}</em>, &sigma;=<em>{{ std }}</em>)</small></h1>',
			description: [
				'The normal (or Gaussian) distribution is a very commonly occurring continuous probability distribution—a function that tells the probability that any real observation will fall between any two real limits or real numbers, as the curve approaches zero on either side. Normal distributions are extremely important in statistics and are often used in the natural and social sciences for real-valued random variables whose distributions are not known.',
				'The normal distribution is immensely useful because of the central limit theorem, which states that, under mild conditions, the mean of many random variables independently drawn from the same distribution is distributed approximately normally, irrespective of the form of the original distribution: physical quantities that are expected to be the sum of many independent processes (such as measurement errors) often have a distribution very close to the normal. Moreover, many results and methods (such as propagation of uncertainty and least squares parameter fitting) can be derived analytically in explicit form when the relevant variables are normally distributed.',
				'The Gaussian distribution is sometimes informally called the bell curve. However, many other distributions are bell-shaped (such as Cauchy\'s, Student\'s, and logistic). The terms Gaussian function and Gaussian bell curve are also ambiguous because they sometimes refer to multiples of the normal distribution that cannot be directly interpreted in terms of probabilities.'
			]
		},

		inv_gaussian: {
			title: '<h1>DF<small>(&lambda;=<em>{{ shape }}</em>, &mu;=<em>{{ mean }}</em>)</small></h1>',
			description: [
				'The inverse Gaussian distribution (also known as the Wald distribution) is a two-parameter family of continuous probability distributions with support on (0,∞).',
				'As λ tends to infinity, the inverse Gaussian distribution becomes more like a normal (Gaussian) distribution. The inverse Gaussian distribution has several properties analogous to a Gaussian distribution. The name can be misleading: it is an "inverse" only in that, while the Gaussian describes a Brownian Motion\'s level at a fixed time, the inverse Gaussian describes the distribution of the time a Brownian Motion with positive drift takes to reach a fixed positive level.'
			]
		},

		zeta: {
			title: '<h1>DF<small>(s=<em>{{ s }}</em>)</small></h1>',
			description: [
				'The zeta distribution is a discrete probability distribution. The Riemann zeta function being the sum of all term k^{-s} for integer k, it appears thus as the normalization of the Zipf distribution. Indeed the terms "Zipf distribution" and the "zeta distribution" are often used interchangeably. But note that while the Zeta distribution is a probability distribution by itself, it is not associated to the Zipf\'s law with same exponent.'
			]
		},

		beta: {
			title: '<h1>DF<small>(&alpha;=<em>{{ a }}</em>, &beta;=<em>{{ b }}</em>)</small></h1>',
			description: [
				'The beta distribution is a family of continuous probability distributions defined on the interval [0, 1] parametrized by two positive shape parameters, denoted by α and β, that appear as exponents of the random variable and control the shape of the distribution.',
				'The beta distribution has been applied to model the behavior of random variables limited to intervals of finite length in a wide variety of disciplines. For example, it has been used as a statistical description of allele frequencies in population genetics; time allocation in project management / control systems; sunshine data; variability of soil properties; proportions of the minerals in rocks in stratigraphy; and heterogeneity in the probability of HIV transmission.',
				'In Bayesian inference, the beta distribution is the conjugate prior probability distribution for the Bernoulli, binomial, negative binomial and geometric distributions. For example, the beta distribution can be used in Bayesian analysis to describe initial knowledge concerning probability of success such as the probability that a space vehicle will successfully complete a specified mission. The beta distribution is a suitable model for the random behavior of percentages and proportions.'
			]
		},

		gamma: {
			title: '<h1>DF<small>(k=<em>{{ k }}</em>, &theta;=<em>{{ theta }}</em>)</small></h1>',
			description: [
				'The gamma distribution is a two-parameter family of continuous probability distributions. The common exponential distribution and chi-squared distribution are special cases of the gamma distribution. There are three different parametrizations in common use. A shape parameter k and a scale parameter θ are used here.',
				'This parameterization appears to be more common in econometrics and certain other applied fields, where e.g. the gamma distribution is frequently used to model waiting times. For instance, in life testing, the waiting time until death is a random variable that is frequently modeled with a gamma distribution.',
				'If k is an integer, then the distribution represents an Erlang distribution; i.e., the sum of k independent exponentially distributed random variables, each of which has a mean of θ.'
			]
		},

		rayleigh: {
			title: '<h1>DF<small>(&sigma;=<em>{{ sigma }}</em>)</small></h1>',
			description: [
				'The Rayleigh distribution is a continuous probability distribution for positive-valued random variables. A Rayleigh distribution is often observed when the overall magnitude of a vector is related to its directional components. One example where the Rayleigh distribution naturally arises is when wind velocity is analyzed into its orthogonal 2-dimensional vector components. Assuming that each component is uncorrelated, normally distributed with equal variance, and zero mean, then the overall wind speed (vector magnitude) will be characterized by a Rayleigh distribution. A second example of the distribution arises in the case of random complex numbers whose real and imaginary components are independently and identically distributed Gaussian with equal variance and zero mean. In that case, the absolute value of the complex number is Rayleigh-distributed.'
			]
		},

		gumbel: {
			title: '<h1>DF<small>(&mu;=<em>{{ mu }}</em>, &beta;=<em>{{ beta }}</em>)</small></h1>',
			description: [
				'The Gumbel distribution is used to model the distribution of the maximum (or the minimum) of a number of samples of various distributions. Such a distribution might be used to represent the distribution of the maximum level of a river in a particular year if there was a list of maximum values for the past ten years. It is useful in predicting the chance that an extreme earthquake, flood or other natural disaster will occur.',
				'The potential applicability of the Gumbel distribution to represent the distribution of maxima relates to extreme value theory which indicates that it is likely to be useful if the distribution of the underlying sample data is of the normal or exponential type.',
				'The Gumbel distribution is a particular case of the generalized extreme value distribution (also known as the Fisher-Tippett distribution). It is also known as the log-Weibull distribution and the double exponential distribution (a term that is alternatively sometimes used to refer to the Laplace distribution). It is related to the Gompertz distribution: when its density is first reflected about the origin and then restricted to the positive half line, a Gompertz function is obtained.',
				'In the latent variable formulation of the multinomial logit model — common in discrete choice theory — the errors of the latent variables follow a Gumbel distribution. This is useful because the difference of two Gumbel-distributed random variables has a logistic distribution.'
			]
		},

		chi: {
			title: '<h1>DF<small>(k=<em>{{ k }}</em>)</small></h1>',
			description: [
				'The chi-squared distribution with k degrees of freedom is the distribution of a sum of the squares of k independent standard normal random variables. A special case of the gamma distribution, it is one of the most widely used probability distributions in inferential statistics, e.g., in hypothesis testing or in construction of confidence intervals. When it is being distinguished from the more general noncentral chi-squared distribution, this distribution is sometimes called the central chi-squared distribution.',
					'The chi-squared distribution is used in the common chi-squared tests for goodness of fit of an observed distribution to a theoretical one, the independence of two criteria of classification of qualitative data, and in confidence interval estimation for a population standard deviation of a normal distribution from a sample standard deviation. Many other statistical tests also use this distribution, like Friedman\'s analysis of variance by ranks.'
			]
		},

		weibull: {
			title: '<h1>DF<small>(&lambda;=<em>{{ lambda }}</em>, k=<em>{{ k }}</em>)</small></h1>',
			description: [
				'The Weibull distribution is a continuous probability distribution. It is named after Waloddi Weibull, who described it in detail in 1951, although it was first identified by Fréchet (1927) and first applied by Rosin & Rammler (1933) to describe a particle size distribution. The Weibull distribution is related to a number of other probability distributions; in particular, it interpolates between the exponential distribution and the Rayleigh distribution. If the quantity X is a "time-to-failure", the Weibull distribution gives a distribution for which the failure rate is proportional to a power of time. The shape parameter, k, is that power plus one.'
			]
		},

		cauchy: {
			title: '<h1>DF<small>(x<sub>0</sub>=<em>{{ x0 }}</em>, &gamma;=<em>{{ gamma }}</em>)</small></h1>',
			description: [
				'The Cauchy distribution, named after Augustin Cauchy, is a continuous probability distribution. It is also known, especially among physicists, as the Lorentz distribution (after Hendrik Lorentz), Cauchy–Lorentz distribution, Lorentz(ian) function, or Breit–Wigner distribution. The simplest Cauchy distribution is called the standard Cauchy distribution. It is the distribution of a random variable that is the ratio of two independent standard normal variables.',
				'The Cauchy distribution is often used in statistics as the canonical example of a "pathological" distribution since both its mean and its variance are undefined. The Cauchy distribution does not have finite moments of order greater than or equal to one; only fractional absolute moments exist. The Cauchy distribution has no moment generating function.',
				'Its importance in physics is the result of it being the solution to the differential equation describing forced resonance. In mathematics, it is closely related to the Poisson kernel, which is the fundamental solution for the Laplace equation in the upper half-plane. In spectroscopy, it is the description of the shape of spectral lines which are subject to homogeneous broadening in which all atoms interact in the same way with the frequency range contained in the line shape. Many mechanisms cause homogeneous broadening, most notably collision broadening, and Chantler–Alda radiation. In its standard form, it is the maximum entropy probability distribution for a random variate X.'
			]
		},

		fisher_snedecor: {
			title: '<h1>DF<small>(d<sub>1</sub>=<em>{{ d1 }}</em>, d<sub>2</sub>=<em>{{ d2 }}</em>)</small></h1>',
			description: [
				'The F-distribution is a continuous probability distribution. It is also known as Snedecor\'s F distribution or the Fisher–Snedecor distribution (after R. A. Fisher and George W. Snedecor). The F-distribution arises frequently as the null distribution of a test statistic, most notably in the analysis of variance.'
			]
		},

		irwin_hall: {
			title: '<h1>DF<small>(n=<em>{{ n }}</em>)</small></h1>',
			description: [
				'The Irwin–Hall distribution, named after Joseph Oscar Irwin and Philip Hall, is probability distribution for a random variable defined as sum of a number of independent random variables, each having a uniform distribution. For this reason it is also known as the uniform sum distribution.',
				'The generation of pseudo-random numbers having an approximately normal distribution is sometimes accomplished by computing the sum of a number of pseudo-random numbers having a uniform distribution; usually for the sake of simplicity of programming. Rescaling the Irwin–Hall distribution provides the exact distribution of the random variates being generated.'
			]
		},

		wigner: {
			title: '<h1>DF<small>(R=<em>{{ r }}</em>)</small></h1>',
			description: [
				'The Wigner semicircle distribution, named after the physicist Eugene Wigner, is the probability distribution supported on the interval [−R, R] the graph of whose probability density function f is a semicircle of radius R centered at (0, 0) and then suitably normalized (so that it is really a semi-ellipse).',
				'This distribution arises as the limiting distribution of eigenvalues of many random symmetric matrices as the size of the matrix approaches infinity.',
				'It is a scaled beta distribution, more precisely, if Y is beta distributed with parameters α = β = 3/2, then X = 2RY – R has the Wigner semicircle distribution.'
			]
		},

		gompertz: {
			title: '<h1>DF<small>(n=<em>{{ n }}</em>, b=<em>{{ b }}</em>)</small></h1>',
			description: [
				'The Gompertz distribution is a continuous probability distribution. The Gompertz distribution is often applied to describe the distribution of adult lifespans by demographers and actuaries. Related fields of science such as biology and gerontology also considered the Gompertz distribution for the analysis of survival. More recently, computer scientists have also started to model the failure rates of computer codes by the Gompertz distribution. In Marketing Science, it has been used as an individual-level simulation for customer lifetime value modeling. Early users in the 1990s for the Gompertz distribution in CLV models included Edge Consulting and BrandScience.'
			]
		},

		laplace: {
			title: '<h1>DF<small>(&mu;=<em>{{ mean }}</em>, b=<em>{{ scale }}</em>)</small></h1>',
			description: [
				'The Laplace distribution is a continuous probability distribution named after Pierre-Simon Laplace. It is also sometimes called the double exponential distribution, because it can be thought of as two exponential distributions (with an additional location parameter) spliced together back-to-back, although the term \'double exponential distribution\' is also sometimes used to refer to the Gumbel distribution. The difference between two independent identically distributed exponential random variables is governed by a Laplace distribution, as is a Brownian motion evaluated at an exponentially distributed random time. Increments of Laplace motion or a variance gamma process evaluated over the time scale also have a Laplace distribution.'
			]
		}

	};

	/**
	 * generate support parameters based on first element in dropdown list or default to binomial distribution if there are no options
	 * bind all necessary events
	 */
	self.init = function() {

		var distrType = $('select[name=distr-type] option').eq(0).val() || 'binomial';

		$('#params').html(self.renderParams(distrType));
		$('#desc').html(mustache.render(self.templates.desc, self.templates[distrType]));

		self.bindEvents();

	};

	/**
	 * bind events needed for generating statistics corresponding to any distribution
	 */
	self.bindEvents = function() {

		// generate input elements based on selected distribution type
		$('select[name=distr-type]').on('change', function(e) {

			var distrType = $(this).val();

			$('#params').html(self.renderParams(distrType));
			$('#desc').html(mustache.render(self.templates.desc, self.templates[distrType]));

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

			console.log(distrType);

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