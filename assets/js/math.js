/*
 * Add probability distribution functionality to the severely lacking JavaScript Math object
 */

// Define helper functions
Math.h={
	factorial:function(n){
		var f=(n<0)?undefined:1;
		for(var i=n; i>1; --i) f*=i;
		return f;
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
	}
};

// Define probability object
Math.p={
	// Define moments
	m:{
		mean:function(){
			return p*n;
		},
		variance:function(){
			return p*n*(1-p);
		},
		skewness:function(){
			return (1-2*p)/Math.sqrt(p*n*(1-p));
		},
		kurtosis:function(){
			return (1-6*p*(1-p))/(p*n*(1-p));
		}
	},
	// Define distribution sub-object
	d:{
		binomial:{
			exd_val:function(p,n){
				return p*n;
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