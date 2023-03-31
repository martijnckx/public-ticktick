function sanitiseHtml(input) {
  var entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
    "/": "&#x2F;",
  };

  var sanitisedInput = String(input).replace(/[&<>"'\/]/g, function (s) {
    return entityMap[s];
  });

  return sanitisedInput;
}

function md(markdown, withParagraphs = false) {
  // Convert bold and italic text
  markdown = markdown.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  markdown = markdown.replace(/\*(.*?)\*/g, "<em>$1</em>");
  markdown = markdown.replace(
    /\~(.*?)\~/g,
    '<span style="text-decoration: underline">$1</span>'
  );

  // Convert lists
  markdown = markdown.replace(/^\-\s(.*)$/gm, "<ul><li>$1</li></ul>\n");
  markdown = markdown.replace(/^\*\s(.*)$/gm, "<ul><li>$1</li></ul>\n");
  markdown = markdown.replace(/^\d\.\s(.*)$/gm, "<ul><li>$1</li></ul>\n");
  if (/^\*\s/.test(markdown) || /^\d\.\s/.test(markdown)) {
    markdown = "<ul>\n" + markdown + "</ul>\n";
  }

  // Convert links
  markdown = markdown.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');

  if (withParagraphs) {
    // Convert paragraphs
    var paragraphs = markdown.split(/\n\s*\n/);
    for (var i = 0; i < paragraphs.length; i++) {
      // Check whether the paragraph is already wrapped in a <p> tag
      if (!/^<p>/.test(paragraphs[i])) {
        paragraphs[i] = "<p>" + paragraphs[i] + "</p>";
      }
    }
    markdown = paragraphs.join("\n");
  }

  return markdown;
}

async function getTickTickItems(context, token) {
  let listItems = [];
  try {
    const response = await fetch(
      "https://api.ticktick.com/api/v2/batch/check/0",
      {
        headers: {
          Cookie: `t=${token};`,
        },
      }
    );
    const data = await response.json();
    const targetList = await context.env.WISHLIST.get('list-id');
    if (!targetList) { return [] }
    listItems = data["syncTaskBean"]["update"].filter(
      (x) => x.projectId === (targetList)
    );
    listItems = listItems
      .map((x) => ({
        name: x.title,
        description: x.content,
        sortOrder: x.sortOrder,
      }))
      .sort((x, y) => x.sortOrder - y.sortOrder);

    await context.env.WISHLIST.put(
      "ticktick-content",
      JSON.stringify({
        date: new Date(),
        list: listItems,
      })
    );
  } catch (e) {
    console.log(e);
    throw new Error();
  }

  return listItems;
}

async function getNewAccessToken(context) {
  const response = await fetch(
    "https://api.ticktick.com/api/v2/user/signon?wc=true&remember=true",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: context.env.TICKTICK_USERNAME,
        password: context.env.TICKTICK_PASSWORD,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch new access token");
  }

  const data = await response.json();
  const newToken = data["token"];

  await context.env.WISHLIST.put("ticktick-token", newToken);

  return newToken;
}

