// js/viz.js
(function() {
  // 1) 키보드 시각화용 매핑
  const keyElements = Array.from(document.querySelectorAll('.key'));
  const keyMap = keyElements.reduce((map, el) => {
    map[el.dataset.code] = el;
    return map;
  }, {});

  // 2) 주요 DOM 요소 참조
  const textInput         = document.getElementById('textInput');
  const showChars         = document.getElementById('showChars');
  const keystrokeBody     = document.querySelector('#keystrokeTable tbody');
  const keystrokeWrapper  = document.querySelector('.keystroke-table-wrapper');

  // 3) 커서 생성 및 초기 배치
  const cursor = document.createElement('span');
  cursor.id = 'cursor';
  textInput.appendChild(cursor);

  // 4) Chart.js + Streaming 플러그인 초기화
  Chart.register(ChartDataLabels, ChartStreaming);

  const ctx = document.getElementById('keystrokeChart').getContext('2d');
  const keystrokeChart = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [{
        label: 'State',
        data: [],            // 여기에 push 해주면 onRefresh 없이 바로 반영
        borderColor: 'royalblue',
        backgroundColor: 'royalblue',
        pointRadius: 5,
        stepped: true,
        datalabels: {
          align: 'top',
          formatter: function(_, context) {
            return context.dataset.data[context.dataIndex].key;
          }
        }
      }]
    },
    options: {
      animation: false,
      plugins: {
        legend: { display: false },
        datalabels: { color: 'black', font: { size: 10 } }
      },
      scales: {
        x: {
          type: 'realtime',       // ← 실시간 Streaming 모드
          realtime: {
            duration: 2000,       // 2초 윈도우
            refresh: 100,         // 100ms마다 플러그인이 자동 갱신
            delay: 0,             // 딜레이 없음
            pause: false,         // 차트 일시정지 여부
            ttl: undefined,       // 데이터 TTL (optional)
            onRefresh: chart => {
              // onRefresh 내부에서 데이터를 추가할 수도 있지만,
              // 우리는 logKeystroke() 호출 시 직접 data.push() 했으므로
              // 여기서는 별도 로직이 필요 없습니다.
            }
          },
          title: { display: true, text: 'Time (ms)' }
        },
        y: {
          min: -0.1,
          max: 1.1,
          ticks: { stepSize: 1 },
          title: { display: true, text: 'State' }
        }
      }
    }
  });
  // 5) Keystroke 테이블 & 차트 동시 로깅 함수
  function logKeystroke(key, keyCode, code, isDown) {
    const tr = document.createElement('tr');
    const unixtime = Date.now(); // ms 단위
    tr.innerHTML = `
      <td>${unixtime}</td>
      <td>${key}</td>
      <td>${keyCode}</td>
      <td>${code}</td>
      <td>${isDown ? 'Down' : 'Up'}</td>
    `;
    keystrokeBody.appendChild(tr);
    keystrokeWrapper.scrollTop = keystrokeWrapper.scrollHeight;

    // 그래프에 포인트 추가
    keystrokeChart.data.datasets[0].data.push({
      x: unixtime,
      y: isDown ? 1 : 0,
      key
    });
    // 2초 이전 데이터는 제거
    const cutoff = Date.now() - 2000;
    keystrokeChart.data.datasets[0].data =
      keystrokeChart.data.datasets[0].data.filter(pt => pt.x >= cutoff);
    // X축 범위 갱신
    keystrokeChart.options.scales.x.min = cutoff;
    keystrokeChart.options.scales.x.max = Date.now();
    // 리렌더링
    keystrokeChart.update();
  }

  // 6) Show Characters 토글 처리
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
    showChars.blur();
  });

  // 7) 커서 깜빡임 제어용
  let blinkTimeout;
  const IDLE_DELAY = 800;

  // 8) 키 이벤트 핸들러
  function handleKeyEvent(e) {
    // 키보드 비주얼 하이라이트
    const keyEl = keyMap[e.code];
    if (keyEl) keyEl.classList.toggle('active', e.type === 'keydown');

    if (e.code === 'Tab') e.preventDefault();

    if (e.type === 'keydown') {
      clearTimeout(blinkTimeout);
      cursor.classList.add('solid');

      // 텍스트 입력 처리
      if (e.key === 'Enter') {
        Array.from(textInput.children)
          .filter(el => el !== cursor)
          .forEach(el => el.remove());
        textInput.appendChild(cursor);
        e.preventDefault();
      } else if (e.key === 'Backspace') {
        const items = Array.from(textInput.children).filter(el => el !== cursor);
        if (items.length) items.pop().remove();
        textInput.appendChild(cursor);
      } else if (e.key.length === 1) {
        const span = document.createElement('span');
        span.dataset.char = e.key;
        if (e.key === ' ') span.classList.add('space');
        if (showChars.checked) {
          span.textContent = (e.key === ' ' ? '\u00A0' : e.key);
        } else {
          span.classList.add('bullet');
          span.textContent = '';
        }
        textInput.appendChild(span);
        textInput.appendChild(cursor);
      }

      textInput.scrollTop = textInput.scrollHeight;
      logKeystroke(e.key, e.keyCode, e.code, true);
      blinkTimeout = setTimeout(() => cursor.classList.remove('solid'), IDLE_DELAY);
    }
    else if (e.type === 'keyup') {
      logKeystroke(e.key, e.keyCode, e.code, false);
    }
  }

  // 9) 이벤트 리스너 등록
  window.addEventListener('keydown', handleKeyEvent);
  window.addEventListener('keyup',   handleKeyEvent);
  window.addEventListener('blur',    () => {
    keyElements.forEach(el => el.classList.remove('active'));
  });
})();