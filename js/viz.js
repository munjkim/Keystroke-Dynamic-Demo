// js/viz.js

// 페이지의 모든 .key 요소를 data-code 기준으로 맵에 저장
const keyElements = Array.from(document.querySelectorAll('.key'));
const keyMap = keyElements.reduce((map, el) => {
  map[el.dataset.code] = el;
  return map;
}, {});

// keydown 이벤트 → 해당 키에 active 클래스 추가
window.addEventListener('keydown', e => {
  if (e.code === 'Tab') {
    e.preventDefault();
  }
  const keyEl = keyMap[e.code];
  if (keyEl) keyEl.classList.add('active');
});

// keyup 이벤트 → active 클래스 제거
window.addEventListener('keyup', e => {
  if (e.code === 'Tab') {
    e.preventDefault();
  }
  const keyEl = keyMap[e.code];
  if (keyEl) keyEl.classList.remove('active');
});

// 브라우저 포커스 이탈(다른 탭 클릭 등) 시 모든 active 제거
window.addEventListener('blur', () => {
  keyElements.forEach(el => el.classList.remove('active'));
});
