/**
 * @namespace
 * @description defines helper methods
 */
Math.h = {

	/**
	 * Euler–Mascheroni constant
	 *
	 * @constant
	 * @type {number}
	 * @default
	 */
	EM: 0.5772156649015329,

	/**
	 * define secant
	 *
	 * @param {number} x
	 * @return {number}
	 */
	sec: function(x) {

		return 1 / Math.cos(x);

	},

	/**
	 * define cosecant
	 *
	 * @param {number} x
	 * @return {number}
	 */
	csc: function(x) {

		return 1 / Math.sin(x);

	},

	/**
	 * define cotangent
	 *
	 * @param {number} x
	 * @return {number}
	 */
	cot: function(x) {

		return 1 / Math.tan(x);

	},

	/**
	 * define hyperbolic sine
	 *
	 * @param {number} x
	 * @return {number}
	 */
	sinh: function(x) {

		var y = Math.exp(x);

		return (y - 1 / y) / 2;

	},

	/**
	 * define hyperbolic cosine
	 *
	 * @param {number} x
	 * @return {number}
	 */
	cosh: function(x) {

		var y = Math.exp(x);

		return (y + 1 / y) / 2;

	},

	/**
	 * define hyperbolic tangent
	 *
	 * @param {number} x
	 * @return {number}
	 */
	tanh: function(x) {

		if (x === Infinity) { return 1; }

		else if (x === -Infinity) { return -1; }

		else {

			var y = Math.exp(2 * x);

			return (y - 1) / (y + 1);

		}

	},

	/**
	 * define hyperbolic cosecant
	 *
	 * @param {number} x
	 * @return {number}
	 */
	csch: function(x) {

		return 1 / this.sinh(x);

	},

	/**
	 * define hyperbolic secant
	 *
	 * @param {number} x
	 * @return {number}
	 */
	sech: function(x) {

		return 1 / this.cosh(x);

	},

	/**
	 * define hyperbolic cotangent
	 *
	 * @param {number} x
	 * @return {number}
	 */
	coth: function(x) {

		return 1 / this.tanh(x);

	},

	/**
	 * generate a better pseudo random number using WELL19937c PRNG
	 * @return {number} random number between 0 and 1
	 */
	random: function() {

		var r = 624, //state size
			M1 = 70, //first parameter
			M2 = 179, //second parameter
			M3 = 449, //third parameter
			index = 0, //index
			v = [], //state
			iRm1 = [], //indirection array for (i + r - 1) % r
			iRm2 = [], //indirection array for (i + r - 2) % r
			i1 = [], //indirection array for (i + M1) % r
			i2 = [], //indirection array for (i + M2) % r
			i3 = []; //indirection array for (i + M3) % r

		/**
		 * Seed the generator with an array of 32-bit unsigned values.
		 * If 624 values are provided, these values become the internal state (625, 626... are discarded).
		 * If less, the rest of the state is initialized with an algorithm that is based on a linear congruential generator from Numerical Recipes.
		 */
		function seedArray(array) {

			v = array.slice(0, r);

			for (var i = array.length; i < r; i++) { v[i] = ((1664525 * v[i - array.length]) + 1013904223) >>> 0; }

		}

		// Seed the generator with a single unsigned 32-bit value. Equivalent to seedArray([value]).
		function seed(value) {

			seedArray([value]);

		}

		// Generate a single random 32-bit float from 0 (inclusive) to 1 (exclusive).
		function random() {

			var indexRm1 = iRm1[index],
				indexRm2 = iRm2[index],

				v0 = v[index],
				vM1 = v[i1[index]],
				vM2 = v[i2[index]],
				vM3 = v[i3[index]],

				z0 = (0x80000000 & v[indexRm1]) ^ (0x7FFFFFFF & v[indexRm2]),
				z1 = (v0 ^ (v0 << 25)) ^ (vM1 ^ (vM1 >>> 27)),
				z2 = (vM2 >>> 9) ^ (vM3 ^ (vM3 >>> 1)),
				z3 = z1 ^ z2,
				z4 = z0 ^ (z1 ^ (z1 << 9)) ^ (z2 ^ (z2 << 21)) ^ (z3 ^ (z3 >>> 21));

			v[index] = z3;
			v[indexRm1] = z4;
			v[indexRm2] &= 0x80000000;
			index = indexRm1;

			// add Matsumoto-Kurita tempering to get a maximally equidistributed generator
			z4 ^= (z4 << 7) & 0xe46e1700;
			z4 ^= (z4 << 15) & 0x9b868000;

			//return 32-bit float
			return (z4 >>> 0) / 0x100000000;

		}

		// pre-compute indirection tables
		for (var i = 0; i < r; i++) {

			iRm1.push((i + r - 1) % r);
			iRm2.push((i + r - 2) % r);
			i1.push((i + M1) % r);
			i2.push((i + M2) % r);
			i3.push((i + M3) % r);

		}

		// seed with date
		seed(+new Date());

		/*return {
			random: random,
			seed: seed,
			seedArray: seedArray
		};*/

		return random();

	},

	/**
	 * determines if a number is equivalent to an integer
	 *
	 * @param {number} n
	 * @return {boolean}
	 */
	isInt: function(n) {

		return typeof n === 'number' && isFinite(n) && n > -9007199254740992 && n < 9007199254740992 && Math.floor(n) === n;

	},

	/**
	 * determines if a value is within bounds of two-element array
	 *
	 * @param {number} value - any number to test
	 * @param {array} bounds - two-element array of lower/upper bounds
	 * @return {boolean}
	 */
	inBounds: function(value, bounds) {

		if (bounds.lower.closed && bounds.upper.closed) { return (value >= bounds.lower.value && value <= bounds.upper.value) ? true : false; }
		if (bounds.lower.closed && !bounds.upper.closed) { return (value >= bounds.lower.value && value < bounds.upper.value) ? true : false; }
		if (!bounds.lower.closed && bounds.upper.closed) { return (value > bounds.lower.value && value <= bounds.upper.value) ? true : false; }
		if (!bounds.lower.closed && !bounds.upper.closed) { return (value > bounds.lower.value && value < bounds.upper.value) ? true : false; }

	},

	/**
	 * round a number to specified decimal places
	 *
	 * @param {number} n - any number
	 * @param {number} d - number of decimal places
	 * @return {number}
	 */
	round: function(n, d) {

		return Math.round(n * Math.pow(10, d)) / Math.pow(10, d);

	},

	/**
	 * determines the sign of a real number
	 *
	 * @param {number} x
	 * @return {integer} sign
	 */
	sgn: function(x) {

		if (x < 0) { return -1; }
		else if (x === 0) { return 0; }
		else if (x > 0) { return 1; }
		else { return false; }

	},

	/**
	 * computes the factorial of a number
	 * approximates floats via the gamma function
	 *
	 * @param {number} n
	 * @return {number}
	 */
	factorial: function(n) {

		var i = 0;

		if (!this.isInt(n)) { return this.gamma(n - 1); }
		else {
			var f = (n < 0) ? undefined : 1;
			for (i = n; i > 1; --i) { f *= i; }
			return f;
		}

	},

	/**
	 * computes the combination or binomial coefficient of a number
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
	 * estimates the value of the error function at a certain value
	 *
	 * @param {number} x
	 * @return {number}
	 */
	erf: function(x) {

		var c = [0.254829592, -0.284496736, 1.421413741, -1.453152027, 1.061405429],
			p = 0.3275911, s = 1;

		if (x < 0) { s = -1; }

		x = Math.abs(x);

		var t = 1.0 / (1.0 + p * x),
			y = 1.0 - (((((c[4] * t + c[3]) * t) + c[2]) * t + c[1]) * t + c[0]) * t * Math.exp(-x * x);

		return s * y;

	},

	/**
	 * calculate the nth harmonic number
	 *
	 * @param {number} n
	 * @return {number}
	 */
	harmonic: function(n) {

		return (n < 0) ? Infinity : this.sum(function(k) { return 1 / k; }, 1, n);

	},

	/**
	 * estimates the value of the polylogarithmic function with specified s and z values
	 *
	 * @param {number} s - s
	 * @param {number} z - z
	 * @return {number}
	 */
	polylogarithm: function(s, z) {

		return (s === 1) ? Infinity : this.sum(function(k) {
			return Math.pow(z, k) / Math.pow(k, s);
		}, 1, Infinity);

	},

	/**
	 * estimates the value of the Riemann zeta function with specified s value
	 * this is a special case of a polylogarithm with z value of 1
	 *
	 * @param {number} s - s
	 * @return {number}
	 */
	zeta: function(s) {

		return this.polylogarithm(s, 1);

	},

	/**
	 * estimates the value of the beta function with specified parameters by using the beta function's relation to the gamma function
	 *
	 * @param {number} a - alpha
	 * @param {number} b - beta
	 * @return {number}
	 */
	beta: function(a, b) {

		return this.gamma(a) * this.gamma(b) / this.gamma(a + b);

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

		if (n < 0.5) { return Math.PI / (Math.sin(Math.PI * n) * this.gamma(1 - n)); }
		else if (n > 100) { return Math.exp(lngamma(n)); }
		else {

			n -= 1;

			var x = p[0];

			for (var i = 1; i < g + 2; i++) { x += p[i] / (n + i); }

			var t = n + g + 0.5;

			return Math.sqrt(2 * Math.PI) * Math.pow(t, n + 0.5) * Math.exp(-t) * x;

		}

		function lngamma(n) {

			if (n < 0) { return Number('0/0'); }

			var x = p_ln[0];

			for (var i = p_ln.length - 1; i > 0; --i) { x += p_ln[i] / (n + i); }

			var t = n + g_ln + 0.5;

			return 0.5 * Math.log(2 * Math.PI) + (n + 0.5) * Math.log(t) - t + Math.log(x) - Math.log(n);

		}

	},

	/**
	 * estimates the value of the lower incomplete gamma function with specified parameters
	 *
	 * @param {number} a
	 * @param {number} x
	 * @return {number}
	 */
	ligamma: function(a, x) {

		var self = this;

		return Math.pow(x, a) * this.gamma(a) * Math.exp(-x) * this.sum(function(k) {
			return Math.pow(x, k) / self.gamma(a + k + 1);
		}, 0, Infinity);

	},

	/**
	 * estimates the value of the upper incomplete gamma function with specified parameters
	 *
	 * @param {number} a
	 * @param {number} z
	 * @return {number}
	 */
	uigamma: function(a, z) {

		var self = this;

		return this.gamma(a) * (1 - Math.pow(z, a) * Math.exp(-z) * this.sum(function(k) {
			return Math.pow(z, k) / self.gamma(a + k + 1);
		}, 0, Infinity));

	},

	/**
	 * estimates the value of the digamma function at a certain value
	 *
	 * @param {number} n
	 * @return {number}
	 */
	digamma: function(n) {

		var self = this;

		return (n > 0) ? Math.h.derivative(function(x) { return self.gamma(x); }, 1, n) / this.gamma(n) : Infinity;

	},

	/**
	 * estimates the modified bessel function as a function of variable x
	 *
	 * @param {number} a
	 * @param {integer} kind
	 * @return {number}
	 */
	bessel: function(kind, a) {

		var self = this;

		if (kind === 1) {

			return function(x) {
				return self.sum(function(m) {
					return 1 / (self.factorial(m) * self.gamma(m + a + 1)) * Math.pow(x / 2, 2 * m + a);
				}, 0, Infinity);
			};

		}

		if (kind === 2) {

			return function(x) {
				return Math.PI / 2 * (self.bessel(1, -a)(x) - self.bessel(1, a)(x)) / Math.sin(a * Math.PI);
			};

		}

		return false;

	},

	/**
	 * calculate a generic sum using supplied function of one variable and bounds
	 *
	 * @param {function} f - function applied within sum
	 * @param {integer} a - lower bound
	 * @param {integer} b - upper bound
	 * @return {number} sum
	 */
	sum: function(f, a, b) {

		var v1 = 0, v2 = 0, s = 0, i = a;

		while (i <= b) {

			v1 = f(i);
			v2 = f(i + 1);

			if (!isNaN(v1)) { s += v1; }
			if (!isNaN(v1) && !isNaN(v2) && Math.abs(v1 - v2) < 1E-12) { break; }
			if (i > 99999) { return false; }

			i += 1;

		}

		return s;

	},

	/**
	 * calculate a sample sum using supplied data and a callback
	 *
	 * @param {array} array - array of sample data
	 * @param {function} callback - function to apply to array when reading values
	 * @return {number} sum
	 */
	s_sum: function(array, callback) {

		var i, l,
			s = 0;

		for (i = 0, l = array.length; i < l; i++) {

			s += callback(array[i]);

		}

		return s;

	},

	/**
	 * calculate a generic product-sum using supplied function and parameters
	 *
	 * @param {function} f - function applied within product-sum
	 * @param {integer} a - lower bound
	 * @param {integer} b - upper bound
	 * @return {number} sum - product-sum
	 */
	product_sum: function(f, a, b) {

		var v1, v2,
			i = a,
			sum = 1;

		while (i <= b) {

			v1 = f(i);
			v2 = f(i + 1);
			sum *= v1;

			if (Math.abs(v2 - v1) < 1E-12 || i > 99999) { break; }

			i += 1;

		}

		return sum;

	},

	/**
	 * numerically estimates the derivative of a function using the central finite difference method
	 *
	 * @param {function} f - single-variable function to derive
	 * @param {integer} o - order of derivative to compute
	 * @param {number} x - value at which to evaluate the derivative
	 * @return {number}
	 */
	derivative: function(f, o, x) {

		var self = this,
			f1, h = 0.01,
			i = 0,
			v = [], d = [];

		/*switch (o) {

			case 1:
				f1 = function(x, h) { return (-f(x + 2 * h) + 8 * f(x + h) - 8 * f(x - h) + f(x - 2 * h)) / (12 * h); };
				break;

			case 2:
				f1 = function(x, h) { return (-f(x + 2 * h) + 16 * f(x + h) - 30 * f(x) + 16 * f(x - h) - f(x - 2 * h)) / (12 * Math.pow(h, 2)); };
				break;

			case 3:
				f1 = function(x, h) { return (f(x + 2 * h) - 2 * f(x + h) + 2 * f(x - h) - f(x - 2 * h)) / (2 * Math.pow(h, 3)); };
				break;

			case 4:
				f1 = function(x, h) { return (f(x + 2 * h) - 4 * f(x + h) + 6 * f(x) - 4 * f(x - h) + f(x - 2 * h)) / Math.pow(h, 4); };
				break;

			default:
				return false;

		}*/

		f1 = function(x, h) {
			return self.sum(function(i) {
				return Math.pow(-1, i) * self.choose(o, i) * f(x + (o / 2 - i) * h) / Math.pow(h, o);
			}, 0, o);
		};

		while (i <= 99999) {

			h -= h / 2;
			v[i] = f1(x, h);

			if (i !== 0) {

				d[i] = Math.abs(v[i] - v[i - 1]);

				if (!isNaN(v[i]) && !isNaN(v[i - 1]) && (Math.abs(v[i]) !== Infinity && Math.abs(v[i - 1]) !== Infinity) && (d[i] >= d[i - 1])) { return v[i - 1]; }

			}

			i += 1;

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

		if (n % m !== 0) {
			for (var i = 1; i < (m - 1); i++) {
				if (n % (m - i) === 0) { return m - i; }
			}
		}

		return m;

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

		if (typeof rows === 'undefined') { rows = this.sq_size(l); }

		var str='[';

		for (var i = 0; i < l; i++) {

			if (i % rows === 0) { str += '\n'; }

			str += (typeof key === 'undefined') ? '\t' + array[i] + ',' : '\t' + Math.round(array[i][key] * 10000) / 10000 + ',';

		}

		str = str.slice(0, -1);

		str += '\n]';

		return str;

	},

	/**
	 * parses a function as a string and outputs html
	 *
	 * @param {function} f
	 * @return {string} html
	 */
	parse_func: function(f) {

		var i,
			c = '',
			s_p = 0,
			s_b = 0,
			html = '',
			keywords = [

				'function',
				'if',
				'else',
				'params',

				'Math.PI',

				'Math.exp',
				'Math.log',
				'Math.pow',
				'Math.sqrt',

				'Math.h.bessel',
				'Math.h.beta',
				'Math.h.choose',
				'Math.h.factorial',
				'Math.h.gamma',
				'Math.h.zeta'

			];

		f = f.toString();

		for (i = 0, l = f.length; i < l; i++) {

			c = f.charAt(i);

			if (c === '(') { s_p += 1; }

			if (c === ')') { s_p -= 1; }

			if (c === '{') { s_b += 1; }

			if (c === '}') { s_b -= 1; }

		}

		return html;

	}

};