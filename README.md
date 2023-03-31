# Public TickTick

This repository allows you to publish one of your TickTick lists as a public webpage on Cloudflare Pages. The list can include item titles, item descriptions, and markdown (bold, italics, lists, and links).

## Installation

To install this repository, follow these steps:

1. Deploy this repo on Cloudflare Pages.
2. Set the environment variables `TICKTICK_USERNAME` and `TICKTICK_USERNAME`.

## Usage

To use this repository, follow these steps:

1. Go to `/selectList`.
2. Select the list you want to make public.
3. Confirm with your TickTick credentials.
4. `/` now shows your list.

### Special properties

You can edit the title and description that is shown for your list by adding two special items in your TickTick list: `ptt.Title` and `ptt.Intro` (not case sensitive). The description of these items in TickTick will be used as the title and description on the public web page. We recommend creating a new section in your list to visually separate these, and to convert the special items to notes (instead of to-dos) so you can't accidentally mark them as done.

Here's an example of a TickTick list with settings:

![Example TickTick list with settings](https://i.imgur.com/wZglKxl.png)

## Notes

- This repository requires the environment variables `TICKTICK_USERNAME` and `TICKTICK_USERNAME` because the public TickTick API does not allow listing the lists and to-dos on your account. It is only meant to create to-dos (and read single to-dos that you already know the ID of, like the ones you created with the API).
- Be aware that this repository exposes all the titles (but not the contents) of your lists on `/selectList`. Only the contents of the list you select and confirm with your TickTick credentials are shown on `/` (which is the point of this repository).