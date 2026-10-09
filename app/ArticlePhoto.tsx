"use client";
import { useState } from 'react';
export default function ArticlePhoto({image,topic,title}:{image?:string;topic:string;title:string}) {
  const [failed,setFailed]=useState<string>();
  const [loaded,setLoaded]=useState<string>();
  if (!image || failed===image) return null;
  return <figure className={'article-thumb '+(loaded===image?'photo-ready':'photo-pending')}><img src={'/api/image?url='+encodeURIComponent(image)} alt={'Foto della fonte: '+title} loading="eager" onLoad={()=>setLoaded(image)} onError={()=>setFailed(image)}/></figure>;
}
