const {
  plugin: { scoped, store },
  util: { getFiber, reactFiberWalker },
} = shelter;

const USERNAME_QUERY = '[id^="message-username-"] > [class*="username_"]';

export function forceAddUsernames() {
  for (const e of document.querySelectorAll(USERNAME_QUERY)) {
    addUsername(e, true);
  }
}

function addUsername(e: Element, overwrite = false) {
  if (e.querySelector(".ioj4-su") && !overwrite) return;

  const props = reactFiberWalker(getFiber(e), "message", true)?.pendingProps;
  if (!props?.author || !props?.message) return;

  const { nick } = props.author;
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
  scoped.observeDom(USERNAME_QUERY, (e) => {
    queueMicrotask(() => {
      addUsername(e);
    });
  });
}
