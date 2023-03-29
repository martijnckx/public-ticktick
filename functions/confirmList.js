function isValidFormat(str) {
    const regex = /^[a-f0-9]{24}$/;
    return regex.test(str);
  }

export async function onRequest(context) {
    const { searchParams } = new URL(context.request.url)
    if (isValidFormat(searchParams.get('id'))) {

        // For now only allow the actual wishlist
        if (!searchParams.get('id') !== '6234a9aed14ad17eaad2a118') return new Response('not allowed');

        context.env.WISHLIST.put('martijn-list', searchParams.get('id'));
    }
    return new Response('ok');
}