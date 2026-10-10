export function feedInput(query:string,days:number){return `${days===14?14:1}|${query.trim()}`;}
