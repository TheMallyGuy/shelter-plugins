// forked from https://github.com/ioj4/shelter-plugins/blob/master/plugins/show-username/index.jsx

const {
  plugin: { scoped, store },
  util: { getFiber, reactFiberWalker },
  flux: { storesFlat },
} = shelter;

const USERNAME_QUERY = '[id^="message-username-"] > [class*="username_"]';
// system messages ("X just boosted the server!" etc.)
const BOOSTERS_QUERY =
  '[id^="message-content-"] [class*="nameContainer_"] > [class*="username_"]';
const QUERY = `${USERNAME_QUERY}, ${BOOSTERS_QUERY}`;

function getNick(message: any): string | undefined {
  const guildId = (storesFlat.ChannelStore as any).getChannel(
    message.channel_id,
  )?.guild_id;
  const nick =
    guildId &&
    (storesFlat.GuildMemberStore as any).getNick(guildId, message.author.id);
  return nick ?? message.author.globalName ?? undefined;
}

export function forceAddUsernames() {
  for (const e of document.querySelectorAll(QUERY)) {
    addUsername(e, true);
  }
}

function addUsername(e: Element, overwrite = false) {
  if (e.querySelector(".ioj4-su") && !overwrite) return;

  const props = reactFiberWalker(getFiber(e), "message", true)?.pendingProps;
  if (!props?.message?.author) return;

  const nick = props.author?.nick ?? getNick(props.message);
  const { username } = props.message.author;

  // ?? 😭😭
  // const style =
  //   "font-weight: 600;border-radius: 4px;padding: 0 4px 0 0;background: var(--background-secondary);";

  // const usernameElement = (
  //   <span style={style} className={"ioj4-su"}>
  //     {username}
  //   </span>
  // );

  // no nickname: Discord already shows the username, leave it alone
  if (!nick || nick === username) return;

  const usernameElement = document.createElement("span");
  usernameElement.classList.add("show-username-shelter");
  usernameElement.classList.add("ioj4-su");
  usernameElement.textContent = `@${username}`;

  e.textContent = store.usernamesOnly ? `` : ` ${nick}`;
  e.prepend(usernameElement);
}

export function onLoad() {
  store.usernamesOnly ??= false;
  // apply on usernames that are already in the DOM
  forceAddUsernames();

  scoped.ui.injectCss(`
    .show-username-shelter {
      border-radius: 4px;
      padding: 0 4px;
      margin-right: 4px;
      opacity: 0.6;
      background: var(--background-base-lowest);
    }
    `);

  // using a long living observeDom here because awaiting dispatches is a bit slower and
  // adds excessive complexity for what it's worth
  scoped.observeDom(QUERY, (e) => {
    queueMicrotask(() => {
      addUsername(e);
    });
  });
}
