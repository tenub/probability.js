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

	// define moments
	moments: {

		mean: function(f, t) {

			return Math.h.round(Math.h.derivative(f, 1, t), 3);

		},

		variance: function(f, t) {

			return Math.h.round(((Math.h.derivative(f, 2, t) - Math.pow(Math.p.moments.mean(f, t), 2))), 3);

		},

		skewness: function(f, t) {

			return Math.h.round(((Math.h.derivative(f, 3, t) - 3 * Math.p.moments.mean(f, t) * Math.p.moments.variance(f, t) - Math.pow(Math.p.moments.mean(f, t), 3)) / Math.pow(Math.p.moments.variance(f, t), 1.5)), 3);

		},

		kurtosis: function(f, t) {

			return Math.h.round((Math.h.derivative(f, 4, t) / Math.pow(Math.p.moments.variance(f, t), 2) - 3), 3);

		}

	},

	// define distributions
	distribution: {

		uniform: {

			discrete: false,

			bounds: function(params) {

				return [-Infinity, Infinity];

			},

			params: [
				{ id: 'a', title: 'Lower Bound', min: -1000, max: 1000, step: 0.01, value: 0 },
				{ id: 'b', title: 'Upper Bound', min: -1000, max: 1000, step: 0.01, value: 10 }
			],

			mgf: function(params) {

				return {

					mean: Math.h.round(1 / 2 * (params.a + params.b), 3),

					variance: Math.h.round(1 / 12 * Math.pow(params.b - params.a, 2), 3),

					skewness: 0,

					kurtosis: -6 / 5

				};

			},

			pdf: function(params) {

				return function(x) {

					if (x >= params.a && x <= params.b) { return 1 / (params.b - params.a); }
					else { return 0; }

				};

			},

			cdf: function(params) {

				return function() {

					return Math.h.integral(Math.p.distribution.uniform.pdf(params), params.a, params.b);

				};

			}

		},

		binomial: {

			discrete: true,

			bounds: function(params) {

				return [0, Infinity];

			},

			params: [
				{ id: 'p', title: 'Probability', min: 0, max: 1, step: 0.01, value: 0.5 },
				{ id: 'n', title: 'Trials', min: 0, max: 1000, step: 1, value: 40 }
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

				return [0, Infinity];

			},

			params: [
				{ id: 'p', title: 'Probability', min: 0.01, max: 1, step: 0.01, value: 0.5 }
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

				return [1, Infinity];

			},

			params: [
				{ id: 'p', title: 'Probability', min: 0.01, max: 0.99, step: 0.01, value: 0.5 }
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
				{ id: 'xm', title: 'X_m', min: 0.01, max: 1000, step: 0.01, value: 1 },
				{ id: 'a', title: 'Alpha', min: 0.01, max: 1000, step: 0.01, value: 1 }
			],

			bounds: function(params) {

				return [params.xm, Infinity];

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

				return [0, Infinity];

			},

			params: [
				{ id: 'lambda', title: 'Lambda', min: 0.01, max: 20, step: 0.01, value: 1 }
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

		exponential: {

			discrete: false,

			bounds: function(params) {

				return [0, Infinity];

			},

			params: [
				{ id: 'lambda', title: 'Lambda', min: 0.01, max: 50, step: 0.01, value: 0.5 }
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

				return [-Infinity, Infinity];

			},

			params: [
				{ id: 'mean', title: 'Mean', min: -10000, max: 10000, step: 0.01, value: 100 },
				{ id: 'std', title: 'Standard Deviation', min: 0.01, max: 10000, step: 0.01, value: 50 }
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

		beta: {

			discrete: false,

			bounds: function(params) {

				return [0, 1];

			},

			params: [
				{ id: 'a', title: 'Alpha', min: 0.01, max: 1000, step: 0.01, value: 2 },
				{ id: 'b', title: 'Beta', min: 0.01, max: 1000, step: 0.01, value: 2 }
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

				return [0, Infinity];

			},

			params: [
				{ id: 'k', title: 'k', min: 0.01, max: 1000, step: 0.01, value: 3 },
				{ id: 'theta', title: 'Theta', min: 0.01, max: 1000, step: 0.01, value: 2 }
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

		rayleigh : {

			discrete: false,

			bounds: function(params) {

				return [0, Infinity];

			},

			params: [
				{ id: 'sigma', title: 'Sigma', min: 0.01, max: 1000, step: 0.01, value: 2 }
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

		gumbel : {

			discrete: false,

			bounds: function(params) {

				return [-Infinity, Infinity];

			},

			params: [
				{ id: 'mu', title: 'Location', min: -1000, max: 1000, step: 0.01, value: 1 },
				{ id: 'beta', title: 'Scale', min: 0.01, max: 1000, step: 0.01, value: 2 }
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

		chi : {

			discrete: false,

			bounds: function(params) {

				return [0, Infinity];

			},

			params: [
				{ id: 'k', title: 'k', min: 0, max: 1000, step: 1, value: 1 },
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

		weibull : {

			discrete: false,

			bounds: function(params) {

				return [0, Infinity];

			},

			params: [
				{ id: 'lambda', title: 'Scale', min: -1000, max: 1000, step: 0.01, value: 1 },
				{ id: 'k', title: 'Shape', min: 0.01, max: 1000, step: 0.01, value: 2 }
			],

			mgf: function(params) {

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

					if (x >= 0) { return params.k / params.lambda * Math.pow(x / params.lambda, k - 1) * Math.exp(-Math.pow(x / params.lambda, k)); }
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

	}

};