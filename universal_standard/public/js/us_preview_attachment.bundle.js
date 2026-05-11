(() => {
  // ../preview_attachment/preview_attachment/public/js/highlight/es/highlight.min.js
  function e(t2) {
    return t2 instanceof Map ? t2.clear = t2.delete = t2.set = () => {
      throw Error("map is read-only");
    } : t2 instanceof Set && (t2.add = t2.clear = t2.delete = () => {
      throw Error("set is read-only");
    }), Object.freeze(t2), Object.getOwnPropertyNames(t2).forEach((n2) => {
      const i2 = t2[n2], s2 = typeof i2;
      "object" !== s2 && "function" !== s2 || Object.isFrozen(i2) || e(i2);
    }), t2;
  }
  var t = class {
    constructor(e2) {
      void 0 === e2.data && (e2.data = {}), this.data = e2.data, this.isMatchIgnored = false;
    }
    ignoreMatch() {
      this.isMatchIgnored = true;
    }
  };
  function n(e2) {
    return e2.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
  }
  function i(e2, ...t2) {
    const n2 = /* @__PURE__ */ Object.create(null);
    for (const t3 in e2)
      n2[t3] = e2[t3];
    return t2.forEach((e3) => {
      for (const t3 in e3)
        n2[t3] = e3[t3];
    }), n2;
  }
  var s = (e2) => !!e2.scope;
  var r = class {
    constructor(e2, t2) {
      this.buffer = "", this.classPrefix = t2.classPrefix, e2.walk(this);
    }
    addText(e2) {
      this.buffer += n(e2);
    }
    openNode(e2) {
      if (!s(e2))
        return;
      const t2 = ((e3, { prefix: t3 }) => {
        if (e3.startsWith("language:"))
          return e3.replace("language:", "language-");
        if (e3.includes(".")) {
          const n2 = e3.split(".");
          return [`${t3}${n2.shift()}`, ...n2.map((e4, t4) => `${e4}${"_".repeat(t4 + 1)}`)].join(" ");
        }
        return `${t3}${e3}`;
      })(e2.scope, { prefix: this.classPrefix });
      this.span(t2);
    }
    closeNode(e2) {
      s(e2) && (this.buffer += "</span>");
    }
    value() {
      return this.buffer;
    }
    span(e2) {
      this.buffer += `<span class="${e2}">`;
    }
  };
  var o = (e2 = {}) => {
    const t2 = { children: [] };
    return Object.assign(t2, e2), t2;
  };
  var a = class {
    constructor() {
      this.rootNode = o(), this.stack = [this.rootNode];
    }
    get top() {
      return this.stack[this.stack.length - 1];
    }
    get root() {
      return this.rootNode;
    }
    add(e2) {
      this.top.children.push(e2);
    }
    openNode(e2) {
      const t2 = o({ scope: e2 });
      this.add(t2), this.stack.push(t2);
    }
    closeNode() {
      if (this.stack.length > 1)
        return this.stack.pop();
    }
    closeAllNodes() {
      for (; this.closeNode(); )
        ;
    }
    toJSON() {
      return JSON.stringify(this.rootNode, null, 4);
    }
    walk(e2) {
      return this.constructor._walk(e2, this.rootNode);
    }
    static _walk(e2, t2) {
      return "string" == typeof t2 ? e2.addText(t2) : t2.children && (e2.openNode(t2), t2.children.forEach((t3) => this._walk(e2, t3)), e2.closeNode(t2)), e2;
    }
    static _collapse(e2) {
      "string" != typeof e2 && e2.children && (e2.children.every((e3) => "string" == typeof e3) ? e2.children = [e2.children.join("")] : e2.children.forEach((e3) => {
        a._collapse(e3);
      }));
    }
  };
  var c = class extends a {
    constructor(e2) {
      super(), this.options = e2;
    }
    addText(e2) {
      "" !== e2 && this.add(e2);
    }
    startScope(e2) {
      this.openNode(e2);
    }
    endScope() {
      this.closeNode();
    }
    __addSublanguage(e2, t2) {
      const n2 = e2.root;
      t2 && (n2.scope = "language:" + t2), this.add(n2);
    }
    toHTML() {
      return new r(this, this.options).value();
    }
    finalize() {
      return this.closeAllNodes(), true;
    }
  };
  function l(e2) {
    return e2 ? "string" == typeof e2 ? e2 : e2.source : null;
  }
  function g(e2) {
    return h("(?=", e2, ")");
  }
  function u(e2) {
    return h("(?:", e2, ")*");
  }
  function d(e2) {
    return h("(?:", e2, ")?");
  }
  function h(...e2) {
    return e2.map((e3) => l(e3)).join("");
  }
  function f(...e2) {
    const t2 = ((e3) => {
      const t3 = e3[e3.length - 1];
      return "object" == typeof t3 && t3.constructor === Object ? (e3.splice(e3.length - 1, 1), t3) : {};
    })(e2);
    return "(" + (t2.capture ? "" : "?:") + e2.map((e3) => l(e3)).join("|") + ")";
  }
  function p(e2) {
    return RegExp(e2.toString() + "|").exec("").length - 1;
  }
  var b = /\[(?:[^\\\]]|\\.)*\]|\(\??|\\([1-9][0-9]*)|\\./;
  function m(e2, { joinWith: t2 }) {
    let n2 = 0;
    return e2.map((e3) => {
      n2 += 1;
      const t3 = n2;
      let i2 = l(e3), s2 = "";
      for (; i2.length > 0; ) {
        const e4 = b.exec(i2);
        if (!e4) {
          s2 += i2;
          break;
        }
        s2 += i2.substring(0, e4.index), i2 = i2.substring(e4.index + e4[0].length), "\\" === e4[0][0] && e4[1] ? s2 += "\\" + (Number(e4[1]) + t3) : (s2 += e4[0], "(" === e4[0] && n2++);
      }
      return s2;
    }).map((e3) => `(${e3})`).join(t2);
  }
  var E = "[a-zA-Z]\\w*";
  var x = "[a-zA-Z_]\\w*";
  var w = "\\b\\d+(\\.\\d+)?";
  var y = "(-?)(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)";
  var _ = "\\b(0b[01]+)";
  var O = {
    begin: "\\\\[\\s\\S]",
    relevance: 0
  };
  var k = {
    scope: "string",
    begin: "'",
    end: "'",
    illegal: "\\n",
    contains: [O]
  };
  var v = {
    scope: "string",
    begin: '"',
    end: '"',
    illegal: "\\n",
    contains: [O]
  };
  var N = (e2, t2, n2 = {}) => {
    const s2 = i({
      scope: "comment",
      begin: e2,
      end: t2,
      contains: []
    }, n2);
    s2.contains.push({
      scope: "doctag",
      begin: "[ ]*(?=(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):)",
      end: /(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):/,
      excludeBegin: true,
      relevance: 0
    });
    const r2 = f("I", "a", "is", "so", "us", "to", "at", "if", "in", "it", "on", /[A-Za-z]+['](d|ve|re|ll|t|s|n)/, /[A-Za-z]+[-][a-z]+/, /[A-Za-z][a-z]{2,}/);
    return s2.contains.push({ begin: h(/[ ]+/, "(", r2, /[.]?[:]?([.][ ]|[ ])/, "){3}") }), s2;
  };
  var S = N("//", "$");
  var M = N("/\\*", "\\*/");
  var R = N("#", "$");
  var A = Object.freeze({
    __proto__: null,
    APOS_STRING_MODE: k,
    BACKSLASH_ESCAPE: O,
    BINARY_NUMBER_MODE: {
      scope: "number",
      begin: _,
      relevance: 0
    },
    BINARY_NUMBER_RE: _,
    COMMENT: N,
    C_BLOCK_COMMENT_MODE: M,
    C_LINE_COMMENT_MODE: S,
    C_NUMBER_MODE: {
      scope: "number",
      begin: y,
      relevance: 0
    },
    C_NUMBER_RE: y,
    END_SAME_AS_BEGIN: (e2) => Object.assign(e2, {
      "on:begin": (e3, t2) => {
        t2.data._beginMatch = e3[1];
      },
      "on:end": (e3, t2) => {
        t2.data._beginMatch !== e3[1] && t2.ignoreMatch();
      }
    }),
    HASH_COMMENT_MODE: R,
    IDENT_RE: E,
    MATCH_NOTHING_RE: /\b\B/,
    METHOD_GUARD: { begin: "\\.\\s*" + x, relevance: 0 },
    NUMBER_MODE: { scope: "number", begin: w, relevance: 0 },
    NUMBER_RE: w,
    PHRASAL_WORDS_MODE: {
      begin: /\b(a|an|the|are|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such|will|you|your|they|like|more)\b/
    },
    QUOTE_STRING_MODE: v,
    REGEXP_MODE: {
      scope: "regexp",
      begin: /\/(?=[^/\n]*\/)/,
      end: /\/[gimuy]*/,
      contains: [O, { begin: /\[/, end: /\]/, relevance: 0, contains: [O] }]
    },
    RE_STARTERS_RE: "!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~",
    SHEBANG: (e2 = {}) => {
      const t2 = /^#![ ]*\//;
      return e2.binary && (e2.begin = h(t2, /.*\b/, e2.binary, /\b.*/)), i({
        scope: "meta",
        begin: t2,
        end: /$/,
        relevance: 0,
        "on:begin": (e3, t3) => {
          0 !== e3.index && t3.ignoreMatch();
        }
      }, e2);
    },
    TITLE_MODE: { scope: "title", begin: E, relevance: 0 },
    UNDERSCORE_IDENT_RE: x,
    UNDERSCORE_TITLE_MODE: { scope: "title", begin: x, relevance: 0 }
  });
  function j(e2, t2) {
    "." === e2.input[e2.index - 1] && t2.ignoreMatch();
  }
  function I(e2, t2) {
    void 0 !== e2.className && (e2.scope = e2.className, delete e2.className);
  }
  function T(e2, t2) {
    t2 && e2.beginKeywords && (e2.begin = "\\b(" + e2.beginKeywords.split(" ").join("|") + ")(?!\\.)(?=\\b|\\s)", e2.__beforeBegin = j, e2.keywords = e2.keywords || e2.beginKeywords, delete e2.beginKeywords, void 0 === e2.relevance && (e2.relevance = 0));
  }
  function L(e2, t2) {
    Array.isArray(e2.illegal) && (e2.illegal = f(...e2.illegal));
  }
  function B(e2, t2) {
    if (e2.match) {
      if (e2.begin || e2.end)
        throw Error("begin & end are not supported with match");
      e2.begin = e2.match, delete e2.match;
    }
  }
  function P(e2, t2) {
    void 0 === e2.relevance && (e2.relevance = 1);
  }
  var D = (e2, t2) => {
    if (!e2.beforeMatch)
      return;
    if (e2.starts)
      throw Error("beforeMatch cannot be used with starts");
    const n2 = Object.assign({}, e2);
    Object.keys(e2).forEach((t3) => {
      delete e2[t3];
    }), e2.keywords = n2.keywords, e2.begin = h(n2.beforeMatch, g(n2.begin)), e2.starts = {
      relevance: 0,
      contains: [Object.assign(n2, { endsParent: true })]
    }, e2.relevance = 0, delete n2.beforeMatch;
  };
  var H = ["of", "and", "for", "in", "not", "or", "if", "then", "parent", "list", "value"];
  var C = "keyword";
  function $2(e2, t2, n2 = C) {
    const i2 = /* @__PURE__ */ Object.create(null);
    return "string" == typeof e2 ? s2(n2, e2.split(" ")) : Array.isArray(e2) ? s2(n2, e2) : Object.keys(e2).forEach((n3) => {
      Object.assign(i2, $2(e2[n3], t2, n3));
    }), i2;
    function s2(e3, n3) {
      t2 && (n3 = n3.map((e4) => e4.toLowerCase())), n3.forEach((t3) => {
        const n4 = t3.split("|");
        i2[n4[0]] = [e3, U(n4[0], n4[1])];
      });
    }
  }
  function U(e2, t2) {
    return t2 ? Number(t2) : ((e3) => H.includes(e3.toLowerCase()))(e2) ? 0 : 1;
  }
  var z = {};
  var W = (e2) => {
    console.error(e2);
  };
  var X = (e2, ...t2) => {
    console.log("WARN: " + e2, ...t2);
  };
  var G = (e2, t2) => {
    z[`${e2}/${t2}`] || (console.log(`Deprecated as of ${e2}. ${t2}`), z[`${e2}/${t2}`] = true);
  };
  var K = Error();
  function F(e2, t2, { key: n2 }) {
    let i2 = 0;
    const s2 = e2[n2], r2 = {}, o2 = {};
    for (let e3 = 1; e3 <= t2.length; e3++)
      o2[e3 + i2] = s2[e3], r2[e3 + i2] = true, i2 += p(t2[e3 - 1]);
    e2[n2] = o2, e2[n2]._emit = r2, e2[n2]._multi = true;
  }
  function Z(e2) {
    ((e3) => {
      e3.scope && "object" == typeof e3.scope && null !== e3.scope && (e3.beginScope = e3.scope, delete e3.scope);
    })(e2), "string" == typeof e2.beginScope && (e2.beginScope = {
      _wrap: e2.beginScope
    }), "string" == typeof e2.endScope && (e2.endScope = {
      _wrap: e2.endScope
    }), ((e3) => {
      if (Array.isArray(e3.begin)) {
        if (e3.skip || e3.excludeBegin || e3.returnBegin)
          throw W("skip, excludeBegin, returnBegin not compatible with beginScope: {}"), K;
        if ("object" != typeof e3.beginScope || null === e3.beginScope)
          throw W("beginScope must be object"), K;
        F(e3, e3.begin, { key: "beginScope" }), e3.begin = m(e3.begin, { joinWith: "" });
      }
    })(e2), ((e3) => {
      if (Array.isArray(e3.end)) {
        if (e3.skip || e3.excludeEnd || e3.returnEnd)
          throw W("skip, excludeEnd, returnEnd not compatible with endScope: {}"), K;
        if ("object" != typeof e3.endScope || null === e3.endScope)
          throw W("endScope must be object"), K;
        F(e3, e3.end, { key: "endScope" }), e3.end = m(e3.end, { joinWith: "" });
      }
    })(e2);
  }
  function V(e2) {
    function t2(t3, n3) {
      return RegExp(l(t3), "m" + (e2.case_insensitive ? "i" : "") + (e2.unicodeRegex ? "u" : "") + (n3 ? "g" : ""));
    }
    class n2 {
      constructor() {
        this.matchIndexes = {}, this.regexes = [], this.matchAt = 1, this.position = 0;
      }
      addRule(e3, t3) {
        t3.position = this.position++, this.matchIndexes[this.matchAt] = t3, this.regexes.push([t3, e3]), this.matchAt += p(e3) + 1;
      }
      compile() {
        0 === this.regexes.length && (this.exec = () => null);
        const e3 = this.regexes.map((e4) => e4[1]);
        this.matcherRe = t2(m(e3, {
          joinWith: "|"
        }), true), this.lastIndex = 0;
      }
      exec(e3) {
        this.matcherRe.lastIndex = this.lastIndex;
        const t3 = this.matcherRe.exec(e3);
        if (!t3)
          return null;
        const n3 = t3.findIndex((e4, t4) => t4 > 0 && void 0 !== e4), i2 = this.matchIndexes[n3];
        return t3.splice(0, n3), Object.assign(t3, i2);
      }
    }
    class s2 {
      constructor() {
        this.rules = [], this.multiRegexes = [], this.count = 0, this.lastIndex = 0, this.regexIndex = 0;
      }
      getMatcher(e3) {
        if (this.multiRegexes[e3])
          return this.multiRegexes[e3];
        const t3 = new n2();
        return this.rules.slice(e3).forEach(([e4, n3]) => t3.addRule(e4, n3)), t3.compile(), this.multiRegexes[e3] = t3, t3;
      }
      resumingScanAtSamePosition() {
        return 0 !== this.regexIndex;
      }
      considerAll() {
        this.regexIndex = 0;
      }
      addRule(e3, t3) {
        this.rules.push([e3, t3]), "begin" === t3.type && this.count++;
      }
      exec(e3) {
        const t3 = this.getMatcher(this.regexIndex);
        t3.lastIndex = this.lastIndex;
        let n3 = t3.exec(e3);
        if (this.resumingScanAtSamePosition())
          if (n3 && n3.index === this.lastIndex)
            ;
          else {
            const t4 = this.getMatcher(0);
            t4.lastIndex = this.lastIndex + 1, n3 = t4.exec(e3);
          }
        return n3 && (this.regexIndex += n3.position + 1, this.regexIndex === this.count && this.considerAll()), n3;
      }
    }
    if (e2.compilerExtensions || (e2.compilerExtensions = []), e2.contains && e2.contains.includes("self"))
      throw Error("ERR: contains `self` is not supported at the top-level of a language.  See documentation.");
    return e2.classNameAliases = i(e2.classNameAliases || {}), function n3(r2, o2) {
      const a2 = r2;
      if (r2.isCompiled)
        return a2;
      [I, B, Z, D].forEach((e3) => e3(r2, o2)), e2.compilerExtensions.forEach((e3) => e3(r2, o2)), r2.__beforeBegin = null, [T, L, P].forEach((e3) => e3(r2, o2)), r2.isCompiled = true;
      let c2 = null;
      return "object" == typeof r2.keywords && r2.keywords.$pattern && (r2.keywords = Object.assign({}, r2.keywords), c2 = r2.keywords.$pattern, delete r2.keywords.$pattern), c2 = c2 || /\w+/, r2.keywords && (r2.keywords = $2(r2.keywords, e2.case_insensitive)), a2.keywordPatternRe = t2(c2, true), o2 && (r2.begin || (r2.begin = /\B|\b/), a2.beginRe = t2(a2.begin), r2.end || r2.endsWithParent || (r2.end = /\B|\b/), r2.end && (a2.endRe = t2(a2.end)), a2.terminatorEnd = l(a2.end) || "", r2.endsWithParent && o2.terminatorEnd && (a2.terminatorEnd += (r2.end ? "|" : "") + o2.terminatorEnd)), r2.illegal && (a2.illegalRe = t2(r2.illegal)), r2.contains || (r2.contains = []), r2.contains = [].concat(...r2.contains.map((e3) => ((e4) => (e4.variants && !e4.cachedVariants && (e4.cachedVariants = e4.variants.map((t3) => i(e4, {
        variants: null
      }, t3))), e4.cachedVariants ? e4.cachedVariants : q(e4) ? i(e4, {
        starts: e4.starts ? i(e4.starts) : null
      }) : Object.isFrozen(e4) ? i(e4) : e4))("self" === e3 ? r2 : e3))), r2.contains.forEach((e3) => {
        n3(e3, a2);
      }), r2.starts && n3(r2.starts, o2), a2.matcher = ((e3) => {
        const t3 = new s2();
        return e3.contains.forEach((e4) => t3.addRule(e4.begin, {
          rule: e4,
          type: "begin"
        })), e3.terminatorEnd && t3.addRule(e3.terminatorEnd, {
          type: "end"
        }), e3.illegal && t3.addRule(e3.illegal, { type: "illegal" }), t3;
      })(a2), a2;
    }(e2);
  }
  function q(e2) {
    return !!e2 && (e2.endsWithParent || q(e2.starts));
  }
  var J = class extends Error {
    constructor(e2, t2) {
      super(e2), this.name = "HTMLInjectionError", this.html = t2;
    }
  };
  var Y = n;
  var Q = i;
  var ee = Symbol("nomatch");
  var te = (n2) => {
    const i2 = /* @__PURE__ */ Object.create(null), s2 = /* @__PURE__ */ Object.create(null), r2 = [];
    let o2 = true;
    const a2 = "Could not find the language '{}', did you forget to load/include a language module?", l2 = {
      disableAutodetect: true,
      name: "Plain text",
      contains: []
    };
    let p2 = {
      ignoreUnescapedHTML: false,
      throwUnescapedHTML: false,
      noHighlightRe: /^(no-?highlight)$/i,
      languageDetectRe: /\blang(?:uage)?-([\w-]+)\b/i,
      classPrefix: "hljs-",
      cssSelector: "pre code",
      languages: null,
      __emitter: c
    };
    function b2(e2) {
      return p2.noHighlightRe.test(e2);
    }
    function m2(e2, t2, n3) {
      let i3 = "", s3 = "";
      "object" == typeof t2 ? (i3 = e2, n3 = t2.ignoreIllegals, s3 = t2.language) : (G("10.7.0", "highlight(lang, code, ...args) has been deprecated."), G("10.7.0", "Please use highlight(code, options) instead.\nhttps://github.com/highlightjs/highlight.js/issues/2277"), s3 = e2, i3 = t2), void 0 === n3 && (n3 = true);
      const r3 = { code: i3, language: s3 };
      N2("before:highlight", r3);
      const o3 = r3.result ? r3.result : E2(r3.language, r3.code, n3);
      return o3.code = r3.code, N2("after:highlight", o3), o3;
    }
    function E2(e2, n3, s3, r3) {
      const c2 = /* @__PURE__ */ Object.create(null);
      function l3() {
        if (!N3.keywords)
          return void M2.addText(R2);
        let e3 = 0;
        N3.keywordPatternRe.lastIndex = 0;
        let t2 = N3.keywordPatternRe.exec(R2), n4 = "";
        for (; t2; ) {
          n4 += R2.substring(e3, t2.index);
          const s4 = _3.case_insensitive ? t2[0].toLowerCase() : t2[0], r4 = (i3 = s4, N3.keywords[i3]);
          if (r4) {
            const [e4, i4] = r4;
            if (M2.addText(n4), n4 = "", c2[s4] = (c2[s4] || 0) + 1, c2[s4] <= 7 && (A2 += i4), e4.startsWith("_"))
              n4 += t2[0];
            else {
              const n5 = _3.classNameAliases[e4] || e4;
              u2(t2[0], n5);
            }
          } else
            n4 += t2[0];
          e3 = N3.keywordPatternRe.lastIndex, t2 = N3.keywordPatternRe.exec(R2);
        }
        var i3;
        n4 += R2.substring(e3), M2.addText(n4);
      }
      function g2() {
        null != N3.subLanguage ? (() => {
          if ("" === R2)
            return;
          let e3 = null;
          if ("string" == typeof N3.subLanguage) {
            if (!i2[N3.subLanguage])
              return void M2.addText(R2);
            e3 = E2(N3.subLanguage, R2, true, S2[N3.subLanguage]), S2[N3.subLanguage] = e3._top;
          } else
            e3 = x2(R2, N3.subLanguage.length ? N3.subLanguage : null);
          N3.relevance > 0 && (A2 += e3.relevance), M2.__addSublanguage(e3._emitter, e3.language);
        })() : l3(), R2 = "";
      }
      function u2(e3, t2) {
        "" !== e3 && (M2.startScope(t2), M2.addText(e3), M2.endScope());
      }
      function d2(e3, t2) {
        let n4 = 1;
        const i3 = t2.length - 1;
        for (; n4 <= i3; ) {
          if (!e3._emit[n4]) {
            n4++;
            continue;
          }
          const i4 = _3.classNameAliases[e3[n4]] || e3[n4], s4 = t2[n4];
          i4 ? u2(s4, i4) : (R2 = s4, l3(), R2 = ""), n4++;
        }
      }
      function h2(e3, t2) {
        return e3.scope && "string" == typeof e3.scope && M2.openNode(_3.classNameAliases[e3.scope] || e3.scope), e3.beginScope && (e3.beginScope._wrap ? (u2(R2, _3.classNameAliases[e3.beginScope._wrap] || e3.beginScope._wrap), R2 = "") : e3.beginScope._multi && (d2(e3.beginScope, t2), R2 = "")), N3 = Object.create(e3, { parent: {
          value: N3
        } }), N3;
      }
      function f2(e3, n4, i3) {
        let s4 = ((e4, t2) => {
          const n5 = e4 && e4.exec(t2);
          return n5 && 0 === n5.index;
        })(e3.endRe, i3);
        if (s4) {
          if (e3["on:end"]) {
            const i4 = new t(e3);
            e3["on:end"](n4, i4), i4.isMatchIgnored && (s4 = false);
          }
          if (s4) {
            for (; e3.endsParent && e3.parent; )
              e3 = e3.parent;
            return e3;
          }
        }
        if (e3.endsWithParent)
          return f2(e3.parent, n4, i3);
      }
      function b3(e3) {
        return 0 === N3.matcher.regexIndex ? (R2 += e3[0], 1) : (T2 = true, 0);
      }
      function m3(e3) {
        const t2 = e3[0], i3 = n3.substring(e3.index), s4 = f2(N3, e3, i3);
        if (!s4)
          return ee;
        const r4 = N3;
        N3.endScope && N3.endScope._wrap ? (g2(), u2(t2, N3.endScope._wrap)) : N3.endScope && N3.endScope._multi ? (g2(), d2(N3.endScope, e3)) : r4.skip ? R2 += t2 : (r4.returnEnd || r4.excludeEnd || (R2 += t2), g2(), r4.excludeEnd && (R2 = t2));
        do {
          N3.scope && M2.closeNode(), N3.skip || N3.subLanguage || (A2 += N3.relevance), N3 = N3.parent;
        } while (N3 !== s4.parent);
        return s4.starts && h2(s4.starts, e3), r4.returnEnd ? 0 : t2.length;
      }
      let w3 = {};
      function y3(i3, r4) {
        const a3 = r4 && r4[0];
        if (R2 += i3, null == a3)
          return g2(), 0;
        if ("begin" === w3.type && "end" === r4.type && w3.index === r4.index && "" === a3) {
          if (R2 += n3.slice(r4.index, r4.index + 1), !o2) {
            const t2 = Error(`0 width match regex (${e2})`);
            throw t2.languageName = e2, t2.badRule = w3.rule, t2;
          }
          return 1;
        }
        if (w3 = r4, "begin" === r4.type)
          return ((e3) => {
            const n4 = e3[0], i4 = e3.rule, s4 = new t(i4), r5 = [i4.__beforeBegin, i4["on:begin"]];
            for (const t2 of r5)
              if (t2 && (t2(e3, s4), s4.isMatchIgnored))
                return b3(n4);
            return i4.skip ? R2 += n4 : (i4.excludeBegin && (R2 += n4), g2(), i4.returnBegin || i4.excludeBegin || (R2 = n4)), h2(i4, e3), i4.returnBegin ? 0 : n4.length;
          })(r4);
        if ("illegal" === r4.type && !s3) {
          const e3 = Error('Illegal lexeme "' + a3 + '" for mode "' + (N3.scope || "<unnamed>") + '"');
          throw e3.mode = N3, e3;
        }
        if ("end" === r4.type) {
          const e3 = m3(r4);
          if (e3 !== ee)
            return e3;
        }
        if ("illegal" === r4.type && "" === a3)
          return 1;
        if (I2 > 1e5 && I2 > 3 * r4.index)
          throw Error("potential infinite loop, way more iterations than matches");
        return R2 += a3, a3.length;
      }
      const _3 = O2(e2);
      if (!_3)
        throw W(a2.replace("{}", e2)), Error('Unknown language: "' + e2 + '"');
      const k3 = V(_3);
      let v3 = "", N3 = r3 || k3;
      const S2 = {}, M2 = new p2.__emitter(p2);
      (() => {
        const e3 = [];
        for (let t2 = N3; t2 !== _3; t2 = t2.parent)
          t2.scope && e3.unshift(t2.scope);
        e3.forEach((e4) => M2.openNode(e4));
      })();
      let R2 = "", A2 = 0, j2 = 0, I2 = 0, T2 = false;
      try {
        if (_3.__emitTokens)
          _3.__emitTokens(n3, M2);
        else {
          for (N3.matcher.considerAll(); ; ) {
            I2++, T2 ? T2 = false : N3.matcher.considerAll(), N3.matcher.lastIndex = j2;
            const e3 = N3.matcher.exec(n3);
            if (!e3)
              break;
            const t2 = y3(n3.substring(j2, e3.index), e3);
            j2 = e3.index + t2;
          }
          y3(n3.substring(j2));
        }
        return M2.finalize(), v3 = M2.toHTML(), {
          language: e2,
          value: v3,
          relevance: A2,
          illegal: false,
          _emitter: M2,
          _top: N3
        };
      } catch (t2) {
        if (t2.message && t2.message.includes("Illegal"))
          return {
            language: e2,
            value: Y(n3),
            illegal: true,
            relevance: 0,
            _illegalBy: {
              message: t2.message,
              index: j2,
              context: n3.slice(j2 - 100, j2 + 100),
              mode: t2.mode,
              resultSoFar: v3
            },
            _emitter: M2
          };
        if (o2)
          return {
            language: e2,
            value: Y(n3),
            illegal: false,
            relevance: 0,
            errorRaised: t2,
            _emitter: M2,
            _top: N3
          };
        throw t2;
      }
    }
    function x2(e2, t2) {
      t2 = t2 || p2.languages || Object.keys(i2);
      const n3 = ((e3) => {
        const t3 = { value: Y(e3), illegal: false, relevance: 0, _top: l2, _emitter: new p2.__emitter(p2) };
        return t3._emitter.addText(e3), t3;
      })(e2), s3 = t2.filter(O2).filter(v2).map((t3) => E2(t3, e2, false));
      s3.unshift(n3);
      const r3 = s3.sort((e3, t3) => {
        if (e3.relevance !== t3.relevance)
          return t3.relevance - e3.relevance;
        if (e3.language && t3.language) {
          if (O2(e3.language).supersetOf === t3.language)
            return 1;
          if (O2(t3.language).supersetOf === e3.language)
            return -1;
        }
        return 0;
      }), [o3, a3] = r3, c2 = o3;
      return c2.secondBest = a3, c2;
    }
    function w2(e2) {
      let t2 = null;
      const n3 = ((e3) => {
        let t3 = e3.className + " ";
        t3 += e3.parentNode ? e3.parentNode.className : "";
        const n4 = p2.languageDetectRe.exec(t3);
        if (n4) {
          const t4 = O2(n4[1]);
          return t4 || (X(a2.replace("{}", n4[1])), X("Falling back to no-highlight mode for this block.", e3)), t4 ? n4[1] : "no-highlight";
        }
        return t3.split(/\s+/).find((e4) => b2(e4) || O2(e4));
      })(e2);
      if (b2(n3))
        return;
      if (N2("before:highlightElement", {
        el: e2,
        language: n3
      }), e2.dataset.highlighted)
        return void console.log("Element previously highlighted. To highlight again, first unset `dataset.highlighted`.", e2);
      if (e2.children.length > 0 && (p2.ignoreUnescapedHTML || (console.warn("One of your code blocks includes unescaped HTML. This is a potentially serious security risk."), console.warn("https://github.com/highlightjs/highlight.js/wiki/security"), console.warn("The element with unescaped HTML:"), console.warn(e2)), p2.throwUnescapedHTML))
        throw new J("One of your code blocks includes unescaped HTML.", e2.innerHTML);
      t2 = e2;
      const i3 = t2.textContent, r3 = n3 ? m2(i3, { language: n3, ignoreIllegals: true }) : x2(i3);
      e2.innerHTML = r3.value, e2.dataset.highlighted = "yes", ((e3, t3, n4) => {
        const i4 = t3 && s2[t3] || n4;
        e3.classList.add("hljs"), e3.classList.add("language-" + i4);
      })(e2, n3, r3.language), e2.result = {
        language: r3.language,
        re: r3.relevance,
        relevance: r3.relevance
      }, r3.secondBest && (e2.secondBest = {
        language: r3.secondBest.language,
        relevance: r3.secondBest.relevance
      }), N2("after:highlightElement", { el: e2, result: r3, text: i3 });
    }
    let y2 = false;
    function _2() {
      "loading" !== document.readyState ? document.querySelectorAll(p2.cssSelector).forEach(w2) : y2 = true;
    }
    function O2(e2) {
      return e2 = (e2 || "").toLowerCase(), i2[e2] || i2[s2[e2]];
    }
    function k2(e2, { languageName: t2 }) {
      "string" == typeof e2 && (e2 = [e2]), e2.forEach((e3) => {
        s2[e3.toLowerCase()] = t2;
      });
    }
    function v2(e2) {
      const t2 = O2(e2);
      return t2 && !t2.disableAutodetect;
    }
    function N2(e2, t2) {
      const n3 = e2;
      r2.forEach((e3) => {
        e3[n3] && e3[n3](t2);
      });
    }
    "undefined" != typeof window && window.addEventListener && window.addEventListener("DOMContentLoaded", () => {
      y2 && _2();
    }, false), Object.assign(n2, {
      highlight: m2,
      highlightAuto: x2,
      highlightAll: _2,
      highlightElement: w2,
      highlightBlock: (e2) => (G("10.7.0", "highlightBlock will be removed entirely in v12.0"), G("10.7.0", "Please use highlightElement now."), w2(e2)),
      configure: (e2) => {
        p2 = Q(p2, e2);
      },
      initHighlighting: () => {
        _2(), G("10.6.0", "initHighlighting() deprecated.  Use highlightAll() now.");
      },
      initHighlightingOnLoad: () => {
        _2(), G("10.6.0", "initHighlightingOnLoad() deprecated.  Use highlightAll() now.");
      },
      registerLanguage: (e2, t2) => {
        let s3 = null;
        try {
          s3 = t2(n2);
        } catch (t3) {
          if (W("Language definition for '{}' could not be registered.".replace("{}", e2)), !o2)
            throw t3;
          W(t3), s3 = l2;
        }
        s3.name || (s3.name = e2), i2[e2] = s3, s3.rawDefinition = t2.bind(null, n2), s3.aliases && k2(s3.aliases, {
          languageName: e2
        });
      },
      unregisterLanguage: (e2) => {
        delete i2[e2];
        for (const t2 of Object.keys(s2))
          s2[t2] === e2 && delete s2[t2];
      },
      listLanguages: () => Object.keys(i2),
      getLanguage: O2,
      registerAliases: k2,
      autoDetection: v2,
      inherit: Q,
      addPlugin: (e2) => {
        ((e3) => {
          e3["before:highlightBlock"] && !e3["before:highlightElement"] && (e3["before:highlightElement"] = (t2) => {
            e3["before:highlightBlock"](Object.assign({ block: t2.el }, t2));
          }), e3["after:highlightBlock"] && !e3["after:highlightElement"] && (e3["after:highlightElement"] = (t2) => {
            e3["after:highlightBlock"](Object.assign({ block: t2.el }, t2));
          });
        })(e2), r2.push(e2);
      },
      removePlugin: (e2) => {
        const t2 = r2.indexOf(e2);
        -1 !== t2 && r2.splice(t2, 1);
      }
    }), n2.debugMode = () => {
      o2 = false;
    }, n2.safeMode = () => {
      o2 = true;
    }, n2.versionString = "11.10.0", n2.regex = {
      concat: h,
      lookahead: g,
      either: f,
      optional: d,
      anyNumberOfTimes: u
    };
    for (const t2 in A)
      "object" == typeof A[t2] && e(A[t2]);
    return Object.assign(n2, A), n2;
  };
  var ne = te({});
  ne.newInstance = () => te({});

  // ../preview_attachment/preview_attachment/public/js/attachment.js
  frappe.provide("frappe.ui.form");
  frappe.ui.form.Attachments = class Attachments extends frappe.ui.form.Attachments {
    constructor(...args) {
      super(...args);
    }
    make() {
      super.make();
      this.add_attachment_wrapper = this.parent.find(".attachments-actions");
    }
    add_attachment(attachment) {
      super.add_attachment(attachment);
      const file_name = attachment.file_name;
      const file_url = this.get_file_url(attachment);
      const attachment_row = this.add_attachment_wrapper.next().find(`a[href="${file_url}"]`).closest(".attachment-row");
      if (attachment_row.length) {
        const preview_button = `
                <button class="btn btn-xs btn-secondary preview-btn"
                    data-file-url="${file_url}"
                    title="Preview ${frappe.utils.escape_html(file_name)}"
                    style="margin-left: 0px;">
                    <i class="octicon octicon-eye-unwatch"></i>
                </button>`;
        attachment_row.find(".data-pill").prepend(preview_button);
        attachment_row.find(`.preview-btn[data-file-url="${file_url}"]`).on("click", () => {
          this.preview_attachment(file_url, file_name);
        });
      }
    }
    preview_attachment(file_url, file_name) {
      let me = this;
      const dialog = new frappe.ui.Dialog({
        title: `Preview: ${file_name}`,
        size: "large",
        fields: [{ fieldtype: "HTML", fieldname: "preview_area" }],
        primary_action_label: __("Close"),
        primary_action() {
          me.action_to_close_remove_modal(dialog);
        }
      });
      const file_extension = file_url.split(".").pop().toLowerCase();
      const preview_area = dialog.fields_dict.preview_area.$wrapper;
      if (["jpg", "jpeg", "png", "gif"].includes(file_extension)) {
        preview_area.html(`<img src="${file_url}" class="preview-content" style="width: 100%; height: 100%;">`);
      } else if (file_extension === "pdf") {
        preview_area.html(`
                <iframe src="${file_url}"
                    class="resizable-preview"
                    style="width: 100%; height: 700px; border: none;">
                </iframe>
            `);
      } else if (["txt", "xml"].includes(file_extension)) {
        fetch(file_url).then((response) => response.text()).then((data) => {
          const language = file_extension === "xml" ? "xml" : "plaintext";
          preview_area.html(`
                        <pre style='height: 100%; width:100%'><code class="hljs ${language}">${frappe.utils.escape_html(data)}</code></pre>
                    `);
          ne.highlightAll();
        }).catch((error) => {
          preview_area.html(`<p>Failed to load the file content. ${error}</p>`);
        });
      } else if (file_extension === "json") {
        let syntaxHighlight = function(json) {
          json = JSON.stringify(json, void 0, 4);
          return json.replace(
            /("(\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"(:)?|\b(true|false|null)\b|\b-?\d+(\.\d*)?([eE][+-]?\d+)?\b)/g,
            function(match) {
              let cls = "number";
              if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                  cls = "key";
                } else {
                  cls = "string";
                }
              } else if (/true|false/.test(match)) {
                cls = "boolean";
              } else if (/null/.test(match)) {
                cls = "null";
              }
              return `<span class="${cls}">${match}</span>`;
            }
          );
        };
        fetch(file_url).then((response) => response.json()).then((data) => {
          const formattedJson = JSON.stringify(data, null, 4);
          preview_area.html(`
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <strong style="font-size: 16px;">JSON Preview</strong>
                            <button class="btn btn-primary btn-sm copy-json-btn" style="font-size: 14px; padding: 5px 10px;">Copy</button>
                        </div>
                        <pre class="json-preview-content">${syntaxHighlight(data)}</pre>
                    `);
          preview_area.find(".copy-json-btn").on("click", () => {
            const tempTextArea = $("<textarea>").css({ position: "absolute", left: "-9999px" }).val(formattedJson).appendTo("body");
            tempTextArea.select();
            document.execCommand("copy");
            tempTextArea.remove();
            frappe.msgprint(__("JSON copied to clipboard!"));
          });
        }).catch((error) => {
          preview_area.html(`<p>Failed to load JSON content. ${error}</p>`);
        });
      } else if (["mp4", "avi", "mov", "webm"].includes(file_extension)) {
        preview_area.html(`
                <video controls class="preview-content" style="width: 100%; height: 100%;">
                    <source src="${file_url}" type="video/${file_extension}">
                    Your browser does not support the video tag.
                </video>
            `);
      } else if (file_extension === "mp3") {
        preview_area.html(`
                <audio controls class="preview-content" style="width: 100%;">
                    <source src="${file_url}" type="audio/mpeg">
                    Your browser does not support the audio tag.
                </audio>
            `);
      } else if (file_url.includes("google.com")) {
        preview_area.html(`
                <iframe src="${file_url}?embedded=true" class="google-docs-preview" style="width: 100%; height: 100%; border: none;" allowfullscreen></iframe>
            `);
      } else {
        preview_area.html("<p>Preview not supported for this file type.</p>");
      }
      dialog.show();
      this.enable_resizable_dialog(dialog);
      this.additional_actions(dialog);
    }
    enable_resizable_dialog(dialog) {
      const dialog_wrapper = dialog.$wrapper;
      const modal_body = dialog_wrapper.find(".modal-body");
      const iframe = modal_body.find(".google-docs-preview");
      const modal_content = dialog_wrapper.find(".modal-content");
      modal_content.css({
        resize: "both",
        overflow: "auto"
      });
      modal_body.on("mousemove mouseup", function() {
        const bodyWidth = modal_body.width();
        const bodyHeight = modal_body.height();
        iframe.css({
          width: `${bodyWidth}px`,
          height: `${bodyHeight}px`
        });
      });
      this.dialog_draggable(dialog);
    }
    dialog_draggable(dialog) {
      const dialog_wrapper = dialog.$wrapper;
      const modal_content = dialog_wrapper.find(".modal-content");
      const modal_header = modal_content.find(".modal-header");
      modal_content.css({
        position: "absolute"
      });
      let isDragging = false;
      let startX, startY, startLeft, startTop;
      modal_header.css({
        cursor: "move"
      });
      modal_header.on("mousedown", (e2) => {
        isDragging = true;
        startX = e2.clientX;
        startY = e2.clientY;
        startLeft = modal_content.offset().left;
        startTop = modal_content.offset().top;
        modal_content.css("z-index", 1050);
      });
      $(document).on("mousemove", (e2) => {
        if (isDragging) {
          const dx = e2.clientX - startX;
          const dy = e2.clientY - startY;
          modal_content.css({
            left: startLeft + dx + "px",
            top: startTop + dy + "px"
          });
        }
      });
      $(document).on("mouseup", () => {
        isDragging = false;
      });
    }
    additional_actions(dialog) {
      dialog.get_close_btn().on("click", () => {
        this.action_to_close_remove_modal(dialog);
      });
    }
    action_to_close_remove_modal(dialog) {
      const dialog_wrapper = dialog.$wrapper;
      dialog.hide();
      dialog_wrapper.find("audio, video").each(function() {
        this.pause();
        this.currentTime = 0;
      });
      dialog_wrapper.find("iframe").each(function() {
        const src = $(this).attr("src");
        $(this).attr("src", "");
        $(this).attr("src", src);
      });
      dialog.$wrapper.remove();
      $(".modal-backdrop").remove();
    }
  };
})();
/*!
  Highlight.js v11.10.0 (git: 366a8bd012)
  (c) 2006-2024 Josh Goebel <hello@joshgoebel.com> and other contributors
  License: BSD-3-Clause
 */
//# sourceMappingURL=preview_attachment.bundle.U43ESH6K.js.map
