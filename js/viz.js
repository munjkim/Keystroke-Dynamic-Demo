// 키 요소들을 event.code 기준으로 매핑
const keyElements = Array.from(document.querySelectorAll('.key'));
const keyMap = keyElements.reduce((map, el) => {
  map[el.dataset.code] = el;
  return map;
}, {});

// keydown → active 클래스 추가
window.addEventListener('keydown', e => {
  const key = keyMap[e.code];
  if (key) {
    key.classList.add('active');
  }
});

// keyup → active 클래스 제거
window.addEventListener('keyup', e => {
  const key = keyMap[e.code];
  if (key) {
    key.classList.remove('active');
  }
});

// 브라우저 포커스 이탈 시(예: 탭 전환) 모든 active 해제
window.addEventListener('blur', () => {
  keyElements.forEach(el => el.classList.remove('active'));
});