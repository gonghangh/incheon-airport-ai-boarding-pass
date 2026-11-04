/**
 * 인천공항고 읽걷쓰AI 미래 항공권 발권기 (Incheon Airport AI Boarding Pass Generator)
 * 2026 인천 AI·SW 미래채움 교육페스티벌 인천공항고등학교 부스용 웹 애플리케이션
 * 슬로건: "읽걷쓰AI, 인간다움을 품고 AI와 함께 꿈을 이루다"
 */

document.addEventListener("DOMContentLoaded", () => {
  // =========================================================================
  // 1. State & Storage
  // =========================================================================
  const MAX_KEYWORDS = 3;
  let selectedKeywords = ["우주탐험", "인공지능", "꿈"];
  let currentCabinClass = "DREAM FIRST";
  let ticketCounter = parseInt(localStorage.getItem("icna_ticket_seq") || "1", 10);

  let aiConfig = {
    provider: localStorage.getItem("icna_ai_provider") || "local",
    apiKey: localStorage.getItem("icna_ai_key") || ""
  };

  // Dynamic @page style tag for 3x5 photo paper vs A4 printing
  const printPageStyleEl = document.createElement("style");
  printPageStyleEl.id = "dynamicPrintPageStyle";
  document.head.appendChild(printPageStyleEl);

  // =========================================================================
  // 2. Curated Future Destinations & Smart Local Poetic Templates (Fallback)
  // =========================================================================
  const DESTINATION_CATALOG = [
    {
      matchKeywords: ["우주탐험", "항공우주", "자유", "도전"],
      codes: ["COS", "ORB", "STR", "GAL"],
      names: [
        "네오 코스모스 스테이션",
        "성간 오디세이 스카이포트",
        "라그랑주 별빛 정거장",
        "안드로메다 호라이즌 허브"
      ],
      gatePrefix: "ST",
      flightPrefix: "IA 2036"
    },
    {
      matchKeywords: ["인공지능", "로봇", "창의력", "따뜻한기술"],
      codes: ["NXT", "SYN", "HMN", "AII"],
      names: [
        "실리콘 휴먼밸리 AI 캠퍼스",
        "시너지 신경망 이노베이션 시티",
        "네오 사피엔스 공존 연구소",
        "하모니 퀀텀 스마트포트"
      ],
      gatePrefix: "AI",
      flightPrefix: "IA 2026"
    },
    {
      matchKeywords: ["예술", "행복", "꿈", "열정"],
      codes: ["ART", "MUSE", "AUR", " Joy".trim().toUpperCase()],
      names: [
        "오로라 크리에이티브 아틀리에",
        "르네상스 빛의 교향곡 광장",
        "드리머스 판타지아 아일랜드",
        "라라랜드 인스피레이션 타워"
      ],
      gatePrefix: "DR",
      flightPrefix: "IA 2030"
    },
    {
      matchKeywords: ["친환경", "글로벌리더", "행복", "따뜻한기술"],
      codes: ["ECO", "GAI", "VER", "BLU"],
      names: [
        "가이아 그린퓨처 메트로폴리스",
        "에메랄드 바이오 에코돔",
        "솔라 브리즈 글로벌 UN 센터",
        "퓨어 오션 스카이 가든"
      ],
      gatePrefix: "GR",
      flightPrefix: "IA 2032"
    },
    {
      matchKeywords: ["꿈", "도전", "열정", "창의력", "자유"],
      codes: ["DRM", "SKY", "VOY", "WNG"],
      names: [
        "호라이즌 드림 스카이포트",
        "인피니티 챌린지 활주로",
        "골든 콤파스 미래 전망대",
        "블루윙즈 프리덤 시티"
      ],
      gatePrefix: "RW",
      flightPrefix: "IA 2028"
    }
  ];

  // Track last selected indices so every click produces a noticeably new poem
  let lastLineIndices = [-1, -1, -1];
  let lastDestSubIndex = -1;

  // Korean Postposition (조사) Helper: 은/는, 이/가, 을/를, 과/와, 으로/로
  function hasFinalConsonant(word) {
    if (!word || typeof word !== "string") return false;
    const lastChar = word.trim().charCodeAt(word.trim().length - 1);
    if (lastChar < 0xac00 || lastChar > 0xd7a3) return false;
    return (lastChar - 0xac00) % 28 !== 0;
  }

  function hasRieulConsonant(word) {
    if (!word || typeof word !== "string") return false;
    const lastChar = word.trim().charCodeAt(word.trim().length - 1);
    if (lastChar < 0xac00 || lastChar > 0xd7a3) return false;
    return (lastChar - 0xac00) % 28 === 8;
  }

  function josa(word, pair) {
    if (pair === "으로/로") {
      const needEuro = hasFinalConsonant(word) && !hasRieulConsonant(word);
      return `${word}${needEuro ? "으로" : "로"}`;
    }
    const [withConsonant, withoutConsonant] = pair.split("/");
    return `${word}${hasFinalConsonant(word) ? withConsonant : withoutConsonant}`;
  }

  function pickDifferentIndex(length, prevIndex) {
    if (length <= 1) return 0;
    let idx = Math.floor(Math.random() * length);
    if (idx === prevIndex) {
      idx = (idx + 1 + Math.floor(Math.random() * (length - 1))) % length;
    }
    return idx;
  }

  /**
   * Generates a rich, poetic 3-line poem and destination locally
   * Changes dynamically on every single click even with the same inputs!
   */
  function generateLocalTicketContent(name, keywords) {
    const k1 = keywords[0] || "꿈";
    const k2 = keywords[1] || "인공지능";
    const k3 = keywords[2] || "도전";

    // Pick best matching destination category
    let matchedCategories = [];
    let maxScore = 0;
    DESTINATION_CATALOG.forEach((dest) => {
      const score = keywords.filter((k) => dest.matchKeywords.includes(k)).length;
      if (score > maxScore) {
        maxScore = score;
        matchedCategories = [dest];
      } else if (score === maxScore) {
        matchedCategories.push(dest);
      }
    });

    const chosenCategory =
      matchedCategories[Math.floor(Math.random() * matchedCategories.length)] ||
      DESTINATION_CATALOG[0];

    const subIdx = pickDifferentIndex(chosenCategory.names.length, lastDestSubIndex);
    lastDestSubIndex = subIdx;

    const destCode = chosenCategory.codes[subIdx % chosenCategory.codes.length];
    const destName = chosenCategory.names[subIdx];

    // 1행: 관람객의 키워드를 담은 현재의 발걸음 (읽기·걷기) - 10 varieties
    const line1Templates = [
      `${josa(k1, "과/와")} ${josa(k2, "을/를")} 깊이 읽으며 오늘의 교정을 힘차게 걸어가는 ${name}님의 발걸음,`,
      `마음속 ${josa(k1, "과/와")} 뜨거운 ${josa(k2, "을/를")} 나침반 삼아 세상을 읽고 뚜벅뚜벅 걸어온 시간,`,
      `${k1}의 질문과 ${k2}의 상상력을 품고 인간다움의 길을 걸어가는 ${name}님의 빛나는 오늘,`,
      `책장 속 ${josa(k1, "을/를")} 읽어 내고 길 위의 ${josa(k2, "을/를")} 마주하며 한 걸음씩 단단해진 당신의 하루,`,
      `${k1}의 설렘과 ${k2}의 지혜를 두 눈에 담고, 스스로의 계절을 성실히 걸어가는 아름다운 청년이여,`,
      `세상이라는 거대한 책을 ${josa(k1, "으로/로")} 읽고, ${k2}의 보폭으로 멈추지 않고 걸어가는 ${name}님의 여정,`,
      `누구보다 따뜻한 시선으로 ${josa(k1, "을/를")} 읽고, ${josa(k2, "과/와")} 함께 내일의 지도를 걸어 나가는 지금,`,
      `작은 호기심에서 시작된 ${josa(k1, "과/와")} ${josa(k2, "이/가")} ${name}님의 발끝에서 새로운 길로 깨어나는 순간,`,
      `오늘 읽은 한 줄의 ${josa(k1, "과/와")} 오늘 걸은 한 뼘의 ${josa(k2, "이/가")} 모여 당신만의 역사가 되는 시간,`,
      `${k1}의 가치를 가슴에 새기고 ${k2}의 들판을 당당히 걸어가는 ${name}님의 눈부신 발자국마다,`
    ];

    // 2행: 인천공항에서 이륙하는 미래의 꿈과 비상 (쓰기·AI) - 10 varieties
    const line2Templates = [
      `인천공항 활주로 위로 읽걷쓰AI의 날개를 달고, ${k3}의 창공을 향해 나만의 이야기를 써 내려가며,`,
      `따뜻한 AI와 함께 인천공항을 박차고 올라, ${josa(k3, "으로/로")} 가득한 미래 항로 위에 꿈의 문장을 수놓으니,`,
      `인천공항고의 푸른 하늘에서 AI와 호흡을 맞춰, ${josa(k3, "을/를")} 향한 비상의 궤적을 당당히 써 내려갈 때,`,
      `인간다움을 품은 AI를 부기장 삼아 인천공항을 이륙하며, 구름 너머 ${k3}의 신대륙에 첫 문장을 기록하고,`,
      `서해의 바람을 가르는 인천공항 활주로 끝에서, 읽걷쓰AI와 함께 ${k3}의 별자리를 하늘 가득 써 내려가네,`,
      `차가운 기술을 넘어 따뜻한 AI와 손을 맞잡고, 인천공항에서 ${k3}의 성층권으로 거침없이 날아오르며,`,
      `백지 같던 하늘 위에 ${k1}·${k2}·${k3}의 세 가지 잉크로, AI와 함께 세상에 없던 미래를 힘차게 써 내려가니,`,
      `인천공항 제1활주로를 박차고 오르는 은빛 날개처럼, AI의 지성에 ${name}님의 ${josa(k3, "을/를")} 더해 비상할 때,`,
      `한계를 모르는 ${k3}의 엔진에 읽걷쓰AI의 추력을 더해, 인천공항에서 세계와 우주를 잇는 항로를 개척하며,`,
      `당신이 써 내려간 ${k3}의 문장들이 AI의 날개를 타고, 인천공항의 푸른 수평선 너머로 끝없이 펼쳐지네.`
    ];

    // 3행: 목적지에 도착해 맞이할 찬란한 순간 (응원과 희망) - 10 varieties
    const line3Templates = [
      `마침내 닿은 '${destName}'에서 ${name}님은 세상 가장 눈부신 주인공으로 찬란히 꽃피우리라!`,
      `도착한 미래의 별빛 아래, ${k1}·${k2}·${josa(k3, "이/가")} 하나로 피어나 ${name}님의 내일을 영원히 밝혀주리라.`,
      `찬란한 '${destName}'에 착륙하는 순간, 인간다움을 품은 당신의 꿈은 가장 아름다운 현실이 되리라!`,
      `기다리던 '${destName}'의 활주로가 열리고, ${name}님이 그려온 모든 소망이 별처럼 쏟아져 내리리라.`,
      `그곳 '${destName}'에서 맞이할 눈부신 아침, 당신의 ${josa(k3, "은/는")} 세상을 바꾸는 따뜻한 기적이 되리라!`,
      `비로소 마주한 '${destName}'의 하늘 아래, 인간다움과 AI로 빚어낸 ${name}님의 미래에 뜨거운 박수를 보내노라.`,
      `꿈꾸던 '${destName}'에 첫발을 내딛는 날, 오늘 심은 ${k1}의 씨앗이 가장 거대한 희망의 숲으로 완성되리라!`,
      `구름 너머 '${destName}'에 닿은 당신의 비행, ${name}님이라는 이름 석 자가 미래의 별자리로 영원히 빛나리라.`,
      `마침내 도착한 '${destName}'에서, 오늘의 설렘을 기억하며 더 넓은 세상을 품는 자랑스러운 리더가 되리라!`,
      `축복으로 가득한 '${destName}'의 게이트가 열릴 때, ${name}님의 앞날에 가장 눈부신 순풍만이 함께하기를!`
    ];

    const idx1 = pickDifferentIndex(line1Templates.length, lastLineIndices[0]);
    const idx2 = pickDifferentIndex(line2Templates.length, lastLineIndices[1]);
    const idx3 = pickDifferentIndex(line3Templates.length, lastLineIndices[2]);
    lastLineIndices = [idx1, idx2, idx3];

    const randomGateNum = String(Math.floor(Math.random() * 24) + 1).padStart(2, "0");
    const randomRow = String(Math.floor(Math.random() * 32) + 1).padStart(2, "0");
    const randomCol = ["A", "C", "F", "K"][Math.floor(Math.random() * 4)];

    return {
      destCode,
      destName,
      flightNo: chosenCategory.flightPrefix,
      gate: `${chosenCategory.gatePrefix}-${randomGateNum}`,
      seat: `${randomRow}${randomCol}`,
      line1: line1Templates[idx1],
      line2: line2Templates[idx2],
      line3: line3Templates[idx3]
    };
  }

  // =========================================================================
  // 3. Generative AI API Integration (Gemini / OpenAI) with Instant Fallback
  // =========================================================================
  async function generateAITicketContent(name, keywords) {
    if (aiConfig.provider === "local" || !aiConfig.apiKey.trim()) {
      // Simulate brief 450ms boarding pass calculation effect
      await new Promise((r) => setTimeout(r, 450));
      return generateLocalTicketContent(name, keywords);
    }

    const promptText = `
당신은 '2026 인천 AI·SW 미래채움 교육페스티벌' 인천공항고등학교 부스의 <읽걷쓰AI 미래 항공권 발권기> 시인 겸 AI 기장입니다.
슬로건은 "읽걷쓰AI, 인간다움을 품고 AI와 함께 꿈을 이루다" 입니다.

[탑승객 정보]
- 이름(닉네임): ${name}
- 선택한 미래 키워드 3가지: ${keywords.join(", ")}

다음 JSON 형식으로만 응답하세요 (마크다운 코드블록 없이 순수 JSON):
{
  "destCode": "미래 목적지 영문 대문자 3글자 (예: COS, NXT, DRM, ART, SKY)",
  "destName": "키워드 3가지를 융합한 감성적이고 미래지향적인 목적지 한글 명칭 (14자 이내)",
  "line1": "1행 (읽기·걷기): 관람객의 키워드를 담아 세상을 읽고 걸어가는 현재의 발걸음 (45~62자 내외의 감성적인 시구)",
  "line2": "2행 (쓰기·AI): 인천공항에서 AI의 날개를 달고 이륙하며 미래의 꿈을 써 내려가는 비상 (45~62자 내외의 시구)",
  "line3": "3행 (응원과 희망): 목적지에 도착해 맞이할 찬란한 순간과 관람객 이름을 담은 따뜻한 응원 (45~62자 내외의 시구)"
}
`.trim();

    try {
      if (aiConfig.provider === "gemini") {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(
          aiConfig.apiKey.trim()
        )}`;
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: {
              temperature: 0.8,
              responseMimeType: "application/json"
            }
          })
        });

        if (!response.ok) throw new Error(`Gemini API Error: ${response.status}`);
        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const parsed = JSON.parse(rawText);
        const fallback = generateLocalTicketContent(name, keywords);

        return {
          destCode: (parsed.destCode || fallback.destCode).slice(0, 3).toUpperCase(),
          destName: parsed.destName || fallback.destName,
          flightNo: fallback.flightNo,
          gate: fallback.gate,
          seat: fallback.seat,
          line1: parsed.line1 || fallback.line1,
          line2: parsed.line2 || fallback.line2,
          line3: parsed.line3 || fallback.line3
        };
      }

      if (aiConfig.provider === "openai") {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${aiConfig.apiKey.trim()}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            response_format: { type: "json_object" },
            messages: [
              {
                role: "system",
                content: "항상 지정된 JSON 포맷으로만 응답하는 인천공항고 읽걷쓰AI 시문 생성기입니다."
              },
              { role: "user", content: promptText }
            ],
            temperature: 0.8
          })
        });

        if (!response.ok) throw new Error(`OpenAI API Error: ${response.status}`);
        const data = await response.json();
        const parsed = JSON.parse(data.choices[0].message.content);
        const fallback = generateLocalTicketContent(name, keywords);

        return {
          destCode: (parsed.destCode || fallback.destCode).slice(0, 3).toUpperCase(),
          destName: parsed.destName || fallback.destName,
          flightNo: fallback.flightNo,
          gate: fallback.gate,
          seat: fallback.seat,
          line1: parsed.line1 || fallback.line1,
          line2: parsed.line2 || fallback.line2,
          line3: parsed.line3 || fallback.line3
        };
      }
    } catch (err) {
      console.warn("AI API 호출 실패, 내장 스마트 시학 엔진으로 자동 전환합니다:", err);
      showToast("현장 네트워크 보호를 위해 내장 읽걷쓰AI 엔진으로 즉시 발권했습니다 ✈️");
      return generateLocalTicketContent(name, keywords);
    }

    return generateLocalTicketContent(name, keywords);
  }

  // =========================================================================
  // 4. DOM Elements
  // =========================================================================
  const passengerNameInput = document.getElementById("passengerName");
  const clearNameBtn = document.getElementById("clearNameBtn");
  const keywordCounter = document.getElementById("keywordCounter");
  const selectedKeywordsBar = document.getElementById("selectedKeywordsBar");
  const keywordChipGrid = document.getElementById("keywordChipGrid");
  const customKeywordInput = document.getElementById("customKeywordInput");
  const addCustomKeywordBtn = document.getElementById("addCustomKeywordBtn");
  const randomKeywordBtn = document.getElementById("randomKeywordBtn");
  const boardingForm = document.getElementById("boardingForm");
  const resetKioskBtn = document.getElementById("resetKioskBtn");
  const printPaperModeSelect = document.getElementById("printPaperMode");
  const ticketLoadingOverlay = document.getElementById("ticketLoadingOverlay");

  // Ticket Card Elements
  const bpCabinClass = document.getElementById("bpCabinClass");
  const bpFlightNo = document.getElementById("bpFlightNo");
  const bpKeywordsInline = document.getElementById("bpKeywordsInline");
  const bpDestCode = document.getElementById("bpDestCode");
  const bpDestName = document.getElementById("bpDestName");
  const poemLine1 = document.getElementById("poemLine1");
  const poemLine2 = document.getElementById("poemLine2");
  const poemLine3 = document.getElementById("poemLine3");
  const bpPassengerName = document.getElementById("bpPassengerName");
  const bpDate = document.getElementById("bpDate");
  const bpGate = document.getElementById("bpGate");
  const bpBoardingTime = document.getElementById("bpBoardingTime");
  const bpSeat = document.getElementById("bpSeat");

  // Stub Elements
  const stubDestCode = document.getElementById("stubDestCode");
  const stubDestName = document.getElementById("stubDestName");
  const stubPassengerName = document.getElementById("stubPassengerName");
  const stubFlightNo = document.getElementById("stubFlightNo");
  const stubGate = document.getElementById("stubGate");
  const stubSeat = document.getElementById("stubSeat");
  const stubKeywords = document.getElementById("stubKeywords");
  const bpBarcodeSvg = document.getElementById("bpBarcodeSvg");
  const bpSerialCode = document.getElementById("bpSerialCode");

  // Action Buttons
  const downloadTicketBtn = document.getElementById("downloadTicketBtn");
  const printTicketBtn = document.getElementById("printTicketBtn");

  // Modal Elements
  const openApiModalBtn = document.getElementById("openApiModalBtn");
  const closeApiModalBtn = document.getElementById("closeApiModalBtn");
  const apiModal = document.getElementById("apiModal");
  const aiProviderSelect = document.getElementById("aiProviderSelect");
  const apiKeyInput = document.getElementById("apiKeyInput");
  const saveApiModalBtn = document.getElementById("saveApiModalBtn");
  const clearApiKeyBtn = document.getElementById("clearApiKeyBtn");
  const apiStatusDot = document.getElementById("apiStatusDot");
  const apiStatusLabel = document.getElementById("apiStatusLabel");
  const toastMsg = document.getElementById("toastMsg");

  // =========================================================================
  // 5. UI Helpers (Keywords, Barcode, Print Rules, Toast)
  // =========================================================================
  let toastTimer = null;
  function showToast(message) {
    toastMsg.textContent = message;
    toastMsg.classList.remove("hidden");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastMsg.classList.add("hidden");
    }, 3200);
  }

  function renderKeywordsUI() {
    keywordCounter.textContent = `${selectedKeywords.length} / ${MAX_KEYWORDS} 선택됨`;

    // Selected bar
    selectedKeywordsBar.innerHTML = "";
    if (selectedKeywords.length === 0) {
      const hint = document.createElement("span");
      hint.className = "empty-keyword-hint";
      hint.textContent = "아래 추천 태그를 클릭하거나 직접 입력해 3개를 채워주세요 ✨";
      selectedKeywordsBar.appendChild(hint);
    } else {
      selectedKeywords.forEach((kw) => {
        const tag = document.createElement("span");
        tag.className = "selected-tag";
        tag.innerHTML = `#${kw} <button type="button" aria-label="${kw} 삭제">✕</button>`;
        tag.querySelector("button").addEventListener("click", () => {
          removeKeyword(kw);
        });
        selectedKeywordsBar.appendChild(tag);
      });
    }

    // Update chip active states
    const chips = keywordChipGrid.querySelectorAll(".keyword-chip");
    chips.forEach((chip) => {
      const kw = chip.dataset.keyword;
      if (selectedKeywords.includes(kw)) {
        chip.classList.add("active");
      } else {
        chip.classList.remove("active");
      }
    });
  }

  function toggleKeyword(kw) {
    const clean = kw.replace(/^#+/, "").trim();
    if (!clean) return;

    if (selectedKeywords.includes(clean)) {
      removeKeyword(clean);
      return;
    }

    if (selectedKeywords.length >= MAX_KEYWORDS) {
      // Replace the oldest keyword smoothly or notify
      selectedKeywords.shift();
    }

    selectedKeywords.push(clean);
    renderKeywordsUI();
    refreshLocalPreviewInstant();
  }

  function removeKeyword(kw) {
    selectedKeywords = selectedKeywords.filter((item) => item !== kw);
    renderKeywordsUI();
    refreshLocalPreviewInstant();
  }

  function refreshLocalPreviewInstant() {
    const rawName = passengerNameInput.value.trim() || "미래비행사";
    const previewKeywords = [
      selectedKeywords[0] || "꿈",
      selectedKeywords[1] || "인공지능",
      selectedKeywords[2] || "도전"
    ];
    const result = generateLocalTicketContent(rawName, previewKeywords);
    const { dateStr, timeStr } = formatCurrentDateTime();

    bpCabinClass.textContent = currentCabinClass;
    bpFlightNo.textContent = result.flightNo;
    bpKeywordsInline.textContent = previewKeywords.map((k) => `#${k}`).join(" ");
    bpDestCode.textContent = result.destCode;
    bpDestName.textContent = result.destName;

    poemLine1.textContent = result.line1;
    poemLine2.textContent = result.line2;
    poemLine3.textContent = result.line3;

    // Subtle highlight animation on poem box
    const poemBox = document.querySelector(".bp-poem-box");
    if (poemBox) {
      poemBox.classList.remove("poem-refreshed");
      void poemBox.offsetWidth;
      poemBox.classList.add("poem-refreshed");
    }

    bpPassengerName.textContent = `${rawName} / DREAMER`;
    bpDate.textContent = dateStr;
    bpGate.textContent = result.gate;
    bpBoardingTime.textContent = timeStr;
    bpSeat.textContent = result.seat;

    stubDestCode.textContent = result.destCode;
    stubDestName.textContent = result.destName;
    stubPassengerName.textContent = rawName;
    stubFlightNo.textContent = result.flightNo;
    stubGate.textContent = result.gate;
    stubSeat.textContent = result.seat;
    stubKeywords.innerHTML = previewKeywords.map((k) => `<span>#${k}</span>`).join("");

    const seqFormatted = String(ticketCounter).padStart(3, "0");
    const serial = `ICN-2026-${result.destCode}${seqFormatted}`;
    bpSerialCode.textContent = serial;
    renderBarcode(`${serial}-${rawName}-${previewKeywords.join("-")}`);
  }

  function renderBarcode(seedText) {
    // Deterministic crisp SVG barcode generator
    let hash = 2166136261;
    for (let i = 0; i < seedText.length; i++) {
      hash ^= seedText.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }

    const totalWidth = 180;
    let x = 4;
    let barsHtml = "";

    // Guard bars left
    barsHtml += `<rect x="0" y="0" width="2" height="38" fill="#0F2B5C"/>`;
    barsHtml += `<rect x="3" y="0" width="1" height="38" fill="#0F2B5C"/>`;
    x = 6;

    let step = 0;
    while (x < totalWidth - 6) {
      const val = Math.abs((hash >> (step % 16)) ^ (step * 31));
      const barWidth = (val % 3) + 1;
      const gapWidth = ((val >> 2) % 2) + 1;
      if (x + barWidth > totalWidth - 6) break;
      barsHtml += `<rect x="${x}" y="0" width="${barWidth}" height="38" fill="#0F2B5C"/>`;
      x += barWidth + gapWidth;
      step++;
    }

    // Guard bars right
    barsHtml += `<rect x="${totalWidth - 4}" y="0" width="1" height="38" fill="#0F2B5C"/>`;
    barsHtml += `<rect x="${totalWidth - 2}" y="0" width="2" height="38" fill="#0F2B5C"/>`;

    bpBarcodeSvg.innerHTML = barsHtml;
  }

  function updatePrintPageRule() {
    const mode = printPaperModeSelect.value;
    document.body.classList.remove("print-portrait-3x5");

    if (mode === "5x3-landscape") {
      printPageStyleEl.textContent = `
        @media print {
          @page {
            size: 5in 3in;
            margin: 0;
          }
        }
      `;
    } else if (mode === "3x5-portrait") {
      document.body.classList.add("print-portrait-3x5");
      printPageStyleEl.textContent = `
        @media print {
          @page {
            size: 3in 5in;
            margin: 0;
          }
        }
      `;
    } else {
      // A4 Center
      printPageStyleEl.textContent = `
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
        }
      `;
    }
  }

  function formatCurrentDateTime() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const hh = String(now.getHours()).padStart(2, "0");
    const min = String(now.getMinutes()).padStart(2, "0");
    return {
      dateStr: `${yyyy}.${mm}.${dd}`,
      timeStr: `${hh}:${min}`
    };
  }

  function updateApiStatusBadge() {
    if (aiConfig.provider !== "local" && aiConfig.apiKey.trim()) {
      apiStatusDot.classList.add("connected");
      const providerName = aiConfig.provider === "gemini" ? "Gemini AI" : "OpenAI";
      apiStatusLabel.textContent = `${providerName} 실시간 연동됨`;
    } else {
      apiStatusDot.classList.remove("connected");
      apiStatusLabel.textContent = "읽걷쓰AI 스마트 엔진 (즉시 발권)";
    }
  }

  // =========================================================================
  // 6. Issue Boarding Pass Action
  // =========================================================================
  async function issueBoardingPass(isInitial = false) {
    const rawName = passengerNameInput.value.trim();
    const passengerName = rawName || "미래비행사";

    if (!isInitial && !rawName) {
      passengerNameInput.value = "미래비행사";
    }

    // Ensure 3 keywords (auto-fill if fewer than 3)
    const defaultPool = ["우주탐험", "인공지능", "꿈", "도전", "창의력", "행복", "열정"];
    while (selectedKeywords.length < MAX_KEYWORDS) {
      const candidate = defaultPool.find((k) => !selectedKeywords.includes(k));
      if (candidate) selectedKeywords.push(candidate);
      else break;
    }
    renderKeywordsUI();

    if (!isInitial) {
      ticketLoadingOverlay.classList.remove("hidden");
    }

    const result = await generateAITicketContent(passengerName, selectedKeywords);
    const { dateStr, timeStr } = formatCurrentDateTime();

    // Update Ticket DOM
    bpCabinClass.textContent = currentCabinClass;
    bpFlightNo.textContent = result.flightNo;
    bpKeywordsInline.textContent = selectedKeywords.map((k) => `#${k}`).join(" ");
    bpDestCode.textContent = result.destCode;
    bpDestName.textContent = result.destName;

    poemLine1.textContent = result.line1;
    poemLine2.textContent = result.line2;
    poemLine3.textContent = result.line3;

    bpPassengerName.textContent = `${passengerName} / DREAMER`;
    bpDate.textContent = dateStr;
    bpGate.textContent = result.gate;
    bpBoardingTime.textContent = timeStr;
    bpSeat.textContent = result.seat;

    // Update Stub DOM
    stubDestCode.textContent = result.destCode;
    stubDestName.textContent = result.destName;
    stubPassengerName.textContent = passengerName;
    stubFlightNo.textContent = result.flightNo;
    stubGate.textContent = result.gate;
    stubSeat.textContent = result.seat;

    stubKeywords.innerHTML = selectedKeywords.map((k) => `<span>#${k}</span>`).join("");

    const seqFormatted = String(ticketCounter).padStart(3, "0");
    const serial = `ICN-2026-${result.destCode}${seqFormatted}`;
    bpSerialCode.textContent = serial;
    renderBarcode(`${serial}-${passengerName}-${selectedKeywords.join("-")}`);

    if (!isInitial) {
      ticketCounter++;
      localStorage.setItem("icna_ticket_seq", String(ticketCounter));
      ticketLoadingOverlay.classList.add("hidden");
      showToast(`✨ ${passengerName}님의 미래 항공권이 성공적으로 발권되었습니다!`);
    }
  }

  // =========================================================================
  // 7. Event Listeners
  // =========================================================================
  // Keyword chip click
  keywordChipGrid.addEventListener("click", (e) => {
    const btn = e.target.closest(".keyword-chip");
    if (!btn) return;
    toggleKeyword(btn.dataset.keyword);
  });

  // Add custom keyword
  function handleAddCustomKeyword() {
    const val = customKeywordInput.value.replace(/^#+/, "").trim();
    if (!val) return;
    if (selectedKeywords.length >= MAX_KEYWORDS && !selectedKeywords.includes(val)) {
      selectedKeywords.shift();
    }
    if (!selectedKeywords.includes(val)) {
      selectedKeywords.push(val);
      renderKeywordsUI();
      refreshLocalPreviewInstant();
    }
    customKeywordInput.value = "";
  }

  addCustomKeywordBtn.addEventListener("click", handleAddCustomKeyword);
  customKeywordInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCustomKeyword();
    }
  });

  // Random 3 keywords button
  randomKeywordBtn.addEventListener("click", () => {
    const allChips = Array.from(keywordChipGrid.querySelectorAll(".keyword-chip")).map(
      (c) => c.dataset.keyword
    );
    const shuffled = allChips.sort(() => 0.5 - Math.random());
    selectedKeywords = shuffled.slice(0, 3);
    renderKeywordsUI();
    refreshLocalPreviewInstant();
    showToast("🎲 랜덤 미래 키워드 3개와 새로운 시문이 생성되었습니다!");
  });

  // Live update passenger name on input
  passengerNameInput.addEventListener("input", () => {
    const rawName = passengerNameInput.value.trim() || "미래비행사";
    bpPassengerName.textContent = `${rawName} / DREAMER`;
    stubPassengerName.textContent = rawName;
  });

  // Clear passenger name
  clearNameBtn.addEventListener("click", () => {
    passengerNameInput.value = "";
    passengerNameInput.focus();
    bpPassengerName.textContent = "미래비행사 / DREAMER";
    stubPassengerName.textContent = "미래비행사";
  });

  // Cabin class radio selector
  const classOptions = document.querySelectorAll(".class-option");
  classOptions.forEach((opt) => {
    opt.addEventListener("click", () => {
      classOptions.forEach((o) => o.classList.remove("active"));
      opt.classList.add("active");
      const radio = opt.querySelector("input[type='radio']");
      if (radio) {
        radio.checked = true;
        currentCabinClass = radio.value;
        bpCabinClass.textContent = currentCabinClass;
      }
    });
  });

  // Form submit -> Issue Ticket
  boardingForm.addEventListener("submit", (e) => {
    e.preventDefault();
    issueBoardingPass(false);
  });

  // Reset Kiosk for next visitor
  resetKioskBtn.addEventListener("click", () => {
    passengerNameInput.value = "";
    selectedKeywords = [];
    renderKeywordsUI();
    passengerNameInput.focus();
    showToast("다음 관람객을 위해 입력창이 초기화되었습니다.");
  });

  // Print Paper Orientation Select
  printPaperModeSelect.addEventListener("change", updatePrintPageRule);

  // Print Button
  printTicketBtn.addEventListener("click", () => {
    updatePrintPageRule();
    window.print();
  });

  // High-Res PNG Download Button (html2canvas)
  downloadTicketBtn.addEventListener("click", async () => {
    const cardEl = document.getElementById("boardingPassCard");
    if (!window.html2canvas) {
      showToast("이미지 캡처 라이브러리를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    try {
      downloadTicketBtn.disabled = true;
      showToast("📸 고해상도(3×5 규격) 항공권 이미지를 생성하고 있습니다...");

      const canvas = await window.html2canvas(cardEl, {
        scale: 3, // High DPI (approx 2400x1440px for crisp 3x5 photo printing)
        useCORS: true,
        backgroundColor: null
      });

      const link = document.createElement("a");
      const safeName = (passengerNameInput.value.trim() || "미래비행사").replace(/[^\w가-힣]/g, "");
      link.download = `인천공항고_읽걷쓰AI_미래항공권_${safeName}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      showToast("✅ 항공권 이미지가 다운로드되었습니다!");
    } catch (err) {
      console.error("Ticket capture failed:", err);
      showToast("이미지 저장 중 오류가 발생했습니다. 인쇄하기에서 PDF 저장을 이용해주세요.");
    } finally {
      downloadTicketBtn.disabled = false;
    }
  });

  // Modal Open / Close / Save
  openApiModalBtn.addEventListener("click", () => {
    aiProviderSelect.value = aiConfig.provider;
    apiKeyInput.value = aiConfig.apiKey;
    apiModal.classList.remove("hidden");
  });

  closeApiModalBtn.addEventListener("click", () => {
    apiModal.classList.add("hidden");
  });

  apiModal.addEventListener("click", (e) => {
    if (e.target === apiModal) apiModal.classList.add("hidden");
  });

  saveApiModalBtn.addEventListener("click", () => {
    aiConfig.provider = aiProviderSelect.value;
    aiConfig.apiKey = apiKeyInput.value.trim();
    localStorage.setItem("icna_ai_provider", aiConfig.provider);
    localStorage.setItem("icna_ai_key", aiConfig.apiKey);
    updateApiStatusBadge();
    apiModal.classList.add("hidden");
    showToast("🤖 AI 연동 설정이 저장되었습니다.");
  });

  clearApiKeyBtn.addEventListener("click", () => {
    aiConfig.provider = "local";
    aiConfig.apiKey = "";
    aiProviderSelect.value = "local";
    apiKeyInput.value = "";
    localStorage.removeItem("icna_ai_provider");
    localStorage.removeItem("icna_ai_key");
    updateApiStatusBadge();
    showToast("내장 읽걷쓰AI 스마트 엔진 모드로 초기화되었습니다.");
  });

  // =========================================================================
  // 8. Initial Boot
  // =========================================================================
  passengerNameInput.value = "김공항";
  renderKeywordsUI();
  updatePrintPageRule();
  updateApiStatusBadge();
  issueBoardingPass(true);
});
