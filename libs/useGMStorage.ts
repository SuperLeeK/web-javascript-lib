// Tampermonkey GM API 타입 선언
declare function GM_setValue(name: string, value: string): void;
declare function GM_getValue(name: string, defaultValue: string | null): string | null;
declare function GM_deleteValue(name: string): void;

/**
 * Tampermonkey GM API를 사용하는 스토리지 유틸리티
 * @template T - 저장할 값의 타입 (기본값: any)
 * @param {string} key - 스토리지 키
 * @returns {Object} 스토리지 메서드 객체
 * @example
 * // boolean 타입으로 사용
 * const storage = useGMStorage<boolean>('myKey');
 * storage.add('item1', true);
 * storage.check('item1'); // true
 * 
 * // string 타입으로 사용
 * const stringStorage = useGMStorage<string>('myKey');
 * stringStorage.add('item1', 'downloaded');
 * 
 * // 객체 타입으로 사용
 * const objectStorage = useGMStorage<{url: string, date: number}>('myKey');
 * objectStorage.add('item1', {url: 'https://...', date: Date.now()});
 */
const useGMStorage = <T = any>(key: string) => {
  /**
   * 저장 함수: 객체 전체를 저장
   * @param {Record<string, T>} data - 저장할 데이터 객체
   * @example
   * const storage = useGMStorage<boolean>('myKey');
   * storage.save({ item1: true, item2: false });
   */
  const save = (data: Record<string, T>): void => {
    GM_setValue(key, JSON.stringify(data));
  };

  /**
   * 불러오기 함수: 저장된 데이터를 불러옴
   * @returns {Record<string, T>} 저장된 데이터 객체 (없으면 빈 객체)
   * @example
   * const storage = useGMStorage<boolean>('myKey');
   * const data = storage.load(); // { item1: true, item2: false }
   */
  const load = (): Record<string, T> => {
    const data = GM_getValue(key, null);
    return data ? JSON.parse(data) : {};
  };

  /**
   * 항목 추가 함수: key와 값을 이용해 항목 추가
   * @param {string} itemKey - 추가할 항목의 키
   * @param {T} value - 저장할 값
   * @example
   * const storage = useGMStorage<boolean>('myKey');
   * storage.add('item1', true);
   * storage.add('item2', false);
   */
  const add = (itemKey: string, value: T): void => {
    const data = load();
    data[itemKey] = value;
    save(data);
  };

  /**
   * 업데이트 함수: 기존 항목의 값을 업데이트
   * @param {string} itemKey - 업데이트할 항목의 키
   * @param {T} value - 새로운 값
   * @example
   * const storage = useGMStorage<boolean>('myKey');
   * storage.add('item1', false);
   * storage.update('item1', true); // false -> true로 업데이트
   */
  const update = (itemKey: string, value: T): void => {
    const data = load();
    if (data[itemKey] !== undefined) {
      data[itemKey] = value;
      save(data);
    } else {
      console.warn(`Item with key ${itemKey} not found.`);
    }
  };

  /**
   * 항목 삭제 함수: 특정 항목을 삭제
   * @param {string} itemKey - 삭제할 항목의 키
   * @example
   * const storage = useGMStorage<boolean>('myKey');
   * storage.add('item1', true);
   * storage.remove('item1'); // item1 삭제
   */
  const remove = (itemKey: string): void => {
    const data = load();
    if (data[itemKey] !== undefined) {
      delete data[itemKey];
      save(data);
    } else {
      console.warn(`Item with key ${itemKey} not found.`);
    }
  };

  /**
   * 전체 항목 삭제 함수: 스토리지의 모든 데이터를 삭제
   * @example
   * const storage = useGMStorage<boolean>('myKey');
   * storage.add('item1', true);
   * storage.add('item2', false);
   * storage.removeAll(); // 모든 데이터 삭제
   */
  const removeAll = (): void => {
    GM_deleteValue(key);
  };

  /**
   * 존재 여부 확인 함수: 항목이 존재하는지 확인
   * 타입에 따라 다른 방식으로 처리:
   * - boolean: true인지 확인
   * - 그 외: undefined가 아닌지 확인
   * @param {string} itemKey - 확인할 항목의 키
   * @returns {boolean} 항목이 존재하고 유효한 값인지 여부
   * @example
   * const storage = useGMStorage<boolean>('myKey');
   * storage.add('item1', true);
   * storage.check('item1'); // true
   * storage.check('item2'); // false (존재하지 않음)
   * 
   * const stringStorage = useGMStorage<string>('myKey');
   * stringStorage.add('item1', 'downloaded');
   * stringStorage.check('item1'); // true (값이 존재하므로)
   */
  const check = (itemKey: string): boolean => {
    const data = load();
    const value = data[itemKey];
    
    if (value === undefined) {
      return false;
    }
    
    // boolean 타입인 경우 true인지 확인
    if (typeof value === 'boolean') {
      return value === true;
    }
    
    // 그 외 타입은 undefined가 아니면 존재하는 것으로 간주
    return value !== null && value !== undefined;
  };

  /**
   * 값 가져오기 함수: 특정 항목의 값을 반환
   * @param {string} itemKey - 가져올 항목의 키
   * @returns {T | undefined} 항목의 값 (없으면 undefined)
   * @example
   * const storage = useGMStorage<boolean>('myKey');
   * storage.add('item1', true);
   * const value = storage.get('item1'); // true
   * const notFound = storage.get('item2'); // undefined
   */
  const get = (itemKey: string): T | undefined => {
    const data = load();
    return data[itemKey];
  };

  return {
    save,
    load,
    add,
    update,
    remove,
    removeAll,
    check,
    get,
  };
};

