import { Flashcard } from "@/types/language";
import { toast } from "sonner";

/**
 * Escapa uma célula de texto para o padrão RFC 4180 CSV
 */
function escapeCsvCell(text: string): string {
  if (!text) return '""';
  const clean = text.replace(/"/g, '""');
  return `"${clean}"`;
}

/**
 * Dispara o download de um arquivo de texto no navegador
 */
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exporta flashcards para CSV compatível com o Anki
 * Formato das colunas:
 * 1. Frente (Palavra + Guia Fonético)
 * 2. Verso (Tradução em Português)
 * 3. Frase Exemplo
 * 4. Tradução do Exemplo
 * 5. Tags / Categoria
 */
export function exportToAnkiCsv(
  cards: Flashcard[],
  languageName: string = "SmartLanguage",
  filenamePrefix: string = "anki-deck"
): void {
  if (!cards || cards.length === 0) {
    toast.error("Nenhum cartão para exportar.");
    return;
  }

  // UTF-8 BOM para garantir suporte a Cirílico, Japonês, Grego e acentos no Anki e Excel
  const BOM = "\uFEFF";
  const header = ["Frente", "Verso", "Exemplo", "TraducaoExemplo", "Categoria"].map(escapeCsvCell).join(",");

  const rows = cards.map((card) => {
    const front = card.phonetic ? `${card.word} [${card.phonetic}]` : card.word;
    const back = card.translation;
    const example = card.exampleSentence || "";
    const examplePt = card.exampleTranslation || "";
    const category = (card as any).category || card.theme || "Geral";

    return [
      escapeCsvCell(front),
      escapeCsvCell(back),
      escapeCsvCell(example),
      escapeCsvCell(examplePt),
      escapeCsvCell(category),
    ].join(",");
  });

  const csvContent = BOM + [header, ...rows].join("\r\n");
  const fileName = `${filenamePrefix}-${languageName.toLowerCase()}-${cards.length}cards.csv`;

  downloadFile(csvContent, fileName, "text/csv;charset=utf-8;");
  toast.success(`Baralho Anki exportado com sucesso! (${cards.length} cartões)`);
}

/**
 * Exporta cartões em formato Markdown (folha de estudos / apostila)
 */
export function exportToMarkdown(
  cards: Flashcard[],
  languageName: string = "Smart Language",
  filenamePrefix: string = "guia-estudo"
): void {
  if (!cards || cards.length === 0) {
    toast.error("Nenhum cartão para exportar.");
    return;
  }

  const lines: string[] = [
    `# 📚 Guia de Vocabulário • ${languageName}`,
    `*Gerado pelo Smart Language Studio com ${cards.length} termos selecionados.*\n`,
    `| Termo | Pronúncia | Tradução (PT) | Frase Exemplo | Categoria |`,
    `| :--- | :--- | :--- | :--- | :--- |`,
  ];

  cards.forEach((c) => {
    const word = c.word.replace(/\|/g, "\\|");
    const phonetic = (c.phonetic || "-").replace(/\|/g, "\\|");
    const translation = c.translation.replace(/\|/g, "\\|");
    const example = c.exampleSentence
      ? `${c.exampleSentence} *(${c.exampleTranslation || ""})*`.replace(/\|/g, "\\|")
      : "-";
    const cat = (c as any).category || c.theme || "Geral";

    lines.push(`| **${word}** | \`${phonetic}\` | ${translation} | ${example} | ${cat} |`);
  });

  lines.push("\n---\n*Dica de estudo: Revise 5 a 10 termos por dia com repetição espaçada.*");

  const mdContent = lines.join("\n");
  const fileName = `${filenamePrefix}-${languageName.toLowerCase()}.md`;

  downloadFile(mdContent, fileName, "text/markdown;charset=utf-8;");
  toast.success(`Guia de estudo Markdown baixado! (${cards.length} termos)`);
}
