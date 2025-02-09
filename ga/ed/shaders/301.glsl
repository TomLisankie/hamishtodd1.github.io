struct Dq {
    float scalar;
    float e01; float e02; float e03;
    float e12; float e31; float e23;
    float e0123;
};

struct Plane {
    float e0; float e1; float e2; float e3;
};

struct weight4 {
    float w0; float w1; float w2; float w3;
};

//might be good to normalize afterwards
Dq dqAdd(in Dq a, in Dq b) {
    return Dq( a.scalar+b.scalar, a.e01+b.e01, a.e02+b.e02, a.e03+b.e03, a.e12+b.e12, a.e31+b.e31, a.e23+b.e23, a.e0123+b.e0123 );
}
Dq dqMulScalar(in Dq a, in float b) {
    return Dq( a.scalar * b, a.e01 * b, a.e02 * b, a.e03 * b, a.e12 * b, a.e31 * b, a.e23 * b, a.e0123 * b );
}

void mvFromVec(in vec3 v, out float[16] target) {
    target[11] = v.z;
    target[12] = v.y;
    target[13] = v.x;
    target[14] = 1.;
}
void mvFromVec(in vec4 v, out float[16] target) {
    target[11] = v.z;
    target[12] = v.y;
    target[13] = v.x;
    target[14] = v.w;
}
void vec4FromMv(in float[16] target, out vec4 v) {
    v.z = target[11];
    v.y = target[12];
    v.x = target[13];
    v.w = target[14];
}
void dqToMv(in Dq ourDq, out float[16] target) {
    target[ 0] = ourDq.scalar;
    target[ 1] = 0.;        target[ 2] = 0.;        target[ 3] = 0.;        target[ 4] = 0.;
    target[ 5] = ourDq.e01; target[ 6] = ourDq.e02; target[ 7] = ourDq.e03;
    target[ 8] = ourDq.e12; target[ 9] = ourDq.e31; target[10] = ourDq.e23;
    target[11] = 0.;        target[12] = 0.;        target[13] = 0.;        target[14] = 0.;
    target[15] = ourDq.e0123;
}
void mvToDq(in float[16] mv, out Dq target) {
    target.scalar= mv[ 0];
    target.e01   = mv[ 5];
    target.e02   = mv[ 6];
    target.e03   = mv[ 7];
    target.e12   = mv[ 8];
    target.e31   = mv[ 9];
    target.e23   = mv[10];
    target.e0123 = mv[15];
}

vec4 sandwichDqPoint(in Dq dq, in vec4 pt) {
    float[16] dqAsMv;
    dqToMv(dq,dqAsMv);

    float[16] ptAsMv;
    mvFromVec(pt, ptAsMv);

    float[16] retAsMv;
    sandwich(dqAsMv,ptAsMv,retAsMv);
    
    vec4 ret;
    vec4FromMv(retAsMv,ret);
    return ret;
}

Dq sandwichDqDq(in Dq a, in Dq b) {
    float[16] aAsMv;
    dqToMv(a, aAsMv);

    float[16] bAsMv;
    dqToMv(b, bAsMv);

    float[16] retAsMv;
    sandwich(aAsMv, bAsMv, retAsMv);
    
    Dq ret;
    mvToDq(retAsMv,ret);
    return ret;
}

Dq joinPtsInDq(in vec4 a, in vec4 b) {
    float[16] aAsMv;
    mvFromVec(a, aAsMv);
    float[16] bAsMv;
    mvFromVec(b, bAsMv);

    float[16] retAsMv;
    join(aAsMv,bAsMv,retAsMv);
    
    Dq ret;
    mvToDq(retAsMv,ret);
    return ret;
}

float sinc(in float a) {
    return a == 0. ? 1. : sin(a)/a;
}
void dqExp(in Dq B, out Dq target) {
    float l = (B.e12*B.e12 + B.e31*B.e31 + B.e23*B.e23);  float m = (B.e01*B.e23 + B.e02*B.e31 + B.e03*B.e12);
    float a = sqrt(l);                                    float b = m/l;
    float c = cos(a);                                     float s = sinc(a); // if output is a translation, l=0, therefore c=1, s=0

    float t = b*(c-s); // 0 if translation

    target =  Dq(
        c,
        s * B.e01 + t * B.e23,
        s * B.e02 + t * B.e31,
        s * B.e03 + t * B.e12,
        s * B.e12,
        s * B.e31,
        s * B.e23,
        s * m
    );
}

