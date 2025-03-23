const useStorage = (key) => {
  // 저장 함수: 객체 전체를 저장
  const save = (data) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // 불러오기 함수
  const load = () => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : {}; // 없으면 빈 객체 반환
  };

  // 항목 추가 함수: key와 boolean 값을 이용해 항목 추가
  const add = (key, downloaded) => {
    const data = load();  // 기존 데이터 불러오기
    data[key] = downloaded;  // key와 다운로드 여부 (boolean) 추가
    save(data);  // 저장
  };

  // 업데이트 함수: 다운로드 여부 업데이트
  const update = (key, downloaded) => {
    const data = load();  // 기존 데이터 불러오기
    if (data[key] !== undefined) {
      data[key] = downloaded; // 다운로드 여부 업데이트
      save(data);  // 저장
    } else {
      console.warn(`Item with key ${key} not found.`);
    }
  };

  // 항목 삭제 함수
  const remove = (key) => {
    const data = load();  // 기존 데이터 불러오기
    if (data[key] !== undefined) {
      delete data[key]; // 항목 삭제
      save(data);  // 저장
    } else {
      console.warn(`Item with key ${key} not found.`);
    }
  };

  // 전체 항목 삭제 함수
  const removeAll = () => {
    localStorage.removeItem(key);  // 해당 key의 모든 항목 삭제
  };

  // 존재 여부 확인 함수: 다운로드 여부 확인
  const check = (key) => {
    const data = load();
    return data[key] === true; // 다운로드 여부가 true이면 다운로드 완료
  };

  // 반환할 메서드들
  return {
    save,
    load,
    add,       // key와 boolean으로 항목 추가
    update,    // 다운로드 여부 업데이트
    remove,    // 항목 삭제
    removeAll, // 전체 항목 삭제
    check      // 다운로드 여부 확인
  };
};