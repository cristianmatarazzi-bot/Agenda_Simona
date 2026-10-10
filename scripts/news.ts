export const dynamic = 'force-dynamic';
type Article={title:string;url:string;source:string;date:string;image?:string};
type Source={url:string;name:string};
const ansa=(section:string):Source=>({url:`https://www.ansa.it/sito/notizie/${section}/${section}_rss.xml`,name:'ANSA'});
const politics=ansa('politica'),tech={url:'https://www.ansa.it/canale_tecnologia/notizie/tecnologia_rss.xml',name:'ANSA Tecnologia'},culture=ansa('cultura');
const post={url:'https://www.ilpost.it/politica/feed/',name:'Il Post'};
const national:Source[]=[
 {url:'https://xml2.corriereobjects.it/rss/politica.xml',name:'Corriere della Sera'},
 {url:'https://www.repubblica.it/rss/politica/rss2.0.xml',name:'la Repubblica'},
 {url:'https://naxos.ilfoglio.it/api/v5/rss/stories/politica',name:'Il Foglio'},
 {url:'https://www.ilriformista.it/politica/feed/',name:'Il Riformista'},
 {url:'https://www.lastampa.it/rss/politica/rss2.0.xml',name:'La Stampa'},
 politics,post
];
const local:Source[]=[{url:'https://www.ansa.it/umbria/notizie/umbria_rss.xml',name:'ANSA Umbria'},{url:'https://www.umbria24.it/feed/',name:'Umbria24'}];
const wired={url:'https://www.hdblog.it/feed/',name:'HDblog'};
const ai={url:'https://www.punto-informatico.it/feed/',name:'Punto Informatico'};
const science={url:'https://www.ansa.it/canale_scienza_tecnica/notizie/scienzaetecnica_rss.xml',name:'ANSA Scienza'};
const europarl={url:'https://www.europarl.europa.eu/rss/doc/top-stories/en.xml',name:'Parlamento europeo'};
function decode(s:string){let out=s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1');for(let i=0;i<3;i++)out=out.replace(/&amp;/gi,'&').replace(/&#(x[0-9a-f]+|\d+);/gi,(_,n)=>{const v=/^x/i.test(n)?parseInt(n.slice(1),16):Number(n);return v<=0x10ffff?String.fromCodePoint(v):''}).replace(/&lt;/gi,'<').replace(/&gt;/gi,'>').replace(/&quot;/gi,'"').replace(/&apos;|&rsquo;|&lsquo;/gi,"'").replace(/&nbsp;/gi,' ').replace(/&ldquo;|&rdquo;/gi,'"').replace(/&ndash;/gi,'–').replace(/&mdash;/gi,'—').replace(/&hellip;/gi,'…');return out;}
function tag(s:string,t:string){return decode(s.match(new RegExp('<'+t+'(?:\\s[^>]*)?>([\\s\\S]*?)</'+t+'>','i'))?.[1]||'').trim()}
function imageFrom(item:string){
 const decoded=decode(item);
 const found=decoded.match(/<(?:media:content|media:thumbnail|enclosure|thumbimage|fullimage)\b[^>]*\burl=["']([^"']+)["']/i)?.[1]
  ||decoded.match(/<(?:media:content|media:thumbnail|enclosure)\b[^>]*\bhref=["']([^"']+)["']/i)?.[1]
  ||decoded.match(/<image\b[^>]*>\s*<url>([\s\S]*?)<\/url>/i)?.[1]
  ||decoded.match(/<img\b[^>]*\bsrc=["']([^"']+)["']/i)?.[1]
  ||decoded.match(/https:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp)(?:\?[^\s"'<>]*)?/i)?.[0];
 return found&&/^https:\/\//i.test(found)&&!/(?:logo|placeholder|default[_-]image|favicon)/i.test(found)?found:undefined;
}
function selection(q:string):{sources:Source[];match:(text:string)=>boolean}{
 const all=()=>true;
 if(/Marco Squarta/i.test(q))return {sources:[...national,...local,europarl],match:t=>/\bSquarta\b/i.test(t)};
 if(/Parlamento europeo|Unione europea|Bruxelles/i.test(q))return {sources:[europarl,...national],match:t=>/europarlament|parlamento europeo|unione europea|bruxelles|strasburgo|commissione europea|von der leyen|\bUe\b/i.test(t)};
 if(/retroscena/i.test(q))return {sources:national,match:t=>/retroscena|indiscrezion|partit|maggioranza|opposizion|coalizion|vertice|accordo|Meloni|Salvini|Schlein|Conte|Vannacci/i.test(t)};
 if(/sondagg/i.test(q))return {sources:national,match:t=>/sondagg|supermedia|youtrend|ipsos|swg|intenzioni di voto|rilevazion/i.test(t)};
 if(/umbria/i.test(q))return {sources:local,match:t=>/politic|giunta|consigli|region|sindac|comun|Proietti|Tesei|Squarta|sanità|assessor/i.test(t)};
 if(/Comune di Perugia/i.test(q))return {sources:local,match:t=>/Perugia/i.test(t)&&/politic|comun|sindac|giunta|consigli|amministrazion|assessor/i.test(t)};
 if(/\bInter\b/i.test(q))return {sources:[{url:'https://www.fcinternews.it/rss/',name:'FCInterNews'},{url:'https://www.ansa.it/sito/notizie/sport/calcio/calcio_rss.xml',name:'ANSA Calcio'}],match:t=>/\bInter\b|nerazzurr/i.test(t)};
 if(/intelligenza artificiale|\bAI\b/i.test(q))return {sources:[tech,ai,wired],match:t=>/intelligenza artificiale|\bAI\b|\bIA\b|OpenAI|ChatGPT|Anthropic|Claude|Gemini|modelli linguistici/i.test(t)};
 if(/tecnologia|smartphone|hi-tech/i.test(q))return {sources:[tech,wired],match:all};
 if(/curiosit|scoperte insolite/i.test(q))return {sources:[science,ansa('mondo')],match:t=>/scopert|curios|record|insolit|animali|spazio|scien|mister|rar[oa]|straordinar/i.test(t)};
 if(/cultura|mostre/i.test(q))return {sources:[culture],match:all};
 if(/politica italiana/i.test(q))return {sources:national,match:all};
 const terms=q.toLowerCase().match(/[\p{L}\p{N}]{3,}/gu)?.filter(w=>!['and','not','con','per','del','della','delle','gli','una','che'].includes(w))||[];
 return {sources:[politics,tech,culture,ansa('mondo'),wired],match:t=>terms.some(w=>t.toLowerCase().includes(w))};
}
const feedCache=new Map<string,{expires:number;value:Promise<string>}>();
async function boundedText(response:Response,limit=2000000){const reader=response.body?.getReader();if(!reader)return '';const decoder=new TextDecoder();let text='',size=0;try{while(size<limit){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;text+=decoder.decode(value,{stream:true});}}finally{await reader.cancel();}return text+decoder.decode();}
async function feedText(source:Source){const old=feedCache.get(source.url);if(old&&old.expires>Date.now())return old.value;const value=(async()=>{const r=await fetch(source.url,{signal:AbortSignal.timeout(8000),redirect:'follow',headers:{Accept:'application/rss+xml, application/xml, text/xml'}});if(!r.ok)throw Error(source.name+' HTTP '+r.status);return boundedText(r);})();if(feedCache.size>100)feedCache.clear();feedCache.set(source.url,{expires:Date.now()+180000,value});try{return await value;}catch(e){feedCache.delete(source.url);throw e;}}
async function readFeed(source:Source,days:number,match:(s:string)=>boolean=()=>true):Promise<Article[]>{
 const xml=await feedText(source);if(!/<rss[\s>]/i.test(xml))throw Error(source.name+' returned a non-RSS response');
 return [...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)].flatMap(m=>{const item=m[1],publisher=tag(item,'source')||source.name,raw=tag(item,'title'),date=Date.parse(tag(item,'pubDate')),url=tag(item,'link'),image=imageFrom(item);
 if(!raw||!/^https?:\/\//.test(url)||!Number.isFinite(date)||date<Date.now()-days*86400000||date>Date.now()+300000||!match(raw+' '+tag(item,'description')))return [];
 return [{title:raw.endsWith(' - '+publisher)?raw.slice(0,-publisher.length-3):raw,url,source:publisher,date:new Date(date).toISOString(),image}];});
}
const publishers=['ansa.it','corriere.it','repubblica.it','ilfoglio.it','ilgiornale.it','ilriformista.it','lastampa.it','ilpost.it','umbria24.it','europarl.europa.eu','hdblog.it','punto-informatico.it','fcinternews.it'];
function publisherUrl(value:string){try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&(!u.port||u.port==='443')&&publishers.some(h=>u.hostname===h||u.hostname.endsWith('.'+h));}catch{return false;}}
const photoCache=new Map<string,{expires:number;image?:string}>();
async function articleImage(article:Article){
 if(article.image||!publisherUrl(article.url))return article;
 const old=photoCache.get(article.url);if(old&&old.expires>Date.now())return {...article,image:old.image};
 let image:string|undefined;
 try{const r=await fetch(article.url,{redirect:'error',signal:AbortSignal.timeout(3500),headers:{Accept:'text/html'}});if(r.ok){const html=await boundedText(r,250000);for(const m of html.matchAll(/<meta\s+[^>]*>/gi)){const attrs=Object.fromEntries([...m[0].matchAll(/([\w:-]+)\s*=\s*["']([^"']*)["']/g)].map(a=>[a[1].toLowerCase(),decode(a[2])]));if(/^(og:image|twitter:image)$/i.test(attrs.property||attrs.name||'')&&attrs.content){const u=new URL(attrs.content,article.url);if(u.protocol==='https:'&&!/logo|placeholder|default[_-]image|favicon/i.test(u.pathname)){image=u.href;break;}}}}}catch{}
 if(photoCache.size>250)photoCache.clear();photoCache.set(article.url,{expires:Date.now()+900000,image});return {...article,image};
}
function diverse(articles:Article[]){const seen=new Set<string>(),groups=new Map<string,Article[]>();for(const a of articles.sort((a,b)=>Date.parse(b.date)-Date.parse(a.date))){const key=a.title.toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');if(seen.has(key))continue;seen.add(key);const source=a.source.toLowerCase();groups.set(source,[...(groups.get(source)||[]),a]);}const result:Article[]=[];while(result.length<30&&[...groups.values()].some(g=>g.length)){for(const g of groups.values()){const a=g.shift();if(a&&result.length<30)result.push(a);}}return result;}
export async function GET(req:Request){
 const p=new URL(req.url).searchParams,q=p.get('q')?.trim(),days=p.get('days')==='14'?14:1;
 if(!q||q.length>180)return Response.json({error:'Ricerca non valida',articles:[]},{status:400});
 const direct=selection(q);
 const search={name:'Google News',url:'https://news.google.com/rss/search?'+new URLSearchParams({q:q+' (site:corriere.it OR site:repubblica.it OR site:ilfoglio.it OR site:ilgiornale.it OR site:ilriformista.it OR site:lastampa.it) when:'+days+'d',hl:'it',gl:'IT',ceid:'IT:it'})};
 const targeted=['corriere.it','ilgiornale.it'].map(host=>({name:host,url:'https://news.google.com/rss/search?'+new URLSearchParams({q:q+' site:'+host+' when:'+days+'d',hl:'it',gl:'IT',ceid:'IT:it'})}));
 const sources=[...direct.sources,search,...targeted];
 const results=await Promise.allSettled(sources.map(s=>readFeed(s,days,direct.match)));
 let articles=results.flatMap(r=>r.status==='fulfilled'?r.value:[]);
 let available=results.some(r=>r.status==='fulfilled');
 // Search remains available for arbitrary interests, or when publisher feeds lack matches.
 if(!articles.length){try{articles=await readFeed({name:'Google News',url:'https://news.google.com/rss/search?'+new URLSearchParams({q:q+' when:'+days+'d',hl:'it',gl:'IT',ceid:'IT:it'})},days);available=true;}catch(e){console.warn('News search unavailable',String(e));}}
 for(let i=0;i<results.length;i++){const r=results[i];if(r.status==='rejected')console.warn('Publisher feed unavailable',sources[i].name,String(r.reason));}
 if(!available)return Response.json({articles:[],error:'Le fonti non sono disponibili in questo momento. Riprova tra poco.',fetchedAt:''},{status:502});
 articles=diverse(articles);
 const enriched=await Promise.all(articles.slice(0,6).map(articleImage));articles=[...enriched,...articles.slice(6)];
 const usedImages=new Set<string>();articles=articles.map(a=>{if(!a.image)return a;const key=a.image.split('?')[0];if(usedImages.has(key))return {...a,image:undefined};usedImages.add(key);return a;});
 return Response.json({articles,fetchedAt:new Date().toISOString()},{headers:{'Cache-Control':'private, max-age=120'}});
}
