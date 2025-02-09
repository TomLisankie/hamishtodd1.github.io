function init31() {

    let basisNames = ["", "1", "2", "3", "4", "12", "13", "14", "23", "24", "34", "123", "412", "413", "423", "0123"]
	let onesWithMinus = ["31", "021", "032"] //yes you could reverse the orders in the string but it's established

	let indexForXPartOfQuaternion = 8
	let indexForYPartOfQuaternion = 6
	let indexForZPartOfQuaternion = 5

	const GRADES_OF_ELEMENTS = [0, 1,1,1,1, 2,2,2,2,2,2, 3,3,3,3, 4]

	class Mv extends Float32Array {
		constructor() {
			super(16)
		}

		copy(a) {
			for (let i = 0; i < 16; ++i)
				this[i] = a[i]

			return this
		}

		clone() {
			let cl = new Mv()
			cl.copy(this)

			return cl
		}

		log(label) {
			let str = ""
			for (let i = 0; i < basisNames.length; ++i) {
				if (this[i] !== 0.) {
					if (str !== "")
						str += " + "

					let sign = 1.
					if (onesWithMinus.indexOf(basisNames[i]) !== -1)
						sign = -1.

					str += (sign * this[i]).toFixed(1) + (i!==0?"e":"") + basisNames[i]
				}
			}

			if (label !== undefined)
				str = label + ": " + str

			if (str === "")
				str += "0."

			console.error(str)
		}

		//aliasing allowed
		reverse(target) {
			if (target === undefined)
				target = new Mv()

			target[0]=this[0]
            target[1]=this[1]
            target[2]=this[2]
            target[3]=this[3]
            target[4]=this[4]
            target[5]=-this[5]
            target[6]=-this[6]
            target[7]=-this[7]
            target[8]=-this[8]
            target[9]=-this[9]
            target[10]=-this[10]
            target[11]=-this[11]
            target[12]=-this[12]
            target[13]=-this[13]
            target[14]=-this[14]
            target[15]=this[15]
			return target
		}

		meet(b,target) {
			if(target === undefined)
				target = new Mv()
			target[0]=b[0]*this[0];
			target[1]=b[1]*this[0]+b[0]*this[1];
			target[2]=b[2]*this[0]+b[0]*this[2];
			target[3]=b[3]*this[0]+b[0]*this[3];
			target[4]=b[4]*this[0]+b[0]*this[4];
			target[5]=b[5]*this[0]+b[2]*this[1]-b[1]*this[2]+b[0]*this[5];
			target[6]=b[6]*this[0]+b[3]*this[1]-b[1]*this[3]+b[0]*this[6];
			target[7]=b[7]*this[0]+b[4]*this[1]-b[1]*this[4]+b[0]*this[7];
			target[8]=b[8]*this[0]+b[3]*this[2]-b[2]*this[3]+b[0]*this[8];
			target[9]=b[9]*this[0]+b[4]*this[2]-b[2]*this[4]+b[0]*this[9];
			target[10]=b[10]*this[0]+b[4]*this[3]-b[3]*this[4]+b[0]*this[10];
			target[11]=b[11]*this[0]+b[8]*this[1]-b[6]*this[2]+b[5]*this[3]+b[3]*this[5]-b[2]*this[6]+b[1]*this[8]+b[0]*this[11];
			target[12]=b[12]*this[0]+b[9]*this[1]-b[7]*this[2]+b[5]*this[4]+b[4]*this[5]-b[2]*this[7]+b[1]*this[9]+b[0]*this[12];
			target[13]=b[13]*this[0]+b[10]*this[1]-b[7]*this[3]+b[6]*this[4]+b[4]*this[6]-b[3]*this[7]+b[1]*this[10]+b[0]*this[13];
			target[14]=b[14]*this[0]+b[10]*this[2]-b[9]*this[3]+b[8]*this[4]+b[4]*this[8]-b[3]*this[9]+b[2]*this[10]+b[0]*this[14];
			target[15]=b[15]*this[0]+b[14]*this[1]-b[13]*this[2]+b[12]*this[3]-b[11]*this[4]+b[10]*this[5]-b[9]*this[6]+b[8]*this[7]+b[7]*this[8]-b[6]*this[9]+b[5]*this[10]+b[4]*this[11]-b[3]*this[12]+b[2]*this[13]-b[1]*this[14]+b[0]*this[15];
			return target;
		}

		join(b, target) {
			if(target === undefined)
				target = new Mv()
			target[15]=1.*(this[15]*b[15]);
			target[14]=-1.*(this[14]*-1.*b[15]+this[15]*b[14]*-1);
			target[13]=1.*(this[13]*b[15]+this[15]*b[13]);
			target[12]=-1.*(this[12]*-1.*b[15]+this[15]*b[12]*-1);
			target[11]=1.*(this[11]*b[15]+this[15]*b[11]);
			target[10]=1.*(this[10]*b[15]+this[13]*b[14]*-1-this[14]*-1.*b[13]+this[15]*b[10]);
			target[9]=-1.*(this[9]*-1.*b[15]+this[12]*-1.*b[14]*-1-this[14]*-1.*b[12]*-1+this[15]*b[9]*-1);
			target[8]=1.*(this[8]*b[15]+this[11]*b[14]*-1-this[14]*-1.*b[11]+this[15]*b[8]);
			target[7]=1.*(this[7]*b[15]+this[12]*-1.*b[13]-this[13]*b[12]*-1+this[15]*b[7]);
			target[6]=-1.*(this[6]*-1.*b[15]+this[11]*b[13]-this[13]*b[11]+this[15]*b[6]*-1);
			target[5]=1.*(this[5]*b[15]+this[11]*b[12]*-1-this[12]*-1.*b[11]+this[15]*b[5]);
			target[4]=-1.*(this[4]*-1.*b[15]+this[7]*b[14]*-1-this[9]*-1.*b[13]+this[10]*b[12]*-1+this[12]*-1.*b[10]-this[13]*b[9]*-1+this[14]*-1.*b[7]+this[15]*b[4]*-1);
			target[3]=1.*(this[3]*b[15]+this[6]*-1.*b[14]*-1-this[8]*b[13]+this[10]*b[11]+this[11]*b[10]-this[13]*b[8]+this[14]*-1.*b[6]*-1+this[15]*b[3]);
			target[2]=-1.*(this[2]*-1.*b[15]+this[5]*b[14]*-1-this[8]*b[12]*-1+this[9]*-1.*b[11]+this[11]*b[9]*-1-this[12]*-1.*b[8]+this[14]*-1.*b[5]+this[15]*b[2]*-1);
			target[1]=1.*(this[1]*b[15]+this[5]*b[13]-this[6]*-1.*b[12]*-1+this[7]*b[11]+this[11]*b[7]-this[12]*-1.*b[6]*-1+this[13]*b[5]+this[15]*b[1]);
			target[0]=1.*(this[0]*b[15]+this[1]*b[14]*-1-this[2]*-1.*b[13]+this[3]*b[12]*-1-this[4]*-1.*b[11]+this[5]*b[10]-this[6]*-1.*b[9]*-1+this[7]*b[8]+this[8]*b[7]-this[9]*-1.*b[6]*-1+this[10]*b[5]+this[11]*b[4]*-1-this[12]*-1.*b[3]+this[13]*b[2]*-1-this[14]*-1.*b[1]+this[15]*b[0]);
			return target;
		}

		inner(b, target) {
			if(target === undefined)
				target = new Mv()
			target[0]=b[0]*this[0]+b[1]*this[1]+b[2]*this[2]+b[3]*this[3]-b[4]*this[4]-b[5]*this[5]-b[6]*this[6]+b[7]*this[7]-b[8]*this[8]+b[9]*this[9]+b[10]*this[10]-b[11]*this[11]+b[12]*this[12]+b[13]*this[13]+b[14]*this[14]-b[15]*this[15];
			target[1]=b[1]*this[0]+b[0]*this[1]-b[5]*this[2]-b[6]*this[3]+b[7]*this[4]+b[2]*this[5]+b[3]*this[6]-b[4]*this[7]-b[11]*this[8]+b[12]*this[9]+b[13]*this[10]-b[8]*this[11]+b[9]*this[12]+b[10]*this[13]-b[15]*this[14]+b[14]*this[15];
			target[2]=b[2]*this[0]+b[5]*this[1]+b[0]*this[2]-b[8]*this[3]+b[9]*this[4]-b[1]*this[5]+b[11]*this[6]-b[12]*this[7]+b[3]*this[8]-b[4]*this[9]+b[14]*this[10]+b[6]*this[11]-b[7]*this[12]+b[15]*this[13]+b[10]*this[14]-b[13]*this[15];
			target[3]=b[3]*this[0]+b[6]*this[1]+b[8]*this[2]+b[0]*this[3]+b[10]*this[4]-b[11]*this[5]-b[1]*this[6]-b[13]*this[7]-b[2]*this[8]-b[14]*this[9]-b[4]*this[10]-b[5]*this[11]-b[15]*this[12]-b[7]*this[13]-b[9]*this[14]+b[12]*this[15];
			target[4]=b[4]*this[0]+b[7]*this[1]+b[9]*this[2]+b[10]*this[3]+b[0]*this[4]-b[12]*this[5]-b[13]*this[6]-b[1]*this[7]-b[14]*this[8]-b[2]*this[9]-b[3]*this[10]-b[15]*this[11]-b[5]*this[12]-b[6]*this[13]-b[8]*this[14]+b[11]*this[15];
			target[5]=b[5]*this[0]+b[11]*this[3]-b[12]*this[4]+b[0]*this[5]+b[15]*this[10]+b[3]*this[11]-b[4]*this[12]+b[10]*this[15];
			target[6]=b[6]*this[0]-b[11]*this[2]-b[13]*this[4]+b[0]*this[6]-b[15]*this[9]-b[2]*this[11]-b[4]*this[13]-b[9]*this[15];
			target[7]=b[7]*this[0]-b[12]*this[2]-b[13]*this[3]+b[0]*this[7]-b[15]*this[8]-b[2]*this[12]-b[3]*this[13]-b[8]*this[15];
			target[8]=b[8]*this[0]+b[11]*this[1]-b[14]*this[4]+b[15]*this[7]+b[0]*this[8]+b[1]*this[11]-b[4]*this[14]+b[7]*this[15];
			target[9]=b[9]*this[0]+b[12]*this[1]-b[14]*this[3]+b[15]*this[6]+b[0]*this[9]+b[1]*this[12]-b[3]*this[14]+b[6]*this[15];
			target[10]=b[10]*this[0]+b[13]*this[1]+b[14]*this[2]-b[15]*this[5]+b[0]*this[10]+b[1]*this[13]+b[2]*this[14]-b[5]*this[15];
			target[11]=b[11]*this[0]+b[15]*this[4]+b[0]*this[11]-b[4]*this[15];
			target[12]=b[12]*this[0]+b[15]*this[3]+b[0]*this[12]-b[3]*this[15];
			target[13]=b[13]*this[0]-b[15]*this[2]+b[0]*this[13]+b[2]*this[15];
			target[14]=b[14]*this[0]+b[15]*this[1]+b[0]*this[14]-b[1]*this[15];
			target[15]=b[15]*this[0]+b[0]*this[15];
			return target;
		}

		sub(b, target) {
			if (target !== undefined)
				console.error("no target for this")
			this[1] = this[1]-b[1];
			this[2] = this[2]-b[2];
			this[3] = this[3]-b[3];
			this[4] = this[4]-b[4];
			this[5] = this[5]-b[5];
			this[6] = this[6]-b[6];
			this[7] = this[7]-b[7];
			this[8] = this[8]-b[8];
			this[9] = this[9]-b[9];
			this[10] = this[10]-b[10];
			this[11] = this[11]-b[11];
			this[12] = this[12]-b[12];
			this[13] = this[13]-b[13];
			this[14] = this[14]-b[14];
			this[15] = this[15]-b[15];
			return target;
		}

		multiplyScalar(a) {
			this[ 0] = this[ 0] * a
			this[ 1] = this[ 1] * a
			this[ 2] = this[ 2] * a
			this[ 3] = this[ 3] * a
			this[ 4] = this[ 4] * a
			this[ 5] = this[ 5] * a
			this[ 6] = this[ 6] * a
			this[ 7] = this[ 7] * a
			this[ 8] = this[ 8] * a
			this[ 9] = this[ 9] * a
			this[10] = this[10] * a
			this[11] = this[11] * a
			this[12] = this[12] * a
			this[13] = this[13] * a
			this[14] = this[14] * a
			this[15] = this[15] * a
			return this
		}

		conjugate(target) {
			if (target === undefined)
				target = new Mv()

			target[0] = this[0];
			target[1] = -this[1];
			target[2] = -this[2];
			target[3] = -this[3];
			target[4] = -this[4];
			target[5] = -this[5];
			target[6] = -this[6];
			target[7] = -this[7];
			target[8] = -this[8];
			target[9] = -this[9];
			target[10] = -this[10];
			target[11] = this[11];
			target[12] = this[12];
			target[13] = this[13];
			target[14] = this[14];
			target[15] = this[15];
			return target;
		}

		dual(target) {
			if (target === undefined)
				target = new Mv()

			target[0]=-this[15];
            target[1]=-this[14];
            target[2]=this[13];
            target[3]=-this[12];
            target[4]=-this[11];
            target[5]=this[10];
            target[6]=-this[9];
            target[7]=-this[8];
            target[8]=this[7];
            target[9]=this[6];
            target[10]=-this[5];
            target[11]=this[4];
            target[12]=this[3];
            target[13]=-this[2];
            target[14]=this[1];
            target[15]=this[0];
			return target;
		}

		exp(target) {
			if (!this.hasGrade(2))
				return target.copy(oneMv)
				
			let S = -this[5] * this[5] - this[6] * this[6] + this[7] * this[7] - this[8] * this[8] + this[9] * this[9] + this[10] * this[10]
			let T = 2. * (this[5] * this[10] - this[6] * this[9] + this[7] * this[8])
			// ||B*B||
			let norm = Math.sqrt(S * S + T * T)


			// P_+ = xB + y*e1234*B
			let [x, y] = [0.5 * (1. + S / norm), -0.5 * T / norm];
			let [lp, lm] = [Math.sqrt(0.5 * S + 0.5 * norm), Math.sqrt(-0.5 * S + 0.5 * norm)]
			let [cp, sp] = [Math.cosh(lp), lp === 0. ? 1. : Math.sinh(lp) / lp]
			let [cm, sm] = [Math.cos(lm), lm === 0. ? 1. : Math.sin(lm) / lm]
			let [cmsp, cpsm] = [cm * sp, cp * sm]
			let [alpha, beta] = [(cmsp - cpsm) * x + cpsm, (cmsp - cpsm) * y]

			// Combine the two Euler's formulas together.
			target.rotor(
				cp * cm,
				(this[5] * alpha + this[10] * beta), (this[6] * alpha - this[9] * beta),
				(this[7] * alpha - this[8] * beta), (this[8] * alpha + this[7] * beta),
				(this[9] * alpha + this[6] * beta), (this[10] * alpha - this[5] * beta),
				sp * sm * T / 2.
			)

			return target
		}

		normalize() {
			let ourGrade = this.grade()
			if(0) {
				let isRotor = ourGrade !== 1 && ourGrade !== 3
				if (isRotor) {
					// this.log()
					// debugger
					let S = this[0] * this[0] + this[5] * this[5] + this[6] * this[6] - this[7] * this[7] + this[8] * this[8] - this[9] * this[9] - this[10] * this[10] - this[15] * this[15]
					let T = 2 * (this[0] * this[15] - this[5] * this[10] + this[6] * this[9] - this[7] * this[8])
					let N = ((S * S + T * T) ** .5 + S) ** .5, N2 = N * N
					let denom = (N2 * N2 + T * T)
					if(denom === 0.)
						debugger
	
					let ND = 2 ** .5 * N / denom
					let C = N2 * ND, D = -T * ND
	
					return this.rotor(
						C * this[0] - D * this[15], C * this[5] + D * this[10], C * this[6] - D * this[9], C * this[7] - D * this[8],
						C * this[8] + D * this[7], C * this[9] + D * this[6], C * this[10] - D * this[5], C * this[15] + D * this[0]
					)
				}
			}
			 
			{
				let ourNorm = this.norm()
				if (ourNorm === 0.)
					debugger
				//some things are meant to be null. Maybe they should get w = 1. But they shouldn't be here
				this.multiplyScalar(1. / ourNorm)
				return this
			}
		}

		

		logarithm(target) {

			if(this.hasGrade(0) && !this.hasGrade(2))
				return target.copy(zeroMv)
			
			// B*B = S + T*e1234
			let S = this[0] * this[0] - this[15] * this[15] - 1;
			let T = 2 * (this[0] * this[15])
			let norm = Math.sqrt(S * S + T * T)

			let [x, y] = [0.5 * (1 + S / norm), -0.5 * T / norm];
			// lp is always a boost, lm a rotation
			let [lp, lm] = [Math.sqrt(0.5 * S + 0.5 * norm), Math.sqrt(-0.5 * S + 0.5 * norm)]
			let theta2 = lm == 0 ? 0 : Math.atan2(lm, this[0]);
			let theta1 = Math.atanh(lp / this[0]);
			let [w1, w2] = [lp == 0 ? 0 : theta1 / lp, lm == 0 ? 0 : theta2 / lm]
			let [A, B] = [(w1 - w2) * x + w2, w1 == 0 ? Math.atanh(-this[15] / lm) / lm : (w1 - w2) * y];
			
			return target.line(
				this[5] * A + this[10] * B, this[6] * A - this[9] * B, this[7] * A - this[8] * B,
				this[8] * A + this[7] * B, this[9] * A + this[6] * B, this[10] * A - this[5] * B
			)
		}

		mul(b, target) {
			if(target === undefined)
				target = new Mv()
			target[0]=b[0]*this[0]+b[1]*this[1]+b[2]*this[2]+b[3]*this[3]-b[4]*this[4]-b[5]*this[5]-b[6]*this[6]+b[7]*this[7]-b[8]*this[8]+b[9]*this[9]+b[10]*this[10]-b[11]*this[11]+b[12]*this[12]+b[13]*this[13]+b[14]*this[14]-b[15]*this[15];
			target[1]=b[1]*this[0]+b[0]*this[1]-b[5]*this[2]-b[6]*this[3]+b[7]*this[4]+b[2]*this[5]+b[3]*this[6]-b[4]*this[7]-b[11]*this[8]+b[12]*this[9]+b[13]*this[10]-b[8]*this[11]+b[9]*this[12]+b[10]*this[13]-b[15]*this[14]+b[14]*this[15];
			target[2]=b[2]*this[0]+b[5]*this[1]+b[0]*this[2]-b[8]*this[3]+b[9]*this[4]-b[1]*this[5]+b[11]*this[6]-b[12]*this[7]+b[3]*this[8]-b[4]*this[9]+b[14]*this[10]+b[6]*this[11]-b[7]*this[12]+b[15]*this[13]+b[10]*this[14]-b[13]*this[15];
			target[3]=b[3]*this[0]+b[6]*this[1]+b[8]*this[2]+b[0]*this[3]+b[10]*this[4]-b[11]*this[5]-b[1]*this[6]-b[13]*this[7]-b[2]*this[8]-b[14]*this[9]-b[4]*this[10]-b[5]*this[11]-b[15]*this[12]-b[7]*this[13]-b[9]*this[14]+b[12]*this[15];
			target[4]=b[4]*this[0]+b[7]*this[1]+b[9]*this[2]+b[10]*this[3]+b[0]*this[4]-b[12]*this[5]-b[13]*this[6]-b[1]*this[7]-b[14]*this[8]-b[2]*this[9]-b[3]*this[10]-b[15]*this[11]-b[5]*this[12]-b[6]*this[13]-b[8]*this[14]+b[11]*this[15];
			target[5]=b[5]*this[0]+b[2]*this[1]-b[1]*this[2]+b[11]*this[3]-b[12]*this[4]+b[0]*this[5]-b[8]*this[6]+b[9]*this[7]+b[6]*this[8]-b[7]*this[9]+b[15]*this[10]+b[3]*this[11]-b[4]*this[12]+b[14]*this[13]-b[13]*this[14]+b[10]*this[15];
			target[6]=b[6]*this[0]+b[3]*this[1]-b[11]*this[2]-b[1]*this[3]-b[13]*this[4]+b[8]*this[5]+b[0]*this[6]+b[10]*this[7]-b[5]*this[8]-b[15]*this[9]-b[7]*this[10]-b[2]*this[11]-b[14]*this[12]-b[4]*this[13]+b[12]*this[14]-b[9]*this[15];
			target[7]=b[7]*this[0]+b[4]*this[1]-b[12]*this[2]-b[13]*this[3]-b[1]*this[4]+b[9]*this[5]+b[10]*this[6]+b[0]*this[7]-b[15]*this[8]-b[5]*this[9]-b[6]*this[10]-b[14]*this[11]-b[2]*this[12]-b[3]*this[13]+b[11]*this[14]-b[8]*this[15];
			target[8]=b[8]*this[0]+b[11]*this[1]+b[3]*this[2]-b[2]*this[3]-b[14]*this[4]-b[6]*this[5]+b[5]*this[6]+b[15]*this[7]+b[0]*this[8]+b[10]*this[9]-b[9]*this[10]+b[1]*this[11]+b[13]*this[12]-b[12]*this[13]-b[4]*this[14]+b[7]*this[15];
			target[9]=b[9]*this[0]+b[12]*this[1]+b[4]*this[2]-b[14]*this[3]-b[2]*this[4]-b[7]*this[5]+b[15]*this[6]+b[5]*this[7]+b[10]*this[8]+b[0]*this[9]-b[8]*this[10]+b[13]*this[11]+b[1]*this[12]-b[11]*this[13]-b[3]*this[14]+b[6]*this[15];
			target[10]=b[10]*this[0]+b[13]*this[1]+b[14]*this[2]+b[4]*this[3]-b[3]*this[4]-b[15]*this[5]-b[7]*this[6]+b[6]*this[7]-b[9]*this[8]+b[8]*this[9]+b[0]*this[10]-b[12]*this[11]+b[11]*this[12]+b[1]*this[13]+b[2]*this[14]-b[5]*this[15];
			target[11]=b[11]*this[0]+b[8]*this[1]-b[6]*this[2]+b[5]*this[3]+b[15]*this[4]+b[3]*this[5]-b[2]*this[6]-b[14]*this[7]+b[1]*this[8]+b[13]*this[9]-b[12]*this[10]+b[0]*this[11]+b[10]*this[12]-b[9]*this[13]+b[7]*this[14]-b[4]*this[15];
			target[12]=b[12]*this[0]+b[9]*this[1]-b[7]*this[2]+b[15]*this[3]+b[5]*this[4]+b[4]*this[5]-b[14]*this[6]-b[2]*this[7]+b[13]*this[8]+b[1]*this[9]-b[11]*this[10]+b[10]*this[11]+b[0]*this[12]-b[8]*this[13]+b[6]*this[14]-b[3]*this[15];
			target[13]=b[13]*this[0]+b[10]*this[1]-b[15]*this[2]-b[7]*this[3]+b[6]*this[4]+b[14]*this[5]+b[4]*this[6]-b[3]*this[7]-b[12]*this[8]+b[11]*this[9]+b[1]*this[10]-b[9]*this[11]+b[8]*this[12]+b[0]*this[13]-b[5]*this[14]+b[2]*this[15];
			target[14]=b[14]*this[0]+b[15]*this[1]+b[10]*this[2]-b[9]*this[3]+b[8]*this[4]-b[13]*this[5]+b[12]*this[6]-b[11]*this[7]+b[4]*this[8]-b[3]*this[9]+b[2]*this[10]+b[7]*this[11]-b[6]*this[12]+b[5]*this[13]+b[0]*this[14]-b[1]*this[15];
			target[15]=b[15]*this[0]+b[14]*this[1]-b[13]*this[2]+b[12]*this[3]-b[11]*this[4]+b[10]*this[5]-b[9]*this[6]+b[8]*this[7]+b[7]*this[8]-b[6]*this[9]+b[5]*this[10]+b[4]*this[11]-b[3]*this[12]+b[2]*this[13]-b[1]*this[14]+b[0]*this[15];

			return target
		}

		simpleDiv(b, target) {
			if (target === undefined)
				target = new Mv()

			b.simpleInverse(localMv0)
			this.mul(localMv0,target)

			return target
		}

		add(b, target) {
			if (target !== undefined)
				console.error("no target for this")

			this[0] = this[0] + b[0];
			this[1] = this[1] + b[1];
			this[2] = this[2] + b[2];
			this[3] = this[3] + b[3];
			this[4] = this[4] + b[4];
			this[5] = this[5] + b[5];
			this[6] = this[6] + b[6];
			this[7] = this[7] + b[7];
			this[8] = this[8] + b[8];
			this[9] = this[9] + b[9];
			this[10] = this[10] + b[10];
			this[11] = this[11] + b[11];
			this[12] = this[12] + b[12];
			this[13] = this[13] + b[13];
			this[14] = this[14] + b[14];
			this[15] = this[15] + b[15];
			return this;
		}

		dualSelf() {
			this.dual(localMv0)
			this.copy(localMv0)

			return this
		}

		plane(x, y, z, w) {
			this.copy(zeroMv)
			this[1] = x
			this[2] = y
			this[3] = z

			this[4] = w === undefined ? 1. : w

			return this
		}

		point(x, y, z, w) {
			this.copy(zeroMv)
			this[14] = x
			this[13] = y
			this[12] = z 

			this[11] = w === undefined ? 1. : w

			return this
		}

		rotor(m0, m1, m2, m3, m4, m5, m6, m7) {
			this[0] = 0. || m0

			this[1] = 0.
			this[2] = 0.
			this[3] = 0.
			this[4] = 0.

			this[5] = 0. || m1
			this[6] = 0. || m2
			this[7] = 0. || m3

			this[8] = 0. || m4
			this[9] = 0. || m5
			this[10] = 0. || m6

			this[11] = 0.
			this[12] = 0.
			this[13] = 0.
			this[14] = 0.

			this[15] = 0. || m7

			return this
		}

		line( m0, m1, m2, m3, m4, m5 ) {
			this.rotor(0., m0, m1, m2, m3, m4, m5, 0.)

			return this
		}

		similarTo(m) {
			let ret = true
			for(let i = 0; i < 16; ++i) {
				if (Math.abs(m[i] - this[i]) > 0.01)
					ret = false
			}
			return ret
		}

		simpleInverse(target) {
			if (target === undefined)
				target = new Mv()

			localMv0.copy(zeroMv)
			this.mul(this,localMv0)
			for(let i = 1; i < 16; ++i) {
				if (Math.abs(localMv0[i]) > .00001)
					console.error("trying to take inverse of a non-simple multivector")
			}
			if(localMv0[0] === 0.)
				console.error("trying to take inverse of null multivector")
			let thisSquaredReciprocal = 1. / localMv0[0]
			target.copy(this)
			target.multiplyScalar(thisSquaredReciprocal)
			return target
		}

		x() {
			return this[14]
		}
		y() {
			return this[13]
		}
		z() {
			return this[12]
		}

		direction(x,y,z) {
			this.copy(zeroMv)
			this[13] = x
			this[12] = y
			this[11] = z

			this[14] = 0.

			return this
		}

		toVector(target) {
			if(target === undefined)
				target = new THREE.Vector3()

			if(this[11] === 0.) {
				console.error("direction. No reason to turn this into a position")
			}
			else {
				target.x = this[14] / this[11]
				target.y = this[13] / this[11]
				target.z = this[12] / this[11]
			}

			return target
		}

		fromVector(vec) {
			this.copy(zeroMv)
			this[14] = vec.x
			this[13] = vec.y
			this[12] = vec.z
			this[11] = 1. //yeah, we're taking a vertical slice at this level, no biggie

			return this
		}

		// fromQuaternion(q) {

		// }

		toQuaternion(target) {
			if(target === undefined)
				target = new THREE.Quaternion()

			target.set(
				this[indexForXPartOfQuaternion], 
				this[indexForYPartOfQuaternion], 
				this[indexForZPartOfQuaternion], 
				this[0])
			target.normalize()
			return target
		}

		fromQuaternion(q) {
			this[0] = q.w
			this[10] = q.x
			this[9] = q.y
			this[8] = q.z
			return this
		}

		//threejs has the same setup of quaternions
		// {
		// 	// let epgaDir = new Mv().direction(1., 0., 0.)
        //     // let epgaRotor = new Mv()
        //     // add(e31, oneMv, epgaRotor).normalize()
        //     // epgaRotor.sandwich(epgaDir, mv0)
		// 	// log("with PGA:")
        //     // mv0.log()

		// 	// let threeDir = new THREE.Vector3(1., 0., 0.)
		// 	// let threeQuaternion = new THREE.Quaternion(0., 1., 0., 1.)
        //     // threeQuaternion.normalize()
        //     // threeDir.applyQuaternion(threeQuaternion)
		// 	// log("with THREE:")
		// 	// log(threeDir)
        // }

		equals(mv) {
			let ret = true
			for(let i = 0; i < 16; ++i) {
				if(Math.abs(mv[i] !== this[i]) > .0001)
					ret = false
			}
			return ret
		}

		norm() {
			// float norm() { return sqrt(std:: abs(((* this) * Conjugate())[0]); }
    		// float inorm() { return (!(* this)).norm(); }

			//previously this was the conjugate. They reformulated in plane_and_simple
			this.reverse(localMv0)
			this.mul( localMv0,localMv1)
			return Math.sqrt(Math.abs(localMv1[0]))
		}

		//aliasing works
		sqrt(target) {
			if(target === undefined)
				target = new Mv()

			target.copy(this)
			target[0] += 1.
			target.normalize()
			return target
		}

		selectGrade(grade,target) {
			if(target === undefined)
				target = new Mv()
				
			target.copy(this)
			for(let i = 0; i < 16; ++i) {
				if(grade !== GRADES_OF_ELEMENTS[i])
					target[i] = 0.
			}

			return target
		}

		hasGrade(grade) {
			if (grade === 0 )
				return this[0] !== 0.
			if (grade === 1)
				return (this[1] !== 0. || this[2] !== 0. || this[3] !== 0. || this[4] !== 0.)
			if (grade === 2)
				return (this[5] !== 0. || this[6] !== 0. || this[7] !== 0. || this[8] !== 0. || this[9] !== 0. || this[10] !== 0.)
			if (grade === 3)
				return (this[11] !== 0. || this[12] !== 0. || this[13] !== 0. || this[14] !== 0.)
			if (grade === 4)
				return this[15] !== 0.
		}

		grade() {
			for(let i = 0; i < 5; ++i) {
				if (this.hasGrade(i))
					return i
			}
		}

		sandwich(mvToBeSandwiched, target) {
			if (target === undefined)
				target = new Mv()

			this.reverse(localMv0)

			this.mul(mvToBeSandwiched, localMv1)
			localMv1.mul(localMv0,target)

			let ks = mvToBeSandwiched.grade() * this.grade()
			if(ks % 2 === 0)
				target.multiplyScalar(-1.)

			return target
		}
	}
	window.Mv = Mv

	projectPointOnLine = (p, l, target) => {
		if (target === undefined)
			target = new Mv()
		cleave(l, p, lv2LocalMv0)
		lv2LocalMv0.mul( l, target)

		return target
	}

	projectLineOnPoint = (l, p, target) => {
		if (target === undefined)
			target = new Mv()

		cleave(l, p, lv2LocalMv0)
		lv2LocalMv0.mul(p, target)

		return target
	}

	rotorFromAxisAngle = (axis,angle,target) => {
		if (target === undefined)
			target = new Mv()

		target.copy(axis)
		target.normalize()
		target.multiplyScalar(Math.sin(angle / 2.))
		
		target[0] = Math.cos(angle / 2.)

		return target
	}

	orientedDistancePointPlane = (pt, pl) => {
		lv2LocalMv0.copy(pt).normalize()
		lv2LocalMv1.copy(pl).normalize()
		join(lv2LocalMv0, lv2LocalMv1, lv2LocalMv2)
		return lv2LocalMv2[0]
	}
	distancePointPlane = (pt,pl) => {
		return Math.abs(orientedDistancePointPlane(pt,pl))
	}

	distancePointPoint = (pt1, pt2) => {
		lv2LocalMv0.copy(pt1).normalize()
		lv2LocalMv1.copy(pt2).normalize()
		lv2LocalMv0.join(lv2LocalMv1, lv2LocalMv2)
		return Math.abs(lv2LocalMv2.norm())
	}

	

	function MvFromIndexAndFloat(float, index) {
		let mv = new Mv()
		mv[index] = float
		return mv
	}

	zeroMv = new Mv()
	oneMv = new Mv()
	oneMv[0] = 1.

	e1 = MvFromIndexAndFloat(1., 1)
	e2 = MvFromIndexAndFloat(1., 2)
	e3 = MvFromIndexAndFloat(1., 3)
	e4 = MvFromIndexAndFloat(1., 4)
	e41 = e4.mul(e1)
	e42 = e4.mul(e2)
	e43 = e4.mul(e3)
	e12 = e1.mul(e2)
	e31 = e3.mul(e1)
	e23 = e2.mul(e3)
	e412 = e41.mul(e2)
	e413 = e41.mul(e3)
	e423 = e42.mul(e3)
	e123 = e12.mul(e3)
	e1234 = e123.mul(e4)

	nInfinity = e3.clone().add(e4)
	nOrigin = e3.clone().multiplyScalar(-1.).add(e4)

	// let infinityOnSphere

    // static R310 e1(1.0f, 1);
    // static R310 e2(1.0f, 2);
    // static R310 e3(1.0f, 3);
    // static R310 e4(1.0f, 4);
    // static R310 e12(1.0f, 5);
    // static R310 e13(1.0f, 6);
    // static R310 e14(1.0f, 7);
    // static R310 e23(1.0f, 8);
    // static R310 e24(1.0f, 9);
    // static R310 e34(1.0f, 10);
    // static R310 e123(1.0f, 11);
    // static R310 e124(1.0f, 12);
    // static R310 e134(1.0f, 13);
    // static R310 e234(1.0f, 14);
    // static R310 e1234(1.0f, 15);

	let localMv0 = new Mv()
	let localMv1 = new Mv()
	let localMv2 = new Mv()
	let localMv3 = new Mv()

	let lv2LocalMv0 = new Mv()
	let lv2LocalMv1 = new Mv()
	let lv2LocalMv2 = new Mv()
	let lv2LocalMv3 = new Mv()
	let lv2LocalMv4 = new Mv()
	let lv2LocalMv5 = new Mv()
	let lv2LocalMv6 = new Mv()
	let lv2LocalMv7 = new Mv()
	let lv2LocalMv8 = new Mv()

	mv0 = new Mv()
	mv1 = new Mv()
	mv2 = new Mv()
	mv3 = new Mv()
	mv4 = new Mv()
	mv5 = new Mv()
	mv6 = new Mv()
	mv7 = new Mv()
	mv8 = new Mv()

	xyzNullPoints = [
		e423.clone().add(e123),
		e413.clone().add(e123),
		e412.clone().add(e123)] //actually these should probably have a w part!

	// oneInfinityIPoints = [
	// 	complexToHorosphere(new Complex(1., 0.), new Complex(1., 0.)),
	// 	complexToHorosphere(new Complex(1., 0.), new Complex(1., 0.)),
	// 	complexToHorosphere(new Complex(0., 1.), new Complex(0., 0.)),
	// ]
}

function cleave(l, p, target) {
	return l.inner(p,target)
}