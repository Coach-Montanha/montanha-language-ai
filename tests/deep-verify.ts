import assert from "node:assert";
import {
  safeExtractJson,
  classifyUserIntent,
  generateLocalTutorReply,
  checkGrammarLocal,
} from "../src/services/ai-engine";
import { getTutorsForLanguage } from "../src/data/tutors";

console.log("🚀 Starting Deep Verification Suite for Montanha Language AI (@eco /boost)...");

// Test 1: safeExtractJson robustness
console.log("➡️ Test 1: safeExtractJson robustness");
{
  // 1a: Plain JSON
  const res1 = safeExtractJson<{ a: number }>('{"a": 42}');
  assert.strictEqual(res1.a, 42, "Failed to parse plain JSON");

  // 1b: JSON enclosed in markdown code fences
  const res2 = safeExtractJson<{ role: string }>('```json\n{"role": "assistant"}\n```');
  assert.strictEqual(res2.role, "assistant", "Failed to parse code-fenced JSON");

  // 1c: JSON with LLM conversational preamble and trailing markdown
  const res3 = safeExtractJson<{ hasError: boolean; replyText: string }>(
    'Here is the response according to your specifications:\n```json\n{\n  "hasError": false,\n  "replyText": "Hello there!"\n}\n```\nHope this helps!'
  );
  assert.strictEqual(res3.hasError, false);
  assert.strictEqual(res3.replyText, "Hello there!");

  // 1d: Array JSON
  const res4 = safeExtractJson<string[]>('```json\n["option1", "option2"]\n```');
  assert.strictEqual(res4.length, 2);
  assert.strictEqual(res4[0], "option1");

  console.log("  ✓ safeExtractJson passed all scenarios!");
}

// Test 2: Intent classification across new and existing intents
console.log("➡️ Test 2: Intent classification");
{
  assert.strictEqual(classifyUserIntent("Como se pronuncia through?"), "question_pronunciation");
  assert.strictEqual(classifyUserIntent("Qual a pronúncia de thought?"), "question_pronunciation");
  assert.strictEqual(classifyUserIntent("How to pronounce schedule?"), "question_pronunciation");

  assert.strictEqual(classifyUserIntent("Hoje eu fui treinar na academia"), "topic_fitness_health");
  assert.strictEqual(classifyUserIntent("I love kettlebell and running workout"), "topic_fitness_health");
  assert.strictEqual(classifyUserIntent("Heute gehe ich ins Gym zum Training"), "topic_fitness_health");

  assert.strictEqual(classifyUserIntent("Você gosta de assistir filmes ou ler livros?"), "topic_movies_books");
  assert.strictEqual(classifyUserIntent("Which book are you currently reading?"), "topic_movies_books");

  assert.strictEqual(classifyUserIntent("Qual o horário do museu?"), "question_museum_hours");
  assert.strictEqual(classifyUserIntent("O que você recomenda para o jantar?"), "question_food_recommendation");
  assert.strictEqual(classifyUserIntent("Fale sobre a sua cidade"), "topic_city");
  assert.strictEqual(classifyUserIntent("Graças a Deus por tudo"), "topic_faith");

  console.log("  ✓ classifyUserIntent passed all scenarios!");
}

// Test 3: Koine Greek conversationMode support and replies
console.log("➡️ Test 3: Koine Greek conversationMode & local replies");
{
  const greekTutors = getTutorsForLanguage("el-koine");
  assert.ok(greekTutors.length > 0, "No Koine Greek tutor found");
  const tutor = greekTutors[0]!;

  const chal = generateLocalTutorReply("koinê", tutor, 2, "challenge");
  assert.ok(chal.replyText.includes("Próklêsis"), `Expected Greek challenge, got: ${chal.replyText}`);
  assert.ok(chal.translationPt.includes("Desafio"), `Expected Portuguese translation, got: ${chal.translationPt}`);

  const deb = generateLocalTutorReply("sophía", tutor, 2, "debate");
  assert.ok(deb.replyText.includes("Lógos axiólogos"), `Expected Greek debate, got: ${deb.replyText}`);

  const gram = generateLocalTutorReply("lógos", tutor, 2, "grammar");
  assert.ok(gram.replyText.includes("metà zêlou"), `Expected Greek grammar expression, got: ${gram.replyText}`);

  const pron = generateLocalTutorReply("prophorá", tutor, 2, "chat");
  assert.ok(pron.replyText.length > 0);

  console.log("  ✓ Koine Greek conversation modes passed!");
}

// Test 4: Multi-language grammar check
console.log("➡️ Test 4: Multi-language grammar check");
{
  // English
  const enErr = checkGrammarLocal("I have 25 years old", "en");
  assert.strictEqual(enErr.hasError, true);
  assert.ok(enErr.explanationPt.includes("to be"));

  const enHeLikes = checkGrammarLocal("he like music", "en");
  assert.strictEqual(enHeLikes.hasError, true);

  // Spanish
  const esAnos = checkGrammarLocal("yo tengo 25 anos", "es");
  assert.strictEqual(esAnos.hasError, true);
  assert.ok(esAnos.explanationPt.includes("años"));

  const esMucho = checkGrammarLocal("eso es muy mucho para mí", "es");
  assert.strictEqual(esMucho.hasError, true);
  assert.strictEqual(esMucho.corrected, "eso es muchísimo para mí");

  const esCansado = checkGrammarLocal("yo soy cansado hoy", "es");
  assert.strictEqual(esCansado.hasError, true);
  assert.ok(esCansado.explanationPt.includes("estar"));

  // French
  const frAns = checkGrammarLocal("je suis 20 ans", "fr");
  assert.strictEqual(frAns.hasError, true);
  assert.ok(frAns.explanationPt.includes("avoir"));

  const frFini = checkGrammarLocal("je suis fini", "fr");
  assert.strictEqual(frFini.hasError, true);

  // German
  const deJahre = checkGrammarLocal("ich habe 20 jahre", "de");
  assert.strictEqual(deJahre.hasError, true);
  assert.ok(deJahre.explanationPt.includes("sein"));

  // Italian
  const itAnni = checkGrammarLocal("io sono 20 anni", "it");
  assert.strictEqual(itAnni.hasError, true);
  assert.ok(itAnni.explanationPt.includes("avere"));

  console.log("  ✓ Multi-language grammar check passed!");
}

console.log("\n🎉 ALL 4 DEEP VERIFICATION TEST SUITES PASSED FLAWLESSLY!\n");
