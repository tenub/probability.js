BigNumber.config({ DECIMAL_PLACES : 1E+9 });

/*
 * Add probability distribution functionality to the severely lacking JavaScript Math object
 */

// Define helper functions
Math.h={
	isInt:function(n){
		return typeof n==='number' && n%1===0;
	},
	factorial:function(n){
		var i=0;
		if(!Math.h.isInt(n)){
			// Lanczos Approximation of the Gamma Function
			// As described in Numerical Recipes in C (2nd ed. Cambridge University Press, 1992)
			var z=n+1;
			var p=[1.000000000190015,76.18009172947146,-86.50532032941677,24.01409824083091,-1.231739572450155,1.208650973866179E-3,-5.395239384953E-6];
			var d1=Math.sqrt(2*Math.PI)/z;
			var d2=p[0];
			for(i=1; i<=6; ++i)
				d2+=p[i]/(z+i);
			var d3=Math.pow((z+5.5),(z+0.5));
			var d4=Math.exp(-(z+5.5));
			return d1*d2*d3*d4;
		}else{
			var f=(n<0)?undefined:1;
			for(i=n; i>1; --i) f*=i;
			return f;
		}
	},
	choose:function(n,k){
		return Math.h.factorial(n)/(Math.h.factorial(n-k)*Math.h.factorial(k));
	},
	triangular:function(n){
		return Math.h.choose(n+1,2);
	},
	derivative:function(f,o,x,e){
		var h=0.01,d,arr=[],v1,v2,v,f1;
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
		while((typeof v1==='undefined' && typeof v2==='undefined') || /*d>1E-9*/ Math.abs(v1-v2)>e) {
			v1=f1(x,h);
			h-=h/2;
			v2=f1(x,h);
			/*d=Math.abs(v1-v2);
			arr.push({diff:d,val:v2});*/
		}
		function error(h,o){
			switch(o){
				case 1:
					return Math.pow(h,4);
				case 2:
					return Math.pow(h,4);
				case 3:
					return Math.pow(h,2);
				case 4:
					return Math.pow(h,2);
			}
		}
		/*var v=arr.filter(function(el){
			return el.diff!==0;
		}).sort(function(a,b){
			return a.diff-b.diff;
		})[0].val;
		if(typeof v!=='undefined') return v;
		else return undefined;*/
		return v2;
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
			return Math.h.derivative(f,1,t,1E-7);
		},
		variance:function(f,t){
			return Math.h.derivative(f,2,t,1E-6)-Math.pow(Math.p.m.mean(f,t),2);
		},
		skewness:function(f,t){
			return (Math.h.derivative(f,3,t,1E-4)-3*Math.p.m.mean(f,t)*Math.p.m.variance(f,t)-Math.pow(Math.p.m.mean(f,t),3))/Math.pow(Math.p.m.variance(f,t),1.5);
		},
		kurtosis:function(f,t){
			return Math.h.derivative(f,4,t,1E-1)/Math.pow(Math.p.m.variance(f,t),2)-3;
		}
	},
	// Define distribution sub-object
	d:{
		binomial:{
			params:{
				p:{title:'Probability',min:0,max:1,step:0.05,value:0.5},
				n:{title:'Trials',min:0,max:100,step:1,value:40}//,
				//k:{title:'Successes',min:0,max:100,step:1,value:20}
			},
			mgf:function(p,n){
				return function(t){
					return Math.pow((1-p+p*Math.exp(t)),n);
				};	// (1-p+p*e^t)^n;
			},
			pdf:function(p,n,k){
				return Math.h.choose(n,k)*Math.pow(p,k)*Math.pow((1-p),(n-k));
					// (n k)*p^k*(1-p)^(n-k)
			},
			cdf:function(p,n,k){
				var k_f=Math.floor(k),
					F=0;
				for(var i=0; i<k_f; i++){
					F+=(Math.h.choose(n,i)*Math.pow(p,i)*Math.pow((1-p),(n-i)));
					// (n i)*p^i*(1-p)^(n-i)
				}
				return F;
			}
		},
		geometric:{
			params:{
				p:{title:'Probability',min:0,max:1,step:0.05,value:0.5},
				k:{title:'TTS',min:0,max:100,step:1,value:40}
			},
			mgf:function(p){
				return function(t){
					return p/(1-(1-p)*Math.exp(t));
				};	// p/(1-(1-p)*e^t);
			},
			pdf:function(p,k){
				return Math.pow(1-p,k)*p;
					// (1-p)^k*p
			},
			cdf:function(p,k){
				return 1-Math.pow((1-p),(k+1));
					// 1-(1-p)^(k+1)
			}
		}
	}
};

/*

First off, I play a wide range of games but mainly stick to CS 1.6, Dota 2, Path Of Exile, & Rift on ONE 1920x1080 resolution screen (I use the other for streaming, etc.). My current computer is unable to run Rift with reasonable FPS and maximum settings. With supersampling I get a pitiful 15 fps and with edge smoothing I am able to play but 20-25 fps is definitely not anything to get excited about. Back when I first got the computer and was running CrossFireX I was able to run Metro 2033 at maximum settings and a playable ~32 fps. I would prefer to be able to try games utilizing newer technologies in the foreseeable future at a reasonable fps.

Current System:
CPU: i7 930 (no longer OCed to 4.5GHz, now at 3.0GHz)
HSF: custom dual radiator water cooling loop (~$300)
MBO: Asus Sabertooth X58
RAM: G.Skill 2x3GB PC1600
GPU: Asus Radeon HD6850 (no longer in CrossFire, only using one)
PSU: Seasonic 760W modular
SSD: ADATA S599 64GB (used ONLY for OS)
HDD: WD 500GB, Samsung Spinpoint F4 2TB (WD partitioned as 250/250 - 1st partition used for user files and all program installations, 2nd partition for Ubuntu install)
CSE: Coolermaster HAF 932 (full window)

Monitor(s): 2x Acer G235H

I built this system roughly in Q3 of 2010, so it's been nearly 3 years since I've even payed attention to any new computer-related technology advancements. After landing a steady, fairly well-paying job and receiving a large tax refund for 2013 I have been more and more interested in replacing my computer in its entirety or possibly just parts of it. Unfortunately, after tons of research over the past week or so, it seems technology has not really advanced much with the exception of maybe SSDs and GPUs. However, the more I think about my current setup, the more I realize that what I really want is to get rid of this 30 pound pile of ridiculousness that is the HAF 932 and the headache that is a custom water cooling loop that I don't even fully utilize anymore (despite me not having cleaned it out EVER, partially out of fear of causing a leak and partly out of sheer laziness; this is in fact the reason why I reduced my overclock after about a year). But then I realize getting a new case would require removing and reassembling the water cooling loop (amongst other components) and that I might as well just replace everything. Now I'm stuck in an endless cycle of indecision.

The new components I have been thinking about:

CPU: i7 4770K
HSF: Noctua  or Corsair H100i
MBO: Z87
RAM: G.Skill 2x8GB PC1600
GPU: GTX 770 or GTX 780 or GTX 780 ti
PSU: reuse
SSD: Samsung 840 Evo 250GB
HDD: 2x 
CSE: Corsair 250D

As you can see here, my goal is to run a computer that is easy to move while attempting to reduce noise in comparison to my current system.

I guess the broader question is: is it even worth doing a full upgrade at this time? I really don't think I could wait 6-7 months for the new Maxwell cards or 6-12+ months for Broadwell (if it's even going to be that much better than Haswell).

*/