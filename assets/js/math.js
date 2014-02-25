/*
 * Add probability distribution functionality to the severely lacking JavaScript Math object
 */

// Define helper functions
Math.h={
	isInt:function(n){
		return typeof n==='number' && n%1===0;
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
	triangular:function(n){
		return Math.h.choose(n+1,2);
	},
	derivative:function(f,o,x){
		var h=0.01,v1,v2,f1;
		switch(o){
			case 1:
				f1=function(x,h){ return (-f(x+2*h)+8*f(x+h)-8*f(x-h)+f(x-2*h))/(12*h); };
				break;
			case 2:
				f1=function(x,h){ return (-f(x+2*h)+16*f(x+h)-30*f(x)+16*f(x-h)-f(x-2*h))/(12*Math.pow(h,2)); };
				break;
			case 3:
				f1=function(x,h){ return (f(x+2*h)-2*f(x+h)+2*f(x-h)-f(x-2*h))/(2*Math.pow(h,3)); };
				break;
			case 4:
				f1=function(x,h){ return (f(x+2*h)-4*f(x+h)+6*f(x)-4*f(x-h)+f(x-2*h))/Math.pow(h,4); };
				break;
		}
		while((typeof v1==='undefined' && typeof v2==='undefined') || Math.abs(v1-v2)>1E-5) {
			v1=f1(x,h);
			h-=h/2;
			v2=f1(x,h);
		}
		return (h>1E-7)?v2:undefined;
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
	arr_dump:function(array,key,rows){
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
			str+=(typeof key==='undefined')?'\t'+array[i]+',':'\t'+array[i][key]+',';
			/*if(i%rows===rows-1)
				str+='\t';*/
		}
		str=str.slice(0,-1);
		str+='\n]';
		return str;
	}
};

// Define probability object
Math.p={
	// Define moments
	m:{
		mean:function(f,t){
			return Math.h.derivative(f,1,t);
		},
		variance:function(f,t){
			return Math.h.derivative(f,2,t)-Math.pow(Math.p.m.mean(f,t),2);
		},
		skewness:function(f,t){
			return (Math.h.derivative(f,3,t)-3*Math.p.m.mean(f,t)*Math.p.m.variance(f,t)-Math.pow(Math.p.m.mean(f,t),3))/Math.pow(Math.p.m.variance(f,t),1.5);
		},
		kurtosis:function(f,t){
			return Math.h.derivative(f,4,t)/Math.pow(Math.p.m.variance(f,t),2)-3; // (1-6*p*(1-p))/(p*n*(1-p))
		}
	},
	// Define distribution sub-object
	d:{
		binomial:{
			params:{
				p:'Probability',
				n:'Trials',
				k:'Successes'
			},
			mgf:function(p,n){
				return function(t){
					return Math.pow(1-p+p*Math.exp(t),n);
				}; // (1-p+p*e^t)^n;
			},
			pdf:function(p,n,k){
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
		},
		geometric:{
			params:{
				p:'Probability',
				k:'TTS'
			},
			mgf:function(p){
				return function(t){
					return p/(1-(1-p)*Math.exp(t));
				}; // p/(1-(1-p)*e^t);
			},
			pdf:function(p,k){
				return Math.round(Math.pow(1-p,k)*p*10000)/10000;
			},
			cdf:function(p,k){
				return Math.round((1-Math.pow((1-p),(k+1)))*10000)/10000;
			}
		}
	}
};