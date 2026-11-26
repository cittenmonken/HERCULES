const offlineCache='hercules-pages-observation-v1';
const unreadCache='hercules-pages-notices-v1';
const offlinePage='/HERCULES/meeting-offline';
const unreadPath='/HERCULES/__hercules_unread__/';
const noticeId=/^[0-9a-f-]{36}$/;
let notificationWork=Promise.resolve();

self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(offlineCache);
    await cache.add(new Request(offlinePage,{cache:'reload',credentials:'omit'}));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));

self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(event.request.mode!=='navigate'||url.origin!==self.location.origin||
    !['/HERCULES/','/HERCULES/guide',offlinePage].includes(url.pathname))return;
  event.respondWith((async()=>{
    try{return await fetch(event.request);}
    catch{
      const cache=await caches.open(offlineCache);
      const saved=await cache.match(offlinePage);
      if(!saved)return Response.error();
      return new Response(saved.body,{headers:saved.headers});
    }
  })());
});

function updateUnread(work){
  const next=notificationWork.then(async()=>{
    const cache=await caches.open(unreadCache);
    await work(cache);
    const count=(await cache.keys()).length;
    try{
      if(count&&self.navigator.setAppBadge)await self.navigator.setAppBadge(count);
      if(!count&&self.navigator.clearAppBadge)await self.navigator.clearAppBadge();
    }catch{
      // Icon badges depend on the operating system and the user's settings.
    }
    return count;
  });
  notificationWork=next.catch(()=>{});
  return next;
}
self.addEventListener('push',event=>{
  let payload;
  try{payload=event.data?.json();}catch{}
  const id=noticeId.test(payload?.id)?payload.id:crypto.randomUUID();
  const notices={
    meeting:['観測会の情報が更新されました。','/HERCULES/?notice=meeting'],
    announcement:['運営からのお知らせが更新されました。','/HERCULES/?notice=meeting'],
    chat:['チャットに新しい投稿があります。','/HERCULES/chat'],
    inventory:['物品管理が更新されました。','/HERCULES/inventory'],
    members:['部員統計が更新されました。','/HERCULES/members'],
    records:['実績・記録が更新されました。','/HERCULES/records']
  };
  const [body,url]=Object.hasOwn(notices,payload?.kind)?notices[payload.kind]:notices.announcement;
  const received=Date.now();
  event.waitUntil((async()=>{
    await self.registration.showNotification('ヘラクレス',{
      body,icon:'/HERCULES/hercules-192.png',tag:id,data:{url}
    });
    await updateUnread(cache=>cache.put(unreadPath+id,new Response('',{headers:{'x-hercules-received':String(received)}})));
  })());
});
self.addEventListener('message',event=>{
  if(event.data?.type!=='read-notices'&&event.data?.type!=='count-notices')return;
  const port=event.ports[0];
  if(!port)return;
  event.waitUntil(updateUnread(async cache=>{
    if(event.data.type!=='read-notices')return;
    const readBefore=Number(event.data.readBefore);
    if(!Number.isFinite(readBefore))return;
    for(const request of await cache.keys()){
      const entry=await cache.match(request);
      if(Number(entry?.headers.get('x-hercules-received'))<=readBefore)await cache.delete(request);
    }
  }).then(count=>port.postMessage({count}),()=>port.postMessage({error:true})));
});
self.addEventListener('notificationclick',event=>{
  event.notification.close();
  event.waitUntil((async()=>{
    const url=new URL(event.notification.data?.url || '/HERCULES/?notice=meeting',self.location.origin).href;
    const windows=await self.clients.matchAll({type:'window'});
    const existing=windows.find(client=>client.url===url);
    if(existing){await existing.navigate(url);await existing.focus();}
    else await self.clients.openWindow(url);
  })());
});