//make sure to end with a newline!

Dq meet(in Plane a, in Plane b) {
    Dq ret;
    ret.e01 = b.e1 * a.e0 - b.e0 * a.e1;
    ret.e02 = b.e2 * a.e0 - b.e0 * a.e2;
    ret.e03 = b.e3 * a.e0 - b.e0 * a.e3;
    ret.e12 = b.e2 * a.e1 - b.e1 * a.e2;
    ret.e31 = b.e1 * a.e3 - b.e3 * a.e1;
    ret.e23 = b.e3 * a.e2 - b.e2 * a.e3;
    return ret;
}
Dq mul(in Plane a, in Plane b) {
    Dq ret;
    ret.scalar = b.e1 * a.e1 + b.e2 * a.e2 + b.e3 * a.e3;

    ret.e01 = b.e1 * a.e0 - b.e0 * a.e1;
    ret.e02 = b.e2 * a.e0 - b.e0 * a.e2;
    ret.e03 = b.e3 * a.e0 - b.e0 * a.e3;
    ret.e12 = b.e2 * a.e1 - b.e1 * a.e2;
    ret.e31 = b.e1 * a.e3 - b.e3 * a.e1;
    ret.e23 = b.e3 * a.e2 - b.e2 * a.e3;

    return ret;
}
Dq mul(in vec4 a, in vec4 b) {
    Dq ret;
    ret.scalar = -b.w * a.w;

    ret.e01 = b.w * a.x - b.x * a.w;
    ret.e02 = b.w * a.y - b.y * a.w;
    ret.e03 = b.w * a.z - b.z * a.w;
    return ret;
}
Dq mul(in Dq a, in Dq b) {
    Dq ret;
    ret.scalar = b.scalar * a.scalar - b.e12 * a.e12 - b.e31 * a.e31 - b.e23 * a.e23;

    ret.e01 = b.e01 * a.scalar + b.scalar * a.e01 - b.e12 * a.e02 + b.e31 * a.e03 + b.e02 * a.e12 - b.e03 * a.e31 - b.e0123 * a.e23 - b.e23 * a.e0123;
    ret.e02 = b.e02 * a.scalar + b.e12 * a.e01 + b.scalar * a.e02 - b.e23 * a.e03 - b.e01 * a.e12 - b.e0123 * a.e31 + b.e03 * a.e23 - b.e31 * a.e0123;
    ret.e03 = b.e03 * a.scalar - b.e31 * a.e01 + b.e23 * a.e02 + b.scalar * a.e03 - b.e0123 * a.e12 + b.e01 * a.e31 - b.e02 * a.e23 - b.e12 * a.e0123;
    
    ret.e12 = b.e12 * a.scalar + b.scalar * a.e12 + b.e23 * a.e31 - b.e31 * a.e23;
    ret.e31 = b.e31 * a.scalar - b.e23 * a.e12 + b.scalar * a.e31 + b.e12 * a.e23;
    ret.e23 = b.e23 * a.scalar + b.e31 * a.e12 - b.e12 * a.e31 + b.scalar * a.e23;

    ret.e0123 = b.e0123 * a.scalar + b.e23 * a.e01 + b.e31 * a.e02 + b.e12 * a.e03 + b.e03 * a.e12 + b.e02 * a.e31 + b.e01 * a.e23 + b.scalar * a.e0123;
    return ret;
}
//no plane*dq unless you have rotoreflections!
vec4 meet(in Plane a, in Dq b) {
    vec4 ret;
    ret.z = -b.e12 * a.e0 + b.e02 * a.e1 - b.e01 * a.e2;
    ret.y = -b.e31 * a.e0 - b.e03 * a.e1 + b.e01 * a.e3;
    ret.x = -b.e23 * a.e0 + b.e03 * a.e2 - b.e02 * a.e3;
    ret.w =  b.e23 * a.e1 + b.e31 * a.e2 + b.e12 * a.e3;
    return ret;
}
vec4 meet(in Dq b, in Plane a) {
    vec4 ret;
    ret.z = -b.e12 * a.e0 + b.e02 * a.e1 - b.e01 * a.e2;
    ret.y = -b.e31 * a.e0 - b.e03 * a.e1 + b.e01 * a.e3;
    ret.x = -b.e23 * a.e0 + b.e03 * a.e2 - b.e02 * a.e3;
    ret.w =  b.e23 * a.e1 + b.e31 * a.e2 + b.e12 * a.e3;
    return ret;
}