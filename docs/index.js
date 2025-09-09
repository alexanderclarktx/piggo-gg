// node_modules/@piggo-gg/lex/dist/src/Lex.js
var Lex = (props) => {
  let ready = false;
  const lex = {
    state: props.state,
    elements: [],
    keysDown: KeyBuffer(),
    append: (element, isChild = false) => {
      lex.elements.push(element);
      element.lex = lex;
      if (!isChild)
        document.body.appendChild(element.e);
      if (element.children) {
        for (const child of element.children) {
          element.e.appendChild(child.e);
          lex.append(child, true);
        }
      }
      return true;
    },
    remove: (element) => {
      const index = lex.elements.indexOf(element);
      if (index === -1)
        return false;
      lex.elements.splice(index, 1);
      if (element.e.parentElement)
        element.e.parentElement.removeChild(element.e);
      return true;
    }
  };
  const update = () => {
    requestAnimationFrame(update);
    if (!ready && document.body) {
      document.body.style.backgroundColor = props.backgroundColor ?? "black";
      document.body.style.overflowX = "hidden";
      document.body.style.overflowY = "hidden";
      if (props.elements) {
        for (const element of props.elements) {
          lex.append(element);
        }
      }
      ready = true;
    }
    for (const element of lex.elements) {
      element.update?.();
      if (element.children) {
        for (const child of element.children) {
          child.update?.();
        }
      }
      lex.keysDown.update();
    }
  };
  document.addEventListener("keydown", (event) => {
    if (document.hasFocus()) {
      let key = event.key.toLowerCase();
      if (!lex.keysDown.get(key)) {
        lex.keysDown.push({ key, hold: 0 });
      }
    }
  });
  document.addEventListener("keyup", (event) => {
    const key = event.key.toLowerCase();
    lex.keysDown.remove(key);
  });
  requestAnimationFrame(update);
  return lex;
};
// node_modules/@piggo-gg/lex/dist/src/KeyBuffer.js
var KeyBuffer = (b) => {
  let buffer = b ? [...b] : [];
  return {
    all: () => [...buffer],
    get: (key) => {
      return buffer.find((b2) => b2.key === key);
    },
    copy: () => KeyBuffer(buffer),
    clear: () => {
      buffer = [];
    },
    push: (km) => {
      if (!buffer.find((b2) => b2.key === km.key))
        return buffer.push(km);
    },
    remove: (key) => {
      buffer = buffer.filter((b2) => b2.key !== key);
    },
    update: () => {
      for (const b2 of buffer) {
        b2.hold += 1;
      }
    }
  };
};
// node_modules/@piggo-gg/lex/dist/src/LexElement.js
var LexElement = (tag, defaults) => (props) => {
  const element = document.createElement(tag);
  Object.assign(element.style, defaults);
  Object.assign(element.style, props.style);
  element.oncontextmenu = (e) => e.preventDefault();
  if (props.style?.touchAction === undefined) {
    element.ontouchstart = (e) => e.preventDefault();
    element.ontouchend = (e) => e.preventDefault();
    element.ontouchmove = (e) => e.preventDefault();
    element.ontouchcancel = (e) => e.preventDefault();
  }
  if (props.callbacks) {
    const { onPointerDown, onPointerOver, onPointerOut } = props.callbacks;
    if (onPointerDown)
      element.onpointerdown = onPointerDown;
    if (onPointerOver)
      element.onpointerover = onPointerOver;
    if (onPointerOut)
      element.onpointerout = onPointerOut;
  }
  return {
    lex: undefined,
    e: element,
    update: props.update,
    callbacks: props.callbacks,
    children: props.children ?? []
  };
};
var LexDiv = LexElement("div", {
  position: "absolute",
  scrollbarWidth: "none",
  msOverflowStyle: "none",
  outline: "none",
  touchAction: "none"
});
var LexCanvas = LexElement("canvas", {
  position: "absolute",
  outline: "none",
  touchAction: "none"
});
var LexImage = LexElement("img", {
  position: "absolute",
  outline: "none",
  touchAction: "none",
  userSelect: "none",
  pointerEvents: "none"
});
var LexAnchor = LexElement("a", {
  position: "absolute",
  outline: "none",
  touchAction: "none"
});
// web/src/index.ts
var Title = () => {
  const title = LexDiv({
    style: {
      fontFamily: "Courier New",
      fontSize: "38px",
      fontWeight: "bold",
      transform: "translate(-50%)",
      left: "50%"
    }
  });
  title.e.textContent = "Piggo";
  return title;
};
var Canvas = () => {
  const canvas = LexCanvas({
    style: {
      left: "50%",
      top: "48px",
      transform: "translate(-50%)",
      width: "98%",
      height: "91%"
    }
  });
  canvas.e.id = "canvas";
  return canvas;
};
var App = Lex({
  state: {},
  elements: [Title(), Canvas()],
  backgroundColor: "#191b1c"
});
