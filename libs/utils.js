
const cssToObject = (css) => {
  const cssObj = {};
  
  // 각 속성 및 값에 대해 분리
  const properties = css.split(';').filter(Boolean); // 세미콜론으로 구분하고 빈 값 필터링
  
  properties.forEach(property => {
    const [key, value] = property.split(':').map(item => item.trim());
    cssObj[key] = parseFloat(value.replace('px', ''));
  });

  return cssObj;
};


