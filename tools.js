// Password toolkit — runs entirely client-side, no data is transmitted.
// Uses Web Crypto API for cryptographically secure randomness.

(function () {
  "use strict";

  const $ = (sel) => document.querySelector(sel);

  // ---------------------------------------------------------------
  // Cryptographically secure random integer in [0, maxExclusive)
  // Rejection sampling avoids modulo bias.
  // ---------------------------------------------------------------
  function cryptoRandomInt(maxExclusive) {
    const arr = new Uint32Array(1);
    const limit = Math.floor(0xffffffff / maxExclusive) * maxExclusive;
    let x;
    do {
      crypto.getRandomValues(arr);
      x = arr[0];
    } while (x >= limit);
    return x % maxExclusive;
  }

  // ---------------------------------------------------------------
  // Random-character password
  // ---------------------------------------------------------------
  function buildAlphabet({ upper, numbers, symbols, noAmb }) {
    const lower = "abcdefghijkmnopqrstuvwxyz"; // l removed
    const ambLower = "l";
    const upperChars = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // I, O removed
    const ambUpper = "IO";
    const nums = "23456789"; // 0, 1 removed
    const ambNums = "01";
    const sym = "!@#$%^&*()-_=+[]{};:,.?";

    let a = lower;
    if (!noAmb) a += ambLower;
    if (upper) {
      a += upperChars;
      if (!noAmb) a += ambUpper;
    }
    if (numbers) {
      a += nums;
      if (!noAmb) a += ambNums;
    }
    if (symbols) a += sym;
    return a;
  }

  function generatePassword(len, opts) {
    const alphabet = buildAlphabet(opts);
    if (!alphabet.length) return "";
    let out = "";
    for (let i = 0; i < len; i++) {
      out += alphabet[cryptoRandomInt(alphabet.length)];
    }
    return out;
  }

  // ---------------------------------------------------------------
  // Passphrase generator
  // Large, diverse word list — makes brute-forcing computationally
  // infeasible even when the list is public.
  // ---------------------------------------------------------------
  const WORDS = [
    // Nature / Landscape
    "acorn","aspen","bark","bay","beach","beech","birch","bloom","blossom","bog",
    "boulder","brook","bud","bush","cedar","cliff","crest","dale","dew","dune",
    "elm","fern","field","fjord","flint","flower","foam","forest","frost","gale",
    "glen","glade","gravel","grove","gust","heath","hill","hollow","ice","inlet",
    "isle","ivy","knoll","lake","leaf","ledge","lichen","log","marsh","meadow",
    "mist","moon","moss","mud","oak","peat","pine","plain","pond","pool",
    "reef","ridge","root","rush","sand","seed","shade","shore","shrub","slope",
    "soil","spring","star","stone","stream","thorn","tide","timber","trunk","vale",
    "valley","vine","wave","well","willow","wood",
    // Animals
    "bear","bird","buck","bull","cat","crane","crow","deer","doe","dog",
    "dove","duck","eagle","elk","falcon","fish","fox","frog","goat","goose",
    "hawk","heron","horse","hound","jay","lamb","lark","lion","lynx","mink",
    "mole","moose","moth","mule","owl","ox","pike","quail","raven","robin",
    "seal","shark","sheep","snail","snake","sparrow","stag","swan","tiger","trout",
    "turtle","vole","whale","wolf","wren",
    // Weather / Sky
    "aurora","blast","bolt","breeze","chill","cloud","drizzle","fog","hail","haze",
    "monsoon","rain","shower","sleet","slush","snow","squall","storm","tempest","thunder",
    "tornado","typhoon","wind",
    // Colors
    "amber","azure","beige","black","blue","brown","buff","charcoal","coral","cream",
    "crimson","cyan","ebony","fawn","gold","green","grey","indigo","ivory","jade",
    "lilac","lime","maroon","navy","ochre","olive","peach","pink","plum","purple",
    "red","rose","ruby","rust","salmon","scarlet","sepia","silver","teal","umber",
    "violet","white","yellow",
    // Tools / Objects
    "anchor","anvil","arch","axe","bell","blade","board","book","box","brick",
    "bridge","brush","bucket","candle","cart","chain","chest","chisel","clock","coil",
    "coin","comb","cord","crate","crown","cup","dart","dial","dish","door",
    "drum","fork","gate","gear","glass","glove","gong","hammer","hinge","hook",
    "horn","jar","jug","key","knife","latch","lens","lever","lock","mallet",
    "map","mask","mill","mug","nail","needle","net","paddle","pan","pen",
    "pick","pin","pipe","pitcher","plate","plow","post","pot","rack","ring",
    "rope","sail","scale","scythe","shield","shovel","sieve","spade","spear","spike",
    "staff","stake","stove","strap","sword","tongs","torch","tower","tray","vase",
    "vault","wedge","wheel","whip","wrench",
    // Food
    "apple","barley","bean","berry","bread","butter","cake","carrot","cheese","cherry",
    "clove","corn","date","dough","egg","fig","flour","garlic","ginger","grain",
    "grape","herb","honey","jam","kale","lemon","malt","mead","milk","mint",
    "oat","onion","pepper","rye","sage","salt","spice","stew","sugar","tea",
    "thyme","wheat","yeast",
    // Texas / Southwest
    "adobe","blaze","bluebonnet","bonfire","campfire","canyon","cactus","cattle","coffee","comet",
    "creek","drift","dust","flats","ford","guitar","grit","gulch","gully","horizon",
    "lantern","longhorn","mesa","pasture","prairie","ranch","range","ravine","rim","saddle",
    "scrub","spur","starlight","sunset","trail","wagon","wildflower","windmill",
    // Action / Descriptive
    "basin","bend","bluff","bold","brave","bright","butte","calm","carve","cast",
    "catch","chop","churn","clear","climb","craft","crisp","dawn","deep","delta",
    "dive","drop","dusk","ember","fast","fetch","fierce","firm","flare","flat",
    "flame","flash","float","fold","free","fresh","gleam","glimmer","glow","gorge",
    "grab","grand","guard","haul","high","hike","hold","jump","keen","knob",
    "leap","lift","light","lush","march","mend","mild","mount","move","narrow",
    "noble","notch","pale","pass","path","peak","plateau","press","proud","pull",
    "push","quick","quiet","rare","reach","rich","ride","rise","roll","roam",
    "rough","run","seek","shape","shelf","shift","shimmer","slide","slow","smooth",
    "soar","soft","spark","spin","step","surge","swift","swing","tall","throw",
    "toss","track","trudge","true","turn","twist","vast","wade","walk","warm",
    "weave","wide","wild"
  ];

  function generatePassphrase(wordCount, separator) {
    const words = [];
    for (let i = 0; i < wordCount; i++) {
      words.push(WORDS[cryptoRandomInt(WORDS.length)]);
    }
    // Capitalize one word for variety
    if (wordCount >= 3) {
      const idx = cryptoRandomInt(wordCount);
      words[idx] = words[idx].charAt(0).toUpperCase() + words[idx].slice(1);
    }
    // Append a 2-digit number
    const n = cryptoRandomInt(90) + 10; // 10..99
    return words.join(separator) + separator + n;
  }

  // ---------------------------------------------------------------
  // Lightweight password strength scorer
  // ---------------------------------------------------------------
  function scorePassword(pw) {
    if (!pw) return { score: 0, label: "Empty", advice: "Type a password to get feedback." };

    const length = pw.length;
    const hasLower = /[a-z]/.test(pw);
    const hasUpper = /[A-Z]/.test(pw);
    const hasNumber = /[0-9]/.test(pw);
    const hasSymbol = /[^A-Za-z0-9]/.test(pw);

    const hasRepeat = /(.)\1{2,}/.test(pw);
    const hasSequence =
      /(?:0123|1234|2345|3456|4567|5678|6789)/.test(pw) ||
      /(?:abcd|bcde|cdef|defg|efgh|fghi|ghij|hijk|ijkl|jklm|klmn|lmno|mnop|nopq|opqr|pqrs|qrst|rstu|stuv|tuvw|uvwx|vwxy|wxyz)/i.test(pw);
    const looksLikeWord = /^[A-Za-z]+$/.test(pw) && length <= 10;

    let score = 0;
    if (length >= 8) score += 20;
    if (length >= 12) score += 25;
    if (length >= 16) score += 25;
    if (length >= 20) score += 15;

    score += hasLower ? 10 : 0;
    score += hasUpper ? 10 : 0;
    score += hasNumber ? 10 : 0;
    score += hasSymbol ? 10 : 0;

    if (hasRepeat) score -= 15;
    if (hasSequence) score -= 15;
    if (looksLikeWord) score -= 20;

    score = Math.max(0, Math.min(100, score));

    let label = "Weak";
    let advice = "Use 16+ characters and avoid patterns. Turn on MFA for important accounts.";
    if (score >= 70) {
      label = "Strong";
      advice = "Good. Make sure it's unique per site and stored in a password manager.";
    } else if (score >= 45) {
      label = "Okay";
      advice = "Increase length (16+) and add uniqueness. Avoid reused passwords.";
    }

    return { score, label, advice };
  }

  // ---------------------------------------------------------------
  // UI helpers
  // ---------------------------------------------------------------
  function setMeter(score) {
    const bar = $("#meterBar");
    const badge = $("#scoreBadge");
    const label = $("#scoreLabel");

    bar.style.width = score + "%";
    let color = "var(--bad)";
    if (score >= 70) color = "var(--ok)";
    else if (score >= 45) color = "var(--warn)";
    bar.style.background = color;

    badge.textContent = "Score: " + score;
    label.textContent =
      score >= 70
        ? "Looks strong"
        : score >= 45
        ? "Decent, can improve"
        : "Needs improvement";
  }

  function refreshModeUI() {
    const mode = $("#mode").value;
    $("#randomOptions").style.display = mode === "random" ? "grid" : "none";
    $("#phraseOptions").style.display = mode === "passphrase" ? "grid" : "none";
    $("#len").disabled = mode !== "random";
  }

  // ---------------------------------------------------------------
  // Event wiring
  // ---------------------------------------------------------------
  $("#mode").addEventListener("change", refreshModeUI);
  refreshModeUI();

  $("#genBtn").addEventListener("click", () => {
    const mode = $("#mode").value;
    let value = "";

    if (mode === "passphrase") {
      const wc = Math.max(3, Math.min(8, parseInt($("#wordCount").value || "4", 10)));
      const sep = $("#separator").value;
      value = generatePassphrase(wc, sep);
    } else {
      const len = Math.max(12, Math.min(64, parseInt($("#len").value || "20", 10)));
      const opts = {
        upper: $("#optUpper").checked,
        numbers: $("#optNumbers").checked,
        symbols: $("#optSymbols").checked,
        noAmb: $("#optNoAmb").checked,
      };
      value = generatePassword(len, opts);
    }

    $("#generated").textContent = value || "Select at least one option.";
    const s = scorePassword(value);
    setMeter(s.score);
    $("#scoreBadge").textContent = "Score: " + s.score + " (" + s.label + ")";
    $("#scoreLabel").textContent = s.advice;
    $("#advice").textContent = s.advice;
  });

  $("#copyBtn").addEventListener("click", async () => {
    const text = $("#generated").textContent || "";
    if (!text || text === 'Click "Generate"' || text === "Select at least one option.") return;
    try {
      await navigator.clipboard.writeText(text);
      $("#copyBtn").textContent = "Copied";
      setTimeout(() => ($("#copyBtn").textContent = "Copy"), 1100);
    } catch (e) {
      alert("Copy failed. You can manually select and copy the password.");
    }
  });

  $("#checkInput").addEventListener("input", (e) => {
    const pw = e.target.value || "";
    const s = scorePassword(pw);
    setMeter(s.score);
    $("#scoreBadge").textContent = "Score: " + s.score + " (" + s.label + ")";
    $("#scoreLabel").textContent = s.advice;
    $("#advice").textContent = s.advice;
  });

  // Hamburger menu toggle
  const hamburgerBtn = document.querySelector(".hamburger");
  const navMenu = document.getElementById("navMenu");
  if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener("click", function () {
      const expanded = this.getAttribute("aria-expanded") === "true";
      this.setAttribute("aria-expanded", String(!expanded));
      navMenu.classList.toggle("open");
    });
  }
})();
