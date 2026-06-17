/* ===================== 백엔드 연동 설정 ===================== */
// TODO: 실제 신청 접수 API 경로로 교체
const API_ENDPOINT = '/api/event/consult-apply';
// 백엔드 연동 전 미리보기용. 실제 연동 시 false 로 변경하면 위 API_ENDPOINT 로 전송
const DEMO_MODE = true;

/* ===================== 데이터 ===================== */
// id / goodsNo 는 백엔드 전송용 식별자 (화면 표시는 name)
// data-product 인덱스(0,1,2)와 순서가 일치해야 합니다.
const PRODUCTS = [
  { id: 'on_nest', goodsNo: 1000001353, name: '자이글 온 네스트' },
  { id: 'on_cell375', goodsNo: 1000001428, name: '자이글 온 셀375' },
  { id: 'on_silk', goodsNo: 1000001427, name: '자이글 온 실크' },
];

// 제품별 상세 (PRODUCTS 인덱스와 순서 일치)
// intro: 상세 이미지에서 추출한 핵심 카피 / images: assets/ 하위 상세 이미지(펼칠 때 로드)
const PRODUCT_DETAILS = [
  {
    intro:
      '100만Hz 고주파 에너지를 이용한 심부열로 통증 부위 깊은 곳까지 따뜻하게. ' +
      '식약처 허가를 받은 가정용 고주파 의료기기로, 집에서 편리하게 전문 케어를 받을 수 있습니다.',
    images: [
      'product_000_1.png',
      'product_000_2.png',
      'product_000_3.png',
      'product_000_4.png',
      'product_000_5.png',
    ],
  },
  {
    intro:
      '100만Hz 고주파 에너지가 복부 조직에 침투하면 세포 내 분자들이 진동하며 ' +
      '몸 안에서부터 열이 만들어집니다. 밖에서 데우는 것이 아닌, 안에서 발생하는 심부열이 핵심입니다.',
    images: [
      'product_001_1.png',
      'product_001_2.png',
      'product_001_3.png',
      'product_001_4.png',
      'product_001_5.png',
      'product_001_6.png',
      'product_001_7.png',
      'product_001_8.png',
    ],
  },
  {
    intro:
      '미간·눈가·팔자·목처럼 주름이 생기는 곳에, 피부 표면이 아닌 진피층까지 전달되는 100만Hz가 닿습니다. ' +
      '볼과 턱선의 탄력은 끌어올리고 얇은 목 피부에는 부담 없이 작용해 잔주름과 처짐을 동시에 케어합니다.',
    images: [
      'product_002_1.gif',
      'product_002_2.png',
      'product_002_3.gif',
      'product_002_4.png',
      'product_002_5.png',
      'product_002_6.gif',
      'product_002_7.png',
    ],
  },
];

const TERMS_TEXT = {
  privacy: {
    title: '[필수] 개인정보 수집·이용 동의',
    body:
      '1. 수집 항목: 이름, 성별, 생년월일, 휴대폰 번호, 본인확인정보(CI)\n' +
      '2. 수집·이용 목적: 상담 신청 확인, 상담 진행, 경품 추첨 및 발송\n' +
      '3. 보유·이용 기간: 이벤트 종료 후 6개월(관계 법령에 따라 보관)\n' +
      '4. 동의를 거부할 권리가 있으나, 거부 시 이벤트 참여가 제한됩니다.',
  },
  third: {
    title: '[필수] 개인정보 제3자 제공 동의',
    body:
      '1. 제공받는 자: (주)자이글 위탁 상담 파트너사\n' +
      '2. 제공 항목: 이름, 휴대폰 번호, 신청 제품 정보\n' +
      '3. 제공 목적: 선택 제품에 대한 맞춤 상담 진행\n' +
      '4. 보유·이용 기간: 상담 목적 달성 후 즉시 파기\n' +
      '5. 동의를 거부할 권리가 있으나, 거부 시 상담 진행이 제한됩니다.',
  },
  marketing: {
    title: '[선택] 마케팅 정보 수신 동의',
    body:
      '1. 수신 항목: 신제품 소식, 이벤트·혜택 안내\n' +
      '2. 수신 방법: 문자(SMS/LMS), 카카오 알림톡\n' +
      '3. 보유·이용 기간: 동의 철회 시까지\n' +
      '4. 본 항목은 선택사항이며, 동의하지 않아도 이벤트 참여가 가능합니다.',
  },
};

