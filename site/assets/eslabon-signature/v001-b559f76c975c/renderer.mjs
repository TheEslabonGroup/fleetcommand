// Eslabon signature 001. Native scene derived from our existing chain and
// client quadcopter renderers. Source hashes and geometry lineage: docs/LINEAGE.json.
// No dependency, outside call, texture download, or continuous idle rendering.
const FRAG = `#version 300 es
precision highp float;
out vec4 o;
uniform vec2 uRes;
uniform vec4 uD[2];
uniform vec3 uLoad[2];
uniform vec2 uAngle;
uniform vec3 uAccent;
uniform vec3 uFill;
uniform float uNow;
uniform vec3 uCam;
uniform vec4 uC[24];
uniform vec2 uRoom;
uniform bool uHostGround;
uniform vec3 uSceneMin;
uniform vec3 uSceneMax;
uniform float uMotion;
uniform float uBank;
uniform int uN;
uniform float uH[24];
uniform float uLink;
uniform int uMode;
uniform vec2 uBand;
uniform float uTip;
uniform int uAA;
uniform float uSeed;
uniform float uTilt;
uniform float uEHeat;
uniform float uFocal;
uniform vec3 uEPos;
uniform float uEScale;
uniform float uEYaw;




vec3 qrot(vec4 q, vec3 v){ return v + 2.0*cross(q.xyz, cross(q.xyz, v) + q.w*v); }

float rbox2(vec2 p, vec2 b, float r){ vec2 d = abs(p) - b + r; return length(max(d,0.0)) + min(max(d.x,d.y),0.0) - r; }
float rbox3(vec3 p, vec3 b, float r){ vec3 d = abs(p) - b + r; return length(max(d,0.0)) + min(max(d.x,max(d.y,d.z)),0.0) - r; }

// The link E, built in the font's own proportions (cap 2, stem 0.36).
float sdE(vec3 p){
  const float T = 0.18, D = 0.25, R = 0.41, CX = -0.0814, AR = 0.671, AM = 0.483, B = 0.03;
  float d = 1e9;
  for (int i = 0; i < 2; i++){
    float cy = i == 0 ? 0.41 : -0.41;
    vec2 q = p.xy - vec2(CX, cy);
    float ring = rbox2(vec2(length(q) - R, p.z), vec2(T, D), B);
    d = min(d, max(ring, p.x - CX));
  }
  // each arm starts inside the curve, so the joint shows no bevel groove
  const float IN = 0.14;
  d = min(d, rbox3(p - vec3((CX-IN+AR)*0.5,  0.82, 0.0), vec3((AR-CX+IN)*0.5, T, D), B));
  d = min(d, rbox3(p - vec3((CX-IN+AM)*0.5,  0.0,  0.0), vec3((AM-CX+IN)*0.5, T, D), B));
  d = min(d, rbox3(p - vec3((CX-IN+AR)*0.5, -0.82, 0.0), vec3((AR-CX+IN)*0.5, T, D), B));
  // A rounded guide mouth seats the real feed inside the bottom arm. Its
  // recessed back hides the incoming link; no exposed planar-cut metal tab.
  vec3 throat=p-vec3(.62,-.82,0.);
  vec2 gv=vec2(length(throat.yz)-.26+.025,abs(throat.x)-.14+.025);
  float guide=min(max(gv.x,gv.y),0.)+length(max(gv,0.))-.025;
  float blend=clamp(.5+.5*(guide-d)/.06,0.,1.);
  d=mix(guide,d,blend)-.06*blend*(1.-blend);
  vec3 feed=p-vec3(.78,-.82,0.);
  vec2 mv=vec2(length(feed.yz)-.222+.015,abs(feed.x)-.30+.015);
  float mouth=min(max(mv.x,mv.y),0.)+length(max(mv,0.))-.015;
  mouth=max(mouth,.515-p.x);
  d=max(d,-mouth);
  return d;
}

// One chain link in the E's own units, long axis down y. The section is the
// E's squared bevel a little slimmer, so the links read as the same metal.
// Sized so the first one wraps the E's bottom arm (0.36 by 0.5) with room.
const float LL = 0.22, LR = 0.48, LT = 0.15, LD = 0.2;
float sdLink(vec3 q, bool edge){
  if (edge) q = q.zyx;
  vec2 c = vec2(length(vec2(q.x, max(abs(q.y)-LL, 0.0))) - LR, q.z);
  return rbox2(c, vec2(LT, LD), 0.03);
}

float droneEllipsoid(vec3 p,vec3 r){float k0=length(p/r),k1=length(p/(r*r));return k0*(k0-1.)/max(k1,.000001);}
float sdC(vec3 p,vec3 a,vec3 b,float r){vec3 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);return length(pa-ba*h)-r;}
float sdCylY(vec3 q,float r,float h,float rb){vec2 d=vec2(length(q.xz)-r+rb,abs(q.y)-h+rb);return min(max(d.x,d.y),0.)+length(max(d,0.))-rb;}
float sdCylZ(vec3 q,float r,float h,float rb){vec2 d=vec2(length(q.xy)-r+rb,abs(q.z)-h+rb);return min(max(d.x,d.y),0.)+length(max(d,0.))-rb;}
float smin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}
mat3 rot(vec3 a){float cy=cos(a.x),sy=sin(a.x),cr=cos(a.y),sr=sin(a.y),cp=cos(a.z),sp=sin(a.z);
 mat3 Y=mat3(cy,0.,-sy,0.,1.,0.,sy,0.,cy);mat3 Z=mat3(cr,sr,0.,-sr,cr,0.,0.,0.,1.);mat3 X=mat3(1.,0.,0.,0.,cp,sp,0.,-sp,cp);return Y*Z*X;}
// one drone in its own frame; m: 1 shell, 2 arm, 3 motor, 4 leg, 5 gimbal, 6 emblem
vec2 drone(vec3 p,float s){
 float b=droneEllipsoid(p,vec3(.16,.085,.27));
 b=smin(b,droneEllipsoid(p-vec3(0.,.055,-.03),vec3(.11,.05,.17)),.035);
 vec3 q=vec3(abs(p.x),p.y,abs(p.z));
 float arm=sdC(q,vec3(.06,0.,.12),vec3(.34,.025,.29),.019);
 vec2 r=vec2(smin(b,arm,.03),arm<b?2.:1.);
 float mot=sdCylY(q-vec3(.34,.045,.29),.04,.032,.008);
 if(mot<r.x) r=vec2(mot,3.);
 float leg=min(sdC(q,vec3(.34,.02,.29),vec3(.34,-.095,.29),.009),length(q-vec3(.34,-.1,.29))-.015);
 if(leg<r.x) r=vec2(leg,4.);
 float gim=length(p-vec3(0.,-.085,.2))-.042;
 if(gim<r.x) r=vec2(gim,5.);

 float prop=sdCylY(q-vec3(.34,.083,.29),.148,.0015,.001);
 if(prop<r.x)r=vec2(prop,7.);
 return r;
}

vec3 droneSpace(vec3 p,int i){
 vec3 q=(p-uD[i].xyz)/uD[i].w;
 float a=uAngle[i];float c=cos(a),s=sin(a);
 q.xz=mat2(c,-s,s,c)*q.xz;
 float b=.12*uBank*(i==0?1.:-1.)+.065*sin(uMotion*1.1+float(i)*1.7);
 q.xy=mat2(cos(b),-sin(b),sin(b),cos(b))*q.xy;
 q.yz=mat2(.9553,-.2955,.2955,.9553)*q.yz;
 return q;
}

// The whole piece lives in the E's frame: turn, then scale. Each link carries
// its centre and the angle of the path it lies on, so the chain can bend.
vec3 toLocal(vec3 p){
  vec3 ep = p - uEPos;
  float ct = cos(uTilt), st = sin(uTilt);
  ep.yz = mat2(ct, -st, st, ct) * ep.yz;
  float cy = cos(uEYaw), sy = sin(uEYaw);
  ep.xz = mat2(cy, -sy, sy, cy) * ep.xz;
  return ep / uEScale;
}

vec2 map(vec3 p){
  vec3 ep = p - uEPos;
  // seen a little from above, so the arms and the links show their depth
  // while the long run across the bottom stays square to the screen
  float ct = cos(uTilt), st = sin(uTilt);
  ep.yz = mat2(ct, -st, st, ct) * ep.yz;
  float cy = cos(uEYaw), sy = sin(uEYaw);
  ep.xz = mat2(cy, -sy, sy, cy) * ep.xz;
  ep /= uEScale;
  vec2 res = vec2(sdE(ep), -1.0);
  for (int i = 0; i < 24; i++){
    if (i >= uN) break;
    vec3 q = ep - uC[i].xyz;
    if (length(q) - 1.1*uLink > res.x) continue;
    float cs = cos(uC[i].w), ss = sin(uC[i].w);
    q.xy = mat2(cs, ss, -ss, cs) * q.xy;
    float d = sdLink(q / uLink, (uN-1-i) % 2 == 0) * uLink;
    d=max(d,.48-ep.x);
    if (d < res.x) res = vec2(d, float(i));
  }
  res.x*=uEScale;
 for(int j=0;j<2;j++){
   vec3 q=droneSpace(p,j);float bound=length(q)-1.05;
   vec2 d=bound>.12?vec2(bound,0.):drone(q,0.);
   d.x*=uD[j].w;
   if(d.x<res.x)res=vec2(d.x,100.+float(j)*10.+d.y);
   float bank=.12*uBank*(j==0?1.:-1.)+.065*sin(uMotion*1.1+float(j)*1.7);
   vec3 hp=vec3(0.,-.12*.9553,-.12*.2955);
   hp.xy=mat2(cos(bank),sin(bank),-sin(bank),cos(bank))*hp.xy;
   float yaw=uAngle[j];hp.xz=mat2(cos(yaw),sin(yaw),-sin(yaw),cos(yaw))*hp.xz;
   hp=uD[j].xyz+hp*uD[j].w;
   float cable=sdC(p,hp,uLoad[j],.018);
   float clasp=length(p-uLoad[j])-.04;
   if(min(cable,clasp)<res.x)res=vec2(min(cable,clasp),100.+float(j)*10.+6.);

 }
 return res;
}

vec3 nrm(vec3 p){
  const vec2 k = vec2(1,-1)*0.0008;
  return normalize(k.xyy*map(p+k.xyy).x + k.yyx*map(p+k.yyx).x + k.yxy*map(p+k.yxy).x + k.xxx*map(p+k.xxx).x);
}

float ao(vec3 p, vec3 n){
  float s = 0.0, w = 1.0;
  for (int i = 1; i <= 4; i++){ float h = 0.03*float(i); s += w*(h - map(p + n*h).x); w *= 0.6; }
  return clamp(1.0 - 3.0*s, 0.0, 1.0);
}

// Soft projected occlusion, evaluated without marching through empty walls.
// Smooth analytic bounds avoid sampling bands on the recessed chamber.
float projectedShadow(vec3 p,vec3 center,vec3 radius){
 vec3 light=normalize(vec3(-.4,.9,2.));float t=dot(center-p,light);
 if(t<=0.)return 1.;
 vec3 q=(p+light*t-center)/(radius+vec3(.07*t));
 return mix(.58,1.,smoothstep(.65,1.45,length(q)));
}
vec3 fromLocal(vec3 p){
 p*=uEScale;
 p.xz=mat2(cos(uEYaw),sin(uEYaw),-sin(uEYaw),cos(uEYaw))*p.xz;
 p.yz=mat2(cos(uTilt),sin(uTilt),-sin(uTilt),cos(uTilt))*p.yz;
 return p+uEPos;
}
vec3 aces(vec3 x){ return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14), 0.0, 1.0); }

// Polished titanium that has been through the fire: its finish is the deep
// blue heat tint, lit like a studio product shot. A large soft box overhead,
// a hard strip key on the left, a thin horizon line, and an ember kicker.
// The reflections do the work, so edges read crisp at any size.
// blued titanium as it really looks: dark steel that reflects its lights in a
// cool blue, not a painted blue; the colour lives in the reflections
const vec3 TINT = vec3(0.30, 0.32, 0.36);
vec3 metal(vec3 p, vec3 n, vec3 v, float a, bool link){
  vec3 r = reflect(-v, n);
  // the faces toward us catch a big soft box set close above the lens; being
  // close, its light falls off across the face, top left bright to bottom
  // right dim, the gradient that makes a flat face read as real metal
  vec2 lq = (p.xy - uEPos.xy) / uEScale;
  // metal mirrors the box, so it shows as a crisp edged shape across the
  // face: a sharp diagonal split, bright above, deep below
  // a link is round in section, so its band comes off its own curve and
  // runs along every link as a crisp highlight
  float q = link ? (n.y * 0.95 - n.x * 0.35) * 1.2 + 0.25 : lq.y * 0.85 - lq.x * 0.45;
  float front = smoothstep(link ? 0.3 : 0.55, 0.98, r.z) * (0.02 + 0.07 * smoothstep(-1.6, 1.3, q) + 0.62 * smoothstep(0.1, 0.15, q) * smoothstep(1.7, 0.3, q));
  float box = smoothstep(0.42, 0.8, r.y) * 1.05;
  float strip = smoothstep(0.78, 0.9, -r.x) * smoothstep(-0.2, 0.25, r.y) * 1.4;
  float line = (1.0 - smoothstep(0.0, 0.035, abs(r.y - 0.12))) * 0.65;
  float kick = smoothstep(0.7, 0.95, r.x) * (1.0 - smoothstep(-0.1, 0.3, r.y)) * 0.9;
  float ribbon=pow(max(0.,1.-abs(r.x-.38*sin(uMotion*.4))/.30),3.);
 vec3 env = vec3(.025,.032,.045) + vec3(1.0) * (box + strip + line + front) + uAccent * (kick*2.5+ribbon*1.5+front*.45) + uFill*(pow(max(r.y,0.),4.)*1.8+strip*.65);
  float c = clamp(dot(n, v), 0.0, 1.0);
  // heat tinted titanium shifts toward violet at a glancing angle, then white
  vec3 film = mix(TINT, vec3(0.40, 0.42, 0.48), smoothstep(0.45, 0.95, 1.0 - c));
  vec3 F = film + (vec3(1.0) - film) * pow(1.0 - c, 5.0);
  return env * F * (0.6 + 0.4*a) + TINT * 0.012;
}

// Heat: yellow at its hottest, the orange red of the forge, a deep red as it
// dies, then the blue finish.
// Heat, in screen colour so the tone curve cannot wash it out. These are the
// colours steel really shows coming out of a forge: dull red, cherry,
// orange, and yellow orange only in the hottest heart.
vec3 heatColor(float ht){
  vec3 c = mix(vec3(0.3, 0.03, 0.01), vec3(0.78, 0.08, 0.02), smoothstep(0.3, 0.55, ht));
  c = mix(c, vec3(1.0, 0.3, 0.04), smoothstep(0.55, 0.78, ht));
  return mix(c, vec3(1.0, 0.56, 0.12), smoothstep(0.86, 1.0, ht));
}

// value noise, for the slight unevenness of cooling steel
float hash(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float vnoise(vec3 p){
  vec3 i = floor(p), f = fract(p); f = f*f*(3.0 - 2.0*f);
  return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
}
float fbm(vec3 p){ return 0.55*vnoise(p) + 0.3*vnoise(p*2.1) + 0.15*vnoise(p*4.3); }

vec3 heated(vec3 disp, float ht, float fres, float a, vec3 lp){
  if (ht <= 0.0) return disp;
  // the glow breaks up as it cools: blotches run ahead of the rest, and the
  // thin edges go first
  // the glow recedes smoothly, the thin edges first and the heart last, with
  // only a whisper of unevenness, the way steel cools in still air
  float n = fbm(lp * 2.6);
  float h = clamp(ht - 0.06*(n - 0.5) - 0.12*fres*(1.0 - ht), 0.0, 1.0);
  float form = dot(disp, vec3(0.3, 0.5, 0.2));
  vec3 lit = heatColor(h) * clamp((0.55 + 0.8*form + 0.25*fres) * (0.68 + 0.32*a), 0.0, 1.0);
  return mix(disp, lit, smoothstep(0.2, 0.5, h));
}
float heatE(vec3 p){
  vec3 lp = toLocal(p);
  float forge = clamp(uEHeat*1.2 - 0.3*length(lp.xy - vec2(0.1, 0.0)), 0.0, 1.0);
  float tip = uTip * exp(-max(0.0, 0.671 - lp.x) / 0.16) * (1.0 - smoothstep(0.2, 0.3, abs(lp.y + 0.82)));
  return max(forge, tip);
}

// Five actual room planes and a narrow rounded front rim. Empty wall pixels
// use analytic intersections; only the carried assembly needs SDF marching.
vec4 roomHit(vec3 ro,vec3 rd){
 vec2 bounds=uRoom*.5;vec4 hit=vec4(0.,0.,1.,1e6);
 float tb=(-2.8-ro.z)/rd.z;vec3 p=ro+rd*tb;
 if(all(lessThanEqual(abs(p.xy-vec2(.35,.45)),bounds)))hit.w=tb;
 if(abs(rd.x)>.00001){float t=(.35+sign(rd.x)*bounds.x-ro.x)/rd.x;p=ro+rd*t;if(t>0.&&t<hit.w&&p.z>=-2.9&&p.z<=.1&&abs(p.y-.45)<=bounds.y)hit=vec4(-sign(rd.x),0.,0.,t);}
 if(abs(rd.y)>.00001){float t=(.45+sign(rd.y)*bounds.y-ro.y)/rd.y;p=ro+rd*t;if(t>0.&&t<hit.w&&p.z>=-2.9&&p.z<=.1&&abs(p.x-.35)<=bounds.x)hit=vec4(0.,-sign(rd.y),0.,t);}
 float tf=(.1-ro.z)/rd.z;p=ro+rd*tf;float rim=rbox2(p.xy-vec2(.35,.45),bounds,.07);
 if(abs(rim)<.035&&tf<hit.w)hit=vec4(0.,0.,1.,tf);
 return hit;
}
vec2 assemblyHit(vec3 ro,vec3 rd){vec3 inv=1./(rd+vec3(.00000001)),a=(uSceneMin-ro)*inv,b=(uSceneMax-ro)*inv,lo=min(a,b),hi=max(a,b);return vec2(max(max(lo.x,lo.y),lo.z),min(min(hi.x,hi.y),hi.z));}
vec3 roomShade(vec3 p,vec3 n,vec3 v){
 vec2 q=(p.xy-vec2(.35,.45))/(uRoom*.5);
 float edge=pow(clamp(max(abs(q.x),abs(q.y)),0.,1.),16.);
 float floorLight=exp(-5.*abs(q.y+.91)),glow=exp(-.16*pow(p.x-uEPos.x,2.));
 vec3 key=normalize(vec3(-.4,.9,2.));
 float sh=projectedShadow(p,uEPos,vec3(.75,1.15,.48)*uEScale);
 for(int i=0;i<2;i++)sh=min(sh,projectedShadow(p,uD[i].xyz,vec3(.46,.12,.44)*uD[i].w));
 for(int i=0;i<24;i++){if(i>=uN)break;sh=min(sh,projectedShadow(p,fromLocal(uC[i].xyz),vec3(.23)*uEScale));}
 vec3 col=vec3(.006,.008,.012)*(1.+.7*max(dot(n,key),0.));
 col+=uAccent*(edge*.18+floorLight*.12)*(.35+.65*glow);
 col+=uFill*(edge*.12+floorLight*.08)*(1.-.55*glow);
 col+=vec3(.025)*max(abs(n.x),abs(n.y));
 col*=.40+.60*sh;
 return pow(aces(col),vec3(1./2.2));
}
vec4 shade(vec2 frag){
  vec2 uv = (frag*2.0 - uRes) / uRes.y;
  vec3 ro = uCam;
  vec3 ta = vec3(uCam.xy, 0.0);
  vec3 f = normalize(ta - ro), r = normalize(cross(f, vec3(0,1,0))), u = cross(r, f);
  vec3 rd = normalize(f*uFocal + uv.x*r + uv.y*u);
  // the chain layer only marches the strip the chain lies in
  if (uMode == 1){ float yy = ro.y + rd.y * (-ro.z / rd.z); if (yy < uBand.x || yy > uBand.y) return vec4(0.0); }
  // stop within half a pixel of the surface, so edges stay sharp
  float px = 0.42 / (uFocal * uRes.y * 0.5);
  float depthScale=max(-rd.z,.01);
  vec4 room=uHostGround?vec4(0.,0.,1.,1e6):roomHit(ro,rd);vec2 interval=assemblyHit(ro,rd);
  float t=max((uCam.z-3.)/depthScale,interval.x),farT=min(interval.y,room.w);
  vec2 h=vec2(0.,-2.);bool found=false;
  if(interval.x<=interval.y&&t<=farT){for(int i=0;i<160;i++){
   h=map(ro+rd*t);if(h.x<.5*px*t){found=true;break;}t+=h.x;if(t>farT)break;
  }}
  if(!found)return room.w<1e5?vec4(roomShade(ro+rd*room.w,room.xyz,-rd),1.):vec4(0.);
  // the chain layer leaves the E clear, so the E below shows through
  if (uMode == 1 && h.y < -0.5) return vec4(0.0);
  vec3 p = ro + rd*t;

  if(h.y>=100.){
    int di=int(floor((h.y-100.)/10.));float part=h.y-100.-float(di)*10.;
    vec3 n=nrm(p),v=-rd,q=droneSpace(p,di),r=reflect(-v,n);
    vec3 light=normalize(vec3(-.6,1.,2.));float dif=max(dot(n,light),0.);
    float occ=ao(p,n),fres=pow(1.-max(dot(n,v),0.),5.);
    vec3 base=part<1.5?vec3(.65,.68,.7):vec3(.025,.03,.038);
    if(part>2.5&&part<3.5)base=vec3(.23,.25,.28);
    float canopy=step(.07,q.y)*smoothstep(1.,.83,length((q.xz-vec2(0.,-.03))/vec2(.105,.17)));
    if(part<1.5)base=mix(base,vec3(.018,.025,.032),canopy);
    vec3 env=vec3(.035)+vec3(1.7)*smoothstep(.28,.85,r.y)+vec3(1.2)*smoothstep(.75,.94,-r.x)+uAccent*smoothstep(.7,.96,r.x);
    vec3 col=base*(.22+.65*dif)*occ+env*mix(.08,.65,fres)*occ;
    vec3 motor=vec3(abs(q.x),q.y,abs(q.z))-vec3(.34,.045,.29);
    if(part>2.5&&part<3.5)col+=uAccent*(1.-smoothstep(.002,.008,abs(motor.y+.014)))*2.5;
    if(part>4.5&&part<5.5)col=mix(col,uFill*.65,pow(max(dot(n,v),0.),14.));
    if(part>5.5&&part<6.5)col=vec3(.18)+uAccent*.3+uFill*.18+env*.18;
    if(part>6.5)col=vec3(.055,.06,.07)+uFill*.025;
    return vec4(pow(aces(col),vec3(1./2.2)),1.);
  }

  // the heat layer: only the light the hot metal gives off, in its own
  // shape; the page blurs it and adds it on top, so the glow is real bloom
  if (uMode == 2){
    float ht = h.y > -0.5 ? uH[int(h.y)] : heatE(p);
    vec3 e = heatColor(ht) * smoothstep(0.32, 0.95, ht);
    return vec4(e, max(e.r, max(e.g, e.b)));
  }
  vec3 n = nrm(p), v = -rd;
  float a = ao(p, n);
  float fres = pow(1.0 - max(dot(n, v), 0.0), 3.0);
  bool link = h.y > -0.5;
  vec3 col = metal(p, n, v, a, link);
  // hot metal lights the steel beside it: a warm spill from the arm's end
  // onto the arm and the first cooling links, falling off with distance
  vec3 lq = toLocal(p);
  float spill = uTip * exp(-length(lq.xy - vec2(0.72, -0.82)) / 0.32);
  col += heatColor(0.78) * spill * (0.25 + 0.75*a) * (0.35 + 0.65*max(0.0, dot(n, normalize(vec3(0.72, -0.82, 0.3) * uEScale + uEPos - p))));
  // the E: on load the tips cool first and the heart last; after that, the
  // end of the bottom arm stays hot, because the chain is made there
  vec3 disp = pow(aces(col * 1.15), vec3(1.0/2.2));
  // a link's scale is its own, so it travels with the link
  vec3 lp = toLocal(p); if (link) lp -= uC[int(h.y)].xyz - vec3((float(int(h.y)) - uSeed) * 1.7, 0.0, 0.0);
  return vec4(heated(disp, link ? uH[int(h.y)] : heatE(p), fres, a, lp), 1.0);
}

void main(){
  vec4 acc = vec4(0.0);
  // the still frame takes four samples a pixel; moving frames take one
  int N = uAA > 1 ? 4 : 1;
  for (int k = 0; k < 4; k++){
    if (k >= N) break;
    vec2 off = N == 1 ? vec2(0.0) : vec2(k == 1 || k == 3 ? 0.25 : -0.25, k >= 2 ? 0.25 : -0.25);
    acc += shade(gl_FragCoord.xy + off);
  }
  acc /= float(N);
  o = acc;
}`;
const VERT=`#version 300 es
in vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`;
const clamp=n=>Math.max(0,Math.min(1,n));
const ease=n=>1-Math.pow(1-clamp(n),3);
export function createScene(canvas,{accent=[1,.25,.035],fill=[.12,.28,.65],onLoss=()=>{},hostGround=false}={}){
 const gl=canvas.getContext('webgl2',{alpha:true,antialias:false,premultipliedAlpha:false,powerPreference:'low-power'});
 if(!gl)return null;
 function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){const message=gl.getShaderInfoLog(s);gl.deleteShader(s);throw Error(message)}return s}
 const vs=shader(gl.VERTEX_SHADER,VERT),fs=shader(gl.FRAGMENT_SHADER,FRAG),program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
 const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);gl.useProgram(program);const a=gl.getAttribLocation(program,'a');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
 const U={};for(const k of ['uHostGround','uSceneMin','uSceneMax','uLoad','uRoom','uMotion','uBank','uRes','uCam','uD','uAngle','uAccent','uFill','uNow','uC','uN','uH','uLink','uMode','uBand','uTip','uAA','uSeed','uTilt','uEHeat','uFocal','uEPos','uEScale','uEYaw'])U[k]=gl.getUniformLocation(program,k);
 let lost=false,disposed=false,pending=null;const C=new Float32Array(96),H=new Float32Array(24),D=new Float32Array(8);
 const lose=e=>{e.preventDefault();lost=true;onLoss()};canvas.addEventListener('webglcontextlost',lose);
 function draw(time=7.2,{still=false,exportSize=false,travelX=0,lightMix=0,hover=0,motionTime=0,bank=0}={}){
  if(lost||disposed)return false;
  // Never queue new work behind an unfinished GPU frame. A sharp completed
  // frame is retained until the device is ready, rather than starving input.
  if(pending){const status=gl.clientWaitSync(pending,0,0);if(status===gl.TIMEOUT_EXPIRED&&!still)return false;if(still)gl.finish();gl.deleteSync(pending);pending=null;}

  const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return false;
  const ratio=exportSize?1:Math.min(Math.max(devicePixelRatio||1,h<=100?2.5:2),h<=100?3:2.5,Math.sqrt(2400000/(w*h)));
  const width=Math.max(1,Math.round(w*ratio)),height=Math.max(1,Math.round(h*ratio));if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height}
  gl.viewport(0,0,width,height);gl.useProgram(program);
  const t=clamp(time/3),arrival=ease(t),settle=Math.sin(time*4)*Math.exp(-Math.max(0,time-2)*1.2)*(1-arrival*.9);
  const ex=-7+5.45*arrival+travelX,ey=2.7-2.9*arrival+hover,scale=1.3;
  const aspect=w/h,worldH=Math.max(5.4,9.4/aspect),focal=24/worldH;
  // Equal arc length keeps alternating links interlocked as the carrier lifts.
  const lift=.24*Math.sin(motionTime*1.13+.8),extension=.5+.5*Math.sin(motionTime*.43),dx=3.05+1.6*extension,dy=.95+lift/scale;
  const pitch=.333,targetLength=Math.hypot(dx,dy)+.22,count=Math.ceil(targetLength/pitch)+1;
  // A short horizontal throat gives the feed the same tangent as the E arm.
  // Smooth C1 release into the hanging curve keeps the first full ring flowing.
  const guideBlend=k=>{const t=Math.max(0,Math.min(1,k/.18));return t*t*(3-2*t)};
  const guideDerivative=k=>k>0&&k<.18?6*(k/.18)*(1-k/.18)/.18:0;
  const path=(k,sag)=>{const b=guideBlend(k);return[.65+dx*k,-.82+(dy*k-sag*Math.sin(Math.PI*k))*b,.055*Math.sin(Math.PI*Math.max(0,k))*Math.sin(motionTime*1.4)*b]};
  function samples(sag){let total=0,prev=path(0,sag);const a=[{k:0,s:0,p:prev}];for(let j=1;j<=64;j++){const k=j/64,p=path(k,sag);total+=Math.hypot(...p.map((v,i)=>v-prev[i]));a.push({k,s:total,p});prev=p}return a}
  let lo=0,hi=1.5,curve;for(let j=0;j<12;j++){const mid=(lo+hi)/2;curve=samples(mid);if(curve[64].s<targetLength)lo=mid;else hi=mid}const sag=(lo+hi)/2;curve=samples(sag);
  C.fill(0);H.fill(0);
  for(let i=0;i<count;i++){
   // The terminal link stays the same link. New rings feed out at the E;
   // reversing this trajectory reels those same rings back into the port.
   const wanted=curve[64].s-(count-1-i)*pitch;let k;
   if(wanted<0)k=wanted/Math.hypot(dx,dy-sag*Math.PI);
   else{let j=1;while(j<64&&curve[j].s<wanted)j++;const a=curve[j-1],b=curve[j],f=(wanted-a.s)/(b.s-a.s);k=a.k+(b.k-a.k)*f;}
   const p=path(k,sag),slope=((dy-sag*Math.PI*Math.cos(Math.PI*k))*guideBlend(k)+(dy*k-sag*Math.sin(Math.PI*k))*guideDerivative(k))/dx;
   C.set([...p,Math.PI/2-Math.atan(slope)],i*4);
  }
  // The load points use the exact inverse of toLocal, including every sway.
  const yaw=-.28+.06*Math.sin(motionTime*.8),tilt=.18+.025*Math.sin(motionTime*.65);
  const world=([x,y,z])=>{x*=scale;y*=scale;z*=scale;const xx=Math.cos(yaw)*x-Math.sin(yaw)*z,zz=Math.sin(yaw)*x+Math.cos(yaw)*z;return[ex+xx,ey+Math.cos(tilt)*y-Math.sin(tilt)*zz,Math.sin(tilt)*y+Math.cos(tilt)*zz]};
  const attachE=world([.02,1.00,0]),end=Array.from(C.slice((count-1)*4,(count-1)*4+3)),tangent=C[(count-1)*4+3];
  // The cable terminates at the centre of the final link's closed cap.
  end[0]+=Math.sin(tangent)*.70*.32;end[1]+=Math.cos(tangent)*.70*.32;
  const attachChain=world(end);
  D.set([ex+.16*Math.sin(motionTime*.7),ey+2.2+.10*Math.sin(motionTime*.9),.35,1.42,
    attachChain[0]+.28*Math.sin(motionTime*.8+.4),attachChain[1]+1.05+.10*Math.cos(motionTime*.75),attachChain[2]+.36,1.42]);
  const sceneMin=[ex-1.7,ey-1.7,-1.7],sceneMax=[ex+1.7,ey+1.7,1.7];
  const include=(v,r)=>{for(let j=0;j<3;j++){sceneMin[j]=Math.min(sceneMin[j],v[j]-r);sceneMax[j]=Math.max(sceneMax[j],v[j]+r);}};
  for(let i=0;i<count;i++)include(world(Array.from(C.slice(i*4,i*4+3))),.46);
  for(let i=0;i<2;i++)include(Array.from(D.slice(i*4,i*4+3)),1.50);
  include(attachE,.04);include(attachChain,.04);
  gl.uniform3fv(U.uSceneMin,sceneMin);gl.uniform3fv(U.uSceneMax,sceneMax);
  gl.uniform3fv(U.uLoad,new Float32Array([...attachE,...attachChain]));
  gl.uniform1i(U.uHostGround,hostGround?1:0);gl.uniform2f(U.uRoom,worldH*aspect*.96,worldH*.94);gl.uniform1f(U.uMotion,motionTime);gl.uniform1f(U.uBank,bank);
  gl.uniform2f(U.uRes,width,height);gl.uniform3f(U.uCam,.35,.45,12);gl.uniform1f(U.uFocal,focal);gl.uniform3f(U.uEPos,ex,ey,0);gl.uniform1f(U.uEScale,scale);gl.uniform1f(U.uEYaw,yaw);gl.uniform1f(U.uTilt,tilt);gl.uniform1f(U.uEHeat,Math.max(0,1-time/4));gl.uniform1f(U.uTip,Math.max(0,1-time/5));gl.uniform1f(U.uLink,.32);gl.uniform1i(U.uMode,0);gl.uniform1i(U.uAA,4);gl.uniform1f(U.uSeed,0);gl.uniform2f(U.uBand,-100,100);gl.uniform4fv(U.uC,C);gl.uniform1fv(U.uH,H);gl.uniform1i(U.uN,count);gl.uniform4fv(U.uD,D);gl.uniform2f(U.uAngle,.3+.13*Math.sin(motionTime*.7),-.35+.1*Math.sin(motionTime*.9));gl.uniform3fv(U.uAccent,accent);gl.uniform3fv(U.uFill,fill);gl.uniform1f(U.uNow,time);
  gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.TRIANGLES,0,3);pending=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();return true;
 }
 return{draw,dispose(){if(disposed)return;disposed=true;canvas.removeEventListener('webglcontextlost',lose);if(!lost){if(pending)gl.deleteSync(pending);gl.deleteBuffer(buffer);gl.deleteProgram(program)}},loseForTest(){gl.getExtension('WEBGL_lose_context')?.loseContext()}};
}
