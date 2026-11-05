const http = require('node:http');
const { URL } = require('node:url');
const PORT = process.env.PORT || 10000;
const ALLOWED_ORIGIN = 'https://mimfx-alpha-launchpads.onrender.com';
const server = http.createServer(async (req,res) => {
  const origin = req.headers.origin || '';
  if (origin === ALLOWED_ORIGIN) { res.setHeader('Access-Control-Allow-Origin', origin); res.setHeader('Vary','Origin'); }
  res.setHeader('Access-Control-Allow-Methods','GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  res.setHeader('Cache-Control','no-store');
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/health') { res.writeHead(200,{'Content-Type':'application/json'}); return res.end(JSON.stringify({ok:true,service:'alpha-pump-feed-proxy'})); }
  if (url.pathname !== '/api/pump/coins' || req.method !== 'GET') { res.writeHead(404); return res.end('Not found'); }
  const feed = url.searchParams.get('feed') === 'new' ? 'new' : 'trending';
  const sort = feed === 'new' ? 'created_timestamp' : 'last_trade_timestamp';
  const upstream = new URL('https://frontend-api-v3.pump.fun/coins');
  upstream.search = new URLSearchParams({offset:'0',limit:'50',sort,order:'DESC',includeNsfw:'false'}).toString();
  try {
    const response = await fetch(upstream, {headers:{'Accept':'application/json','User-Agent':'AlphaMemesLaunchpad/1.0'},signal:AbortSignal.timeout(12000)});
    const body = await response.text();
    if (!response.ok) { res.writeHead(response.status,{'Content-Type':'application/json'}); return res.end(JSON.stringify({error:'Pump.fun upstream returned HTTP '+response.status,detail:body.slice(0,300)})); }
    const rows = JSON.parse(body);
    if (!Array.isArray(rows)) throw new Error('Unexpected Pump.fun response shape');
    const seen = new Set();
    const coins = rows.filter(x=>x&&x.mint&&!x.hidden&&!x.nsfw&&!x.is_banned&&!seen.has(x.mint)&&seen.add(x.mint)).slice(0,40).map(x=>({mint:x.mint,name:x.name||'Solana token',symbol:x.symbol||'',image:x.image_uri||'',description:x.description||'',marketCap:Number(x.usd_market_cap||x.market_cap_usd||0),created:Number(x.created_timestamp||0),lastTrade:Number(x.last_trade_timestamp||0)}));
    res.writeHead(200,{'Content-Type':'application/json'});
    res.end(JSON.stringify({ok:true,feed,source:'Pump.fun',count:coins.length,coins,updatedAt:new Date().toISOString()}));
  } catch(error) {
    res.writeHead(502,{'Content-Type':'application/json'});
    res.end(JSON.stringify({ok:false,error:error.message||'Pump.fun feed unavailable'}));
  }
});
server.listen(PORT,'0.0.0.0',()=>console.log('Alpha Pump feed proxy listening on '+PORT));