/* ===================== 상태 ===================== */
let selectedProduct = 0; // 현재 선택(택1)된 제품 index
let authResult = null; // 본인인증 결과 (백엔드 전송용)
const agreed = { 1: false, 2: false, 3: false };

/* ===================== 제품 캐러셀 (택1) ===================== */
function selectProduct(index) {
  index = Math.max(0, Math.min(index, PRODUCTS.length - 1));
  selectedProduct = index;

  // 캐러셀 트랙 슬라이드
  const track = document.getElementById('product-track');
  if (track) track.style.transform = `translateX(${-index * 100}%)`;

  // 패널 active 토글 (가운데 패널 강조)
  document.querySelectorAll('.product-panel').forEach((panel) => {
    panel.classList.toggle('active', Number(panel.dataset.product) === index);
  });

  // 인디케이터(점) 갱신
  document.querySelectorAll('.carousel-dot').forEach((dot) => {
    dot.classList.toggle('active', Number(dot.dataset.product) === index);
  });

  // 선택 제품명 갱신
  const name = PRODUCTS[index].name;
  setText('selected-product-name', name);
  setText('floating-product-name', name);

  // 제품을 바꾸면 열려 있던 상세는 접는다
  if (detailOpenIndex !== -1 && detailOpenIndex !== index) closeDetail();
}

/* ===================== 패널별 상세 (펼치기) ===================== */
let detailOpenIndex = -1; // 상세가 열린 패널 index (-1 = 없음)

function getPanel(index) {
  return document.querySelector(`.product-panel[data-product="${index}"]`);
}

function renderPanelDetail(index) {
  const panel = getPanel(index);
  if (!panel) return;
  const body = panel.querySelector('.pd-body');
  const d = PRODUCT_DETAILS[index];
  if (!body || !d) return;
  const name = PRODUCTS[index].name;
  const intro = d.intro ? `<p class="pd-intro">${d.intro}</p>` : '';
  const imgs = d.images
    .map(
      (src, i) =>
        `<img class="pd-img" src="assets/${src}" alt="${name} 상세 이미지 ${i + 1}" ` +
        `loading="lazy" decoding="async" onerror="this.style.display='none'">`
    )
    .join('');
  body.innerHTML = intro + imgs;
}

