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

			bounds: [0, Infinity],

			params: [
				{ id: 'a', title: 'Lower Bound', min: 0, max: 10000, step: 0.05, value: 0 },
				{ id: 'b', title: 'Upper Bound', min: 0, max: 10000, step: 1, value: 10 }
			],

			mgf: function(params) {

				return {

					mean: Math.h.round(1 / 2 * (params.a + params.b), 3),

					variance: Math.h.round(1 / 12 * Math.pow(params.b - params.a, 2), 3),

					skewness: 0,

					kurtosis: -6 / 5

				};

				/*return function(t) {

					return (Math.exp(params.a * t) - Math.exp((params.b + 1) * t)) / ((params.b - params.a + 1) * (1 - Math.exp(t)));

				};*/	// (e^(a*t)-e^((b+1)*t))/n*(1-e^t)

			},

			pdf: function(params) {

				return function(x) {

					if (x >= params.a && x <= params.b) {

						return 1 / (params.b - params.a);

					} else {

						return 0;

					}

				};	// 1/n

			},

			cdf: function(params) {

				return function() {

					return Math.h.integral(Math.p.distribution.uniform.pdf(params), params.a, params.b);

				};	// (floor(k) - a + 1) / n

			}

		},

		binomial: {

			discrete: true,

			bounds: [0, Infinity],

			params: [
				{ id: 'p', title: 'Probability', min: 0, max: 1, step: 0.05, value: 0.5 },
				{ id: 'n', title: 'Trials', min: 0, max: 100, step: 1, value: 40 }
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

		logarithmic: {

			discrete: true,

			bounds: [1, Infinity],

			params: [
				{ id: 'p', title: 'Probability', min: 0, max: 1, step: 0.01, value: 0.5 }
			],

			mgf: function(params) {

				return function(t) {

					return Math.log(1 - params.p * Math.exp(t)) / Math.log(1 - params.p);

				};	// ln(1-p*exp(t))/ln(1-p), t<-ln(p)

			},

			pdf: function(params) {

				return function(k) {

					return -1 / Math.log(1 - params.p) * Math.pow(params.p, k) / k;

				};	// -1/ln(1-p)*p^k/k

			},

			cdf: function(params) {

				return function(k) {

					return Math.h.integral(Math.p.distribution.logarithmic.pdf(params), 0, k);

				};	// 1+B(p;k+1,0)/ln(1-p)

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

		beta: {

			discrete: false,

			bounds: [0, 1],

			params: [
				{ id: 'a', title: 'Alpha', min: 0, max: 1000, step: 0.05, value: 2 },
				{ id: 'b', title: 'Beta', min: 0, max: 1000, step: 0.05, value: 2 }
			],

			mgf: function(params) {

				return {

					mean: Math.h.round((params.a / (params.a + params.b)), 3),

					variance: Math.h.round((params.a * params.b / (Math.pow(params.a + params.b, 2) * (params.a + params.b + 1))), 3),

					skewness: Math.h.round((2 * (params.b - params.a) * Math.sqrt(params.a + params.b + 1) / ((params.a + params.b + 2) * Math.sqrt(params.a * params.b))), 3),

					kurtosis: Math.h.round((6 * (Math.pow(params.a - params.b, 2) * (params.a + params.b + 1) - params.a * params.b * (params.a + params.b + 2)) / (params.a * params.b * (params.a + params.b + 2) * (params.a + params.b + 3))), 3)

				};

				/*return function(t) {

					return 1 + Math.h.sum(function(k) {
						return Math.h.product_sum(function(r) {
							return (params.a + r) / (params.a + params.b + r);
						}, 0, k - 1) * Math.pow(t, k / Math.h.factorial(k), 1, Infinity);
					});

				};*/	// 1+sum_(k,1,inf)(prod_(r,0,k-1)((a+r)/(a+b+r))*t^k/k!)

			},

			pdf: function(params) {

				return function(x) {

					return Math.pow(x, params.a - 1) * Math.pow((1 - x), params.b - 1) / Math.h.beta(params.a, params.b);

				};	// x^(a-1)*(1-x)^(b-1)/B(a,b)

			},

			cdf: function(params) {

				return function(x) {

					return Math.h.integral(Math.p.distribution.beta.pdf(params), 0, x);

				};	// I_x(a,b)

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

		},

		rayleigh : {

			discrete: false,

			bounds: [0, Infinity],

			params: [
				{ id: 'sigma', title: 'Sigma', min: 0, max: 1000, step: 0.05, value: 2 }
			],

			mgf: function(params) {

				return function(t) {

					return 1 + params.sigma * t * Math.exp(Math.pow(params.sigma, 2) * Math.pow(t, 2) / 2) * Math.sqrt(Math.PI / 2) * (Math.h.erf(params.sigma * t / Math.sqrt(2)) + 1);

				};	// 1+s*t*e^(-s^2*t^2/2)*(pi/2)^.5*(erf(s*t/2^.5)+1)

			},

			pdf: function(params) {

				return function(x) {

					return x / Math.pow(params.sigma, 2) * Math.exp(-Math.pow(x, 2) / (2 * Math.pow(params.sigma, 2)));

				};	// x/s^2*exp(-x^2/(2*s^2))

			},

			cdf: function(params) {

				return function(x) {

					return Math.h.integral(Math.p.distribution.rayleigh.pdf(params), 0, x);

				};

			}

		},

		gumbel : {

			discrete: false,

			bounds: [-Infinity, Infinity],

			params: [
				{ id: 'mu', title: 'Location', min: -1000, max: 1000, step: 0.05, value: 1 },
				{ id: 'beta', title: 'Scale', min: 0, max: 1000, step: 0.05, value: 2 }
			],

			mgf: function(params) {

				return function(t) {

					return Math.h.gamma(1 - params.beta * t) * Math.exp(params.mu * t);

				};	// gamma(1-B*t)*e^(mu*t)

			},

			pdf: function(params) {

				return function(x) {

					var z = (x - params.mu) / params.beta;

					return 1 / params.beta * Math.exp(-(z + Math.exp(-z)));

				};	// 1/B*e^-(z+e^-z), z=(x-mu)/B

			},

			cdf: function(params) {

				return function(x) {

					return Math.h.integral(Math.p.distribution.rayleigh.pdf(params), 0, x);

				};	// e^-e^-z

			}

		}

	}

};