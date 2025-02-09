//if you visualize the line as having a length and direction, well, sounds like a vector mate
//at least it's not a vectors that's stuck at the origin

function initAlgebra()
{
    function replaceSignature(newSignature,func) {
        let gaFunctionJsString = func.toString()
        let firstLinebreakIndex = gaFunctionJsString.indexOf("\n")
        let bodyString = gaFunctionJsString.substring(firstLinebreakIndex)
        return newSignature + bodyString
    }

    gaShaderString = ``
    function appendToGaShaderString(glslBody) {
        gaShaderString += "\n" + glslBody + "\n"
    }

    // appendToGaShaderString( `
    //     void mercatorLog(inout float mv[16], inout float target[16]) {
    //         zeroMv(target);
    //         target[14] = mv[14];
    //         target[13] = mv[13];
    //         target[12] = mv[12];
    //         target[11] = log(mv[12]);
    //     }
    //     `
    // )
    // mercatorLog = function(mv,target) {
    //     zeroMv(target);
    //     target[14] = mv[14];
    //     target[13] = mv[13];g
    //     target[12] = mv[12];
    //     mv[11] = Math.log(mv[12]);
    // }

    let ourPss = new Float32Array(16)
    ourPss[15] = 1.
    polarize = function(mv,target)
    {
        gProduct(mv,ourPss,target);
    }

    

    // gAsin = function(mv,target) {
    //     zeroMv(target)

    //     target[0] = Math.asin()
    // }

    // dqToAlignThreePoints(p0,p1,p2, q0,q1,q2) {
    //     let P = new Float32Array(16)
    //     let Q = new Float32Array(16)
    //     P[15] = 1.
    //     Q[15] = 1.

    //     let M = new Float32Array(16)
    //     M[0] = 1.

    //     sandwichBab(p0,M,mv0)
    //     join(Q,mv0,P)
    //     join(Q,q0,Q)
    //     //need the inverse of P for the next line. Involute?

    //     // euclideanNormalizeMotor(mv)
    //     // gProduct()
    // }

    //mv
    {
        isMv = function(obj) {
            return obj instanceof Float32Array && obj.length === 16
        }

        //urgh, should target be first?
        appendToGaShaderString(replaceSignature(
            "void assign(float mv[16], out float target[16])",
            assign = (mv,target) =>
            {
                target[ 0] = mv[ 0];
                target[ 1] = mv[ 1];
                target[ 2] = mv[ 2];
                target[ 3] = mv[ 3];
                target[ 4] = mv[ 4];
                target[ 5] = mv[ 5];
                target[ 6] = mv[ 6];
                target[ 7] = mv[ 7];
                target[ 8] = mv[ 8];
                target[ 9] = mv[ 9];
                target[10] = mv[10];
                target[11] = mv[11];
                target[12] = mv[12];
                target[13] = mv[13];
                target[14] = mv[14];
                target[15] = mv[15];
            }
        ))

        parseMv = function (str, target) {
            let valuesArr = str.split(",")
            for (let i = 0; i < 16; ++i)
                target[i] = parseFloat(valuesArr[i])
        }

        mv0 = new Float32Array(16)
        mv1 = new Float32Array(16)
        mv2 = new Float32Array(16)
        mv3 = new Float32Array(16)
        mv4 = new Float32Array(16)
        nonAlgebraTempMv0 = new Float32Array(16)
        nonAlgebraTempMv1 = new Float32Array(16)
        nonAlgebraTempMv2 = new Float32Array(16)
        nonAlgebraTempMv3 = new Float32Array(16)
        nonAlgebraTempMv4 = new Float32Array(16)
        appendToGaShaderString( `
            float mv0[16];
            float mv1[16];
            float mv2[16];
            float mv3[16];
            float mv4[16];
            
            float nonAlgebraTempMv0[16];
            float nonAlgebraTempMv1[16];
            float nonAlgebraTempMv2[16];
            float nonAlgebraTempMv3[16];
            float nonAlgebraTempMv4[16];
            
            vec4 tempVec4;` )


        // t[11] = p[11] * r[0] + p[13] * r[9] - p[12] * r[10]
        // t[12] = p[12] * r[0] - p[13] * r[8] + p[11] * r[10]
        // t[13] = p[13] * r[0] + p[12] * r[8] - p[11] * r[9]
        // t[14] = p[14] * r[0]
        //next one is reversed a and b AND conjugated
        // appendToGaShaderString(replaceSignature(
        //     "void pointRotorSandwich(in vec4 p,in vec4 r,out vec4 t)",
        //     pointRotorSandwich = (p,r,t) => {
        //         //rotor: 0 = the scalar part of the rotor
        //         // / the homogenous part
        //         //one day do this
        //     }
        // ))

        euclideanNormMotor = (mv) =>{
            reverse(mv, mv0);
            gProduct(mv, mv0, mv1);
            return Math.sqrt(mv1[0]);
        }
        euclideanNormalizeMotor = (mv) => {
            let norm = euclideanNormMotor(mv)
            multiplyScalar(mv, 1. / norm);
        }

        sqrtMotor = (mv) => {
            mv[0] += 1.
            euclideanNormalizeMotor(mv)
        }

        appendToGaShaderString(replaceSignature(
            "void gProduct(float a[16],float b[16],out float target[16])",
            gProduct = (a, b, target) =>
            {
                target[ 0] = b[ 0] * a[ 0] + b[ 2] * a[ 2] + b[ 3] * a[ 3] + b[ 4] * a[ 4] - b[ 8] * a[ 8] - b[ 9] * a[ 9] - b[10] * a[10] - b[14] * a[14];

                target[ 1] = b[ 1] * a[ 0] + b[ 0] * a[ 1] - b[ 5] * a[ 2] - b[ 6] * a[ 3] - b[ 7] * a[ 4] + b[ 2] * a[ 5] + b[ 3] * a[ 6] + b[ 4] * a[ 7] + b[11] * a[ 8] + b[12] * a[ 9] + b[13] * a[10] + b[ 8] * a[11] + b[ 9] * a[12] + b[10] * a[13] + b[15] * a[14] - b[14] * a[15];
                target[ 2] = b[ 2] * a[ 0] + b[ 0] * a[ 2] - b[ 8] * a[ 3] + b[ 9] * a[ 4] + b[ 3] * a[ 8] - b[ 4] * a[ 9] - b[14] * a[10] - b[10] * a[14];
                target[ 3] = b[ 3] * a[ 0] + b[ 8] * a[ 2] + b[ 0] * a[ 3] - b[10] * a[ 4] - b[ 2] * a[ 8] - b[14] * a[ 9] + b[ 4] * a[10] - b[ 9] * a[14];
                target[ 4] = b[ 4] * a[ 0] - b[ 9] * a[ 2] + b[10] * a[ 3] + b[ 0] * a[ 4] - b[14] * a[ 8] + b[ 2] * a[ 9] - b[ 3] * a[10] - b[ 8] * a[14];

                target[ 5] = b[ 5] * a[ 0] + b[ 2] * a[ 1] - b[ 1] * a[ 2] - b[11] * a[ 3] + b[12] * a[ 4] + b[ 0] * a[ 5] - b[ 8] * a[ 6] + b[ 9] * a[ 7] + b[ 6] * a[ 8] - b[ 7] * a[ 9] - b[15] * a[10] - b[ 3] * a[11] + b[ 4] * a[12] + b[14] * a[13] - b[13] * a[14] - b[10] * a[15];
                target[ 6] = b[ 6] * a[ 0] + b[ 3] * a[ 1] + b[11] * a[ 2] - b[ 1] * a[ 3] - b[13] * a[ 4] + b[ 8] * a[ 5] + b[ 0] * a[ 6] - b[10] * a[ 7] - b[ 5] * a[ 8] - b[15] * a[ 9] + b[ 7] * a[10] + b[ 2] * a[11] + b[14] * a[12] - b[ 4] * a[13] - b[12] * a[14] - b[ 9] * a[15];
                target[ 7] = b[ 7] * a[ 0] + b[ 4] * a[ 1] - b[12] * a[ 2] + b[13] * a[ 3] - b[ 1] * a[ 4] - b[ 9] * a[ 5] + b[10] * a[ 6] + b[ 0] * a[ 7] - b[15] * a[ 8] + b[ 5] * a[ 9] - b[ 6] * a[10] + b[14] * a[11] - b[ 2] * a[12] + b[ 3] * a[13] - b[11] * a[14] - b[ 8] * a[15];
                target[ 8] = b[ 8] * a[ 0] + b[ 3] * a[ 2] - b[ 2] * a[ 3] + b[14] * a[ 4] + b[ 0] * a[ 8] + b[10] * a[ 9] - b[ 9] * a[10] + b[ 4] * a[14];
                target[ 9] = b[ 9] * a[ 0] - b[ 4] * a[ 2] + b[14] * a[ 3] + b[ 2] * a[ 4] - b[10] * a[ 8] + b[ 0] * a[ 9] + b[ 8] * a[10] + b[ 3] * a[14];
                target[10] = b[10] * a[ 0] + b[14] * a[ 2] + b[ 4] * a[ 3] - b[ 3] * a[ 4] + b[ 9] * a[ 8] - b[ 8] * a[ 9] + b[ 0] * a[10] + b[ 2] * a[14];

                target[11] = b[11] * a[ 0] - b[ 8] * a[ 1] + b[ 6] * a[ 2] - b[ 5] * a[ 3] + b[15] * a[ 4] - b[ 3] * a[ 5] + b[ 2] * a[ 6] - b[14] * a[ 7] - b[ 1] * a[ 8] + b[13] * a[ 9] - b[12] * a[10] + b[ 0] * a[11] + b[10] * a[12] - b[ 9] * a[13] + b[ 7] * a[14] - b[ 4] * a[15];
                target[12] = b[12] * a[ 0] - b[ 9] * a[ 1] - b[ 7] * a[ 2] + b[15] * a[ 3] + b[ 5] * a[ 4] + b[ 4] * a[ 5] - b[14] * a[ 6] - b[ 2] * a[ 7] - b[13] * a[ 8] - b[ 1] * a[ 9] + b[11] * a[10] - b[10] * a[11] + b[ 0] * a[12] + b[ 8] * a[13] + b[ 6] * a[14] - b[ 3] * a[15];
                target[13] = b[13] * a[ 0] - b[10] * a[ 1] + b[15] * a[ 2] + b[ 7] * a[ 3] - b[ 6] * a[ 4] - b[14] * a[ 5] - b[ 4] * a[ 6] + b[ 3] * a[ 7] + b[12] * a[ 8] - b[11] * a[ 9] - b[ 1] * a[10] + b[ 9] * a[11] - b[ 8] * a[12] + b[ 0] * a[13] + b[ 5] * a[14] - b[ 2] * a[15];
                target[14] = b[14] * a[ 0] + b[10] * a[ 2] + b[ 9] * a[ 3] + b[ 8] * a[ 4] + b[ 4] * a[ 8] + b[ 3] * a[ 9] + b[ 2] * a[10] + b[ 0] * a[14];

                target[15] = b[15] * a[ 0] + b[14] * a[ 1] + b[13] * a[ 2] + b[12] * a[ 3] + b[11] * a[ 4] + b[10] * a[ 5] + b[ 9] * a[ 6] + b[ 8] * a[ 7] + b[ 7] * a[ 8] + b[ 6] * a[ 9] + b[ 5] * a[10] - b[ 4] * a[11] - b[ 3] * a[12] - b[ 2] * a[13] - b[ 1] * a[14] + b[ 0] * a[15];
            }
        ))

        appendToGaShaderString(replaceSignature(
            "void join(float a[16], float b[16], out float target[16])",
            join = (a, b, target) =>
            {
                target[15] = a[15] * b[15];
                target[14] =-a[14] * b[15] - a[15] * b[14];
                target[13] =-a[13] * b[15] - a[15] * b[13];
                target[12] =-a[12] * b[15] - a[15] * b[12];
                target[11] =-a[11] * b[15] - a[15] * b[11];
                target[10] = a[10] * b[15] + a[13] * b[14] - a[14] * b[13] + a[15] * b[10];
                target[ 9] = a[ 9] * b[15] + a[12] * b[14] - a[14] * b[12] + a[15] * b[ 9];
                target[ 8] = a[ 8] * b[15] + a[11] * b[14] - a[14] * b[11] + a[15] * b[ 8];
                target[ 7] = a[ 7] * b[15] + a[12] * b[13] - a[13] * b[12] + a[15] * b[ 7];
                target[ 6] = a[ 6] * b[15] - a[11] * b[13] + a[13] * b[11] + a[15] * b[ 6];
                target[ 5] = a[ 5] * b[15] + a[11] * b[12] - a[12] * b[11] + a[15] * b[ 5];
                target[ 4] = a[ 4] * b[15] - a[ 7] * b[14] + a[ 9] * b[13] - a[10] * b[12] + a[12] * b[10] - a[13] * b[ 9] + a[14] * b[ 7] + a[15] * b[ 4];
                target[ 3] = a[ 3] * b[15] - a[ 6] * b[14] - a[ 8] * b[13] + a[10] * b[11] - a[11] * b[10] + a[13] * b[ 8] + a[14] * b[ 6] + a[15] * b[ 3];
                target[ 2] = a[ 2] * b[15] - a[ 5] * b[14] + a[ 8] * b[12] - a[ 9] * b[11] + a[11] * b[ 9] - a[12] * b[ 8] + a[14] * b[ 5] + a[15] * b[ 2];
                target[ 1] = a[ 1] * b[15] + a[ 5] * b[13] + a[ 6] * b[12] + a[ 7] * b[11] - a[11] * b[ 7] - a[12] * b[ 6] - a[13] * b[ 5] + a[15] * b[ 1];
                target[ 0] = a[ 0] * b[15] + a[ 1] * b[14] + a[ 2] * b[13] + a[ 3] * b[12] - a[ 4] * b[11] + a[ 5] * b[10] + a[ 6] * b[ 9] + a[ 7] * b[ 8]
                       + a[ 8] * b[ 7] + a[ 9] * b[ 6] + a[10] * b[ 5] + a[11] * b[ 4] + a[12] * b[ 3] + a[13] * b[ 2] + a[14] * b[ 1] + a[15] * b[ 0];
            }
        ))
        
        appendToGaShaderString(replaceSignature(
            "void meet(float a[16], float b[16], out float target[16])",
            meet = (a, b, target) =>
            {
                target[0]=b[0]*a[0];
                target[1]=b[1]*a[0]+b[0]*a[1];
                target[2]=b[2]*a[0]+b[0]*a[2];
                target[3]=b[3]*a[0]+b[0]*a[3];
                target[4]=b[4]*a[0]+b[0]*a[4];
                target[5]=b[5]*a[0]+b[2]*a[1]-b[1]*a[2]+b[0]*a[5];
                target[6]=b[6]*a[0]+b[3]*a[1]-b[1]*a[3]+b[0]*a[6];
                target[7]=b[7]*a[0]+b[4]*a[1]-b[1]*a[4]+b[0]*a[7];
                target[8]=b[8]*a[0]+b[3]*a[2]-b[2]*a[3]+b[0]*a[8];
                target[9]=b[9]*a[0]-b[4]*a[2]+b[2]*a[4]+b[0]*a[9];
                target[10]=b[10]*a[0]+b[4]*a[3]-b[3]*a[4]+b[0]*a[10];
                target[11]=b[11]*a[0]-b[8]*a[1]+b[6]*a[2]-b[5]*a[3]-b[3]*a[5]+b[2]*a[6]-b[1]*a[8]+b[0]*a[11];
                target[12]=b[12]*a[0]-b[9]*a[1]-b[7]*a[2]+b[5]*a[4]+b[4]*a[5]-b[2]*a[7]-b[1]*a[9]+b[0]*a[12];
                target[13]=b[13]*a[0]-b[10]*a[1]+b[7]*a[3]-b[6]*a[4]-b[4]*a[6]+b[3]*a[7]-b[1]*a[10]+b[0]*a[13];
                target[14]=b[14]*a[0]+b[10]*a[2]+b[9]*a[3]+b[8]*a[4]+b[4]*a[8]+b[3]*a[9]+b[2]*a[10]+b[0]*a[14];
                target[15]=b[15]*a[0]+b[14]*a[1]+b[13]*a[2]+b[12]*a[3]+b[11]*a[4]+b[10]*a[5]+b[9]*a[6]+b[8]*a[7]+b[7]*a[8]+b[6]*a[9]+b[5]*a[10]-b[4]*a[11]-b[3]*a[12]-b[2]*a[13]-b[1]*a[14]+b[0]*a[15];
            }
        ))


        appendToGaShaderString(replaceSignature(
            "void inner(float a[16], float b[16], out float target[16])",
            inner = (a, b, target) =>
            {
                target[ 0] = b[ 0] * a[ 0] + b[ 2] * a[ 2] + b[ 3] * a[ 3] + b[ 4] * a[ 4] - b[ 8] * a[ 8] - b[ 9] * a[ 9] - b[10] * a[10] - b[14] * a[14];
                target[ 1] = b[ 1] * a[ 0] + b[ 0] * a[ 1] - b[ 5] * a[ 2] - b[ 6] * a[ 3] - b[ 7] * a[ 4] + b[ 2] * a[ 5] + b[ 3] * a[ 6] + b[ 4] * a[ 7] + b[11] * a[ 8] + b[12] * a[ 9] + b[13] * a[10] + b[ 8] * a[11] + b[ 9] * a[12] + b[10] * a[13] + b[15] * a[14] - b[14] * a[15];
                target[ 2] = b[ 2] * a[ 0] + b[ 0] * a[ 2] - b[ 8] * a[ 3] + b[ 9] * a[ 4] + b[ 3] * a[ 8] - b[ 4] * a[ 9] - b[14] * a[10] - b[10] * a[14];
                target[ 3] = b[ 3] * a[ 0] + b[ 8] * a[ 2] + b[ 0] * a[ 3] - b[10] * a[ 4] - b[ 2] * a[ 8] - b[14] * a[ 9] + b[ 4] * a[10] - b[ 9] * a[14];
                target[ 4] = b[ 4] * a[ 0] - b[ 9] * a[ 2] + b[10] * a[ 3] + b[ 0] * a[ 4] - b[14] * a[ 8] + b[ 2] * a[ 9] - b[ 3] * a[10] - b[ 8] * a[14];
                target[ 5] = b[ 5] * a[ 0] - b[11] * a[ 3] + b[12] * a[ 4] + b[ 0] * a[ 5] - b[15] * a[10] - b[ 3] * a[11] + b[ 4] * a[12] - b[10] * a[15];
                target[ 6] = b[ 6] * a[ 0] + b[11] * a[ 2] - b[13] * a[ 4] + b[ 0] * a[ 6] - b[15] * a[ 9] + b[ 2] * a[11] - b[ 4] * a[13] - b[ 9] * a[15];
                target[ 7] = b[ 7] * a[ 0] - b[12] * a[ 2] + b[13] * a[ 3] + b[ 0] * a[ 7] - b[15] * a[ 8] - b[ 2] * a[12] + b[ 3] * a[13] - b[ 8] * a[15];
                target[ 8] = b[ 8] * a[ 0] + b[14] * a[ 4] + b[ 0] * a[ 8] + b[ 4] * a[14];
                target[ 9] = b[ 9] * a[ 0] + b[14] * a[ 3] + b[ 0] * a[ 9] + b[ 3] * a[14];
                target[10] = b[10] * a[ 0] + b[14] * a[ 2] + b[ 0] * a[10] + b[ 2] * a[14];
                target[11] = b[11] * a[ 0] + b[15] * a[ 4] + b[ 0] * a[11] - b[ 4] * a[15];
                target[12] = b[12] * a[ 0] + b[15] * a[ 3] + b[ 0] * a[12] - b[ 3] * a[15];
                target[13] = b[13] * a[ 0] + b[15] * a[ 2] + b[ 0] * a[13] - b[ 2] * a[15];
                target[14] = b[14] * a[ 0] + b[ 0] * a[14];
                target[15] = b[15] * a[ 0] + b[ 0] * a[15];
            }
        ))

        appendToGaShaderString(replaceSignature(
            "void reverse( float mv[16], out float target[16])",
            reverse = (mv, target) =>
            {
                target[ 0] =  mv[ 0];
                
                target[ 1] =  mv[ 1];
                target[ 2] =  mv[ 2];
                target[ 3] =  mv[ 3];
                target[ 4] =  mv[ 4];

                target[ 5] = -mv[ 5];
                target[ 6] = -mv[ 6];
                target[ 7] = -mv[ 7];
                target[ 8] = -mv[ 8];
                target[ 9] = -mv[ 9];
                target[10] = -mv[10];

                target[11] = -mv[11];
                target[12] = -mv[12];
                target[13] = -mv[13];
                target[14] = -mv[14];

                target[15] =  mv[15];
            }
        ))

        appendToGaShaderString(replaceSignature(
            "void sandwichBab(in float a[16],in float b[16],out float target[16])",
            sandwichBab = (a, b, target) =>
            {
                assign(b, mv1);
                reverse(mv1, mv2);
                
                gProduct(b, a, mv0);
                gProduct(mv0, mv2, target);
            }
        ))

        appendToGaShaderString(replaceSignature(
            "void dual( float mv[16], out float target[16])",
            dual = (mv, target) =>
            {
                target[ 0] =  mv[15];
                
                target[ 1] =  mv[14];
                target[ 2] =  mv[13];
                target[ 3] =  mv[12];
                target[ 4] =  mv[11];

                target[ 5] =  mv[10];
                target[ 6] =  mv[ 9];
                target[ 7] =  mv[ 8];
                target[ 8] =  mv[ 7];
                target[ 9] =  mv[ 6];
                target[10] =  mv[ 5];

                target[11] =  mv[ 4];
                target[12] =  mv[ 3];
                target[13] =  mv[ 2];
                target[14] =  mv[ 1];

                target[15] =  mv[ 0];
            }
        ))

        appendToGaShaderString(replaceSignature(
            "void gAdd(float a[16], float b[16], out float target[16])",
            gAdd = (a,b,target) =>
            {
                target[ 0] = a[ 0] + b[ 0];
                target[ 1] = a[ 1] + b[ 1];
                target[ 2] = a[ 2] + b[ 2];
                target[ 3] = a[ 3] + b[ 3];
                target[ 4] = a[ 4] + b[ 4];
                target[ 5] = a[ 5] + b[ 5];
                target[ 6] = a[ 6] + b[ 6];
                target[ 7] = a[ 7] + b[ 7];
                target[ 8] = a[ 8] + b[ 8];
                target[ 9] = a[ 9] + b[ 9];
                target[10] = a[10] + b[10];
                target[11] = a[11] + b[11];
                target[12] = a[12] + b[12];
                target[13] = a[13] + b[13];
                target[14] = a[14] + b[14];
                target[15] = a[15] + b[15];
            }
        ))

        appendToGaShaderString(replaceSignature(
            "void gSub(float a[16], float b[16], inout float mv[16])",
            gSub = (a, b, mv) =>
            {
                mv[0] = a[0] - b[0];
                mv[1] = a[1] - b[1];
                mv[2] = a[2] - b[2];
                mv[3] = a[3] - b[3];
                mv[4] = a[4] - b[4];
                mv[5] = a[5] - b[5];
                mv[6] = a[6] - b[6];
                mv[7] = a[7] - b[7];
                mv[8] = a[8] - b[8];
                mv[9] = a[9] - b[9];
                mv[10] = a[10] - b[10];
                mv[11] = a[11] - b[11];
                mv[12] = a[12] - b[12];
                mv[13] = a[13] - b[13];
                mv[14] = a[14] - b[14];
                mv[15] = a[15] - b[15];
            }
        ))

        angleBetweenLines = (a, b) => {
            inner(a, b, mv0)
            return Math.acos(mv0[0])
        }
        appendToGaShaderString(`
        float angleBetweenLines(in float a[16], in float b[16])
        {
            inner(a,b,mv0);
            return acos(mv0[0]);
        }`)

        distance = (p1,p2) => {
            wNormalizePoint(p1)
            wNormalizePoint(p2)
            gSub(p1,p2,mv0)
            return Math.sqrt(sq(pointX(mv0)) + sq(pointY(mv0)) + sq(pointZ(mv0)) )
        }

        appendToGaShaderString(replaceSignature(
            "void zeroMv(inout float mv[16])",
            zeroMv = (mv) =>
            {
                mv[ 0] = 0.; mv[ 1] = 0.; mv[ 2] = 0.; mv[ 3] = 0.; mv[ 4] = 0.; mv[ 5] = 0.; mv[ 6] = 0.; mv[ 7] = 0.; mv[ 8] = 0.; mv[ 9] = 0.; mv[10] = 0.; mv[11] = 0.; mv[12] = 0.; mv[13] = 0.; mv[14] = 0.; mv[15] = 0.;
            }
        ))
    }

    {
        mvRotator = (axis, angle, target) =>
        {
            assign(axis,target)
            multiplyScalar(target, Math.sin(angle / 2.))
            scalar(target, Math.cos(angle / 2.))
            return target;
        }

        mvToString = (mv) => {
            return mv.toString() + ","
        }

        let eps = .00001
        getGrade = (mv) => {
            let grade = -1
            // debugger
            for(let i = 0; i < 5; ++i) {
                if( containsGrade(mv,i) ) {
                    if (grade === -1)
                        grade = i
                    else
                        return [grade,i]
                }
            }
            return grade === -1 ? 0 : grade
        }
        containsGrade = (mv,grade) => {
            switch(grade) {
                case 0:
                    return Math.abs(mv[0]) > eps
                    break

                case 1: 
                    return Math.abs(planeX(mv)) > eps || Math.abs(planeY(mv)) > eps || Math.abs(planeZ(mv)) > eps || Math.abs(planeW(mv)) > eps
                    break

                case 2:
                    return Math.abs(realLineX(mv)) > eps || Math.abs(realLineY(mv)) > eps || Math.abs(realLineZ(mv)) > eps ||
                    Math.abs(idealLineX(mv)) > eps || Math.abs(idealLineY(mv)) > eps || Math.abs(idealLineZ(mv)) > eps
                    break

                case 3:
                    return Math.abs(pointX(mv)) > eps || Math.abs(pointY(mv)) > eps || Math.abs(pointZ(mv)) > eps || Math.abs(pointW(mv)) > eps
                    break

                case 4:
                    return Math.abs(mv[15]) > eps
                    break
            }
        }

        multiplyScalar = (mv,sca) => {
            mv.forEach((e,i)=>mv[i]*=sca)
        }

        mvEquals = (a,b) => {
            let allEqual = true
            a.forEach((e, i) => { if (a[i] !== b[i]) allEqual = false })
            return allEqual
        }

        scalar     = (mv,newValue) => {if(newValue !== undefined) mv[ 0] = newValue; return mv[ 0] }
        planeW     = (mv,newValue) => {if(newValue !== undefined) mv[ 1] = newValue; return mv[ 1] }
        planeX     = (mv,newValue) => {if(newValue !== undefined) mv[ 2] = newValue; return mv[ 2] }
        planeY     = (mv,newValue) => {if(newValue !== undefined) mv[ 3] = newValue; return mv[ 3] }
        planeZ     = (mv,newValue) => {if(newValue !== undefined) mv[ 4] = newValue; return mv[ 4] }
        idealLineX = (mv,newValue) => {if(newValue !== undefined) mv[ 5] = newValue; return mv[ 5] }
        idealLineY = (mv,newValue) => {if(newValue !== undefined) mv[ 6] = newValue; return mv[ 6] }
        idealLineZ = (mv,newValue) => {if(newValue !== undefined) mv[ 7] = newValue; return mv[ 7] }
        realLineZ  = (mv,newValue) => {if(newValue !== undefined) mv[ 8] = newValue; return mv[ 8] }
        realLineY  = (mv,newValue) => {if(newValue !== undefined) mv[ 9] = newValue; return mv[ 9] }
        realLineX  = (mv,newValue) => {if(newValue !== undefined) mv[10] = newValue; return mv[10] }
        pointZ     = (mv,newValue) => {if(newValue !== undefined) mv[11] = newValue; return mv[11] }
        pointY     = (mv,newValue) => {if(newValue !== undefined) mv[12] = newValue; return mv[12] }
        pointX     = (mv,newValue) => {if(newValue !== undefined) mv[13] = newValue; return mv[13] }
        pointW     = (mv,newValue) => {if(newValue !== undefined) mv[14] = newValue; return mv[14] }
        pss        = (mv,newValue) => {if(newValue !== undefined) mv[15] = newValue; return mv[15] }

        appendToGaShaderString(`
            float pointZ(in float mv[16]) { return mv[11]; }
            void pointZ(inout float mv[16], in float newValue) { mv[11] = newValue; }
            `)
        appendToGaShaderString(`
            float pointY(in float mv[16]) { return mv[12]; }
            void pointY(inout float mv[16], in float newValue) { mv[12] = newValue; }
            `)
        appendToGaShaderString(`
            float pointX(in float mv[16]) { return mv[13]; }
            void pointX(inout float mv[16], in float newValue) { mv[13] = newValue; }
            `)
        appendToGaShaderString(`
            float pointW(in float mv[16]) { return mv[14]; }
            void pointW(inout float mv[16], in float newValue) { mv[14] = newValue; }
            `)

        realLine = (mv,newX,newY,newZ) => { zeroMv(mv); mv[8] = newZ, mv[9] = newY, mv[10] = newX }

        planeNorm = (mv) => { return Math.sqrt(sq(planeX(mv)) + sq(planeY(mv)) + sq(planeZ(mv)))}
        planeNormalize = (mv) => {
            let inverseMagnitude = 1./planeNorm(mv)
            plane(mv,
                planeX(mv) * inverseMagnitude,
                planeY(mv) * inverseMagnitude,
                planeZ(mv) * inverseMagnitude,
                planeW(mv) * inverseMagnitude)
        }

        lineRealNorm = (mv) => { return Math.sqrt(sq(realLineX(mv)) + sq(realLineY(mv)) + sq(realLineZ(mv)))}
        lineIdealNorm = (mv) => { return Math.sqrt(sq(idealLineX(mv)) + sq(idealLineY(mv)) + sq(idealLineZ(mv)))}
        
        lineNormalize = (mv) => {
            let inverseRealNorm = 1. / lineRealNorm(mv)
            realLineX(mv, realLineX(mv) * inverseRealNorm)
            realLineY(mv, realLineY(mv) * inverseRealNorm)
            realLineZ(mv, realLineZ(mv) * inverseRealNorm)
            idealLineX(mv, idealLineX(mv) * inverseRealNorm)
            idealLineY(mv, idealLineY(mv) * inverseRealNorm)
            idealLineZ(mv, idealLineZ(mv) * inverseRealNorm)

            //?
            // let inverseIdealNorm = 1. / lineIdealNorm(mv)
            // idealLineX(mv, idealLineX(mv) * inverseIdealNorm)
            // idealLineY(mv, idealLineY(mv) * inverseIdealNorm)
            // idealLineZ(mv, idealLineZ(mv) * inverseIdealNorm)
        }
    }

    // Planes
    {
        appendToGaShaderString(replaceSignature(
            "void plane(inout float mv[16], float x, float y, float z, float w )",
            plane = (mv,x,y,z,w) =>
            {
                zeroMv(mv);
                mv[4] = z;
                mv[3] = y;
                mv[2] = x;
                mv[1] = w;
            }
        ))
    }

    // Points
    {
        wNormalizePoint = (p) => {
            let w = pointW(p)
            pointX(p, pointX(p) / w)
            pointY(p, pointY(p) / w)
            pointZ(p, pointZ(p) / w)
            pointW(p, 1.)
        }

        directionNormalize = (mv)=> {
            let inv = 1. / Math.sqrt(sq(pointX(mv)) + sq(pointY(mv)) + sq(pointZ(mv)))
            pointX(mv, pointX(mv) * inv)
            pointY(mv, pointY(mv) * inv)
            pointZ(mv, pointZ(mv) * inv)
            pointW(mv, 0.)
        }

        appendToGaShaderString(replaceSignature(
            "void wNormalizePoint(inout float mv[16] )",
            wNormalizePoint = (mv) =>
            {
                mv[11] = mv[11] / mv[14];
                mv[12] = mv[12] / mv[14];
                mv[13] = mv[13] / mv[14];
                mv[14] = 1.;
            }
        ))

        appendToGaShaderString(replaceSignature(
            "void point(inout float mv[16], float x, float y, float z, float w )",
            point = (mv,x,y,z,w) =>
            {
                zeroMv(mv);
                mv[11] = z;
                mv[12] = y;
                mv[13] = x;
                mv[14] = w;
            }
        ))
        origin = new Float32Array(16)
        point(origin,0.,0.,0.,1.)

        appendToGaShaderString(replaceSignature(
            "void pointToMv(vec4 p, inout float mv[16])",
            pointToMv = (p,mv) =>
            {
                zeroMv(mv);
                mv[14] = p[3];
                mv[13] = p[0];
                mv[12] = p[1];
                mv[11] = p[2];
            }
        ))

        appendToGaShaderString(replaceSignature(
            "void mvToPoint(float mv[16], inout vec4 p)",
            mvToPoint = (mv,p) =>
            {
                p[0] = mv[13];
                p[1] = mv[12];
                p[2] = mv[11];
                p[3] = mv[14];
            }
        ))

        pointIdealNorm = (mv) => { return Math.sqrt(sq(pointX(mv)) + sq(pointY(mv)) + sq(pointZ(mv))) }
        normalizeIdealPoint = (mv) => { //"not supposed to do this"?
            let inverseIdealNorm = 1. / pointIdealNorm(mv)
            pointX(mv, pointX(mv) * inverseIdealNorm)
            pointY(mv, pointY(mv) * inverseIdealNorm)
            pointZ(mv, pointZ(mv) * inverseIdealNorm)
            pointW(mv, 0.)
        }

        mvArrayToPointsBuffer = function (mvArray, attributeBuffer) {
            for (let i = 0, il = mvArray.length; i < il; ++i) {
                attributeBuffer[i * 4 + 0] = pointX(mvArray[i])
                attributeBuffer[i * 4 + 1] = pointY(mvArray[i])
                attributeBuffer[i * 4 + 2] = pointZ(mvArray[i])
                attributeBuffer[i * 4 + 3] = pointW(mvArray[i])
            }
        }

        function projectPointOnPlane(point, plane, target) {
            wNormalizePoint(point)
            let planeDotPoint = mv0
            inner(point, plane, planeDotPoint)
            gProduct(planeDotPoint, plane, target)
            wNormalizePoint(target)
            return target
        }
    }

    initDualQuaternions(appendToGaShaderString, replaceSignature)

    function changeAngleAndNormalize(pointMv, angleMultiple) {
        // debugger
        let oldIdealNorm = pointIdealNorm(pointMv)
        if(oldIdealNorm === 0.) {
            pointW(pointMv,1.)
            return
        }
        let angle = Math.atan2(oldIdealNorm, pointW(pointMv))
        let newAngle = angle * angleMultiple
        let newIdealNorm = Math.sin(newAngle) //we really want this to be 1 when it is. It is 1 when

        let xyzMultiplier = newIdealNorm / oldIdealNorm
        pointX(pointMv, pointX(pointMv) * xyzMultiplier)
        pointY(pointMv, pointY(pointMv) * xyzMultiplier)
        pointZ(pointMv, pointZ(pointMv) * xyzMultiplier)
        pointW(pointMv, Math.sqrt(1. - sq(newIdealNorm)))
    }
    appendToGaShaderString(`
        float sq(float x) {
            return x*x;
        }

        void changeAngleAndNormalize(inout vec4 point, float angleMultiple) {
            float oldIdealNorm = length(point.xyz);
            float angle = atan(oldIdealNorm, point.w);
            float newAngle = angle * angleMultiple;
            float newIdealNorm = sin(newAngle);

            float xyzMultiplier = newIdealNorm / oldIdealNorm;
            point.x *= xyzMultiplier;
            point.y *= xyzMultiplier;
            point.z *= xyzMultiplier;
            point.w = sqrt(1.-sq(newIdealNorm));
        }
    `)

    appendToGaShaderString(`
        void planeToBall(inout vec4 planePoint) {
            changeAngleAndNormalize(planePoint, 2.);
        }
    `)
    planeToBall = (planePoint, targetBallPoint) => {
        assign(planePoint, targetBallPoint)
        changeAngleAndNormalize(targetBallPoint, .5)
    }

    ballToPlane = (ballPoint, targetPlanePoint) => {
        //if the pointIdealNorm is greater than 1...
        //yes it might be nice to have it go round and round
        let norm = pointIdealNorm(ballPoint)
        if (norm > 1.) {
            pointX(ballPoint, pointX(ballPoint) / norm)
            pointY(ballPoint, pointY(ballPoint) / norm)
            pointZ(ballPoint, pointZ(ballPoint) / norm)
        }
        assign(ballPoint, targetPlanePoint)
        changeAngleAndNormalize(targetPlanePoint, 2.)
    }
        // `
        // void ballToPlane(inout vec4 p) {
        //     //if the pointIdealNorm is greater than 1...
        //     //yes it might be nice to have it go round and round
        //     let norm = pointIdealNorm(ballPoint)
        //     log(norm)
        //     if (norm > 1.) {
        //         pointX(ballPoint, pointX(ballPoint) / norm)
        //         pointY(ballPoint, pointY(ballPoint) / norm)
        //         pointZ(ballPoint, pointZ(ballPoint) / norm)
        //     }
        //     assign(ballPoint, targetPlanePoint)
        //     changeAngleAndNormalize(targetPlanePoint, .5)
        // }
        // `
}