"use client";
import ArticlePhoto from './ArticlePhoto';
import type {Article} from '@/lib/editorial';
type Topic={id:string;name:string;days:number};
export default function PrintEdition({topics,feeds,date}:{topics:Topic[];feeds:Record<string,{articles:Article[];error?:string}>;date:string}){
  const selected=topics.filter(t=>(feeds[t.id]?.articles.length||0)>0);
  return <div className="print-edition" aria-hidden="true">
    <div className="print-flag"><i/><i/><i/></div>
    <div className="print-kicker">BRUXELLES · ROMA · UMBRIA — RASSEGNA PERSONALE</div>
    <h1>L’Agenda di Simona<span>!</span></h1>
    <div className="print-date"><span>{date}</span><span>EDIZIONE COMPLETA · {selected.reduce((n,t)=>n+(feeds[t.id]?.articles.length||0),0)} TITOLI</span></div>
    <div className="print-grid">{selected.map((t,i)=><section key={t.id} className={(i===0?'print-lead ':'')+(t.id==='squarta'?'print-squarta':'')}>
      <h2>{String(i+1).padStart(2,'0')} · {t.name}</h2>
      {t.id==='squarta'&&<div className="print-monitor">MARCO SQUARTA · MONITOR DEDICATO</div>}
      {(feeds[t.id]?.articles||[]).map(a=><article key={a.url}><ArticlePhoto image={a.image} topic={t.id} title={a.title}/><div className="print-source">{a.source} · {new Date(a.date).toLocaleDateString('it-IT',{day:'2-digit',month:'2-digit',timeZone:'Europe/Rome'})}</div><h3><a href={a.url}>{a.title}</a></h3>{!!a.related?.length&&<p className="print-related">Altre fonti: {a.related.map((r,i)=><span key={r.url}>{i>0?" · ":""}<a href={r.url}>{r.source}</a></span>)}</p>}</article>)}
      {!feeds[t.id]?.articles.length&&<p>{feeds[t.id]?.error?'Fonte momentaneamente non disponibile.':'Nessuna notizia disponibile.'}</p>}
    </section>)}</div>
    <div className="print-colophon">Tutte le notizie caricate degli interessi attivi. Fotografie associate agli articoli dalle rispettive fonti. I titoli nel PDF rimandano agli articoli originali.</div>
  </div>;
}
