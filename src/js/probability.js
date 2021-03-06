/**
 * @namespace
 * @description define probability methods
 * @property {object} moments - standard moment definitions
 *
 * @property {object} distribution - defined commonly used distributions
 * @property {object} distribution.(distribution) - contains standard statistics specified below for a particular distribution
 */
Math.p = {
	/**
	 * Calculate sample mean from an array of x-y coordinate objects.
	 *
	 * @example
	 * Math.p.mean([{ x: 0, y: 0.1 }, { x: 0.5, y: 12.53 }, { x: 4, y: 5 }])
	 * // returns 5.876666666666667
	 *
	 * @param {array} array - sample array of objects with x and y coordinate properties
	 * @return {number} mean
	 */
	mean: function(array) {
		return 1 / array.length * Math.h.sSum(array, function(el) {
			return el.y;
		});
	},

	/**
	 * Calculate sample variance from an array of x-y coordinate objects.
	 *
	 * @example
	 * Math.p.variance([{ x: 0, y: 0.1 }, { x: 0.5, y: 12.53 }, { x: 4, y: 5 }])
	 * // returns 39.20263333333333
	 *
	 * @param {array} array - sample array of objects with x and y coordinate properties
	 * @return {number} variance
	 */
	variance: function(array) {
		var mean = Math.p.mean(array);

		return 1 / (array.length - 1) * Math.h.sSum(array, function(el) {
			return Math.pow(el.y - mean, 2);
		});
	},

	/**
	 * Call method to generate pdf and cdf distribution plots based on a distribution and its parameters and moments.
	 *
	 * @param {string} distrType - distribution type as string
	 * @param {object} params - statistical parameters object
	 * @param {object} moments - moments object generated via moment-generating function
	 * @return {object} object of pdf and cdf arrays containing x-y value pairs for plotting
	 */
	buildDF: function(distrType, params, moments) {
		var distr = {
			pdf: [],
			cdf: []
		};
		var inc = (Math.p.distribution[distrType].discrete) ? 1 : Math.sqrt(moments.variance) / 100;

		if (isNaN(inc) || Math.abs(inc) > 99999) {
			inc = 0.01;
		}

		distr.pdf = Math.p.generatePDF(distrType, params, moments, -inc).concat(Math.p.generatePDF(distrType, params, moments, inc));

		distr.pdf.sort(function(a, b) {
			if (a.x < b.x) {
				return -1;
			} else if (a.x > b.x) {
				return 1;
			}

			return 0;
		});

		distr.cdf = Math.p.generateCDF(distr.pdf, inc);

		return distr;
	},

	/**
	 * Generate one side of a pdf numerically until y value becomes negligible. Starts at the mean and moves outward in the direction of the sign of increment.
	 *
	 * @param {string} distrType - distribution type as string
	 * @param {object} params - statistical parameters object
	 * @param {object} moments - moments object generated via moment-generating function
	 * @param {number} inc - increment to loop over
	 * @return {array} array of objects containing x-y value pairs
	 */
	generatePDF: function(distrType, params, moments, inc) {
		var value;
		var pdf = [];
		var i = 0;
		var sum = 0;
		var v = 0;
		var start = (inc < 0) ? moments.mean - inc : moments.mean;

		if (Math.p.distribution[distrType].discrete === true) {
			start = Math.floor(start);
		}
		if (isNaN(moments.mean) || Math.abs(moments.mean) > 99999) {
			start = 0;
		}

		while (Math.abs(start - i) <= 10 * moments.variance || i < 99999) {
			value = Math.p.distribution[distrType].pdf(params)(start - i);

			if (isNaN(value) || value <= 0) {
				v += 1;
			}

			if (v > 10 || isNaN(i / inc) || (!isNaN(value) && ((value >= 0 && value <= 1E-5)))) {
				break;
			}

			if (Math.h.inBounds(start - i, Math.p.distribution[distrType].bounds(params)) && !isNaN(value)) {
				pdf.push({
					x: start - i,
					y: value
				});
			}

			i += inc;
		}

		return pdf;
	},

	/**
	 * Generate a cdf based on the summation of pdf values in an array of objects containing x-y coordinate pairs.
	 *
	 * @param {array} pdf - distribution array
	 * @return {array} array of objects containing x-y value pairs
	 */
	generateCDF: function(pdf, inc) {
		var cdf = [];
		var i = 0;
		var sum = 0;

		for (i = 0, l = pdf.length; i < l; i++) {
			sum += pdf[i].y;

			cdf.push({
				x: pdf[i].x,
				y: sum * inc
			});
		}

		return cdf;
	},

	/**
	 * @namespace
	 * @description define moments
	 */
	moments: {
		/**
		 * Calculate the mean of a moment generating function via numerical derivation. The mean approximates the statistical norm or average or expected value.
		 *
		 * @example
		 * Math.p.moments.mean(function(t) { return Math.sqrt(t + 0.1); })
		 * // returns 1.581
		 *
		 * @param {function} f - single-variable function
		 * @return {number} mean
		 */
		mean: function(f) {
			return Math.h.round(Math.h.derivative(f, 1, 0), 3);
		},

		/**
		 * Calculate the variance of a moment generating function via numerical derivation. Variance is the second moment around the mean; the expected value of the square of the deviations of a random variable from its mean value.
		 *
		 * @example
		 * Math.p.moments.variance(function(t) { return Math.sqrt(t + 0.1); })
		 * // returns -10.406
		 *
		 * @param {function} f - single-variable function
		 * @return {number} variance
		 */
		variance: function(f) {
			return Math.h.round(Math.h.derivative(f, 2, 0) - Math.pow(Math.h.derivative(f, 1, 0), 2), 3);
		},

		/**
		 * Calculate the skewness of a moment generating function via numerical derivation. Skewness is a measure of the degree of asymmetry of a distribution. If the left tail is more pronounced than the right tail, the function is said to have negative skewness. If the reverse is true, it has positive skewness. If the two are equal, it has zero skewness.
		 *
		 * @example
		 * Math.p.moments.skewness(function(t) { return Math.sqrt(t + 0.1); })
		 * // returns NaN
		 *
		 * @param {function} f - single-variable function
		 * @return {number} skewness
		 */
		skewness: function(f) {
			return Math.h.round((Math.h.derivative(f, 3, 0) - 3 * Math.h.derivative(f, 1, 0) * Math.h.derivative(f, 2, 0) + 2 * Math.pow(Math.h.derivative(f, 1, 0), 3)) / Math.pow(Math.h.derivative(f, 2, 0) - Math.pow(Math.h.derivative(f, 1, 0), 2), 1.5), 3);
		},

		/**
		 * Calculate the kurtosis of a moment generating function via numerical derivation. Kurtosis is the degree of peakedness of a distribution, defined as a normalized form of the fourth central moment of a distribution.
		 *
		 * @example
		 * Math.p.moments.kurtosis(function(t) { return Math.sqrt(t + 0.1); })
		 * // returns -38.575
		 *
		 * @param {function} f - single-variable function
		 * @return {number} kurtosis
		 */
		kurtosis: function(f) {
			return Math.h.round((Math.h.derivative(f, 4, 0) - 4 * Math.h.derivative(f, 1, 0) * Math.h.derivative(f, 3, 0) + 6 * Math.h.derivative(f, 2, 0) * Math.pow(Math.h.derivative(f, 1, 0), 2) - 3 * Math.pow(Math.h.derivative(f, 1, 0), 4)) / Math.pow(Math.h.derivative(f, 2, 0) - Math.pow(Math.h.derivative(f, 1, 0), 2), 2) - 3, 3);
		}

	},

	/**
	 * @namespace
	 * @description define distributions
	 * @property {array} (distribution).description - array of paragraphs describing a particular distribution
	 * @property {boolean} (distribution).discrete - determines if distribution is discrete or continuous
	 * @property {function} (distribution).bounds - define distribution bounds for its variable
	 * @property {object} (distribution).params - contains values used in generating html input
	 * @property {function|object} (distribution).mgf - specified moment generating function returns a function of parameters or an object containing hard-coded standard moment equations
	 * @property {function} (distribution).pdf - probability distribution function returns a function of its variable using specified distribution parameters
	 * @property {function} (distribution).cdf - cumulative distribution function returns a function of its variable using specified distribution parameters
	 */
	distribution: {
		beta: {
			description: [
				'The beta distribution is a family of continuous probability distributions defined on the interval [0, 1] parametrized by two positive shape parameters, denoted by &alpha; and &beta;, that appear as exponents of the random variable and control the shape of the distribution.',
				'The beta distribution has been applied to model the behavior of random variables limited to intervals of finite length in a wide variety of disciplines. For example, it has been used as a statistical description of allele frequencies in population genetics; time allocation in project management / control systems; sunshine data; variability of soil properties; proportions of the minerals in rocks in stratigraphy; and heterogeneity in the probability of HIV transmission.',
				'In Bayesian inference, the beta distribution is the conjugate prior probability distribution for the Bernoulli, binomial, negative binomial and geometric distributions. For example, the beta distribution can be used in Bayesian analysis to describe initial knowledge concerning probability of success such as the probability that a space vehicle will successfully complete a specified mission. The beta distribution is a suitable model for the random behavior of percentages and proportions.'
			],

			formulas: [
				'\\mathbf{mgf} = 1+\\sum_{k=1}^{\\infty}\\bigg(\\prod_{r=0}^{k-1}\\frac{(\\alpha+r)}{(\\alpha+\\beta+r)}\\bigg)\\frac{t^{k}}{k!}',
				'\\mathbf{pdf} = \\frac{x^{\\alpha-1}(1-x)^{\\beta-1}}{B(\\alpha,\\beta)}',
				'\\mathbf{cdf} = I_x(\\alpha,\\beta)',
			],

			discrete: false,

			bounds: function(params) {
				return {
					lower: {
						value: 0,
						closed: true
					},
					upper: {
						value: 1,
						closed: true
					}
				};
			},

			params: [
				{
					id: 'a',
					symbol: '&alpha;',
					title: 'Shape',
					min: 0.01,
					max: 1000,
					step: 0.01,
					value: 2
				},
				{
					id: 'b',
					symbol: '&beta;',
					title: 'Shape',
					min: 0.01,
					max: 1000,
					step: 0.01,
					value: 2
				}
			],

			mgf: function(params) {
				/*return 1 + Math.h.sum(function(k) {
					return Math.h.product(function(r) {
						return (params.a + r) / (params.a + params.b + r);
					}, 0, k - 1) * Math.pow(t, k) / Math.h.factorial(k);
				}, 1, Infinity);*/

				return {
					mean: Math.h.round((params.a / (params.a + params.b)), 3),
					variance: Math.h.round((params.a * params.b / (Math.pow(params.a + params.b, 2) * (params.a + params.b + 1))), 3),
					skewness: Math.h.round((2 * (params.b - params.a) * Math.sqrt(params.a + params.b + 1) / ((params.a + params.b + 2) * Math.sqrt(params.a * params.b))), 3),
					kurtosis: Math.h.round((6 * (Math.pow(params.a - params.b, 2) * (params.a + params.b + 1) - params.a * params.b * (params.a + params.b + 2)) / (params.a * params.b * (params.a + params.b + 2) * (params.a + params.b + 3))), 3)
				};
			},

			pdf: function(params) {
				return function(x) {
					return Math.pow(x, params.a - 1) * Math.pow((1 - x), params.b - 1) / Math.h.beta(params.a, params.b);
				};
			},

			cdf: function(params) {
				return function(x) {
					return Math.h.integral(Math.p.distribution.beta.pdf(params), 0, x);
				};
			}
		},

		binomial: {
			description: [
				'The binomial distribution with parameters n and p is the discrete probability distribution of the number of successes in a sequence of n independent yes/no experiments, each of which yields success with probability p. A success/failure experiment is also called a Bernoulli experiment or Bernoulli trial; when n = 1, the binomial distribution is a Bernoulli distribution. The binomial distribution is the basis for the popular binomial test of statistical significance.',
				'The binomial distribution is frequently used to model the number of successes in a sample of size n drawn with replacement from a population of size N. If the sampling is carried out without replacement, the draws are not independent and so the resulting distribution is a hypergeometric distribution, not a binomial one. However, for N much larger than n, the binomial distribution is a good approximation, and widely used.'
			],

			formulas: [
				'\\mathbf{mgf} = (1-p+pe^{t})^{n}',
				'\\mathbf{pmf} = \\binom{n}{k}p^{k}(1-p)^{n-k}',
				'\\mathbf{cdf} = I_{1-p}(n-k,1+k)'
			],

			discrete: true,

			bounds: function(params) {
				return {
					lower: {
						value: 0,
						closed: true
					},
					upper: {
						value: Infinity,
						closed: true
					}
				};
			},

			params: [
				{
					id: 'p',
					symbol: 'p',
					title: 'Probability',
					min: 0,
					max: 1,
					step: 0.01,
					value: 0.5
				},
				{
					id: 'n',
					symbol: 'n',
					title: 'Trials',
					min: 0,
					max: 1000,
					step: 1,
					value: 40
				}
			],

			mgf: function(params) {
				return function(t) {
					return Math.pow((1 - params.p + params.p * Math.exp(t)), params.n);
				};
			},

			pdf: function(params) {
				return function(k) {
					return Math.h.choose(params.n, k) * Math.pow(params.p, k) * Math.pow((1 - params.p), (params.n - k));
				};
			},

			cdf: function(params) {
				return function(k) {
					return Math.h.integral(Math.p.distribution.binomial.pdf(params), 0, k);
				};
			}
		},

		cauchy: {
			description: [
				'The Cauchy distribution, named after Augustin Cauchy, is a continuous probability distribution. It is also known, especially among physicists, as the Lorentz distribution (after Hendrik Lorentz), Cauchy-Lorentz distribution, Lorentz(ian) function, or Breit-Wigner distribution. The simplest Cauchy distribution is called the standard Cauchy distribution. It is the distribution of a random variable that is the ratio of two independent standard normal variables.',
				'The Cauchy distribution is often used in statistics as the canonical example of a "pathological" distribution since both its mean and its variance are undefined. The Cauchy distribution does not have finite moments of order greater than or equal to one; only fractional absolute moments exist. The Cauchy distribution has no moment generating function.',
				'Its importance in physics is the result of it being the solution to the differential equation describing forced resonance. In mathematics, it is closely related to the Poisson kernel, which is the fundamental solution for the Laplace equation in the upper half-plane. In spectroscopy, it is the description of the shape of spectral lines which are subject to homogeneous broadening in which all atoms interact in the same way with the frequency range contained in the line shape. Many mechanisms cause homogeneous broadening, most notably collision broadening, and Chantler-Alda radiation. In its standard form, it is the maximum entropy probability distribution for a random variate X.'
			],

			formulas: [
				'\\mathbf{pdf} = \\frac{1}{\\pi\\gamma\\bigg[1+\\Big(\\frac{x-x_{0}}{\\gamma}\\Big)^{2}\\bigg]}',
				'\\mathbf{cdf} = \\frac{1}{\\pi}arctan\\bigg(\\frac{x-x_{0}}{\\gamma}\\bigg)+\\frac{1}{2}'
			],

			discrete: false,

			bounds: function(params) {
				return {
					lower: {
						value: -Infinity,
						closed: false
					},
					upper: {
						value: Infinity,
						closed: false
					}
				};
			},

			params: [
				{
					id: 'x0',
					symbol: 'x<sub>0</sub>',
					title: 'Location',
					min: -1000,
					max: 1000,
					step: 0.01,
					value: 0
				},
				{
					id: 'gamma',
					symbol: '&gamma;',
					title: 'Scale',
					min: 0.01,
					max: 1000,
					step: 0.01,
					value: 0.5
				}
			],

			mgf: function(params) {
				return {
					mean: undefined,
					variance: undefined,
					skewness: undefined,
					kurtosis: undefined
				};
			},

			pdf: function(params) {
				return function(x) {
					return 1 / (Math.PI * params.gamma * (1 + Math.pow((x - params.x0) / params.gamma, 2)));
				};
			},

			cdf: function(params) {
				return function(x) {
					return 1 / Math.PI * Math.atan((x - params.x0) / params.gamma) + 0.5;
				};
			}
		},

		chiSquared: {
			description: [
				'The chi-squared distribution with k degrees of freedom is the distribution of a sum of the squares of k independent standard normal random variables. A special case of the gamma distribution, it is one of the most widely used probability distributions in inferential statistics, e.g., in hypothesis testing or in construction of confidence intervals. When it is being distinguished from the more general noncentral chi-squared distribution, this distribution is sometimes called the central chi-squared distribution.',
					'The chi-squared distribution is used in the common chi-squared tests for goodness of fit of an observed distribution to a theoretical one, the independence of two criteria of classification of qualitative data, and in confidence interval estimation for a population standard deviation of a normal distribution from a sample standard deviation. Many other statistical tests also use this distribution, like Friedman\'s analysis of variance by ranks.'
			],

			formulas: [
				'mgf=(1-2t)^{-k/2}, t < \\frac{1}{2}',
				'pdf=\\frac{1}{2^{\\frac{k}{2}}\\Gamma\\big(\\frac{k}{2}\\big)}x^{\\frac{k}{2}-1}e^{-\\frac{x}{2}}',
				'cdf=\\frac{1}{\\Gamma\\big(\\frac{k}{2}\\big)}\\gamma\\Big(\\frac{k}{2},\\frac{x}{2}\\Big)'
			],

			discrete: false,

			bounds: function(params) {
				return {
					lower: {
						value: 0,
						closed: true
					},
					upper: {
						value: Infinity,
						closed: true
					}
				};
			},

			params: [
				{
					id: 'k',
					symbol: 'k',
					title: 'Degrees of freedom',
					min: 0,
					max: 1000,
					step: 1,
					value: 1
				},
			],

			mgf: function(params) {
				return function(t) {
					return Math.pow(1 - 2 * t, -params.k / 2);
				};
			},

			pdf: function(params) {
				return function(x) {
					return 1 / (Math.pow(2, params.k / 2) * Math.h.gamma(params.k / 2)) * Math.pow(x, params.k / 2 - 1) * Math.exp(-x / 2);
				};
			},

			cdf: function(params) {
				return function(x) {
					return Math.h.integral(Math.p.distribution.chiSquared.pdf(params), 0, x);
				};
			}
		},

		exponential: {
			description: [
				'The exponential distribution (a.k.a. negative exponential distribution) is the probability distribution that describes the time between events in a Poisson process, i.e. a process in which events occur continuously and independently at a constant average rate. It is the continuous analogue of the geometric distribution, and it has the key property of being memoryless. In addition to being used for the analysis of Poisson processes, it is found in various other contexts.',
				'Note that the exponential distribution is not the same as the class of exponential families of distributions, which is a large class of probability distributions that includes the exponential distribution as one of its members, but also includes the normal distribution, binomial distribution, gamma distribution, Poisson, and many others.'
			],

			formulas: [
				'\\mathbf{mgf} = \\frac{\\lambda}{\\lambda-t}, t < \\lambda',
				'\\mathbf{pdf} = {\\lambda}e^{-{\\lambda}x}',
				'\\mathbf{cdf} = 1-e^{-{\\lambda}x}'
			],

			discrete: false,

			bounds: function(params) {
				return {
					lower: {
						value: 0,
						closed: true
					},
					upper: {
						value: Infinity,
						closed: true
					}
				};
			},

			params: [
				{
					id: 'lambda',
					symbol: '&lambda;',
					title: 'Rate',
					min: 0.01,
					max: 50,
					step: 0.01,
					value: 0.5
				}
			],

			mgf: function(params) {
				return function(t) {
					if (t < params.lambda) {
						return Math.pow(1 - t / params.lambda, -1);
					} else {
						return 0;
					}
				};
			},

			pdf: function(params) {
				return function(x) {
					return params.lambda * Math.exp(-params.lambda * x);
				};

			},

			cdf: function(params) {
				return function(x) {
					return Math.h.integral(Math.p.distribution.exponential.pdf(params), 0, x);
				};
			}
		},

		fisherSnedecor: {
			description: [
				'The F-distribution is a continuous probability distribution. It is also known as Snedecor\'s F distribution or the Fisher-Snedecor distribution (after R. A. Fisher and George W. Snedecor). The F-distribution arises frequently as the null distribution of a test statistic, most notably in the analysis of variance.'
			],

			formulas: [
				'\\mathbf{pdf} = \\frac{\\sqrt{(d_1 x)^{d_1} d_2^{d_2} / (d_1 x + d_2)^{d_1 + d_2}}}{xB\\big(\\frac{d_1}{2},\\frac{d_2}{2}\\big)}',
				'\\mathbf{cdf} = I_{\\frac{d_1 x}{d_1 x + d_2}}\\Big(\\frac{d_1}{2},\\frac{d_2}{2}\\Big)'
			],

			discrete: false,

			bounds: function(params) {
				return {
					lower: {
						value: 0,
						closed: true
					},
					upper: {
						value: Infinity,
						closed: false
					}
				};
			},

			params: [
				{
					id: 'd1',
					symbol: 'd<sub>1</sub>',
					title: 'Degrees of freedom',
					min: 0,
					max: 1000,
					step: 1,
					value: 10
				},
				{
					id: 'd2',
					symbol: 'd<sub>2</sub>',
					title: 'Degrees of freedom',
					min: 0,
					max: 1000,
					step: 1,
					value: 10
				}
			],

			mgf: function(params) {
				var o = {};

				o.mean = (params.d2 > 2) ? Math.h.round(params.d2 / (params.d2 - 2), 3) : undefined;
				o.variance = (params.d2 > 4) ? Math.h.round(2 * Math.pow(params.d2, 2) * (params.d1 + params.d2 -2) / (params.d1 * Math.pow(params.d2 - 2, 2) * (params.d2 - 4)), 3) : undefined;
				o.skewness = (params.d2 > 6) ? Math.h.round((2 * params.d1 + params.d2 - 2) * Math.sqrt(8 * (params.d2 - 4)) / ((params.d2 - 6) * Math.sqrt(params.d1 * (params.d1 + params.d2 - 2))), 3) : undefined;
				o.kurtosis = (params.d2 > 8) ? Math.h.round(12 * params.d1 * (5 * params.d2 - 22) * (params.d1 + params.d2 - 2) + (params.d2 - 4) * Math.pow(params.d2 - 2, 2) / (params.d1 * (params.d2 - 6) * (params.d2 - 8) * (params.d1 + params.d2 - 2)), 3) : undefined;

				return o;
			},

			pdf: function(params) {
				return function(x) {
					return Math.h.gamma((params.d1 + params.d2) / 2) * Math.pow(params.d1 / params.d2, params.d1 / 2) * Math.pow(x, (params.d1 / 2 - 1)) / (Math.h.gamma(params.d1 / 2) * Math.h.gamma(params.d2 / 2) * Math.pow((1 + params.d1 / params.d2 * x), (params.d1 + params.d2) / 2));

					//return Math.sqrt(Math.pow(params.d1 * x, params.d1) * Math.pow(params.d2, params.d2) / Math.pow(params.d1 * x + params.d2, params.d1 + params.d2)) / (x * Math.h.beta(params.d1 / 2, params.d2 / 2));
				};
			},

			cdf: function(params) {
				return function(x) {
					return Math.h.integral(Math.p.distribution.fisherSnedecor.pdf(params), 0, x);
				};
			}
		},

		gamma: {
			description: [
				'The gamma distribution is a two-parameter family of continuous probability distributions. The common exponential distribution and chi-squared distribution are special cases of the gamma distribution. There are three different parametrizations in common use. A shape parameter k and a scale parameter &theta; are used here.',
				'This parameterization appears to be more common in econometrics and certain other applied fields, where e.g. the gamma distribution is frequently used to model waiting times. For instance, in life testing, the waiting time until death is a random variable that is frequently modeled with a gamma distribution.',
				'If k is an integer, then the distribution represents an Erlang distribution; i.e., the sum of k independent exponentially distributed random variables, each of which has a mean of &theta;.'
			],

			formulas: [
				'\\mathbf{mgf} = (1-\\theta t)^{-k}, t < \\frac{1}{\\theta}',
				'\\mathbf{pdf} = \\frac{1}{\\Gamma(k)\\theta^k}x^{k - 1} e^{\\frac{-x}{\\theta}}',
				'\\mathbf{cdf} = \\frac{1}{\\Gamma(k)}\\gamma\\Big(k, \\frac{x}{\\theta}\\Big)'
			],

			discrete: false,

			bounds: function(params) {
				return {
					lower: {
						value: 0,
						closed: true
					},
					upper: {
						value: Infinity,
						closed: true
					}
				};
			},

			params: [
				{
					id: 'k',
					symbol: 'k',
					title: 'Shape',
					min: 0.01,
					max: 1000,
					step: 0.01,
					value: 3
				},
				{
					id: 'theta',
					symbol: '&theta;',
					title: 'Scale',
					min: 0.01,
					max: 1000,
					step: 0.01,
					value: 2
				}
			],

			mgf: function(params) {
				return function(t) {
					return Math.pow((1 - params.theta * t), -params.k);
				};
			},

			pdf: function(params) {
				return function(x) {
					return 1 / (Math.h.gamma(params.k) * Math.pow(params.theta, params.k)) * Math.pow(x, params.k - 1) * Math.exp(-x / params.theta);
				};
			},

			cdf: function(params) {
				return function(x) {
					return Math.h.integral(Math.p.distribution.gamma.pdf(params), 0, x);
				};
			}
		},

		gaussian: {
			description: [
				'The normal (or Gaussian) distribution is a very commonly occurring continuous probability distribution-a function that tells the probability that any real observation will fall between any two real limits or real numbers, as the curve approaches zero on either side. Normal distributions are extremely important in statistics and are often used in the natural and social sciences for real-valued random variables whose distributions are not known.',
				'The normal distribution is immensely useful because of the central limit theorem, which states that, under mild conditions, the mean of many random variables independently drawn from the same distribution is distributed approximately normally, irrespective of the form of the original distribution: physical quantities that are expected to be the sum of many independent processes (such as measurement errors) often have a distribution very close to the normal. Moreover, many results and methods (such as propagation of uncertainty and least squares parameter fitting) can be derived analytically in explicit form when the relevant variables are normally distributed.',
				'The Gaussian distribution is sometimes informally called the bell curve. However, many other distributions are bell-shaped (such as Cauchy\'s, Student\'s, and logistic). The terms Gaussian function and Gaussian bell curve are also ambiguous because they sometimes refer to multiples of the normal distribution that cannot be directly interpreted in terms of probabilities.'
			],

			formulas: [
				'\\mathbf{mgf} = e^{\\mu t + \\frac{1}{2} \\sigma^2 t^2}',
				'\\mathbf{pdf} = \\frac{1}{\\sigma\\sqrt{2 \\pi}}e^{-\\frac{(x - \\mu)^2}{2 \\sigma^2}}',
				'\\mathbf{cdf} = \\frac{1}{2} \\bigg[1 + erf\\bigg(\\frac{x - \\mu}{\\sigma\\sqrt{2}}\\bigg)\\bigg]'
			],

			discrete: false,

			bounds: function(params) {
				return {
					lower: {
						value: -Infinity,
						closed: true
					},
					upper: {
						value: Infinity,
						closed: true
					}
				};
			},

			params: [
				{
					id: 'mean',
					symbol: '&mu;',
					title: 'Mean',
					min: -10000,
					max: 10000,
					step: 0.01,
					value: 100
				},
				{
					id: 'std',
					symbol: '&sigma;',
					title: 'Standard Deviation',
					min: 0.01,
					max: 10000,
					step: 0.01,
					value: 50
				}
			],

			mgf: function(params) {
				return function(t) {
					return Math.exp(params.mean * t + 0.5 * Math.pow(params.std, 2) * Math.pow(t, 2));
				};
			},

			pdf: function(params) {
				return function(x) {
					return 1 / (params.std * Math.pow(2 * Math.PI, 0.5)) * Math.exp(-Math.pow(x - params.mean, 2) / (2 * Math.pow(params.std, 2)));
				};

			},

			cdf: function(params) {
				return function(x) {
					return Math.h.integral(Math.p.distribution.gaussian.pdf(params), 0, x);
				};
			}
		},

		geometric: {
			description: [
				'The geometric distribution is either of two discrete probability distributions. The definition used here is: the probability distribution of the number Y = X - 1 of failures before the first success, supported on the set { 0, 1, 2, 3, ... }.'
			],

			formulas: [
				'\\mathbf{mgf} = \\frac{p}{1 - (1 - p) e^t}',
				'\\mathbf{pmf} = (1 - p)^k p',
				'\\mathbf{cdf} = 1 - (1 - p)^{k + 1}'
			],

			discrete: true,

			bounds: function(params) {
				return {
					lower: {
						value: 0,
						closed: true
					},
					upper: {
						value: Infinity,
						closed: true
					}
				};
			},

			params: [
				{
					id: 'p',
					symbol: 'p',
					title: 'Probability',
					min: 0.01,
					max: 1,
					step: 0.01,
					value: 0.5
				}
			],

			mgf: function(params) {
				return function(t) {
					return params.p / (1 - (1 - params.p) * Math.exp(t));
				};
			},

			pdf: function(params) {
				return function(k) {
					return Math.pow(1 - params.p, k) * params.p;
				};
			},

			cdf: function(params) {
				return function(k) {
					return Math.h.integral(Math.p.distribution.geometric.pdf(params), 0, k);
				};
			}
		},

		gompertz: {
			description: [
				'The Gompertz distribution is a continuous probability distribution. The Gompertz distribution is often applied to describe the distribution of adult lifespans by demographers and actuaries. Related fields of science such as biology and gerontology also considered the Gompertz distribution for the analysis of survival. More recently, computer scientists have also started to model the failure rates of computer codes by the Gompertz distribution. In Marketing Science, it has been used as an individual-level simulation for customer lifetime value modeling. Early users in the 1990s for the Gompertz distribution in CLV models included Edge Consulting and BrandScience.'
			],

			formulas: [
				'\\mathbf{mgf} = \\eta e^{\\eta}\\int_1^\\infty \\! e^{-\\eta v} v^{-t / b} \\, \\mathrm{d}v, t > 0',
				'\\mathbf{pdf} = b \\eta e^{b x}e^{\\eta}\\exp{\\big(-\\eta e^{b x})}',
				'\\mathbf{cdf} = 1 - \\exp{(-\\eta(e^{bx} - 1)\\big)}'
			],

			discrete: false,

			bounds: function(params) {
				return {
					lower: {
						value: 0,
						closed: true
					},
					upper: {
						value: Infinity,
						closed: false
					}
				};
			},

			params: [
				{
					id: 'n',
					symbol: '&eta;',
					title: 'Eta',
					min: 0.01,
					max: 1000,
					step: 0.001,
					value: 1
				},
				{
					id: 'b',
					symbol: 'b',
					title: 'b',
					min: 0.01,
					max: 1000,
					step: 0.001,
					value: 2.322
				}
			],

			mgf: function(params) {
				return function(t) {
					return params.n * Math.exp(params.n) * Math.h.sum(function(v) {
						return Math.exp(-params.n * v) * Math.pow(v, -t / params.b);
					}, 1, Infinity);
				};
			},

			pdf: function(params) {
				return function(x) {
					return params.b * params.n * Math.exp(params.b * x) * Math.exp(params.n) * Math.exp(-params.n * Math.exp(params.b * x));
				};
			},

			cdf: function(params) {
				return function(x) {
					return 1 - Math.exp(-params.n * (Math.exp(params.b * x) - 1));
				};
			}
		},

		gumbel: {
			description: [
				'The Gumbel distribution is used to model the distribution of the maximum (or the minimum) of a number of samples of various distributions. Such a distribution might be used to represent the distribution of the maximum level of a river in a particular year if there was a list of maximum values for the past ten years. It is useful in predicting the chance that an extreme earthquake, flood or other natural disaster will occur.',
				'The potential applicability of the Gumbel distribution to represent the distribution of maxima relates to extreme value theory which indicates that it is likely to be useful if the distribution of the underlying sample data is of the normal or exponential type.',
				'The Gumbel distribution is a particular case of the generalized extreme value distribution (also known as the Fisher-Tippett distribution). It is also known as the log-Weibull distribution and the double exponential distribution (a term that is alternatively sometimes used to refer to the Laplace distribution). It is related to the Gompertz distribution: when its density is first reflected about the origin and then restricted to the positive half line, a Gompertz function is obtained.',
				'In the latent variable formulation of the multinomial logit model - common in discrete choice theory - the errors of the latent variables follow a Gumbel distribution. This is useful because the difference of two Gumbel-distributed random variables has a logistic distribution.'
			],

			formulas: [
				'\\mathbf{mgf} = \\Gamma(1 - \\beta t)e^{\\mu t}',
				'\\mathbf{pdf} = \\frac{1}{\\beta}e^{-(\\frac{x - \\mu}{\\beta} + e^{-\\frac{x - \\mu}{\\beta}})}',
				'\\mathbf{cdf} = e^{-e^{-(x - \\mu) / \\beta}}'
			],

			discrete: false,

			bounds: function(params) {
				return {
					lower: {
						value: -Infinity,
						closed: true
					},
					upper: {
						value: Infinity,
						closed: true
					}
				};
			},

			params: [
				{
					id: 'mu',
					symbol: '&mu;',
					title: 'Location',
					min: -1000,
					max: 1000,
					step: 0.01,
					value: 1
				},
				{
					id: 'beta',
					symbol: '&beta;',
					title: 'Scale',
					min: 0.01,
					max: 1000,
					step: 0.01,
					value: 2
				}
			],

			mgf: function(params) {
				return function(t) {
					return Math.h.gamma(1 - params.beta * t) * Math.exp(params.mu * t);
				};
			},

			pdf: function(params) {
				return function(x) {
					var z = (x - params.mu) / params.beta;

					return 1 / params.beta * Math.exp(-(z + Math.exp(-z)));
				};
			},

			cdf: function(params) {
				return function(x) {
					return Math.h.integral(Math.p.distribution.rayleigh.pdf(params), 0, x);
				};
			}
		},

		hypSecant: {
			description: [
				'The hyperbolic secant distribution is a continuous probability distribution whose probability density function and characteristic function are proportional to the hyperbolic secant function. The hyperbolic secant function is equivalent to the inverse hyperbolic cosine, and thus this distribution is also called the inverse-cosh distribution.'
			],

			formulas: [
				'\\mathbf{mgf} = \\sec{(t)}, \\left|t\\right| < \\frac{\\pi}{2}',
				'\\mathbf{pdf} = \\frac{1}{2} \\mathrm{sech}\\Big({\\frac{\\pi}{2} x}\\Big)',
				'\\mathbf{cdf} = \\frac{2}{\\pi} \\arctan{\\bigg[\\exp{\\Big(\\frac{\\pi}{2} x\\Big)}\\bigg]}'
			],

			discrete: false,

			bounds: function(params) {
				return {
					lower: {
						value: -Infinity,
						closed: false
					},
					upper: {
						value: Infinity,
						closed: false
					}
				};
			},

			params: [],

			mgf: function(params) {
				return function(t) {
					return (Math.abs(t) < Math.PI / 2) ? Math.h.sec(t) : undefined;
				};
			},

			pdf: function(params) {
				return function(x) {
					return 0.5 * Math.h.sech(Math.PI / 2 * x);
				};
			},

			cdf: function(params) {
				return function(x) {
					return 2 / Math.PI * Math.atan(Math.exp(Math.PI / 2 * x));
				};
			}
		},

		invGaussian: {
			description: [
				'The inverse Gaussian distribution (also known as the Wald distribution) is a two-parameter family of continuous probability distributions with support on (0,&infin;).',
				'As &lambda; tends to infinity, the inverse Gaussian distribution becomes more like a normal (Gaussian) distribution. The inverse Gaussian distribution has several properties analogous to a Gaussian distribution. The name can be misleading: it is an "inverse" only in that, while the Gaussian describes a Brownian Motion\'s level at a fixed time, the inverse Gaussian describes the distribution of the time a Brownian Motion with positive drift takes to reach a fixed positive level.'
			],

			formulas: [
				'\\mathbf{mgf} = e^{\\Big(\\frac{\\lambda}{\\mu}\\Big)}\\Bigg[1 - \\sqrt{1 - \\frac{2 \\mu^2 t}{\\lambda}}\\Bigg]',
				'\\mathbf{pdf} = \\bigg[\\frac{\\lambda}{2 \\pi x^3}\\bigg]^{1/2}\\exp{\\frac{-\\lambda (x - \\mu)^2}{2 \\mu^2 x}}',
				'\\mathbf{cdf} = \\Phi\\Bigg(\\sqrt{\\frac{\\lambda}{x}}\\bigg(\\frac{x}{\\mu} - 1\\bigg)\\Bigg) + \\exp\\bigg(\\frac{2 \\lambda}{\\mu}\\bigg)\\Phi\\Bigg(-\\sqrt{\\frac{\\lambda}{x}}\\bigg(\\frac{x}{\\mu} + 1\\bigg)\\Bigg)'
			],

			discrete: false,

			bounds: function(params) {
				return {
					lower: {
						value: 0,
						closed: false
					},
					upper: {
						value: Infinity,
						closed: true
					}
				};
			},

			params: [
				{
					id: 'shape',
					symbol: '&lambda;',
					title: 'Shape',
					min: 0.01,
					max: 100,
					step: 0.01,
					value: 1
				},
				{
					id: 'mean',
					symbol: '&mu;',
					title: 'Mean',
					min: 0.01,
					max: 100,
					step: 0.01,
					value: 1
				}
			],

			mgf: function(params) {
				return {
					mean: Math.h.round(params.mean, 3),
					variance: Math.h.round(Math.pow(params.mean, 3) / params.shape, 3),
					skewness: Math.h.round(3 * Math.sqrt(params.mean / params.shape), 3),
					kurtosis: Math.h.round(15 * params.mean / params.shape, 3)
				};

				/*return function(t) {
					return Math.exp(params.shape / params.mean) * (1 - Math.sqrt(1 - 2 * Math.pow(params.mean, 2) * t / params.shape));
				};*/
			},

			pdf: function(params) {
				return function(x) {
					return Math.sqrt(params.shape / (2 * Math.PI * Math.pow(x, 3))) * Math.exp(-params.shape * Math.pow(x - params.mean, 2) / (2 * Math.pow(params.mean, 2) * x));
				};

			},

			cdf: function(params) {
				return function(x) {
					return Math.h.integral(Math.p.distribution.invGaussian.pdf(params), 0, x);
				};
			}
		},

		irwinHall: {
			description: [
				'The Irwin-Hall distribution, named after Joseph Oscar Irwin and Philip Hall, is probability distribution for a random variable defined as sum of a number of independent random variables, each having a uniform distribution. For this reason it is also known as the uniform sum distribution.',
				'The generation of pseudo-random numbers having an approximately normal distribution is sometimes accomplished by computing the sum of a number of pseudo-random numbers having a uniform distribution; usually for the sake of simplicity of programming. Rescaling the Irwin-Hall distribution provides the exact distribution of the random variates being generated.'
			],

			formulas: [
				'\\mathbf{mgf} = \\Bigg(\\frac{e^t - 1}{t}\\Bigg)^n',
				'\\mathbf{pdf} = \\frac{1}{2(n - 1)!}\\sum_{k=0}^{n}(-1)^k\\binom{n}{k}(x - k)^{n - 1}\\mathrm{sgn}(x - k)',
				'\\mathbf{cdf} = \\frac{1}{2} + \\frac{1}{2n!}\\sum_{k=0}^{n}(-1)^k\\binom{n}{k}(x - k)^{n}\\mathrm{sgn}(x - k)'
			],

			discrete: false,

			bounds: function(params) {
				return {
					lower: {
						value: 0,
						closed: true
					},
					upper: {
						value: params.n,
						closed: true
					}
				};
			},

			params: [
				{
					id: 'n',
					symbol: 'n',
					title: 'n',
					min: 0,
					max: 1000,
					step: 1,
					value: 2
				}
			],

			mgf: function(params) {
				return {
					mean: Math.h.round(params.n / 2, 3),
					variance: Math.h.round(params.n / 12, 3),
					skewness: 0,
					kurtosis: Math.h.round(-6 / (5 * params.n), 3)
				};

				/*return function(t) {
					return Math.pow((Math.exp(t) - 1) / t, params.n);
				};*/
			},

			pdf: function(params) {
				return function(x) {
					return 1 / (2 * Math.h.factorial(params.n - 1)) * Math.h.sum(function(k) {
						return Math.pow(-1, k) * Math.h.choose(params.n, k) * Math.pow(x - k, params.n - 1) * Math.h.sgn(x - k);
					}, 0, params.n);
				};

			},

			cdf: function(params) {
				return function(x) {
					return Math.h.integral(Math.p.distribution.irwinHall.pdf(params), 0, x);
				};
			}
		},

		laplace: {
			description: [
				'The Laplace distribution is a continuous probability distribution named after Pierre-Simon Laplace. It is also sometimes called the double exponential distribution, because it can be thought of as two exponential distributions (with an additional location parameter) spliced together back-to-back, although the term \'double exponential distribution\' is also sometimes used to refer to the Gumbel distribution. The difference between two independent identically distributed exponential random variables is governed by a Laplace distribution, as is a Brownian motion evaluated at an exponentially distributed random time. Increments of Laplace motion or a variance gamma process evaluated over the time scale also have a Laplace distribution.'
			],

			formulas: [
				'\\mathbf{mgf} = \\frac{\\exp{(\\mu t)}}{1 - b^2 t^2}, \\left|t\\right| < 1 / b',
				'\\mathbf{pdf} = \\frac{1}{2b}\\exp{\\bigg(-\\frac{\\left|x - \\mu\\right|}{b}\\bigg)}',
				'\\mathbf{cdf} = \\left\\{ \\begin{array}{lr} \\frac{1}{2}\\exp{\\Big(\\frac{x - \\mu}{b}\\Big)} & : x < \\mu\\\\ 1 - \\frac{1}{2}\\exp{\\Big(-\\frac{x - \\mu}{b}\\Big)} & : x \\ge \\mu \\end{array} \\right.'
			],

			discrete: false,

			bounds: function(params) {
				return {
					lower: {
						value: -Infinity,
						closed: false
					},
					upper: {
						value: Infinity,
						closed: false
					}
				};
			},

			params: [
				{
					id: 'mean',
					symbol: '&mu;',
					title: 'Location',
					min: -1000,
					max: 1000,
					step: 0.01,
					value: 0
				},
				{
					id: 'scale',
					symbol: 'b',
					title: 'Scale',
					min: 0.01,
					max: 1000,
					step: 0.01,
					value: 1
				}
			],

			mgf: function(params) {
				return function(t) {
					return (Math.abs(t) < 1 / params.scale) ? Math.exp(params.mean * t) / (1 - Math.pow(params.scale, 2) * Math.pow(t, 2)) : undefined;
				};
			},

			pdf: function(params) {
				return function(x) {
					return 1 / (2 * params.scale) * Math.exp(-Math.abs(x - params.mean) / params.scale);
				};
			},

			cdf: function(params) {
				return function(x) {
					if (x < params.mean) {
						return 0.5 * Math.exp((x - params.mean) / params.scale);
					} else if (x >= params.mean) {
						return 1 - 0.5 * Math.exp(-(x - params.mean) / params.scale);
					} else {
						return undefined;
					}
				};
			}
		},

		logarithmic: {
			description: [
				'The logarithmic distribution (also known as the logarithmic series distribution or the log-series distribution) is a discrete probability distribution derived from the Maclaurin series expansion.'
			],

			formulas: [
				'\\mathbf{mgf} = \\frac{\\ln{(1 - p \\exp{(t)})}}{\\ln{(1 - p)}}, t < -\\ln{p}',
				'\\mathbf{pmf} = \\frac{-1}{\\ln{(1 - p)}}\\frac{p^k}{k}',
				'\\mathbf{cdf} = 1 + \\frac{\\mathrm{B}(p; k + 1, 0)}{\\ln{(1 - p)}}'
			],

			discrete: true,

			bounds: function(params) {
				return {
					lower: {
						value: 1,
						closed: true
					},
					upper: {
						value: Infinity,
						closed: true
					}
				};
			},

			params: [
				{
					id: 'p',
					symbol: 'p',
					title: 'Probability',
					min: 0.01,
					max: 0.99,
					step: 0.01,
					value: 0.5
				}
			],

			mgf: function(params) {
				return function(t) {
					return Math.log(1 - params.p * Math.exp(t)) / Math.log(1 - params.p);
				};
			},

			pdf: function(params) {
				return function(k) {
					return -1 / Math.log(1 - params.p) * Math.pow(params.p, k) / k;
				};
			},

			cdf: function(params) {
				return function(k) {
					return Math.h.integral(Math.p.distribution.logarithmic.pdf(params), 0, k);
				};
			}
		},

		logistic: {
			description: [
				'The logistic distribution is a continuous probability distribution. Its cumulative distribution function is the logistic function, which appears in logistic regression and feedforward neural networks. It resembles the normal distribution in shape but has heavier tails (higher kurtosis). The Tukey lambda distribution can be considered a generalization of the logistic distribution since it adds a shape parameter, &lambda; (the Tukey distribution becomes logistic when &lambda; is zero).'
			],

			formulas: [
				'\\mathbf{mgf} = e^{\\mu t}\\mathrm{B}(1 - s t, 1 + s t)',
				'\\mathbf{pdf} = \\frac{e^{-\\frac{x - \\mu}{s}}}{s\\Big(1 + e^{-\\frac{x - \\mu}{s}}\\Big)^2}',
				'\\mathbf{cdf} = \\frac{1}{1 + e^{-\\frac{x - \\mu}{s}}}'
			],

			discrete: false,

			bounds: function(params) {
				return {
					lower: {
						value: -Infinity,
						closed: false
					},
					upper: {
						value: Infinity,
						closed: false
					}
				};
			},

			params: [
				{
					id: 'mu',
					symbol: '&mu;',
					title: 'Location',
					min: -1000,
					max: 1000,
					step: 0.01,
					value: 5
				},
				{
					id: 's',
					symbol: 's',
					title: 'Scale',
					min: 0.01,
					max: 1000,
					step: 0.01,
					value: 1
				}
			],

			mgf: function(params) {
				return function(t) {
					return Math.exp(params.mu * t) * Math.h.beta(1 - params.s * t, 1 + params.s * t);
				};
			},

			pdf: function(params) {
				return function(x) {
					return Math.exp(-(x - params.mu) / params.s) / (params.s * Math.pow(1 + Math.exp(-(x - params.mu) / params.s), 2));
				};
			},

			cdf: function(params) {
				return function(x) {
					return 1 / (1 + Math.exp(-(x - params.mu) / params.s));
				};
			}
		},

		pareto: {
			description: [
				'The Pareto distribution, named after the Italian civil engineer, economist, and sociologist Vilfredo Pareto, is a power law probability distribution that is used in description of social, scientific, geophysical, actuarial, and many other types of observable phenomena.'
			],

			formulas: [
				'\\mathbf{mgf} = \\alpha (-x_m t)^{\\alpha}\\Gamma(-\\alpha, -x_m t), t < 0',
				'\\mathbf{pdf} = \\frac{\\alpha x_m^{\\alpha}}{x^{\\alpha + 1}}, x \\ge x_m',
				'\\mathbf{cdf} = 1 - \\Big(\\frac{x_m}{x}\\Big)^\\alpha, x \\ge x_m'
			],

			discrete: false,

			params: [
				{
					id: 'xm',
					symbol: 'X<sub>m</sub>',
					title: 'Scale',
					min: 0.01,
					max: 1000,
					step: 0.01,
					value: 1
				},
				{
					id: 'a',
					symbol: '&alpha;',
					title: 'Shape',
					min: 1,
					max: 1000,
					step: 0.01,
					value: 2
				}
			],

			bounds: function(params) {
				return {
					lower: {
						value: params.xm,
						closed: true
					},
					upper: {
						value: Infinity,
						closed: true
					}
				};
			},

			mgf: function(params) {
				var o = {};

				o.mean = (params.a > 1) ? Math.h.round(params.a * params.xm / (params.a - 1), 3) : Infinity;
				o.variance = (params.a > 2) ? Math.h.round(Math.pow(params.xm, 2) * params.a / (Math.pow(params.a - 1, 2) * (params.a - 2)), 3) : Infinity;
				o.skewness = (params.a > 3) ? Math.h.round(2 * (1 + params.a) / (params.a - 3) * Math.sqrt((params.a - 2) / params.a), 3) : undefined;
				o.kurtosis = (params.a > 4) ? Math.h.round(6 * (Math.pow(params.a, 3) + Math.pow(params.a, 2) - 6 * params.a - 2) / (params.a * (params.a - 3) * (params.a - 4)), 3) : undefined;

				return o;
			},

			pdf: function(params) {
				return function(x) {
					return params.a * Math.pow(params.xm, params.a) / Math.pow(x, params.a + 1);
				};
			},

			cdf: function(params) {
				return function(x) {
					return Math.h.integral(Math.p.distribution.pareto.pdf(params), 0, x);
				};
			}
		},

		poisson: {
			description: [
				'The Poisson distribution, named after French mathematician Siméon Denis Poisson, is a discrete probability distribution that expresses the probability of a given number of events occurring in a fixed interval of time and/or space if these events occur with a known average rate and independently of the time since the last event. The Poisson distribution can also be used for the number of events in other specified intervals such as distance, area or volume.',
				'For instance, an individual keeping track of the amount of mail they receive each day may notice that they receive an average number of 4 letters per day. As it is reasonable to assume that receiving one piece of mail will not affect the arrival times of future pieces of mail-that pieces of mail from a wide range of sources arrive independently of one another-the number of pieces of mail received per day would obey a Poisson distribution. Other examples might include: the number of phone calls received by a call center per hour, the number of decay events per second from a radioactive source, or the number of taxis passing a particular street corner per hour.'
			],

			formulas: [
				'\\mathbf{mgf} = \\exp{(\\lambda(e^t - 1))}',
				'\\mathbf{pmf} = \\frac{\\lambda^k}{k!}e^{-\\lambda}',
				'\\mathbf{cdf} = e^{-\\lambda}\\sum_{i=0}^{\\left\\lfloor{k}\\right\\rfloor}\\frac{\\lambda^i}{i!}'

				/*cdf = \\frac{\\Gamma(\\left\\lfloor{k + 1}\\right\\rfloor, \\lambda)}{\\left\\lfloor{k}\\right\\rfloor!}*/
			],

			discrete: true,

			bounds: function(params) {
				return {
					lower: {
						value: 0,
						closed: true
					},
					upper: {
						value: Infinity,
						closed: true
					}
				};
			},

			params: [
				{
					id: 'lambda',
					symbol: '&lambda;',
					title: 'Lambda',
					min: 0.01,
					max: 20,
					step: 0.01,
					value: 1
				}
			],

			mgf: function(params) {
				return function(t) {
					return Math.exp(params.lambda * (Math.pow(Math.E, t) - 1));
				};
			},

			pdf: function(params) {
				return function(k) {
					return Math.pow(params.lambda, k) / Math.h.factorial(k) * Math.exp(-params.lambda);
				};
			},

			cdf: function(params) {
				return function(k) {
					return Math.h.integral(Math.p.distribution.poisson.pdf(params), 0, k);
				};
			}
		},

		rayleigh: {
			description: [
				'The Rayleigh distribution is a continuous probability distribution for positive-valued random variables. A Rayleigh distribution is often observed when the overall magnitude of a vector is related to its directional components. One example where the Rayleigh distribution naturally arises is when wind velocity is analyzed into its orthogonal 2-dimensional vector components. Assuming that each component is uncorrelated, normally distributed with equal variance, and zero mean, then the overall wind speed (vector magnitude) will be characterized by a Rayleigh distribution. A second example of the distribution arises in the case of random complex numbers whose real and imaginary components are independently and identically distributed Gaussian with equal variance and zero mean. In that case, the absolute value of the complex number is Rayleigh-distributed.'
			],

			formulas: [
				'\\mathbf{mgf} = 1 + \\sigma t e^{\\sigma^2 t^2 / 2} \\sqrt{\\frac{\\pi}{2}}\\bigg(\\mathrm{erf}{\\bigg(\\frac{\\sigma t}{\\sqrt{2}}\\bigg)} + 1\\bigg)',
				'\\mathbf{pdf} = \\frac{x}{\\sigma^2}e^{-x^2 / 2\\sigma^2}',
				'\\mathbf{cdf} = 1 - e^{-x^2 / 2\\sigma^2}'
			],

			discrete: false,

			bounds: function(params) {
				return {
					lower: {
						value: 0,
						closed: true
					},
					upper: {
						value: Infinity,
						closed: true
					}
				};
			},

			params: [
				{
					id: 'sigma',
					symbol: '&sigma;',
					title: 'Sigma',
					min: 0.01,
					max: 1000,
					step: 0.01,
					value: 2
				}
			],

			mgf: function(params) {
				return {
					mean: Math.h.round(params.sigma * Math.sqrt(Math.PI / 2), 3),
					variance: Math.h.round((4 - Math.PI) / 2 * Math.pow(params.sigma, 2), 3),
					skewness: Math.h.round(2 * Math.sqrt(Math.PI) * (Math.PI - 3) / Math.pow(4 - Math.PI, 3 / 2), 3),
					kurtosis: Math.h.round(-(6 * Math.pow(Math.PI, 2) - 24 * Math.PI + 16) / Math.pow(4 - Math.PI, 2), 3)
				};

				/*return function(t) {
					return 1 + params.sigma * t * Math.exp(Math.pow(params.sigma, 2) * Math.pow(t, 2) / 2) * Math.sqrt(Math.PI / 2) * (Math.h.erf(params.sigma * t / Math.sqrt(2)) + 1);
				};*/
			},

			pdf: function(params) {
				return function(x) {
					return x / Math.pow(params.sigma, 2) * Math.exp(-Math.pow(x, 2) / (2 * Math.pow(params.sigma, 2)));
				};
			},

			cdf: function(params) {
				return function(x) {
					return Math.h.integral(Math.p.distribution.rayleigh.pdf(params), 0, x);
				};
			}
		},

		skellam: {
			description: [
				'The Skellam distribution is the discrete probability distribution of the difference n_1-n_2 of two statistically independent random variables N_1 and N_2 each having Poisson distributions with different expected values mu_1 and mu_2. It is useful in describing the statistics of the difference of two images with simple photon noise, as well as describing the point spread distribution in sports where all scored points are equal, such as baseball, hockey and soccer.',
				'The distribution is also applicable to a special case of the difference of dependent Poisson random variables, but just the obvious case where the two variables have a common additive random contribution which is cancelled by the differencing.'
			],

			formulas: [
				'\\mathbf{mgf} = e^{-(\\mu_1 + \\mu_2) + \\mu_1 e^t + \\mu_2 e^{-t}}',
				'\\mathbf{pmf} = e^{-(\\mu_1 + \\mu_2)}\\bigg(\\frac{\\mu_1}{\\mu_2}\\bigg)^{k/2} I_k(2\\sqrt{\\mu_1 \\mu_2})'
			],

			discrete: true,

			bounds: function(params) {
				return {
					lower: {
						value: -Infinity,
						closed: false
					},
					upper: {
						value: Infinity,
						closed: false
					}
				};
			},

			params: [
				{
					id: 'mean1',
					symbol: '&mu;<sub>1</sub>',
					title: 'Mean 1',
					min: 0,
					max: 1000,
					step: 0.01,
					value: 1
				},
				{
					id: 'mean2',
					symbol: '&mu;<sub>2</sub>',
					title: 'Mean 2',
					min: 0,
					max: 1000,
					step: 0.01,
					value: 3
				}
			],

			mgf: function(params) {
				return function(t) {
					return Math.exp(-(params.mean1 + params.mean2) + params.mean1 * Math.exp(t) + params.mean2 * Math.exp(-t));
				};
			},

			pdf: function(params) {
				return function(k) {
					return Math.exp(-(params.mean1 + params.mean2)) * Math.pow(params.mean1 / params.mean2, k / 2) * Math.h.besselI(Math.abs(k), 2 * Math.sqrt(params.mean1 * params.mean2));
				};
			},

			cdf: function(params) {
				return function(k) {
					return Math.h.integral(Math.p.distribution.skellam.pdf(params), 0, k);
				};
			}
		},

		studentsT: {
			description: [
				'Student\'s t-distribution (or simply the t-distribution) is a family of continuous probability distributions that arise when estimating the mean of a normally distributed population in situations where the sample size is small and population standard deviation is unknown. Whereas a normal distribution describes a full population, t-distributions describe samples drawn from a full population; accordingly, the t-distribution for each sample size is different, and the larger the sample, the more the distribution resembles a normal distribution.',
				'The t-distribution plays a role in a number of widely used statistical analyses, including the Student\'s t-test for assessing the statistical significance of the difference between two sample means, the construction of confidence intervals for the difference between two population means, and in linear regression analysis. The Student\'s t-distribution also arises in the Bayesian analysis of data from a normal family.',
				'If we take a sample of n observations from a normal distribution, then the t-distribution with &nu; = n-1 degrees of freedom can be defined as the distribution of the location of the true mean, relative to the sample mean and divided by the sample standard deviation, after multiplying by the normalizing term sqrt{n}. In this way, the t-distribution can be used to estimate how likely it is that the true mean lies in any given range.',
				'The t-distribution is symmetric and bell-shaped, like the normal distribution, but has heavier tails, meaning that it is more prone to producing values that fall far from its mean. This makes it useful for understanding the statistical behavior of certain types of ratios of random quantities, in which variation in the denominator is amplified and may produce outlying values when the denominator of the ratio falls close to zero. The Student\'s t-distribution is a special case of the generalised hyperbolic distribution.'
			],

			formulas: [
				'\\mathbf{pdf} = \\frac{\\Gamma(\\frac{\\nu + 1}{2})}{\\sqrt{\\nu\\pi}\\Gamma(\\frac{\\nu}{2})}\\Big(1 + \\frac{x^2}{\\nu}\\Big)^{-\\frac{\\nu + 1}{2}}',
				'\\mathbf{cdf} = \\frac{1}{2} + x\\Gamma\\Big(\\frac{\\nu + 1}{2}\\Big)\\times\\frac{2F_1\\big(\\frac{1}{2}, \\frac{\\nu + 1}{2}; \\frac{3}{2}; -\\frac{x^2}{\\nu}\\big)}{\\sqrt{\\nu\\pi}\\Gamma(\\frac{\\nu}{2})}'
			],

			discrete: false,

			bounds: function(params) {
				return {
					lower: {
						value: -Infinity,
						closed: false
					},
					upper: {
						value: Infinity,
						closed: false
					}
				};
			},

			params: [
				{
					id: 'v',
					symbol: 'v',
					title: 'Degrees of freedom',
					min: 1,
					max: 1000,
					step: 1,
					value: 1
				}
			],

			mgf: function(params) {
				var o = {};

				o.mean = (params.v > 1) ? 0 : undefined;
				o.variance = (params.v > 2) ? Math.h.round(params.v / (params.v - 2), 3) : undefined;
				o.skewness = (params.v > 3) ? 0 : undefined;
				o.kurtosis = (params.v > 4) ? Math.h.round(6 / (params.v - 4), 3) : undefined;

				return o;
			},

			pdf: function(params) {
				return function(x) {
					return Math.h.gamma((params.v + 1) / 2) / (Math.sqrt(params.v * Math.PI) * Math.h.gamma(params.v / 2)) * Math.pow(1 + Math.pow(x, 2) / params.v, -(params.v + 1) / 2);
				};
			},

			cdf: function(params) {
				return function(x) {
					return 1 / (1 + Math.exp(-(x - params.mu) / params.s));
				};
			}
		},

		uniform: {
			description: [
				'The continuous uniform distribution or rectangular distribution is a family of symmetric probability distributions such that for each member of the family, all intervals of the same length on the distribution\'s support are equally probable. The support is defined by the two parameters, a and b, which are its minimum and maximum values. The distribution is often abbreviated U(a,b). It is the maximum entropy probability distribution for a random variate X under no constraint other than that it is contained in the distribution\'s support.'
			],

			formulas: [
				'\\mathbf{mgf} = \\left\\{ \\begin{array}{lr} \\frac{e^{t b} - e^{t a}}{t(b - a)} & : t \\ne 0\\\\ 1 & : t = 0 \\end{array} \\right.',
				'\\mathbf{pdf} = \\left\\{ \\begin{array}{lr} \\frac{1}{b - a} & : x \\in [a, b]\\\\ 0 & : \\text{otherwise} \\end{array} \\right.',
				'\\mathbf{cdf} = \\left\\{ \\begin{array}{lr} 0 & : x < a\\\\ \\frac{x - a}{b - a} & : x \\in [a, b)\\\\ 1 & : x \\ge b \\end{array} \\right.'
			],

			discrete: false,

			bounds: function(params) {
				return {
					lower: {
						value: -Infinity,
						closed: true
					},
					upper: {
						value: Infinity,
						closed: true
					}
				};
			},

			params: [
				{
					id: 'a',
					symbol: 'a',
					title: 'Lower Bound',
					min: -1000,
					max: 1000,
					step: 0.01,
					value: 0
				},
				{
					id: 'b',
					symbol: 'b',
					title: 'Upper Bound',
					min: -1000,
					max: 1000,
					step: 0.01,
					value: 10
				}
			],

			mgf: function(params) {
				return function(t) {
					return (t === 0) ? 1 : (Math.exp(t * params.b) - Math.exp(t * params.a)) / (t * (params.b - params.a));
				};
			},

			pdf: function(params) {
				return function(x) {
					if (x >= params.a && x <= params.b) {
						return 1 / (params.b - params.a);
					} else {
						return 0;
					}
				};
			},

			cdf: function(params) {
				return function(x) {
					return Math.h.integral(Math.p.distribution.uniform.pdf(params), 0, x);
				};
			}
		},

		weibull: {
			description: [
				'The Weibull distribution is a continuous probability distribution. It is named after Waloddi Weibull, who described it in detail in 1951, although it was first identified by Fréchet (1927) and first applied by Rosin & Rammler (1933) to describe a particle size distribution. The Weibull distribution is related to a number of other probability distributions; in particular, it interpolates between the exponential distribution and the Rayleigh distribution. If the quantity X is a "time-to-failure", the Weibull distribution gives a distribution for which the failure rate is proportional to a power of time. The shape parameter, k, is that power plus one.'
			],

			formulas: [
				'\\mathbf{mgf} = \\sum_{n=0}^{\\infty}\\frac{t^n\\lambda^n}{n!}\\Gamma(1 + n/k), k \\ge 1',
				'\\mathbf{pdf} = \\left\\{ \\begin{array}{lr} \\frac{k}{\\lambda}\\Big(\\frac{x}{\\lambda}\\Big)^{k - 1} e^{-(x / \\lambda)^k} & : x \\ge 0\\\\ 0 & : x < 0 \\end{array} \\right.',
				'\\mathbf{cdf} = \\left\\{ \\begin{array}{lr} 1 - e^{-(x / \\lambda)^k} & : x \\ge 0\\\\ 0 & : x < 0 \\end{array} \\right.'
			],

			discrete: false,

			bounds: function(params) {
				return {
					lower: {
						value: 0,
						closed: true
					},
					upper: {
						value: Infinity,
						closed: true
					}
				};
			},

			params: [
				{
					id: 'lambda',
					symbol: '&lambda;',
					title: 'Scale',
					min: -1000,
					max: 1000,
					step: 0.01,
					value: 1
				},
				{
					id: 'k',
					symbol: 'k',
					title: 'Shape',
					min: 0.01,
					max: 1000,
					step: 0.01,
					value: 1.5
				}
			],

			mgf: function(params) {
				/*return {
					mean: Math.h.round(params.lambda * Math.h.gamma(1 + 1 / params.k), 3),
					variance: Math.h.round(Math.pow(params.lambda, 2) * (Math.h.gamma(1 + 2 / params.k) - Math.pow(Math.h.gamma(1 + 1 / params.k), 2)), 3),
					skewness: Math.h.round((Math.h.gamma(1 + 3 / params.k) * Math.pow(params.lambda, 3) - 3 * params.lambda * Math.h.gamma(1 + 1 / params.k) * (Math.pow(Math.pow(params.lambda, 2) * (Math.h.gamma(1 + 2 / params.k) - Math.pow(Math.h.gamma(1 + 1 / params.k), 2))), 2) - (Math.pow(params.lambda * Math.h.gamma(1 + 1 / params.k), 3))) / Math.pow(Math.pow(params.lambda, 2) * (Math.h.gamma(1 + 2 / params.k) - Math.pow(Math.h.gamma(1 + 1 / params.k), 2)), 3), 3),
					kurtosis: 0
				};*/

				return function(t) {
					if (params.k >= 1) {
						return Math.h.sum(function(n) {
							return Math.pow(t, n) * Math.pow(params.lambda, n) / Math.h.factorial(n) * Math.h.gamma(1 + n / params.k);
						}, 0, Infinity);
					} else {
						return 0;
					}
				};
			},

			pdf: function(params) {
				return function(x) {
					if (x >= 0) {
						return params.k / params.lambda * Math.pow(x / params.lambda, params.k - 1) * Math.exp(-Math.pow(x / params.lambda, params.k));
					} else {
						return 0;
					}
				};
			},

			cdf: function(params) {
				return function(x) {
					if (x >= 0) {
						return 1 - Math.exp(-Math.pow(x / params.lambda, k));
					} else {
						return 0;
					}
				};
			}
		},

		wigner: {
			description: [
				'The Wigner semicircle distribution, named after the physicist Eugene Wigner, is the probability distribution supported on the interval [-R, R] the graph of whose probability density function f is a semicircle of radius R centered at (0, 0) and then suitably normalized (so that it is really a semi-ellipse).',
				'This distribution arises as the limiting distribution of eigenvalues of many random symmetric matrices as the size of the matrix approaches infinity.',
				'It is a scaled beta distribution, more precisely, if Y is beta distributed with parameters &alpha; = &beta; = 3/2, then X = 2RY - R has the Wigner semicircle distribution.'
			],

			formulas: [
				'\\mathbf{mgf} = 2\\frac{I_1(R t)}{R t}',
				'\\mathbf{pdf} = \\frac{2}{\\pi R^2}\\sqrt{R^2 - x^2}',
				'\\mathbf{cdf} = \\frac{1}{2} + \\frac{x\\sqrt{R^2 - x^2}}{\\pi R^2} + \\frac{\\arcsin\\big(\\frac{x}{R}\\big)}{\\pi}, -R \\le x \\le R'
			],

			discrete: false,

			bounds: function(params) {
				return {
					lower: {
						value: -params.r,
						closed: true
					},
					upper: {
						value: params.r,
						closed: true
					}
				};
			},

			params: [
				{
					id: 'r',
					symbol: 'R',
					title: 'Radius',
					min: 0.01,
					max: 1000,
					step: 0.01,
					value: 1
				}
			],

			mgf: function(params) {
				return {
					mean: 0,
					variance: Math.pow(params.r, 2) / 4,
					skewness: 0,
					kurtosis: -1
				};

				/*return function(t) {
					return 2 * Math.h.besselI(1, params.r * t) / (params.r * t);
				};*/
			},

			pdf: function(params) {
				return function(x) {
					return 2 / (Math.PI * Math.pow(params.r, 2)) * Math.sqrt(Math.pow(params.r, 2) - Math.pow(x, 2));
				};
			},

			cdf: function(params) {
				return function(x) {
					return Math.h.integral(Math.p.distribution.wigner.pdf(params), 0, x);
				};
			}
		},

		zeta: {
			description: [
				'The zeta distribution is a discrete probability distribution. The Riemann zeta function being the sum of all term k^{-s} for integer k, it appears thus as the normalization of the Zipf distribution. Indeed the terms "Zipf distribution" and the "zeta distribution" are often used interchangeably. But note that while the Zeta distribution is a probability distribution by itself, it is not associated to the Zipf\'s law with same exponent.'
			],

			formulas: [
				'\\mathbf{mgf} = \\frac{\\mathrm{Li}_s(e^t)}{\\zeta(s)}',
				'\\mathbf{pmf} = \\frac{1/k^s}{\\zeta(s)}',
				'\\mathbf{cdf} = \\frac{H_{k,s}}{\\zeta(s)}'
			],

			discrete: true,

			bounds: function(params) {
				return {
					lower: {
						value: 0,
						closed: false
					},
					upper: {
						value: Infinity,
						closed: false
					}
				};
			},

			params: [
				{
					id: 's',
					symbol: 's',
					title: 's',
					min: 3,
					max: 1000,
					step: 1,
					value: 3
				}
			],

			mgf: function(params) {
				return function(t) {
					return 1 / Math.h.zeta(params.s) * Math.h.sum(function(k) {
						return Math.exp(t * k) / Math.pow(k, params.s);
					}, 1, Infinity);
				};
			},

			pdf: function(params) {
				return function(k) {
					return (1 / Math.pow(k, params.s)) / Math.h.zeta(params.s);
				};
			},

			cdf: function(params) {
				return function(k) {
					return Math.h.integral(Math.p.distribution.zeta.pdf(params), 0, k);
				};
			}
		}
	}
};