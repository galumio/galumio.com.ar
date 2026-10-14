import {loadCatalog,verifiedOffer} from './catalog.mjs';
// Comprobación HTTP opcional. No cambia la evidencia del propietario ni el catálogo.
const offers=loadCatalog().products.flatMap(p=>p.offers.filter(verifiedOffer).map(o=>({product:p.id,url:o.url})));
for(let i=0;i<offers.length;i+=4){
 const results=await Promise.all(offers.slice(i,i+4).map(async o=>{
  try{const r=await fetch(o.url,{method:'HEAD',redirect:'follow',signal:AbortSignal.timeout(15000)});return {...o,status:r.status,finalUrl:r.url};}
  catch(e){return {...o,status:null,error:e.cause?.code||e.name};}
 }));for(const result of results)console.log(JSON.stringify(result));
}
