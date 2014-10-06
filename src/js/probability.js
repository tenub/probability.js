Math.p = {

	// Define moments
	moments: {

		mean: function(f, t) {

			return Math.round(Math.h.derivative(f, 1, t) * 1000) / 1000;

		},

		variance: function(f, t) {

			return Math.round((Math.h.derivative(f, 2, t) - Math.pow(Math.p.moments.mean(f, t), 2)) * 1000) / 1000;

		},

		skewness: function(f, t) {

			return Math.round(((Math.h.derivative(f, 3, t) - 3 * Math.p.moments.mean(f, t) * Math.p.moments.variance(f, t) - Math.pow(Math.p.moments.mean(f, t), 3)) / Math.pow(Math.p.moments.variance(f, t), 1.5)) * 1000) / 1000;

		},

		kurtosis: function(f, t) {

			return Math.round((Math.h.derivative(f, 4, t) / Math.pow(Math.p.moments.variance(f, t), 2) - 3) * 1000) / 1000;

		}

	},

	// Define distributions
	distribution: {

		binomial: {

			discrete: true,

			bounds: [0, Infinity],

			params: [
				{ id: 'p', title: 'Probability', min: 0, max: 1, step: 0.05, value: 0.5 },
				{ id: 'n', title: 'Trials', min: 0, max: 100, step: 1, value: 40 }/*,
				{ id: 'k', title: 'Successes', min: 0, max: 100, step: 1, value: 20 }*/
			],

			mgf: function(params) {

				return function(t) {

					return Math.pow((1 - params.p + params.p * Math.exp(t)), params.n);

				};	// (1-p+p*e^t)^n

			},

			pdf: function(params) {

				return function(k) {

					return Math.h.choose(params.n, k) * Math.pow(params.p, k) * Math.pow((1 - params.p), (params.n - k));

				};	// (n k)*p^k*(1-p)^(n-k)

			},

			cdf: function(params) {

				return function(k) {

					return Math.h.integral(Math.p.distribution.binomial.pdf(params), 0, k);

				};	// I_(1-p)(n-k, 1+k)

			}

		},

		geometric: {

			discrete: true,

			bounds: [0, Infinity],

			params: [
				{ id: 'p', title: 'Probability', min: 0, max: 1, step: 0.05, value: 0.5 },
				{ id: 'n', title: 'Trials', min: 0, max: 100, step: 1, value: 40 }
			],

			mgf: function(params) {

				return function(t) {

					return params.p / (1 - (1 - params.p) * Math.exp(t));

				};	// p/(1-(1-p)*e^t)

			},

			pdf: function(params) {

				return function(k) {

					return Math.pow(1 - params.p, k) * params.p;

				};	// (1-p)^k*p

			},

			cdf: function(params) {

				return function(k) {

					return Math.h.integral(Math.p.distribution.geometric.pdf(params), 0, k);

				};	// 1-(1-p)^(k+1)

			}

		},

		poisson: {

			discrete: true,

			bounds: [0, Infinity],

			params: [
				{ id: 'lambda', title: 'Lambda', min: 0, max: 20, step: 1, value: 1 }
			],

			mgf: function(params) {

				return function(t) {

					return Math.exp(params.lambda * (Math.pow(Math.E, t) - 1));

				};	// e^(l*(e^t-1))

			},

			pdf: function(params) {

				return function(k) {

					return Math.pow(params.lambda, k) / Math.h.factorial(k) * Math.exp(-params.lambda);

				};	// l^k/k!*e^-l

			},

			cdf: function(params) {

				return function(k) {

					return Math.h.integral(Math.p.distribution.poisson.pdf(params), 0, k);

				};	// r([k+1],l)/[k]!

			}

		},

		exponential: {

			discrete: false,

			bounds: [0, Infinity],

			params: [
				{ id: 'lambda', title: 'Lambda', min: 0, max: 3, step: 0.1, value: 0.5 }
			],

			mgf: function(params) {

				return function(t) {

					if (t < params.lambda) {
						return Math.pow(1 - t / params.lambda, -1);
					}

					return 0;

				};	// (1-t/l)^(-1), t<l

			},

			pdf: function(params) {

				return function(x) {

					return params.lambda * Math.exp(-params.lambda * x);

				};	// l*e^(-l*x)

			},

			cdf: function(params) {

				return function(x) {

					return Math.h.integral(Math.p.distribution.exponential.pdf(params), 0, x);

				};	// 1-e^(-l*x)

			}

		},

		gaussian: {

			discrete: false,

			bounds: [-Infinity, Infinity],

			params: [
				{ id: 'mean', title: 'Mean', min: -10000, max: 10000, step: 0.05, value: 100 },
				{ id: 'std', title: 'Standard Deviation', min: -10000, max: 10000, step: 0.05, value: 50 }
			],

			mgf: function(params) {

				return function(t) {

					return Math.exp(params.mean * t + 0.5 * Math.pow(params.std, 2) * Math.pow(t, 2));

				};	// exp(u*t+.5*o^2*t^2)

			},

			pdf: function(params) {

				return function(x) {

					return 1 / (params.std * Math.pow(2 * Math.PI, 0.5)) * Math.exp(-Math.pow(x - params.mean, 2) / (2 * Math.pow(params.std, 2)));

				};	// 1/(o*(2*pi)^.5)*exp(-(x-u)^2/(2*o^2))

			},

			cdf: function(params) {

				return function(x) {

					return Math.h.integral(Math.p.distribution.gaussian.pdf(params), 0, x);

				};

			}

		},

		gamma: {

			discrete: false,

			bounds: [0, Infinity],

			params: [
				{ id: 'k', title: 'k', min: 0, max: 1000, step: 0.05, value: 3 },
				{ id: 'theta', title: 'Theta', min: 0, max: 1000, step: 0.05, value: 2 }
			],

			mgf: function(params) {

				return function(t) {

					return Math.pow((1 - params.theta * t), -params.k);

				};	// (1-th*t)^(-k), t<1/th

			},

			pdf: function(params) {

				return function(x) {

					return 1 / (Math.h.gamma(params.k) * Math.pow(params.theta, params.k)) * Math.pow(x, params.k - 1) * Math.exp(-x / params.theta);

				};	// 1/(gamma(k)*th^k)*x^(k-1)*e^(-x/th)

			},

			cdf: function(params) {

				return function(x) {

					return Math.h.integral(Math.p.distribution.gamma.pdf(params), 0, x);

				};

			}

		}

	}

};