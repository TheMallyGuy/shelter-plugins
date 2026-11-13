var{observeDom:i,ui:{injectCss:d},util:{getFiber:c,reactFiberWalker:p,log:m},flux:{storesFlat:l}}=shelter,r=[];function u(){r.push(d(`
        .mention-avatars-icon {
            vertical-align: middle;
            width: 1em !important; /* insane discord sets width: 100% in channel topic */
            height: 1em !important;
            margin: 0 4px .2rem 2px;
            box-sizing: border-box;
            border-radius: 50%;
        }

        .mention-gp-owner .mention-avatars-icon {
            display: none;
        }
    `)),r.push(i('span.mention[class*="wrapper_"]:not([data-mention-styled])',e=>{e.dataset.mentionStyled="true";let o=c(e),s=p(o,"userId",!0)?.pendingProps?.userId,t=l.UserStore.getUser(s);if(!t)return;let a=t.getAvatarURL?.(void 0,32)??`https://cdn.discordapp.com/avatars/${t.id}/${t.avatar}.png?size=32`,n=document.createElement("img");n.classList.add("mention-avatars-icon"),n.src=a,e.prepend(n)}))}function g(){for(let e of r.splice(0))e()}export{u as onLoad,g as onUnload};
