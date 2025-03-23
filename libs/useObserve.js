async function useObserve(element, callback) {
  if(!element || !callback) return;

  const observer = new MutationObserver(callback);

  observer.observe(element, { childList: true });
}