function setDetail(index, open) {
  const panel = getPanel(index);
  if (!panel) return;
  const body = panel.querySelector('.pd-body');
  const btn = panel.querySelector('.pd-toggle');
  if (btn) {
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  if (!body) return;
  if (open) {
    renderPanelDetail(index);
    body.hidden = false;
  } else {
    body.hidden = true;
    body.innerHTML = ''; // 접으면 상세 이미지 해제(메모리/네트워크 절약)
  }
}

function closeDetail() {
  if (detailOpenIndex === -1) return;
  setDetail(detailOpenIndex, false);
  detailOpenIndex = -1;
}

function toggleDetail(index) {
  if (detailOpenIndex === index) {
    closeDetail();
    startAuto(); // 접으면 자동 재생 재개
  } else {
    if (detailOpenIndex !== -1) setDetail(detailOpenIndex, false);
    setDetail(index, true);
    detailOpenIndex = index;
    stopAuto(); // 상세를 보는 동안 자동 전환 멈춤
  }
}

/* ===================== 자동 재생 ===================== */
const AUTO_INTERVAL = 3500; // 자동 전환 간격(ms)
let autoTimer = null;
let autoDir = 1; // 진행 방향 (왕복: 1 → -1 → 1 …)

function autoTick() {
  // 끝에서 되감지 않고 앞뒤로 왕복 → 항상 인접 슬라이드로만 부드럽게 이동
  let next = selectedProduct + autoDir;
  if (next > PRODUCTS.length - 1) {
    next = PRODUCTS.length - 2;
    autoDir = -1;
  } else if (next < 0) {
    next = 1;
    autoDir = 1;
  }
  selectProduct(next);
}

function startAuto() {
  if (detailOpenIndex !== -1 || PRODUCTS.length < 2) return; // 상세가 열려 있으면 재생 안 함
  stopAuto();
  autoTimer = setInterval(autoTick, AUTO_INTERVAL);
}

function stopAuto() {
  if (autoTimer) {
    clearInterval(autoTimer);
    autoTimer = null;
  }
}

/* 스와이프 / 드래그로 패널 넘기기 (터치·마우스 공용: Pointer Events) + 자동 재생 */
function initProductCarousel() {
  const viewport = document.querySelector('.product-panels');
  const track = document.getElementById('product-track');
  if (!viewport || !track) return;

  let dragging = false; // 가로 드래그 확정 여부
  let decided = false; // 방향(가로/세로) 판정 완료
  let startX = 0;
  let startY = 0;
  let deltaX = 0;
  let width = 0;
  let pid = null;

  function onDown(e) {
    if (detailOpenIndex !== -1) return; // 상세를 펼친 동안엔 스와이프 잠금(세로 스크롤 우선)
    decided = false;
    dragging = false;
    pid = e.pointerId;
    startX = e.clientX;
    startY = e.clientY;
    deltaX = 0;
    width = viewport.clientWidth;
  }

  function onMove(e) {
    if (pid === null || e.pointerId !== pid) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    if (!decided) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return; // 아직 살짝 눌린 상태(탭일 수 있음)
      decided = true;
      if (Math.abs(dx) <= Math.abs(dy)) {
        pid = null; // 세로 제스처 → 캐러셀은 무시하고 페이지 스크롤
        return;
      }
      // 가로 제스처 확정 → 드래그 시작
      dragging = true;
      track.classList.add('dragging');
      try {
        track.setPointerCapture(pid);
      } catch (_) {}
      stopAuto();
    }

    if (!dragging) return;
    deltaX = dx;
    track.style.transform = `translateX(${-selectedProduct * width + deltaX}px)`;
  }

  function onUp() {
    pid = null;
    decided = false;
    if (!dragging) return; // 탭 → 클릭(토글 등)에 맡김
    dragging = false;
    track.classList.remove('dragging');

    const threshold = Math.max(40, width * 0.15);
    let next = selectedProduct;
    if (deltaX <= -threshold) next += 1;
    else if (deltaX >= threshold) next -= 1;

    selectProduct(next); // % 단위 transform + 트랜지션으로 부드럽게 스냅
    startAuto(); // 손을 떼면 자동 재생 재개
  }

  track.addEventListener('pointerdown', onDown);
  track.addEventListener('pointermove', onMove);
  track.addEventListener('pointerup', onUp);
  track.addEventListener('pointercancel', onUp);

  // 마우스 호버 시 일시정지 (데스크톱)
  viewport.addEventListener('mouseenter', stopAuto);
  viewport.addEventListener('mouseleave', startAuto);

  // 인디케이터 클릭 시 타이머 리셋
  const dots = document.getElementById('carousel-dots');
  if (dots) dots.addEventListener('click', startAuto);

  // 다른 탭으로 가면 멈추고, 랜딩으로 돌아오면 재개
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAuto();
      return;
    }
    const landing = document.getElementById('page-landing');
    if (landing && landing.classList.contains('active')) startAuto();
  });

  startAuto();
}

