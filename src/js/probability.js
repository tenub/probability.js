/**
 * issues: pareto (param range), skellam (var range), inverse gaussian, zeta, rayleigh (kurtosis)
 */

/**
 * @namespace
 * @property {object} moments - standard moment definitions
 * @property {function} moments.mean - first moment
 * @property {function} moments.variance - second moment
 * @property {function} moments.skewness - third moment
 * @property {function} moments.kurtosis - fourth moment
 *
 * @property {object} distribution - defined commonly used distributions
 * @property {object} distribution.(distribution) - contains standard statistics specified below for a particular distribution
 * @property {boolean} distribution.distribution.discrete - determines if distribution is discrete or continuous
 * @property {function} distribution.distribution.bounds - define distribution bounds for its variable
 * @property {object} distribution.distribution.params - contains values used in generating html input
 * @property {function|object} distribution.distribution.mgf - specified moment generating function returns a function of parameters or an object containing hard-coded standard moment equations
 * @property {function} distribution.distribution.pdf - probability distribution function returns a function of its variable using specified distribution parameters
 * @property {function} distribution.distribution.cdf - cumulative distribution function returns a function of its variable using specified distribution parameters and a numerical integration helper function
 */
Math.p = {

	/**
	 * call method to generate distribution plots based on parameters
	 *
	 * @param {string} distrType - distribution type as string
	 * @param {object} params - statistical parameters object
	 * @param {object} moments - moments object generated via moment-generating function
	 * @return {object} object of pdf and cdf arrays containing x-y value pairs for plotting
	 */
	buildDF: function(distrType, params, moments) {

		var distr = { pdf: [], cdf: [] },
			inc = (Math.p.distribution[distrType].discrete) ? 1 : Math.sqrt(moments.variance) / 100;

		if (isNaN(inc) || inc > 99999) { inc = 0.01; }

		//moments.mean = moments.mean || undefined;
		//moments.variance = moments.variance || undefined;

		distr.pdf = Math.p.generatePDF(distrType, params, moments, -inc).concat(Math.p.generatePDF(distrType, params, moments, inc));

		distr.pdf.sort(function(a, b) {
			if (a.x < b.x) { return -1; }
			if (a.x > b.x) { return 1; }
			return 0;
		});

		distr.cdf = Math.p.generateCDF(distr.pdf, inc);

		return distr;

	},

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
	generatePDF: function(distrType, params, moments, inc) {

		var pdf = [],
			i = 0,
			sum = 0,
			start = (inc < 0) ? moments.mean - inc : moments.mean,
			value;

		if (Math.p.distribution[distrType].discrete === true) { start = Math.floor(start); }
		if (typeof moments.mean === 'undefined') { start = 0; }

		while (Math.abs(start - i) <= 10 * moments.variance || i < 99999) {

			value = Math.p.distribution[distrType].pdf(params)(start - i);

			if (isNaN(i / inc) || isNaN(value) || (!isNaN(value) && ((value !== 0 && value <= 1E-5) || value <= 0))) { break; }

			if (Math.h.inBounds(start - i, Math.p.distribution[distrType].bounds(params)) && !isNaN(value)) { pdf.push({ x: start - i, y: value }); }

			i += inc;

		}

		return pdf;

	},

	/**
	 * generate CDF based on summation of PDF values
	 *
	 * @param {array} pdf - distribution array
	 * @return {array} array of objects containing x-y value pairs
	 */
	generateCDF: function(pdf, inc) {

		var cdf = [],
			i = 0,
			sum = 0;

		for (i = 0, l = pdf.length; i < l; i++) {

			sum += pdf[i].y;

			cdf.push({ x: pdf[i].x, y: sum * inc });

		}

		return cdf;

	},

	// define moments
	moments: {

		mean: function(f) {

			return Math.h.round(Math.h.derivative(f, 1, 0), 3);

		},

		variance: function(f) {

			return Math.h.round(Math.h.derivative(f, 2, 0) - Math.pow(Math.h.derivative(f, 1, 0), 2), 3);

		},

		skewness: function(f) {

			return Math.h.round((Math.h.derivative(f, 3, 0) - 3 * Math.h.derivative(f, 1, 0) * Math.h.derivative(f, 2, 0) + 2 * Math.pow(Math.h.derivative(f, 1, 0), 3)) / Math.pow(Math.h.derivative(f, 2, 0) - Math.pow(Math.h.derivative(f, 1, 0), 2), 1.5), 3);

		},

		kurtosis: function(f) {

			return Math.h.round((Math.h.derivative(f, 4, 0) - 4 * Math.h.derivative(f, 1, 0) * Math.h.derivative(f, 3, 0) + 6 * Math.h.derivative(f, 2, 0) * Math.pow(Math.h.derivative(f, 1, 0), 2) - 3 * Math.pow(Math.h.derivative(f, 1, 0), 4)) / Math.pow(Math.h.derivative(f, 2, 0) - Math.pow(Math.h.derivative(f, 1, 0), 2), 2) - 3, 3);

		}

	},

	// define distributions
	distribution: {

		uniform: {

			discrete: false,

			bounds: function(params) {

				return { lower: { value: -Infinity, closed: true }, upper: { value: Infinity, closed: true } };

			},

			params: [
				{ id: 'a', symbol: 'a', title: 'Lower Bound', min: -1000, max: 1000, step: 0.01, value: 0 },
				{ id: 'b', symbol: 'b', title: 'Upper Bound', min: -1000, max: 1000, step: 0.01, value: 10 }
			],

			mgf: function(params) {

				return function(t) {

					return (t === 0) ? 1 : (Math.exp(t * params.b) - Math.exp(t * params.a)) / (t * (params.b - params.a));

				};

			},

			pdf: function(params) {

				return function(x) {

					if (x >= params.a && x <= params.b) { return 1 / (params.b - params.a); }
					else { return 0; }

				};

			},

			cdf: function(params) {

				return function(x) {

					return Math.h.integral(Math.p.distribution.uniform.pdf(params), 0, x);

				};

			}

		},

		binomial: {

			discrete: true,

			bounds: function(params) {

				return { lower: { value: 0, closed: true }, upper: { value: Infinity, closed: true } };

			},

			params: [
				{ id: 'p', symbol: 'p', title: 'Probability', min: 0, max: 1, step: 0.01, value: 0.5 },
				{ id: 'n', symbol: 'n', title: 'Trials', min: 0, max: 1000, step: 1, value: 40 }
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

		geometric: {

			discrete: true,

			bounds: function(params) {

				return { lower: { value: 0, closed: true }, upper: { value: Infinity, closed: true } };

			},

			params: [
				{ id: 'p', symbol: 'p', title: 'Probability', min: 0.01, max: 1, step: 0.01, value: 0.5 }
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

		logarithmic: {

			discrete: true,

			bounds: function(params) {

				return { lower: { value: 1, closed: true }, upper: { value: Infinity, closed: true } };

			},

			params: [
				{ id: 'p', symbol: 'p', title: 'Probability', min: 0.01, max: 0.99, step: 0.01, value: 0.5 }
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

		pareto: {

			discrete: false,

			params: [
				{ id: 'xm', symbol: '', title: 'X_m', min: 0.01, max: 1000, step: 0.01, value: 1 },
				{ id: 'a', symbol: '', title: 'Alpha', min: 1.01, max: 1000, step: 0.01, value: 2 }
			],

			bounds: function(params) {

				return { lower: { value: params.xm, closed: true }, upper: { value: Infinity, closed: true } };

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

			discrete: true,

			bounds: function(params) {

				return { lower: { value: 0, closed: true }, upper: { value: Infinity, closed: true } };

			},

			params: [
				{ id: 'lambda', symbol: 'u{03BB}', title: 'Lambda', min: 0.01, max: 20, step: 0.01, value: 1 }
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

		skellam: {

			discrete: true,

			bounds: function(params) {

				return { lower: { value: -Infinity, closed: false }, upper: { value: Infinity, closed: false } };

			},

			params: [
				{ id: 'mean1', symbol: 'u{03BC}_1', title: 'Mean 1', min: 0, max: 1000, step: 0.01, value: 1 },
				{ id: 'mean2', symbol: 'u{03BC}_2', title: 'Mean 2', min: 0, max: 1000, step: 0.01, value: 3 }
			],

			mgf: function(params) {

				return function(t) {

					return Math.exp(-(params.mean1 + params.mean2) + params.mean1 * Math.exp(t) + params.mean2 * Math.exp(-t));

				};

			},

			pdf: function(params) {

				return function(k) {

					return Math.exp(-(params.mean1 + params.mean2)) * Math.pow(params.mean1 / params.mean2, k / 2) * Math.h.bessel(k, 1)(2 * Math.sqrt(params.mean1 * params.mean2));

				};

			},

			cdf: function(params) {

				return function(k) {

					return Math.h.integral(Math.p.distribution.skellam.pdf(params), 0, k);

				};

			}

		},

		exponential: {

			discrete: false,

			bounds: function(params) {

				return { lower: { value: 0, closed: true }, upper: { value: Infinity, closed: true } };

			},

			params: [
				{ id: 'lambda', symbol: 'u{03BB}', title: 'Lambda', min: 0.01, max: 50, step: 0.01, value: 0.5 }
			],

			mgf: function(params) {

				return function(t) {

					if (t < params.lambda) { return Math.pow(1 - t / params.lambda, -1); }
					else { return 0; }

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

		gaussian: {

			discrete: false,

			bounds: function(params) {

				return { lower: { value: -Infinity, closed: true }, upper: { value: Infinity, closed: true } };

			},

			params: [
				{ id: 'mean', symbol: 'u{03BC}', title: 'Mean', min: -10000, max: 10000, step: 0.01, value: 100 },
				{ id: 'std', symbol: 'u{03C3}', title: 'Standard Deviation', min: 0.01, max: 10000, step: 0.01, value: 50 }
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

		inv_gaussian: {

			discrete: false,

			bounds: function(params) {

				return { lower: { value: 0, closed: false }, upper: { value: Infinity, closed: true } };

			},

			params: [
				{ id: 'shape', symbol: 'u{03BB}', title: 'Shape', min: 0.01, max: 100, step: 0.01, value: 1 },
				{ id: 'mean', symbol: 'u{03BC}', title: 'Mean', min: 0.01, max: 100, step: 0.01, value: 1 }
			],

			mgf: function(params) {

				return function(t) {

					return Math.exp(params.shape / params.mean) * (1 - Math.sqrt(1 - 2 * Math.pow(params.mean, 2) * t / params.shape));

				};

			},

			pdf: function(params) {

				return function(x) {

					return Math.sqrt(params.shape / (2 * Math.PI * Math.pow(x, 3))) * Math.exp(-params.shape * Math.pow(x - params.mean, 2) / (2 * Math.pow(params.mean, 2) * x));

				};

			},

			cdf: function(params) {

				return function(x) {

					return Math.h.integral(Math.p.distribution.inv_gaussian.pdf(params), 0, x);

				};

			}

		},

		zeta: {

			discrete: true,

			bounds: function(params) {

				return { lower: { value: 0, closed: false }, upper: { value: Infinity, closed: false } };

			},

			params: [
				{ id: 's', symbol: 's', title: 's', min: 2, max: 1000, step: 1, value: 2 }
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

		},

		beta: {

			discrete: false,

			bounds: function(params) {

				return { lower: { value: 0, closed: true }, upper: { value: 1, closed: true } };

			},

			params: [
				{ id: 'a', symbol: 'u{0251}', title: 'Alpha', min: 0.01, max: 1000, step: 0.01, value: 2 },
				{ id: 'b', symbol: 'u{03B2}', title: 'Beta', min: 0.01, max: 1000, step: 0.01, value: 2 }
			],

			mgf: function(params) {

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

		gamma: {

			discrete: false,

			bounds: function(params) {

				return { lower: { value: 0, closed: true }, upper: { value: Infinity, closed: true } };

			},

			params: [
				{ id: 'k', symbol: 'k', title: 'k', min: 0.01, max: 1000, step: 0.01, value: 3 },
				{ id: 'theta', symbol: 'u{03B8}', title: 'Theta', min: 0.01, max: 1000, step: 0.01, value: 2 }
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

		rayleigh: {

			discrete: false,

			bounds: function(params) {

				return { lower: { value: 0, closed: true }, upper: { value: Infinity, closed: true } };

			},

			params: [
				{ id: 'sigma', symbol: 'u{03C3}', title: 'Sigma', min: 0.01, max: 1000, step: 0.01, value: 2 }
			],

			mgf: function(params) {

				return function(t) {

					return 1 + params.sigma * t * Math.exp(Math.pow(params.sigma, 2) * Math.pow(t, 2) / 2) * Math.sqrt(Math.PI / 2) * (Math.h.erf(params.sigma * t / Math.sqrt(2)) + 1);

				};

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

		gumbel: {

			discrete: false,

			bounds: function(params) {

				return { lower: { value: -Infinity, closed: true }, upper: { value: Infinity, closed: true } };

			},

			params: [
				{ id: 'mu', symbol: 'u{03BC}', title: 'Location', min: -1000, max: 1000, step: 0.01, value: 1 },
				{ id: 'beta', symbol: 'u{03B2}', title: 'Scale', min: 0.01, max: 1000, step: 0.01, value: 2 }
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

		chi: {

			discrete: false,

			bounds: function(params) {

				return { lower: { value: 0, closed: true }, upper: { value: Infinity, closed: true } };

			},

			params: [
				{ id: 'k', symbol: 'k', title: 'k', min: 0, max: 1000, step: 1, value: 1 },
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

					return Math.h.integral(Math.p.distribution.chi.pdf(params), 0, x);

				};

			}

		},

		weibull: {

			discrete: false,

			bounds: function(params) {

				return { lower: { value: 0, closed: true }, upper: { value: Infinity, closed: true } };

			},

			params: [
				{ id: 'lambda', symbol: 'u{03BB}', title: 'Scale', min: -1000, max: 1000, step: 0.01, value: 1 },
				{ id: 'k', symbol: 'k', title: 'Shape', min: 0.01, max: 1000, step: 0.01, value: 1.5 }
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
					}
					else { return 0; }

				};

			},

			pdf: function(params) {

				return function(x) {

					if (x >= 0) { return params.k / params.lambda * Math.pow(x / params.lambda, params.k - 1) * Math.exp(-Math.pow(x / params.lambda, params.k)); }
					else { return 0; }

				};

			},

			cdf: function(params) {

				return function(x) {

					if (x >= 0) { return 1 - Math.exp(-Math.pow(x / params.lambda, k)); }
					else { return 0; }

				};

			}

		},

		cauchy: {

			discrete: false,

			bounds: function(params) {

				return { lower: { value: -Infinity, closed: false }, upper: { value: Infinity, closed: false } };

			},

			params: [
				{ id: 'x0', symbol: 'x_0', title: 'x0', min: -1000, max: 1000, step: 0.01, value: 0 },
				{ id: 'gamma', symbol: 'u{03B3}', title: 'y', min: 0.01, max: 1000, step: 0.01, value: 0.5 }
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

		fisher_snedecor: {

			discrete: false,

			bounds: function(params) {

				return { lower: { value: 0, closed: true }, upper: { value: Infinity, closed: false } };

			},

			params: [
				{ id: 'd1', symbol: 'd_1', title: 'd1', min: 0, max: 1000, step: 0.01, value: 10 },
				{ id: 'd2', symbol: 'd_2', title: 'd2', min: 0, max: 1000, step: 0.01, value: 10 }
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

					return Math.sqrt(Math.pow(params.d1 * x, params.d1) * Math.pow(params.d2, params.d2) / Math.pow(params.d1 * x + params.d2, params.d1 + params.d2)) / (x * Math.h.beta(params.d1 / 2, params.d2 / 2));

				};

			},

			cdf: function(params) {

				return function(x) {

					return Math.h.integral(Math.p.distribution.fisher_snedecor.pdf(params), 0, x);

				};

			}

		},

		irwin_hall: {

			discrete: false,

			bounds: function(params) {

				return { lower: { value: 0, closed: true }, upper: { value: params.n, closed: true } };

			},

			params: [
				{ id: 'n', symbol: 'n', title: 'n', min: 0, max: 1000, step: 1, value: 2 }
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

					return Math.h.integral(Math.p.distribution.irwin_hall.pdf(params), 0, x);

				};

			}

		},

		wigner: {

			discrete: false,

			bounds: function(params) {

				return { lower: { value: -params.r, closed: true }, upper: { value: params.r, closed: true } };

			},

			params: [
				{ id: 'r', symbol: 'R', title: 'R', min: 0.01, max: 1000, step: 0.01, value: 1 },
			],

			mgf: function(params) {

				return function(t) {

					return 2 * Math.h.bessel(1, 1)(params.r * t) / (params.r * t);

				};

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

		gompertz: {

			discrete: false,

			bounds: function(params) {

				return { lower: { value: 0, closed: true }, upper: { value: Infinity, closed: false } };

			},

			params: [
				{ id: 'n', symbol: 'u{03B7}', title: 'n', min: 0.01, max: 1000, step: 0.001, value: 1 },
				{ id: 'b', symbol: 'b', title: 'b', min: 0.01, max: 1000, step: 0.001, value: 2.322 }
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

		laplace: {

			discrete: false,

			bounds: function(params) {

				return { lower: { value: -Infinity, closed: false }, upper: { value: Infinity, closed: false } };

			},

			params: [
				{ id: 'mean', symbol: 'u{03BC}', title: 'Location', min: -1000, max: 1000, step: 0.01, value: 0 },
				{ id: 'scale', symbol: 'b', title: 'Scale', min: 0.01, max: 1000, step: 0.01, value: 1 }
			],

			mgf: function(params) {

				return function(t) {

					return (Math.abs(t) < 1 / params.scale) ? Math.exp(params.mean * t) / (1 + Math.pow(params.scale, 2) * Math.pow(t, 2)) : undefined;

				};

			},

			pdf: function(params) {

				return function(x) {

					return 1 / (2 * params.scale) * Math.exp(-Math.abs(x - params.mean) / params.scale);

				};

			},

			cdf: function(params) {

				return function(x) {

					if (x < params.mean) { return 0.5 * Math.exp((x - params.mean) / params.scale); }
					else if (x >= params.mean) { return 1 - 0.5 * Math.exp(-(x - params.mean) / params.scale); }
					else { return undefined; }

				};

			}

		}

	}

};