export async function onRequest(context) {
  let listItems = [];
  let updateTime = null;
  let liveUpdate = false;
  let token = await context.env.WISHLIST.get("ticktick-token");
  try {
    listItems = await getTickTickItems(context, token);
    liveUpdate = true;
  } catch (e) {
    try {
      token = await getNewAccessToken(context);
      listItems = await getTickTickItems(context, token);
      liveUpdate = true;
    } catch (e) {
      const oldList = await context.env.WISHLIST.get("ticktick-content", {
        type: "json",
      });
      if (oldList?.date) updateTime = new Date(oldList.date);
      if (oldList?.list) listItems = oldList.list;
    }
  }

  let title = "List from TickTick";
  let introText = "";

  try {
    introText = md(
      sanitiseHtml(
        listItems.filter((x) => x.name.toLowerCase() === "ptt.intro")[0]
          .description
      ),
      true
    );
  } catch (e) {}
  try {
    title = sanitiseHtml(
        listItems.filter((x) => x.name.toLowerCase() === "ptt.title")[0]
          .description
      );
  } catch (e) {}
  const updateTimeFormatted = updateTime
    ? `${updateTime.toLocaleDateString("en", {
        day: "numeric",
        month: "long",
      })} at ${updateTime.getHours().toString().padStart(2, "0")}:${updateTime
        .getMinutes()
        .toString()
        .padStart(2, "0")}`
    : "";
  const html = `<!DOCTYPE html>
  <html lang="nl">
  <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
          body,
          html {
              width: 100%;
              height: 100%;
              padding: 0;
              margin: 0;
              font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol";
              color: rgb(55, 53, 47);
              background: white;
          }
          body {
            display: flex;
            justify-content: center;
          }
          .container {
            flex-shrink: 0;
            flex-grow: 1;
            display: flex;
            align-items: flex-start;
            flex-direction: column;
            font-size: 16px;
            line-height: 1.5;
            width: 100%;
            z-index: 4;
            margin-top: 24px;
            max-width: min(721px, 90%);
          }
          h1 {
            max-width: 100%;
            width: 100%;
            white-space: pre-wrap;
            word-break: break-word;
            padding: 3px 2px;
            font-weight: 700;
            line-height: 1.2;
            margin: 0;
            margin-bottom: 12px;
            font-size: 40px;
          }
          .alert {
            background: #ffffcf;
            color: #bfbf00;
            padding: 5px 10px;
            font-weight: bold;
            margin-bottom: 12px;
            border-radius: 5px;
          }
          p {
            margin-top: 4px;
            margin-bottom: 2px;
          }
          a {
            color: inherit;
            text-decoration: none;
            position: relative;
            display: inline-block;
          }
          a::before {
            content: '';
            position: absolute;
            bottom: 2px;
            left: 0;
            width: 100%;
            height: 2px;
            z-index: -1;
            background: #a3e2ff;
            transition: all 0.3s ease-in-out;
          }
          a:hover::before {
            bottom: 0;
            border-radius: 5px;
            height: 100%;
          }
          .wishlist {
            padding: 0;
          }
          .wishlist-item {
            list-style-type: none;
            padding: 10px 20px;
            background: rgba(55, 53, 47, 0.06);
            border-radius: 10px;
            margin-bottom: 12px;
            display: flex;
            flex-direction: column;
          }
          .wishlist-item .name {
            font-size: 18px;
            font-weight: bold;
          }
          .wishlist-item .description {
            margin-top: 12px;
          }
          @media (prefers-color-scheme: dark) {
            html, body {
                background: rgb(25, 25, 25);
                color: rgba(255, 255, 255, 0.81);
            }
            .wishlist-item {
                background: #ffffff08;
            }
            .alert {
                background: #ffffe015;
                color: #ffff6c;
            }
            a::before {
              background: #3F51B5;
            }
          }
      </style>
      <!-- Favicon -->
      <link rel="apple-touch-icon" sizes="180x180" href="https://martijnluyckx.be/assets/images/png/apple-touch-icon.png">
      <link rel="icon" type="image/png" sizes="32x32" href="https://martijnluyckx.be/assets/images/png/favicon-32x32.png">
      <link rel="icon" type="image/png" sizes="16x16" href="https://martijnluyckx.be/assets/images/png/favicon-16x16.png">
      <meta name="description" content="${title}">
      <meta name="twitter:title" content="${title}">
      <meta name="twitter:description" content="${title}">
      <meta name="twitter:image" content="https://martijnluyckx.be/assets/images/png/og_image.png">
      <meta name="twitter:card" content="summary_large_image">
      <meta property="og:title" content="${title}">
      <meta property="og:description" content="${title}">
      <meta property="og:type" content="website">
      <meta property="og:image" content="https://martijnluyckx.be/assets/images/png/og_image.png">
      <meta property="og:url" content="https://verlanglijst.martijnluyckx.be/">
  </head>
  <body>
    <main class="container">
        <h1>${title}</h1>
        ${
          liveUpdate
            ? ""
            : `<p class="alert">The list could not be updated just now.
                ${
                  updateTime ? `The version you're seeing is from ${updateTimeFormatted}.` : ""
                }</p>`
        }
        ${introText}
        <ul class="wishlist">
        ${
          listItems.length
            ? listItems
                .filter((x) => !["ptt.intro", "ptt.title"].includes(x.name.toLowerCase()))
                .map(
                  (item) =>
                    `<li class="wishlist-item">
                <span class="name">${md(sanitiseHtml(item.name))}</span>
                ${
                  item.description.length
                    ? `<span class="description">${md(
                        sanitiseHtml(item.description)
                      )}</span>`
                    : ""
                }
              </li>`
                )
                .join("")
            : `<li class="wishlist-item">
          <span class="name">The TickTick list was not found, or is empty.</span>
          <span class="description">Maybe something went wrong. Or the list is really just empty.</span>`
        }
        </ul>
    </main>
  </body>
</html>`;

  return new Response(html, {
    headers: {
      "content-type": "text/html;charset=UTF-8",
    },
  });
}
