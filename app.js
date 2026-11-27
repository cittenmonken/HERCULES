const adminSessionStorageKey = 'hercules-admin-token';
const adminTokenPattern = /^\d{10}\.[a-f0-9-]{36}\.[a-f0-9]{64}$/;
let adminToken = '', verifiedAdminToken = '';
try{adminToken=sessionStorage.getItem(adminSessionStorageKey)||'';}catch{}
function setAdminToken(token){
  if(token!==adminToken)verifiedAdminToken='';
  adminToken=token;
  try{
    if(token)sessionStorage.setItem(adminSessionStorageKey,token);
    else sessionStorage.removeItem(adminSessionStorageKey);
  }catch{}
}
function currentAdminToken(){
  if(adminToken && (!adminTokenPattern.test(adminToken) ||
    Number(adminToken.split('.')[0])*1000<=Date.now()))setAdminToken('');
  return adminToken;
}
const sitesOrigin = 'https://tenmonken-infoweb-2026.rt-earth616.chatgpt.site';
async function pagesFetch(input, options = {}) {
  const url = new URL(input,location.href);
  if (url.origin !== sitesOrigin || !url.pathname.startsWith('/api/')) return fetch(input,options);
  const headers = new Headers(options.headers);
  const token=/^\/admin(?:\/|$)/.test(pagePath())?currentAdminToken():'';
  if(token)headers.set('Authorization','Bearer '+token);
  const response=await fetch(input,{...options,headers,credentials:'omit',redirect:'error'});
  if(response.status===401&&token&&token===verifiedAdminToken&&token===adminToken){
    setAdminToken('');
    const route=pagePath().match(/^\/admin(?:\/([^/]+))?\/?$/);
    if(route)admin(route[1]||'');
  }
  return response;
}
function bindPagesLogin(form, onSuccess) {
  form.hidden=false;
  form.onsubmit=async event=>{
    event.preventDefault();
    const button=form.querySelector('button');
    const field=form.querySelector('input');
    const status=form.querySelector('#err');
    const phrase=field.value;
    field.value='';
    const started=performance.now();
    const elapsed=()=>((performance.now()-started)/1000).toFixed(1);
    const label=button.textContent;
    const progress=form.querySelector('progress');
    status.textContent='認証確認中…';
    progress.hidden=false;
    button.disabled=true;
    const tick=()=>{button.textContent='開いています　'+elapsed()+' 秒';};
    tick();
    const timer=setInterval(tick,100);
    try{
      const response=await fetch(sitesOrigin+'/_pages-admin-login',{
        method:'POST',credentials:'omit',redirect:'error',cache:'no-store',
        headers:{'Content-Type':'application/json'},body:JSON.stringify({phrase})
      });
      const value=await response.json();
      if(!response.ok)throw Error(value.error||'認証できませんでした。');
      if(!adminTokenPattern.test(value.token||''))throw Error('認証結果を確認できませんでした。');
      setAdminToken(value.token);
      verifiedAdminToken=value.token;
      onSuccess(elapsed());
    }catch(error){status.textContent=error.message+'（'+elapsed()+' 秒）';field.focus();}
    finally{clearInterval(timer);progress.hidden=true;button.textContent=label;button.disabled=false;}
  };
}
document.addEventListener('click', event=>{
  const link=event.target.closest('a[href]');
  if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.altKey||event.shiftKey||!link||link.target)return;
  const url=new URL(link.href);
  const route=url.pathname.match(/^\/HERCULES\/admin(?:\/([^/]+))?\/?$/);
  if(!route||url.origin!==location.origin||route[1]&&!Object.hasOwn(adminPages,route[1]))return;
  event.preventDefault();
  history.pushState(null,'',url);
  admin(route[1]||'');
});
window.addEventListener('popstate',()=>{
  const route=pagePath().match(/^\/admin(?:\/([^/]+))?\/?$/);
  if(route&&(!route[1]||Object.hasOwn(adminPages,route[1])))admin(route[1]||'');
  else location.reload();
});

const pagePath=()=>location.pathname.replace(/^\/HERCULES(?=\/|$)/,'')||'/';

