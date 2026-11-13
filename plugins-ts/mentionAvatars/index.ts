const {
    observeDom,
    ui: { injectCss },
    util: { getFiber, reactFiberWalker, log },
    flux: { storesFlat, },
} = shelter;

const disposers: (() => void)[] = [];

export function onLoad() {
    disposers.push( // css are pulled from https://github.com/Equicord/Equicord/blob/main/src/plugins/mentionAvatars/styles.css & https://github.com/Equicord/Equicord/blob/main/src/plugins/mentionAvatars/index.tsx
        injectCss(`
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
    `)
    );

    disposers.push(
        observeDom('span.mention[class*="wrapper_"]:not([data-mention-styled])', (span) => {
            span.dataset.mentionStyled = "true";

            const fiber = getFiber(span);

            const userId = reactFiberWalker(fiber, "userId", true)?.pendingProps?.userId;
            const user = storesFlat.UserStore.getUser(userId);
            if (!user) return;
            const avatarUrl = user.getAvatarURL?.(undefined, 32)
                ?? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=32`;


            const avatar = document.createElement("img")

            avatar.classList.add("mention-avatars-icon")
            avatar.src = avatarUrl

            span.prepend(avatar)
        })
    );
}

export function onUnload() {
    for (const d of disposers.splice(0)) d();
}
