const { google } = require("googleapis");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

// Gmail API 인증 설정
const SERVICE_ACCOUNT_FILE = "credentials.json"; // 서비스 계정 키 파일 경로
const ADMIN_USER_EMAIL = "admin@yourdomain.com"; // G Suite 관리자 이메일

async function authorize() {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: ["https://www.googleapis.com/auth/gmail.readonly"],
  });

  const authClient = await auth.getClient();
  authClient.subject = ADMIN_USER_EMAIL; // 관리자 이메일로 사용자 권한 위임
  return authClient;
}

async function checkEmails(auth) {
  const gmail = google.gmail({ version: "v1", auth });
  const res = await gmail.users.messages.list({
    userId: "me",
    q: 'subject:"YOUR_SUBJECT_KEYWORD"', // 특정 키워드로 필터링
    maxResults: 1,
  });

  if (res.data.messages && res.data.messages.length) {
    const message = res.data.messages[0];
    const messageData = await gmail.users.messages.get({
      userId: "me",
      id: message.id,
    });
    const emailSnippet = messageData.data.snippet;
    sendDiscordAlert(emailSnippet);
  } else {
    console.log("No new emails found.");
  }
}

// 주기적으로 이메일 확인
async function main() {
  const auth = await authorize();
  setInterval(() => checkEmails(auth), 60000); // 1분마다 이메일 확인
}

main().catch(console.error);
