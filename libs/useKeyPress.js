// useKeyPress.js

function useKeyPress(targetKey, callback) {
  // 이벤트 리스너 함수
  function handleKeyPress(event) {
    if (event.key === targetKey.toLowerCase()) {
      callback(event);  // 해당 키가 눌렸을 때 콜백 호출
    }
  }

  // 'keydown' 이벤트 리스너 등록
  document.addEventListener('keydown', handleKeyPress);

  // 반환된 객체에 이벤트 리스너를 제거하는 함수 포함
  return () => {
    document.removeEventListener('keydown', handleKeyPress);
  };
}