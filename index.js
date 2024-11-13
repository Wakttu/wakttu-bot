const Discord = require("discord.js");
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });
const dotenv = require("dotenv");
const sheet = require("./sheet.js");
const { searchModal } = require("./modal.js");

dotenv.config();

const PREFIX = process.env.PREFIX;

const sleep = (ms) => {
  return new Promise((r) => setTimeout(r, ms));
};

if (process.env.TOKEN == null) {
  console.log("An discord token is empty.");
  sleep(60000).then(() =>
    console.log("Service is getting stopped automatically")
  );
  return 0;
}

const discordLogin = async () => {
  try {
    await client.login(process.env.TOKEN);
  } catch (TOKEN_INVALID) {
    console.log("An invalid token was provided");
    sleep(60000).then(() =>
      console.log("Service is getting stopped automatically")
    );
  }
};

discordLogin();

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}.`);
});

client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;

  try {
    if (msg.content === PREFIX + "server") {
      msg.channel.send(
        `현재 서버의 이름은 ${msg.guild.name} 입니다.\n총 멤버 수는 ${msg.guild.memberCount} 명 입니다.`
      );
    }

    if (msg.content === PREFIX + "get/count") {
      const data = await sheet.list();
      msg.channel.send(`총 ${data.length} 개가 등록되어있어요!`);
    }

    if (msg.content === PREFIX + "search") {
      await msg.channel.send({
        content: "여기를 클릭 후, 단어를 입력하세요 :)",
        components: [searchModal()],
      });
    }

    if (msg.content === PREFIX + "find")
      if (msg.content === PREFIX + "info") {
        console.log(msg);
      }
  } catch (e) {
    console.log(e);
  }
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.customId === "searchModal") {
    const keyword = interaction.fields.getTextInputValue("keywordInput"); // 입력한 keyword 값 가져오기
    if (!keyword) return interaction.reply("단어를 입력하세요!");

    try {
      const _keyword = keyword.split("").join("");
      const data = await list(); // 모든 데이터를 가져옴
      const results = data.filter((item) => item.keyword === _keyword); // 키워드로 검색

      if (results.length > 0) {
        // 검색 결과가 여러 개 있는 경우 응답을 배열로 정리
        let replyMessage = `Found ${results.length} results for **${keyword}**:\n\n`;

        results.forEach((result, index) => {
          replyMessage += `
                    **Result ${index + 1}:**
                    **Keyword**: ${result.keyword}
                    **Mean**: ${result.mean}
                    **Info**: ${result.info}
                    **Tags**: ${result.tag.join(", ")}
                    **URL**: ${result.url ? result.url.join(", ") : "No URL"}
                    **BGM**: ${result.bgm ? voiceURL(result.bgm) : "No URL"}
                    **Type**: ${result.type}\n\n
                `;
        });

        if (replyMessage.length > 2000) {
          // Discord 메시지 제한(2000자)을 넘는 경우
          replyMessage =
            "Too many results to display in one message. Please refine your search.";
        }

        await interaction.reply(replyMessage);
      } else {
        // 검색 결과가 없을 때 응답
        interaction.reply(`해당하는 단어가 없어유: ${keyword}`);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      interaction.reply("There was an error fetching the data.");
    }
  }
});

const voiceURL = (bgm) => {
  const type = bgm.split("-")[0];
  const map = new Map([
    ["gomem", "gomem/"],
    ["woo", "woo/"],
    ["i", "ine/"],
    ["l", "lilpa/"],
    ["ju", "jururu/"],
    ["ji", "jingburger/"],
    ["go", "gosegu/"],
    ["v", "viichan/"],
  ]);
  return "https://r2.wakttu.kr/assets/voice/" + map.get(type) + bgm + ".webm";
};
