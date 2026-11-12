const{plugin:{store:r},http:{intercept:O},ui:{SwitchItem:C,TextBox:L,Text:M,Divider:R}}=shelter;O("post",/\/channels\/\d+\/messages/,(t,e)=>(t.body.content=E(t.body.content),e(t)));const W=()=><>
        <C value={r.fixApostrophes}onChange={t=>{r.fixApostrophes=t}}>
            Fix Apostrophes
        </C>
        <C value={r.expandContractions}onChange={t=>{r.expandContractions=t}}>
            Expand Contractions
        </C>
        <C value={r.fixCapitalization}onChange={t=>{r.fixCapitalization=t}}>
            Fix Capitalization
        </C>
        <C value={r.fixPunctuation}onChange={t=>{r.fixPunctuation=t}}>
            Punctate sentences
        </C>
        <div style={{display:"flex","align-items":"center",gap:"8px"}}>
            <M style={{"white-space":"nowrap","flex-shrink":0}}>
                Punctuation Frequency
            </M>
            <L style={{flex:1}}value={r.fixPunctuationFrequency}onInput={t=>{r.fixPunctuationFrequency=t}}/>
        </div>

        <R/>
    </>;function E(t){let e=t;const o=/```[\s\S]*?```|`[\s\S]*?`/g,n=[];return e=e.replace(o,i=>(n.push(i),`__CODE_BLOCK_${n.length-1}__`)),(r.fixApostrophes||r.expandContractions)&&(e=F(e)),r.fixCapitalization&&(e=Z(e)),r.fixPunctuation&&Math.random()*100<r.fixPunctuationFrequency&&(e=D(e)),r.expandContractions&&(e=$(e)),e=e.replace(/__CODE_BLOCK_(\d+)__/g,(i,s)=>n[parseInt(s)]),e}const v={"wasn't":"was not","can't":"cannot","don't":"do not","won't":"will not","isn't":"is not","aren't":"are not","haven't":"have not","hasn't":"has not","hadn't":"had not","doesn't":"does not","didn't":"did not","shouldn't":"should not","wouldn't":"would not","couldn't":"could not","that's":"that is","what's":"what is","there's":"there is","how's":"how is","where's":"where is","when's":"when is","who's":"who is","why's":"why is","you'll":"you will","i'll":"I will","they'll":"they will","it'll":"it will","i'm":"I am","you're":"you are","they're":"they are","he's":"he is","she's":"she is","i've":"I have","you've":"you have","we've":"we have","they've":"they have","you'd":"you would","he'd":"he would","she'd":"she would","it'd":"it would","we'd":"we would","they'd":"they would","y'all":"you all","here's":"here is"},b={};for(const t in v){const e=B(t.toLowerCase());b[e]=t}function S(t){const e=[];for(const o of t)o.match(/[a-zA-Z]/)&&e.push(o===o.toUpperCase());return e}function P(t,e){let o="",n=0;for(let i=0;i<t.length;i++){const s=t[i];if(!s.match(/[a-zA-Z]/)){o+=s;continue}const a=e[n];o+=a?s.toUpperCase():s.toLowerCase(),n<e.length-1&&n++}return o}function F(t){const e=Object.keys(b);if(e.length===0)return t;const o=new RegExp(`\\b(${e.join("|")})\\b`,"gi");return t.replace(o,n=>{const i=n.toLowerCase();if(Object.prototype.hasOwnProperty.call(b,i)){const s=b[i];return P(s,S(n))}return n})}function $(t){const e=new RegExp(`\\b(${Object.keys(v).join("|")})\\b`,"gi");return t.replace(e,o=>{const n=o.toLowerCase();return Object.prototype.hasOwnProperty.call(v,n)?P(v[n],S(o)):o})}function B(t){return t.replace(/'/g,"")}function Z(t){const e=/((?<!\w\.\w.)(?<!\b[A-Z][a-z]\.)(?<![A-Z]\.)(?<!\.)(?<=[.?!])\s+|\n+)/,n=t.split(e).filter(s=>s!=null);let i="";for(let s=0;s<n.length;s++){const a=n[s];if(!e.test(a)){if(a){if(a.trim()===""){i+=a;continue}}else continue;const A=a.match(/^\s*([\w'-]+)/),U=A?A[1].toLowerCase():"";a.startsWith("http")?i+=a:i+=a.replace(/^(\s*)(\S)/,(T,_,I)=>_+I.toUpperCase())}else a&&(i+=a)}return i=i.replace(/\bi\b(?!\s+is\b)(?=['\s]|$)/g,"I"),i}function D(t){if(!t)return"";const e=t.split(`
`),o=[];for(let n=0;n<e.length;n++){const s=e[n].trimEnd(),a=/https?:\/\/\S+$|www\.\S+$/;if(!s)n<e.length-1&&o.push("");else{const m=s.slice(-1);if(/[A-Za-z0-9]/.test(m)&&!a.test(s)){o.push(s+".");continue}o.push(s)}}return o.join(`
`)}export{W as settings};
