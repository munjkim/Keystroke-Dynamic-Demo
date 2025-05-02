// js/viz.js
(function() {
  const keyElements = Array.from(document.querySelectorAll('.key'));
  const keyMap = keyElements.reduce((map, el) => {
    map[el.dataset.code] = el;
    return map;
  }, {});

  const textInput = document.getElementById('textInput');
  const showChars = document.getElementById('showChars');

  // 커서 생성
  const cursor = document.createElement('span');
  cursor.id = 'cursor';
  textInput.appendChild(cursor);

  // 체크박스 토글 시 모든 span textContent 조정
  showChars.addEventListener('change', () => {
    Array.from(textInput.children)
      .filter(el => el !== cursor)
      .forEach(span => {
        if (showChars.checked) {
          span.classList.remove('bullet');
          span.textContent = span.dataset.char;
        } else {
          span.classList.add('bullet');
          span.textContent = '';
        }
      });
    textInput.appendChild(cursor);
    cursor.classList.remove('solid');
  });

  let blinkTimeout;
  const IDLE_DELAY = 800;

  function handleKeyEvent(e) {
    if (e.code === 'Tab') e.preventDefault();

    if (e.type === 'keydown') {
      clearTimeout(blinkTimeout);
      cursor.classList.add('solid');

      if (e.key === 'Enter') {
        Array.from(textInput.children)
          .filter(el => el !== cursor)
          .forEach(el => textInput.removeChild(el));
        textInput.appendChild(cursor);
        e.preventDefault();
      }
      else if (e.key === 'Backspace') {
        const items = Array.from(textInput.children).filter(el => el !== cursor);
        if (items.length) {
          textInput.removeChild(items[items.length - 1]);
        }
        textInput.appendChild(cursor);
      }
      else if (e.key.length === 1) {
        const span = document.createElement('span');
        span.dataset.char = e.key;
        if (showChars.checked) {
          span.textContent = e.key;
        } else {
          span.classList.add('bullet');
          span.textContent = '';
        }
        textInput.appendChild(span);
        textInput.appendChild(cursor);
      }

      textInput.scrollTop = textInput.scrollHeight;
      blinkTimeout = setTimeout(() => {
        cursor.classList.remove('solid');
      }, IDLE_DELAY);
    }

    const keyEl = keyMap[e.code];
    if (keyEl) {
      keyEl.classList.toggle('active', e.type === 'keydown');
    }
  }

  window.addEventListener('keydown', handleKeyEvent);
  window.addEventListener('keyup', handleKeyEvent);
  window.addEventListener('blur', () => {
    keyElements.forEach(el => el.classList.remove('active'));
  });
})();