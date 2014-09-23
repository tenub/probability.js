function Helpers() {

	var self = this;

	self.isInt = function(n) {

		return (typeof n === 'number' && (n % 1) === 0);

	};

	self.factorial = function(n) {

		var i = 0;

		if (!self.isInt(n)) {

			// Lanczos Approximation of the Gamma Function
			// As described in Numerical Recipes in C (2nd ed. Cambridge University Press, 1992)
			var z = n + 1,
				p = [1.000000000190015, 76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 1.208650973866179E-3, -5.395239384953E-6],
				d1 = Math.sqrt(2 * Math.PI) / z,
				d2 = p[0],
				d3 = Math.pow((z + 5.5), (z + 0.5)),
				d4 = Math.exp(-(z + 5.5));

			for (i=1; i<=6; ++i) {
				d2 += p[i] / (z + i);
			}

			return (d1 * d2 * d3 * d4);

		} else {

			var f = (n < 0) ? undefined : 1;

			for (i=n; i>1; --i) {
				f *= i;
			}

			return f;

		}

	};

	self.choose = function(n, k) {

		return (self.factorial(n) / (self.factorial(n - k) * self.factorial(k)));

	};

	self.triangular = function(n) {

		return (self.choose(n + 1, 2));

	};

	self.derivative = function(f, o, x) {

		var h = 0.01,
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

		}

		while (true) {

			v1 = f1(x, h);
			h -= h / 2;
			v2 = f1(x, h);
			a[i] = { h: h, d: Math.abs(v1-v2), v1: v1, v2: v2 };

			if (i > 0 && a[i].d > a[i - 1].d) {
				return a[i - 1].v1; // prevent loss of significance and instability
			} else {
				i += 1;
			}

		}

		return false;

	};

	self.integral = function(f, a, b) {

		var n = 4,
			i = 0,
			dx = (b - a) / n,
			r = [],
			v1 = 0,
			v2 = 0,
			j = a;

		while (n < 128) {

			while (dx > 0) {

				if (j === a || j === b)
					v1 += f(j);
				else if (j % (2 * dx) === 0)
					v1 += 2 * f(j);
				else
					v1 += 4 * f(j);

				j += dx;

				if (j > b)
					break;

			}

			j = a;
			v1 *= dx / 3;
			n *= 2;
			dx = (b - a) / n;

			while (dx > 0) {

				if (j === a || j === b)
					v2 += f(j);
				else if (j % (2 * dx) === 0)
					v2 += 2 * f(j);
				else
					v2 += 4 * f(j);

				j += dx;

				if (j > b)
					break;

			}

			v2 *= dx / 3;
			r[i] = { n: n, d: Math.abs(v1 - v2), v1: v1, v2: v2 };

			if (i > 0 && r[i].d > r[i - 1].d)
				return r[i - 1].v1; // prevent loss of significance and instability
			else
				i += 1;

		}

		return false;
		// (b-a)/n * ( f(a)/2 + sum(k=1,n-1)[f(a+k*(b-a)/n)] + f(b)/2 )

	};

	self.sq_size = function(num) {

		var m = Math.floor(Math.sqrt(num));

		if (num % m === 0) {

			return m;

		} else {

			for (var i=1; i<(m-1); i++) {
				if (num % (m - i) === 0)
					return (m - i);
			}

			return m;

		}

	};

	self.arr_dump = function(array, key, rows) {

		var l = array.length;

		if (typeof rows === 'undefined') {
			rows = self.sq_size(l);
		}

		var str='[';

		for (var i=0; i<l; i++) {

			if (i % rows === 0) {

				str += '\n';

				/*str += '<small class="ln">';

				if ((i + 1).toString().length < 2)
					str += '0';

				str += (i + 1) + '-';

				if ((i + 1 + rows).toString().length < 2)
					str += '0';

				str += (i + rows) + '</small>';*/

			}

			str += (typeof key === 'undefined') ? '\t' + array[i] + ',' : '\t' + Math.round(array[i][key] * 10000) / 10000 + ',';

			/*if (i % rows === rows - 1)
				str += '\t';*/

		}

		str = str.slice(0,-1);

		str += '\n]';

		return str;

	};

	return self;

}