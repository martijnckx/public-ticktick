async function getTickTickLists(context, token) {
  let lists = [];
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
    lists = data.projectProfiles.map((a) => ({ name: a.name, id: a.id }));
  } catch (e) {
    console.log(e);
    throw new Error();
  }

  return lists;
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

  // Store the new token in KV under 'ticktick-token'
  await context.env.TICKTICK_LIST.put("ticktick-token", newToken);

  return newToken;
}

export async function onRequest(context) {
  let lists = [];
  let token = await context.env.TICKTICK_LIST.get("ticktick-token");
  try {
    lists = await getTickTickLists(context, token);
    console.log("Got the lists");
    console.log(lists);
  } catch (e) {
    try {
      console.log("Saved token didn't work. Trying again");
      token = await getNewAccessToken(context);
      lists = await getTickTickLists(context, token);
      console.log("Got the lists");
      console.log(lists);
    } catch (e) {
      console.log("her werkte niet");
    }
  }

  const html = `<!DOCTYPE html>
    <html lang="nl">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Public Tick Tick</title>
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
          <h1>Kies project</h1>
          <ul>
          ${lists
            .map(
              (list) =>
                `<li>${list.name} - <a href="/confirmList?id=${list.id}">Gebruik deze lijst</a></li>`
            )
            .join("")}
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
