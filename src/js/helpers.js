// Define helper functions
Math.h = {

	/**
	 * determines if a number is an integer
	 *
	 * @param {number} n
	 * @return {boolean}
	 */
	isInt: function(n) {

		return typeof n === 'number' && isFinite(n) && n > -9007199254740992 && n < 9007199254740992 && Math.floor(n) === n;

	},

	/**
	 * estimate the value of Euler's number using n series expansion terms
	 *
	 * @param {integer} n
	 * @return {float}
	 */
	e: function(n) {

		var s = 0;

		if (typeof n === 'undefined' || !this.isInt(n)) {

			n = 18; // lowest value that results in accurate float precision

		}

		for (var i=0; i<n; i++) {

			s += 1 / this.factorial(i);

		}

		return s;

	},

	/**
	 * calculate the exact value of pi using Machin's formula
	 *
	 * @return {float}
	 */
	pi: 16 * Math.atan(1 / 5) - 4 * Math.atan(1 / 239),

	/**
	 * computes the factorial of a number
	 * handles integers exactly and approximates floats via numerical estimation of its gamma function value
	 *
	 * @param {number} n
	 * @return {number}
	 */
	factorial: function(n) {

		var i = 0;

		if (!this.isInt(n)) {

			return this.gamma(n - 1);

		} else {

			var f = (n < 0) ? undefined : 1;

			for (i=n; i>1; --i) {

				f *= i;

			}

			return f;

		}

	},

	/**
	 * computes the combination of a number
	 *
	 * @param {number} n
	 * @param {number} k
	 * @return {number}
	 */
	choose: function(n, k) {

		return this.factorial(n) / (this.factorial(n - k) * this.factorial(k));

	},

	/**
	 * computes the sum of all values less than or equal to a number
	 *
	 * @param {number} n
	 * @return {number}
	 */
	triangular: function(n) {

		return this.choose(n + 1, 2);

	},

	/**
	 * estimates the value of the gamma function at a certain value
	 *
	 * @param {number} x
	 * @return {number}
	 */
	erf: function(x) {

		var c = [0.254829592, -0.284496736, 1.421413741, -1.453152027, 1.061405429],
			p = 0.3275911,
			s = 1;

		if (x < 0) {
			s = -1;
		}

		x = Math.abs(x);

		var t = 1.0 / (1.0 + p * x),
			y = 1.0 - (((((c[4] * t + c[3]) * t) + c[2]) * t + c[1]) * t + c[0]) * t * Math.exp(-x * x);

		return s * y;

	},

	/**
	 * estimates the value of the gamma function at a certain value
	 *
	 * @param {number} n
	 * @return {number}
	 */
	gamma: function(n) {

		var g = 7,
			p = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7],
			g_ln = 607 / 128,
			p_ln = [0.99999999999999709182, 57.156235665862923517, -59.597960355475491248, 14.136097974741747174, -0.49191381609762019978, 0.33994649984811888699e-4, 0.46523628927048575665e-4, -0.98374475304879564677e-4, 0.15808870322491248884e-3, -0.21026444172410488319e-3, 0.21743961811521264320e-3, -0.16431810653676389022e-3, 0.84418223983852743293e-4, -0.26190838401581408670e-4, 0.36899182659531622704e-5];

		if (n < 0.5) {

			return Math.PI / (Math.sin(Math.PI * n) * this.gamma(1 - n));

		} else if (n > 100) {

			return Math.exp(lngamma(n));

		} else {

			n -= 1;

			var x = p[0];

			for (var i=1; i<g+2; i++) {

				x += p[i] / (n + i);

			}

			var t = n + g + 0.5;

			return Math.sqrt(2 * Math.PI) * Math.pow(t, n + 0.5) * Math.exp(-t) * x;

		}

		function lngamma(n) {

			if (n < 0) {

				return Number('0/0');

			}

			var x = p_ln[0];

			for (var i=p_ln.length-1; i>0; --i) {

				x += p_ln[i] / (n + i);

			}

			var t = n + g_ln + 0.5;

			return 0.5 * Math.log(2 * Math.PI) + (n + 0.5) * Math.log(t) - t + Math.log(x) - Math.log(n);

		}

	},

	/**
	 * numerically estimates the derivative of a function
	 *
	 * @param {function} f - single-variable function to derive
	 * @param {integer} o - order of derivative to compute
	 * @param {number} x - value at which to evaluate the derivative
	 * @return {number}
	 */
	derivative: function(f, o, x) {

		var h = 0.0001,
			i = 0,
			a = [],
			v1,
			v2,
			f1;

		switch (o) {

			case 1:
				f1 = function(x, h) {
					return (-f(x + 2 * h) + 8 * f(x + h) - 8 * f(x - h) + f(x - 2 * h)) / (12 * h);
				};
				break;

			case 2:
				f1 = function(x, h) {
					return (-f(x + 2 * h) + 16 * f(x + h) - 30 * f(x) + 16 * f(x - h) - f(x - 2 * h)) / (12 * Math.pow(h, 2));
				};
				break;

			case 3:
				f1 = function(x, h) {
					return (f(x + 2 * h) - 2 * f(x + h) + 2 * f(x - h) - f(x - 2 * h)) / (2 * Math.pow(h, 3));
				};
				break;

			case 4:
				f1 = function(x,h) {
					return (f(x + 2 * h) - 4 * f(x + h) + 6 * f(x) - 4 * f(x - h) + f(x - 2 * h)) / Math.pow(h, 4);
				};
				break;

			default:
				return false;

		}

		while (true) {

			v1 = f1(x, h);
			h -= h / 2;
			v2 = f1(x, h);
			a[i] = { h: h, d: Math.abs(v1-v2), v1: v1, v2: v2 };

			if ((i > 0 && a[i].d > a[i - 1].d) || i > 99999) {

				return a[i - 1].v1; // prevent loss of significance and instability

			} else {

				i += 1;

			}

		}

	},

	/**
	 * numerically estimates the integral of a function using Simpson's rule
	 *
	 * @param {function} f - single-variable function to integrate
	 * @param {number} a - lower bound
	 * @param {number} b - upper bound
	 * @return {number}
	 */
	integral: function(f, a, b) {

		return (b - a) / 6 * (f(a) + 4 * f((a + b) / 2) + f(b));

	},

	/**
	 * determines the closest integer to a number's square root
	 *
	 * @param {number} n
	 * @return {number}
	 */
	sq_size: function(n) {

		var m = Math.floor(Math.sqrt(n));

		if (n % m === 0) {

			return m;

		} else {

			for (var i=1; i<(m-1); i++) {

				if (n % (m - i) === 0) {

					return m - i;

				}

			}

			return m;

		}

	},

	/**
	 * outputs formatted array values
	 *
	 * @param {array} array
	 * @param {string} [key] - if array elements are objects, specifies which key value to use
	 * @param {integer} [cols] - specify number of columns to output
	 * @return {string}
	 */
	arr_dump: function(array, key, cols) {

		var l = array.length;

		if (typeof rows === 'undefined') {

			rows = this.sq_size(l);

		}

		var str='[';

		for (var i=0; i<l; i++) {

			if (i % rows === 0) {

				str += '\n';

			}

			str += (typeof key === 'undefined') ? '\t' + array[i] + ',' : '\t' + Math.round(array[i][key] * 10000) / 10000 + ',';

		}

		str = str.slice(0,-1);

		str += '\n]';

		return str;

	}

};