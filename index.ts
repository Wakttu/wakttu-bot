import {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  MessageActionRowComponentBuilder,
} from "discord.js";
import * as sheet from "./sheet";
import * as dotenv from "dotenv";
import { searchModal } from "./modal";

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, // 추가
  ],
});

const PREFIX = process.env.PREFIX || "!";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

if (!process.env.TOKEN) {
  console.log("An discord token is empty.");
  sleep(60000).then(() =>
    console.log("Service is getting stopped automatically")
  );
}

const discordLogin = async () => {
  try {
    await client.login(process.env.TOKEN);
  } catch (error) {
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
      const button = new ButtonBuilder()
        .setCustomId("openModal")
        .setLabel("모달 오픈!")
        .setStyle(1);

      const actionRow =
        new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
          button
        );

      await msg.reply({
        content: "버튼을 눌러 모달을 열어보세요.",
        components: [actionRow],
      });
    }

    if (msg.content === PREFIX + "find") {
      // find 명령어 구현
    }

    if (msg.content === PREFIX + "info") {
      console.log(msg);
    }
  } catch (e) {
    console.log(e);
  }
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.isButton() && interaction.customId === "openModal") {
    await interaction.showModal(searchModal());
  }

  if (interaction.isModalSubmit() && interaction.customId === "searchModal") {
    const keyword = interaction.fields.getTextInputValue("keywordInput");
    if (!keyword) return interaction.reply("단어를 입력하세요!");

    // 여기서 기본 응답을 지연
    await interaction.deferReply();

    try {
      const _keyword = keyword.split("").join("");
      const data = await sheet.list();
      const results = data.filter((item) => item.keyword === _keyword);

      if (results.length > 0) {
        let replyMessage = `검색결과 : ${results.length}개\n\n`;
        results.forEach((result, index) => {
          replyMessage += `
          단어: ${result.keyword}
          뜻: ${result.mean}
          정보: ${result.info}
          태그: ${result.tag.join(", ")}
          URL: ${result.url ? result.url.join(", ") : "No URL"}
          BGM: ${result.bgm ? voiceURL(result.bgm) : "No URL"}
          Type: ${result.type}\n\n`;
        });

        if (replyMessage.length > 2000) {
          replyMessage =
            "Too many results to display in one message. Please refine your search.";
        }

        await interaction.editReply(replyMessage);
      } else {
        await interaction.editReply(`해당하는 단어가 없어유: ${keyword}`);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      await interaction.editReply("There was an error fetching the data.");
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
