# Public TickTick

This repository allows you to publish one of your TickTick lists as a public webpage on Cloudflare Pages. The list can include item titles, item descriptions, and markdown (bold, italics, lists, and links).

## Installation

To install this repository, follow these steps:

1. Deploy this repo on Cloudflare Pages.
    1. Install [Cloudflare Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/)
    2. Download this repo as a zip & extract it
    3. In a terminal, navigate to the extracted folder (this readme should be in the root of the resulting folder)
    4. Run `wrangler pages publish .` and follow the prompts.
    
    5. Set the environment variables `TICKTICK_USERNAME` and `TICKTICK_USERNAME` on your [Pages project](https://dash.cloudflare.com). I suggest you select the 'encrypt' option as well so they are not readable from the dashboard after you set them.
    6. Create a Cloudflare Workers KV namespace (I suggest calling it `TICKTICK_LIST`). On the Cloudflare dashboard go to Workers on the left navigation panel, click KV, and click Create Namespace.
    7. On your deployed Cloudflare Pages project, go to Settings > Functions > KV namespace bindings and add a production binding from your newly created KV namespace to the variable `TICKTICK_LIST` (it must be that name, it is case sensitive)
    8. Do the deployment again to apply the new environment settings (same steps as #4)

## Usage

To use this repository, follow these steps:

1. Go to `/selectList`.
2. Select the list you want to make public.
3. Confirm with your TickTick credentials. _(So not everyone can view the contents of everything you have saved in TickTick 😉)_
4. `/` now shows your list.

## Special properties

You can edit the title and description that is shown for your list by adding two special items in your TickTick list: `ptt.Title` and `ptt.Intro` (not case sensitive). The description of these items in TickTick will be used as the title and description on the public web page. We recommend creating a new section in your list to visually separate these, and to convert the special items to notes (instead of to-dos) so you can't accidentally mark them as done.

Here's an example of a TickTick list with settings:

![Example TickTick list with settings](https://i.imgur.com/wZglKxl.png)

## Local testing

To use this repository locally (outside of Cloudflare Pages), you can use Wrangler, Cloudflares CLI. In a terminal that is navigated to the root of this repo, you can run `wrangler --compatibility-date=2022-11-28 pages dev . --kv=TICKTICK_LIST --binding TICKTICK_USERNAME="<your-ticktick-username>" --binding TICKTICK_PASSWORD="<your-ticktick-password>"` where you replace the placeholders with your TickTick credentials.

## Notes

- This repository requires the environment variables `TICKTICK_USERNAME` and `TICKTICK_USERNAME` because the public TickTick API does not allow listing the lists and to-dos on your account. It is only meant to create to-dos (and read single to-dos that you already know the ID of, like the ones you created with the API).
- Be aware that this repository exposes all the titles (but not the contents) of your lists on `/selectList`. Only the contents of the list you select and confirm with your TickTick credentials are shown on `/` (which is the point of this repository).
- You will get an email from TickTick saying that "Someone signed in your account on unknown". That is this application. You should only get this email when the token expires and the application has to log in again. Online, I found estimates that a token should last about 4-6 months. 