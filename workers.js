const telegramAuthToken =`your tgbot token`;
const webhookEndpoint = "/endpoint";
const CLOUDFLARE_ACCOUNT_ID = "cf id";
const CLOUDFLARE_AUTH_TOKEN = "cf api token";
addEventListener ("fetch",event=>{
  event.respondWith(handleIncomingRequest(event));
});

async function handleIncomingRequest(event) {
  let url = new URL(event.request.url);
  let path = url.pathname;
  let method = event.request.method;
  let workerUrl = `${url.protocol}//${url.host}`;

  if(method === "POST" && path === webhookEndpoint) {
    const update = await event.request.json();
    event.waitUntil(processUpdate(update));
    return new Response("Ok");
  } else if(method === "GET" && path === "/configure-webhook") {
    const url = `https://api.telegram.org/bot${telegramAuthToken}/setWebhook?url=${workerUrl}${webhookEndpoint}`;

    const response = await fetch(url);

    if(response.ok) {
      return new Response("Webhook set successfully",{status:200});
    } else {
      return new Response("Failed to set webhook",{status:response.status});
    }
  } else {
    return new Response("Not found",{status:404});
  }

}

async function processUpdate(update) {
  if("message" in update) {
    const chatId = update.message.chat.id;
    const userText = update.message.text;
    let responseText = '';
    if (userText === '/start'||userText === '/start@m9secondbot') {
      responseText = '/Setu + tag\n\n/getChatId\n\n/getBotIP\n\n/llama3';
      const url = `https://api.telegram.org/bot${telegramAuthToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(responseText)}`;
      await fetch(url);
    }
    if (userText.startsWith("/Setu") || userText.startsWith("/Setu@m9secondbot")) {
      const tag = userText.replace(/^\/Setu(@m9secondbot)?\s*/, "");
      try {
        const setuUrl = `https://api.lolicon.app/setu/v2?r18=1&&tag=${tag}`;
        const response = await fetch(setuUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch Setu data. HTTP Status: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        if (data.error || !data.data || data.data.length === 0) {
          throw new Error('No setu of this tag');
        }
        const imageUrl = data.data[0].urls.original;
        const responseText = `${imageUrl}`;
        const url = `https://api.telegram.org/bot${telegramAuthToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(responseText)}`;
        await fetch(url);
    
      } catch (error) {
        const errorMessage = `Error: ${error.message}`;
        const url = `https://api.telegram.org/bot${telegramAuthToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(errorMessage)}`;
        await fetch(url);
      }
    }
    if (userText === '/getChatId'||userText==='/getChatId@m9secondbot') {
      responseText = `${chatId}`;
      const url = `https://api.telegram.org/bot${telegramAuthToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(responseText)}`;
      await fetch(url);
    }
    if (userText === '/getBotIP'||userText==='/getBotIP@m9secondbot') {
      try {
        const result = await fetch('https://ipinfo.io/json'); // Correct URL for JSON response
        const data = await result.json(); // Parse the JSON response
        responseText = `${JSON.stringify(data, null, 2)}`;
      } catch (error) {
        responseText = `Error: ${error.message}`;
      }
    
      const url = `https://api.telegram.org/bot${telegramAuthToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(responseText)}`;
      await fetch(url);
    }
    if (userText.startsWith("/llama3") || userText.startsWith("/llama3@m9secondbot")) {
      const question = userText.replace(/^\/llama3(@m9secondbot)?\s*/, "");
      const workers_ai_url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/meta/llama-3.1-70b-instruct`;
      const response = await fetch(workers_ai_url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${CLOUDFLARE_AUTH_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "messages": [
            { "role": "system", "content": "You are a friendly assistant" },
            { "role": "user", "content": question }
          ]
        })
      });
    
      const jsonResponse = await response.json();
      const result = jsonResponse.result && jsonResponse.result.response ? jsonResponse.result.response : "AI 没有返回内容";
      const url = `https://api.telegram.org/bot${telegramAuthToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(result)}`;
      await fetch(url);
    }
        
  }
}
