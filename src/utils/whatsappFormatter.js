function isAplhanumeric(char) {
  const x = `${char || ""}`.charCodeAt(0);

  if (!char || Number.isNaN(x)) {
    return false;
  }

  return !!(
    (x >= 65 && x <= 90) ||
    (x >= 97 && x <= 122) ||
    (x >= 48 && x <= 57)
  );
}

function getIndexes(text, wildcard) {
  const indices = [];

  for (let i = 0; i <= text.length - wildcard.length; i += 1) {
    if (text.slice(i, i + wildcard.length) === wildcard) {
      if (indices.length % 2) {
        if (text[i - 1] === " " || isAplhanumeric(text[i + wildcard.length])) {
          break;
        } else {
          indices.push(i);
        }
      } else if (
        typeof text[i + wildcard.length] === "undefined" ||
        text[i + wildcard.length] === " " ||
        isAplhanumeric(text[i - 1])
      ) {
        break;
      } else {
        indices.push(i);
      }
      // Skip ahead by wildcard length - 1 (loop will increment by 1)
      i += wildcard.length - 1;
    } else if (text[i].charCodeAt(0) === 10 && indices.length % 2) {
      indices.pop();
    }
  }

  if (indices.length % 2) {
    // we have unclosed tags
    indices.pop();
  }

  return indices;
}

function injectTags(text, indices, rule) {
  let e = 0;
  let injectedText = text;

  indices.forEach((value, index) => {
    const tag = index % 2 ? rule.closeTag : rule.openTag;

    let v = value;
    v += e;

    injectedText =
      injectedText.slice(0, v) +
      tag +
      injectedText.slice(v + rule.wildcard.length);

    e += tag.length - rule.wildcard.length;
  });

  return injectedText;
}

function execRule(text, rule) {
  const indices = getIndexes(text, rule.wildcard);
  return injectTags(text, indices, rule);
}

function parseText(text, rules) {
  const final = rules.reduce(
    (transformed, rule) => execRule(transformed, rule),
    text
  );

  return final.replace(/\n/gi, "<br>");
}

export const whatsappRules = [
  {
    closeTag: "</strong>",
    openTag: "<strong>",
    wildcard: "*",
  },
  {
    closeTag: "</i>",
    openTag: "<i>",
    wildcard: "_",
  },
  {
    closeTag: "</s>",
    openTag: "<s>",
    wildcard: "~",
  },
  {
    closeTag: "</code>",
    openTag: "<code>",
    wildcard: "```",
  },
  {
    closeTag: "</code>",
    openTag: "<code>",
    wildcard: "`",
  },
];

export function format(text, rules) {
  return parseText(text, rules || whatsappRules);
}
