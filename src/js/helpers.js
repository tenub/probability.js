/**
 * @namespace
 * @desc Defines helper methods
 */
Math.h = {

	/**
	 * Euler–Mascheroni constant.
	 *
	 * @desc The Euler–Mascheroni constant (also called Euler's constant) is a mathematical constant recurring in analysis and number theory, usually denoted by the lowercase Greek letter gamma. It is defined as the limiting difference between the harmonic series and the natural logarithm.
	 * @constant
	 * @type {number}
	 * @default
	 */
	EM: 0.5772156649015329,

	/**
	 * Define cosecant.
	 *
	 * @desc The cosecant is the reciprocal of sine; i.e. the ratio of the length of the hypotenuse to the length of the opposite side.
	 * @param {number} x - value
	 * @return {number}
	 */
	csc: function(x) {

		return 1 / Math.sin(x);

	},

	/**
	 * Define secant.
	 *
	 * @desc The secant is the reciprocal of cosine; i.e. the ratio of the length of the hypotenuse to the length of the adjacent side.
	 * @param {number} x - value
	 * @return {number}
	 */
	sec: function(x) {

		return 1 / Math.cos(x);

	},

	/**
	 * Define cotangent.
	 *
	 * @desc The cotangent is the reciprocal of tangent; i.e. the ratio of the length of the adjacent side to the length of the opposite side.
	 * @param {number} x - value
	 * @return {number}
	 */
	cot: function(x) {

		return 1 / Math.tan(x);

	},

	/**
	 * Define hyperbolic sine.
	 *
	 * @desc <code>(1 - e^(-2x)) / 2e^(-x)</code>
	 * @param {number} x - value
	 * @return {number}
	 */
	sinh: function(x) {

		var y = Math.exp(x);

		return (y - 1 / y) / 2;

	},

	/**
	 * Define hyperbolic cosine.
	 *
	 * @desc <code>(1 + e^(-2x)) / 2e^(-x)</code>
	 * @param {number} x - value
	 * @return {number}
	 */
	cosh: function(x) {

		var y = Math.exp(x);

		return (y + 1 / y) / 2;

	},

	/**
	 * Define hyperbolic tangent.
	 *
	 * @desc <code>(1 - e^(-2x)) / (1 + e^(-2x))</code>
	 * @param {number} x - value
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
	 * Define hyperbolic cosecant.
	 *
	 * @desc <code>2e^(-x) / (1 - e^(-2x))</code>
	 * @param {number} x - value
	 * @return {number}
	 */
	csch: function(x) {

		return 1 / this.sinh(x);

	},

	/**
	 * Define hyperbolic secant.
	 *
	 * @desc <code>2e^(-x) / (1 + e^(-2x))</code>
	 * @param {number} x - value
	 * @return {number}
	 */
	sech: function(x) {

		return 1 / this.cosh(x);

	},

	/**
	 * Define hyperbolic cotangent.
	 *
	 * @desc <code>(1 + e^(-2x)) / (1 - e^(-2x))</code>
	 * @param {number} x - value
	 * @return {number}
	 */
	coth: function(x) {

		return 1 / this.tanh(x);

	},

	/**
	 * Generate a random number between 0 and 1.
	 *
	 * @desc Generate a better pseudo random number using the WELL19937c PRNG method.
	 * @example
	 * Math.h.random()
	 * // returns 0.7079318668693304
	 *
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
	 * Determines if a number is equivalent to an integer.
	 *
	 * @example
	 * Math.h.isInt(1.0)
	 * // returns true
	 * @example
	 * Math.h.isInt(1.000000000000001)
	 * // returns false
	 *
	 * @param {number} n - value
	 * @return {boolean}
	 */
	isInt: function(n) {

		return typeof n === 'number' && isFinite(n) && n > -9007199254740992 && n < 9007199254740992 && Math.floor(n) === n;

	},

	/**
	 * Determines if a value is within bounds specified by a two-element array.
	 *
	 * @example
	 * Math.h.inBounds(1.0, {
	 *   lower: { closed: false, value: 0 },
	 *   upper: { closed: true, value: 1 }
	 * })
	 * // returns true
	 * @example
	 * Math.h.inBounds(1.0, {
	 *   lower: { closed: false, value: 0 },
	 *   upper: { closed: false, value: 1 }
	 * })
	 * // returns false
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
	 * Round a number to specified decimal places.
	 *
	 * @example
	 * Math.h.round(0.8819197530392557, 3)
	 * // returns 0.882
	 *
	 * @param {number} n - number
	 * @param {number} d - decimal places
	 * @return {number}
	 */
	round: function(n, d) {

		return Math.round(n * Math.pow(10, d)) / Math.pow(10, d);

	},

	/**
	 * Determines the sign of a real number.
	 *
	 * @example
	 * Math.h.sgn(2)
	 * // returns 1
	 * @example
	 * Math.h.sgn(0)
	 * // returns 0
	 * @example
	 * Math.h.sgn(-3)
	 * // returns -1
	 *
	 * @param {number} x - value
	 * @return {integer} sign
	 */
	sgn: function(x) {

		if (x < 0) { return -1; }
		else if (x === 0) { return 0; }
		else if (x > 0) { return 1; }
		else { return false; }

	},

	/**
	 * Computes the factorial of a number. Approximates non-integers via the gamma function. The factorial is most basically defined as the product of all positive integers less than or equal to the specified number but may be extended to all numbers via the gamma function.
	 *
	 * @example
	 * Math.h.factorial(5)
	 * // returns 120
	 * @example
	 * Math.h.factorial(1.5)
	 * // returns 1.3293403881791386
	 * @example
	 * Math.h.factorial(-1)
	 * // returns Infinity
	 *
	 * @param {number} n - number to factorialize
	 * @return {number}
	 */
	factorial: function(n) {

		if (!this.isInt(n) || n < 0) { return this.gamma(n + 1); }
		else {
			var i = 0,
				f = 1;
			for (i = n; i > 1; --i) { f *= i; }
			return f;
		}

	},

	/**
	 * Computes the combination or binomial coefficient of a number; i.e. if the set has n elements, the number of k-combinations is equal to the binomial coefficient. A combination is a way of selecting members from a grouping, such that the order of selection does not matter.
	 *
	 * @example
	 * Math.h.choose(5, 2)
	 * // returns 10
	 *
	 * @param {number} n - elements in a set
	 * @param {number} k - combinations in the set
	 * @return {number}
	 */
	choose: function(n, k) {

		return (this.isInt(n) && this.isInt(k) && n > 0 && k >= 0) ? this.factorial(n) / (this.factorial(n - k) * this.factorial(k)) : false;

	},

	/**
	 * Computes the sum of all values less than or equal to a number. A triangular number counts the objects that can form an equilateral triangle. The nth triangle number is the number of dots composing a triangle with n dots on a side, and is equal to the sum of the n natural numbers from 1 to n.
	 *
	 * @example
	 * Math.h.triangular(4)
	 * // returns 10
	 *
	 * @param {number} n - number
	 * @return {number}
	 */
	triangular: function(n) {

		return this.choose(n + 1, 2);

	},

	/**
	 * Estimates the value of the error function at a certain value. The error function is a special function of sigmoid shape that occurs in probability, statistics, and partial differential equations describing diffusion.
	 *
	 * @example
	 * Math.h.erf(1)
	 * // returns 0.8427006897475899
	 *
	 * @param {number} x - value
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
	 * Calculates the nth harmonic number. The nth harmonic number is the sum of the reciprocals of the first n natural numbers.
	 *
	 * @example
	 * Math.h.harmonic(9)
	 * // returns 2.8289682539682537
	 *
	 * @param {integer} n - positive integer
	 * @return {number}
	 */
	harmonic: function(n) {

		return (n < 0) ? Infinity : this.sum(function(k) { return 1 / k; }, 1, n);

	},

	/**
	 * Estimates the value of the polylogarithmic function with specified s and z values. The polylogarithm is a special function Li_s(z) of order s and argument z. The name of the function comes from the fact that it may also be defined as the repeated integral of itself.
	 *
	 * @example
	 * Math.h.polylogarithm(-3, 0.5)
	 * // returns 25.99999999999857
	 *
	 * @param {number} s - order
	 * @param {number} z - argument
	 * @return {number}
	 */
	polylogarithm: function(s, z) {

		return (s === 1) ? Infinity : this.sum(function(k) {
			return Math.pow(z, k) / Math.pow(k, s);
		}, 1, Infinity);

	},

	/**
	 * Estimates the value of the Riemann zeta function with specified s value. This is a special case of a polylogarithm with z value of 1. The Riemann zeta function plays a pivotal role in analytic number theory and has applications in physics, probability theory, and applied statistics.
	 *
	 * @example
	 * Math.h.zeta(2)
	 * // returns 1.644854698619374
	 *
	 * @param {number} s - order
	 * @return {number}
	 */
	zeta: function(s) {

		return this.polylogarithm(s, 1);

	},

	/**
	 * Estimates the value of the Riemann Xi function with specified s value. It is a variant of the Riemann zeta function, and is defined so as to have a particularly simple functional equation.
	 *
	 * @example
	 * Math.h.xi(5)
	 * // returns 0.7879706062229069
	 *
	 * @param {number} s - value
	 * @return {number}
	 */
	xi: function(s) {

		return 0.5 * s * (s - 1) * Math.pow(Math.PI, -s / 2) * this.gamma(0.5 * s) * this.zeta(s);

	},

	/**
	 * Estimates the value of the beta function with specified parameters by using the beta function's relation to the gamma function. The beta function, also called the Euler integral of the first kind, is a special function with a wide variety of applications.
	 *
	 * @example
	 * Math.h.beta(2, 1.6)
	 * // returns 0.24038461538461522
	 *
	 * @param {number} a - alpha
	 * @param {number} b - beta
	 * @return {number}
	 */
	beta: function(a, b) {

		return this.gamma(a) * this.gamma(b) / this.gamma(a + b);

	},

	/**
	 * Estimates the value of the gamma function at a certain value. The gamma function is an extension of the factorial function, with its argument shifted down by 1, to real and complex numbers. The gamma function is a component in various probability-distribution functions, and as such it is applicable in the fields of probability and statistics, as well as combinatorics.
	 *
	 * @example
	 * Math.h.gamma(0.1)
	 * // returns 9.513507698668736
	 * @example
	 * Math.h.gamma(6)
	 * // returns 120.00000000000014
	 *
	 * @param {number} n - value
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
	 * Estimates the value of the lower incomplete gamma function with specified parameters. The lower incomplete gamma function is a type of special function, which arises as a solution to various mathematical problems such as certain integrals. The lower incomplete gamma function is defined as an integral from zero to a variable upper limit.
	 *
	 * @example
	 * Math.h.ligamma(1, 1)
	 * // returns 0.6321205588282578
	 *
	 * @param {number} a - parameter
	 * @param {number} x - value
	 * @return {number}
	 */
	ligamma: function(a, x) {

		var self = this;

		return Math.pow(x, a) * this.gamma(a) * Math.exp(-x) * this.sum(function(k) {
			return Math.pow(x, k) / self.gamma(a + k + 1);
		}, 0, Infinity);

	},

	/**
	 * Estimates the value of the upper incomplete gamma function with specified parameters. The upper incomplete gamma function is a type of special function, which arises as a solution to various mathematical problems such as certain integrals. The upper incomplete gamma function is defined as an integral from a variable lower limit to infinity.
	 *
	 * @example
	 * Math.h.uigamma(1, 1)
	 * // returns 0.3678794411717422
	 *
	 * @param {number} a - parameter
	 * @param {number} z - value
	 * @return {number}
	 */
	uigamma: function(a, z) {

		var self = this;

		return this.gamma(a) * (1 - Math.pow(z, a) * Math.exp(-z) * this.sum(function(k) {
			return Math.pow(z, k) / self.gamma(a + k + 1);
		}, 0, Infinity));

	},

	/**
	 * Estimates the value of the digamma function at a certain value. The digamma function is defined as the logarithmic derivative of the gamma function.
	 *
	 * @example
	 * Math.h.digamma(1)
	 * // returns -0.5772156649179256
	 *
	 * @param {number} n - value
	 * @return {number}
	 */
	digamma: function(n) {

		var self = this;

		return (n > 0) ? this.derivative(function(x) { return Math.log(self.gamma(x)); }, 1, n) : Infinity;

	},

	/**
	 * Estimates the modified bessel function of the first kind at a value of x. The Bessel functions are valid even for complex arguments x, and an important special case is that of a purely imaginary argument. In this case, the solutions to the Bessel equation are called the modified Bessel functions of the first and second kind.
	 *
	 * @example
	 * Math.h.besselI(1, 7)
	 * // returns 156.03909286995508
	 *
	 * @param {number} a - order of function
	 * @param {number} x - value
	 * @return {number}
	 */
	besselI: function(a, x) {

		var self = this;

		return (typeof a !== 'undefined' && typeof x !== 'undefined') ? self.sum(function(m) {
			return 1 / (self.factorial(m) * self.gamma(m + a + 1)) * Math.pow(x / 2, 2 * m + a);
		}, 0, Infinity) : false;

	},

	/**
	 * Calculate a generic sum using supplied function of one variable and bounds with optional tolerance and maximum number of calculations for infinite sums.
	 *
	 * @example
	 * Math.h.sum(function(x) { return Math.sin(x); }, 0, Math.PI / 4)
	 * // returns 0
	 *
	 * @param {function} f - function applied within sum
	 * @param {integer} a - lower bound
	 * @param {integer} b - upper bound
	 * @param {integer} [tol] - sum difference tolerance
	 * @param {integer} [max] - number of terms after which to truncate summation
	 * @return {number} sum
	 */
	sum: function(f, a, b, tol, max) {

		var v1 = 0, v2 = 0,
			s1 = 0, s2 = 0,
			i = a;

		if (Math.abs(a) === Infinity || Math.abs(b) === Infinity) { return inf_sum(f, a, b, tol, max); }
		else { return fin_sum(f, a, b); }

		function inf_sum(f, a, b, tol, max) {

			if (typeof tol === 'undefined') { tol = 1E-12; }
			if (typeof max === 'undefined') { max = 1E6; }

			while (i <= b) {

				v1 = f(i);
				v2 = f(i + 1);

				if (!isNaN(v1) && !isNaN(v2)) {

					s1 += v1;
					s2 = s1 + f(i + 1);

					if (Math.abs(s1 - s2) < tol) { break; }

				}

				if (i > max) { return undefined; }

				i += 1;

			}

			return s1;

		}

		function fin_sum(f, a, b) {

			while (i <= b) {

				v1 = f(i);

				if (!isNaN(v1)) { s1 += v1; }

				i += 1;

			}

			return s1;

		}

	},

	/**
	 * Calculate a sample sum using supplied data and a callback.
	 *
	 * @example
	 * Math.h.s_sum([{x: 0, y: 0.1}, {x: 0.1, y: 0.5}, {x: 0.5, y: -0.275}, {x: 1, y: 1}], function(el) { return el.y; })
	 * // returns 1.325
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
	 * Calculate a generic product-sum using supplied function and parameters.
	 *
	 * @example
	 * Math.h.product(function(x) { return 1/x; }, 1, 5)
	 * // returns 0.008333333333333333
	 *
	 * @param {function} f - function applied within product-sum
	 * @param {integer} a - lower bound
	 * @param {integer} b - upper bound
	 * @param {integer} [tol] - sum difference tolerance
	 * @param {integer} [max] - number of terms after which to truncate summation
	 * @return {number} sum - product-sum
	 */
	product: function(f, a, b, tol, max) {

		var v1 = 1, v2 = 1,
			s1 = 1, s2 = 1,
			i = a;

		if (Math.abs(a) === Infinity || Math.abs(b) === Infinity) { return inf_sum(f, a, b, tol, max); }
		else { return fin_sum(f, a, b); }

		function inf_sum(f, a, b, tol, max) {

			if (typeof tol === 'undefined') { tol = 1E-12; }
			if (typeof max === 'undefined') { max = 1E6; }

			while (i <= b) {

				v1 = f(i);
				v2 = f(i + 1);

				if (!isNaN(v1) && !isNaN(v2)) {

					s1 *= v1;
					s2 = s1 * f(i + 1);

					if (Math.abs(s1 - s2) < tol) { break; }

				}

				if (i > max) { return undefined; }

				i += 1;

			}

			return s1;

		}

		function fin_sum(f, a, b) {

			while (i <= b) {

				v1 = f(i);

				if (!isNaN(v1)) { s1 *= v1; }

				i += 1;

			}

			return s1;

		}

		return s1;

	},

	/**
	 * Numerically estimates the derivative of a function using the central finite difference method.
	 *
	 * @example
	 * Math.h.derivative(function(x) { return 1/x; }, 1, 1)
	 * // returns -1.0000000000445652
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
				return Math.pow(-1, i) * self.choose(o, i) * f(x + (o / 2 - i) * h);
			}, 0, o) / Math.pow(h, o);
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
	 * Numerically estimates the integral of a function using Simpson's rule.
	 *
	 * @example
	 * Math.h.integral(function(x) { return 1/x; }, 1, 2)
	 * // returns 0.6944444444444443
	 * @example
	 * Math.h.integral(function(x) { return 1/x; }, 0, 1)
	 * // returns Infinity
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
	 * Determines the closest integer to a number's square root. Useful in determining the optimal number of rows and columns for displaying a list of values.
	 *
	 * @example
	 * Math.h.sq_size(9)
	 * // returns 3
	 * @example
	 * Math.h.sq_size(11)
	 * // returns 3
	 *
	 * @param {number} n - value
	 * @return {number}
	 */
	sq_size: function(n) {

		var r = Math.sqrt(n),
			f = Math.floor(r);

		return (r % f >= 0.5) ? f + 1 : f;

	},

	/**
	 * Outputs formatted array values as a string.
	 *
	 * @example
	 * Math.h.arr_dump([1, 2, 3, 4, 5])
	 * // returns "[
	 * //	1, 2, 3,
	 * //	4, 5
	 * // ]"
	 * @example
	 * Math.h.arr_dump([{ x: 1, y: 0.5 }, { x: 2, y: -0.1 }, { x: 3, y: 0 }], 1, 'x')
	 * // returns "[
	 * //	1,
	 * //	2,
	 * //	3
	 * // ]"
	 *
	 * @param {array} array - input array to format
	 * @param {integer} [cols] - specify number of columns to output
	 * @param {string} [key] - if array elements are objects, specifies which key value to use
	 * @return {string}
	 */
	arr_dump: function(array, cols, key) {

		if (typeof cols === 'undefined') { cols = this.sq_size(l); }

		var str = '[';

		for (var i = 0, l = array.length; i < l; i++) {

			if (i % cols === 0) { str += '\n'; }

			str += (typeof key === 'undefined') ? '\t' + array[i] + ',' : '\t' + this.round(array[i][key], 4) + ',';

		}

		str = str.slice(0, -1);

		str += '\n]';

		return str;

	},

	/**
	 * Parses a function as a string and outputs html.
	 *
	 * @param {function} f - function
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