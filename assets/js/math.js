/*
 * Add probability distribution functionality to the severely lacking JavaScript Math object
 */

// Define helper functions
Math.h={
	isInt:function(n){
		return typeof n==='number' && n%1==0;
	},
	factorial:function(n){
		if(!Math.h.isInt(n)){
			// Lanczos Approximation of the Gamma Function
			// As described in Numerical Recipes in C (2nd ed. Cambridge University Press, 1992)
			var z=n+1;
			var p=[1.000000000190015,76.18009172947146,-86.50532032941677,24.01409824083091,-1.231739572450155,1.208650973866179E-3,-5.395239384953E-6];
			var d1=Math.sqrt(2*Math.PI)/z;
			var d2=p[0];
			for(var i=1; i<=6; ++i)
				d2+=p[i]/(z+i);
			var d3=Math.pow((z+5.5),(z+0.5));
			var d4=Math.exp(-(z+5.5));
			return d1*d2*d3*d4;
		}else{
			var f=(n<0)?undefined:1;
			for(var i=n; i>1; --i) f*=i;
			return f;
		}
	},
	choose:function(n,k){
		return Math.h.factorial(n)/(Math.h.factorial(n-k)*Math.h.factorial(k));
	},
	arr_dump:function(array,rows){
		l=array.length;
		if(typeof rows==='undefined'){
			rows=Math.h.sq_size(l);
		}
		var str='[';
		for(var i=0; i<l; i++){
			if(i%rows===0){
				str+='\n';
				/*str+='<small class="ln">';
				if((i+1).toString().length<2)
					str+='0';
				str+=(i+1)+'-';
				if((i+1+rows).toString().length<2)
					str+='0';
				str+=(i+rows)+'</small>';*/
			}
			str+='\t'+array[i]+',';
			/*if(i%rows===rows-1)
				str+='\t';*/
		}
		str=str.slice(0,-1);
		str+='\n]';
		return str;
	},
	sq_size:function(num){
		var m=Math.floor(Math.sqrt(num));
		if(num%m===0)
			return m;
		else{
			for(var i=1; i<(m-1); i++){
				if(num%(m-i)===0)
					return (m-i);
			}
			return m;
		}
	},
	derivative:function(f,o){
		var x, h=0.0001;
		switch(order){
			case 1:
				return -(f(x+2*h)+8*f(x+h)-8*f(x-h)+f(x-2*h))/12*h;
			case 2:
				return -(f(x+2*h)+16*f(x+h)-30*f(x)+16*f(x-h)-f(x-2*h))/12*Math.pow(h,2);
			case 3:
				return (f(x+2*h)-2*f(x+h)+2*f(x-h)-f(x-2*h))/2*Math.pow(h,3);
			case 4:
				return (f(x+2*h)-4*f(x+h)+6*f(x)-4*f(x-h)+f(x-2*h))/Math.pow(h,4);
			default:
				return 0;
		}
	}
};

// Define function evaluation object
Math.e={
	operators:['+','-','*','/','^'],
	eval:function(f){
		var s=[];
		f=f.split(' ');

		/*	While there are input tokens left
		 *		Read the next token from input.
		 *		If the token is a value
		 *			Push it onto the stack.
		 *		Otherwise, the token is an operator (operator here includes both operators and functions).
		 *			It is known a priori that the operator takes n arguments.
		 *			If there are fewer than n values on the stack
		 *				(Error) The user has not input sufficient values in the expression.
		 *			Else, Pop the top n values from the stack.
		 *			Evaluate the operator, with the values as arguments.
		 *			Push the returned results, if any, back onto the stack.
		 *	If there is only one value in the stack
		 *		That value is the result of the calculation.
		 *	Otherwise, there are more values in the stack
		 *		(Error) The user input has too many values.
		 */

		for(var i=0, l=f.length; i<l; i++){
			if(/[^^\/*!+-]/.test(f[i]))
				s.push(f[i]);
			else{
				s.splice(0,2);
				switch(f[i]){
					case '+':
						s.push(s[0]+s[1]);
						break;
					case '-':
						s.push(s[0]-s[1]);
						break;
					case '*':
						s.push(s[0]*s[1]);
						break;
					case '/':
						s.push(s[0]/s[1]);
						break;
					case '^':
						s.push(Math.pow(s[0],s[1]));
						break;
				}
			}
		}

		console.log(s);

		return s;
	}
};

// Define probability object
Math.p={
	// Define moments
	m:{
		mean:function(f){
			return Math.h.derivative(f,1); // p*n
		},
		variance:function(){
			return Math.h.derivative(f,2); // p*n*(1-p)
		},
		skewness:function(){
			return Math.h.derivative(f,3); // (1-2*p)/Math.sqrt(p*n*(1-p))
		},
		kurtosis:function(){
			return Math.h.derivative(f,4); // (1-6*p*(1-p))/(p*n*(1-p))
		}
	},
	// Define distribution sub-object
	d:{
		binomial:{
			mgf:function(p,n){
				return '1 0.5 - 2.71 0.1 ^ 0.5 * + 10'; // '1 p - e t ^ p * + n'; // (1-p+p*e^t)^n;
			},
			pmf:function(p,n,k){
				return Math.round(Math.h.choose(n,k)*Math.pow(p,k)*Math.pow((1-p),(n-k))*10000)/10000;
			},
			cdf:function(p,n,k){
				var k_f=Math.floor(k),
					F=0;
				for(var i=0; i<k_f; i++){
					F+=(Math.h.choose(n,i)*Math.pow(p,i)*Math.pow((1-p),(n-i)));
				}
				return Math.round(F*10000)/10000;
			}
		}
	}
};