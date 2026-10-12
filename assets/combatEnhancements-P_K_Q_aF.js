import{C as e,S as t,_ as n,a as r,b as i,c as a,d as o,f as s,g as c,h as l,i as u,l as d,m as f,n as p,o as m,p as ee,r as h,s as te,t as g,u as _,v,w as y,x as ne,y as b}from"./index-C1g1OBCl.js";function re(e,t){let n=window.houseCollisions||[];for(let r of n){let n=.65;if(e>r.x-r.width/2-n&&e<r.x+r.width/2+n&&t>r.z-r.depth/2-n&&t<r.z+r.depth/2+n)return!0}return!1}function x(e,t){return e<-41||e>41||t<-66||t>-5?!1:!re(e,t)}function ie(e){let t=e.position.x,n=e.position.z,r=[0,Math.PI/4,Math.PI/2,Math.PI*3/4,Math.PI,Math.PI*5/4,Math.PI*3/2,Math.PI*7/4];for(let i of[1.5,2.5,4])for(let a of r){let r=t+Math.sin(a)*i,o=n+Math.cos(a)*i;if(x(r,o))return new y(r,e.position.y,o)}return null}function ae(e,t,n,r){if(!e||!t)return!1;let i=t.clone().sub(e.position);if(i.y=0,i.lengthSq()<.01)return!0;i.normalize();let a=n*r,o=e.position.x+i.x*a,s=e.position.z+i.z*a;if(x(o,s))e.position.x=o,e.position.z=s;else{let t=e.position.x+i.x*a;if(x(t,e.position.z))e.position.x=t;else{let t=e.position.z+i.z*a;if(x(e.position.x,t))e.position.z=t;else{let t=ie(e);if(t)e.position.x+=(t.x-e.position.x)*Math.min(r*4,1),e.position.z+=(t.z-e.position.z)*Math.min(r*4,1);else return!1}}}return e.position.x=f.clamp(e.position.x,-42,42),e.position.z=f.clamp(e.position.z,-67,-5),e.rotation.y=Math.atan2(i.x,i.z)+Math.PI,!0}function oe(e){let t=e.userData;t.patrolInitialized||(t.patrolInitialized=!0,t.patrolDirection=Math.random()*Math.PI*2,t.patrolTarget=null,t.patrolTimer=0,t.patrolPauseTimer=0,t.patrolBlockedTimer=0)}function S(e){let t=e.userData,n=Math.random()*Math.PI*2,r=10+Math.random()*12,i=e.position.clone();i.x+=Math.sin(n)*r,i.z+=Math.cos(n)*r,i.x=f.clamp(i.x,-37,37),i.z=f.clamp(i.z,-61,-6),t.patrolTarget=i,t.patrolDirection=n,t.patrolTimer=6+Math.random()*6,t.patrolBlockedTimer=0}function se(e,t,n){if(!e||!e.userData||!n)return;let r=e.userData;if(oe(e),r.patrolPauseTimer>0){r.patrolPauseTimer-=t;return}if(r.patrolTarget||S(e),r.patrolTimer-=t,e.position.distanceTo(r.patrolTarget)<2||r.patrolTimer<=0){Math.random()<.15&&(r.patrolPauseTimer=.6+Math.random()*1.2),S(e);return}let i=e.position.x,a=e.position.z,o=r.speed*.85;if(n(e,r.patrolTarget,o,t),Math.hypot(e.position.x-i,e.position.z-a)<.005?r.patrolBlockedTimer+=t:r.patrolBlockedTimer=0,r.patrolBlockedTimer>.35){r.patrolBlockedTimer=0,S(e);return}let s=r.patrolTarget.x-e.position.x,c=r.patrolTarget.z-e.position.z;if(Math.abs(s)+Math.abs(c)>.05){let n=Math.atan2(s,c)-e.rotation.y;for(;n>Math.PI;)n-=Math.PI*2;for(;n<-Math.PI;)n+=Math.PI*2;e.rotation.y+=n*Math.min(t*5,1)}}var ce={enemy:{preferredDistance:15,minimumDistance:8,attackSpeed:2.8}};function le(e,t,n){if(!e||!e.userData||!n)return;let r=typeof CONFIG<`u`?CONFIG:window.CONFIG||ce,i=e.userData,a=u.position,o=e.position.distanceTo(a);if(o>r.enemy.preferredDistance+4){n(e,a,r.enemy.attackSpeed,t);return}if(o<r.enemy.minimumDistance+2){let r=e.position.clone().sub(a);r.y=0,r.lengthSq()>.001&&(r.normalize(),n(e,e.position.clone().add(r.multiplyScalar(4)),i.speed*1.1,t));return}i.strafeTimer-=t,i.strafeTimer<=0&&(i.strafeTimer=.7+Math.random()*1.2,i.strafeDirection*=-1);let s=a.clone().sub(e.position);if(s.y=0,s.lengthSq()>.001){s.normalize();let r=new y(-s.z,0,s.x);r.multiplyScalar(i.strafeDirection*(3.5+Math.random()*1.5));let a=e.position.clone().add(r);Math.random()<.025&&a.add(s.clone().multiplyScalar(2)),n(e,a,i.speed*.8,t)}}window.__enhancedEnemyAI=!0;var C={player:{maxHealth:100},enemy:{detectionRange:36,fieldOfView:58,hearingRange:40,attackRange:30,preferredDistance:15,minimumDistance:8,patrolSpeed:1.7,investigateSpeed:2.4,attackSpeed:2.8,fireMinDelay:.9,fireMaxDelay:1.35,magazineSize:8,reloadTime:2.1,damageClose:20,damageMedium:12,damageFar:7},bomb:{interactionDistance:4.8}};window.CONFIG=C;var w=C.player.maxHealth,T=!1,E=!1,D=null,O=0,k=!1,A=!1,j=null,M=null,N=0,P=[{x:-35,z:-8},{x:35,z:-12},{x:-35,z:-30},{x:35,z:-32},{x:-27,z:-53},{x:28,z:-53}],F=document.createElement(`div`);F.style.cssText=`
position:fixed;
inset:0;
pointer-events:none;
z-index:80;
font-family:Arial,Helvetica,sans-serif;
`,document.body.appendChild(F);var I=document.createElement(`div`);I.style.cssText=`
position:absolute;
left:32px;
bottom:58px;
width:255px;
padding:10px 12px;
background:rgba(0,0,0,.65);
border:1px solid rgba(255,255,255,.15);
border-radius:8px;
box-sizing:border-box;
`,I.innerHTML=`

<div
style="
font-size:11px;
font-weight:bold;
letter-spacing:1px;
color:#dce7ef;
margin-bottom:6px;
">
OPERATOR HEALTH
</div>

<div
style="
height:14px;
background:rgba(255,255,255,.12);
border-radius:4px;
overflow:hidden;
">

<div
id="enhanced-health-fill"
style="
width:100%;
height:100%;
background:#32d74b;
transition:width .15s;
">
</div>

</div>

<div
id="enhanced-health-number"
style="
margin-top:5px;
color:white;
font-size:12px;
font-weight:bold;
">
100 / 100 HP
</div>

`,F.appendChild(I);var L=I.querySelector(`#enhanced-health-fill`),ue=I.querySelector(`#enhanced-health-number`),R=document.createElement(`div`);R.style.cssText=`
position:absolute;
left:50%;
top:70px;
transform:translateX(-50%);
padding:12px 24px;
background:rgba(125,0,0,.93);
border:1px solid rgba(255,70,70,.9);
border-radius:8px;
color:white;
font-size:17px;
font-weight:bold;
letter-spacing:1px;
opacity:0;
transition:opacity .12s;
white-space:nowrap;
`,F.appendChild(R);var z=document.createElement(`div`);z.style.cssText=`
position:absolute;
left:50%;
top:125px;
width:0;
height:0;
border-left:11px solid transparent;
border-right:11px solid transparent;
border-bottom:18px solid #ff3838;
filter:drop-shadow(0 0 6px rgba(255,0,0,.8));
opacity:0;
`,F.appendChild(z);var B=document.createElement(`div`);B.style.cssText=`
position:fixed;
inset:0;
pointer-events:none;
background:
radial-gradient(
circle,
transparent 40%,
rgba(255,0,0,.42) 100%
);
opacity:0;
transition:opacity .1s;
z-index:90;
`,document.body.appendChild(B);var V=document.createElement(`div`);V.style.cssText=`
position:absolute;
left:50%;
top:61%;
transform:translate(-50%,-50%);
padding:13px 25px;
background:rgba(0,0,0,.85);
border:1px solid rgba(255,50,50,.9);
border-radius:8px;
color:white;
font-size:15px;
font-weight:bold;
opacity:0;
transition:opacity .15s;
`,F.appendChild(V);function H(){let e=f.clamp(w/C.player.maxHealth,0,1);L.style.width=`${e*100}%`,e<=.25?L.style.background=`#ff453a`:e<=.5?L.style.background=`#ffcc00`:L.style.background=`#32d74b`,ue.textContent=`${Math.max(0,Math.ceil(w))} / ${C.player.maxHealth} HP`}function de(e,t){T||E||(w-=e,t&&K(t,`ENEMY FIRING`),B.style.opacity=`1`,setTimeout(()=>{B.style.opacity=`0`},130),H(),w<=0&&fe(t))}function fe(e){if(T)return;T=!0,E=!0,r.unlock();let t=document.createElement(`div`);t.style.cssText=`
position:fixed;
inset:0;
z-index:200;
display:flex;
flex-direction:column;
align-items:center;
justify-content:center;
background:rgba(0,0,0,.94);
color:white;
font-family:Arial,Helvetica,sans-serif;
`;let n=document.createElement(`div`);n.textContent=`YOU DIED`,n.style.cssText=`
font-size:60px;
font-weight:900;
color:#ff453a;
letter-spacing:2px;
margin-bottom:12px;
`,t.appendChild(n);let i=document.createElement(`div`);i.textContent=e?`Eliminated by ENEMY ${e.userData.enemyId}`:`You were eliminated.`,i.style.cssText=`
font-size:17px;
color:#b8c3cc;
margin-bottom:28px;
`,t.appendChild(i);let a=document.createElement(`button`);a.textContent=`RESTART LEVEL`,a.style.cssText=`
padding:13px 30px;
border:0;
border-radius:7px;
background:white;
color:#111;
font-size:15px;
font-weight:bold;
cursor:pointer;
`,a.onclick=()=>{location.reload()},t.appendChild(a),document.body.appendChild(t)}function pe(n){let r=document.createElement(`canvas`);r.width=600,r.height=160;let a=r.getContext(`2d`);a.fillStyle=`rgba(130,0,0,.95)`,a.beginPath(),a.roundRect(5,5,590,150,25),a.fill(),a.fillStyle=`white`,a.font=`bold 100px Arial`,a.textAlign=`center`,a.textBaseline=`middle`,a.fillText(`!`,65,80),a.font=`bold 44px Arial`,a.fillText(`ENEMY ${n}`,350,80);let s=new o(r);s.colorSpace=i;let c=new e({map:s,transparent:!0,depthTest:!1,depthWrite:!1}),l=new t(c);return l.scale.set(3.4,.91,1),l.position.y=4,l.visible=!1,l}function me(e){let t=new ee,r=new n({color:1513755,metalness:.85,roughness:.28}),i=new n({color:592653,metalness:.5,roughness:.5}),a=new n({color:4204315,roughness:.9}),o=new l(new _(.28,.24,.95),r);o.position.z=-.32,t.add(o);let u=new l(new _(.22,.2,.75),i);u.position.z=-1,t.add(u);let d=new l(new s(.045,.045,.85,8),i);d.rotation.x=Math.PI/2,d.position.z=-1.65,t.add(d);let f=new l(new _(.23,.2,.55),a);f.position.z=.45,t.add(f);let p=new l(new _(.18,.45,.28),i);p.position.set(0,-.32,-.15),p.rotation.x=-.18,t.add(p),t.position.set(.43,1.55,-.28),t.rotation.x=-.18,e.add(t);let m=new l(new ne(.13,8,8),new c({color:16758317}));m.position.z=-2.1,m.visible=!1,t.add(m);let h=new v(16752672,0,5);h.position.z=-2.1,t.add(h),e.userData.enemyGun=t,e.userData.enemyFlash=m,e.userData.enemyLight=h}for(let e=0;e<m.length;e++){let t=m[e],n=P[e%P.length];t.position.set(n.x,0,n.z),N++,t.userData={...t.userData||{},enhanced:!0,enemyId:N,health:100,alive:!0,state:`patrol`,speed:C.enemy.patrolSpeed+Math.random()*.45,direction:Math.random()*Math.PI*2,turnTimer:2+Math.random()*3,lastKnown:t.position.clone(),investigateTarget:t.position.clone(),investigateTimer:0,searchTimer:0,spotted:!1,alertTimer:0,ammo:C.enemy.magazineSize,reloadTimer:0,fireTimer:.5+Math.random(),strafeDirection:Math.random()>.5?1:-1,strafeTimer:1+Math.random()*2},t.traverse(e=>{e.isMesh&&(e.userData.enemy=t)}),me(t);let r=pe(N);t.add(r),t.userData.marker=r}function U(e,t,n,r){return ae(e,t,n,r)}var W=new b;W.camera=u;function G(e){if(!e.userData.alive)return!1;let t=e.position.clone();t.y=1.85;let n=u.position.clone();n.y=1.45;let r=n.clone().sub(t),i=r.length();if(i>C.enemy.detectionRange)return!1;r.normalize();let o=new y(0,0,-1);if(o.applyQuaternion(e.quaternion),f.radToDeg(o.angleTo(r))>C.enemy.fieldOfView)return!1;W.set(t,r);let s=W.intersectObjects(a.children,!0);for(let n of s){let r=n.object,a=r.parent,o=!1;for(;a;){if(a===e){o=!0;break}a=a.parent}if(!o&&!(r.geometry&&r.geometry.type===`PlaneGeometry`)){if(t.distanceTo(n.point)<i-.3)return!1;break}}return!0}function K(e,t){D=e,O=2.8,R.textContent=`⚠ ${t} • ENEMY ${e.userData.enemyId}`,R.style.opacity=`1`,e.userData.marker&&(e.userData.marker.visible=!0,e.userData.alertTimer=3.5)}function he(e){if(O>0&&(O-=e),O<=0){R.style.opacity=`0`,z.style.opacity=`0`;return}if(!D||!D.userData.alive){z.style.opacity=`0`;return}let t=D.position.clone();t.y+=2.8;let n=t.project(u);if(n.x>-.8&&n.x<.8&&n.y>-.75&&n.y<.75&&n.z>0&&n.z<1){z.style.opacity=`0`;return}let r=t.clone().sub(u.position).normalize(),i=new y;u.getWorldDirection(i),i.y=0,i.normalize();let a=new y().crossVectors(i,u.up).normalize(),o=Math.atan2(a.dot(r),i.dot(r));z.style.transform=`translateX(-50%) rotate(${f.radToDeg(o)}deg)`,z.style.opacity=`1`}function q(e){let t=e.userData,n=!t.spotted;t.spotted=!0,t.lastKnown=u.position.clone(),t.investigateTarget=u.position.clone(),t.searchTimer=7,t.alertTimer=3.5,t.state=`attack`,t.marker&&(t.marker.visible=!0),K(e,n?`ENEMY SPOTTED`:`TARGET REACQUIRED`);for(let t of m)t!==e&&t.userData.alive&&t.userData.state!==`attack`&&t.position.distanceTo(e.position)<=34&&(t.userData.lastKnown=u.position.clone(),t.userData.investigateTarget=u.position.clone(),t.userData.investigateTimer=6,t.userData.state=`investigate`)}function ge(e,t){let n=e.userData;if(n.investigateTimer-=t,G(e)){q(e);return}U(e,n.investigateTarget,C.enemy.investigateSpeed,t),(e.position.distanceTo(n.investigateTarget)<2||n.investigateTimer<=0)&&(n.searchTimer=5,n.state=`search`)}function _e(e,t){let n=e.userData;if(n.searchTimer-=t,G(e)){q(e);return}let r=performance.now()*.0012+n.enemyId,i=n.lastKnown.clone();i.x+=Math.cos(r)*3,i.z+=Math.sin(r)*3,U(e,i,n.speed*.45,t),n.searchTimer<=0&&(n.spotted=!1,n.state=`patrol`)}var J=new b;J.camera=u;function ve(e){let t=e.userData;if(!t.alive||t.reloadTimer>0)return;if(t.ammo<=0){t.reloadTimer=C.enemy.reloadTime;return}t.ammo--,t.fireTimer=f.randFloat(C.enemy.fireMinDelay,C.enemy.fireMaxDelay),t.enemyFlash&&(t.enemyFlash.visible=!0,setTimeout(()=>{t.enemyFlash&&(t.enemyFlash.visible=!1)},65)),t.enemyLight&&(t.enemyLight.intensity=3.5,setTimeout(()=>{t.enemyLight&&(t.enemyLight.intensity=0)},75)),K(e,`ENEMY FIRING`);let n=e.position.clone();n.y=1.78;let r=u.position.clone();r.y=1.45;let i=r.clone().sub(n).normalize();i.x+=f.randFloat(-.018,.018),i.y+=f.randFloat(-.012,.012),i.z+=f.randFloat(-.018,.018),i.normalize(),J.set(n,i);let o=J.intersectObjects(a.children,!0),s=n.distanceTo(u.position);for(let t of o){let r=t.object,i=r.parent,a=!1;for(;i;){if(i===e){a=!0;break}i=i.parent}if(!a&&!(r.geometry&&r.geometry.type===`PlaneGeometry`)){if(n.distanceTo(t.point)<s-.35)return;break}}let c=s,l=C.enemy.damageFar;c<12?l=C.enemy.damageClose:c<24&&(l=C.enemy.damageMedium),de(l,e)}function ye(e,t){let n=e.userData,r=G(e);if(r)n.lastKnown=u.position.clone(),n.searchTimer=7;else if(n.searchTimer-=t,n.searchTimer<=0){n.state=`search`;return}le(e,t,U);let i=u.position.clone();i.y=e.position.y+1.65,e.lookAt(i),r&&distance<=C.enemy.attackRange&&(n.fireTimer-=t,n.fireTimer<=0&&ve(e))}function be(e){if(!(E||T))for(let t of m){if(!t.userData.enhanced||!t.userData.alive)continue;let n=t.userData;n.reloadTimer>0&&(n.reloadTimer-=e,n.reloadTimer<=0&&(n.ammo=C.enemy.magazineSize,n.fireTimer=.4)),n.alertTimer>0&&(n.alertTimer-=e,n.alertTimer<=0&&n.marker&&(n.marker.visible=!1)),G(t)&&n.state!==`attack`&&q(t),n.state===`patrol`?se(t,e,U):n.state===`investigate`?ge(t,e):n.state===`attack`?ye(t,e):n.state===`search`&&_e(t,e)}}function xe(e){for(let t of m){let n=t.userData;if(!n.alive||n.state===`attack`)continue;let r=t.position.distanceTo(e);r>C.enemy.hearingRange||(n.lastKnown=e.clone(),n.investigateTarget=e.clone(),n.investigateTimer=6+Math.max(0,(C.enemy.hearingRange-r)/10),n.state=`investigate`)}}window.addEventListener(`mousedown`,e=>{e.button===0&&r.isLocked&&(T||E||xe(u.position.clone()))});function Se(){let e=f.randInt(40,70),t=Math.random()>.5?`POSITIVE`:`NEGATIVE`,n=f.randInt(2,8),r=f.randInt(0,3),i=[];for(let a=0;a<4;a++){let o=[`A`,`B`,`C`,`D`][a];if(a===r)i.push({label:o,frequency:e,polarity:t,pulse:n,traced:!1});else{let r=e+f.randInt(-15,15);for(;r===e;)r=e+f.randInt(-15,15);let a=Math.random()>.5?`POSITIVE`:`NEGATIVE`,s=f.randInt(1,9);r===e&&a===t&&s===n&&(s=s===9?1:s+1),i.push({label:o,frequency:r,polarity:a,pulse:s,traced:!1})}}return{targetFrequency:e,targetPolarity:t,targetPulse:n,wires:i}}function Ce(){if(k||A||T)return;if(u.position.distanceTo(g.position)>C.bomb.interactionDistance){d.textContent=`MOVE CLOSER TO THE BOMB`;return}k=!0,E=!0,r.unlock(),M=Se(),j=document.createElement(`div`),j.style.cssText=`
position:fixed;
inset:0;
z-index:150;
display:flex;
align-items:center;
justify-content:center;
background:rgba(3,7,11,.97);
color:white;
font-family:Arial,Helvetica,sans-serif;
`;let e=document.createElement(`div`);e.style.cssText=`
width:min(930px,92vw);
max-height:90vh;
overflow:auto;
padding:28px;
border-radius:14px;
background:#10171f;
border:1px solid #34404b;
box-shadow:0 30px 100px rgba(0,0,0,.7);
box-sizing:border-box;
`,e.innerHTML=`

<div
style="
display:flex;
justify-content:space-between;
align-items:center;
margin-bottom:18px;
">

<div
style="
font-size:28px;
font-weight:900;
">
BOMB CONTROL SYSTEM
</div>

<div
style="
color:#ff453a;
font-weight:bold;
">
● LIVE DEVICE
</div>

</div>


<div
style="
padding:18px;
margin-bottom:18px;
border-radius:9px;
background:#18212a;
border:1px solid #283541;
">

<div
style="
font-weight:bold;
font-size:16px;
margin-bottom:10px;
">
STEP 1 — IDENTIFY THE DETONATOR SIGNAL
</div>


<div
id="bomb-target-signal"
style="
display:flex;
flex-wrap:wrap;
gap:10px;
">
</div>


<div
style="
margin-top:13px;
color:#aebbc6;
font-size:13px;
line-height:1.55;
">

Do not guess the wire.

TRACE each wire and compare its
frequency, polarity and pulse pattern.

The wire matching the detonator signal
is the safe circuit.

</div>

</div>


<div
id="bomb-wire-grid"
style="
display:grid;
grid-template-columns:
repeat(auto-fit,minmax(190px,1fr));
gap:14px;
">
</div>


<div
id="bomb-message"
style="
min-height:25px;
margin-top:18px;
text-align:center;
font-weight:bold;
">
</div>

`,j.appendChild(e),document.body.appendChild(j);let t=e.querySelector(`#bomb-target-signal`);Y(t,`FREQUENCY`,`${M.targetFrequency} Hz`),Y(t,`POLARITY`,M.targetPolarity),Y(t,`PULSE`,M.targetPulse);let n=e.querySelector(`#bomb-wire-grid`);M.wires.forEach((e,t)=>{we(n,e,t)});let i=document.createElement(`button`);i.textContent=`CLOSE`,i.style.cssText=`
display:block;
margin:18px auto 0;
padding:11px 24px;
border-radius:7px;
border:1px solid #3d4a56;
background:#202a33;
color:white;
cursor:pointer;
font-weight:bold;
`,i.onclick=X,e.appendChild(i)}function Y(e,t,n){let r=document.createElement(`div`);r.style.cssText=`
padding:9px 12px;
border-radius:6px;
background:#0d1217;
border:1px solid #2b3741;
font-size:12px;
`,r.innerHTML=`
<span
style="
color:#8393a2;
">
${t}
</span>

<br>

<strong>
${n}
</strong>
`,e.appendChild(r)}function we(e,t,n){let r=[`#ff3434`,`#2d79ff`,`#ffd43b`,`#35d66a`],i=document.createElement(`div`);i.style.cssText=`
padding:16px;
border-radius:10px;
background:#151e27;
border:1px solid #303d49;
`,i.innerHTML=`

<div
style="
display:flex;
justify-content:space-between;
align-items:center;
margin-bottom:13px;
">

<strong
style="
font-size:22px;
">
WIRE ${t.label}
</strong>


<span
style="
width:15px;
height:15px;
border-radius:50%;
display:block;
background:${r[n]};
box-shadow:
0 0 10px ${r[n]};
">
</span>

</div>


<div
class="wire-signal"
style="
min-height:88px;
padding:12px;
border-radius:7px;
background:#0b1015;
color:#c4ced6;
font-size:12px;
line-height:1.75;
">
SIGNAL NOT TRACED
</div>


<button
class="trace-button"
style="
width:100%;
margin-top:11px;
padding:10px;
border-radius:6px;
border:1px solid #465562;
background:#26323c;
color:white;
cursor:pointer;
font-weight:bold;
">
TRACE SIGNAL
</button>


<button
class="cut-button"
disabled
style="
width:100%;
margin-top:8px;
padding:10px;
border-radius:6px;
border:0;
background:#842323;
color:white;
cursor:pointer;
font-weight:bold;
opacity:.4;
">
CUT WIRE
</button>

`,e.appendChild(i);let a=i.querySelector(`.wire-signal`),o=i.querySelector(`.trace-button`),s=i.querySelector(`.cut-button`);o.onclick=()=>{t.traced=!0,a.innerHTML=`

FREQUENCY:
<strong>
${t.frequency} Hz
</strong>

<br>

POLARITY:
<strong>
${t.polarity}
</strong>

<br>

PULSE:
<strong>
${t.pulse}
</strong>

`,s.disabled=!1,s.style.opacity=`1`;let e=j.querySelector(`#bomb-message`);e.textContent=`WIRE ${t.label} TRACED — compare all three properties.`,e.style.color=`#d7e1e9`},s.onclick=()=>{t.traced&&(t.frequency===M.targetFrequency&&t.polarity===M.targetPolarity&&t.pulse===M.targetPulse?Te(t):Ee())}}function Te(e){A=!0;let t=j.querySelector(`#bomb-message`);t.textContent=`✓ WIRE ${e.label} MATCHED THE DETONATOR — BOMB DISARMED`,t.style.color=`#45ff8b`,te.textContent=`LEVEL 1 COMPLETE — BOMB DISARMED`,p.material=new c({color:3342194}),h.color.set(3342194),h.intensity=.7,setTimeout(()=>{X(),window.onLevelVictory?window.onLevelVictory():d.textContent=`MISSION ACCOMPLISHED`},1100)}function Ee(){X(),T=!0,E=!0,r.unlock();let e=document.createElement(`div`);e.style.cssText=`
position:fixed;
inset:0;
z-index:250;
background:rgba(255,100,20,.96);
transition:opacity 1s;
`,document.body.appendChild(e);let t=new v(16734742,30,40);t.position.copy(g.position),a.add(t),setTimeout(()=>{e.style.opacity=`0`},80),setTimeout(()=>{e.remove(),t.remove();let n=document.createElement(`div`);n.style.cssText=`
position:fixed;
inset:0;
z-index:251;
display:flex;
flex-direction:column;
align-items:center;
justify-content:center;
background:rgba(0,0,0,.93);
color:white;
font-family:Arial,Helvetica,sans-serif;
`,n.innerHTML=`

<div
style="
font-size:52px;
font-weight:900;
color:#ff453a;
margin-bottom:12px;
">
BOMB DETONATED
</div>


<div
style="
color:#aeb8c0;
margin-bottom:24px;
">
The signal did not match the detonator circuit.
</div>

`;let r=document.createElement(`button`);r.textContent=`RESTART LEVEL`,r.style.cssText=`
padding:13px 27px;
border:0;
border-radius:7px;
background:white;
color:#111;
font-weight:bold;
cursor:pointer;
`,r.onclick=()=>{location.reload()},n.appendChild(r),document.body.appendChild(n)},1e3)}function X(){k&&(k=!1,E=!1,j&&=(j.remove(),null),T||(d.textContent=`CLICK TO ENTER`))}var Z=!1;window.addEventListener(`keydown`,function(e){if(e.code!==`KeyE`&&e.key.toLowerCase()!==`e`||(e.preventDefault(),e.stopPropagation(),Z)||(Z=!0,setTimeout(()=>{Z=!1},250),T))return;if(k){X();return}let t=u.position.distanceTo(g.position);if(t>C.bomb.interactionDistance){d.textContent=`BOMB TOO FAR — ${t.toFixed(1)}m AWAY`,setTimeout(()=>{!k&&!T&&(d.textContent=`LOCATE THE BOMB`)},1200);return}Ce()},!0);function De(){if(T||A||k){V.style.opacity=`0`;return}let e=u.position.distanceTo(g.position);if(e>12){V.style.opacity=`0`;return}if(e>C.bomb.interactionDistance){V.innerHTML=`
            <div
            style="
            font-size:14px;
            font-weight:bold;
            color:#ffcc66;
            ">
            BOMB DETECTED
            </div>

            <div
            style="
            margin-top:5px;
            font-size:12px;
            color:#d0d7dd;
            ">
            ${e.toFixed(1)}m away
            </div>
        `,V.style.opacity=`1`;return}V.innerHTML=`
        <div
        style="
        font-size:16px;
        font-weight:900;
        color:#ff453a;
        ">
        ⚠ BOMB FOUND
        </div>

        <div
        style="
        margin-top:6px;
        font-size:14px;
        color:white;
        ">
        PRESS <strong>E</strong> TO DEFUSE
        </div>
    `,V.style.opacity=`1`}function Oe(){E||De()}setInterval(Oe,100);function ke(){if(A||k||T){V.style.opacity=`0`;return}u.position.distanceTo(g.position)<=C.bomb.interactionDistance?(V.textContent=`⚠ BOMB — PRESS E TO ACCESS DEFUSAL SYSTEM`,V.style.opacity=`1`):V.style.opacity=`0`}H();var Q=performance.now();function $(){requestAnimationFrame($);let e=performance.now(),t=Math.min((e-Q)/1e3,.05);Q=e,be(t),ke(),he(t)}$();