const paths={
 bell:'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4',
 photos:'M3 5h18v14H3z M6 16l4-5 3 3 2-2 3 4 M15 8h.01',
  link:'M10 13a4 4 0 0 0 6 0l4-4a4 4 0 0 0-6-6l-2 2m2 6a4 4 0 0 0-6 0l-4 4a4 4 0 0 0 6 6l2-2',
 menu:'M4 6h16M4 12h16M4 18h16',home:'m3 10 9-7 9 7v10H3zM9 20v-7h6v7',
 admin:'M4 6h16M4 12h16M4 18h16M8 4v4m8 2v4m-6 2v4',chat:'M4 4h16v12H9l-5 4z',
 feedback:'M3 6h18v14H3zM3 7l9 7 9-7',members:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-4m-5-7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm3-4a4 4 0 0 1 0 8',
 procedures:'M6 3h9l4 4v14H6zM14 3v5h5m-9 4h5m-5 4h5',meeting:'m3 10 14-6 2 5-14 6zM10 13l-4 8m6-9 5 9m-5-9v9',
 newMoon:'M12 3a9 9 0 1 0 0 18 9 9 0 1 0 0-18Z M9 12h6',fullMoon:'M12 3a9 9 0 1 0 0 18 9 9 0 1 0 0-18Z',
 firstQuarter:'M12 3a9 9 0 0 1 0 18Z',lastQuarter:'M12 3a9 9 0 0 0 0 18Z',
 waxingMoon:'M12 3a9 9 0 0 1 0 18C6 17 6 7 12 3Z',waningMoon:'M12 3a9 9 0 0 0 0 18c6-4 6-14 0-18Z',
 crescent:'M4 15A8.5 8.5 0 0 0 15 4 8.5 8.5 0 1 1 4 15Z',moon:'M20 15A8.5 8.5 0 0 1 9 4a8.5 8.5 0 1 0 11 11Z',weather:'M6 18h12a4 4 0 1 0-1-8 6 6 0 0 0-11 2 3 3 0 0 0 0 6Z',
 sun:'M12 8a4 4 0 1 0 0 8 4 4 0 1 0 0-8ZM12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5',
 rain:'M6 15h12a3 3 0 1 0-1-6 5 5 0 0 0-10 1 2.5 2.5 0 1 0-1 5Zm2 3-1 2m6-2-1 2m6-2-1 2',
 news:'M5 3h14v18H5zM8 7h8m-8 4h8m-8 4h8',about:'M12 3a9 9 0 1 0 0 18 9 9 0 1 0 0-18Zm0 8v5m0-8h.01',
 calendar:'M4 6h16v14H4zM4 10h16M8 4v4m8-4v4',star:'m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z'
};
const lineIcon=name=>`<svg class="line-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name]||paths.calendar}"/></svg>`;
const dateFormat=new Intl.DateTimeFormat('ja-JP',{year:'numeric',month:'long',day:'numeric',timeZone:'Asia/Tokyo'});
const timeFormat=new Intl.DateTimeFormat('ja-JP',{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Tokyo'});
function displayDate(value){
  const date=new Date(value);
  return Number.isNaN(date.getTime())?'':dateFormat.format(date);
}
function displayTimestamp(value){
  const date=new Date(String(value).replace(' ','T')+'Z');
  return Number.isNaN(date.getTime())?'':displayDate(date)+' '+timeFormat.format(date);
}
function countdownIcon(value){return value==='⭐'?'star':Object.hasOwn(paths,value)?value:'calendar'}

let data={meeting:'',location:'',announcement:''},news=[],countdowns=[];
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const moonPhase=(instant=Date.now())=>{let days=(instant-Date.parse('2000-01-06T18:14:00Z'))/86400000,age=((days%29.530588853)+29.530588853)%29.530588853,phases=['newMoon','moon','firstQuarter','waxingMoon','fullMoon','waningMoon','lastQuarter','crescent'];return{age,icon:lineIcon(phases[Math.round(age/29.530588853*8)%8]),label:age<1?'新月':age<7?'三日月':age<9?'上弦':age<14?'満ちていく月':age<16?'満月':age<22?'欠けていく月':age<24?'下弦':'細い月'}};
const jstDay=date=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Tokyo'}).format(date);
function countDown(event){
  const days=(Date.parse(event.date)-Date.parse(jstDay(new Date())))/86400000;
  if(days<0)return '開催日を過ぎました';
  if(!event.time)return days===0?'今日開催':`あと ${days} 日`;
  const minutes=Math.ceil((Date.parse(event.date+'T'+event.time+':00+09:00')-Date.now())/60000);
  if(minutes<=0)return '開催時刻を迎えました';
  if(days>0)return `あと ${days} 日`;
  return `あと ${Math.floor(minutes/60)} 時間 ${minutes%60} 分`;
}
const eventDate=event=>displayDate(event.date)+(event.time?' '+esc(event.time):'');
const eventExpired=event=>(event.deadline||event.date)<new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Tokyo'}).format(new Date());
function safariFormHref(value){
  if(navigator.standalone!==true)return '';
  try{
    const url=new URL(value);
    if(url.protocol!=='https:'||url.username||url.password||url.port)return '';
    if(url.hostname==='forms.gle'||(url.hostname==='docs.google.com'&&url.pathname.startsWith('/forms/'))||
      ((url.hostname==='forms.google.com'||url.hostname==='www.google.com')&&url.pathname.startsWith('/forms/')))return 'x-safari-'+url.href;
  }catch{}
  return '';
}
function eventLink(title,url){
  const safari=safariFormHref(url);
  return url?`<a href="${esc(safari||url)}"${safari?'':' target="_blank"'} rel="noopener noreferrer">${esc(title)} ↗</a>`:esc(title);
}
function eventDetails(event){
  const rows=[
    ['開催日時',event.date?eventDate(event):''],
    ['開催場所',esc(event.location||'')],
    ['地図',eventLink(event.mapTitle||(event.mapUrl?'地図を開く':''),event.mapUrl)],
    ['主催',eventLink(event.organizer||(event.organizerUrl?'主催者サイト':''),event.organizerUrl)],
    ['持ち物',esc(event.supplies||'')],
    ['注意事項',esc(event.precautions||'')],
    ['メモ',esc(event.memo||'')]
  ];
  return `<div class="detail-box">${event.showCountdown?`<b class="value">${countDown(event)}</b>`:''}
    <dl class="event-details">${rows.filter(([,value])=>value).map(([label,value])=>`<div><dt>${label}</dt><dd>${value}</dd></div>`).join('')}</dl></div>`;
}
function countdownCards(){
  if(!countdowns.length)return '';
  return `<section class="feature-stack" style="grid-column:1/-1"><h2>イベント</h2><div class="cards">${countdowns.map(event=>card(`countdown-${event.id}`,'peach',lineIcon(countdownIcon(event.icon)),esc(event.title),
    `<div class="card-body">${event.showCountdown?`<div class="value">${countDown(event)}</div>`:''}<div>${eventDate(event)}</div><div class="hint">${esc([event.location,event.organizer].filter(Boolean).join('　'))}</div></div>`)).join('')}</div></section>`;
}
function pinnedStrip(){
  const items=countdowns.filter(event=>event.pinned);
  return items.length?`<nav class="pinned-strip" aria-label="ヘッダー固定イベント">${items.map(event=>`<button class="pin-chip" data-detail="countdown-${event.id}">${lineIcon(countdownIcon(event.icon))} ${esc(event.title)}${event.showCountdown?'　'+countDown(event):''}</button>`).join('')}</nav>`:'';
}
function card(id,cls,icon,title,body){if(id==='news')return `<section class="card ${cls}"><button class="card-head" data-detail="news" style="border:0;background:transparent;color:inherit;padding:0"><span class="glyph">${icon}</span><span>${title}</span></button>${body}</section>`;return `<button class="card ${cls}" data-detail="${id}"><div class="card-head"><span class="glyph">${icon}</span><span>${title}</span></div>${body}<span class="card-foot">タップして詳細 →</span></button>`}
function meetingFriday(now=new Date()){
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
  const part=type=>Number(parts.find(p=>p.type===type).value);
  const date=new Date(Date.UTC(part('year'),part('month')-1,part('day')));
  date.setUTCDate(date.getUTCDate()+(5-date.getUTCDay()+7)%7);
  return displayDate(date)+'（金）';
}
function meetingDisplay(){
  if(!data.meetingDate)return meetingFriday();
  return new Intl.DateTimeFormat('ja-JP',{year:'numeric',month:'long',day:'numeric',weekday:'short',timeZone:'Asia/Tokyo'}).format(new Date(data.meetingDate+'T00:00:00+09:00'));
}
const defaultDescription='千葉工業大学 文化会 天文研究部「ヘラクレス」の情報ページです。';
const siteDescription=()=>esc(data.description??defaultDescription);
function meetingStatus(){
  const today=new Date(jstDay(new Date())+'T00:00:00Z');
  today.setUTCDate(today.getUTCDate()+(5-today.getUTCDay()+7)%7);
  const date=data.meetingDate||today.toISOString().slice(0,10);
  return data.meetingStatusDate===date?data.meetingStatus:'pending';
}
function meetingBadge(){
  const labels={scheduled:'開催予定',cancelled:'中止',pending:'開催未定'};
  const status=meetingStatus();
  return `<span class="meeting-badge ${Object.hasOwn(labels,status)?status:'pending'}">${labels[status]||labels.pending}</span>`;
}
function meetingCardBody(){return `<div id="homeMeeting" class="card-body"><div class="value" data-meeting-date>${meetingDisplay()}</div><div class="meeting-summary"><span data-meeting-status>${meetingBadge()}</span><span>${esc(data.location||"—")}</span></div>${data.meeting?`<div class="meeting-notes meeting-preview">${esc(data.meeting)}</div>`:''}</div>`;}
function bindHomeDetails(root){
  root.querySelectorAll('[data-detail]').forEach(button=>{button.onclick=()=>show(button.dataset.detail);});
}
function updateHomeDetails(){
  document.getElementById('homeMeeting').outerHTML=meetingCardBody();
  const events=document.getElementById('homeEvents');
  events.innerHTML=countdownCards();
  bindHomeDetails(events);
  const pinned=document.getElementById('homePinned');
  pinned.innerHTML=pinnedStrip();
  bindHomeDetails(pinned);
}
function render(){const m=moonPhase();document.getElementById('app').innerHTML=`<div class="shell">${siteHeader({home:true})}<section class="cards">${card('meeting','large',lineIcon('meeting'),'今週の観測会',meetingCardBody())}${card('moon','mint',lineIcon('moon'),'今日の惑星情報',`<div class="card-body moonrow"><span class="moon">${m.icon}</span><div><div class="value">${m.label}</div><div class="hint">月齢 約 ${m.age.toFixed(1)} 日</div></div></div>`)}${card('weather','',lineIcon('weather'),'茜浜の天気',`<div class="card-body weatherline"><span class="weathericon" id="wxIcon">${lineIcon('weather')}</span><div><div class="value" id="wxText">取得中</div><div class="hint" id="wxTemp">千葉県習志野市 茜浜</div></div></div>`)}${card('news','news',lineIcon('news'),'今週の天文ニュース',`<div class="card-body" style="margin-left:0"><div id="newsList" class="news-list"><div class="news-state">ニュースを取得中です。</div></div></div>`)}<div id="homeEvents" style="display:contents">${countdownCards()}</div>${card('about','mint',lineIcon('about'),'ヘラクレスについて','')}</section><footer class="footer">©︎ 千葉工業大学 文化会 天文研究部<br>ヘラクレス 2026<br>All rights reserved.<br>本WebサイトはChatGPTを使用して作成しています。</footer></div>`;bindHomeDetails(document.getElementById('app'))}
const details={meeting:['今週の観測会',()=>`<div class="detail-box"><div class="meeting-summary"><strong data-meeting-date>${meetingDisplay()}</strong><span data-meeting-status>${meetingBadge()}</span></div><p>場所　${esc(data.location||"—")}</p><div><strong>特記事項</strong><div class="meeting-notes">${esc(data.meeting||"—")}</div></div></div>`],moon:['今日の惑星情報',()=>{let m=moonPhase();return `<div class="detail-box" style="display:flex;align-items:center;gap:16px"><span style="font-size:52px">${m.icon}</span><div><b>${m.label}</b><br>月齢 約 ${m.age.toFixed(1)} 日</div></div><div class="weather-grid" id="skyTimes">時刻を取得しています。</div><p class="hint">茜浜付近、日本時間。月齢と時刻は目安です。</p>`}],weather:['茜浜の天気',()=>`<div class="detail-box" id="detailWeather">現在の天気を取得しています。</div>${weatherLinks()}`],news:['今週の天文ニュース',()=>`<div id="detailNews" class="detail-list">ニュースを取得中です。</div>`],about:['ヘラクレスについて',()=>`<div class="detail-box about-copy">${siteDescription()}</div>`]};
async function show(id,settingsReadBefore){
  if(id==='meeting'&&isWebApp()&&settingsReadBefore===undefined){
    const started=Date.now();
    if(await loadSettings()){
      settingsReadBefore=started;
      saveObservation();
    }
  }
  let item=id.startsWith('countdown-')?countdowns.find(c=>String(c.id)===id.slice(10)&&!eventExpired(c)):null;const d=item?[eventLink(item.title,item.eventUrl),()=>eventDetails(item)]:details[id];if(!d)return;if(item)document.getElementById('modal').dataset.eventId=item.id;document.getElementById('modalContent').innerHTML=`<h2 id="modalTitle">${d[0]}</h2>${d[1]()}`;document.getElementById('modal').classList.add('show');if(id==='meeting'&&settingsReadBefore&&isWebApp())void noticeCount('read-notices',settingsReadBefore,'meeting');if(id==='weather')weather(true);if(id==='moon')loadSkyTimes();if(id==='news')drawNews(true)}function closeModal(){delete document.getElementById('modal').dataset.eventId;document.getElementById('modal').classList.remove('show')}document.getElementById('modal').onclick=e=>{if(e.target.id==='modal')closeModal()};document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
async function loadSettings(){
  try{
    const response=await pagesFetch('https://tenmonken-infoweb-2026.rt-earth616.chatgpt.site/api/settings');
    if(!response.ok)return false;
    data={...data,...await response.json()};
    updateAnnouncementBadge();
    return true;
  }catch{return false}
}
async function loadNews(){try{let r=await pagesFetch('https://tenmonken-infoweb-2026.rt-earth616.chatgpt.site/api/news');news=r.ok?await r.json():[]}catch{news=[]}drawNews(false);drawNews(true)}function drawNews(detail){let target=document.getElementById(detail?'detailNews':'newsList');if(!target)return;if(!news.length){target.innerHTML=`<div class="news-state"><p>現在表示できる記事がありません。</p><div class="feature-links"><a class="secondary" href="https://www.astroarts.co.jp/" target="_blank" rel="noopener noreferrer">アストロアーツ ↗</a><a class="secondary" href="https://www.nao.ac.jp/news/topics/" target="_blank" rel="noopener noreferrer">国立天文台 ↗</a><a class="secondary" href="https://www.jaxa.jp/" target="_blank" rel="noopener noreferrer">JAXA ↗</a></div></div>`;return}target.innerHTML=news.slice(0,detail?18:3).map(n=>`<a class="${detail?'detail-news':'news-item'}" href="${esc(n.url)}" target="_blank" rel="noopener noreferrer"><span class="news-source">${esc(n.source)}${n.date?' · '+displayDate(n.date):''}</span>${esc(n.title)}<span class="hint">　元記事 ↗</span></a>`).join('')}
async function weather(detail=false){try{let r=await pagesFetch('https://api.open-meteo.com/v1/forecast?latitude=35.665&longitude=140.012&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m&daily=temperature_2m_max,temperature_2m_min&timezone=Asia%2FTokyo');if(!r.ok)throw 0;let j=await r.json(),c=j.current,d=j.daily,t=`${wxLabel(c.weather_code)}　${Math.round(c.temperature_2m)}℃`;if(document.getElementById('wxText'))document.getElementById('wxText').textContent=t;if(document.getElementById('wxIcon'))document.getElementById('wxIcon').innerHTML=wxIcon(c.weather_code);if(detail&&document.getElementById('detailWeather'))document.getElementById('detailWeather').innerHTML=`<div class="weather-main"><span class="weather-big">${wxIcon(c.weather_code)}</span><div><b>${wxLabel(c.weather_code)}</b><strong>${Math.round(c.temperature_2m)}℃</strong><span>体感 ${Math.round(c.apparent_temperature)}℃</span></div></div><div class="weather-grid"><div><small>今日の最高 / 最低</small><b>${Math.round(d.temperature_2m_max[0])}℃ / ${Math.round(d.temperature_2m_min[0])}℃</b></div><div><small>湿度</small><b>${Math.round(c.relative_humidity_2m)}%</b></div><div><small>降水量</small><b>${c.precipitation} mm</b></div><div><small>風速</small><b>${c.wind_speed_10m} km/h</b></div></div><p class="hint">茜浜近隣地点の現在値　予報値（取得時刻 ${new Date(c.time).toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'})}）</p>`}catch{if(document.getElementById('wxText'))document.getElementById('wxText').textContent='取得できません';if(detail&&document.getElementById('detailWeather'))document.getElementById('detailWeather').textContent='現在の天気を取得できません。'}}function wxIcon(c){return lineIcon(c===0?'sun':c>=51?'rain':'weather')}function wxLabel(c){if(c===0)return'快晴';if(c<=2)return'晴れ';if(c===3)return'くもり';if(c>=51&&c<=67||c>=80&&c<=82)return'雨';if(c>=71&&c<=77)return'雪';if(c>=95)return'雷雨';return'天気情報'}
function weatherLinks(){
  const link=(name,url)=>`<a class="secondary" href="${url}" target="_blank" rel="noopener noreferrer">${name} ↗</a>`;
  return `<h3>茜浜</h3><div class="feature-links">${link('Windy（茜浜）','https://www.windy.com/35.665/140.012?35.665,140.012,12')}</div>
    <h3>習志野市</h3><div class="feature-links">${link('Yahoo!天気','https://weather.yahoo.co.jp/weather/jp/12/4510/12216.html')}${link('気象庁','https://www.data.jma.go.jp/yoho/data/jishin/met/kishoushien_Chiba_Narashino-shi.html')}</div>`;
}
async function loadSkyTimes(node=document.getElementById('skyTimes'),date){
  let values={};
  try{const response=await pagesFetch(date?'https://tenmonken-infoweb-2026.rt-earth616.chatgpt.site/api/sky?date='+encodeURIComponent(date):'https://tenmonken-infoweb-2026.rt-earth616.chatgpt.site/api/sky');if(response.ok)values=await response.json()}catch{}
  const labels={moonrise:'月の出',moonset:'月の入',sunrise:'日の出',sunset:'日の入'};
  node.innerHTML=Object.entries(labels).map(([key,label])=>`<div><small>${label}</small><b>${values[key]?timeFormat.format(new Date(values[key])):values[key]===null?'この日はなし':'取得できません'}</b></div>`).join('');
}
const planetViews={
  Neptune:{label:'海王星',diameter:49528,image:'d/d2/Neptune_Full_%28original%29.jpg',credit:'NASA/JPL　ボイジャー2号',source:'https://commons.wikimedia.org/wiki/File:Neptune_Full_%28original%29.jpg'},
  Uranus:{label:'天王星',diameter:51118,image:'8/8b/Uranus_from_Voyager_2.jpg',credit:'NASA　ボイジャー2号',source:'https://commons.wikimedia.org/wiki/File:Uranus_from_Voyager_2.jpg'},
  Saturn:{label:'土星',diameter:120536,image:'c/c7/Saturn_during_Equinox.jpg',credit:'NASA/JPL　カッシーニ',source:'https://commons.wikimedia.org/wiki/File:Saturn_during_Equinox.jpg'},
  Jupiter:{label:'木星',diameter:142984,image:'2/2b/Jupiter_and_its_shrunken_Great_Red_Spot.jpg',credit:'NASA/ESA　ハッブル宇宙望遠鏡',source:'https://commons.wikimedia.org/wiki/File:Jupiter_and_its_shrunken_Great_Red_Spot.jpg'},
  Mercury:{label:'水星',diameter:4879,image:'3/30/Mercury_in_color_-_Prockter07_centered.jpg',credit:'NASA　マリナー10号',source:'https://commons.wikimedia.org/wiki/File:Mercury_in_color_-_Prockter07_centered.jpg'},
  Venus:{label:'金星',diameter:12104,image:'1/11/PIA23791-Venus-NewlyProcessedView-20200608_%28cropped%29.jpg',credit:'NASA/JPL-Caltech',source:'https://science.nasa.gov/photojournal/venus-from-mariner-10/'},
  Mars:{label:'火星',diameter:6779,image:'5/58/Mars_23_aug_2003_hubble.jpg',credit:'NASA/ESA　ハッブル宇宙望遠鏡',source:'https://science.nasa.gov/asset/hubble/mars-near-opposition-1995-2005-2003/'}
};
let astronomyRequest;
function loadCalendarAstronomy(){
  if(!astronomyRequest){
    astronomyRequest=new Promise((resolve,reject)=>{
      const script=document.createElement('script');
      script.src='https://cdn.jsdelivr.net/npm/astronomy-engine@2.1.19/astronomy.browser.min.js';
      script.onload=()=>window.Astronomy?resolve(window.Astronomy):reject(Error());
      script.onerror=()=>reject(Error());
      document.head.append(script);
    }).catch(error=>{astronomyRequest=null;throw error});
  }
  return astronomyRequest;
}
function planetObservation(astro,body,date){
  const observer=new astro.Observer(35.665,140.012,0);
  const direction=(object,time)=>{
    const position=astro.Equator(object,time,observer,true,true);
    return astro.Horizon(time,observer,position.ra,position.dec,'normal');
  };
  const start=+date-12*3600000;
  const intervals=[];
  let best=null;
  for(let minute=0;minute<1440;minute+=10){
    const time=new Date(start+minute*60000);
    if(direction('Sun',time).altitude>-6)continue;
    const {altitude,azimuth}=direction(body,time);
    if(altitude<10)continue;
    const last=intervals.at(-1);
    if(last&&last.end===minute-10)last.end=minute;
    else intervals.push({start:minute,end:minute});
    if(!best||altitude>best.altitude)best={time,altitude,azimuth};
  }
  const localTime=minute=>timeFormat.format(new Date(start+minute*60000));
  const windows=intervals.map(({start,end})=>start===end?localTime(start):localTime(start)+'〜'+localTime(end)).join('／');
  return {best,windows};
}
function planetPhoto(astro,body,date,large=false){
  const view=planetViews[body],light=astro.Illumination(body,date);
  let clip='';
  if(body==='Venus'){
    const points=[];
    const sun=astro.Ecliptic(astro.GeoVector('Sun',date,true)).elon;
    const planet=astro.Ecliptic(astro.GeoVector(body,date,true)).elon;
    const sign=(planet-sun+360)%360<180?1:-1;
    for(const [edgeIndex,edge] of [1,2*light.phase_fraction-1].entries()){
      for(let step=0;step<=24;step++){
        const theta=Math.PI*(edgeIndex===0?step:24-step)/24;
        points.push(`${50+sign*edge*50*Math.sin(theta)}% ${50-50*Math.cos(theta)}%`);
      }
    }
    clip=` style="clip-path:polygon(${points.join(',')})"`;
  }
  if(body==='Mars'){
    const apparentSize=view.diameter/(light.geo_dist*149597870.7)*206264.8;
    const scale=Math.max(.33,Math.min(1,apparentSize/25));
    clip=` style="width:${scale*100}%"`;
  }
  return `<span class="planet-disc"><img src="https://upload.wikimedia.org/wikipedia/commons/${view.image}" width="216" height="216" decoding="async" alt="${large?view.label+'の観測画像':''}"${clip}></span>`;
}
function renderPlanetCalendar(){
  const asDate=(year,month,day)=>new Date(Date.UTC(year,month,day,3));
  const iso=date=>date.toISOString().slice(0,10);
  const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Tokyo'}).format(new Date());
  const [year,month,day]=today.split('-').map(Number);
  const current=asDate(year,month-1,day);
  const root=document.getElementById('app');
  root.innerHTML=`<div class="shell">${siteHeader()}<main id="planetCalendar" class="planet-panel"><div class="planet-heading"><h1>惑星カレンダー</h1><div class="planet-switch"><select id="planetBody" aria-label="天体"><option value="Moon">月</option>${['Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune'].map(key=>`<option value="${key}">${planetViews[key].label}</option>`).join('')}</select></div></div><p>習志野市 茜浜付近 ／ 日本時間</p><div class="planet-controls"><button type="button" data-month="-1" aria-label="前の月">‹</button><strong id="planetMonth" aria-live="polite"></strong><button type="button" data-month="1" aria-label="次の月">›</button><button type="button" data-month="today">今日</button></div><div class="planet-grid" id="planetDays"></div><section id="planetDetail" aria-live="polite"></section><p id="planetCredit" class="planet-notes">月相と月齢は日本時間12時の概算です。月面画像は日本時間12時のNASAによる可視化です。<br><a href="https://svs.gsfc.nasa.gov/gallery/moonphase/">画像提供 NASA Scientific Visualization Studio</a></p></main></div>`;
  const panel=document.getElementById('planetCalendar'),grid=document.getElementById('planetDays'),detail=document.getElementById('planetDetail');
  const credit=panel.querySelector('#planetCredit'),moonCredit=credit.innerHTML;
  let selected=current,body='Moon',astro;
  const monthIndex=date=>date.getUTCFullYear()*12+date.getUTCMonth();
  function moonImage(date,large=false){
    const year=date.getUTCFullYear();
    const series={2025:'a005400/a005415',2026:'a005500/a005587'}[year];
    if(!series)return large?'<span>この年の月面画像は未掲載です。</span>':'';
    const hour=1+(date-Date.UTC(year,0,1))/3600000;
    const frame=String(hour).padStart(4,'0');
    const resolution=large?'730x730':'216x216';
    const src=`https://svs.gsfc.nasa.gov/vis/a000000/${series}/frames/${resolution}_1x1_30p/moon.${frame}.jpg`;
    return `<img src="${src}" width="216" height="216" decoding="async" alt="${large?'選択日の月面（北を上に表示）':''}">`;
  }
  function select(date){
    selected=date;
    const key=iso(date),{age,label}=moonPhase(+date);
    grid.querySelectorAll('[data-date]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.date===key)));
    if(body!=='Moon'){
      const view=planetViews[body],heading=`${date.getUTCMonth()+1}月${date.getUTCDate()}日　${view.label}`;
      if(!astro){detail.innerHTML=`<h2>${heading}</h2><p>天体データを読み込み中…</p>`;return}
      const illumination=astro.Illumination(body,date);
      const {best,windows}=planetObservation(astro,body,date);
      const diameter=view.diameter/(illumination.geo_dist*149597870.7)*206264.8;
      const directions=['北','北東','東','南東','南','南西','西','北西'];
      const position=best?`${timeFormat.format(best.time)}ごろ　${directions[Math.round(best.azimuth/45)%8]}<span class="planet-reading">方位角 ${Math.round(best.azimuth)%360}°　高度 ${Math.round(best.altitude)}°</span>`:'—';
      detail.innerHTML=`<div class="planet-detail">${planetPhoto(astro,body,date,true)}<div><h2>${heading}</h2></div></div><div class="sky-times planet-facts"><div><small>照らされている割合</small><b>${(100*illumination.phase_fraction).toFixed(1)}%</b></div><div><small>明るさ</small><b>${illumination.mag.toFixed(1)}等</b></div><div><small>見かけの直径</small><b>${diameter.toFixed(1)}秒角</b></div></div><div class="sky-times"><div><small>観測しやすい時間帯</small><b>${windows||'目安を満たす時間帯なし'}</b></div><div><small>時間帯内で最も高い頃</small><b>${position}</b></div></div>`;
      return;
    }
    detail.innerHTML=`<div class="planet-detail">${moonImage(date,true)}<div><h2>${date.getUTCMonth()+1}月${date.getUTCDate()}日</h2><p>${label}　月齢 約 ${age.toFixed(1)}日</p></div></div><div class="sky-times">時刻を取得中…</div>`;
    loadSkyTimes(detail.querySelector('.sky-times'),key);
  }
  function showMonth(date){
    const y=date.getUTCFullYear(),m=date.getUTCMonth(),delta=monthIndex(date)-monthIndex(current);
    panel.querySelector('#planetMonth').textContent=`${y}年${m+1}月`;
    panel.querySelector('[data-month="-1"]').disabled=delta<=-11;
    panel.querySelector('[data-month="1"]').disabled=delta>=11;
    const weekdays=[...'日月火水木金土'].map(name=>`<span class="planet-weekday">${name}</span>`).join('');
    const blanks='<span aria-hidden="true"></span>'.repeat(asDate(y,m,1).getUTCDay());
    const days=Array.from({length:asDate(y,m+1,0).getUTCDate()},(_,i)=>{
      const date=asDate(y,m,i+1),key=iso(date),{label}=moonPhase(+date);
      return `<button type="button" class="planet-day" data-date="${key}" aria-label="${m+1}月${i+1}日、${body==='Moon'?label:planetViews[body].label}" ${key===today?'aria-current="date"':''}>${i+1}${body==='Moon'?moonImage(date):astro?planetPhoto(astro,body,date):''}</button>`;
    }).join('');
    grid.innerHTML=weekdays+blanks+days;
    select(date);
  }
  panel.addEventListener('click',event=>{
    const button=event.target.closest('button');
    if(button?.dataset.date)select(new Date(button.dataset.date+'T03:00:00Z'));
    if(button?.dataset.month==='today')showMonth(current);
    else if(button?.dataset.month)showMonth(asDate(selected.getUTCFullYear(),selected.getUTCMonth()+Number(button.dataset.month),1));
  });
  panel.querySelector('#planetBody').addEventListener('change',async event=>{
    const next=event.target.value;
    body=next;
    const view=planetViews[body];
    credit.innerHTML=view?`照明率　等級　視直径は正午の計算値です。観測時間帯は太陽高度−6°以下　天体高度10°以上を10分刻みで計算しています。地形や天候は含みません。${body==='Uranus'||body==='Neptune'?' 観測には双眼鏡や望遠鏡が必要です。':''}<br><a href="${view.source}">画像 ${view.credit}</a>（過去の観測画像${body==='Venus'?'にその日の照明率を反映':''}）`:moonCredit;
    showMonth(selected);
    if(!view||astro)return;
    try{
      astro=await loadCalendarAstronomy();
      if(body===next)showMonth(selected);
    }catch{
      if(body===next)detail.innerHTML='<p>天体データを読み込めませんでした。天体を選び直すと再試行できます。</p>';
    }
  });
  showMonth(current);
}
const siteLinks=[['/','home','ホーム'],['/chat','chat','チャット','chat'],['/calendar','calendar','部活行事カレンダー','calendar'],['/planet-calendar','moon','惑星カレンダー'],['/members','members','部員統計','members'],['/procedures','procedures','手続き・書類','procedures'],['/space-quiz','star','天文宇宙検定クイズ','quiz'],['/records','calendar','実績・記録','records'],['/inventory','procedures','物品管理','inventory'],['/photos','photos','写真','photos'],['/external-services','link','外部リンク'],['/guide','about','利用ガイド'],['/ikenbako','feedback','意見箱','feedback'],['/admin','admin','運営']];
const adminPages=Object.fromEntries([
  ...siteLinks.filter(link=>link[3]).map(([, , label,key])=>[key,label]),
  ['meeting','観測会'],['announcement','運営からのお知らせ'],['events','イベント'],['about','サイトの説明']
]);
function field(name,label,type='text',attrs=''){
  return `<div class="field"><label for="${name}">${label}</label><input id="${name}" name="${name}" type="${type}" ${attrs}></div>`;
}
async function api(path,method='GET',body){
  const response=await pagesFetch('https://tenmonken-infoweb-2026.rt-earth616.chatgpt.site/api/'+path,{method,headers:body===undefined?undefined:{'content-type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});
  const result=await response.json();
  if(!response.ok)throw Error(result.error||'操作できませんでした。');
  return result;
}
function bindSave(id,status,save){
  const form=document.getElementById(id),output=document.getElementById(status);
  form.onsubmit=async event=>{
    event.preventDefault();
    const submit=form.querySelector('button[type=submit]');
    submit.disabled=true;
    try{await save(form);output.textContent='保存しました。'}
    catch(error){output.textContent=error.message}
    finally{submit.disabled=false}
  };
}
function openEditor(title,fields,values,save){
  const dialog=document.getElementById('editor');
  document.getElementById('editorContent').innerHTML=`<h2 id="editorTitle">${title}</h2><form id="editorForm">${fields}
    <div class="feature-links"><button type="submit" class="primary">保存</button><button type="button" class="secondary" id="cancelEditor">キャンセル</button></div>
    <p id="editorStatus" role="status"></p></form>`;
  const form=document.getElementById('editorForm');
  for(const input of form.elements){
    if(!Object.hasOwn(values,input.name))continue;
    if(input.type==='checkbox')input.checked=Boolean(values[input.name]);
    else input.value=values[input.name]??'';
  }
  document.getElementById('cancelEditor').onclick=()=>dialog.close();
  bindSave('editorForm','editorStatus',async form=>{
    await save(form);
    dialog.close();
  });
  dialog.showModal();
}
function openEventEditor(event){
  const key='hercules-event-draft-'+(event?.id??'new');
  let draft={};
  try{draft=JSON.parse(sessionStorage.getItem(key)||'{}')}catch{}
  const values={...(event??{showCountdown:true}),...draft};
  const fields=document.getElementById('eventFields').content.cloneNode(true);
  for(const input of fields.querySelectorAll('[id]')){
    const label=fields.querySelector('label[for="'+input.id+'"]');
    if(label)label.htmlFor='edit-'+input.id;
    input.id='edit-'+input.id;
  }
  const iconSelect=fields.querySelector('select');
  if(values.icon&&!Array.from(iconSelect.options).some(option=>option.value===values.icon))
    iconSelect.add(new Option('現在のアイコン',values.icon));
  const container=document.createElement('div');
  container.append(fields);
  const read=form=>{
    const body=Object.fromEntries(new FormData(form));
    body.pinned=form.elements.pinned.checked;
    body.showCountdown=form.elements.showCountdown.checked;
    return body;
  };
  openEditor(event?'イベントを編集':'イベントを追加',container.innerHTML,values,async form=>{
    await api(event?'countdowns/'+event.id:'countdowns',event?'PUT':'POST',read(form));
    try{sessionStorage.removeItem(key)}catch{}
    await loadCountdowns();
    drawCountdownAdmin();
    document.getElementById('saved').textContent=event?'変更を保存しました。':'イベントを追加しました。';
  });
  const form=document.getElementById('editorForm');
  const saveDraft=()=>{try{sessionStorage.setItem(key,JSON.stringify(read(form)))}catch{}};
  form.addEventListener('input',saveDraft);
  form.addEventListener('change',saveDraft);
}
function editEvent(id){
  const event=countdowns.find(item=>item.id===id);
  if(event)openEventEditor(event);
}
let adminProcedures=[];
function procedureKindField(){
  return '<div class="field"><label for="procedureKind">掲載先</label><select name="kind" id="procedureKind"><option value="form">手続き</option><option value="document">書類</option></select></div>';
}
function editProcedure(id){
  const procedure=adminProcedures.find(item=>item.id===id);
  if(!procedure)return;
  openEditor('掲載内容を編集',`${id===0?'':procedureKindField()}${field('editTitle','名称','text','required maxlength="80"')}${field('editUrl','リンク先URL','url','required')}
    <div class="field"><label for="editDescription">説明</label><textarea id="editDescription" name="editDescription" maxlength="500"></textarea></div>`,
    {kind:procedure.kind||'form',editTitle:procedure.title,editUrl:procedure.url,editDescription:procedure.description},async form=>{
      const fields=new FormData(form);
      await api('procedures/'+id,'PUT',{kind:fields.get('kind')??undefined,title:fields.get('editTitle'),url:fields.get('editUrl'),description:fields.get('editDescription')});
      await loadProcedureAdmin();
      document.getElementById('procedureStatus').textContent='変更を保存しました。';
    });
}
function admin(page){
  const title=adminPages[page]||'運営';
  const panels={
    records:recordsAdminPanel,
    inventory:()=>inventoryPanel(true),
    photos:()=>photoGallery(true),
    calendar:()=>`<section class="ops-card"><h2>掲載ファイル</h2><div id="calendarCurrent"></div>
      <form id="calendarUpload"><div class="field"><label for="calendarFile">カレンダーファイル</label><input id="calendarFile" type="file" accept="application/pdf,image/png,image/jpeg" required></div>
      <p class="hint">PDF　PNG　JPEG、最大5 MB。登録したファイルはサイトの閲覧者が見られます。</p>
      <div class="feature-links"><button type="submit" class="primary">登録　差し替え</button><button type="button" class="secondary" id="calendarRemove" hidden>掲載を取り下げる</button></div>
      <p id="calendarStatus" role="status"></p></form></section>`,

    meeting:()=>`<section class="ops-card"><h2>観測会の管理</h2><p class="hint">日付を空欄にすると毎週金曜日を自動表示します。</p><p><strong data-meeting-date>${meetingDisplay()}</strong></p>
      <form id="meetingForm"><div class="field"><label for="meetingStatusInput">開催状況</label><select id="meetingStatusInput"><option value="pending">未定</option><option value="scheduled">開催予定</option><option value="cancelled">中止</option></select></div>${field('meetingDateInput','観測会の日付（任意）','date')}<div class="field"><label for="locationInput">場所</label><input id="locationInput" maxlength="200"></div><div class="field"><label for="meetingInput">特記事項</label><textarea id="meetingInput" maxlength="2000"></textarea></div><button class="primary" id="save" disabled>観測会の設定を保存</button><p id="meetingStatus" class="ops-status hint" role="status"></p></form></section>
      `,
    announcement:()=>`<section class="ops-card">
      <form id="announcementForm">
        <div class="field"><label for="announcementInput">お知らせ本文</label><textarea id="announcementInput" maxlength="2000" disabled></textarea></div>
        <p class="hint">空欄で保存すると、お知らせを取り下げます。</p>
        <button class="primary" type="submit" disabled>お知らせを保存</button>
        <p id="announcementStatus" role="status"></p>
      </form>
    </section>`,
    chat:()=>`<section class="ops-card"><h2>投稿受付</h2><p><label><input type="checkbox" id="pauseChat" disabled> チャット投稿を一時停止する</label></p><p id="chatState" role="status"></p></section>
      <section class="ops-card"><div class="ops-toolbar"><h2>最近の投稿</h2><button class="secondary" id="refreshChat">更新</button></div><div id="chatRows"></div><p id="chatAction" role="status"></p></section>`,
    feedback:()=>`<section class="ops-card"><h2>投稿一覧</h2><div id="feedbackRows"></div></section>`,
    events:()=>`<section class="ops-card"><div class="ops-toolbar"><h2>登録済みイベント</h2><button id="addEvent" class="primary" type="button">イベントを追加</button></div><div id="countRows"></div></section><p id="saved" role="status"></p><template id="eventFields">
      <div class="count-form">${field('title','イベント名','text','required maxlength="40"')}${field('eventUrl','イベントのURL','url')}${field('deadline','公開期限（空欄なら開催日）','date')}${field('location','開催場所','text','maxlength="200"')}
      ${field('date','開催日','date','required')}${field('time','開始時刻（日本時間）','time')}${field('organizer','主催者サイトの表示タイトル／主催名','text','maxlength="200"')}${field('organizerUrl','主催者サイトのURL','url')}${field('mapTitle','地図の表示タイトル','text','maxlength="200"')}${field('mapUrl','地図のURL','url','placeholder="https://…"')}
      <div class="field"><label for="icon">アイコン</label><select id="icon" name="icon"><option value="calendar">カレンダー</option><option value="star">星</option><option value="meeting">望遠鏡</option><option value="moon">月</option></select></div></div>
      ${[['supplies','持ち物'],['precautions','注意事項'],['memo','メモ（公開）']].map(([name,label])=>`<div class="field"><label for="${name}">${label}</label><textarea id="${name}" name="${name}" maxlength="1000"></textarea></div>`).join('')}
      <p><label><input name="showCountdown" type="checkbox" checked> カウントダウンを表示</label></p><p><label><input name="pinned" type="checkbox"> ヘッダーに固定</label></p>
      </template>`,
    quiz:()=>`<section class="ops-card"><h2>問題シート</h2><div id="quizSources"></div><form id="quizSheetForm">
      ${field('name','シートの表示名','text','maxlength="80"')}
      ${field('sheetUrl','Google スプレッドシートのURL','url','required maxlength="2048" autocomplete="off"')}
      <p class="hint">リンクで閲覧できる問題専用シートの対象タブを指定してください。1行目は次の列順にします。</p>
      <p>級　章　出題年　問題　選択肢１　選択肢２　選択肢３　選択肢４　正解　解説</p>
      <p class="hint">1行に1問。級と章は番号、正解は1〜4を入力します。出題年と解説は空欄でも構いません。</p>
      <button class="primary" type="submit">確認して連携</button></form><p id="quizSheetStatus" role="status"></p></section>`,
    procedures:()=>`<section class="ops-card"><h2>追加</h2><form id="procedureForm">${procedureKindField()}${field('title','名称','text','required maxlength="80"')}${field('url','リンク先URL','url','required placeholder="https://…"')}
      <div class="field"><label for="description">説明</label><textarea id="description" name="description" maxlength="500"></textarea></div>
      <button class="primary" type="submit">追加</button></form></section><section class="ops-card"><h2>登録済みの手続き</h2><div id="procedureRows"></div></section><p id="procedureStatus" role="status"></p>`,
    about:()=>`<section class="ops-card"><form id="aboutForm"><div class="field"><label for="siteDescription">ヘラクレスについて</label><textarea id="siteDescription" rows="8" maxlength="3000"></textarea></div><button type="submit" class="primary" disabled>保存</button><p id="aboutStatus" role="status"></p></form></section>`,
    members:()=>`<section class="ops-card"><h2>メンテナンス</h2><form id="memberMaintenanceForm">
      <p><label><input id="membersMaintenance" type="checkbox" disabled> メンテナンスモードを有効にする</label></p>
      <p class="hint">有効にすると公開ページにはメンテナンスの案内を表示します。</p>
      <button type="submit" class="primary" disabled>保存</button><p id="maintenanceStatus" role="status"></p></form></section>
      <section class="ops-card"><h2>スプレッドシート連携</h2><form id="sheetForm">${field('sheetUrl','Google スプレッドシートのURL','url','autocomplete="off" maxlength="2048" placeholder="https://docs.google.com/spreadsheets/…"')}
      <p class="hint">リンクで閲覧できる集計用シートの対象タブを指定してください。「部員統計」の集計表、または「区分」「項目」「人数」「学部」形式に対応しています。</p>
      <p class="hint">登録済みのURLは表示されません。集計元を変更する場合は、新しいURLを入力してください。</p>
      <button type="submit" class="primary" disabled>リンクを保存</button> <button type="button" class="secondary" id="removeSheet" disabled>連携を解除</button><p id="sheetStatus" role="status"></p></form></section><section class="ops-card"><h2>学部　学科別の人数</h2><form id="memberForm"><div class="field"><label for="departments">学部、学科、人数（1行に1学科）</label>
      <textarea id="departments" required rows="6" placeholder="工学部,応用化学科,人数"></textarea></div>
      <div class="field"><label for="gender">男女別の人数（1行に1区分）</label><textarea id="gender" required rows="4" placeholder="男性,人数&#10;女性,人数"></textarea></div>
      <p class="hint">総部員数は学科別の人数から集計します。男女別の合計も同じ人数にしてください。</p>
      <button type="submit" class="primary">人数を保存</button> <button type="button" class="secondary" id="resetMembers">手入力を解除</button>
      <p id="memberStatus" role="status"></p></form></section>`
  };
  document.title=title+' | ヘラクレス';
  document.getElementById('app').innerHTML=`<main class="admin">${siteHeader({adminBack:Boolean(page)})}
    <form id="login" class="ops-card"><h1 class="${page==='inventory'?'inventory-heading':''}">${title}</h1><div class="field"><label for="phrase">幹部用の合言葉</label><input id="phrase" type="password" required></div><button class="primary">開く</button> <progress aria-label="運営認証の進行状況" hidden></progress><p id="err" role="status"></p></form>
    <div id="panel" class="ops-panel" hidden><div class="ops-toolbar"><h1 class="${page==='inventory'?'inventory-heading':''}">${title}</h1><button id="adminLogout" type="button" class="secondary">ログアウト</button></div><p class="hint" id="adminOpenTime" role="status" hidden></p>${page?panels[page]():`<nav class="ops-nav">${Object.entries(adminPages).map(([key,label])=>`<a class="ops-card" href="/HERCULES/admin/${key}"><h2>${label} →</h2></a>`).join('')}</nav>`}</div></main>`;
  const login=document.getElementById('login');
  login.hidden=true;
  function open(elapsed){
    login.reset();
    if(elapsed!==undefined){
      const result=document.getElementById('adminOpenTime');
      result.hidden=false;
      result.textContent=elapsed+' 秒で開きました。';
    }
    login.hidden=true;
    document.getElementById('panel').hidden=false;
    const back=document.getElementById('adminBack');
    if(back)back.hidden=false;
    initAdmin(page);
  }
  document.getElementById('adminLogout').onclick=async()=>{
    try{await api('admin/session','DELETE');setAdminToken('');location.reload()}
    catch(error){alert(error.message)}
  };
  const token=currentAdminToken();
  if(!token){bindPagesLogin(login,open);return;}
  if(token===verifiedAdminToken){open();return;}
  const status=login.querySelector('#err');
  const button=login.querySelector('button');
  login.hidden=false;
  status.textContent='認証確認中…';
  button.disabled=true;
  const checkSession=async()=>{
    try{
      const response=await pagesFetch(sitesOrigin+'/api/admin/session',{cache:'no-store'});
      if(!login.isConnected)return;
      if(response.ok){verifiedAdminToken=token;open();return;}
      if(response.status===401){
        setAdminToken('');
        status.textContent='';
        button.textContent='開く';
        login.querySelector('input').required=true;
        bindPagesLogin(login,open);
        return;
      }
      throw Error('認証状態を確認できませんでした。');
    }catch(error){
      if(!login.isConnected)return;
      status.textContent=error.message;
      button.textContent='再試行';
      login.querySelector('input').required=false;
      login.onsubmit=event=>{event.preventDefault();button.disabled=true;void checkSession();};
    }finally{
      button.disabled=false;
    }
  };
  void checkSession();
}
function initAdmin(page){
  if(page==='announcement'){
    const form=document.getElementById('announcementForm');
    const input=document.getElementById('announcementInput');
    const button=form.querySelector('button');
    const status=document.getElementById('announcementStatus');
    status.textContent='お知らせを読み込み中…';
    void loadSettings().then(ok=>{
      if(!form.isConnected)return;
      if(!ok){status.textContent='お知らせを取得できませんでした。ページを再読み込みしてください。';return;}
      input.value=data.announcement||'';
      input.disabled=button.disabled=false;
      status.textContent='';
    });
    bindSave('announcementForm','announcementStatus',async()=>{
      const announcement=input.value;
      await api('settings','PUT',{announcement});
      data={...data,announcement};
      updateAnnouncementBadge();
    });
  }
  if(page==='records')initRecordsAdmin();
  if(page==='calendar')initCalendarAdmin();
  if(page==='inventory')initInventory(true);
  if(page==='photos')initPhotoGallery(true);
  if(page==='chat'){
    document.getElementById('pauseChat').onchange=toggleChatPause;
    document.getElementById('refreshChat').onclick=loadChatAdmin;
    loadChatStatus();
    loadChatAdmin();
  }
  if(page==='feedback')loadModeration();
  if(page==='meeting'){
    loadSettings().then(ok=>{
      if(ok){fill();document.getElementById('save').disabled=false}
      else document.getElementById('meetingStatus').textContent='設定を読み込めませんでした。';
    });
      document.getElementById('meetingForm').onsubmit=async event=>{
    event.preventDefault();
    const button=document.getElementById('save');
    const status=document.getElementById('meetingStatus');
    button.disabled=true;
    try{
      const body=Object.fromEntries([['meetingStatus','meetingStatusInput'],['meetingDate','meetingDateInput'],['location','locationInput'],['meeting','meetingInput']].map(([key,id])=>[key,document.getElementById(id).value]));
      const response=await pagesFetch('https://tenmonken-infoweb-2026.rt-earth616.chatgpt.site/api/settings',{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
      if(!response.ok)throw Error();
      data={...data,...body};
      document.querySelectorAll('[data-meeting-date]').forEach(node=>{node.textContent=meetingDisplay()});
      status.textContent='保存しました。';
    }catch{status.textContent='保存できませんでした。'}
    finally{button.disabled=false}
  };

  }
  if(page==='events'){
    loadCountdowns().then(drawCountdownAdmin);
    document.getElementById('addEvent').onclick=()=>openEventEditor();
  }
  if(page==='quiz'){
    const status=document.getElementById('quizSheetStatus');
    const list=document.getElementById('quizSources');
    const refresh=async()=>{
      const {sources}=await api('admin/quiz','POST');
      list.innerHTML=sources.map(source=>`<p class="ops-toolbar"><span>${esc(source.name)}</span><button type="button" class="secondary" data-remove-quiz="${source.id}">連携を解除</button></p>`).join('')||'<p class="hint">登録済みのシートはありません。</p>';
    };
    refresh().catch(error=>{status.textContent=error.message});
    list.onclick=async event=>{
      const button=event.target.closest('[data-remove-quiz]');
      if(!button||!confirm('このシートの連携を解除しますか？'))return;
      button.disabled=true;
      try{await api('admin/quiz','DELETE',{id:Number(button.dataset.removeQuiz)});await refresh();status.textContent='連携を解除しました。'}
      catch(error){status.textContent=error.message;button.disabled=false}
    };
    bindSave('quizSheetForm','quizSheetStatus',async form=>{
      await api('admin/quiz','PUT',Object.fromEntries(new FormData(form)));
      form.reset();
      await refresh();
    });
  }
  if(page==='procedures'){
    loadProcedureAdmin();
    bindSave('procedureForm','procedureStatus',async form=>{
      await api('procedures','POST',Object.fromEntries(new FormData(form)));
      form.reset();
      await loadProcedureAdmin();
    });
  }
  if(page==='about'){
    const form=document.getElementById('aboutForm');
    api('admin/config','POST').then(config=>{
      document.getElementById('siteDescription').value=config.description??defaultDescription;
      form.querySelector('button').disabled=false;
    }).catch(error=>{document.getElementById('aboutStatus').textContent=error.message});
    bindSave('aboutForm','aboutStatus',()=>api('admin/config','PUT',{description:document.getElementById('siteDescription').value}));
  }
  if(page==='members'){
    const sheetForm=document.getElementById('sheetForm');
    const maintenanceForm=document.getElementById('memberMaintenanceForm');
    const maintenance=document.getElementById('membersMaintenance');
    bindSave('memberMaintenanceForm','maintenanceStatus',async()=>{
      const enabled=maintenance.checked;
      maintenance.disabled=true;
      try{await api('admin/config','PUT',{membersMaintenance:enabled})}
      finally{maintenance.disabled=false}
    });
    const sheetUrl=document.getElementById('sheetUrl');
    const removeSheet=document.getElementById('removeSheet');
    const sheetStatus=document.getElementById('sheetStatus');
    api('admin/config','POST').then(config=>{
      maintenance.checked=Boolean(config.membersMaintenance);
      maintenance.disabled=false;
      maintenanceForm.querySelector('button').disabled=false;
      removeSheet.disabled=!config.sheetConfigured;
      sheetStatus.textContent=config.sheetConfigured?'リンク登録済み':'リンク未登録';
      sheetForm.querySelector('button').disabled=false;
    }).catch(error=>{
      document.getElementById('sheetStatus').textContent=error.message;
      document.getElementById('maintenanceStatus').textContent=error.message;
    });
    bindSave('sheetForm','sheetStatus',async()=>{
      if(!sheetUrl.value.trim())throw Error('スプレッドシートのURLを入力してください。');
      await api('admin/config','PUT',{sheetUrl:sheetUrl.value});
      sheetUrl.value='';
      removeSheet.disabled=false;
      await loadMemberAdmin();
    });
    removeSheet.addEventListener('click',async()=>{
      if(!confirm('登録済みのスプレッドシート連携を解除しますか？'))return;
      removeSheet.disabled=true;
      try{
        await api('admin/config','PUT',{sheetUrl:''});
        sheetUrl.value='';
        sheetStatus.textContent='リンクの登録を解除しました。';
        await loadMemberAdmin();
      }catch(error){
        removeSheet.disabled=false;
        sheetStatus.textContent=error.message;
      }
    });
    loadMemberAdmin();
    bindSave('memberForm','memberStatus',async()=>{
      const lines=id=>document.getElementById(id).value.split(/\r?\n/).filter(row=>row.trim()).map(row=>row.split(/[,，]/).map(value=>value.trim()));
      const number=value=>/^\d+$/.test(value)?Number(value):null;
      const departments=lines('departments').map(row=>({faculty:row.length===3?row[0]:'',name:row[1],count:number(row[2])}));
      const gender=lines('gender').map(row=>({name:row[0],count:row.length===2?number(row[1]):null}));
      await api('members','PUT',{departments,gender});
    });
    document.getElementById('resetMembers').onclick=async()=>{
      if(!confirm('手入力を解除しますか？ 集計シートが設定されている場合は、その内容を表示します。'))return;
      try{await api('members','PUT',null);await loadMemberAdmin()}
      catch(error){document.getElementById('memberStatus').textContent=error.message}
    };
  }
}
async function loadMemberAdmin(){
  try{
    const result=await api('members');
    document.getElementById('departments').value=(result.departments||[]).map(row=>[row.faculty||(facultyFor(row)==='学部未分類'?'':facultyFor(row)),row.name,row.count].join(',')).join('\n');
    document.getElementById('gender').value=(result.gender||[]).map(row=>[row.name,row.count].join(',')).join('\n');
    document.getElementById('memberStatus').textContent='';
  }catch(error){document.getElementById('memberStatus').textContent=error.message}
}
function recordActions(edit,remove,id){
  return `<div class="record-actions"><button class="secondary" data-action="${edit}" data-record="${id}">編集</button><button class="secondary" data-action="${remove}" data-record="${id}">削除</button></div>`;
}
async function loadProcedureAdmin(){
  const node=document.getElementById('procedureRows');
  try{
    const {items}=await api('procedures');
    adminProcedures=items;
    node.innerHTML=items.map(item=>`<article class="ops-post"><div class="ops-toolbar"><b>${item.kind==='document'?'書類':'手続き'}　${esc(item.title)}</b>${recordActions('editProcedure','deleteProcedure',item.id)}</div><p>${esc(item.description)}</p></article>`).join('')||'<p class="hint">登録済みの手続きはありません。</p>';
  }catch(error){node.textContent=error.message}
}
async function deleteProcedure(id){
  if(!confirm('この掲載項目を削除しますか？'))return;
  const output=document.getElementById('procedureStatus');
  try{await api('procedures/'+id,'DELETE');await loadProcedureAdmin();output.textContent='削除しました。'}
  catch(error){output.textContent=error.message}
}
async function loadCountdowns(){try{let r=await pagesFetch('https://tenmonken-infoweb-2026.rt-earth616.chatgpt.site/api/countdowns'+(document.getElementById('countRows')?'?scope=admin':''));if(r.ok)countdowns=await r.json()}catch{}}function drawCountdownAdmin(){let box=document.getElementById('countRows');if(!box)return;box.innerHTML=countdowns.length?countdowns.map(c=>`<article class="ops-post"><div class="ops-toolbar"><b>${lineIcon(countdownIcon(c.icon))} ${esc(c.title)}${eventExpired(c)?'　<span class="hint">期限切れ</span>':''}</b>${recordActions('editEvent','deleteCountdown',c.id)}</div><p class="hint">${eventDate(c)} ${esc(c.location)} ${esc(c.organizer)}</p><label class="hint"><input type="checkbox" ${c.pinned?'checked':''} data-pin-event="${c.id}"> ヘッダー固定</label></article>`).join(''):'<p class="hint">登録済みのイベントはありません。</p>'}async function pinCountdown(id,pinned){let r=await pagesFetch('https://tenmonken-infoweb-2026.rt-earth616.chatgpt.site/api/countdowns/'+id,{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify({pinned})});if(r.ok){await loadCountdowns();drawCountdownAdmin();document.getElementById('saved').textContent='ヘッダー表示を更新しました。'}}async function deleteCountdown(id){if(!confirm('このイベントを削除しますか？'))return;let r=await pagesFetch('https://tenmonken-infoweb-2026.rt-earth616.chatgpt.site/api/countdowns/'+id,{method:'DELETE'});if(r.ok){await loadCountdowns();drawCountdownAdmin();document.getElementById('saved').textContent='削除しました。'}}async function loadChatStatus(){
  const input=document.getElementById('pauseChat');
  const status=document.getElementById('chatState');
  try{
    const response=await pagesFetch('https://tenmonken-infoweb-2026.rt-earth616.chatgpt.site/api/chat-status',{cache:'no-store'});
    if(!response.ok)throw Error();
    input.checked=(await response.json()).paused;
    input.disabled=false;
    status.textContent=input.checked?'投稿停止中':'投稿受付中';
  }catch{status.textContent='投稿受付の状態を取得できませんでした。'}
}
async function toggleChatPause(){
  const input=document.getElementById('pauseChat');
  const status=document.getElementById('chatState');
  input.disabled=true;
  try{
    const response=await pagesFetch('https://tenmonken-infoweb-2026.rt-earth616.chatgpt.site/api/chat-status',{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify({paused:input.checked})});
    if(!response.ok)throw Error();
    status.textContent=input.checked?'投稿停止中':'投稿受付中';
  }catch{input.checked=!input.checked;status.textContent='投稿受付の状態を変更できませんでした。'}
  finally{input.disabled=false}
}
async function loadChatAdmin(){
  const rows=document.getElementById('chatRows');
  const refresh=document.getElementById('refreshChat');
  refresh.disabled=true;
  try{
    const response=await pagesFetch('https://tenmonken-infoweb-2026.rt-earth616.chatgpt.site/api/chat',{cache:'no-store'});
    if(!response.ok)throw Error();
    const items=await response.json();
    rows.innerHTML=items.length?items.reverse().map(item=>`<article class="ops-post"><div class="ops-toolbar"><time class="hint">${displayTimestamp(item.created_at)}</time><button class="secondary" data-action="deleteChat" data-record="${item.id}">削除</button></div><p><b>${esc(item.nickname||"名前なし")}</b></p><p>${esc(item.message)}</p></article>`).join(''):'<p class="hint">チャット投稿はありません。</p>';
  }catch{rows.textContent='チャット投稿を取得できませんでした。'}
  finally{refresh.disabled=false}
}
let feedbackItems=[];function viewFeedback(id){let x=feedbackItems.find(v=>v.id===id);if(!x)return;document.getElementById('modalContent').innerHTML=`<h2 id="modalTitle">${esc(x.category)}の意見</h2><div class="detail-box" style="white-space:pre-wrap">${esc(x.message)}</div><p class="hint">受信：${displayTimestamp(x.created_at)}</p>`;document.getElementById('modal').classList.add('show')}async function loadModeration(){
  const rows=document.getElementById('feedbackRows');
  try{
    const response=await pagesFetch('https://tenmonken-infoweb-2026.rt-earth616.chatgpt.site/api/feedback');
    if(!response.ok)throw Error();
    feedbackItems=await response.json();
    rows.innerHTML=feedbackItems.length?feedbackItems.map(item=>`<article class="ops-post"><div class="ops-toolbar"><b>${esc(item.category)}</b><time class="hint">${displayTimestamp(item.created_at)}</time></div><p>${esc(item.message)}</p><div class="ops-toolbar"><button class="secondary" data-action="viewFeedback" data-record="${item.id}">詳細</button><button class="secondary" data-action="deleteFeedback" data-record="${item.id}">削除</button></div></article>`).join(''):'<p class="hint">意見箱への投稿はありません。</p>';
  }catch{rows.textContent='意見箱の投稿を取得できませんでした。'}
}
async function deleteFeedback(id){
  if(!confirm('この意見を削除しますか？'))return;
  try{
    const response=await pagesFetch('https://tenmonken-infoweb-2026.rt-earth616.chatgpt.site/api/feedback/'+id,{method:'DELETE'});
    if(!response.ok)throw Error();
    loadModeration();
  }catch{alert('削除できませんでした。')}
}
async function deleteChat(id,button){
  if(!confirm('このチャット投稿を削除しますか？'))return;
  button.disabled=true;
  const status=document.getElementById('chatAction');
  try{
    const response=await pagesFetch('https://tenmonken-infoweb-2026.rt-earth616.chatgpt.site/api/chat/'+id,{method:'DELETE'});
    if(!response.ok)throw Error();
    status.textContent='投稿を削除しました。';
    await loadChatAdmin();
  }catch{status.textContent='投稿を削除できませんでした。';button.disabled=false}
}
function fill(){
  document.getElementById('meetingStatusInput').value=meetingStatus()||'pending';
  for(const [id,key] of [['meetingDateInput','meetingDate'],['locationInput','location'],['meetingInput','meeting']]){
    document.getElementById(id).value=data[key]||'';
  }
}
let brandCatActivated=false;
document.addEventListener('click',event=>{
  const trigger=event.target.closest('.brand-cat-trigger');
  if(!trigger||brandCatActivated)return;
  brandCatActivated=true;
  trigger.disabled=true;
  const wrap=trigger.parentElement, header=wrap.closest('header');
  const image=wrap.querySelector('img');
  trigger.style.backgroundImage=`url("${image.src}")`;
  trigger.style.backgroundSize='740.741% 100%';
  trigger.style.backgroundPosition='46.24% 0';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!reduced){
    image.style.clipPath='polygon(0 0,40% 0,40% 100%,53.5% 100%,53.5% 0,100% 0,100% 100%,0 100%)';
    trigger.animate([{transform:'translateY(0)'},{transform:'translateY(-5px)'},{transform:'translateY(0)'}],450).finished.then(()=>{
      image.style.clipPath='';
      trigger.style.backgroundImage='';
    });
  }else trigger.style.backgroundImage='';
  const cat=document.createElementNS('http://www.w3.org/2000/svg','svg');
  cat.setAttribute('viewBox','0 0 40 30');
  cat.setAttribute('aria-hidden','true');
  cat.classList.add('brand-cat');
  const end=Math.min(wrap.offsetWidth+3,header.clientWidth-wrap.offsetLeft-30);
  cat.style.left=end+'px';
  cat.style.top='calc(50% - 10px)';
  wrap.append(cat);
  const legs=[11,26,15,30].map((x,index)=>`<g class="leg" opacity="${index<2?.6:1}"><path d="M${x} 17l-1 5"/><path class="paw" d="M${x-1} 22l1 4h2"/></g>`).join('');
  cat.innerHTML=`<g fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">${legs}<path class="cat-tail" d="M9 15Q0 15 3 7"/></g>
    <ellipse class="cat-body" cx="19" cy="16" rx="12" ry="6" fill="currentColor"/>
    <g class="cat-head"><path d="M25 13l1-8 4 3 5-3 1 5c5 4 0 8-5 8z" fill="currentColor"/><path class="cat-eye" d="M30 13q1.4 1.4 3 0" fill="none" stroke="white" stroke-width=".8" stroke-linecap="round" opacity="0"/></g>`;
  const settle=()=>{
    const duration=reduced?0:1400;
    const pose=(element,frames)=>element.animate(frames,{duration,fill:'forwards',easing:'ease-in-out'});
    const body=cat.querySelector('.cat-body');
    const restingBody='translate(1px,5px) scale(.94,1.14)';
    body.style.transformOrigin='19px 16px';
    pose(body,[{transform:'none'},{transform:'translateY(3px) rotate(8deg)',offset:.42},{transform:restingBody}]).finished.then(()=>{
      if(reduced)return;
      body.animate([{transform:restingBody},{transform:'translate(1px,4.65px) scale(.94,1.2)'},{transform:restingBody}],{duration:3100,iterations:Infinity,easing:'ease-in-out'});
    });
    const head=cat.querySelector('.cat-head');
    head.style.transformOrigin='30px 13px';
    pose(head,[{transform:'none'},{transform:'translate(-1px,6px) rotate(12deg)',offset:.44},{transform:'translate(-5px,9px) rotate(22deg)'}]);
    pose(cat.querySelector('.cat-eye'),[{opacity:0},{opacity:0,offset:.48},{opacity:1,offset:.65},{opacity:1}]);
    for(const [index,leg] of [...cat.querySelectorAll('.leg')].entries()){
      leg.classList.remove('leg');
      const front=index%2===1;
      pose(leg,[{transform:'none'},{transform:front?'translate(-2px,4px) skewX(-35deg) scaleY(.55)':'none',offset:.43},{transform:front?'translate(-4px,5px) skewX(-35deg) scaleY(.55)':'translate(2px,5px) skewX(26deg) scaleY(.6)'}]);
      leg.style.transformBox='fill-box';
      leg.style.transformOrigin='top center';
    }
    const tail=cat.querySelector('.cat-tail');
    const curled='M9 20Q6 29 21 26';
    if(reduced){tail.setAttribute('d',curled);return;}
    const curl=document.createElementNS(cat.namespaceURI,'animate');
    for(const [name,value] of Object.entries({attributeName:'d',values:`M9 15Q0 15 3 7;M9 19Q0 24 9 26;${curled}`,keyTimes:'0;0.55;1',dur:'1.4s',fill:'freeze',begin:'indefinite'}))curl.setAttribute(name,value);
    tail.append(curl);
    curl.beginElement();
  };
  if(reduced){settle();return;}
  const edge=header.querySelector('.brand-icon').getBoundingClientRect().right-wrap.getBoundingClientRect().left;
  const start=edge-cat.getBoundingClientRect().width;
  const duration=2400;
  const reveal=cat.getBoundingClientRect().width/(end-start);
  cat.animate([
    {transform:`translateX(${start-end}px)`},
    {transform:'translateX(0)'}
  ],{duration,fill:'backwards'}).finished.then(settle);
  cat.animate([{clipPath:'inset(0 0 0 100%)'},{clipPath:'inset(0)'}],{duration:duration*reveal});
});
function siteHeader({home=false,adminBack=false}={}){
  return `<div class="site-sticky"><header class="top"><button class="brand-icon" type="button" title="ページを更新" aria-label="ページを更新" data-action="reload"><img class="brand-symbol" alt="" src="data:image/webp;base64,UklGRigWAABXRUJQVlA4WAoAAAAQAAAApwAAbQAAQUxQSP8RAAAB8Mb//yol27b91ppgAoZmGNoEAbtFd3ETuzuxFbu7PezedHOzdVO2sLE2WzdbwaAbRGGGbqZn1QPWrJk1LDyeRsQEwP9fpUHhfYMlPz+SCfcL6rSqW/34Pzkux2pN3148ysBKF/N/ahxPYTlLmtuL/bfXVg77mRHuxrJ6Q33BbuqR/c8LOq9WNQToW+SVtP5p4U8rrZ6JmJG+1PT6WZFtqNSsEYBZ2fvabj8nkt43DGUr7MB8l9Jsv58Rj0m3K7H3g3lgXnaZOs37+XCYH2cwJqxSAEPfk1h6G7DYrv2c7ZvHKBoxjzNG9e1JXgjQ81y7rP+CZw0Ei5ufKcYJQh+7IHJ8ML9R8vyHSBkrAXq70KjLXypJ9a32wBiRecs7vCEyj0ctjK4mMVy5xb6Rkfq4oYF3idiOQC/s948Kx0reHervAEz53Q6+zkj7hl9piQAIx55YcrjQuAZpTHwXP8z8fOoz9SoE6L0PlZtST00KdUSAscMGFV6anFYQrQBaBJAhJd8CG42gRQcSsOI330jqWSDQd31FpM33QcFSwS6jcmsHuWdTB2DIO0dMbRwQl1++klj+sU6SVg/ILUAri8wk7oWCFcOr8vohwJjv6ee/h1zeKKATPlYYz44I5nWfIW2T/8EF+AH91z3T1hxyB2vuJleDeTSsLQQcScnJLcajnRoBdEB+zbPNTgBwUL979LuKzt3PZGuMFY+H24EVhcOSasPoxF4OASnPWz2seBDz5nmpYQH3CZcX6ZZLEJB2lvSuNGkNuidFePaVpd1kYE3BmmrtXUU9JPxm6osXRMzUH/Onx7zvNq8mc6KU62bUqVbYAw96fpvhnft5Yz5JJK9sKgArj6jJmewM9UPTKYLU32vn3MnnTlFFOC9Kpf27Bbc1T6saDeC0b2iTnLstc65K75tONQOrS+/rpwD9wMwnaXhKEwBA3dsOdAC0133sqSenLaWu9hnm5J3+Rn4zd2r5Be+0HD+wfkjRF3cz0kBpyKfqHsDU9Qk+nsvQC2Rupf6Y+EhV12O6PFPUYO2/IhZ61t4WmKm/p6YfA3Ho6AT9aA6zn5BB1Tx4Vdl7tPrAB23u8YCb2HxgsUPFEwmjgMEO5rpcVamJnBbc1TJao74zUDRcu2eMxmT8LUC82PBRwYYiOT+EruN0KTDumFxyYcUn3TiuQvt+IuImygAZWV2SXXpmvhsyuax8GLDYbE8ptaeeIPRJRVdG/D/qJkfG5JErOcpvi0r/RxOAgK352pz4+XxwXV9WGcVjofsnIj92IQAgUT8MRLRCiJoTnLjtEvXgpeGajIvk8+PxktX2IJuXiKfP83dH0bAHprwpfLC+9wf8UmtHAQC4xFE4boq/Px8xA87uwBM0SzOc8+QatNmKj0Z1TDgf6XxDX3k6BAFA5yuxx90RYDEKv+UMtHbHaggiP7dqL2qOljc4jvzNjlvc16Vj1bdGOIDrmu9U+VgBAIBPmmabO7DJu6wdCmYdwv+lHgW3lYHF7bMre3OK/x1T6elwKSBdH5i0+EdnqN9X/UoGrIoflXcwBxBW/V4GIF4+0gLYRe3jEt4R8r/eQgDZ0u/Yo0P6aB7NUuoosIteMM5mElF3Uwjgk/PW3fl/PoDI7Ogm4VcFHKJILu4KAE2j9YXrXNbha6A+coqYwRIMKv+x0J5G7B/+QjsNAMS3DI9fVcUd/PXVmTYePYbIw06Q51EO8c3ODgDegFjsdR9EfF/Tn0b8qKYHW/xZyrpBNDNyKzSHpAAAvTIpAiMIksQLksvr4kuNxjnAoaK/sfMj9pcaL/oBhKqSvWlc4pQt2QL0pK4fTf+q4tkSoA37V0NRBIZhBEWSFIndl3MJtI/DjUT+ahkALMOPIjTuCXlNWIPV+K9ySWhHx9GVqV5g1mna6bPpJgLDKYqidEe8gFubLj64rDUKAI7P6/oBreuX703Za/7ekPg8vySuhEyUmwNA0OZzdv7QvX+2f/1Ye+DqiNo3LnSOb0tC2YPAX+PTH96NzySfSJnUD1YmNJEgwN38M8RSoBfG6AaywnPy9ZGhwHNTSMTO26njiCX96q4IgMs7KPMCzcBOchUL3jMufszOen1+QagAAJq90Y8GSweqL6JchuyjzvDMjdRfEViB5zdo+f6jRz4bjbkJqflqTHmhZ/NF8fgtZ4t6VscIuSwgvW4AmG/5I8PPImHYiUyNUacxUFT1uT6KZhFbE/HiXKNyvw9YHKJM9OayudhTRwbSx5p+ljQ7XqJPPDFrcN9RG+4UGHM2KwB8N36nikajYLnbJ2PMTF9AZM279hvSv7OvBOEU6UN8LjA9Qi1nhkTEGWMj3RGoL2q7twB/3wcBpOtL7PX/UMv4p2vUeMLKPa/za3QGfVXWk60dhBzSpTyvBaOl5GEAQOyc3BztEEDG5RMp26PmjgyVQn20000sP5IP0OSqSbVRYRF4h/U9XUmQVYnPrkbfepOnp4ovdONxxmrqipBRJH6W33TsnltvP72JOTx1ej5JGk2YSV/4cIEfAgDgtLOmeqUIwHljIRY735dnAQAIhn4lXwRLBDyhrOnQE9/Iov9TcITwJjkbGE/FXv+eY8Rqi/ILa0wmHVH68vTWFet//6jDkxc7AgAIJn3X7pMB8Hrd1WJpZ2Z1DVBIGAEEPTUdkwItL3CHkngdxg3eaWXtmC014UT+X/N/aRMY2nPqsc8XussQAEDcRl6vM15tAfXDk7EjIgBwHHu9mMArc9NO2jODNumG6XQAaI8XVFYEJ3Sv/uLGCDlOZG0JFgA96iYB85KxX4l3betB94T/XKC+qG3UySeJ3y46WABTUiLNAXhfxjPCuGCS6bqAkVts9QCwessr2GUBf5g3QNPmCA0AoBK5vwNYKlDwO7Q2B86/45+DOGADdRAYu8dctLceuG6eifolR4It8i6eRMyB6y3qL/uG9yu5hhk4OwKbCALD9GdQW1AkJ8gZQEiaYXaDQ84S8yxg/wiV5AUIewPravsxgbmGr74N7jweaVvusZR6GLCP7CfJnYycHhCrGxocJZfbED9gylUtjqds7errrfCUyxVennK5p6en3MNDLpcrvBQKhcJTofDvd1hJEMr9YY7mYJQ2ya+hTTE+9bKZNmezDBSB4yRRnp2ekpyUlJKamJCYlJQY/zU+ISEhKTU5OTU5OSU1p5YkcIIgKt7M4ZtxfEYsaGjuT4lnYxR82+gY/R2jCIKg8NKCAlVRUVGhUqlUqpQFBUqlUlVYqFIVFqqUKqVSTZEEQeKFj2eYg3nEU4cGBu1eYLrkP5f39RexB/wW8x/pCeLd0g4tAlsFh4QEBwUFBgYFBbYMDApqFdyqVavgkOCgoMDAAQeUJJm1sq0EGAZkVoY1NJDPvftDj6uz720f08YJtYqdZ6tAh3oA4P2VKukC7COHKXwFMEdPUWsaHIC4xci9L1VGCiv9cGHNyHaeYsQMYidvP37n3SRV4bOxfBrkBPVUbgMwTlPc3gIYY3zUitfgAACRBY/eeSe1hqCMZSkPT29bvjAqavm2k/8ml5kIA1H1obaoHQ2M11+Yh7LntTHrhYMlLTKJ7weDkIZHK1T0mHXgXlJhnRHDMBOGE8aq7Be/Rc0sjfcfuU1O1+zjpbdy9oZ/eLwJLOX1PKUk0uc6cAOtnUdQz5GzV27aunnNvOEdfaQINMmPdwPzwn43avuxhhw17PS2CIDf9kip/mYb7rBmS2WsMwOAbeRO1tziNBFgVf6QBCohjMO6VT0SMxqgeenIVlh1qpd1AFrdwVN6ctcM7DTCyDulojtbq6iLPGuB26/G9HCuQo4TS4Ex7xy5kiXRHXw6mBU7WwKyo6a0cf0nz5zQp5nYSk7dF61q1zDc46p7MYMpphgRO83z8gPNiA8+9rUEZL8a9DoMN6nz7s72tIjn0nXD6yocT2rVIAarP7haEPj9RxA700037Oik23VxCovAcd21k9vX7/0nUWuKne/BSDHxbFwFpopZ/R82sSEIL1HbwULRXSySFcGf+EKgH6qhbvpZBggfAQC+54hrVdjbKa5mHGZ9MRnzHq7pPfBQmapTQ+hTVtzJEthAXeKz4Z9e1J4OOYaXY58niC1iKIq4p9e/29DFEQVod12vvjG+qfOM/6qMqZFoA3C6Q/0uoBEuWmxH17Mqw5+NcfpH9nTBuRlDLqvrorvxrQXgOOlhBVb29syqDZn461ESgEHVlOZkCAq2j642pgcDbfOCNDmd83vdUBZ4Z6nVQMs7TO4F6fhPRNHRNjxrAdj32PZfkR7HS3bIAcD+uqEWUz7a0lVkc8MKa2cC/QDdQzEdHKH2suCTWtmNLrzke2sA8Nv6g8zb11ZgLQBEFjp0zrxufABw3KM722fj01K87K9efJtCBucYd9uZ2UZtB7Oj9G+crDdS/8GFJuAVsQkBAEDbH/uBF5zuKbIW4w6Zd5sA2Ldb8VZfstPThviT8onzjkDv+k4dYc4/ozLMauhp6iDUV1ynHnkAPb/tkR9EeXRXlDVhsCsAeM0LcZv43vSsvc147KgwnHQDs/1q4tzN8aPJdVaTJ+iG1mt5E38fCgz5oZsS8fy17mzR/1Ket8PL86A2vq1tSEb8h5WutQez/DPEJmA4E3sotdYvdYkKABiQgD8JBuaI35ZC04th9jbA95n0VPthsHQPGS20AWn/q7WmlwN4YL5TUV4QkxBlYWtr7aSOIwC8y9RlH7CY1/s5XncvMlBqASp2kvt6S5hEfDzYI/JLxZEZNSkerDmMvF2DJy2TA0PBSeoQwkT6CJuHWgX1eW0YBQCwk5gF1pSvjDea8h/tnjmwe7s27bqEj1qw+cilBx+SstPvjxaZkXa4o82c3/5YRTVxQ8KSXf/baixxlT8CTMPL8tsC4626D0Os0uxsUoZfvZXkIqsA4jX57xwNjuuqSoqKK2r1OG7SVRdmxSera8/3kNRzuhLdd8Ib3ZXQkaqCTsBu85NV+JclPggwll4jtiDMIjKLTqPWmFT48hyv3kEi0joAIAzoO3f32b/vPrhz5eLhdXPGRXQN8nGXj/uMl9/fOKqrt+xUpWpX182q2NnJqR6s8EfFk7nrfMDSaer33sBccak2QWEF3lni7kAAAOkTdW+r0aICkdhOwAOmfmtj63BDdfqetmF/VceOGvxFV33Mjg2nzRW6y60RsDQkrWo4WLodr+lnBa9k6oVLvQ7F6T7sWBVxD19w5FqqKXNFi1FfKw5Eq+fbA4sBfxqyZ0nAYqer5FGBBfyg1yRx0gOxAHGcqyGLh4gAkD3UCdTmaPm+Cz/rEtfOLCKxD97AYpPH5MduYDm6HosNAKaI55gLOSYc1305GDU9cvq0qdNmTJ8yYfykLW+qcZwouzvLr3lGSU9osN7r0k1V2r9WtQMW/e8RT4LAis2+VQwCxo6XtRSJ4zhBURRJkAROEASOmTCSInAcJynTw8jq5ICGA0iTRZfXOgOb/newewFgTdmGGXwmIj6v9aqHxThB4CX/nr3wx8UL58+fO3vuwrkz/6TpCYJQv9vcrekrfAfScAAARYBNt5vU8ybAfqu/ViAAks7vKOpGezGCoihinu+9TE2VTXYCgIjyb4ENil3hPiKhDbCNNlmWSh5GAADWkvoxYLn7Z+q5PQCA8C9qIWdNr1VGAMvC9rsyiMqjCqjfrTLT3wpwlNoCtFPxSyhHdc3TzgV20Y7ni8iiS78IgVb2+jLPGiOKetF1rHjtyk2u96lzYnZc1v4gc3e3E4L5WUPAmj77XOgCckz/BHPSSuPn5sBq6xhjyYEgFJjyeVZBxQidYFoSmTyKxz2dv1cOB1b7JeEv+/LBtpucNpRH8bhG/Cd1QsAGOvqH8Zw32LAsRAQA9lvVFTNRjhlRmxUMbI4q1O6SgS2vLhgCACBcVVsynluQE9QWYHNwXu1qEdiy6zvdoHogWKH53odTIGyTLxud0rUbhWDT0wwvnGnA7gAe24JT2PV4gB+TgE37xWnGg1n3e+QfkkaCv8P4RAE2LThE/CExB22S1dMbiQHFeWFg2+OqU4OBaaQuqVmj4PFcswRs2/OrZhIwdrhFHUAbAWQDdk1mYw471oiZQc9iVedGoLuqqAfYOoqChbzD5Hkh5yHHqX2ozVkx5HtZO86DcSf8oeGjy/7w4j6EB1zIt4MGDABWUDggAgQAAHAXAJ0BKqgAbgA+kUieTCWkNqIiNmk60BIJTdv/HOyn6AdwD+AcYBX9WaA/AP0WtA0K1WN6tgDxvr/Kt512EXqZeYzzcukA/0H+A62n0AOlO/czKg6gKZz43HuamaYR19Su+hoArtq28xz+N9GJJ9YUYx1zttGB1Jv+szaqkxDKeYyoT+x92NXvFxe/p2xyva/nWTctpwoOCdNvebeg58t2HG1iTUt9/tpbF8JEec/hwYZ36VDUeXtZtGU7uB3x9md0AjQA/vxdOccfhJfpFdiBl7IoAcSGKK+k3wv7elvVmOii2zCzPz8fOAI1UO0pSUpAImlSKuk8uB6gL7t/cICRvJ7TvVZ0HDkndf0AN+ivBNbnCxSjnkY1PdHbv+ABULZ2a8qzY7ZkSCcfiIqXYvgZUEim06wus8DBJzAJtU87ke3cUZFAzUkb4KLRf02x1qQ4D0f8c3H0IgC3kVsEnJ0fQCHH5U1dNqeUjOhZWr+RkhvyniBFEZ65sAK88YQyklDxzPRwl+w84JEfxIvHZ+7pzlpJPYmP+prucDLm2NXftweboMZ4C4y+tPQQ1fe3E9Q0ki62Oz7Kt+rnoV0XM+HduofPpdS3AdycTNujPcA4ZpWyLxy6Z7gy4feKqT87HnUOaSgIboJxmD4wugzUpUa1VJ87bvFhCt/Je4Pb8qZvkz1GplkYLXKi+I/XYVgnd3vpVZU+fxraQEYK98cyyZ+JVMgF87YwEIogzqpibG1RbvywIqV4rLnYtX9JGG3XvS4a7rgvXHVCVu4PoTdR5UeS1hSvOj2WVIeQBG1iHT9YQIVCydRbmqsvYPFfGebIfLMzqKz42fz9975Y8MyeVWHKfp3bZqC519WVfl2SU5c+eWgenxTGq2p0Ydj1L4y3Q8BuDL/yn3zQs6imNAVpKaEUm+L/BDgxvC9DrUUthj9EZBzlOLztF2aqM+Sn4f5XLDpWgM6Z04MfEVyOzfzypR67loATB92zpAhsxQO5+6mXuMGf+Oz+M9P9vgl5nBENlCFTI7ub0zkTcjI3eEQIcrzrARevk0BLrzPLPWHFYxvINx3K2XXfkKu/ZiFO35wUPlVMTxws7UB+lckkzWJxYqvVtj5sZpOob/33/lcOvMbE+KCs9+vrD/3DsUHs0SP1zyzOij0VWpvOcTN+SbBuyyANr9GlbyJspEmmyOoPAYSoRNB1xtnaD5OHdPzn5Z/nnjqVFFtqa1menR2f6rbviR7MbC/3bQ8WiLiynLL4sRYKmXtoN3OA2mm6+O05t55T1MhcWS4IUkmkVZ5uo0EOTgVU7vWiHX98FyaUhPP5MO+LdCDvgRw6kN5TxH92LvIWiPdnwljY3+7uGbOZgbKgAAAAAA=="></button><span class="brand-wordmark-wrap"><img class="brand-wordmark" alt="HERCULES" src="data:image/webp;base64,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"><button type="button" class="brand-cat-trigger"${brandCatActivated?' disabled':''} aria-label="猫のアニメーション"></button></span><div class="top-right">${home?`<span class="date">${displayDate(new Date())}</span>`:''}${announcementMarkup()}${menuMarkup()}</div></header>
    ${home?`<div id="homePinned" style="display:contents">${pinnedStrip()}</div>`:`<nav class="site-back" aria-label="戻る"><a class="admin-link" href="/HERCULES/">← ホーム</a>${adminBack?'<a class="admin-link" id="adminBack" href="/HERCULES/admin" hidden>← 運営</a>':''}</nav>`}</div>`;
}
function announcementMarkup(){
  return `<button class="menu-trigger" type="button" data-open-announcement aria-label="運営のお知らせ" aria-haspopup="dialog" aria-controls="siteAnnouncement" style="position:relative">
    ${lineIcon('bell')}<span data-announcement-dot hidden aria-label="未読" style="position:absolute;top:7px;right:7px;width:8px;height:8px;border-radius:50%;background:#b8314a"></span></button>
    <dialog class="ops-card edit-dialog" id="siteAnnouncement" aria-labelledby="siteAnnouncementTitle" style="width:min(90vw,520px)">
      <div class="ops-toolbar"><h2 id="siteAnnouncementTitle">運営のお知らせ</h2><form method="dialog"><button class="secondary">閉じる</button></form></div>
      <p class="meeting-notes" id="siteAnnouncementText" role="status"></p>
      <a class="secondary" href="/HERCULES/guide#herculesNotifications">通知設定</a>
    </dialog>`;
}
function updateAnnouncementBadge(){
  const dot=document.querySelector('[data-announcement-dot]');
  if(!dot)return;
  let seen='';
  try{seen=localStorage.getItem('hercules-announcement-seen')||'';}catch{}
  dot.hidden=!data.announcement?.trim()||data.announcement===seen;
}
async function openAnnouncement(){
  const dialog=document.getElementById('siteAnnouncement');
  if(!dialog||dialog.open)return;
  const message=document.getElementById('siteAnnouncementText');
  message.textContent='読み込み中…';
  dialog.showModal();
  const started=Date.now();
  const loaded=await loadSettings();
  if(!dialog.open||!dialog.isConnected)return;
  message.textContent=data.announcement?.trim()||(loaded?'現在、お知らせはありません。':'お知らせを取得できませんでした。');
  if(!loaded)return;
  try{localStorage.setItem('hercules-announcement-seen',data.announcement||'');}catch{}
  updateAnnouncementBadge();
  if(isWebApp())void noticeCount('read-notices',started,'announcement');
}
document.addEventListener('click',event=>{
  if(event.target.closest('[data-open-announcement]'))void openAnnouncement();
});
const menuSections=[
  {path:'/'},
  {label:'活動・予定',icon:'calendar',paths:['/calendar','/planet-calendar']},
  {label:'部内交流',icon:'chat',paths:['/chat','/ikenbako']},
  {path:'/photos'},
  {label:'学習・クイズ・資料',icon:'star',paths:['/space-quiz','/external-services']},
  {label:'部の情報・手続き',icon:'procedures',paths:['/records','/members','/inventory','/procedures']},
  {path:'/guide'},
  {path:'/admin'}
];
function menuMarkup(){
  const current=pagePath().replace(/\/$/,'')||'/';
  const linksByPath=new Map(siteLinks.map(entry=>[entry[0],entry]));
  const linkMarkup=([href,icon,label],style='')=>`<a href="/HERCULES${href}"${style}${current===href?' aria-current="page"':''}>${lineIcon(icon)}${label}</a>`;
  const links=menuSections.map((section,index)=>{
    const style=` style="--menu-item-index:${index}"`;
    if(section.path)return linkMarkup(linksByPath.get(section.path),style);
    const open=section.paths.includes(current)?' open':'';
    return `<details class="menu-group"${style}${open}><summary>${lineIcon(section.icon)}${section.label}</summary>
      <div class="menu-subitems">${section.paths.map(path=>linkMarkup(linksByPath.get(path))).join('')}</div>
    </details>`;
  }).join('');
  return `<div class="menu"><button class="menu-trigger" type="button" aria-label="メニューを開く" aria-haspopup="dialog" aria-controls="siteMenu" aria-expanded="false" data-menu-open>${lineIcon('menu')}</button>
    <dialog class="menu-drawer" id="siteMenu" aria-labelledby="siteMenuTitle"><div class="menu-drawer-inner">
      <div class="menu-drawer-head"><strong id="siteMenuTitle">メニュー</strong><button type="button" class="menu-dismiss" aria-label="メニューを閉じる" data-menu-close autofocus>×</button></div>
      <nav aria-label="サイトメニュー">${links}</nav>
    </div></dialog></div>`;
}
function closeSiteMenu(drawer){
  if(!drawer?.open||drawer.classList.contains('is-closing'))return;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){drawer.close();return}
  drawer.classList.add('is-closing');
  setTimeout(()=>{
    drawer.classList.remove('is-closing');
    drawer.close();
  },340);
}
document.addEventListener('cancel',event=>{
  if(!event.target.matches('.menu-drawer'))return;
  event.preventDefault();
  closeSiteMenu(event.target);
},true);
document.addEventListener('click',event=>{
  const trigger=event.target.closest('[data-menu-open]');
  if(trigger){
    const drawer=document.getElementById('siteMenu');
    if(!drawer||drawer.open)return;
    drawer.addEventListener('close',()=>{
      trigger.setAttribute('aria-expanded','false');
      trigger.focus();
    },{once:true});
    drawer.showModal();
    trigger.setAttribute('aria-expanded','true');
    return;
  }
  if(event.target.matches('.menu-drawer'))closeSiteMenu(event.target);
  else closeSiteMenu(event.target.closest('[data-menu-close]')?.closest('dialog'));
});
const homeScreenGuides={
  'ios-safari':{
    label:'iPhone／iPad　Safari',
    steps:['Safariでヘラクレスのホームを開く。','共有ボタンをタップする。見つからない場合は、その他のメニューから共有を開く。','「ホーム画面に追加」を選ぶ。表示されない場合は「アクションを編集」を確認する。','「ウェブアプリとして開く」が表示される場合はオンにして、「追加」をタップする。'],
    source:'https://support.apple.com/ja-jp/guide/iphone/iphea86e5236/ios'
  },
  'ios-chrome':{
    label:'iPhone／iPad　Chrome',
    steps:['Chromeでヘラクレスのホームを開く。','アドレスバーの右にある共有ボタンをタップする。','「ホーム画面に追加」を選ぶ。','名前を確認して「追加」をタップする。'],
    source:'https://support.google.com/chrome/answer/9658361?co=GENIE.Platform%3DiOS&hl=ja'
  },
  'android-chrome':{
    label:'Android　Chrome',
    steps:['Chromeでヘラクレスのホームを開く。','アドレスバーの右にある「︙」をタップする。','「ホーム画面に追加」またはインストール・ショートカット作成の項目を開き、「ショートカットを作成」を選ぶ。','名前を確認して「追加」をタップする。'],
    source:'https://support.google.com/chrome/answer/15085120?co=GENIE.Platform%3DAndroid&hl=ja'
  }
};
const guideDevices={ios:'iPhone／iPad',android:'Android',mac:'Mac',windows:'Windows'};
const desktopChromeSteps=['Chromeでヘラクレスのホームを開く。','右上の「︙」から「キャスト、保存、共有」を開く。','「ショートカットを作成」を選び、名前を確認して「作成」を押す。'];
const desktopChromeSource='https://support.google.com/chrome/answer/15085120?co=GENIE.Platform%3DDesktop&hl=ja';
Object.assign(homeScreenGuides,{
  'mac-safari':{
    label:'Mac　Safari',
    steps:['macOS Sonoma 14以降のSafariでヘラクレスのホームを開く。','ツールバーの共有ボタンから「Dockに追加」を選ぶ。','名前を確認し、「追加」をクリックする。'],
    source:'https://support.apple.com/ja-jp/guide/safari/ibrw9e991864/mac'
  },
  'mac-chrome':{label:'Mac　Chrome',steps:desktopChromeSteps,source:desktopChromeSource},
  'windows-chrome':{label:'Windows　Chrome',steps:desktopChromeSteps,source:desktopChromeSource}
});
const guideAlternatives={google:'Google',bing:'Microsoft Bing',yahoo:'Yahoo! JAPAN',duckduckgo:'DuckDuckGo'};
for(const [family,label] of Object.entries(guideDevices)){
  const fallback=family==='ios'||family==='mac'?family+'-safari':family+'-chrome';
  for(const [key,name] of Object.entries(guideAlternatives)){
    const browser=homeScreenGuides[fallback].label.split('　')[1];
    homeScreenGuides[family+'-'+key]={
      label:label+'　'+name,
      steps:[
        'ヘラクレスのホームを表示し、ページのURLをコピーする。共有メニューにURLをコピーする項目がある場合は、そこからコピーする。',
        browser+'を開き、アドレスバーにURLを貼り付けて開く。すでに'+browser+'で表示している場合はこの操作を省略できる。',
        browser+'での追加手順に進む。'
      ],
      fallback
    };
  }
}
const standaloneMode=matchMedia('(display-mode: standalone)');
const isWebApp=()=>standaloneMode.matches||navigator.standalone===true;
const observationSnapshot='hercules-observation-snapshot';
const offlineMeetingPath='/meeting-offline';
let appWorker;

function webAppWorker(){
  if(!('serviceWorker' in navigator))return Promise.reject(new Error('Service Worker unavailable'));
  if(!appWorker)appWorker=navigator.serviceWorker.register('/HERCULES/hercules-sw.js')
    .then(registration=>registration.active?registration:navigator.serviceWorker.ready)
    .catch(error=>{appWorker=null;throw error;});
  return appWorker;
}

async function noticeCount(type,readBefore,kind){
  if(!isWebApp())return;
  try{
    const registration=await webAppWorker();
    const count=await new Promise((resolve,reject)=>{
      const channel=new MessageChannel();
      const timer=setTimeout(()=>{channel.port1.close();reject(new Error('Service Worker timeout'));},4000);
      channel.port1.onmessage=({data})=>{
        clearTimeout(timer);
        channel.port1.close();
        if(data.error)reject(new Error('Unread count unavailable'));
        else resolve(data.count);
      };
      registration.active.postMessage({type,readBefore,kind},[channel.port2]);
    });
    const label=document.getElementById('unreadNoticeCount');
    if(label)label.textContent='未読通知　'+count+'件';
  }catch{}
}

const notificationCategories={announcement:'運営のお知らせ',meeting:'観測会',chat:'チャット',inventory:'物品管理',members:'部員統計',records:'実績・記録'};
function setupNotificationControls(){
  const button=document.getElementById('announcementNotification');
  const status=document.getElementById('announcementNotificationStatus');
  if(!('Notification' in window)||!('PushManager' in window)||!('serviceWorker' in navigator)){
    button.hidden=true;
    status.textContent='この端末ではプッシュ通知を利用できません。';
    return;
  }
  const categories=document.getElementById('notificationCategories');
  const choices=[...categories.querySelectorAll('input')];
  let manager,subscription,key;
  async function preferences(categories){
    const headers={'content-type':'application/json'};
    const registration=subscription.toJSON();
    const options={method:'POST',headers,body:JSON.stringify({...registration,categories})};
    let response=await pagesFetch('https://tenmonken-infoweb-2026.rt-earth616.chatgpt.site/api/push/preferences',options);
    if(response.status===404){
      const recovered=await pagesFetch('https://tenmonken-infoweb-2026.rt-earth616.chatgpt.site/api/push/subscription',{method:'POST',headers,body:JSON.stringify(registration)});
      if(recovered.ok)response=await pagesFetch('https://tenmonken-infoweb-2026.rt-earth616.chatgpt.site/api/push/preferences',options);
    }
    if(!response.ok)throw new Error('Preferences unavailable');
    const saved=await response.json();
    for(const choice of choices)choice.checked=saved.categories.includes(choice.value);
  }
  categories.onchange=async event=>{
    categories.disabled=button.disabled=true;
    try{
      await preferences(choices.filter(choice=>choice.checked).map(choice=>choice.value));
      refresh();
    }catch{
      event.target.checked=!event.target.checked;
      refresh();
      status.textContent='通知の種類を保存できませんでした。';
    }finally{categories.disabled=false;}
  };
  const refresh=()=>{
    categories.hidden=!subscription;
    button.textContent=subscription?'通知をオフにする':'通知を有効にする';
    status.textContent=subscription?'通知はオンです。':Notification.permission==='denied'?
      '通知が拒否されています。端末の通知設定を確認してください。':'通知はオフです。';
    button.disabled=!subscription&&(!key||Notification.permission==='denied');
  };
  const prepare=async()=>{
    try{
      const registration=await webAppWorker();
      manager=registration.pushManager;
      subscription=await manager.getSubscription();
      if(subscription)await preferences();
      if(!subscription){
        const response=await pagesFetch('https://tenmonken-infoweb-2026.rt-earth616.chatgpt.site/api/push/key');
        if(!response.ok)throw new Error('Push key unavailable');
        const {publicKey}=await response.json();
        key=Uint8Array.from(atob(publicKey.replace(/-/g,'+').replace(/_/g,'/')),char=>char.charCodeAt(0));
      }
      refresh();
      void noticeCount('count-notices');
    }catch{
      button.disabled=false;
      button.textContent='通知設定を再読み込み';
      status.textContent='通知設定を取得できませんでした。';
    }
  };
  button.onclick=async()=>{
    if(!isWebApp())return;
    button.disabled=true;
    if(!subscription&&!key){await prepare();return;}
    try{
      if(subscription){
        const old=subscription;
        if(!await old.unsubscribe()&&await manager.getSubscription())throw new Error('Unsubscribe failed');
        subscription=null;
        void pagesFetch('https://tenmonken-infoweb-2026.rt-earth616.chatgpt.site/api/push/subscription',{method:'DELETE',headers:{'content-type':'application/json'},body:JSON.stringify(old)}).catch(()=>{});
        void noticeCount('read-notices',Date.now());
        await prepare();
        return;
      }
      const latest=await manager.subscribe({userVisibleOnly:true,applicationServerKey:key});
      try{
        const response=await pagesFetch('https://tenmonken-infoweb-2026.rt-earth616.chatgpt.site/api/push/subscription',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(latest)});
        if(!response.ok)throw new Error('Registration failed');
      }catch(error){
        await latest.unsubscribe().catch(()=>{});
        throw error;
      }
      subscription=latest;
      await preferences();
      refresh();
    }catch{
      refresh();
      if(Notification.permission!=='denied')status.textContent='通知設定を変更できませんでした。もう一度お試しください。';
    }
  };
  button.disabled=true;
  void prepare();
}

function saveObservation(){
  const status={scheduled:'開催予定',cancelled:'中止',pending:'開催未定'};
  const snapshot={
    savedAt:Date.now(),date:meetingDisplay(),status:status[meetingStatus()]||status.pending,
    location:data.location,notes:data.meeting
  };
  try{localStorage.setItem(observationSnapshot,JSON.stringify(snapshot));return true;}
  catch{return false;}
}

function renderOfflineMeeting(message=''){
  document.title='観測会の保存情報 | ヘラクレス';
  let saved;
  if(isWebApp()){
    try{saved=JSON.parse(localStorage.getItem(observationSnapshot));}catch{}
  }
  document.getElementById('app').innerHTML=`<div class="shell">${siteHeader()}<section class="chat-wrap guide-layout">
    <h1>観測会の保存情報</h1><section class="guide-section">
    ${saved?`<p class="hint">保存日時　${dateFormat.format(saved.savedAt)} ${timeFormat.format(saved.savedAt)}（日本時間）</p>
      <p class="hint">端末に保存した情報です。予定が変更されている場合があります。</p>
      <p><strong>${esc(saved.date)}</strong>　${esc(saved.status)}</p><p>場所　${esc(saved.location||'—')}</p>
      <p><strong>特記事項・持ち物</strong></p><div class="meeting-notes">${esc(saved.notes||'—')}</div>`:
      `<p>${isWebApp()?'保存した観測会情報がありません。':'ホーム画面からヘラクレスを開くと利用できます。'}</p>`}
    ${isWebApp()?'<p><button class="primary" type="button" id="refreshObservation">最新情報を取得して保存</button></p>':''}
    <p id="offlineMeetingStatus" class="hint" role="status">${esc(message)}</p></section></section></div>`;
  const button=document.getElementById('refreshObservation');
  if(button)button.onclick=async()=>{
    button.disabled=true;
    try{
      if(!await loadSettings()||!saveObservation())throw new Error('Snapshot unavailable');
      await webAppWorker();
      renderOfflineMeeting('観測会情報を端末に保存しました。');
    }catch{
      button.disabled=false;
      document.getElementById('offlineMeetingStatus').textContent='保存できませんでした。通信状態を確認してもう一度お試しください。';
    }
  };
}

function renderGuide(path){
  const base='/guide/home-screen';
  const installed=isWebApp();
  if(installed&&path!=='/guide'){
    location.replace('/HERCULES/guide');
    return;
  }
  const key=path.slice(base.length+1);
  const device=Object.hasOwn(homeScreenGuides,key)?homeScreenGuides[key]:null;
  const browserStep=Object.hasOwn(guideDevices,key);
  const family=key.split('-')[0];
  document.title=(path==='/guide'?'利用ガイド':'ホーム画面に追加')+' | ヘラクレス';
  document.getElementById('app').innerHTML=`<div class="shell">${siteHeader()}<section class="chat-wrap guide-layout" id="guideContent"></section></div>`;
  const content=document.getElementById('guideContent');
  if(path==='/guide'){
    content.innerHTML=`<h1>利用ガイド</h1><div class="feature-stack">
      <section class="guide-section"><h2>ホーム画面に追加</h2>${installed?'<p>追加済み</p>':`<p>ヘラクレスをホーム画面のアイコンから開けるようにします。</p><a class="primary" href="${base}">追加手順を見る →</a>`}</section>
      ${installed?`<section class="guide-section" id="herculesNotifications"><h2>ヘラクレスの通知</h2><p>チャットの新着通知を受け取るには、通知をオンにして「チャット」を選んでください。</p><fieldset id="notificationCategories" hidden><legend>受け取る通知</legend>${Object.entries(notificationCategories).map(([key,label])=>`<label><input type="checkbox" value="${key}"> ${label}</label>`).join('')}</fieldset><button type="button" class="primary" id="announcementNotification">通知を有効にする</button><p class="hint" id="announcementNotificationStatus" role="status"></p>
      <p class="hint" id="unreadNoticeCount"></p><a class="secondary" href="/HERCULES/?notice=meeting">観測会・お知らせを見る →</a></section>
      <section class="guide-section"><h2>観測会のオフライン閲覧</h2><p>端末に保存した日時・集合場所・特記事項を開けます。</p><a class="secondary" href="${offlineMeetingPath}">観測会の保存情報を見る →</a></section>`:''}
      <section class="guide-section"><h2>本サイトの公開範囲</h2>
        <p>　本サイトの公開範囲は、文化会に登録された天文研究部に所属する部員のみとします。</p>
        <p>　当部の部員ではない方が、許可なしに利用していた場合は、該当者に対して以下の措置を行います。</p>
        <ul><li>当部が運営する全てのサービスへのアクセス拒否</li><li>訴訟および損害賠償 等</li></ul>
      </section>
      <section class="guide-section"><h2>セキュリティーについて</h2>
        <p>　本サイトの閲覧に氏名やメールアドレスの入力は不要です。チャットや物品管理などでは、機能の提供に必要な入力情報を保存します。</p>
        <p>　全部員に安全にご利用いただくために、利用者は以下を厳守してください。</p>
        <ul><li>部員でない人へのURLの共有をしないこと</li><li>不正アクセス、不正改竄 等の行為をしないこと</li><li>サーバーに負荷を与える 等の行為をしないこと</li></ul>
      </section>
      <section class="guide-section"><h2>安全にご利用いただくために</h2><p>サイトで気づいたことは意見箱から運営へお知らせください。</p><a class="secondary" href="/HERCULES/ikenbako">意見箱を開く</a></section>
    </div>`;
    if(installed){
      setupNotificationControls();
      if(location.hash==='#herculesNotifications')document.getElementById('herculesNotifications').scrollIntoView();
    }
    return;
  }
  const back=device?base+'/'+family:browserStep?base:'/guide';
  const benefits=`<section class="guide-section"><h2>追加するとできること</h2>
    <ul><li>スマホやタブレットではホーム画面、MacやWindowsではDockや作成したショートカットからヘラクレスを直接開けます。</li><li>対応する端末で「ウェブアプリとして開く」を有効にすると、アドレスバーのないアプリ風の画面で使えます。</li></ul>
    <p class="hint">対応する端末では、Webアプリで開いたときに運営のお知らせの通知を有効にできます。</p></section>`;
  const heading=`<p><a class="secondary" href="${back}">← 戻る</a></p><h1>ホーム画面に追加</h1>`;
  if(device){
    content.innerHTML=heading+`<section class="guide-section"><h2>3　追加手順</h2><p>${device.label}</p><ol class="guide-steps">${device.steps.map(step=>`<li>${step}</li>`).join('')}</ol>
      <div class="feature-links"><a class="primary" href="/HERCULES/">ヘラクレスのホームを開く</a>${device.fallback?`<a class="secondary" href="/HERCULES${base}/${device.fallback}">${homeScreenGuides[device.fallback].label.split('　')[1]}での追加手順 →</a>`:`<a class="secondary" href="${device.source}" target="_blank" rel="noopener noreferrer">公式の手順 ↗</a>`}</div></section>${benefits}`;
    return;
  }
  const browsers=Object.entries(homeScreenGuides).filter(([id])=>id.startsWith(family+'-'));
  content.innerHTML=heading+`<form id="guideChoice" class="guide-section">
    ${browserStep?`<div class="field"><label for="guideBrowser">2　使用しているブラウザ</label><select id="guideBrowser" name="choice" required><option value="">ブラウザを選択</option>${browsers.map(([id,guide])=>`<option value="${id}">${guide.label.split('　')[1]}</option>`).join('')}</select></div>`:
      `<fieldset class="guide-devices"><legend>1　使用している端末</legend>${Object.entries(guideDevices).map(([id,label])=>`<label><input type="radio" name="choice" value="${id}" required> ${label}</label>`).join('')}</fieldset>`}
    <div class="guide-next"><button type="submit" class="primary">${browserStep?'手順を見る':'次へ'} →</button></div></form>${benefits}`;
  const form=document.getElementById('guideChoice');
  form.onsubmit=event=>{
    event.preventDefault();
    const choice=new FormData(form).get('choice');
    if(browserStep?browsers.some(([id])=>id===choice):Object.hasOwn(guideDevices,choice)){
      location.assign('/HERCULES'+base+'/'+choice);
    }
  };
}
function featurePage(title){
  document.title=title+' | ヘラクレス';
  document.getElementById('app').innerHTML=`<div class="shell">${siteHeader()}<section class="chat-wrap"><div class="feedback" id="featureContent" aria-live="polite">読み込み中…</div></section></div>`;
  return document.getElementById('featureContent');
}
function photoGallery(manage=false){
  return `<section class="feature-stack">
    <div class="ops-toolbar">${manage?'<span></span>':'<h1 style="margin:0">写真</h1>'}<button id="galleryAdd" type="button" class="primary">追加</button></div>
    <dialog id="galleryUploadDialog" class="ops-card edit-dialog" aria-labelledby="galleryUploadTitle" style="width:min(92vw,560px);max-width:92vw;overflow-x:hidden">
    <form id="galleryUpload">
      <div class="ops-toolbar"><h2 id="galleryUploadTitle">写真を追加</h2><button id="galleryUploadClose" class="secondary" type="button">閉じる</button></div>
      <ul style="color:#a51f32;padding-inline-start:1.4em;line-height:1.6">
        <li>他人の顔など、個人を特定できる写真を載せないこと。</li>
        <li>公共の福祉に反しないこと。</li>
        <li>利用者全員が写真をダウンロードできます。</li>
        <li>運営が許可なしに削除する場合があります。</li>
      </ul>
      <div class="field"><label for="galleryFiles">写真（1回10枚・合計10 MBまで）</label><input id="galleryFiles" style="width:100%;min-width:0" type="file" accept=".jpg,.jpeg,.png,.gif,.webp,.avif,.heic,.heif,image/jpeg,image/png,image/gif,image/webp,image/avif,image/heic,image/heif" multiple required></div>
      <div class="field"><label for="galleryTags">選んだ写真に付けるタグ</label><input id="galleryTags" placeholder="例　観測会、茜浜" aria-describedby="galleryTagHelp"><small id="galleryTagHelp">複数のタグは読点またはカンマで区切ります。</small><div id="galleryTagChoices" class="feature-links" aria-label="既存のタグ"></div></div>
      <button type="submit" class="primary">投稿</button>
      <p id="galleryUploadStatus" role="status"></p>
      <div id="galleryUploadProgress" hidden><progress aria-label="写真の投稿"></progress> <output id="galleryUploadElapsed" aria-live="off"></output></div>
    </form>
    </dialog>
    <p id="galleryNotice" role="status" hidden></p>
    <form id="galleryFilter" role="search" style="display:flex;flex-wrap:wrap;align-items:center;gap:8px">
      <div style="display:flex;align-items:center;gap:8px;flex:1 1 180px;min-width:0"><label for="gallerySearch">タグ</label><input id="gallerySearch" type="search" maxlength="40" placeholder="タグで絞り込む" style="min-width:0;flex:1"></div>
      <div style="display:flex;gap:8px;margin-left:auto"><button class="primary" type="submit">検索</button><button class="secondary" type="reset">解除</button></div>
    </form>
    <div id="gallerySearchTags" class="feature-links" aria-label="検索に使える既存タグ"></div><p id="galleryTagHint" class="hint" hidden>複数選択できます。選んだタグのうち、どれか1つでも付いている写真を表示します。</p>
    <p id="galleryStatus" role="status"></p>
    <div id="galleryList" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,140px),1fr));gap:12px"></div>
    <button class="secondary" id="galleryMore" type="button" hidden>もっと見る</button>
    <dialog id="galleryViewer" class="ops-card edit-dialog" aria-label="拡大写真" style="width:min(92vw,960px);max-width:92vw">
      <div class="ops-toolbar"><a id="galleryOriginal" class="secondary" download>元ファイルを保存</a><form method="dialog"><button class="secondary" type="submit">閉じる</button></form></div>
      <p id="gallerySavedAt" class="hint" style="font-size:.78rem"></p>
      <img id="galleryViewerImage" style="display:block;width:100%;max-height:75dvh;object-fit:contain;margin-top:12px" alt="">
    </dialog>
  </section>`;
}
function renderPhotos(){
  const content=featurePage('写真');
  content.removeAttribute('aria-live');
  content.innerHTML=photoGallery();
  initPhotoGallery();
}
function initPhotoGallery(manage=false){
  const byId=id=>document.getElementById(id);
  const list=byId('galleryList'), status=byId('galleryStatus'), more=byId('galleryMore');
  const filter=byId('galleryFilter'), search=byId('gallerySearch');
  const searchTags=byId('gallerySearchTags');
  const tagStyle='border-radius:999px;background:#e4f8f2;color:#175749;border:1px solid #a8d7c9;padding:5px 12px';
  const firstPages=new Map();
  const imageRequests=new WeakMap(), imageUrls=new Map();
  const originalRequests=new WeakMap(), originalUrls=new Map();
  async function loadGalleryImage(image,full=false){
    const separate=full&&image.hasAttribute('data-thumbnail');
    const requests=separate?originalRequests:imageRequests;
    const urls=separate?originalUrls:imageUrls;
    if(urls.has(image))return urls.get(image);
    if(requests.has(image))return requests.get(image);
    const task=(async()=>{
      try{
        const endpoint=sitesOrigin+'/api/photos/'+encodeURIComponent(image.dataset.galleryImage);
        const response=await pagesFetch(!full&&image.hasAttribute('data-thumbnail')?endpoint+'?preview=1':endpoint);
        if(!response.ok)throw Error('写真を取得できませんでした。');
        const blob=await response.blob();
        if(!image.isConnected)return '';
        const url=URL.createObjectURL(blob);
        urls.set(image,url);
        if(!separate)image.src=url;
        return url;
      }catch{return '';}
      finally{requests.delete(image);}
    })();
    requests.set(image,task);
    return task;
  }
  const imageObserver='IntersectionObserver' in window?new IntersectionObserver(entries=>{
    for(const entry of entries){
      if(!entry.isIntersecting)continue;
      imageObserver.unobserve(entry.target);
      void loadGalleryImage(entry.target);
    }
  },{rootMargin:'160px'}):null;
  function releaseGalleryImages(){
    imageObserver?.disconnect();
    for(const url of imageUrls.values())URL.revokeObjectURL(url);
    imageUrls.clear();
    for(const url of originalUrls.values())URL.revokeObjectURL(url);
    originalUrls.clear();
  }
  const galleryLifecycle=new MutationObserver(()=>{
    if(list.isConnected)return;
    releaseGalleryImages();
    galleryLifecycle.disconnect();
  });
  galleryLifecycle.observe(document.getElementById('app'),{childList:true});
  let next=null, revision=0, typedTag='', previousTags='';
  const chosenTags=new Set();
  async function load(append=false){
    const request=++revision;
    const params=new URLSearchParams();
    const tags=[...new Set([...chosenTags,...(typedTag?[typedTag]:[])])].sort();
    for(const tag of tags)params.append('tag',tag);
    if(append&&next)params.set('before',next);
    more.disabled=true;
    status.textContent='写真を読み込み中…';
    try {
      const key=JSON.stringify(tags);
      const cached=append?null:firstPages.get(key);
      const page=cached&&Date.now()-cached.at<15000?cached.page:await api('photos?'+params);
      if(request===revision&&!append&&page!==cached?.page){
        if(firstPages.size>=12)firstPages.delete(firstPages.keys().next().value);
        firstPages.set(key,{page,at:Date.now()});
      }
      if(request!==revision||!list.isConnected)return;
      next=page.next;
      if(Array.isArray(page.tags)&&JSON.stringify(page.tags)!==previousTags){
        previousTags=JSON.stringify(page.tags);
        const tagButtons=attribute=>page.tags.map(label=>`<button class="secondary" style="${tagStyle}" type="button" ${attribute}="${esc(label)}">${esc(label)}</button>`).join('');
        choices.innerHTML=tagButtons('data-gallery-choice');
        searchTags.innerHTML=tagButtons('data-gallery-filter');
        byId('galleryTagHint').hidden=!page.tags.length;
      }

      const cards=page.photos.map((photo,index)=>{
        const tags=photo.tags.map(label=>`<button class="secondary" style="${tagStyle}" type="button" data-gallery-tag="${esc(label)}">${esc(label)}</button>`).join('');
        return `<article class="ops-card" style="padding:8px;min-width:0;content-visibility:auto;contain-intrinsic-size:auto 180px">
          <button class="secondary" type="button" data-gallery-view aria-label="写真を拡大" style="display:block;width:100%;padding:0;border:0"><img data-gallery-image="${esc(photo.id)}" data-filename="${esc(photo.filename||'写真.jpg')}" data-saved-at="${esc(photo.savedAt||'')}"${photo.hasThumbnail?' data-thumbnail':''}${!append&&index<2?' data-gallery-eager':''} alt="${esc(photo.tags.join('、')||'部活動の写真')}" decoding="async" style="display:block;width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:9px"></button>
          <div class="feature-links" style="margin-top:6px;overflow-wrap:anywhere">${tags}${manage?`<button class="secondary" type="button" data-gallery-delete="${esc(photo.id)}">削除</button>`:''}</div>
        </article>`;
      }).join('');
      const startAt=append?list.children.length:0;
      if(append)list.insertAdjacentHTML('beforeend',cards);
      else{
        releaseGalleryImages();
        list.innerHTML=cards;
      }
      for(const card of Array.from(list.children).slice(startAt)){
        const image=card.querySelector('[data-gallery-image]');
        if(!imageObserver||image.hasAttribute('data-gallery-eager'))void loadGalleryImage(image);
        else imageObserver.observe(image);
      }
      status.textContent=list.children.length?'':'該当する写真がありません。';
      more.hidden=!next;
    }catch(error){
      if(request===revision)status.textContent=error.message;
    }finally{
      if(request===revision){more.disabled=false;syncSearchChips();}
    }
  }
  function syncSearchChips(){
    for(const chip of searchTags.children){
      const active=chosenTags.has(chip.dataset.galleryFilter);
      chip.setAttribute('aria-pressed',String(active));
      chip.style.background=active?'#175749':'#e4f8f2';
      chip.style.color=active?'#fff':'#175749';
    }
  }
  function applyTags(){
    syncSearchChips();
    more.hidden=true;
    void load();
  }
  function toggleSearchTag(tag){
    if(chosenTags.has(tag))chosenTags.delete(tag);
    else if(chosenTags.size+(typedTag&&!chosenTags.has(typedTag)?1:0)<12)chosenTags.add(tag);
    else{status.textContent='タグは12個まで選べます。';return;}
    applyTags();
  }
  function clearSearch(){
    search.value=typedTag='';
    chosenTags.clear();
    applyTags();
  }
  filter.onsubmit=event=>{
    event.preventDefault();
    const query=search.value.trim();
    if(query==='ねこ'||query==='ネコ'){
      location.assign('/HERCULES/photos/cat/');
      return;
    }
    if(query&&!chosenTags.has(query)&&chosenTags.size>=12){status.textContent='タグは12個まで選べます。';return;}
    typedTag=query;
    applyTags();
  };
  filter.onreset=event=>{event.preventDefault();clearSearch();};
  searchTags.onclick=event=>{
    const chip=event.target.closest('[data-gallery-filter]');
    if(chip)toggleSearchTag(chip.dataset.galleryFilter);
  };
  more.onclick=()=>void load(true);
  const viewer=byId('galleryViewer'), enlarged=byId('galleryViewerImage');
  const original=byId('galleryOriginal');
  viewer.addEventListener('close',()=>{enlarged.removeAttribute('src');original.removeAttribute('href');});
  list.onclick=async event=>{
    const preview=event.target.closest('[data-gallery-view]');
    if(preview){
      const image=preview.querySelector('img');
      imageObserver?.unobserve(image);
      preview.disabled=true;
      try{
        const url=await loadGalleryImage(image,true);
        if(!preview.isConnected)return;
        if(!url){status.textContent='写真を読み込めませんでした。もう一度タップしてください。';return;}
        enlarged.src=url;
        enlarged.alt=image.alt;
        const saved=image.dataset.savedAt;
        byId('gallerySavedAt').textContent='保存日　'+(saved?displayDate(saved):'記録なし');
        original.href=url;
        original.download=image.dataset.filename;
        if(!viewer.open)viewer.showModal();
      }finally{preview.disabled=false;}
      return;
    }
    const chip=event.target.closest('[data-gallery-tag]');
    if(chip){toggleSearchTag(chip.dataset.galleryTag);return;}
    const remove=event.target.closest('[data-gallery-delete]');
    if(!manage||!remove||!confirm('この写真をギャラリーから削除しますか？'))return;
    remove.disabled=true;
    try{await api('photos/'+encodeURIComponent(remove.dataset.galleryDelete),'DELETE');firstPages.clear();await load();}
    catch(error){status.textContent=error.message;}
    finally{remove.disabled=false;}
  };
  const form=byId('galleryUpload'), input=byId('galleryFiles'), labels=byId('galleryTags'), result=byId('galleryUploadStatus');
  const button=form.querySelector('button[type="submit"]');
  const choices=byId('galleryTagChoices');
  const selectedTags=()=>[...new Set(labels.value.split(/[,、，]/).map(value=>value.trim()).filter(Boolean))];
  choices.onclick=event=>{
    const choice=event.target.closest('[data-gallery-choice]');
    if(!choice||labels.disabled)return;
    const tag=choice.dataset.galleryChoice, tags=selectedTags();
    if(tags.includes(tag))return;
    if(tags.length>=12){result.textContent='タグは12個まで選べます。';return;}
    labels.value=[...tags,tag].join('、');
    result.textContent='';
  };
  const uploadDialog=byId('galleryUploadDialog'), notice=byId('galleryNotice');
  const closeUpload=byId('galleryUploadClose');
  byId('galleryAdd').onclick=()=>uploadDialog.showModal();
  closeUpload.onclick=()=>uploadDialog.close();
  uploadDialog.addEventListener('cancel',event=>{
    if(button.disabled)event.preventDefault();
  });
  function fileAsBase64(file){
    return new Promise((resolve,reject)=>{
      const reader=new FileReader();
      reader.onload=()=>resolve(String(reader.result).split(',')[1]);
      reader.onerror=()=>reject(Error('写真を読み込めませんでした。'));
      reader.readAsDataURL(file);
    });
  }
  async function galleryThumbnail(file){
    const url=URL.createObjectURL(file);
    try{
      const image=new Image();
      image.src=url;
      await image.decode();
      const scale=Math.min(1,320/Math.max(image.naturalWidth,image.naturalHeight));
      const canvas=document.createElement('canvas');
      canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));
      canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
      canvas.getContext('2d',{alpha:false}).drawImage(image,0,0,canvas.width,canvas.height);
      const preview=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.7));
      if(preview&&preview.size<=40960)return await fileAsBase64(preview);
    }catch{}finally{URL.revokeObjectURL(url);}
  }
  let selection=[];
  input.onchange=()=>{selection=Array.from(input.files,file=>({file,id:crypto.randomUUID()}));};
  form.onsubmit=async event=>{
    event.preventDefault();
    const tags=selectedTags();
    if(!selection.length||selection.length>10){result.textContent='写真を1〜10枚選んでください。';return;}
    if(selection.reduce((size,{file})=>size+file.size,0)>10*1024*1024){result.textContent='写真は合計10 MBまで選べます。';return;}
    if(tags.length>12||tags.some(value=>value.length>40)){result.textContent='タグは12個まで、1個40文字以内で入力してください。';return;}
    button.disabled=input.disabled=labels.disabled=closeUpload.disabled=true;
    notice.hidden=true;
    const progress=byId('galleryUploadProgress'), output=byId('galleryUploadElapsed');
    const started=performance.now();
    const seconds=()=>((performance.now()-started)/1000).toFixed(1);
    const update=()=>{output.textContent='経過 '+seconds()+' 秒';};
    progress.hidden=false;
    update();
    const timer=setInterval(update,100);
    try{
      const photos=[];
      for(const {file,id} of selection){
        result.textContent=`写真を準備中（${photos.length+1}／${selection.length}）…`;
        const [image,thumbnail]=await Promise.all([fileAsBase64(file),galleryThumbnail(file)]);
        photos.push({id,image,filename:file.name,thumbnail});
      }
      result.textContent='写真を保存中…';
      await api('photos','POST',{photos,tags});
      form.reset();
      selection=[];
      result.textContent='';
      notice.textContent=`${photos.length}枚の登録が完了しました（${seconds()} 秒）。`;
      notice.hidden=false;
      uploadDialog.close();
      firstPages.clear();
      clearSearch();
    }catch(error){result.textContent=error.message+'（経過 '+seconds()+' 秒）';}
    finally{
      clearInterval(timer);
      progress.hidden=true;
      button.disabled=input.disabled=labels.disabled=closeUpload.disabled=false;
    }
  };
  void load();
}
function calendarLink(label){
  return `<a class="secondary calendar-open" href="https://tenmonken-infoweb-2026.rt-earth616.chatgpt.site/api/calendar/file" target="_blank" rel="noopener noreferrer">${label} ↗</a>`;
}
async function renderCalendar(){
  const content=featurePage('部活行事カレンダー');
  try{
    const {file}=await api('calendar');
    content.innerHTML=`<h1>部活行事カレンダー</h1>${file?`<div id="calendarViewerHome"><section class="calendar-viewer" aria-label="カレンダー閲覧">
        <div class="calendar-toolbar">
          <button type="button" class="secondary" data-zoom="-1" aria-label="縮小" disabled>−</button>
          <output id="calendarZoom">100%</output>
          <button type="button" class="secondary" data-zoom="1" aria-label="拡大" disabled>＋</button>
          <button type="button" class="secondary" id="calendarFit" disabled>幅に合わせる</button>
          <button type="button" class="secondary" id="calendarFullscreen">全画面</button>
        </div>
        <div class="calendar-toolbar" id="calendarPagination" hidden>
          <button type="button" class="secondary" id="calendarPrevious">前のページ</button>
          <output id="calendarPage" aria-live="polite"></output>
          <button type="button" class="secondary" id="calendarNext">次のページ</button>
        </div>
        <div class="calendar-stage" tabindex="0" aria-label="カレンダー本文"></div>
        <p class="hint" id="calendarViewerStatus" role="status">カレンダーを読み込み中…</p>
      </section></div><dialog class="calendar-dialog" id="calendarDialog" aria-label="カレンダーの全画面表示"></dialog>`:'<p>カレンダーはまだ登録されていません。</p>'}`;
    if(file)await initCalendarViewer(file);
  }catch{content.textContent='カレンダーを読み込めませんでした。'}
}
async function initCalendarViewer(file){
  const home=document.getElementById('calendarViewerHome');
  const viewer=home.firstElementChild;
  const dialog=document.getElementById('calendarDialog');
  const stage=viewer.querySelector('.calendar-stage');
  const status=document.getElementById('calendarViewerStatus');
  const fullscreen=document.getElementById('calendarFullscreen');
  const zoomOutput=document.getElementById('calendarZoom');
  const [zoomOut,zoomIn]=viewer.querySelectorAll('[data-zoom]');
  const fit=document.getElementById('calendarFit');
  let zoom=1,baseWidth=0,showPage,redraw;
  function resize(){
    if(!baseWidth||!redraw)return;
    const width=Math.max(1,Math.floor(stage.clientWidth*zoom)-2);
    zoomOutput.value=Math.round(zoom*100)+'%';
    zoomOut.disabled=zoom<=0.5;
    zoomIn.disabled=zoom>=4;
    redraw(width);
  }
  fullscreen.onclick=()=>{
    if(dialog.open){dialog.close();return}
    dialog.append(viewer);
    dialog.showModal();
    fullscreen.textContent='全画面を閉じる';
    fullscreen.focus();
    resize();
  };
  dialog.addEventListener('close',()=>{
    home.append(viewer);
    fullscreen.textContent='全画面';
    fullscreen.focus();
    resize();
  });
  for(const button of [zoomOut,zoomIn])button.onclick=()=>{
    zoom=Math.min(4,Math.max(0.5,zoom+Number(button.dataset.zoom)*0.25));
    resize();
  };
  fit.onclick=()=>{zoom=1;stage.scrollLeft=0;resize()};
  new ResizeObserver(resize).observe(stage);
  try{
    if(file.mimeType.startsWith('image/')){
      const img=new Image();
      img.alt='部活行事カレンダー';
      img.src='https://tenmonken-infoweb-2026.rt-earth616.chatgpt.site/api/calendar/file';
      await img.decode();
      baseWidth=img.naturalWidth;
      stage.replaceChildren(img);
      redraw=width=>{img.style.width=width+'px'};
    }else{
      const lib='https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/';
      const pdfjs=await import(lib+'legacy/build/pdf.mjs');
      pdfjs.GlobalWorkerOptions.workerSrc=lib+'legacy/build/pdf.worker.mjs';
      const pdf=await pdfjs.getDocument({url:'https://tenmonken-infoweb-2026.rt-earth616.chatgpt.site/api/calendar/file',cMapUrl:lib+'cmaps/',cMapPacked:true,standardFontDataUrl:lib+'standard_fonts/',isEvalSupported:false}).promise;
      const previous=document.getElementById('calendarPrevious');
      const next=document.getElementById('calendarNext');
      const pageOutput=document.getElementById('calendarPage');
      let index=1,current,revision=0,widthOnScreen=0,rendering;
      redraw=width=>{
        if(!current)return;
        if(width===widthOnScreen)return;
        widthOnScreen=width;
        const page=current,canvas=document.createElement('canvas');
        const viewport=page.getViewport({scale:width/baseWidth});
        const pixelScale=Math.min(window.devicePixelRatio||1,2,Math.sqrt(12000000/(viewport.width*viewport.height)));
        canvas.width=Math.max(1,Math.floor(viewport.width*pixelScale));
        canvas.height=Math.max(1,Math.floor(viewport.height*pixelScale));
        canvas.style.width=width+'px';
        canvas.style.height=viewport.height+'px';
        canvas.setAttribute('aria-label','カレンダー '+index+'ページ');
        rendering?.cancel();
        const task=page.render({canvasContext:canvas.getContext('2d'),viewport,transform:[pixelScale,0,0,pixelScale,0,0]});
        rendering=task;
        task.promise.then(()=>{if(rendering===task){stage.replaceChildren(canvas);status.textContent=''}}).catch(error=>{
          if(rendering===task&&error.name!=='RenderingCancelledException'){
            widthOnScreen=0;
            status.textContent='PDFのページを表示できませんでした。';
          }
        });
      };
      showPage=async number=>{
        const request=++revision;
        index=number;
        pageOutput.value=index+' / '+pdf.numPages;
        previous.disabled=index<=1;
        next.disabled=index>=pdf.numPages;
        try{
          const page=await pdf.getPage(index);
          if(request!==revision)return;
          current=page;
          baseWidth=page.getViewport({scale:1}).width;
          widthOnScreen=0;
          stage.scrollTo(0,0);
          resize();
        }catch{if(request===revision)status.textContent='PDFのページを読み込めませんでした。'}
      };
      previous.onclick=()=>showPage(index-1);
      next.onclick=()=>showPage(index+1);
      document.getElementById('calendarPagination').hidden=pdf.numPages<2;
      await showPage(1);
    }
    fit.disabled=false;
    resize();
    if(!showPage)status.textContent='';
  }catch{status.textContent='カレンダーファイルを表示できませんでした。再読み込みしてください。'}
}
function initCalendarAdmin(){
  const input=document.getElementById('calendarFile');
  const remove=document.getElementById('calendarRemove');
  const status=document.getElementById('calendarStatus');
  async function refresh(){
    const {file}=await api('calendar');
    document.getElementById('calendarCurrent').innerHTML=file?`<p class="calendar-file">${esc(file.filename)}</p>${calendarLink('掲載中のファイルを開く')}`:'<p>カレンダーはまだ登録されていません。</p>';
    remove.hidden=!file;
  }
  bindSave('calendarUpload','calendarStatus',async()=>{
    const file=input.files[0];
    if(!file)throw Error('ファイルを選択してください。');
    if(file.size>5*1024*1024)throw Error('ファイルは5 MB以下にしてください。');
    remove.disabled=true;
    try{
      const response=await pagesFetch('https://tenmonken-infoweb-2026.rt-earth616.chatgpt.site/api/calendar',{method:'PUT',headers:{'x-calendar-filename':encodeURIComponent(file.name)},body:file});
      const result=await response.json();
      if(!response.ok)throw Error(result.error||'登録できませんでした。');
      input.value='';
      await refresh();
    }finally{remove.disabled=false}
  });
  remove.onclick=async()=>{
    if(!confirm('カレンダーの掲載を取り下げますか？'))return;
    const save=document.querySelector('#calendarUpload button[type=submit]');
    remove.disabled=true;
    save.disabled=true;
    try{
      await api('calendar','DELETE');
      await refresh();
      status.textContent='掲載を取り下げました。';
    }catch(error){status.textContent=error.message}
    finally{remove.disabled=false;save.disabled=false}
  };
  refresh().catch(error=>{status.textContent=error.message});
}
const facultyCatalog={
  '工学部':['機械工学科','宇宙・半導体工学科','先端材料工学科','電気電子工学科','情報通信システム工学科','応用化学科'],
  '創造工学部':['建築学科','都市環境工学科','デザイン科学科'],
  '先進工学部':['未来ロボティクス学科','生命科学科','知能メディア工学科'],
  '情報変革科学部':['情報工学科','認知情報科学科','高度応用情報科学科'],
  '未来変革科学部':['デジタル変革科学科','経営デザイン科学科'],
  '情報科学部':['情報工学科','情報ネットワーク学科'],
  '社会システム科学部':['経営情報科学科','プロジェクトマネジメント学科','金融・経営リスク科学科']
};
function facultyFor(row){
  if(row.faculty)return row.faculty;
  const matches=Object.entries(facultyCatalog).filter(([,names])=>names.includes(row.name));
  return matches.length===1?matches[0][0]:'学部未分類';
}
async function renderMembers(){
  const content=featurePage('部員統計');
  const draw=({total=null,departments=[],grades=[],cohorts=[]}={},message='')=>{
    const count=value=>value===null?'—':value;
    const rows=(items,format)=>items.map(({name,count})=>`<li><span>${esc(name)}</span><strong>${format(count)}</strong></li>`).join('');
    const faculties=new Map();
    for(const row of departments){
      const name=facultyFor(row);
      if(!faculties.has(name))faculties.set(name,[]);
      faculties.get(name).push(row);
    }
    if(!departments.length){
      for(const [name,items] of Object.entries(facultyCatalog))faculties.set(name,items.map(name=>({name,count:null})));
    }
    const facultyRows=Array.from(faculties,([name,items])=>`<details><summary>${esc(name)} <strong>${total===null?'—':items.reduce((sum,row)=>sum+row.count,0)} 名</strong></summary><ul>${rows(items,value=>count(value)+' 名')}</ul></details>`).join('');
    const countsSection=(title,items,emptyNames)=>{
      const values=items.length?items:emptyNames.map(name=>({name,count:null}));
      return `<section><h2>${title}</h2><ul>${rows(values,value=>count(value)+' 名')}</ul></section>`;
    };
    content.innerHTML=`<h1>総部員数 <span>${count(total)} 名</span></h1><div class="stats-grid">
      <section><h2>学部学科別</h2>${facultyRows}</section>
      ${countsSection('学年別',grades,['B1','B2','B3','B4','M1','M2'])}
      ${countsSection('回生別',cohorts,['一回生','二回生','三回生','四回生','五回生','六回生'])}</div>${message?`<p class="hint">${esc(message)}</p>`:''}`;
  };
  draw();
  try{
    const response=await pagesFetch('https://tenmonken-infoweb-2026.rt-earth616.chatgpt.site/api/members');
    if(!response.ok)throw Error();
    const result=await response.json();
    if(result.maintenance){content.innerHTML='<h1>部員統計</h1><p>現在メンテナンス中です。時間をおいて再度ご確認ください。</p>';return}
    if(result.configured)draw(result);
  }catch{draw(undefined,'部員数を取得できませんでした。')}
}
async function renderProcedures(){
  document.title='手続き・書類 | ヘラクレス';
  document.getElementById('app').innerHTML=`<div class="shell">${siteHeader()}<main class="chat-wrap feature-stack" id="featureContent" aria-live="polite">読み込み中…</main></div>`;
  const content=document.getElementById('featureContent');
  const fallback={title:'総合手続フォーム',description:'質問、要望、相談、お問い合わせ、退部希望などを受け付けます。'};
  const cards=(items,label)=>items.map(item=>{
    return `<article><h3>${esc(item.title)}</h3>
      ${item.description?`<p class="about-copy">${esc(item.description)}</p>`:''}
      ${item.url?`<a class="primary form-link" href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">${lineIcon('procedures')} ブラウザで開く ↗</a>`:`<button class="primary form-link" disabled>${label}</button>`}
    </article>`;
  }).join('');
  try{
    const {items}=await api('procedures');
    const forms=items.filter(item=>item.kind!=='document'),docs=items.filter(item=>item.kind==='document');
    content.innerHTML=`<section class="ops-card"><h2>手続き</h2><div class="procedure-items">${cards(forms.length?forms:[fallback],'回答する')}</div></section>
      <section class="ops-card"><h2>書類</h2><div class="procedure-items">${cards(docs,'書類を開く')||'<p class="hint">掲載中の書類はありません。</p>'}</div></section>`;
  }catch{content.textContent='手続きや書類を読み込めませんでした。再読み込みしてください。'}
}
const quizGrades=[
  ['天文宇宙博士',['','観測','理論','宇宙開発','天文学その他','天文時事','関連分野']],
  ['銀河博士',['','宇宙七不思議','太陽は燃える火の玉か？','まだ謎だらけ（！）の太陽系','十人十色の星たち','星々の一生','天の川銀河は何からできているのか？','銀河の世界','天文学の歴史','人類の宇宙進出と宇宙工学','宇宙における生命']],
  ['星空博士',['','星の名前七不思議','星座は誰が決めたのか','空を廻る太陽や星々','太陽と月、仲良くして','太陽系の仲間たち','太陽系の彼方には何がある','天文学のあゆみ','そして宇宙へ']],
  ['星博士ジュニア',['宇宙にのりだそう','月と地球','太陽と地球','太陽系の世界','星座の世界','星と銀河の世界','天体観察入門']]
];
const originalQuiz=window.herculesOriginalQuiz;
function shuffleQuiz(pool){
  const deck=[...pool];
  for(let i=deck.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [deck[i],deck[j]]=[deck[j],deck[i]];
  }
  return deck;
}
function openQuizInfo(){
  const dialog=document.createElement('dialog');
  dialog.className='modal edit-dialog quiz-info';
  dialog.setAttribute('aria-labelledby','quizInfoTitle');
  const exam=[[40,70],[60,70],[60,60],[40,60]];
  dialog.innerHTML=`<form method="dialog"><div class="ops-toolbar"><button class="secondary" autofocus>閉じる</button><h2 id="quizInfoTitle">天文宇宙検定の試験情報</h2></div></form>
    <p>公式試験は4択です。合格基準は100点満点での得点です。</p>
    <table><thead><tr><th scope="col">級</th><th scope="col">出題数</th><th scope="col">合格基準</th></tr></thead>
    <tbody>${exam.map(([questions,score],index)=>`<tr><th scope="row">${index+1}級</th><td>${questions}問</td><td>${score}点以上（${score}%）</td></tr>`).join('')}</tbody></table>
    <h3>問題ごとの配点</h3>
    <p>問題番号の横の「☆」を確認します。公式問題・解答で確認できる配点は次のとおりです。</p>
    <table><thead><tr><th scope="col">級</th><th scope="col">☆あり</th><th scope="col">☆なし</th></tr></thead><tbody>
    <tr><th scope="row">1級・4級</th><td>3点</td><td>2点</td></tr>
    <tr><th scope="row">2級・3級</th><td>2点</td><td>1点</td></tr>
    </tbody></table>
    <p>例：2級で☆ありを30問、☆なしを10問正解すると、30×2＋10×1＝70点です。受験する回の問題冊子や公式案内で配点を確認してください。</p>
    <p class="hint">β版では各問を同じ重みで数え、正解数を表示します。</p>
    <p class="hint">1級は60〜69点で準1級認定。β版の出題数は登録問題と出題範囲によって変わります。</p>
    <div class="feature-links"><a class="primary" href="https://www.astro-test.org/" target="_blank" rel="noopener noreferrer">公式ホームページ ↗</a><a class="secondary" href="https://www.astro-test.org/guide/" target="_blank" rel="noopener noreferrer">公式の受験案内 ↗</a></div>`;
  dialog.addEventListener('close',()=>dialog.remove(),{once:true});
  document.body.append(dialog);
  dialog.showModal();
}
async function renderQuiz(){
  const content=featurePage('天文宇宙検定クイズ');
  const title='<div class="quiz-heading"><h1>天文宇宙検定クイズ</h1><button class="secondary quiz-info-button" type="button" data-action="quiz-info" aria-label="天文宇宙検定の試験情報" aria-haspopup="dialog"><span aria-hidden="true">ⓘ</span></button></div>';
  try{
    const {questions:bank,unavailable}=await api('space-quiz').catch(()=>({questions:[],unavailable:true}));
    let questions=[],index=0,score=0,grade=0,answered=0,skipped=0;
    const chapterResults=new Map();
    function start(pool){
      questions=shuffleQuiz(pool);
      index=0;score=0;answered=0;skipped=0;
      chapterResults.clear();
      draw();
    }
    function chooseGrade(){
      content.innerHTML=title+'<div class="feature-stack quiz-groups"><section class="ops-card"><h2>過去問</h2>'+quizGrades.map(([name],i)=>{
        const count=bank.filter(item=>item.grade===i+1).length;
        return `<p><button type="button" class="secondary" data-grade="${i+1}" ${count?'':'disabled'}>${i+1}級　${name}　${count?count+'問':'Coming Soon'}</button></p>`;
      }).join('')+(unavailable?'<p class="hint">一部の問題シートを読み込めませんでした。</p>':'')+'</section><section class="ops-card"><h2>オリジナル問題</h2><p><button type="button" class="secondary" id="quizOriginal">Chat GPT</button></p></section></div>';
      content.querySelector('#quizOriginal').onclick=()=>{
        chooseOriginal();
      };
      content.querySelectorAll('[data-grade]:enabled').forEach(button=>button.onclick=()=>{grade=Number(button.dataset.grade);chooseChapter()});
    }
    function chooseOriginal(){
      grade=0;
      content.innerHTML=title+`<h2>Chat GPT</h2><form class="quiz-form">
        <div class="original-quiz-filters"><div class="field"><label for="originalGrade">級</label><select id="originalGrade"><option value="">指定なし</option>${quizGrades.map(([name],i)=>`<option value="${i+1}">${i+1}級　${name}</option>`).join('')}</select></div>
        <div class="field"><label for="originalChapter">章</label><select id="originalChapter"></select></div></div>
        <button type="submit" class="primary">スタート</button></form>
        <p><button type="button" class="secondary" id="quizBack">戻る</button></p>`;
      const gradeSelect=content.querySelector('#originalGrade'),chapterSelect=content.querySelector('#originalChapter');
      function updateChapters(){
        chapterSelect.innerHTML='<option value="">指定なし</option>'+quizGrades.map(([,chapters],i)=>{
          if(gradeSelect.value&&Number(gradeSelect.value)!==i+1)return '';
          return chapters.map((label,chapter)=>label?`<option value="${i+1}:${chapter}">${gradeSelect.value?'':(i+1)+'級　'}${chapter}章　${esc(label)}</option>`:'').join('');
        }).join('');
      }
      gradeSelect.onchange=updateChapters;
      updateChapters();
      content.querySelector('#quizBack').onclick=chooseGrade;
      content.querySelector('form').onsubmit=event=>{
        event.preventDefault();
        const [chosenGrade,chosenChapter]=chapterSelect.value.split(':').map(Number);
        const selectedGrade=chosenGrade||Number(gradeSelect.value);
        start(originalQuiz.filter(item=>(!selectedGrade||item.grade===selectedGrade)&&(!chapterSelect.value||item.chapter===chosenChapter)));
      };
    }
    function chooseChapter(){
      const [name,chapters]=quizGrades[grade-1];
      const pool=bank.filter(item=>item.grade===grade);
      content.innerHTML=title+`<h2>${grade}級　${name}</h2><form class="quiz-form"><div class="field"><label for="quizChapter">出題範囲</label><select id="quizChapter"><option value="">全章からランダム</option>${chapters.map((label,i)=>label?`<option value="${i}" ${pool.some(item=>item.chapter===i)?'':'disabled'}>${i}章　${label}</option>`:'').join('')}</select></div><button class="primary" type="submit">開始する</button></form><p><button type="button" class="secondary" id="quizBack">戻る</button></p>`;
      content.querySelector('#quizBack').onclick=chooseGrade;
      content.querySelector('form').onsubmit=event=>{
        event.preventDefault();
        const chapter=content.querySelector('#quizChapter').value;
        start(chapter===''?pool:pool.filter(item=>item.chapter===Number(chapter)));
      };
    }
    function result(){
      const percent=(correct,total)=>new Intl.NumberFormat('ja-JP',{style:'percent',maximumFractionDigits:1}).format(correct/total);
      const candidates=[...chapterResults].filter(([,stats])=>stats.correct<stats.total)
        .sort(([a,x],[b,y])=>x.correct*y.total-y.correct*x.total||y.total-x.total||a-b).slice(0,3);
      const review=!grade?'':`<section class="quiz-review"><h3>復習候補の章</h3>
        ${candidates.length?`<ul>${candidates.map(([chapter,{correct,total}])=>`<li><strong>${chapter}章　${esc(quizGrades[grade-1][1][chapter]||'')}</strong><br>${total}問中 ${correct}問正解（${percent(correct,total)}）</li>`).join('')}</ul>`:
          `<p>${answered?'今回の回答からは復習候補の章はありません。':'まだ回答がないため、復習候補を表示できません。'}</p>`}
        <p class="hint">今回回答した問題だけを集計した目安です。回答数が少ない章もあるため、苦手と断定するものではありません。</p></section>`;
      content.innerHTML=title+`<section class="quiz-summary"><h2>結果</h2><p class="quiz-accuracy">正答率　<strong>${answered?percent(score,answered):'—'}</strong></p>
        <p>回答 ${answered}問　正解 ${score}問　不正解 ${answered-score}問${grade?'':'　スキップ '+skipped+'問'}</p>
        <p class="hint">正答率は回答した問題が対象です。未回答 ${questions.length-answered-skipped}問。</p>${review}
        <div class="feature-links"><button type="button" class="primary" id="quizRetry">再度挑戦する</button><button type="button" class="secondary" id="quizRetryGrade">戻る</button></div></section>`;
      content.querySelector('#quizRetry').onclick=()=>start(questions);
      content.querySelector('#quizRetryGrade').onclick=chooseGrade;
    }
    function draw(){
      const item=questions[index];
      if(!item){result();return}
      content.innerHTML=title+`<p class="hint">${index+1} / ${questions.length} 問　${grade?item.grade+'級　'+item.chapter+'章':'オリジナル問題　'+item.chapter+'章'}${item.year?'　'+esc(item.year):''}</p><form class="quiz-form">
        <fieldset><legend>${grade?'':`<span class="quiz-level">${item.grade}級レベル（目安）</span>`}${esc(item.question)}</legend>${item.image?`<p><a href="${esc(item.image.startsWith('/quiz/')?'https://tenmonken-infoweb-2026.rt-earth616.chatgpt.site'+item.image:item.image)}" target="_blank" rel="noopener"><img src="${esc(item.image.startsWith('/quiz/')?'https://tenmonken-infoweb-2026.rt-earth616.chatgpt.site'+item.image:item.image)}" alt="問題の図版と選択肢（タップで拡大）" style="display:block;max-width:100%;height:auto"></a></p>`:''}${item.choices.map((choice,i)=>`<label><input type="radio" name="choice" value="${i}" required> <span>${esc(choice)}</span></label>`).join('')}</fieldset>
        <div class="feature-links"><button class="primary" type="submit">回答する</button>${grade?'':'<button type="button" class="secondary" id="quizSkip">スキップ</button>'}</div></form><div id="quizResult" role="status"></div><button type="button" class="secondary" id="quizNext" hidden>${index+1===questions.length?'結果を見る':'次の問題'}</button>
        <div class="feature-links quiz-actions"><button type="button" class="secondary" id="quizFinish">ここまでで終了する</button></div>`;
      const form=content.querySelector('form'),next=content.querySelector('#quizNext');
      const skip=content.querySelector('#quizSkip');
      function reveal(selection){
        const wasSkipped=selection===null;
        if(wasSkipped)skipped++;
        else answered++;
        if(skip)skip.hidden=true;
        const correct=!wasSkipped&&selection===item.answer;
        if(correct)score++;
        if(grade&&!wasSkipped){
          const stats=chapterResults.get(item.chapter)||{correct:0,total:0};
          stats.total++;
          if(correct)stats.correct++;
          chapterResults.set(item.chapter,stats);
        }
        form.querySelector('fieldset').disabled=true;
        form.querySelector('button').hidden=true;
        content.querySelector('#quizResult').innerHTML=`<p class="quiz-verdict ${wasSkipped?'':correct?'quiz-correct':'quiz-incorrect'}"><strong>${wasSkipped?'スキップ':correct?'○ 正解':'× 不正解'}</strong>　正解は ${esc(item.choices[item.answer])}</p>${item.explanation?`<p class="about-copy quiz-explanation"><strong>解説</strong><br>${esc(item.explanation)}</p>`:''}`;
        next.hidden=false;
      }
      if(skip)skip.onclick=()=>reveal(null);
      content.querySelector('#quizFinish').onclick=result;
      form.onsubmit=event=>{
        event.preventDefault();
        const selection=new FormData(form).get('choice');
        if(selection===null)return;
        reveal(Number(selection));
      };
      next.onclick=()=>{index++;draw()};
    }
    chooseGrade();
  }catch{content.innerHTML=title+'<p>問題を読み込めませんでした。時間をおいて再読み込みしてください。</p>'}
}
const inventoryPlaceOptions = `<option value="津田沼 部室">津田沼 部室</option>
          <option value="茜浜 部室">茜浜 部室</option>
          <option value="文化会倉庫">文化会倉庫</option>
          <option value="other">これ以外</option>`;
function inventoryPlaceValue(preset, custom){
  return preset.value==='other'?custom.value.trim():preset.value;
}
function inventoryPanel(manage=false){
  return `<section class="ops-card inventory-panel">
    <div class="ops-toolbar">
      ${manage?'<h2>登録済みの物品</h2>':'<h1 class="inventory-heading">物品管理</h1>'}
      <div class="inventory-options inventory-toolbar ${manage?'':'inventory-public-toolbar'}">
        <button type="button" id="inventoryOpenSearch" class="secondary" aria-haspopup="dialog">検索</button>
        ${manage?'<button type="button" id="inventoryAdd" class="primary" aria-haspopup="dialog">登録</button>':''}
      </div>
    </div>
    <p id="inventoryConditions" class="hint" hidden></p>
    <p id="inventoryStatus" role="status"></p><div id="inventoryRows" class="inventory-grid"></div>
    <dialog id="inventorySearchDialog" class="ops-card inventory-dialog" aria-labelledby="inventorySearchTitle">
      <h2 id="inventorySearchTitle">検索</h2>
      <form id="inventorySearchForm" method="dialog">
        <div class="field"><label for="inventorySearch">検索</label><input id="inventorySearch" type="search" placeholder="物品名や説明、タグで検索" autofocus></div>
        <div class="field"><label for="inventoryFilter">絞り込み</label><select id="inventoryFilter"><option value="">すべて</option><option value="equipment">備品</option><option value="high_value">高額物品</option><option value="donated">寄付</option><option value="gear">機材</option></select></div>
        <div class="field"><label for="inventoryTagFilter">タグ</label><select id="inventoryTagFilter"><option value="">すべてのタグ</option></select></div>
        <div class="field"><label for="inventoryWhereFilter">所在</label><select id="inventoryWhereFilter"><option value="">すべての所在</option>${inventoryPlaceOptions}</select></div>
        <div class="field"><label for="inventoryStateFilter">状態</label><select id="inventoryStateFilter"><option value="">すべての状態</option><option value="stored">収納済み</option><option value="out">持ち出し中</option><option value="unknown">未登録</option></select></div>
        <div class="inventory-options"><button class="primary" type="submit">検索</button><button class="secondary" id="inventoryClearSearch" type="button">条件をクリア</button><button class="secondary" id="inventoryCloseSearch" type="button">閉じる</button></div>
      </form>
    </dialog>
    ${manage?`<dialog id="inventoryEditDialog" class="ops-card inventory-dialog" aria-labelledby="inventoryFormTitle">
    <h2 id="inventoryFormTitle">登録</h2>
    <form id="inventoryForm">
      ${field('inventoryName','物品名（必須）','text','required maxlength="100" autofocus')}
      ${field('inventoryTags','タグ（任意）','text','maxlength="200" placeholder="例：望遠鏡、観測用" aria-describedby="inventoryTagHint"')}
      <div id="inventoryTagOptions" class="inventory-options inventory-tag-options" role="group" aria-label="登録済みのタグ"></div>
      <p class="hint" id="inventoryTagHint">複数のタグは「、」またはカンマで区切ります。</p>
      <div class="inventory-options">
        <label><input id="inventoryHighValue" type="checkbox"> 高額物品</label>
        <label><input id="inventoryDonated" type="checkbox"> 寄付</label>
        <label><input id="inventoryGear" type="checkbox"> 機材</label>
      </div>
      <div id="inventoryInitialFields">
        <div class="field"><label for="inventoryInitialPreset">所在（任意）</label><select id="inventoryInitialPreset"><option value="">未登録</option>${inventoryPlaceOptions}</select></div>
        <div id="inventoryInitialCustom" hidden>${field('inventoryInitialPlace','所在を入力','text','maxlength="120"')}</div>
        ${field('inventoryInitialStock','在庫（任意）','number','min="0" max="999999" step="1"')}
        <div class="field"><label for="inventoryInitialPhoto">写真（任意）</label><input id="inventoryInitialPhoto" type="file" accept="image/*"></div>
      </div>
      ${field('inventoryRegistrar','登録者名（任意）','text','maxlength="100"')}
      <div class="field"><label for="inventoryMemo">メモ（任意）</label><textarea id="inventoryMemo" maxlength="500"></textarea></div>
      <div class="inventory-options"><button class="primary" type="submit">保存</button><button class="secondary" id="inventoryCancel" type="button">キャンセル</button></div>
      <p id="inventoryEditStatus" role="status"></p>
    </form></dialog>`:''}
    <dialog id="inventoryDetailDialog" class="ops-card inventory-dialog inventory-detail" aria-labelledby="inventoryDetailTitle">
      <h2 id="inventoryDetailTitle"></h2>
      <div id="inventoryDetailBody"></div>
      <div class="inventory-options">
        <button type="button" id="inventoryDetailChange" class="primary">変更</button>
        ${manage?'<button type="button" id="inventoryDetailEdit" class="secondary">編集</button><button type="button" id="inventoryDetailRemove" class="secondary">削除</button>':''}
        <button type="button" id="inventoryCloseDetail" class="secondary">閉じる</button>
      </div>
      <p id="inventoryDetailStatus" role="status"></p>
    </dialog>
    <dialog id="inventoryLocationDialog" class="ops-card inventory-dialog" aria-labelledby="inventoryLocationTitle">
      <h2 id="inventoryLocationTitle">物品の状態を変更</h2>
      <form id="inventoryLocationForm">
        <div class="field"><label for="inventoryLocationItem">物品</label><input id="inventoryLocationItem" readonly></div>
        <p class="hint inventory-current" id="inventoryCurrentLocation"></p>
        <div class="field"><label for="inventoryOperation">操作</label><select id="inventoryOperation" required autofocus><option value="take">持ち出す</option><option value="putAway">収納する</option></select></div>
        <div class="field" id="inventoryStockSourceField" hidden><label for="inventoryStockSource">取り出す場所</label><select id="inventoryStockSource"></select></div>
        ${field('inventoryChangeDate','変更日','date','required')}
        <div id="inventoryQuantityField" hidden>${field('inventoryQuantityAmount','個数','number','max="999999" step="1" inputmode="numeric"')}</div>
        <div class="field" id="inventoryStorageChoices"><label for="inventoryStoragePreset">収納場所</label><select id="inventoryStoragePreset">
          <option value="" disabled selected>収納場所を選択</option>
${inventoryPlaceOptions}
        </select></div>
        <div id="inventoryLocationCustom" hidden>${field('inventoryLocationPlace','収納場所を入力','text','maxlength="120"')}</div>
        <div id="inventoryDestinationField" hidden>${field('inventoryDestination','持ち出し先','text','maxlength="120"')}</div>
        <div id="inventoryHolderField" hidden>${field('inventoryHolder','持ち出し者名','text','maxlength="80"')}</div>
        <div class="field">
          <span id="inventoryChangePhotoLabel">写真</span>
          <div class="inventory-options" role="group" aria-label="ファイルを選択">
            <button type="button" class="secondary" id="inventoryChoosePhoto">写真から選ぶ</button>
          </div>
          <input id="inventoryLibraryPhoto" type="file" accept="image/*" hidden>
          <p id="inventoryPhotoSelection" class="hint" role="status">写真が選択されていません。</p>
        </div>
        <div class="inventory-options"><button class="primary" type="submit">保存</button><button class="secondary" id="inventoryCloseLocation" type="button">キャンセル</button></div>
        <p id="inventoryLocationStatus" role="status"></p>
      </form>
    </dialog>
  </section>`;
}
function renderInventory(){
  document.title='物品管理 | ヘラクレス';
  document.getElementById('app').innerHTML=`<div class="shell">${siteHeader()}<main>${inventoryPanel()}</main></div>`;
  initInventory();
}
async function prepareInventoryPhoto(file){
  if (file.size > 20 * 1024 * 1024) throw new Error('20 MB以下の写真を選んでください。');
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    try { await image.decode(); }
    catch { throw new Error('写真を読み込めません。JPEGやPNGの写真を選んでください。'); }
    const scale = Math.min(1, 1280 / Math.max(image.naturalWidth,image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1,Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1,Math.round(image.naturalHeight * scale));
    canvas.getContext('2d',{alpha:false}).drawImage(image,0,0,canvas.width,canvas.height);
    const photo = await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',0.82));
    if (!photo || photo.size > 1024 * 1024) throw new Error('写真を圧縮できませんでした。別の写真を選んでください。');
    return photo;
  } finally { URL.revokeObjectURL(url); }
}
function initInventory(manage=false){
  const byId = id=>document.getElementById(id);
  const search = byId('inventorySearch'), filter = byId('inventoryFilter'), tagFilter = byId('inventoryTagFilter');
  const searchDialog = byId('inventorySearchDialog'), searchForm = byId('inventorySearchForm');
  const status = byId('inventoryStatus'), rows = byId('inventoryRows'), summary = byId('inventoryConditions');
  const form = byId('inventoryForm'), editDialog = byId('inventoryEditDialog'), editStatus = byId('inventoryEditStatus');
  const locationDialog = byId('inventoryLocationDialog'), locationForm = byId('inventoryLocationForm');
  const locationItem = byId('inventoryLocationItem'), destination=byId('inventoryDestination');
  const locationPlace = byId('inventoryLocationPlace'), locationStatus = byId('inventoryLocationStatus');
  const storagePreset = byId('inventoryStoragePreset');
  const storagePlaces = [...storagePreset.options].map(option=>option.value).filter(value=>value && value!=='other');
  const detailDialog = byId('inventoryDetailDialog'), whereFilter = byId('inventoryWhereFilter');
  let detailPhotoRequest, detailPhotoUrl;
  function releaseDetailPhoto(){
    detailPhotoRequest?.abort();
    detailPhotoRequest=undefined;
    if(detailPhotoUrl)URL.revokeObjectURL(detailPhotoUrl);
    detailPhotoUrl=undefined;
  }
  detailDialog.addEventListener('close',()=>{if(!detailDialog.open)releaseDetailPhoto();});
  const tagOptions = byId('inventoryTagOptions');
  const tagInput = byId('inventoryTags');
  const operation=byId('inventoryOperation'), quantityAmount=byId('inventoryQuantityAmount');
  const libraryPhoto=byId('inventoryLibraryPhoto');
  const photoSelection=byId('inventoryPhotoSelection');
  byId('inventoryChoosePhoto').onclick=()=>libraryPhoto.click();
  libraryPhoto.onchange=()=>{
    photoSelection.textContent=libraryPhoto.files[0]?.name || '写真が選択されていません。';
  };
  const stockSource=byId('inventoryStockSource');
  const changeDate=byId('inventoryChangeDate'), holder=byId('inventoryHolder');
  let items = null, editing = null, changing = null, busy = false, noticeTimer;
  let conditions = {query:'', category:'', tag:'', where:''};
  function announce(message, temporary=false){
    clearTimeout(noticeTimer);
    status.textContent=message;
    if (temporary) noticeTimer=setTimeout(()=>{status.textContent='';},3500);
  }
  const categories = {equipment:'備品',high_value:'高額物品',donated:'寄付',gear:'機材'};
  const normalize = text=>text.normalize('NFKC').toLocaleLowerCase('ja');
  const tagsOf = item=>(item.tags || '').split('、').filter(Boolean);
  function locationText(item){
    return '場所：'+(item.location || '未登録');
  }
  function stockLocations(item){
    return Object.entries(JSON.parse(item.stock_locations || '{}'));
  }
  function unassignedStock(item){
    return (item.stock ?? 0)-stockLocations(item).reduce((sum,[,count])=>sum+count,0);
  }
  function stockLocationLines(item){
    const lines=stockLocations(item).map(([place,count])=>place+'：'+count+'個');
    const unassigned=unassignedStock(item);
    if (unassigned>0) lines.push('収納場所未割当：'+unassigned+'個');
    return lines;
  }
  function prepareChange(item){
    locationItem.value=item?.name || '';
    byId('inventoryCurrentLocation').textContent=['現在',locationText(item),stockText(item),'持ち出し中：'+item.checked_out+'個',...stockLocationLines(item)].join('\n');
    const currentState=item.location_status==='out'?'out':'stored';
    const savedStorage=currentState==='stored'?item.location||'':'';
    const preset=storagePlaces.includes(savedStorage);
    storagePreset.value=preset?savedStorage:savedStorage?'other':'';
    locationPlace.value=preset?'':savedStorage;
    destination.value=currentState==='out'?item.location||'':'';
    const sources=stockLocations(item).map(([place,count])=>new Option(place+'（'+count+'個）',place));
    if (unassignedStock(item)>0) sources.push(new Option('収納場所未割当（'+unassignedStock(item)+'個）',''));
    stockSource.replaceChildren(...sources);
    operation.value=sources.length?'take':'putAway';
    updateLocationInputs();
  }
  function updateInitialPlace(){
    const custom=byId('inventoryInitialPreset').value==='other';
    byId('inventoryInitialCustom').hidden=!custom;
    byId('inventoryInitialPlace').required=custom;
  }
  function openEditor(item){
    if (busy) return;
    editing = item?.id ?? null;
    form.reset();
    editStatus.textContent='';
    byId('inventoryFormTitle').textContent=item?'物品を編集':'登録';
    byId('inventoryName').value=item?.name ?? '';
    tagInput.value=item?.tags ?? '';
    byId('inventoryHighValue').checked=Boolean(item?.high_value);
    byId('inventoryDonated').checked=Boolean(item?.donated);
    byId('inventoryGear').checked=Boolean(item?.gear);
    byId('inventoryInitialFields').hidden=Boolean(item);
    updateInitialPlace();
    byId('inventoryRegistrar').value=item?.registrar ?? '';
    byId('inventoryMemo').value=item?.description ?? '';
    editDialog.showModal();
  }
  function renderTags(item, parent){
    const tags = tagsOf(item);
    if (!tags.length) return;
    const list = document.createElement('span');
    list.className='inventory-tags';
    list.setAttribute('aria-label','タグ');
    for (const tag of tags) {
      const entry = document.createElement('span');
      entry.textContent=tag;
      list.append(entry);
    }
    parent.append(list);
  }
  function stockText(item){
    return item.stock == null ? '在庫：未登録' : '在庫：'+item.stock+'個';
  }
  function openDetails(item){
    byId('inventoryDetailTitle').textContent=item.name;
    const body = byId('inventoryDetailBody');
    const image = document.createElement('img');
    releaseDetailPhoto();
    image.alt=item.name+'の写真';
    image.decoding='async';
    const labels = document.createElement('p');
    labels.className='inventory-labels';
    labels.textContent=[item.high_value?'高額物品':'',item.donated?'寄付':'',item.gear?'機材':''].filter(Boolean).join('　') || '備品';
    const counts = document.createElement('p');
    counts.className='inventory-quantity-counts';
    counts.textContent=[
      locationText(item),
      stockText(item),
      '持ち出し中：'+item.checked_out+'個',
      '使用：'+item.total_used+'個',
      '返却：'+item.total_returned+'個'
    ].join('\n');
    body.replaceChildren(labels,counts);
    if(item.has_photo){
      const request=new AbortController();
      detailPhotoRequest=request;
      const photoStatus=document.createElement('p');
      photoStatus.className='hint';
      photoStatus.textContent='写真を読み込み中…';
      body.prepend(photoStatus);
      void (async()=>{
        try{
          const response=await pagesFetch(sitesOrigin+'/api/inventory/'+item.id+'/photo',{signal:request.signal});
          if(!response.ok)throw Error();
          const blob=await response.blob();
          if(request.signal.aborted||!photoStatus.isConnected)return;
          detailPhotoUrl=URL.createObjectURL(blob);
          image.src=detailPhotoUrl;
          photoStatus.replaceWith(image);
        }catch{
          if(!request.signal.aborted)photoStatus.textContent='写真を読み込めませんでした。';
        }
      })();
    }
    const locations=stockLocationLines(item);
    if (locations.length) {
      const breakdown=document.createElement('p');
      breakdown.className='inventory-quantity-counts';
      breakdown.textContent=['収納場所別の在庫',...locations].join('\n');
      body.append(breakdown);
    }
    if(item.changed_on||item.last_take_name){
      const change=document.createElement('p');
      change.className='inventory-quantity-counts';
      change.textContent=[
        item.changed_on?'変更日：'+displayDate(item.changed_on):'',
        manage&&item.last_take_name?'最新の持ち出し者名：'+item.last_take_name:''
      ].filter(Boolean).join('\n');
      body.append(change);
    }
    if (manage && item.registrar) {
      const registrar=document.createElement('p');
      registrar.textContent='登録者名：'+item.registrar;
      body.append(registrar);
    }
    renderTags(item,body);
    if (item.description) {
      const description = document.createElement('p');
      description.className='inventory-description';
      description.textContent=item.description;
      body.append(description);
    }
    byId('inventoryDetailChange').onclick=()=>{
      detailDialog.close();
      openLocation(item);
    };
    if (manage) {
      byId('inventoryDetailEdit').onclick=()=>{detailDialog.close();openEditor(item);};
      byId('inventoryDetailRemove').onclick=async()=>{
        if (busy || !confirm(item.name+'を削除しますか？')) return;
        busy=true;
        try {
          await api('inventory/'+item.id,'DELETE');
          if (detailDialog.open) detailDialog.close();
          await refresh('削除しました。');
        } catch(error) {
          if (detailDialog.open) byId('inventoryDetailStatus').textContent=error.message;
          else announce(error.message);
        } finally { busy=false; }
      };
    }
    byId('inventoryDetailStatus').textContent='';
    detailDialog.showModal();
  }
  function draw(){
    if (!items) return;
    const {query,category,tag,where} = conditions;
    const words = normalize(query).split(/\s+/).filter(Boolean);
    const filtered = items.filter(item=>{
      const matchesCategory = category==='equipment'
        ? !item.high_value && !item.donated && !item.gear
        : !category || Boolean(item[category]);
      const text = normalize([item.name,item.description,item.tags || ''].join(' '));
      const places=[item.location,...stockLocations(item).map(([place])=>place)].filter(Boolean);
      const matchesWhere=!where || (where==='other'?places.some(place=>!storagePlaces.includes(place)):places.includes(where.replace(/^place:/,'')));
      const matchesState=!conditions.state || (item.location_status || 'unknown')===conditions.state;
      return matchesCategory && matchesWhere && matchesState && (!tag || tagsOf(item).includes(tag)) && words.every(word=>text.includes(word));
    });
    summary.hidden=!(query || category || tag || where);
    summary.textContent=[categories[category],query,tag && 'タグ '+tag,conditions.state && [...byId('inventoryStateFilter').options].find(option=>option.value===conditions.state)?.text,where && [...whereFilter.options].find(option=>option.value===where)?.text,filtered.length+'件'].filter(Boolean).join('　');
    rows.replaceChildren();
    if (!filtered.length) {
      const empty = document.createElement('p');
      empty.textContent=items.length?'条件に一致する物品はありません。':'登録されている物品はありません。';
      rows.append(empty);
      return;
    }
    for (const item of filtered) {
      const card = document.createElement('article');
      card.className='ops-card inventory-item';
      const itemButton = document.createElement('button');
      itemButton.type='button';
      itemButton.className='inventory-item-summary';
      itemButton.setAttribute('aria-haspopup','dialog');
      itemButton.onclick=()=>openDetails(item);
      const title = document.createElement('strong');
      title.textContent=item.name;
      const place = document.createElement('span');
      place.className='inventory-location';
      place.textContent='場所：'+(item.location || '未登録');
      const tagLine = document.createElement('span');
      tagLine.className='inventory-item-tags';
      tagLine.innerHTML=lineIcon('procedures');
      renderTags(item,tagLine);
      const stock = document.createElement('span');
      stock.className='inventory-stock';
      stock.textContent=stockText(item);
      itemButton.append(title,place,tagLine,stock);
      const change = document.createElement('button');
      change.type='button';
      change.className='secondary inventory-item-change';
      change.textContent='変更';
      change.setAttribute('aria-label',item.name+'の状態を変更');
      change.setAttribute('aria-haspopup','dialog');
      change.onclick=()=>openLocation(item);
      card.append(itemButton,change);
      rows.append(card);
    }
  }
  async function refresh(message=''){
    try {
      items=await api('inventory');
      const tags=[...new Set(items.flatMap(tagsOf))].sort((a,b)=>a.localeCompare(b,'ja'));
      tagOptions?.replaceChildren();
      for (const tag of manage?tags:[]) {
        const button = document.createElement('button');
        button.type='button';
        button.className='secondary';
        button.textContent=tag;
        button.onclick=()=>{
          const entered = tagInput.value.split(/[,、，]/).map(value=>value.trim()).filter(Boolean);
          if (entered.includes(tag)) return;
          const next = [...entered,tag].join('、');
          if (next.length <= tagInput.maxLength) tagInput.value=next;
          else editStatus.textContent='タグは200字以内で入力してください。';
        };
        tagOptions.append(button);
      }
      const filterTags=conditions.tag && !tags.includes(conditions.tag)?[conditions.tag,...tags]:tags;
      tagFilter.replaceChildren(new Option('すべてのタグ',''),...filterTags.map(tag=>new Option(tag,tag)));
      const customPlaces=[...new Set(items.flatMap(item=>[item.location,...stockLocations(item).map(([place])=>place)]))].filter(place=>place && !storagePlaces.includes(place));
      whereFilter.querySelectorAll('[data-custom]').forEach(option=>option.remove());
      for(const place of customPlaces.sort((a,b)=>a.localeCompare(b,'ja'))){
        const option=new Option(place,'place:'+place);
        option.dataset.custom='';
        whereFilter.add(option);
      }
      draw();
      announce(message,Boolean(message));
    } catch(error) {
      announce([message,error.message].filter(Boolean).join(' '));
    }
  }
  byId('inventoryOpenSearch').onclick=()=>{
    search.value=conditions.query;
    filter.value=conditions.category;
    tagFilter.value=conditions.tag;
    whereFilter.value=conditions.where;
    byId('inventoryStateFilter').value=conditions.state || '';
    searchDialog.showModal();
  };
  byId('inventoryCloseSearch').onclick=()=>searchDialog.close();
  byId('inventoryClearSearch').onclick=()=>searchForm.reset();
  searchForm.onsubmit=event=>{
    event.preventDefault();
    conditions={query:search.value.trim(),category:filter.value,tag:tagFilter.value,where:whereFilter.value,state:byId('inventoryStateFilter').value};
    searchDialog.close();
    draw();
  };
  byId('inventoryCloseDetail').onclick=()=>detailDialog.close();
  function openLocation(item){
    if (busy) return;
    changing = item.id;
    locationStatus.textContent='';
    locationForm.reset();
    photoSelection.textContent='写真が選択されていません。';
    changeDate.value=jstDay(new Date());
    prepareChange(item);
    locationDialog.showModal();
  }
  function updateLocationInputs(){
    const taking=operation.value==='take';
    const fields=[
      ['inventoryStorageChoices',storagePreset,!taking],
      ['inventoryLocationCustom',locationPlace,!taking&&storagePreset.value==='other'],
      ['inventoryDestinationField',destination,taking],
      ['inventoryStockSourceField',stockSource,taking],
      ['inventoryHolderField',holder,taking]
    ];
    for(const [container,input,visible] of fields){
      byId(container).hidden=!visible;
      input.disabled=!visible;
      input.required=visible&&input!==destination&&input!==stockSource;
    }
    byId('inventoryQuantityField').hidden=false;
    quantityAmount.required=true;
    quantityAmount.min='1';
    byId('inventoryChangePhotoLabel').textContent=taking?'写真（任意）':'写真（必須）';
  }
  operation.onchange=updateLocationInputs;
  storagePreset.onchange=updateLocationInputs;
  byId('inventoryCloseLocation').onclick=()=>locationDialog.close();
  locationDialog.oncancel=event=>{if (busy) event.preventDefault();};
  locationForm.onsubmit=async event=>{
    event.preventDefault();
    if (busy) return;
    const item = items.find(item=>item.id===changing);
    const taking=operation.value==='take';
    const storagePlace=inventoryPlaceValue(storagePreset,locationPlace);
    if (!item || (!taking && !storagePlace) || (taking && stockSource.selectedIndex<0)) {
      locationStatus.textContent=taking?'持ち出せる在庫がありません。':'収納場所を入力してください。';
      return;
    }
    const file=libraryPhoto.files[0];
    if (!taking && !file) {
      locationStatus.textContent='収納時の写真を選んでください。';
      byId('inventoryChoosePhoto').focus();
      return;
    }
    const headers={
      'x-inventory-change-date':changeDate.value,
      'x-inventory-location-revision':String(item.location_revision),
      'x-inventory-operation':operation.value,
      'x-inventory-amount':quantityAmount.value,
      'x-inventory-stock-place':encodeURIComponent(taking?stockSource.value:storagePlace)
    };
    if(taking)headers['x-inventory-destination']=encodeURIComponent(destination.value.trim());
    if(!holder.disabled)headers['x-inventory-holder']=encodeURIComponent(holder.value.trim());
    busy=true;
    const controls=[...locationForm.elements];
    controls.forEach(control=>control.disabled=true);
    locationStatus.textContent='保存中…';
    try {
      const body=file?await prepareInventoryPhoto(file):null;
      const response=await pagesFetch('https://tenmonken-infoweb-2026.rt-earth616.chatgpt.site/api/inventory/'+item.id+'/quantity',{method:'PUT',headers,body});
      if (response.status===409) {
        await refresh();
        const current = items.find(current=>current.id===changing);
        if (current) prepareChange(current);
        else {
          locationDialog.close();
          announce('物品が見つかりませんでした。');
          return;
        }
      }
      if (!response.ok) throw new Error((await response.json()).error || '保存できませんでした。');
      locationDialog.close();
      await refresh(taking?'持ち出しを記録しました。':'収納を記録しました。');
    } catch(error) { locationStatus.textContent=error.message; }
    finally { busy=false; controls.forEach(control=>control.disabled=false); updateLocationInputs(); }
  };
  if (manage) {
    byId('inventoryInitialPreset').onchange=updateInitialPlace;
    byId('inventoryAdd').onclick=()=>openEditor();
    byId('inventoryCancel').onclick=()=>editDialog.close();
    editDialog.oncancel=event=>{if (busy) event.preventDefault();};
    form.onsubmit=async event=>{
      event.preventDefault();
      if (busy) return;
      const name=byId('inventoryName').value.trim();
      if (!name) {
        editStatus.textContent='物品名を入力してください。';
        byId('inventoryName').focus();
        return;
      }
      const headers={
        'x-inventory-name':encodeURIComponent(name),
        ...(!editing ? {
          'x-inventory-location':encodeURIComponent(inventoryPlaceValue(byId('inventoryInitialPreset'),byId('inventoryInitialPlace'))),
          'x-inventory-stock':byId('inventoryInitialStock').value
        } : {}),
        'x-inventory-gear':byId('inventoryGear').checked?'1':'0',
        'x-inventory-registrar':encodeURIComponent(byId('inventoryRegistrar').value),
        'x-inventory-description':encodeURIComponent(byId('inventoryMemo').value),
        'x-inventory-tags':encodeURIComponent(byId('inventoryTags').value),
        'x-inventory-high-value':byId('inventoryHighValue').checked?'1':'0',
        'x-inventory-donated':byId('inventoryDonated').checked?'1':'0'
      };
      busy=true;
      const controls=[...form.elements];
      controls.forEach(control=>control.disabled=true);
      editStatus.textContent='保存中…';
      try {
        const file=!editing && byId('inventoryInitialPhoto').files[0];
        const body=file?await prepareInventoryPhoto(file):null;
        const response=await pagesFetch('https://tenmonken-infoweb-2026.rt-earth616.chatgpt.site/api/inventory'+(editing?'/'+editing:''),{method:editing?'PUT':'POST',headers,body});
        if (!response.ok) throw new Error((await response.json()).error || '保存できませんでした。');
        editDialog.close();
        conditions={query:'',category:'',tag:'',where:''};
        await refresh('保存しました。');
      } catch(error) { editStatus.textContent=error.message; }
      finally { busy=false; controls.forEach(control=>control.disabled=false); }
    };
  }
  status.textContent='読み込み中…';
  refresh();
}

const recordWorlds=[
  ['太陽',0,'sun'],['水星',0.39,'mercury'],['金星',0.72,'venus'],['地球',1,'earth'],
  ['火星',1.52,'mars'],['ケレス',2.8,'ceres','準惑星'],['木星',5.2,'jupiter'],['土星',9.54,'saturn'],
  ['天王星',19.2,'uranus'],['海王星',30.06,'neptune'],
  ['冥王星',39,'pluto','準惑星'],['ハウメア',43,'haumea','準惑星'],
  ['アロコス',44.2,'arrokoth','太陽系外縁天体'],['マケマケ',46,'makemake','準惑星'],
  ['外縁の目安',55,'kuiper-edge'],['エリス',68,'eris','準惑星']
];
function recordsAdminPanel(){
  return `<section class="ops-card">
    <div class="ops-toolbar"><h2>登録済みの記録</h2><button id="recordOpen" type="button" class="primary" aria-haspopup="dialog">記録を登録</button></div>
    <div class="feature-links"><a href="/HERCULES/records" class="admin-link">年表を見る</a></div>
    <p id="recordListStatus" role="status"></p><div id="recordEditList"></div>
  </section><dialog id="recordDialog" class="ops-card edit-dialog records-edit-dialog" aria-labelledby="recordFormTitle"><h2 id="recordFormTitle">記録を登録</h2>
    <form id="recordForm">
      ${field('recordDate','日付','date','required autofocus')}
      ${field('recordCategory','分類','text','required maxlength="30" placeholder="観測会、研究発表など"')}
      ${field('recordTitle','タイトル','text','required maxlength="100"')}
      <div class="field"><label for="recordDetails">内容（任意）</label><textarea id="recordDetails" maxlength="1500"></textarea></div>
      <div class="field"><label for="recordActivityType">イベント種別（任意）</label><select id="recordActivityType">
        <option value="">未選択</option><option value="課外活動">課外活動</option><option value="対外活動">対外活動</option>
      </select></div>
      <div class="feature-links"><button class="primary" type="submit">保存</button><button id="recordCancel" type="button" class="secondary">キャンセル</button></div>
    </form><p id="recordStatus" role="status"></p>
  </dialog>`;
}
function initRecordsAdmin(){
  const get=id=>document.getElementById(id);
  const form=get('recordForm'), status=get('recordStatus'), list=get('recordEditList'), cancel=get('recordCancel');
  const date=get('recordDate'), category=get('recordCategory'), title=get('recordTitle'), details=get('recordDetails');
  const submit=form.querySelector('[type="submit"]');
  const dialog=get('recordDialog'), listStatus=get('recordListStatus'), activityType=get('recordActivityType');
  let editing=null;
  function reset(){
    editing=null;
    form.reset();
    date.value=jstDay(new Date());
    get('recordFormTitle').textContent='記録を登録';
    status.textContent='';
  }
  async function refresh(){
    const records=await api('records');
    list.innerHTML=records.length?records.map(record=>`<p><button class="secondary" type="button" data-record-id="${record.id}">編集</button> ${esc(displayDate(record.record_date))}　${esc(record.title)}</p>`).join(''):'<p>登録された記録はありません。</p>';
    for(const button of list.querySelectorAll('[data-record-id]')){
      button.onclick=()=>{
        const record=records.find(record=>record.id===Number(button.dataset.recordId));
        if (submit.disabled || !record) return;
        editing=record.id;
        date.value=record.record_date;
        category.value=record.category;
        title.value=record.title;
        details.value=record.details;
        activityType.value=record.activity_type || '';
        get('recordFormTitle').textContent='記録を編集';
        status.textContent='';
        dialog.showModal();
        title.focus();
      };
    }
  }
  get('recordOpen').onclick=()=>{reset();dialog.showModal();};
  cancel.onclick=()=>dialog.close();
  dialog.oncancel=event=>{if (submit.disabled) event.preventDefault();};
  form.onsubmit=async event=>{
    event.preventDefault();
    if (submit.disabled) return;
    submit.disabled=true;
    cancel.disabled=true;
    try {
      await api(editing?'records/'+editing:'records',editing?'PUT':'POST',{date:date.value,category:category.value,title:title.value,details:details.value,activityType:activityType.value});
      dialog.close();
      listStatus.textContent='保存しました。';
      try { await refresh(); }
      catch { listStatus.textContent='保存しました。一覧を更新するにはページを再読み込みしてください。'; }
    } catch(error) { status.textContent=error.message; }
    finally { submit.disabled=false;cancel.disabled=false; }
  };
  reset();
  refresh().catch(error=>{listStatus.textContent=error.message;});
}
function recordTimeline(records){
  const entries=records.map(record=>`<li class="record-row">
    <time datetime="${esc(record.record_date)}">${esc(displayDate(record.record_date))}</time>
    <span class="record-category">${esc(record.category)}</span>
    <div class="record-copy"><h3>${esc(record.title)}</h3>${record.activity_type?`<p class="record-activity-type">${esc(record.activity_type)}</p>`:''}${record.details?`<p>${esc(record.details)}</p>`:''}</div>
  </li>`).join('');
  const planetBands=recordWorlds.map(([name,distance,style,type],index)=>{
    const gap=index?distance-recordWorlds[index-1][1]:0;
    const isEdge=style==='kuiper-edge';
    return `<div class="record-band${isEdge?' record-kuiper-edge':''}" style="--orbit-gap:${Math.round(gap*26)}px">
      <div class="record-orbit">${isEdge?'':`<span class="record-planet record-${style}" aria-hidden="true"></span>`}<span>${name}</span><span class="record-au">${distance} au</span>${type?`<span class="record-object-type">${type}</span>`:''}</div>
    </div>`;
  });
  const beltStart=recordWorlds.findIndex(([, ,style])=>style==='pluto');
  const beltEnd=recordWorlds.findIndex(([, ,style])=>style==='kuiper-edge')+1;
  const planets=planetBands.slice(0,beltStart).join('')+
    `<section class="record-kuiper" aria-labelledby="recordKuiperTitle"><h2 class="record-kuiper-title" id="recordKuiperTitle">カイパーベルト<small>約30〜55 au</small></h2>${planetBands.slice(beltStart,beltEnd).join('')}</section>`+
    planetBands.slice(beltEnd).join('');
  return `<ol class="record-entries" aria-label="新しい順の記録">${entries}</ol><aside class="record-planets" aria-label="太陽系">${planets}</aside>`;
}
const externalServiceGroups=[
  ['天文研究部　公式ＳＮＳ',[
    ['天文研究部 X（@Cittenmon）','https://x.com/Cittenmon'],
    ['天文研究部 Instagram（@cit.tenmon207）','https://www.instagram.com/cit.tenmon207/']
  ]],
  ['大学・学生団体',[
    ['千葉工業大学','https://chibatech.ac.jp/'],
    ['千葉工業大学 学友会執行委員会','https://cit-gakuyu.com/'],
    ['千葉工業大学 文化会','https://sites.google.com/view/citbunka/%E3%83%9B%E3%83%BC%E3%83%A0'],
    ['千葉工業大学 クラブ・大学祭','https://chibatech.ac.jp/about/support/extra_activities/']
  ]],
  ['宇宙・天文ニュース',[
    ['アストロアーツ','https://www.astroarts.jp/'],
    ['国立天文台ニュース','https://www.nao.ac.jp/news/']
  ]],
  ['宇宙・研究機関',[
    ['JAXA　宇宙航空研究開発機構','https://www.jaxa.jp/','日本'],
    ['JAXA（ISAS）　宇宙航空研究開発機構 宇宙科学研究所','https://www.isas.jaxa.jp/','日本'],
    ['NAOJ　国立天文台','https://www.nao.ac.jp/','日本'],
    ['NICT　情報通信研究機構','https://www.nict.go.jp/','日本'],
    ['産総研　産業技術総合研究所','https://www.aist.go.jp/','日本'],
    ['NASA　アメリカ航空宇宙局','https://www.nasa.gov/','アメリカ合衆国'],
    ['ESA　欧州宇宙機関','https://www.esa.int/','欧州（加盟国による国際機関）'],
    ['ISRO　インド宇宙研究機関','https://www.isro.gov.in/','インド'],
    ['Roscosmos　宇宙活動国営企業ロスコスモス','https://www.roscosmos.ru/','ロシア'],
    ['DLR　ドイツ航空宇宙センター','https://www.dlr.de/en','ドイツ'],
    ['CSA　カナダ宇宙庁','https://www.asc-csa.gc.ca/eng/','カナダ'],
    ['ispace　株式会社ispace','https://www.ispace-inc.com/ja/company-jp/','日本'],
    ['国土交通省 宇宙庁（2028年 予定）',null,'日本'],
    ['CNSA　中国国家航天局',null,'中国']
  ]],
  ['天文の資格・検定',[
    ['天文宇宙検定　公式サイト','https://www.astro-test.org/'],
    ['星のソムリエ®　星野村講座','https://www.hoshinofurusato.jp/sommelier/']
  ]],
  ['論文・研究資料',[
    ['arXiv　天体物理学','https://arxiv.org/archive/astro-ph'],
    ['NASA SciX　文献検索','https://scixplorer.org/'],
    ['J-STAGE','https://www.jstage.jst.go.jp/browse/-char/ja']
  ]]
];
function renderExternalServices(){
  document.title='外部リンク | ヘラクレス';
  document.getElementById('app').innerHTML=`<div class="shell">${siteHeader()}<section class="chat-wrap guide-layout"><h1>外部リンク</h1>
    <div class="feature-stack">${externalServiceGroups.map(([category,links])=>`<details class="guide-section external-service">
      <summary>${esc(category)}</summary>
      <ul class="external-service-links">${links.map(([title,url,region])=>{
        const text=esc(title)+(region?'（'+esc(region)+'）':'');
        return `<li>${url?`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${text}</a>`:`<span>${text}</span>`}</li>`;
      }).join('')}</ul>
    </details>`).join('')}</div></section></div>`;
}
async function renderRecords(){
  document.title='実績・記録 | ヘラクレス';
  document.getElementById('app').innerHTML=`<div class="shell">${siteHeader()}<main class="records-space">
    <header class="records-heading"><p>千葉工業大学 文化会 天文研究部</p><h1>実績・記録</h1></header>
    <p id="recordsStatus" role="status">記録を読み込み中…</p><div class="records-track" id="recordsTrack"></div>
  </main></div>`;
  const status=document.getElementById('recordsStatus');
  try {
    const records=await api('records');
    status.textContent=records.length?'':'登録された記録はありません。';
    document.getElementById('recordsTrack').innerHTML=recordTimeline(records);
  } catch(error) {
    status.textContent=error.message;
  }
}

function renderComingSoon(title){
  document.title=title+' | ヘラクレス';
  document.getElementById('app').innerHTML=`<div class="shell coming-shell">${siteHeader()}<div class="coming-page"><img class="coming-sky" src="data:image/webp;base64,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" alt=""><main class="coming-content"><h1>${esc(title)}</h1><svg class="coming-wordmark" viewBox="0 0 330 69" role="img" aria-label="Coming Soon" lang="en"><path fill="none" stroke="currentColor" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round" d="M32 16C16 6 5 20 6 35s13 23 26 14 M61 38c0-10-5-15-12-14s-11 7-11 15 4 14 11 14 12-6 12-15Z M70 52l1-27m0 10c4-14 16-15 17 0v17m0-17c4-14 17-15 18 0l1 17 M118 26l-1 26m1-38v1 M130 52l1-27m0 10c5-15 19-15 19 0l1 17 M182 28c-13-11-24 0-23 12 1 15 15 16 23 4m0-17v23c0 13-10 18-21 13 M227 15c-15-9-26 2-22 11 3 7 20 7 22 16 3 13-15 15-25 8 M259 38c0-9-5-15-12-14s-12 7-12 15 5 14 12 14 12-6 12-15Z M289 38c0-10-6-15-12-14s-11 7-11 15 4 14 11 14 12-6 12-15Z M300 52l1-27m0 10c5-15 20-15 21 0l1 17"/></svg></main></div></div>`;
}
async function sendFeedback(e){e.preventDefault();let status=document.getElementById('feedbackStatus'),message=document.getElementById('feedbackMessage').value.trim();status.textContent='送信中…';try{let r=await pagesFetch('https://tenmonken-infoweb-2026.rt-earth616.chatgpt.site/api/feedback',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({category:document.getElementById('feedbackCategory').value,message})}),x=await r.json();if(!r.ok)throw Error(x.error||'送信できませんでした');document.getElementById('feedbackMessage').value='';status.textContent='送信しました。ありがとうございます。'}catch(err){status.textContent=err.message}}
async function renderFeedback(){document.title='意見箱 | ヘラクレス';document.getElementById('app').innerHTML=`<div class="shell">${siteHeader()}<main class="chat-wrap"><section class="feedback"><h1>意見箱</h1><p class="hint">ページへの要望や気づいた点を匿名で送れます。個人情報は入力しないでください。</p><form id="feedbackForm"><div class="field"><label for="feedbackCategory">カテゴリー</label><select id="feedbackCategory"><option>改善の提案</option><option>不具合の報告</option><option>掲載情報の修正</option><option>その他</option></select></div><div class="field"><span id="feedbackMessageHeading">意見内容（1,000字以内）</span><textarea id="feedbackMessage" aria-labelledby="feedbackMessageHeading" maxlength="1000" required></textarea></div><button class="primary" type="submit">意見を送る</button><span id="feedbackStatus" class="hint" aria-live="polite"></span></form></section></main></div>`;document.getElementById('feedbackForm').onsubmit=sendFeedback}
let nickname='';
async function renderChat(){
  document.title='チャット | ヘラクレス';
  document.getElementById('app').innerHTML=`<div class="shell">${siteHeader()}
    <main class="chat-wrap chat-page"><section class="ops-card" aria-label="チャット">
      <div id="chatList" class="chat-list" aria-live="polite"></div><form id="chatForm" class="chat-form"><textarea id="chatMessage" maxlength="500" placeholder="メッセージを入力（500字以内）" aria-label="メッセージ" required></textarea><button class="primary" disabled>送信</button></form><p id="chatStatus" class="hint" role="status"></p></section>
      <section class="ops-card nickname-settings" aria-label="ニックネーム設定"><div class="ops-toolbar"><p class="hint" id="nicknameStatus" role="status"></p><div class="chat-setting-actions"><button type="button" class="secondary" id="editNickname">ニックネームを設定</button>${isWebApp()?'<a class="admin-link" href="/HERCULES/guide#herculesNotifications">チャットの通知設定</a>':''}</div></div></section></main></div>`;
  const form=document.getElementById('chatForm'),submit=form.querySelector('button'),status=document.getElementById('nicknameStatus');
  try{nickname=(localStorage.getItem('hercules-nickname')||'').trim().slice(0,24)}catch{}
  const update=()=>{
    const ready=!!nickname;
    submit.disabled=!ready;
    status.textContent=ready?'表示名 '+nickname:'投稿するにはニックネームを設定してください。';
  };
  document.getElementById('editNickname').onclick=()=>openEditor('ニックネームを設定',
    field('nickname','ニックネーム','text','maxlength="24" required'),{nickname},form=>{
      const value=new FormData(form).get('nickname').trim();
      if(!value)throw Error('ニックネームを入力してください。');
      nickname=value;
      try{localStorage.setItem('hercules-nickname',nickname)}catch{}
      update();
    });
  form.onsubmit=sendChat;
  const input=document.getElementById('chatMessage');
  input.enterKeyHint='send';
  let composing=false;
  input.oncompositionstart=()=>{composing=true;};
  input.oncompositionend=()=>{composing=false;};
  input.onkeydown=event=>{
    if(event.key!=='Enter'||event.shiftKey||event.isComposing||composing||event.keyCode===229)return;
    event.preventDefault();
    if(!event.repeat&&!submit.disabled&&!chatSending)form.requestSubmit();
  };
  setupChatActions();
  update();
  await loadChat();
  setInterval(()=>{if(!document.hidden)loadChat()},3000);
}
const chatDeleteTokens=new Map();
const chatDeleteKey=id=>'hercules-chat-delete-'+id;
function chatDeleteToken(id){
  try{return localStorage.getItem(chatDeleteKey(id))||chatDeleteTokens.get(id)}catch{return chatDeleteTokens.get(id)}
}
function setupChatActions(){
  const box=document.getElementById('chatList');
  let press;
  function cancelPress(){
    if(!press)return;
    clearTimeout(press.timer);
    press=null;
    chatHolding=false;
  }
  function remove(id){
    void removeOwnChat(id);
  }
  box.onpointerdown=event=>{
    if(!event.isPrimary||event.button!==0||event.target.closest('button'))return;
    const message=event.target.closest('[data-own-chat]');
    if(!message)return;
    cancelPress();
    const {clientX:x,clientY:y,pointerId}=event;
    chatHolding=true;
    press={x,y,pointerId,timer:setTimeout(()=>{
      cancelPress();
      remove(Number(message.dataset.ownChat));
    },550)};
  };
  box.onpointermove=event=>{
    if(press?.pointerId===event.pointerId&&Math.hypot(event.clientX-press.x,event.clientY-press.y)>12)cancelPress();
  };
  for(const type of ['pointerup','pointercancel'])window.addEventListener(type,event=>{
    if(press?.pointerId===event.pointerId)cancelPress();
  });
  box.addEventListener('scroll',cancelPress,{passive:true});
  box.oncontextmenu=event=>{
    if(event.target.closest('[data-own-chat]'))event.preventDefault();
  };
  box.onclick=event=>{
    const button=event.target.closest('[data-chat-delete]');
    if(button)remove(Number(button.dataset.chatDelete));
  };
}
let chatRemoving=false;
async function removeOwnChat(id){
  const token=chatDeleteToken(id);
  if(chatRemoving||!token||!confirm('この投稿を削除しますか？'))return;
  const status=document.getElementById('chatStatus');
  chatRemoving=true;
  try{
    const response=await pagesFetch('https://tenmonken-infoweb-2026.rt-earth616.chatgpt.site/api/chat/'+id,{method:'DELETE',headers:{'x-chat-delete-token':token}});
    if(!response.ok)throw new Error((await response.json()).error||'削除できませんでした。');
    chatDeleteTokens.delete(id);
    try{localStorage.removeItem(chatDeleteKey(id))}catch{}
    status.textContent='削除しました。';
    if(document.activeElement?.dataset.chatDelete===String(id))document.getElementById('chatMessage').focus();
    await loadChat();
  }catch(error){status.textContent=error.message;}
  finally{chatRemoving=false;}
}
let chatLoading=false,chatHolding=false,chatSending=false,chatMarkup='';
async function loadChat(){
  const box=document.getElementById('chatList');
  if(!box||chatLoading)return;
  chatLoading=true;
  try{
    const response=await pagesFetch('https://tenmonken-infoweb-2026.rt-earth616.chatgpt.site/api/chat',{cache:'no-store'});
    if(!response.ok)throw new Error('Chat unavailable');
    const items=await response.json();
    const markup=items.length?items.map(message=>{
      const own=Boolean(chatDeleteToken(message.id));
      return `<div class="chat-msg"${own?` data-own-chat="${message.id}"`:''}><b>${esc(message.nickname||'名前なし')}</b><br>${esc(message.message)}<span class="chat-time">${displayTimestamp(message.created_at)}</span>${own?`<button class="secondary chat-delete-access" type="button" data-chat-delete="${message.id}">この投稿を削除</button>`:''}</div>`;
    }).join(''):'<p class="hint">まだ投稿はありません。最初のメッセージをどうぞ。</p>';
    if(chatHolding||box.contains(document.activeElement)||markup===chatMarkup)return;
    const nearBottom=box.scrollHeight-box.scrollTop-box.clientHeight<60;
    box.innerHTML=chatMarkup=markup;
    if(nearBottom)box.scrollTop=box.scrollHeight;
  }catch{
    if(!chatMarkup)box.innerHTML='<p class="hint">チャットを読み込めません。時間をおいて再読み込みしてください。</p>';
  }finally{chatLoading=false;}
}
async function sendChat(event){
  event.preventDefault();
  const status=document.getElementById('chatStatus'), input=document.getElementById('chatMessage');
  const original=input.value, message=original.trim();
  if(chatSending||!message||!nickname)return;
  chatSending=true;
  status.textContent='送信中…';
  try{
    const response=await pagesFetch('https://tenmonken-infoweb-2026.rt-earth616.chatgpt.site/api/chat',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({message,nickname})});
    const result=await response.json();
    if(!response.ok)throw new Error(result.error||'送信できませんでした。');
    if(Number.isSafeInteger(result.id)&&result.deleteToken){
      chatDeleteTokens.set(result.id,result.deleteToken);
      try{localStorage.setItem(chatDeleteKey(result.id),result.deleteToken)}catch{}
    }
    if(input.value===original)input.value='';
    status.textContent='送信しました。';
    await loadChat();
  }catch(error){status.textContent=error.message;}
  finally{chatSending=false;}
}
document.addEventListener('click',event=>{
  const button=event.target.closest('button[data-action]');
  if(!button)return;
  const action=button.dataset.action;
  if(action==='close-modal'){closeModal();return}
  if(action==='quiz-info'){openQuizInfo();return}
  if(action==='reload'){location.reload();return}
  const id=Number(button.dataset.record);
  if(!Number.isSafeInteger(id)||id<0)return;
  const handlers={editEvent,deleteCountdown,editProcedure,deleteProcedure,deleteChat,deleteFeedback,viewFeedback};
  if(Object.hasOwn(handlers,action))handlers[action](id,button);
});
document.addEventListener('change',event=>{
  const input=event.target.closest('input[data-pin-event]');
  if(input)pinCountdown(Number(input.dataset.pinEvent),input.checked);
});
(async()=>{if(document.documentElement.hasAttribute('data-meeting-offline')){renderOfflineMeeting();return;}const path=pagePath().replace(/\/$/,'');const section=path.slice(7);if(path==='/admin'||(path.startsWith('/admin/')&&Object.hasOwn(adminPages,section)))admin(path==='/admin'?'':section);else if(path==='/chat')renderChat();else if(path==='/ikenbako')renderFeedback();else if(path==='/calendar')renderCalendar();else if(path==='/planet-calendar')renderPlanetCalendar();else if(path==='/members')renderMembers();else if(path==='/procedures')renderProcedures();else if(path==='/space-quiz')renderQuiz();else if(path==='/guide'||path==='/guide/home-screen'||(path.startsWith('/guide/home-screen/')&&(Object.hasOwn(guideDevices,path.slice('/guide/home-screen/'.length))||Object.hasOwn(homeScreenGuides,path.slice('/guide/home-screen/'.length)))))renderGuide(path);else if(path==='/inventory')renderInventory();else if(path==='/photos')renderPhotos();else if(path==='/records')renderRecords();else if(path==='/external-services')renderExternalServices();else{
  const started=Date.now();
  render();
  void loadNews();
  void weather();
  const loaded=await (async()=>{
    try {
      const response=await pagesFetch('https://tenmonken-infoweb-2026.rt-earth616.chatgpt.site/api/home');
      if(!response.ok)throw Error('Homepage request failed');
      const snapshot=await response.json();
      if(Array.isArray(snapshot.countdowns))countdowns=snapshot.countdowns;
      if(snapshot.settings){data={...data,...snapshot.settings};if(!Array.isArray(snapshot.countdowns))await loadCountdowns();return true;}
    }catch{}
    const [settingsLoaded]=await Promise.all([loadSettings(),loadCountdowns()]);
    return settingsLoaded;
  })();
  updateHomeDetails();
  updateAnnouncementBadge();
  if(new URLSearchParams(location.search).get('notice')==='announcement')void openAnnouncement();
  if(isWebApp()&&loaded)saveObservation();
  if(new URLSearchParams(location.search).get('notice')==='meeting'){
    if(loaded)void show('meeting',started);
    else if(isWebApp())renderOfflineMeeting();
  }
}})();
setInterval(()=>{
  if(document.getElementById('countRows')){
    if(countdowns.some(event=>Boolean(event.expired)!==eventExpired(event)))loadCountdowns().then(drawCountdownAdmin);
  }else if(!document.getElementById('login')&&countdowns.some(eventExpired)){
    if(countdowns.some(event=>String(event.id)===document.getElementById('modal').dataset.eventId&&eventExpired(event)))closeModal();
    countdowns=countdowns.filter(event=>!eventExpired(event));
    if(document.getElementById('homeEvents'))updateHomeDetails();
  }
  document.querySelectorAll('[data-meeting-date]').forEach(node=>{node.textContent=meetingDisplay()});
  document.querySelectorAll('[data-meeting-status]').forEach(node=>{node.innerHTML=meetingBadge()});
},30000);
if(isWebApp()&&!document.documentElement.hasAttribute('data-meeting-offline'))void webAppWorker().catch(()=>{});
document.addEventListener('visibilitychange',()=>{
  if(!document.hidden&&document.getElementById('unreadNoticeCount'))void noticeCount('count-notices');
});
standaloneMode.addEventListener('change',()=>{
  const path=pagePath().replace(/\/$/,'');
  if(path==='/guide'||path.startsWith('/guide/home-screen'))renderGuide(path);
  if(isWebApp())void webAppWorker().catch(()=>{});
});
