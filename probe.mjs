import('./index.js').then(async m=>{
  const disposers=[];
  const ctx={
    logger:{info:(...a)=>console.log('INFO',...a),warn:(...a)=>console.log('WARN',...a),error:(...a)=>console.log('ERR',...a)},
    get:(n)=>{ if(n==='dshHomePath') return (s)=>'/tmp/sbtest/'+s; throw new Error('missing service '+n) },
    effect:(fn)=>{const d=fn();if(typeof d==='function')disposers.push(d);return d},
    on:(ev,fn)=>{console.log('ON',ev);return ()=>{}},
    llm:{stream:async function*(){yield {type:'finish',reason:{kind:'stop'}}}}
  };
  try{ m.apply(ctx, m.Config({})); console.log('APPLY OK') }catch(e){ console.log('APPLY THREW:', e && e.message); console.log(e && e.stack && e.stack.split('\n').slice(0,6).join('\n')) }
}).catch(e=>{console.log('IMPORT THREW:',e.message)})