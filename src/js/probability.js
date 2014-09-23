// Define probability object
Math.p = new Helpers();

// Define moments
Math.p.moments = {

	mean: function(f, t) {

		return (Math.round(Math.p.derivative(f, 1, t) * 1000) / 1000);

	},

	variance: function(f, t) {

		return (Math.round((Math.p.derivative(f, 2, t) - Math.pow(Math.p.moments.mean(f, t), 2)) * 1000) / 1000);

	},

	skewness: function(f, t) {

		return (Math.round(((Math.p.derivative(f, 3, t) - 3 * Math.p.moments.mean(f, t) * Math.p.moments.variance(f, t) - Math.pow(Math.p.moments.mean(f, t), 3)) / Math.pow(Math.p.moments.variance(f, t), 1.5)) * 1000) / 1000);

	},

	kurtosis: function(f, t) {

		return (Math.round((Math.p.derivative(f, 4, t) / Math.pow(Math.p.moments.variance(f, t), 2) - 3) * 1000) / 1000);

	}

};

// Define distribution sub-object
Math.p.distribution = {

	binomial: {

		params: {
			p: { title: 'Probability', min: 0, max: 1, step: 0.05, value: 0.5 },
			n: { title: 'Trials', min: 0, max: 100, step: 1, value: 40 }//,
			//k: { title: 'Successes', min: 0, max: 100, step: 1, value: 20 }
		},

		mgf: function(p, n) {
			return function(t) {
				return (Math.pow((1 - p + p * Math.exp(t)), n));
			};	// (1-p+p*e^t)^n;
		},

		pdf: function(p, n) {
			return function(k) {
				return (Math.p.choose(n, k) * Math.pow(p, k) * Math.pow((1 - p), (n - k)));
			};	// (n k)*p^k*(1-p)^(n-k)
		},

		cdf: function(p, n, k) {
			/*var k_f = Math.floor(k),
				F = 0;
			for (var i=0; i<k_f; i++) {
				F += (Math.p.choose(n, i) * Math.pow(p, i) * Math.pow((1 - p), (n - i)));
				// (n i)*p^i*(1-p)^(n-i)
			}*/
			return (Math.p.integral(Math.p.distribution.binomial.pdf(p, n), 0, k));
		}

	},

	geometric: {

		params: {
			p: { title: 'Probability', min: 0, max: 1, step: 0.05, value: 0.5 },
			k: { title: 'TTS', min: 0, max: 100, step: 1, value: 40 }
		},

		mgf: function(p) {
			return function(t) {
				return (p / (1 - (1 - p) * Math.exp(t)));
			};	// p/(1-(1-p)*e^t);
		},

		pdf: function(p) {
			return function(k) {
				return (Math.pow(1 - p, k) * p);
			};	// (1-p)^k*p
		},

		cdf: function(p, k) {
			return (Math.p.integral(Math.p.distribution.geometric.pdf(p), 0, k));
			//return 1-Math.pow((1-p),(k+1));
				// 1-(1-p)^(k+1)
		}

	}

};