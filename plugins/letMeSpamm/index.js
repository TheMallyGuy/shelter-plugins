const{plugin:{scoped:a}}=shelter;a.ui.injectCss(`
  [class*="layerContainer_"]:has([role="dialog"][aria-label*="TOO SPICY" i]) {
    display: none !important;
  }
`);
