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

function md(markdown) {
  // Convert headers
  markdown = markdown.replace(/^#\s(.*)$/gm, "<h1>$1</h1>");
  markdown = markdown.replace(/^##\s(.*)$/gm, "<h2>$1</h2>");
  markdown = markdown.replace(/^###\s(.*)$/gm, "<h3>$1</h3>");

  // Convert bold and italic text
  markdown = markdown.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  markdown = markdown.replace(/\*(.*?)\*/g, "<em>$1</em>");
  markdown = markdown.replace(/\~(.*?)\~/g, "<span style=\"text-decoration: underline\">$1</span>");

  // Convert lists
  markdown = markdown.replace(/^\-\s(.*)$/gm, "<ul><li>$1</li></ul>\n");
  markdown = markdown.replace(/^\*\s(.*)$/gm, "<ul><li>$1</li></ul>\n");
  markdown = markdown.replace(/^\d\.\s(.*)$/gm, "<ul><li>$1</li></ul>\n");
  if (/^\*\s/.test(markdown) || /^\d\.\s/.test(markdown)) {
    markdown = "<ul>\n" + markdown + "</ul>\n";
  }

  // Convert links
  markdown = markdown.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');

  return markdown;
}

export async function onRequest(context) {
  let wishlistItems = [];
  let updateTime = null;
  let liveUpdate = false;
  try {
    const response = await fetch(
      "https://api.ticktick.com/api/v2/batch/check/0",
      {
        headers: {
          Cookie: context.env.TICKTICK_COOKIE,
        },
      }
    );
    const data = await response.json();
    wishlistItems = data["syncTaskBean"]["update"].filter(
      (x) => x.projectId === "6234a9aed14ad17eaad2a118"
    );
    wishlistItems = wishlistItems.map((x) => ({
      name: x.title,
      description: x.content,
    }));
    await context.env.WISHLIST.put('martijn', JSON.stringify({
        date: (new Date()),
        wishlist: wishlistItems,
    }));

    liveUpdate = true;
  } catch (e) {
    const oldWishlist = await context.env.WISHLIST.get('martijn',  { type: "json" });
    if (oldWishlist?.date) updateTime = new Date(oldWishlist.date);
    if (oldWishlist?.wishlist) wishlistItems = oldWishlist.wishlist;
  }

  const updateTimeFormatted = updateTime ? (`${updateTime.toLocaleDateString("nl", {day: "numeric", month: "long"})} om ${updateTime.getHours().toString().padStart(2, "0")}:${updateTime.getMinutes().toString().padStart(2, "0")} uur`) : '';
  const html = `<!DOCTYPE html>
  <html lang="nl">
  <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Martijns verlanglijst</title>
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
          }
      </style>
      <!-- Favicon -->
      <link rel="apple-touch-icon" sizes="180x180" href="https://martijnluyckx.be/assets/images/png/apple-touch-icon.png">
      <link rel="icon" type="image/png" sizes="32x32" href="https://martijnluyckx.be/assets/images/png/favicon-32x32.png">
      <link rel="icon" type="image/png" sizes="16x16" href="https://martijnluyckx.be/assets/images/png/favicon-16x16.png">
      <meta name="description" content="Wil je Martijn verrassen met een cadeau? Bekijk hier zijn verlanglijst.">
      <meta name="twitter:title" content="Martijns verlanglijst">
      <meta name="twitter:description" content="Wil je Martijn verrassen met een cadeau? Bekijk hier zijn verlanglijst.">
      <meta name="twitter:image" content="https://martijnluyckx.be/assets/images/png/og_image.png">
      <meta name="twitter:card" content="summary_large_image">
      <meta property="og:title" content="Martijns verlanglijst">
      <meta property="og:description" content="Wil je Martijn verrassen met een cadeau? Bekijk hier zijn verlanglijst.">
      <meta property="og:type" content="website">
      <meta property="og:image" content="https://martijnluyckx.be/assets/images/png/og_image.png">
      <meta property="og:url" content="https://verlanglijst.martijnluyckx.be/">
  </head>
  <body>
    <main class="container">
        <h1>Martijns verlanglijst</h1>
        ${liveUpdate ? '' :
                (`<p class="alert">De lijst kon niet live worden geüpdatet.
                ${updateTime ? `Deze versie is van ${updateTimeFormatted}.` : ''}</p>`)
        }
        <p>Hoi! 👋 Als je ooit inspiratie nodig hebt voor een cadeautje — kijk gerust hier.</p>
        <p>Ik gebruik deze lijst ook voor mezelf, dus laat je niet afschrikken door sommige dingen hier met een hoog prijskaartje 😅.</p>
        <p>Dingen die ik altijd leuk vind: gezelschapsspellen 🎲 (misschien staan er hier wel wat specifieke, maar je mag me altijd verrassen), lekker eten 🍣, chocolade / snoep 🍫, gadgets 📱, kookspullen 🍴, en verrassingen 🎁.</p>
        <p>Oh en als laatste: de lijst staat helemaal niet in een bepaalde volgorde 🔀. Hoger in de lijst betekent zeker niet persé dat ik dat liever wil dan iets anders 😊</p>
        <ul class="wishlist">
        ${wishlistItems.length ? wishlistItems
          .map(
            (item) =>
              `<li class="wishlist-item">
                <span class="name">${md(sanitiseHtml(item.name))}</span>
                ${item.description.length ? `<span class="description">${md(sanitiseHtml(item.description))}</span>` : ""}
              </li>`
          )
          .join("") : 
          `<li class="wishlist-item">
          <span class="name">Geen lijstje gevonden.</span>
          <span class="description">Waarschijnlijk is er iets mis. Of Martijn heeft al alles wat hij wilt.</span>`}
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
