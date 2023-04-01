/**
 * readRequestBody reads in the incoming request body
 * Use await readRequestBody(..) in an async function to get the string
 * @param {Request} request the incoming request to read from
 */
async function readRequestBody(request) {
  const { headers } = request;
  const contentType = headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return await request.json();
  } else if (contentType.includes("application/text")) {
    return request.text();
  } else if (contentType.includes("text/html")) {
    return request.text();
  } else if (contentType.includes("form")) {
    const formData = await request.formData();
    const body = {};
    for (const entry of formData.entries()) {
      body[entry[0]] = entry[1];
    }
    return body;
  } else {
    // Perhaps some other type of data was submitted in the form
    // like an image, or some other binary data.
    return "a file";
  }
}

function isValidFormat(str) {
  const regex = /^[a-f0-9]{24}$/;
  return regex.test(str);
}

export async function onRequest(context) {
  const { searchParams } = new URL(context.request.url);
  const body = await readRequestBody(context.request);
  const selectedId = searchParams.get("id") ?? body.id ?? null;
  if (isValidFormat(selectedId)) {
    let htmlMainContent = "";

    
    if (
      body.password &&
      body.password.length > 0 &&
      body.username &&
      body.username.length
    ) {
      // verify credentials and save list id if they are correct
      if (body.username === context.env.TICKTICK_USERNAME && body.password === context.env.TICKTICK_PASSWORD) {
        context.env.TICKTICK_LIST.put("list-id", selectedId);
        htmlMainContent = `<h1>Success</h1><p>Your new list is now public</p><p><a href="/">View the public list</a></p>`
      } else {
        htmlMainContent = `<h1>Not allowed</h1><p>You are not allowed to change the list</p>`
      }
    } else {
      // prompt for credentials confirmation
      htmlMainContent = `
        <h1>Please confirm with your TickTick credentials</h1>
        <form action="?" method="post">
            <div class="form-group">
                <label for="username">Email address</label>
                <input type="email" placeholder="Email" name="username" id="username">
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" placeholder="Password" name="password" id="password">
            </div>
            <input type="text" hidden value="${selectedId}" name="id">
            <button type="submit">Update public list</button>
        </form>
      `
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
        <meta name="description" content="Settings - PublicTickTick">
        <meta name="twitter:title" content="Settings - PublicTickTick">
        <meta name="twitter:description" content="Settings - PublicTickTick">
        <meta name="twitter:image" content="https://martijnluyckx.be/assets/images/png/og_image.png">
        <meta name="twitter:card" content="summary_large_image">
        <meta property="og:title" content="Settings - PublicTickTick">
        <meta property="og:description" content="Settings - PublicTickTick">
        <meta property="og:type" content="website">
        <meta property="og:image" content="https://martijnluyckx.be/assets/images/png/og_image.png">
        <meta property="og:url" content="https://verlanglijst.martijnluyckx.be/">
    </head>
    <body>
      <main class="container">
          ${htmlMainContent}
      </main>
    </body>
  </html>`;

    return new Response(html, {
      headers: {
        "content-type": "text/html;charset=UTF-8",
      },
    });
  }
  return new Response("ok");
}
