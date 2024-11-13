const {
  ModalBuilder,
  TextInputBuilder,
  ActionRowBuilder,
} = require("@discordjs/builders");

function searchModal() {
  const modal = new ModalBuilder()
    .setCustomId("searchModal")
    .setTitle("단어 찾기!");

  console.log("check");
  // 텍스트 입력 필드 생성
  const input = new TextInputBuilder()
    .setCustomId("keywordInput")
    .setLabel("찾고 싶은 단어를 입력해보세요!: ")
    .setStyle(TextInputStyle.Short);

  // 모달에 입력 필드를 추가
  const row = new ActionRowBuilder().addComponents(input);
  modal.addComponents(row);

  return modal;
}

module.exports = { searchModal };
