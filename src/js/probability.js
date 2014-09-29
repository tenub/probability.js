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

		gaussian: {

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

		}

	}

};