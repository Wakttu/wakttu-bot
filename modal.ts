import {
  ModalBuilder,
  TextInputBuilder,
  ActionRowBuilder,
} from "@discordjs/builders";

function searchModal() {
  const modal = new ModalBuilder()
    .setCustomId("searchModal")
    .setTitle("단어 찾기!");

  // 텍스트 입력 필드 생성
  const input = new TextInputBuilder()
    .setCustomId("keywordInput")
    .setLabel("찾고 싶은 단어를 입력해보세요!: ")
    .setStyle(1);

  // 모달에 입력 필드를 추가
  const row = new ActionRowBuilder<TextInputBuilder>().addComponents(input); // 타입 명시
  modal.addComponents(row);

  return modal;
}

export { searchModal };
