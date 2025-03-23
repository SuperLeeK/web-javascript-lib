const useListener = (element, downloadUrl, didClick) => {
  if(!element) return;
  if(!downloadUrl) return;

  element.addEventListener('click', function(event) {
    event.preventDefault();

    const link = document.createElement('a');
    link.href = downloadUrl; // 다운로드 URL
    link.target = '_blank';  // 새 탭에서 열기
    link.click();
    didClick?.(link);
  });
};