/* ===================== 페이지 전환 ===================== */
function showPage(id) {
  document.querySelectorAll('.page').forEach((p) => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
}

function goToForm() {
  stopAuto(); // 랜딩을 떠나면 자동 캐러셀 정지
  // 선택 제품명 + 썸네일을 폼 단계에 반영
  setText('form-product-name', PRODUCTS[selectedProduct].name);
  setProductThumb('form-product-thumb');
  showPage('page-form');
}

/* ===================== 약관 동의 ===================== */
function toggleTerm(n) {
  agreed[n] = !agreed[n];
  document.getElementById('chk-' + n).classList.toggle('checked', agreed[n]);
  syncAllCheck();
  validateTerms();
}

function toggleAll() {
  const allOn = agreed[1] && agreed[2] && agreed[3];
  const next = !allOn;
  [1, 2, 3].forEach((n) => {
    agreed[n] = next;
    document.getElementById('chk-' + n).classList.toggle('checked', next);
  });
  syncAllCheck();
  validateTerms();
}

function syncAllCheck() {
  const allOn = agreed[1] && agreed[2] && agreed[3];
  document.getElementById('chk-all').classList.toggle('checked', allOn);
}

function validateTerms() {
  // 필수 약관(1, 2)만 충족하면 버튼 활성화
  const ok = agreed[1] && agreed[2];
  document.getElementById('agree-btn').disabled = !ok;
  document.getElementById('err-terms').classList.toggle('show', false);
  return ok;
}

/* ===================== 약관 모달 ===================== */
function openModal(key, event) {
  if (event) event.stopPropagation(); // 약관 토글과 충돌 방지
  const t = TERMS_TEXT[key];
  if (!t) return;
  setText('modal-title', t.title);
  document.getElementById('modal-body').textContent = t.body;
  document.getElementById('modal').classList.add('show');
}
function closeModal(event) {
  if (event.target === event.currentTarget) closeModalDirect();
}
function closeModalDirect() {
  document.getElementById('modal').classList.remove('show');
}

/* ===================== 폼 제출 → 본인인증 ===================== */
function submitForm() {
  if (!validateTerms()) {
    document.getElementById('err-terms').classList.add('show');
    return;
  }
  runPassAuth();
}

/* ===================== 본인인증 (시뮬레이션) =====================
   실제 연동 시 이 부분을 PASS/MobileOK SDK 호출로 교체
   인증 성공 콜백에서 fillConfirm(result) 형태로 결과를 채우면 된다. */
function runPassAuth() {
  const loading = document.getElementById('pass-loading');
  loading.classList.add('show');

  setTimeout(() => {
    loading.classList.remove('show');

    // ▼▼ 데모용 더미 인증 결과 ▼▼
    const result = {
      name: '홍길동',
      gender: 'male', // 'male' | 'female'
      birth: '1965-03-21',
      phone: '010-1234-5678',
      ci: 'CI_DUMMY_VALUE',
    };
    fillConfirm(result);
    showPage('page-confirm');
  }, 1500);
}

function fillConfirm(r) {
  authResult = r; // 백엔드 전송용으로 보관

  const product = PRODUCTS[selectedProduct];
  // 선택 제품 요약 (썸네일 + 이름)
  setText('confirm-product-name', product.name);
  setProductThumb('confirm-product-thumb');
  // 선택 제품 식별자를 화면에 함께 운반 (백엔드 전송용)
  setValue('confirm-product-id', product.id);
  setValue('confirm-product-goods-no', product.goodsNo);

  setValue('confirm-name', r.name);
  setValue('confirm-birth', r.birth);
  setValue('confirm-phone', r.phone);
  setValue('confirm-ci', r.ci);

  document.getElementById('confirm-male').classList.toggle('active', r.gender === 'male');
  document.getElementById('confirm-female').classList.toggle('active', r.gender === 'female');
}

/* ===================== 최종 신청 (백엔드 전송) ===================== */
function buildPayload() {
  const product = PRODUCTS[selectedProduct];
  return {
    // ▼ 사용자가 택1한 제품 정보 (가장 중요)
    productId: product.id,
    productGoodsNo: product.goodsNo,
    productName: product.name,
    // ▼ 본인인증 결과
    applicant: authResult
      ? {
          name: authResult.name,
          gender: authResult.gender,
          birth: authResult.birth,
          phone: authResult.phone,
          ci: authResult.ci,
        }
      : null,
    // ▼ 약관 동의 내역
    agreements: {
      privacy: agreed[1], // [필수] 개인정보 수집·이용
      thirdParty: agreed[2], // [필수] 제3자 제공
      marketing: agreed[3], // [선택] 마케팅 수신
    },
    appliedAt: new Date().toISOString(),
  };
}

async function submitConfirm() {
  const btn = document.getElementById('confirm-submit-btn');
  btn.disabled = true;
  btn.textContent = '신청 처리 중...';

  const payload = buildPayload();

  try {
    if (DEMO_MODE) {
      // 미리보기 모드: 실제 전송 없이 페이로드만 콘솔로 확인
      console.log('[신청 페이로드] 백엔드로 전송될 데이터:', payload);
      await new Promise((resolve) => setTimeout(resolve, 800));
    } else {
      const res = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('신청 접수 실패 (' + res.status + ')');
    }

    setText('complete-product-name', PRODUCTS[selectedProduct].name);
    showPage('page-complete');
  } catch (err) {
    console.error(err);
    alert('신청 처리 중 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.');
    btn.disabled = false;
    btn.textContent = '상담 신청하기';
  }
}

/* ===================== 유틸 ===================== */
function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}
function setValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value;
}
// 선택 제품 썸네일(assets/product_00{index}.png) + alt 세팅
function setProductThumb(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.src = `assets/product_00${selectedProduct}.png`;
  el.alt = PRODUCTS[selectedProduct].name;
}

/* 초기화 */
document.addEventListener('DOMContentLoaded', () => {
  selectProduct(0);
  initProductCarousel(); // 스와이프 + 자동 재생 시작
});
